import AppError from '../utils/AppError.js';
import crypto from 'crypto';
import { createAuthTokens, verifyAuthToken, hashToken, generateRandomToken as generateResetToken } from '../utils/token.js';
import { comparePassword, hashPassword } from '../utils/password.js';
import { getExpiryDateFromDuration } from '../utils/duration.js';
import {
  createUser,
  findUserByEmail,
  findUserByEmailOrUsername,
  findUserByEmailWithPassword,
  findUserById,
  findUserByGoogleId,
  findUserByUsername,
  linkGoogleAccount,
  updateUserPasswordById,
  toSafeUser
} from '../repositories/userRepository.js';
import {
  createRefreshTokenRecord,
  findRefreshTokenByTokenId,
  revokeRefreshTokenByTokenId,
  revokeRefreshTokensForUser
} from '../repositories/refreshTokenRepository.js';
import {
  createPasswordResetTokenRecord,
  findPasswordResetTokenByHash,
  markPasswordResetTokenAsUsed,
  revokePasswordResetTokensForUser
} from '../repositories/passwordResetTokenRepository.js';
import { sendPasswordResetEmail } from '../integrations/smtp/emailService.js';

// Fix: findTeamByMemberId was referenced in login/refreshAuthTokens but not imported.
import { findTeamByMemberId } from '../repositories/teamRepository.js';
// Invitation validation during signup (invitation is NOT accepted here — only validated).
import { findInvitationByToken } from '../repositories/invitationRepository.js';
import { verifyGoogleCredential } from './googleAuthService.js';

export const signup = async (payload) => {
  const normalizedEmail = payload.email.trim().toLowerCase();
  const normalizedUsername = payload.username.trim().toLowerCase();

  const existingUser = await findUserByEmailOrUsername({
    email: normalizedEmail,
    username: normalizedUsername
  });

  if (existingUser) {
    if (existingUser.email === normalizedEmail) {
      throw new AppError('Email already exists', 409, 'EMAIL_ALREADY_EXISTS');
    }

    if (existingUser.username === normalizedUsername) {
      throw new AppError('Username already exists', 409, 'USERNAME_ALREADY_EXISTS');
    }
  }

  // If an invitation token is provided, validate it before creating the account.
  // The invitation is NOT accepted here — acceptance happens after login via POST /invitations/:token/accept.
  // This ensures normal onboarding is bypassed only after the user explicitly accepts the invitation.
  let invitationContext = null;
  if (payload.invitationToken) {
    const invitation = await findInvitationByToken(payload.invitationToken);

    if (!invitation) {
      throw new AppError('Invitation not found or invalid', 404, 'INVITATION_NOT_FOUND');
    }

    if (invitation.status !== 'Pending') {
      throw new AppError('This invitation has already been used', 409, 'INVITATION_NOT_PENDING');
    }

    if (invitation.expiresAt <= new Date()) {
      throw new AppError('This invitation has expired', 410, 'INVITATION_EXPIRED');
    }

    // For email-specific invitations, verify that the signup email matches the invited email.
    // This cannot be bypassed — the comparison happens server-side, not in the frontend.
    if (invitation.email !== null && invitation.email !== normalizedEmail) {
      throw new AppError(
        'The email address you provided does not match this invitation',
        403,
        'INVITATION_EMAIL_MISMATCH'
      );
    }

    invitationContext = {
      teamId: String(invitation.team?._id || invitation.team),
      assignedRole: invitation.assignedRole,
      isEmailSpecific: invitation.email !== null
    };
  }

  const hashedPassword = await hashPassword(payload.password);

  const user = await createUser({
    name: payload.name.trim(),
    username: normalizedUsername,
    email: normalizedEmail,
    password: hashedPassword,
    authProvider: 'LOCAL',
    accountType: 'INDIVIDUAL',
    onboardingCompleted: false
  });

  return {
    user: toSafeUser(user),
    // Return invitation context so the frontend knows to redirect to the invitation page
    // instead of the normal onboarding flow.
    hasInvitation: Boolean(invitationContext),
    invitationToken: invitationContext ? payload.invitationToken : undefined
  };
};

const createTokenPairForUser = async (userId) => {
  const tokenId = crypto.randomUUID();
  const payload = { userId: String(userId), tokenId };
  const { refreshToken, accessToken } = createAuthTokens(payload);
  const tokenHash = hashToken(refreshToken);
  const expiresAt =
    getExpiryDateFromDuration(process.env.JWT_REFRESH_EXPIRES_IN || '7d') ||
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await createRefreshTokenRecord({
    user: userId,
    tokenId,
    tokenHash,
    expiresAt
  });

  return { accessToken, refreshToken, tokenId };
};

