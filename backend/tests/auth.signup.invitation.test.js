/**
 * auth.signup.invitation.test.js
 *
 * Unit tests for the extended signupSchema validator.
 * Confirms that invitationToken is treated as an optional string
 * and does not break normal (non-invitation) signup requests.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import Joi from 'joi';

// Replicate the extended signupSchema here to test it in isolation.
const signupSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  username: Joi.string().trim().min(3).max(30).required(),
  email: Joi.string().trim().email().required(),
  password: Joi.string().min(8).max(128).required(),
  invitationToken: Joi.string().trim().optional()
});

const validate = (payload) => signupSchema.validate(payload, { abortEarly: false });

// ---------------------------------------------------------------------------
// Normal signup (no invitation token)
// ---------------------------------------------------------------------------

test('signupSchema: valid normal signup passes without invitationToken', () => {
  const { error } = validate({
    name: 'Jane Doe',
    username: 'janedoe',
    email: 'jane@example.com',
    password: 'securepassword123'
  });
  assert.equal(error, undefined);
});

test('signupSchema: normal signup still requires all four base fields', () => {
  const { error } = validate({ name: 'Jane' });
  assert.ok(error, 'should fail when required fields are missing');
  const missingFields = error.details.map((d) => d.context.key);
  assert.ok(missingFields.includes('username'));
  assert.ok(missingFields.includes('email'));
  assert.ok(missingFields.includes('password'));
});

// ---------------------------------------------------------------------------
// Invitation signup (with invitationToken)
// ---------------------------------------------------------------------------

test('signupSchema: valid invitation signup with invitationToken passes', () => {
  const { error } = validate({
    name: 'Jane Doe',
    username: 'janedoe',
    email: 'jane@example.com',
    password: 'securepassword123',
    invitationToken: 'a'.repeat(64) // typical 32-byte hex token = 64 chars
  });
  assert.equal(error, undefined);
});

test('signupSchema: invitationToken is optional — omitting it is valid', () => {
  const { error } = validate({
    name: 'Bob Smith',
    username: 'bobsmith',
    email: 'bob@example.com',
    password: 'anotherpassword'
  });
  assert.equal(error, undefined);
});

test('signupSchema: invitationToken must be a string if provided', () => {
  const { error } = validate({
    name: 'Bob Smith',
    username: 'bobsmith',
    email: 'bob@example.com',
    password: 'anotherpassword',
    invitationToken: 12345 // invalid: must be a string
  });
  assert.ok(error, 'should fail if invitationToken is not a string');
});

// ---------------------------------------------------------------------------
// Security: ensure extra fields like teamId and role are rejected
// ---------------------------------------------------------------------------

test('signupSchema: rejects unknown fields like teamId to prevent injection', () => {
  const { error } = signupSchema.validate(
    {
      name: 'Attacker',
      username: 'attacker',
      email: 'attacker@example.com',
      password: 'hackpassword',
      teamId: 'someTeamId',      // must not be accepted
      role: 'Publisher'           // must not be accepted
    },
    { abortEarly: false, allowUnknown: false }
  );
  assert.ok(error, 'schema must reject unknown fields like teamId and role');
});
