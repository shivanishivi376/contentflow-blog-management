import { OAuth2Client } from 'google-auth-library';
import AppError from '../utils/AppError.js';

const getClientId = () => {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  if (!clientId) {
    throw new AppError('Google sign-in is not configured on the server.', 503, 'GOOGLE_AUTH_NOT_CONFIGURED');
  }
  return clientId;
};

export const verifyGoogleCredential = async (credential) => {
  const clientId = getClientId();
  if (typeof credential !== 'string' || !credential.trim()) {
    throw new AppError('A Google credential is required.', 400, 'GOOGLE_CREDENTIAL_REQUIRED');
  }

  try {
    const client = new OAuth2Client(clientId);
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: clientId
    });
    const payload = ticket.getPayload();

    if (!payload?.sub || !payload.email || payload.email_verified !== true) {
      throw new AppError(
        'Google must provide a verified email address to sign in.',
        401,
        'GOOGLE_EMAIL_NOT_VERIFIED'
      );
    }

    return {
      googleId: payload.sub,
      email: payload.email.trim().toLowerCase(),
      name: String(payload.name || '').trim(),
      picture: typeof payload.picture === 'string' ? payload.picture : ''
    };
  } catch (error) {
    if (error instanceof AppError) throw error;

    const status = error.response?.status;
    const verificationMessage = String(error.message || '');
    if (
      status === 400 ||
      status === 401 ||
      /token|jwt|signature|audience|issuer|expired/i.test(verificationMessage)
    ) {
      throw new AppError('Google credential is invalid or expired.', 401, 'INVALID_GOOGLE_CREDENTIAL');
    }

    if (!status || status >= 500) {
      throw new AppError(
        'Google sign-in could not be verified right now. Please try again.',
        503,
        'GOOGLE_VERIFICATION_UNAVAILABLE'
      );
    }

    throw new AppError('Google sign-in could not be completed.', 502, 'GOOGLE_VERIFICATION_FAILED');
  }
};