const createAuthenticatedSession = async (user) => {
  const tokens = await createTokenPairForUser(user._id);
  let isOwner = false;

  if (user.accountType === 'TEAM') {
    const team = await findTeamByMemberId(user._id);
    const member = team?.members?.find(
      (item) => String(item.user) === String(user._id) && item.status === 'ACTIVE'
    );
    isOwner = Boolean(member?.isOwner);
  }

  return {
    user: toSafeUser(user, { isOwner }),
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken
  };
};

const createGoogleUsername = async (email) => {
  const emailPrefix = email.split('@')[0];
  let base = emailPrefix.toLowerCase().replace(/[^a-z0-9_]/g, '');
  if (base.length < 3) base = `user${base}`;
  base = base.slice(0, 22);

  for (let attempt = 0; attempt < 10; attempt += 1) {
    const username = `${base}${crypto.randomBytes(3).toString('hex')}`.slice(0, 30);
    if (!(await findUserByUsername(username))) return username;
  }

  throw new AppError('Unable to create a unique username for this Google account.', 503, 'GOOGLE_USERNAME_UNAVAILABLE');
};

export const googleAuth = async (credential) => {
  const identity = await verifyGoogleCredential(credential);
  try {
    let user = await findUserByGoogleId(identity.googleId);

    if (!user) {
      const existingEmailUser = await findUserByEmail(identity.email);
      if (existingEmailUser) {
        if (!existingEmailUser.isActive) {
          throw new AppError('Your account is inactive. Please contact support.', 403, 'ACCOUNT_INACTIVE');
        }
        if (
          existingEmailUser.googleId &&
          existingEmailUser.googleId !== identity.googleId
        ) {
          throw new AppError(
            'This email is already linked to another Google account.',
            409,
            'GOOGLE_ACCOUNT_CONFLICT'
          );
        }

        user = existingEmailUser.googleId
          ? existingEmailUser
          : await linkGoogleAccount(existingEmailUser._id, identity.googleId);

        if (!user) {
          user = await findUserByGoogleId(identity.googleId);
          if (!user) {
            throw new AppError(
              'This account could not be linked to Google. Please try again.',
              409,
              'GOOGLE_ACCOUNT_LINK_CONFLICT'
            );
          }
        }
      } else {
        const displayName = identity.name.length >= 2
          ? identity.name
          : identity.email.split('@')[0];
        user = await createUser({
          name: displayName.length >= 2 ? displayName.slice(0, 100) : 'Google User',
          username: await createGoogleUsername(identity.email),
          email: identity.email,
          googleId: identity.googleId,
          profileImage: { url: identity.picture, publicId: '' },
          authProvider: 'GOOGLE',
          accountType: 'INDIVIDUAL',
          onboardingCompleted: false
        });
      }
    }

    if (!user.isActive) {
      throw new AppError('Your account is inactive. Please contact support.', 403, 'ACCOUNT_INACTIVE');
    }

    return await createAuthenticatedSession(user);
  } catch (error) {
    if (error instanceof AppError) throw error;

    if (error.code === 11000) {
      const existingGoogleUser = await findUserByGoogleId(identity.googleId);
      if (existingGoogleUser?.isActive) {
        return createAuthenticatedSession(existingGoogleUser);
      }
      throw new AppError('This email is already registered. Sign in with your existing account.', 409, 'GOOGLE_ACCOUNT_CONFLICT');
    }

    throw new AppError(
      'Google sign-in could not be completed. Please try again.',
      500,
      'GOOGLE_AUTH_FAILED'
    );
  }
};

export const login = async (payload) => {
  const email = payload.email.trim().toLowerCase();
  const user = await findUserByEmailWithPassword(email);

  if (!user) {
    throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
  }

  const isPasswordValid = Boolean(user.password) &&
    await comparePassword(payload.password, user.password);

  if (!isPasswordValid) {
    throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
  }

  if (!user.isActive) {
    throw new AppError('Your account is inactive. Please contact support.', 403, 'ACCOUNT_INACTIVE');
  }

  return createAuthenticatedSession(user);
};

