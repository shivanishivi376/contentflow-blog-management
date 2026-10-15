import test from 'node:test';
import assert from 'node:assert/strict';
import joiValidator from '../src/utils/joiValidator.js';
import { onboardingCompleteSchema } from '../src/validators/onboarding.validator.js';

test('accepts individual onboarding with multiple interests', () => {
  const { error, value } = joiValidator(onboardingCompleteSchema, {
    accountType: 'INDIVIDUAL',
    interests: ['507f1f77bcf86cd799439011', '507f191e810c19729de860ea']
  });

  assert.equal(error, undefined);
  assert.equal(value.accountType, 'INDIVIDUAL');
  assert.deepEqual(value.interests, ['507f1f77bcf86cd799439011', '507f191e810c19729de860ea']);
});

test('requires team name and workflow role for team onboarding', () => {
  const { error } = joiValidator(onboardingCompleteSchema, {
    accountType: 'TEAM',
    interests: ['507f1f77bcf86cd799439011']
  });

  assert.ok(error);
  assert.match(error.details.map((detail) => detail.message).join(' '), /teamName|workflowRole/);
});
