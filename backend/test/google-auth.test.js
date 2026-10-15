import test from 'node:test';
import assert from 'node:assert/strict';
import User from '../src/models/User.js';
import { verifyGoogleCredential } from '../src/services/googleAuthService.js';

test('Google-only users can be created without a password', async () => {
  const user = new User({
    name: 'Google User',
    username: 'googleuser01',
    email: 'google@example.com',
    googleId: 'google-subject-123',
    authProvider: 'GOOGLE',
    accountType: 'INDIVIDUAL'
  });

  await user.validate();
});

test('local users still require a password', async () => {
  const user = new User({
    name: 'Local User',
    username: 'localuser01',
    email: 'local@example.com',
    authProvider: 'LOCAL'
  });

  await assert.rejects(user.validate(), (error) =>
    error.errors.password.message.includes('required')
  );
});

test('Google verification rejects missing backend client configuration', async () => {
  const originalClientId = process.env.GOOGLE_CLIENT_ID;
  delete process.env.GOOGLE_CLIENT_ID;

  try {
    await assert.rejects(
      verifyGoogleCredential('test-credential'),
      (error) => error.code === 'GOOGLE_AUTH_NOT_CONFIGURED'
    );
  } finally {
    if (originalClientId === undefined) {
      delete process.env.GOOGLE_CLIENT_ID;
    } else {
      process.env.GOOGLE_CLIENT_ID = originalClientId;
    }
  }
});

test('Google verification rejects an invalid credential without exposing token details', async () => {
  const originalClientId = process.env.GOOGLE_CLIENT_ID;
  process.env.GOOGLE_CLIENT_ID = 'test-client-id.apps.googleusercontent.com';

  try {
    await assert.rejects(
      verifyGoogleCredential('not.a.valid.google.token'),
      (error) =>
        error.code === 'INVALID_GOOGLE_CREDENTIAL' &&
        error.message === 'Google credential is invalid or expired.'
    );
  } finally {
    if (originalClientId === undefined) {
      delete process.env.GOOGLE_CLIENT_ID;
    } else {
      process.env.GOOGLE_CLIENT_ID = originalClientId;
    }
  }
});