export const refreshAuthTokens = async (payload) => {
  const { refreshToken } = payload;
  const decoded = verifyAuthToken(refreshToken, 'refresh');

  if (!decoded?.userId || !decoded?.tokenId) {
    throw new AppError('Invalid refresh token', 401, 'INVALID_REFRESH_TOKEN');
  }

  const storedToken = await findRefreshTokenByTokenId(decoded.tokenId);

  if (!storedToken) {
    throw new AppError('Refresh token not found', 401, 'INVALID_REFRESH_TOKEN');
  }

  if (storedToken.isRevoked) {
    throw new AppError('Refresh token revoked', 401, 'INVALID_REFRESH_TOKEN');
  }

  if (storedToken.expiresAt && new Date(storedToken.expiresAt) < new Date()) {
    throw new AppError('Refresh token expired', 401, 'INVALID_REFRESH_TOKEN');
  }

  const incomingTokenHash = hashToken(refreshToken);

  if (storedToken.tokenHash !== incomingTokenHash) {
    throw new AppError('Refresh token mismatch', 401, 'INVALID_REFRESH_TOKEN');
  }

  const user = await findUserById(decoded.userId);

  if (!user || !user.isActive) {
    throw new AppError('User not found or inactive', 401, 'USER_NOT_AUTHORIZED');
  }

  const newTokens = await createTokenPairForUser(user._id);

  await revokeRefreshTokenByTokenId(decoded.tokenId, newTokens.tokenId);

  let isOwner = false;
  if (user.accountType === 'TEAM') {
    const team = await findTeamByMemberId(user._id);
    const member = team?.members?.find((m) => String(m.user) === String(user._id) && m.status === 'ACTIVE');
    isOwner = Boolean(member?.isOwner);
  }

  return {
    user: toSafeUser(user, { isOwner }),
    accessToken: newTokens.accessToken,
    refreshToken: newTokens.refreshToken
  };
};


export const logout = async (payload) => {
  const { refreshToken } = payload;
  const decoded = verifyAuthToken(refreshToken, 'refresh');

  if (!decoded?.tokenId) {
    throw new AppError('Invalid refresh token', 401, 'INVALID_REFRESH_TOKEN');
  }

  const storedToken = await findRefreshTokenByTokenId(decoded.tokenId);

  if (!storedToken) {
    throw new AppError('Refresh token not found', 401, 'INVALID_REFRESH_TOKEN');
  }

  if (!storedToken.isRevoked) {
    await revokeRefreshTokenByTokenId(decoded.tokenId);
  }

  return {
    message: 'Logout successful'
  };
};

export const forgotPassword = async ({ email }) => {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await findUserByEmailOrUsername({ email: normalizedEmail });

  if (!user) {
    return {
      message: 'If an account exists, password reset instructions have been prepared.'
    };
  }

  const resetToken = generateResetToken();
  const tokenHash = hashToken(resetToken);
  const expiresAt =
    getExpiryDateFromDuration(process.env.PASSWORD_RESET_EXPIRES_IN || '1h') ||
    new Date(Date.now() + 60 * 60 * 1000);

  await revokePasswordResetTokensForUser(user._id);

  await createPasswordResetTokenRecord({
    user: user._id,
    tokenHash,
    expiresAt
  });

  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const resetLink = `${clientUrl}/reset-password?token=${resetToken}`;

  try {
    await sendPasswordResetEmail({
      toEmail: user.email,
      userName: user.name || user.username || 'User',
      resetLink,
      resetToken
    });
  } catch (emailError) {
    console.error('[AuthService] Failed to send password reset email:', emailError?.message || emailError);
  }

  return {
    message: 'If an account exists, password reset instructions have been sent.'
  };
};

export const resetPassword = async ({ resetToken, password }) => {
  const tokenHash = hashToken(resetToken);
  const storedToken = await findPasswordResetTokenByHash(tokenHash);

  if (!storedToken) {
    throw new AppError('Invalid password reset token', 400, 'INVALID_RESET_TOKEN');
  }

  if (storedToken.isUsed) {
    throw new AppError('Password reset token already used', 400, 'INVALID_RESET_TOKEN');
  }

  if (storedToken.expiresAt && new Date(storedToken.expiresAt) < new Date()) {
    throw new AppError('Password reset token expired', 400, 'INVALID_RESET_TOKEN');
  }

  const hashedPassword = await hashPassword(password);

  const updatedUser = await updateUserPasswordById(storedToken.user, hashedPassword);

  if (!updatedUser) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  await markPasswordResetTokenAsUsed(tokenHash);
  await revokeRefreshTokensForUser(updatedUser._id);

  return {
    message: 'Password reset successful'
  };
};
