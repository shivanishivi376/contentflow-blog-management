import PasswordResetToken from '../models/PasswordResetToken.js';

export const createPasswordResetTokenRecord = async (payload) =>
  PasswordResetToken.create(payload);

export const findPasswordResetTokenByHash = async (tokenHash) =>
  PasswordResetToken.findOne({ tokenHash });

export const markPasswordResetTokenAsUsed = async (tokenHash) =>
  PasswordResetToken.findOneAndUpdate(
    { tokenHash },
    {
      isUsed: true,
      usedAt: new Date()
    },
    { returnDocument: 'after' }
  );

export const revokePasswordResetTokensForUser = async (userId) =>
  PasswordResetToken.updateMany(
    { user: userId, isUsed: false },
    {
      isUsed: true,
      usedAt: new Date()
    }
  );
