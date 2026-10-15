import RefreshToken from '../models/RefreshToken.js';

export const createRefreshTokenRecord = async (payload) => RefreshToken.create(payload);

export const findRefreshTokenByTokenId = async (tokenId) =>
  RefreshToken.findOne({ tokenId }).select('+tokenHash');

export const revokeRefreshTokenByTokenId = async (tokenId, replacedByTokenId = null) =>
  RefreshToken.findOneAndUpdate(
    { tokenId },
    {
      isRevoked: true,
      revokedAt: new Date(),
      replacedByTokenId
    },
    { returnDocument: 'after' }
  );

export const deleteRefreshTokenByTokenId = async (tokenId) =>
  RefreshToken.deleteOne({ tokenId });

export const revokeRefreshTokensForUser = async (userId) =>
  RefreshToken.updateMany(
    { user: userId, isRevoked: false },
    {
      isRevoked: true,
      revokedAt: new Date()
    }
  );
