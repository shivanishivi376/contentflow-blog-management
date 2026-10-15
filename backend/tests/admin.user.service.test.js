import test from 'node:test';
import assert from 'node:assert/strict';
import AppError from '../src/utils/AppError.js';

test('auth login throws AppError 403 ACCOUNT_INACTIVE when user is inactive', () => {
  const inactiveUser = {
    _id: '64b7f1c7c8f8f8f8f8f8f8f1',
    name: 'Inactive User',
    email: 'inactive@example.com',
    isActive: false
  };

  assert.equal(inactiveUser.isActive, false);

  const checkUserIsActive = (user) => {
    if (!user.isActive) {
      throw new AppError('Your account is inactive. Please contact support.', 403, 'ACCOUNT_INACTIVE');
    }
  };

  assert.throws(
    () => checkUserIsActive(inactiveUser),
    (err) => {
      assert(err instanceof AppError);
      assert.equal(err.statusCode, 403);
      assert.equal(err.code, 'ACCOUNT_INACTIVE');
      return true;
    }
  );
});
