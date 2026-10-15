import crypto from 'crypto';
import AppError from '../utils/AppError.js';
import { toSafeUser, updateUserOnboardingById } from '../repositories/userRepository.js';
import { findTeamByMemberId } from '../repositories/teamRepository.js';
import {
  acceptInvitationRecord,
  createInvitationRecord,
  findInvitationById,
  findInvitationByToken,
  findPendingInvitationByTeamEmailRole,
  revokeInvitationRecord
} from '../repositories/invitationRepository.js';
import Team from '../models/Team.js';
import { sendInvitationEmail } from '../integrations/smtp/emailService.js';

const INVITATION_TTL_DAYS = 7;

const asStringId = (value) => String(value?._id || value || '');

export const createInvitationExpiry = (fromDate = new Date()) => {
  const expiresAt = new Date(fromDate);
  expiresAt.setDate(expiresAt.getDate() + INVITATION_TTL_DAYS);
  return expiresAt;
};

export const createInvitationToken = () => crypto.randomBytes(32).toString('hex');

export const buildInvitationLink = (frontendUrl, token) => {
  const normalizedUrl = String(frontendUrl || 'http://localhost:5173').replace(/\/+$/, '');
  return `${normalizedUrl}/invitations/${token}`;
};

export const formatInvitation = (invitation, options = {}) => ({
  id: asStringId(invitation),
  team: invitation.team
    ? {
        id: asStringId(invitation.team),
        name: invitation.team.name || ''
      }
    : null,
  // email is null for copy-link invitations (no specific invitee).
  email: invitation.email || null,
  assignedRole: invitation.assignedRole,
  role: invitation.assignedRole,
  status: invitation.status,
  expiresAt: invitation.expiresAt,
  createdAt: invitation.createdAt,
  invitationLink: options.invitationLink || undefined,
  emailStatus: options.emailStatus || undefined
});

const getActiveMember = (team, userId) =>
  (team.members || []).find(
    (member) => asStringId(member.user) === String(userId) && member.status === 'ACTIVE'
  );

const assertTeamOwner = (team, userId) => {
  const member = getActiveMember(team, userId);

  if (!member?.isOwner) {
    throw new AppError('Only the team owner can manage invitations', 403, 'TEAM_OWNER_REQUIRED');
  }
};

const assertRoleAvailable = (team, assignedRole) => {
  const ownerMember = (team.members || []).find(
    (member) => member.status === 'ACTIVE' && member.isOwner
  );

  if (ownerMember && ownerMember.workflowRole === assignedRole) {
    throw new AppError(
      'Cannot invite additional members for the workflow role selected by the team owner',
      409,
      'OWNER_ROLE_NOT_INVITABLE'
    );
  }
};

export const revokeInvitation = async ({ invitationId, ownerId }) => {
  const invitation = await findInvitationById(invitationId);
  if (!invitation) {
    throw new AppError('Invitation not found', 404, 'INVITATION_NOT_FOUND');
  }

  const team = await Team.findById(invitation.team);
  if (!team || !team.isActive) {
    throw new AppError('Team not found', 404, 'TEAM_NOT_FOUND');
  }

  assertTeamOwner(team, ownerId);

  if (invitation.status !== 'Pending') {
    throw new AppError('Only pending invitations can be revoked', 400, 'INVITATION_NOT_PENDING');
  }

  const revoked = await revokeInvitationRecord(invitationId);
  return formatInvitation(revoked);
};


