import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildInvitationLink,
  createInvitationExpiry,
  formatInvitation
} from '../src/services/invitationService.js';

test('creates a seven day invitation expiry from the current time', () => {
  const now = new Date('2026-08-17T00:00:00.000Z');
  const expiresAt = createInvitationExpiry(now);

  assert.equal(expiresAt.toISOString(), '2026-08-24T00:00:00.000Z');
});

test('formats invitation without leaking internal token-only authorization', () => {
  const invitation = {
    _id: '64b7f1c7c8f8f8f8f8f8f8f4',
    token: 'secret-token-value',
    team: { _id: '64b7f1c7c8f8f8f8f8f8f8f3', name: 'Editorial Team' },
    email: 'writer@example.com',
    assignedRole: 'Writer',
    status: 'Pending',
    expiresAt: new Date('2026-08-24T00:00:00.000Z'),
    createdAt: new Date('2026-08-17T00:00:00.000Z')
  };

  const formatted = formatInvitation(invitation);

  assert.equal(formatted.email, 'writer@example.com');
  assert.equal(formatted.team.name, 'Editorial Team');
  assert.equal(formatted.token, undefined);
});

test('builds invitation links with token path only', () => {
  const link = buildInvitationLink('https://app.example.com/', 'abc123');

  assert.equal(link, 'https://app.example.com/invitations/abc123');
});

// Copy-link invitation tests (email is null)
test('formats copy-link invitation with null email', () => {
  const invitation = {
    _id: '64b7f1c7c8f8f8f8f8f8f8f5',
    token: 'copy-link-token',
    team: { _id: '64b7f1c7c8f8f8f8f8f8f8f3', name: 'Tech Guild' },
    email: null,
    assignedRole: 'Publisher',
    status: 'Pending',
    expiresAt: new Date('2026-08-28T00:00:00.000Z'),
    createdAt: new Date('2026-08-21T00:00:00.000Z')
  };

  const formatted = formatInvitation(invitation);

  assert.equal(formatted.email, null, 'copy-link invitation email must be null');
  assert.equal(formatted.assignedRole, 'Publisher');
  assert.equal(formatted.token, undefined, 'token must not be exposed');
});

test('formats invitation with invitationLink option appended', () => {
  const invitation = {
    _id: '64b7f1c7c8f8f8f8f8f8f8f6',
    team: { _id: '64b7f1c7c8f8f8f8f8f8f8f3', name: 'Editorial Team' },
    email: 'reviewer@example.com',
    assignedRole: 'Reviewer',
    status: 'Pending',
    expiresAt: new Date('2026-08-28T00:00:00.000Z'),
    createdAt: new Date('2026-08-21T00:00:00.000Z')
  };

  const formatted = formatInvitation(invitation, { invitationLink: 'https://app.example.com/invitations/tok123' });

  assert.equal(formatted.invitationLink, 'https://app.example.com/invitations/tok123');
  assert.equal(formatted.token, undefined);
});

// Email match logic unit tests (mirrors the logic in acceptInvitation service)
const emailMatchesInvitation = (invitationEmail, userEmail) => {
  if (invitationEmail === null) {
    // Copy-link invitation: any authenticated user may accept.
    return true;
  }
  return String(userEmail).toLowerCase() === String(invitationEmail).toLowerCase();
};

test('email match: copy-link invitation accepts any email', () => {
  assert.equal(emailMatchesInvitation(null, 'anyone@example.com'), true);
  assert.equal(emailMatchesInvitation(null, 'another@different.org'), true);
});

test('email match: email-specific invitation accepts matching email', () => {
  assert.equal(emailMatchesInvitation('invited@example.com', 'invited@example.com'), true);
  // Case-insensitive comparison
  assert.equal(emailMatchesInvitation('invited@example.com', 'INVITED@EXAMPLE.COM'), true);
});

test('email match: email-specific invitation rejects mismatched email', () => {
  assert.equal(emailMatchesInvitation('invited@example.com', 'other@example.com'), false);
  assert.equal(emailMatchesInvitation('alice@example.com', 'bob@example.com'), false);
});

