import test from 'node:test';
import assert from 'node:assert/strict';
import { hashPassword, comparePassword } from '../src/utils/password.js';
import AppError from '../src/utils/AppError.js';
import { updateUserPassword } from '../src/services/profileService.js';
import { forgotPassword, resetPassword } from '../src/services/authService.js';
import User from '../src/models/User.js';
import PasswordResetToken from '../src/models/PasswordResetToken.js';
import RefreshToken from '../src/models/RefreshToken.js';
import { hashToken } from '../src/utils/token.js';

test('Password Utils: hashPassword and comparePassword work correctly', async () => {
  const plainPassword = 'SuperSecret123!';
  const hashedPassword = await hashPassword(plainPassword);

  assert.notEqual(plainPassword, hashedPassword);
  assert.equal(typeof hashedPassword, 'string');

  const isMatch = await comparePassword(plainPassword, hashedPassword);
  assert.equal(isMatch, true);

  const isWrongMatch = await comparePassword('WrongPassword123!', hashedPassword);
  assert.equal(isWrongMatch, false);
});

test('Change Password Flow: updateUserPassword validates input and successfully updates password', async () => {
  const originalFindById = User.findById;
  const originalFindByIdAndUpdate = User.findByIdAndUpdate;

  const currentHashed = await hashPassword('OldPassword123!');
  const mockUser = {
    _id: 'user_123',
    password: currentHashed
  };

  let updatedPasswordHash = null;

  User.findById = (id) => ({
    select: (sel) => Promise.resolve(mockUser)
  });

  User.findByIdAndUpdate = (id, update, options) => {
    updatedPasswordHash = update.password;
    return Promise.resolve({ _id: id, password: update.password });
  };

  try {
    // 1. Missing fields should fail
    await assert.rejects(
      () => updateUserPassword('user_123', '', 'NewPassword123!'),
      (err) => err instanceof AppError && err.statusCode === 400 && err.code === 'VALIDATION_ERROR'
    );

    // 2. Short new password (< 8 chars) should fail
    await assert.rejects(
      () => updateUserPassword('user_123', 'OldPassword123!', 'short'),
      (err) => err instanceof AppError && err.statusCode === 400 && err.code === 'VALIDATION_ERROR'
    );

    // 3. Incorrect current password should fail with INVALID_CURRENT_PASSWORD
    await assert.rejects(
      () => updateUserPassword('user_123', 'IncorrectOldPassword!', 'NewPassword123!'),
      (err) => err instanceof AppError && err.statusCode === 400 && err.code === 'INVALID_CURRENT_PASSWORD'
    );

    // 4. Valid current and new password should succeed
    const result = await updateUserPassword('user_123', 'OldPassword123!', 'NewPassword123!');
    assert.deepEqual(result, { success: true });
    assert(updatedPasswordHash !== null);
    assert(await comparePassword('NewPassword123!', updatedPasswordHash));
  } finally {
    User.findById = originalFindById;
    User.findByIdAndUpdate = originalFindByIdAndUpdate;
  }
});

test('Forgot Password Flow: creates reset token record for valid user', async () => {
  const originalFindOne = User.findOne;
  const originalUpdateMany = PasswordResetToken.updateMany;
  const originalCreate = PasswordResetToken.create;

  let tokenRecordCreated = null;

  User.findOne = (query) => {
    const email = query?.$or?.[0]?.email;
    if (email === 'exists@example.com') {
      return Promise.resolve({
        _id: 'user_exists_1',
        email: 'exists@example.com',
        name: 'Existing User'
      });
    }
    return Promise.resolve(null);
  };

  PasswordResetToken.updateMany = () => Promise.resolve({ modifiedCount: 1 });
  PasswordResetToken.create = (record) => {
    tokenRecordCreated = record;
    return Promise.resolve(record);
  };

  try {
    // Unknown email returns safe generic message without error
    const notFoundRes = await forgotPassword({ email: 'unknown@example.com' });
    assert.equal(notFoundRes.message, 'If an account exists, password reset instructions have been prepared.');

    // Known email creates reset token
    const foundRes = await forgotPassword({ email: 'exists@example.com' });
    assert.equal(foundRes.message, 'If an account exists, password reset instructions have been sent.');
    assert(tokenRecordCreated !== null);
    assert.equal(tokenRecordCreated.user, 'user_exists_1');
    assert(tokenRecordCreated.tokenHash);
  } finally {
    User.findOne = originalFindOne;
    PasswordResetToken.updateMany = originalUpdateMany;
    PasswordResetToken.create = originalCreate;
  }
});

test('Reset Password Flow: verifies token, updates user password, and revokes tokens', async () => {
  const originalFindOne = PasswordResetToken.findOne;
  const originalFindOneAndUpdate = PasswordResetToken.findOneAndUpdate;
  const originalFindByIdAndUpdate = User.findByIdAndUpdate;
  const originalRefreshTokenUpdate = RefreshToken.updateMany;

  const validToken = 'raw_reset_token_xyz_123';
  const tokenHash = hashToken(validToken);

  let updatedUserId = null;
  let updatedPasswordHash = null;
  let markedUsed = false;
  let refreshTokensRevoked = false;

  PasswordResetToken.findOne = (query) => {
    if (query?.tokenHash === tokenHash) {
      return Promise.resolve({
        user: 'user_target_1',
        tokenHash,
        isUsed: false,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000)
      });
    }
    return Promise.resolve(null);
  };

  User.findByIdAndUpdate = (userId, update, options) => {
    updatedUserId = userId;
    updatedPasswordHash = update.password;
    return Promise.resolve({ _id: userId, password: update.password });
  };

  PasswordResetToken.findOneAndUpdate = (filter, update) => {
    markedUsed = true;
    return Promise.resolve({});
  };

  RefreshToken.updateMany = (filter, update) => {
    refreshTokensRevoked = true;
    return Promise.resolve({});
  };

  try {
    // 1. Invalid reset token throws 400
    await assert.rejects(
      () => resetPassword({ resetToken: 'invalid_token', password: 'NewSecurePassword123!' }),
      (err) => err instanceof AppError && err.statusCode === 400 && err.code === 'INVALID_RESET_TOKEN'
    );

    // 2. Valid token successfully resets password
    const result = await resetPassword({ resetToken: validToken, password: 'NewSecurePassword123!' });
    assert.equal(result.message, 'Password reset successful');
    assert.equal(updatedUserId, 'user_target_1');
    assert(await comparePassword('NewSecurePassword123!', updatedPasswordHash));
    assert.equal(markedUsed, true);
    assert.equal(refreshTokensRevoked, true);
  } finally {
    PasswordResetToken.findOne = originalFindOne;
    PasswordResetToken.findOneAndUpdate = originalFindOneAndUpdate;
    User.findByIdAndUpdate = originalFindByIdAndUpdate;
    RefreshToken.updateMany = originalRefreshTokenUpdate;
  }
});
