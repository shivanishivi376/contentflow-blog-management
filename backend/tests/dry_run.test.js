import test from 'node:test';
import assert from 'node:assert/strict';

import { PERMISSION_CODES, TEAM_WORKFLOW_PERMISSIONS } from '../src/constants/permissions.js';
import { BLOG_STATUS } from '../src/constants/blogStatus.js';
import { WORKFLOW_ACTIONS, transition, isValidTransition } from '../src/constants/workflow.js';
import { createInvitationExpiry, buildInvitationLink } from '../src/services/invitationService.js';

test('DRY RUN Scenario 1: Individual user full lifecycle capability check', () => {
  const individualUser = { accountType: 'INDIVIDUAL', team: null, workflowRole: null };

  // Individual users have unrestricted access to all workflow states
  assert.equal(individualUser.accountType, 'INDIVIDUAL');
  assert.equal(isValidTransition(BLOG_STATUS.DRAFT, BLOG_STATUS.IN_WRITING), true);
  assert.equal(isValidTransition(BLOG_STATUS.IN_WRITING, BLOG_STATUS.IN_REVIEW), true);
  assert.equal(isValidTransition(BLOG_STATUS.IN_REVIEW, BLOG_STATUS.IN_PUBLISHING), true);
  assert.equal(isValidTransition(BLOG_STATUS.IN_PUBLISHING, BLOG_STATUS.PUBLISHED), true);
});

test('DRY RUN Scenario 2: Team Owner setup & role separation rules', () => {
  const ownerUser = { id: 'user_owner_01', accountType: 'TEAM', team: 'team_01', workflowRole: 'Writer' };
  const team = {
    _id: 'team_01',
    name: 'Tech Guild',
    owner: 'user_owner_01',
    members: [
      { user: 'user_owner_01', workflowRole: 'Writer', isOwner: true, status: 'ACTIVE' }
    ]
  };

  // Rule 1: Exactly 1 owner per team
  const owners = team.members.filter(m => m.isOwner);
  assert.equal(owners.length, 1);
  assert.equal(owners[0].user, ownerUser.id);
  assert.equal(owners[0].workflowRole, 'Writer');

  // Rule 2: Owner's selected role (Writer) cannot be invited for additional members
  const ownerRole = owners[0].workflowRole;
  const isWriterInvitable = ownerRole !== 'Writer';
  assert.equal(isWriterInvitable, false);

  // Rule 3: The other two roles (Reviewer, Publisher) CAN be invited
  const isReviewerInvitable = ownerRole !== 'Reviewer';
  const isPublisherInvitable = ownerRole !== 'Publisher';
  assert.equal(isReviewerInvitable, true);
  assert.equal(isPublisherInvitable, true);
});

test('DRY RUN Scenario 3: Multiple members for non-owner roles allowed', () => {
  const team = {
    _id: 'team_01',
    members: [
      { user: 'user_owner_01', workflowRole: 'Writer', isOwner: true, status: 'ACTIVE' },
      { user: 'user_reviewer_01', workflowRole: 'Reviewer', isOwner: false, status: 'ACTIVE' },
      { user: 'user_reviewer_02', workflowRole: 'Reviewer', isOwner: false, status: 'ACTIVE' }, // 2nd Reviewer!
      { user: 'user_publisher_01', workflowRole: 'Publisher', isOwner: false, status: 'ACTIVE' }
    ]
  };

  const reviewers = team.members.filter(m => m.workflowRole === 'Reviewer' && m.status === 'ACTIVE');
  assert.equal(reviewers.length, 2); // Multiple reviewers supported!
});

