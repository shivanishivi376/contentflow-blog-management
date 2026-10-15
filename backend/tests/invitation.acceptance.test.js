/**
 * invitation.acceptance.test.js
 *
 * Pure unit tests for invitation acceptance logic.
 * No database — uses mock objects that mirror the real data shapes.
 * Tests the business rules defined in invitationService.acceptInvitation.
 */
import test from 'node:test';
import assert from 'node:assert/strict';

// ---------------------------------------------------------------------------
// Helpers that mirror the service's internal acceptance logic.
// These are extracted here so we can unit-test the rules without hitting
// Mongoose or spawning a real server.
// ---------------------------------------------------------------------------

const assertInvitationAcceptable = (invitation) => {
  if (!invitation) throw new Error('INVITATION_NOT_FOUND');
  if (invitation.status === 'Revoked') throw new Error('INVITATION_REVOKED');
  if (invitation.status !== 'Pending') throw new Error('INVITATION_NOT_PENDING');
  if (invitation.expiresAt <= new Date()) throw new Error('INVITATION_EXPIRED');
};

const assertEmailMatch = (invitation, userEmail) => {
  // Only enforce for email-specific invitations (invitation.email !== null).
  if (invitation.email !== null) {
    if (String(userEmail).toLowerCase() !== invitation.email) {
      throw new Error('INVITATION_EMAIL_MISMATCH');
    }
  }
};

const buildMembership = (invitation, userId) => ({
  user: userId,
  workflowRole: invitation.assignedRole,
  isOwner: false,   // Hard-coded: invited members are NEVER owners.
  status: 'ACTIVE'
});

// Make a pending invitation with default values, overridable per test.
const makePendingInvitation = (overrides = {}) => ({
  _id: 'inv_001',
  token: 'tok_abc',
  team: { _id: 'team_001', name: 'Editorial Team', isActive: true, members: [] },
  email: 'invited@example.com',
  assignedRole: 'Reviewer',
  status: 'Pending',
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
  ...overrides
});

// ---------------------------------------------------------------------------
// Tests: invitation status validation
// ---------------------------------------------------------------------------

test('acceptance: valid pending invitation passes status check', () => {
  const invitation = makePendingInvitation();
  assert.doesNotThrow(() => assertInvitationAcceptable(invitation));
});

test('acceptance: missing invitation throws INVITATION_NOT_FOUND', () => {
  assert.throws(() => assertInvitationAcceptable(null), { message: 'INVITATION_NOT_FOUND' });
});

test('acceptance: already accepted invitation throws INVITATION_NOT_PENDING', () => {
  const invitation = makePendingInvitation({ status: 'Accepted' });
  assert.throws(() => assertInvitationAcceptable(invitation), { message: 'INVITATION_NOT_PENDING' });
});

test('acceptance: revoked invitation throws INVITATION_REVOKED', () => {
  const invitation = makePendingInvitation({ status: 'Revoked' });
  assert.throws(() => assertInvitationAcceptable(invitation), { message: 'INVITATION_REVOKED' });
});

test('acceptance: expired invitation throws INVITATION_EXPIRED', () => {
  const invitation = makePendingInvitation({
    expiresAt: new Date(Date.now() - 1000) // 1 second in the past
  });
  assert.throws(() => assertInvitationAcceptable(invitation), { message: 'INVITATION_EXPIRED' });
});

// ---------------------------------------------------------------------------
// Tests: email validation
// ---------------------------------------------------------------------------

test('email validation: matching email passes for email-specific invitation', () => {
  const invitation = makePendingInvitation({ email: 'invited@example.com' });
  assert.doesNotThrow(() => assertEmailMatch(invitation, 'invited@example.com'));
});

test('email validation: matching email is case-insensitive', () => {
  const invitation = makePendingInvitation({ email: 'invited@example.com' });
  assert.doesNotThrow(() => assertEmailMatch(invitation, 'INVITED@EXAMPLE.COM'));
});

test('email validation: mismatched email throws INVITATION_EMAIL_MISMATCH', () => {
  const invitation = makePendingInvitation({ email: 'invited@example.com' });
  assert.throws(
    () => assertEmailMatch(invitation, 'other@example.com'),
    { message: 'INVITATION_EMAIL_MISMATCH' }
  );
});

test('email validation: copy-link invitation (null email) allows any user email', () => {
  const invitation = makePendingInvitation({ email: null });
  // Any email must pass for copy-link invitations
  assert.doesNotThrow(() => assertEmailMatch(invitation, 'anyone@anywhere.com'));
  assert.doesNotThrow(() => assertEmailMatch(invitation, 'random@user.org'));
});

// ---------------------------------------------------------------------------
// Tests: membership creation rules
// ---------------------------------------------------------------------------

test('membership: invited member is NEVER an owner', () => {
  const invitation = makePendingInvitation({ assignedRole: 'Reviewer' });
  const membership = buildMembership(invitation, 'user_001');

  assert.equal(membership.isOwner, false, 'isOwner must always be false for invited members');
  assert.equal(membership.workflowRole, 'Reviewer');
  assert.equal(membership.status, 'ACTIVE');
  assert.equal(membership.user, 'user_001');
});

test('membership: role comes from the invitation, not from any other source', () => {
  const reviewerInvitation = makePendingInvitation({ assignedRole: 'Reviewer' });
  const publisherInvitation = makePendingInvitation({ assignedRole: 'Publisher' });

  assert.equal(buildMembership(reviewerInvitation, 'u1').workflowRole, 'Reviewer');
  assert.equal(buildMembership(publisherInvitation, 'u2').workflowRole, 'Publisher');
  // No test for 'Writer' as owner because we only invite for non-owner roles
});

test('membership: copy-link Publisher invitation creates Publisher membership with isOwner=false', () => {
  const invitation = makePendingInvitation({ assignedRole: 'Publisher', email: null });
  const membership = buildMembership(invitation, 'user_002');

  assert.equal(membership.isOwner, false);
  assert.equal(membership.workflowRole, 'Publisher');
});

// ---------------------------------------------------------------------------
// Tests: end-to-end acceptance sequence (pure logic, no DB)
// ---------------------------------------------------------------------------

test('full acceptance sequence: email-specific Reviewer invitation', () => {
  const invitation = makePendingInvitation({ assignedRole: 'Reviewer', email: 'reviewer@example.com' });
  const user = { id: 'user_rev', email: 'reviewer@example.com' };

  assert.doesNotThrow(() => assertInvitationAcceptable(invitation));
  assert.doesNotThrow(() => assertEmailMatch(invitation, user.email));

  const membership = buildMembership(invitation, user.id);
  assert.equal(membership.workflowRole, 'Reviewer');
  assert.equal(membership.isOwner, false);
  assert.equal(membership.status, 'ACTIVE');
});

test('full acceptance sequence: copy-link Publisher invitation', () => {
  const invitation = makePendingInvitation({ assignedRole: 'Publisher', email: null });
  const user = { id: 'user_pub', email: 'anyone@example.com' };

  assert.doesNotThrow(() => assertInvitationAcceptable(invitation));
  assert.doesNotThrow(() => assertEmailMatch(invitation, user.email));

  const membership = buildMembership(invitation, user.id);
  assert.equal(membership.workflowRole, 'Publisher');
  assert.equal(membership.isOwner, false);
});

test('full acceptance sequence: rejects expired copy-link invitation', () => {
  const invitation = makePendingInvitation({
    email: null,
    expiresAt: new Date(Date.now() - 1000)
  });

  assert.throws(() => assertInvitationAcceptable(invitation), { message: 'INVITATION_EXPIRED' });
});