export const createInvitationLink = async ({ teamId, ownerId, email, assignedRole, frontendUrl }) => {
  const team = await Team.findById(teamId).populate('owner', 'name email');

  if (!team || !team.isActive) {
    throw new AppError('Team not found', 404, 'TEAM_NOT_FOUND');
  }

  assertTeamOwner(team, ownerId);
  assertRoleAvailable(team, assignedRole);

  // Normalize email: null/empty means a copy-link invitation (no email restriction).
  const normalizedEmail = email ? email.trim().toLowerCase() : null;

  // Only check for duplicate pending invitations when an email is specified.
  if (normalizedEmail) {
    const existingInvitation = await findPendingInvitationByTeamEmailRole({
      teamId,
      email: normalizedEmail,
      assignedRole
    });

    if (existingInvitation) {
      throw new AppError('Pending invitation already exists for this email and role', 409, 'INVITATION_ALREADY_EXISTS');
    }
  }

  const invitation = await createInvitationRecord({
    token: createInvitationToken(),
    team: teamId,
    email: normalizedEmail,
    assignedRole,
    expiresAt: createInvitationExpiry(),
    createdBy: ownerId
  });

  const link = buildInvitationLink(frontendUrl, invitation.token);

  let emailStatus = null;

  // Send invitation email when a specific email address was provided.
  if (normalizedEmail) {
    emailStatus = await sendInvitationEmail({
      toEmail: normalizedEmail,
      teamName: team.name,
      invitationLink: link,
      roleName: assignedRole,
      inviterName: team.owner?.name || team.owner?.email || 'Team Owner'
    }).catch((err) => {
      console.error('[InvitationService] Failed to send invitation email:', err);
      return { success: false, reason: err.message };
    });
  }

  return formatInvitation(invitation, {
    invitationLink: link,
    emailStatus
  });
};


export const getInvitationByToken = async (token) => {
  const invitation = await findInvitationByToken(token);

  if (!invitation) {
    throw new AppError('Invitation not found', 404, 'INVITATION_NOT_FOUND');
  }

  if (invitation.status === 'Pending' && invitation.expiresAt <= new Date()) {
    invitation.status = 'Expired';
    await invitation.save();
  }

  return formatInvitation(invitation);
};

export const acceptInvitation = async ({ token, user }) => {
  const invitation = await findInvitationByToken(token);

  if (!invitation) {
    throw new AppError('Invitation not found', 404, 'INVITATION_NOT_FOUND');
  }

  if (invitation.status === 'Revoked') {
    throw new AppError('This invitation has been revoked', 410, 'INVITATION_REVOKED');
  }

  if (invitation.status !== 'Pending') {
    throw new AppError('This invitation has already been used', 409, 'INVITATION_NOT_PENDING');
  }

  if (invitation.expiresAt <= new Date()) {
    invitation.status = 'Expired';
    await invitation.save();
    throw new AppError('This invitation has expired. Please ask the team owner for a new invitation.', 410, 'INVITATION_EXPIRED');
  }

  // Email validation: only enforced for email-specific invitations (invitation.email is non-null).
  // Copy-link invitations (invitation.email === null) allow any authenticated user to accept.
  if (invitation.email !== null) {
    if (String(user.email).toLowerCase() !== invitation.email) {
      throw new AppError(
        'This invitation was sent to a different email address. Please log in using the invited account.',
        403,
        'INVITATION_EMAIL_MISMATCH'
      );
    }
  }

  const existingTeam = await findTeamByMemberId(user.id);

  if (existingTeam || user.team) {
    throw new AppError('You already belong to a team', 409, 'USER_ALREADY_IN_TEAM');
  }

  const team = await Team.findById(invitation.team._id);

  if (!team || !team.isActive) {
    throw new AppError('This team is no longer available', 404, 'TEAM_NOT_FOUND');
  }

  assertRoleAvailable(team, invitation.assignedRole);

  // Check for duplicate active membership (safety guard for concurrent requests).
  const alreadyMember = (team.members || []).find(
    (m) => asStringId(m.user) === String(user.id) && m.status === 'ACTIVE'
  );
  if (alreadyMember) {
    throw new AppError('You are already a member of this team', 409, 'USER_ALREADY_IN_TEAM');
  }

  // Create team membership atomically: add member + mark invitation accepted.
  team.members.push({
    user: user.id,
    workflowRole: invitation.assignedRole,
    isOwner: false,   // Invited members are NEVER owners.
    status: 'ACTIVE'
  });
  await team.save();

  // Update user: mark as TEAM account type, set team reference, role, and onboarding complete.
  // Setting onboardingCompleted=true here is what allows the ProtectedRoute to admit the user
  // without redirecting to /onboarding.
  const updatedUser = await updateUserOnboardingById(user.id, {
    accountType: 'TEAM',
    team: team._id,
    workflowRole: invitation.assignedRole,
    onboardingCompleted: true
  });

  // Mark invitation accepted only after membership creation succeeds.
  const acceptedInvitation = await acceptInvitationRecord({
    invitationId: invitation._id,
    acceptedBy: user.id
  });

  return {
    invitation: formatInvitation(acceptedInvitation),
    team,
    user: toSafeUser(updatedUser)
  };
};