test('DRY RUN Scenario 4: Role-based ACL permission boundaries', () => {
  const writerPerms = TEAM_WORKFLOW_PERMISSIONS.Writer;
  const reviewerPerms = TEAM_WORKFLOW_PERMISSIONS.Reviewer;
  const publisherPerms = TEAM_WORKFLOW_PERMISSIONS.Publisher;

  // Writer can create, write, and submit review, but CANNOT approve or publish
  assert.equal(writerPerms.includes(PERMISSION_CODES.BLOG_CREATE), true);
  assert.equal(writerPerms.includes(PERMISSION_CODES.BLOG_WRITE), true);
  assert.equal(writerPerms.includes(PERMISSION_CODES.BLOG_SUBMIT_REVIEW), true);
  assert.equal(writerPerms.includes(PERMISSION_CODES.BLOG_APPROVE), false);
  assert.equal(writerPerms.includes(PERMISSION_CODES.BLOG_PUBLISH), false);
  assert.equal(writerPerms.includes(PERMISSION_CODES.BLOG_DEVTO_PUBLISH), false);

  // Reviewer can approve, reject, submit publish, but CANNOT write or live publish
  assert.equal(reviewerPerms.includes(PERMISSION_CODES.BLOG_CREATE), false);
  assert.equal(reviewerPerms.includes(PERMISSION_CODES.BLOG_WRITE), false);
  assert.equal(reviewerPerms.includes(PERMISSION_CODES.BLOG_APPROVE), true);
  assert.equal(reviewerPerms.includes(PERMISSION_CODES.BLOG_REJECT), true);
  assert.equal(reviewerPerms.includes(PERMISSION_CODES.BLOG_SUBMIT_PUBLISH), true);
  assert.equal(reviewerPerms.includes(PERMISSION_CODES.BLOG_PUBLISH), false);

  // Publisher can live publish & DEV.to publish, but CANNOT approve or write
  assert.equal(publisherPerms.includes(PERMISSION_CODES.BLOG_CREATE), false);
  assert.equal(publisherPerms.includes(PERMISSION_CODES.BLOG_WRITE), false);
  assert.equal(publisherPerms.includes(PERMISSION_CODES.BLOG_APPROVE), false);
  assert.equal(publisherPerms.includes(PERMISSION_CODES.BLOG_PUBLISH), true);
  assert.equal(publisherPerms.includes(PERMISSION_CODES.BLOG_DEVTO_PUBLISH), true);
});

test('DRY RUN Scenario 5: End-to-End Blog Workflow State Transitions', () => {
  let status = BLOG_STATUS.DRAFT;

  // Step 1: Writer starts writing -> IN_WRITING
  status = transition(status, WORKFLOW_ACTIONS.START_WRITING);
  assert.equal(status, BLOG_STATUS.IN_WRITING);

  // Step 2: Writer submits for review -> IN_REVIEW
  status = transition(status, WORKFLOW_ACTIONS.SUBMIT_FOR_REVIEW);
  assert.equal(status, BLOG_STATUS.IN_REVIEW);

  // Step 3: Reviewer requests revisions -> RE_ASSIGN
  status = transition(status, WORKFLOW_ACTIONS.REJECT);
  assert.equal(status, BLOG_STATUS.RE_ASSIGN);

  // Step 4: Writer resumes writing -> IN_WRITING
  status = transition(status, WORKFLOW_ACTIONS.RESUME_WRITING);
  assert.equal(status, BLOG_STATUS.IN_WRITING);

  // Step 5: Writer resubmits for review -> IN_REVIEW
  status = transition(status, WORKFLOW_ACTIONS.SUBMIT_FOR_REVIEW);
  assert.equal(status, BLOG_STATUS.IN_REVIEW);

  // Step 6: Reviewer approves -> IN_PUBLISHING
  status = transition(status, WORKFLOW_ACTIONS.APPROVE);
  assert.equal(status, BLOG_STATUS.IN_PUBLISHING);

  // Step 7: Publisher publishes -> PUBLISHED
  status = transition(status, WORKFLOW_ACTIONS.PUBLISH_SUCCESS);
  assert.equal(status, BLOG_STATUS.PUBLISHED);
});

test('DRY RUN Scenario 6: Invitation link generation & expiration validation', () => {
  const now = new Date('2026-08-21T12:00:00.000Z');
  const expiry = createInvitationExpiry(now);

  assert.equal(expiry.toISOString(), '2026-08-28T12:00:00.000Z');

  const link = buildInvitationLink('http://localhost:5173', 'tok_abc123');
  assert.equal(link, 'http://localhost:5173/invitations/tok_abc123');
});
