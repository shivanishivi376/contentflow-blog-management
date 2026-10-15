import test from 'node:test';
import assert from 'node:assert/strict';
import AppError from '../src/utils/AppError.js';
import { checkRolePermission } from '../src/services/blogWorkflowService.js';
import { WORKFLOW_ACTIONS } from '../src/constants/workflow.js';
import { TEAM_WORKFLOW_PERMISSIONS, PERMISSION_CODES } from '../src/constants/permissions.js';
import { teamPermissionMiddleware } from '../src/middleware/permissionMiddleware.js';

test('ACL: Writer role isolation in team blog lifecycle', () => {
  const teamBlog = {
    _id: 'blog_team_101',
    accountType: 'TEAM',
    team: 'team_alpha',
    writer: 'writer_1',
    reviewer: 'reviewer_1',
    publisher: 'publisher_1'
  };

  const writerUser = { id: 'writer_1', workflowRole: 'Writer', isOwner: false };
  const reviewerUser = { id: 'reviewer_1', workflowRole: 'Reviewer', isOwner: false };
  const publisherUser = { id: 'publisher_1', workflowRole: 'Publisher', isOwner: false };
  const strangerUser = { id: 'stranger_1', workflowRole: 'Writer', isOwner: false };

  // Writer CAN perform writing & submit actions
  assert.equal(checkRolePermission(teamBlog, WORKFLOW_ACTIONS.START_WRITING, writerUser), true);
  assert.equal(checkRolePermission(teamBlog, WORKFLOW_ACTIONS.RESUME_WRITING, writerUser), true);
  assert.equal(checkRolePermission(teamBlog, WORKFLOW_ACTIONS.SUBMIT_FOR_REVIEW, writerUser), true);

  // Reviewer, Publisher, Stranger CANNOT perform writing actions
  for (const user of [reviewerUser, publisherUser, strangerUser]) {
    assert.throws(
      () => checkRolePermission(teamBlog, WORKFLOW_ACTIONS.START_WRITING, user),
      (err) => err instanceof AppError && err.statusCode === 403 && err.code === 'FORBIDDEN_WORKFLOW_ROLE'
    );
    assert.throws(
      () => checkRolePermission(teamBlog, WORKFLOW_ACTIONS.SUBMIT_FOR_REVIEW, user),
      (err) => err instanceof AppError && err.statusCode === 403 && err.code === 'FORBIDDEN_WORKFLOW_ROLE'
    );
  }
});

test('ACL: Reviewer role isolation in team blog lifecycle', () => {
  const teamBlog = {
    _id: 'blog_team_102',
    accountType: 'TEAM',
    team: 'team_alpha',
    writer: 'writer_1',
    reviewer: 'reviewer_1',
    publisher: 'publisher_1'
  };

  const writerUser = { id: 'writer_1', workflowRole: 'Writer', isOwner: false };
  const reviewerUser = { id: 'reviewer_1', workflowRole: 'Reviewer', isOwner: false };
  const publisherUser = { id: 'publisher_1', workflowRole: 'Publisher', isOwner: false };
  const strangerUser = { id: 'stranger_1', workflowRole: 'Reviewer', isOwner: false };

  // Reviewer CAN approve and reject
  assert.equal(checkRolePermission(teamBlog, WORKFLOW_ACTIONS.APPROVE, reviewerUser), true);
  assert.equal(checkRolePermission(teamBlog, WORKFLOW_ACTIONS.REJECT, reviewerUser), true);

  // Writer, Publisher, Stranger CANNOT approve or reject
  for (const user of [writerUser, publisherUser, strangerUser]) {
    assert.throws(
      () => checkRolePermission(teamBlog, WORKFLOW_ACTIONS.APPROVE, user),
      (err) => err instanceof AppError && err.statusCode === 403 && err.code === 'FORBIDDEN_WORKFLOW_ROLE'
    );
    assert.throws(
      () => checkRolePermission(teamBlog, WORKFLOW_ACTIONS.REJECT, user),
      (err) => err instanceof AppError && err.statusCode === 403 && err.code === 'FORBIDDEN_WORKFLOW_ROLE'
    );
  }
});

test('ACL: Publisher role isolation in team blog lifecycle', () => {
  const teamBlog = {
    _id: 'blog_team_103',
    accountType: 'TEAM',
    team: 'team_alpha',
    writer: 'writer_1',
    reviewer: 'reviewer_1',
    publisher: 'publisher_1'
  };

  const writerUser = { id: 'writer_1', workflowRole: 'Writer', isOwner: false };
  const reviewerUser = { id: 'reviewer_1', workflowRole: 'Reviewer', isOwner: false };
  const publisherUser = { id: 'publisher_1', workflowRole: 'Publisher', isOwner: false };
  const strangerUser = { id: 'stranger_1', workflowRole: 'Publisher', isOwner: false };

  // Publisher CAN perform publish actions
  assert.equal(checkRolePermission(teamBlog, WORKFLOW_ACTIONS.PUBLISH_SUCCESS, publisherUser), true);
  assert.equal(checkRolePermission(teamBlog, WORKFLOW_ACTIONS.PUBLISH_FAIL, publisherUser), true);
  assert.equal(checkRolePermission(teamBlog, WORKFLOW_ACTIONS.RETRY, publisherUser), true);

  // Writer, Reviewer, Stranger CANNOT publish
  for (const user of [writerUser, reviewerUser, strangerUser]) {
    assert.throws(
      () => checkRolePermission(teamBlog, WORKFLOW_ACTIONS.PUBLISH_SUCCESS, user),
      (err) => err instanceof AppError && err.statusCode === 403 && err.code === 'FORBIDDEN_WORKFLOW_ROLE'
    );
    assert.throws(
      () => checkRolePermission(teamBlog, WORKFLOW_ACTIONS.RETRY, user),
      (err) => err instanceof AppError && err.statusCode === 403 && err.code === 'FORBIDDEN_WORKFLOW_ROLE'
    );
  }
});

test('ACL: Unassigned team blog rejects workflow actions until assigned', () => {
  const unassignedBlog = {
    _id: 'blog_team_104',
    accountType: 'TEAM',
    team: 'team_alpha',
    writer: null,
    reviewer: null,
    publisher: null
  };

  const user = { id: 'writer_1', workflowRole: 'Writer' };
  assert.throws(
    () => checkRolePermission(unassignedBlog, WORKFLOW_ACTIONS.START_WRITING, user),
    (err) => err instanceof AppError && err.statusCode === 400 && err.code === 'TEAM_ROLES_UNASSIGNED'
  );
});

test('ACL: teamPermissionMiddleware rejects unauthorized endpoints with 403', async () => {
  const middleware = teamPermissionMiddleware(PERMISSION_CODES.BLOG_PUBLISH);

  // Writer tries to hit publisher-only route
  const reqWriter = {
    user: { id: 'writer_1', accountType: 'TEAM' },
    teamMembership: { workflowRole: 'Writer', isOwner: false }
  };
  let errorCaught = null;
  await middleware(reqWriter, {}, (err) => { errorCaught = err; });
  assert(errorCaught instanceof AppError);
  assert.equal(errorCaught.statusCode, 403);

  // Publisher hits publisher-only route -> passes
  const reqPublisher = {
    user: { id: 'publisher_1', accountType: 'TEAM' },
    teamMembership: { workflowRole: 'Publisher', isOwner: false }
  };
  let publisherPassed = false;
  await middleware(reqPublisher, {}, (err) => {
    if (!err) publisherPassed = true;
  });
  assert.equal(publisherPassed, true);
});
