import test from 'node:test';
import assert from 'node:assert/strict';
import { blogAssignmentSchema } from '../src/validators/blog.validator.js';
import { transition, WORKFLOW_ACTIONS } from '../src/constants/workflow.js';
import { BLOG_STATUS } from '../src/constants/blogStatus.js';

test('blogAssignmentSchema accepts 3 distinct valid objectIds', () => {
  const validPayload = {
    writer: '507f1f77bcf86cd799439011',
    reviewer: '507f1f77bcf86cd799439012',
    publisher: '507f1f77bcf86cd799439013'
  };

  const { error, value } = blogAssignmentSchema.validate(validPayload);
  assert.equal(error, undefined);
  assert.equal(value.writer, validPayload.writer);
});

test('blogAssignmentSchema rejects duplicate user in roles', () => {
  const duplicatePayload = {
    writer: '507f1f77bcf86cd799439011',
    reviewer: '507f1f77bcf86cd799439011', // duplicate
    publisher: '507f1f77bcf86cd799439013'
  };

  const { error } = blogAssignmentSchema.validate(duplicatePayload);
  assert.notEqual(error, undefined);
  assert.match(error.message, /distinct/);
});

test('workflow transition table matches lifecycle specifications', () => {
  // DRAFT -> START_WRITING -> IN_WRITING
  assert.equal(transition(BLOG_STATUS.DRAFT, WORKFLOW_ACTIONS.START_WRITING), BLOG_STATUS.IN_WRITING);

  // IN_WRITING -> SUBMIT_FOR_REVIEW -> IN_REVIEW
  assert.equal(transition(BLOG_STATUS.IN_WRITING, WORKFLOW_ACTIONS.SUBMIT_FOR_REVIEW), BLOG_STATUS.IN_REVIEW);

  // IN_REVIEW -> APPROVE -> IN_PUBLISHING
  assert.equal(transition(BLOG_STATUS.IN_REVIEW, WORKFLOW_ACTIONS.APPROVE), BLOG_STATUS.IN_PUBLISHING);

  // IN_REVIEW -> REJECT -> RE_ASSIGN
  assert.equal(transition(BLOG_STATUS.IN_REVIEW, WORKFLOW_ACTIONS.REJECT), BLOG_STATUS.RE_ASSIGN);

  // RE_ASSIGN -> RESUME_WRITING -> IN_WRITING
  assert.equal(transition(BLOG_STATUS.RE_ASSIGN, WORKFLOW_ACTIONS.RESUME_WRITING), BLOG_STATUS.IN_WRITING);

  // IN_PUBLISHING -> PUBLISH_SUCCESS -> PUBLISHED
  assert.equal(transition(BLOG_STATUS.IN_PUBLISHING, WORKFLOW_ACTIONS.PUBLISH_SUCCESS), BLOG_STATUS.PUBLISHED);

  // IN_PUBLISHING -> PUBLISH_FAIL -> PUBLISH_FAILED
  assert.equal(transition(BLOG_STATUS.IN_PUBLISHING, WORKFLOW_ACTIONS.PUBLISH_FAIL), BLOG_STATUS.PUBLISH_FAILED);

  // PUBLISH_FAILED -> RETRY -> IN_PUBLISHING
  assert.equal(transition(BLOG_STATUS.PUBLISH_FAILED, WORKFLOW_ACTIONS.RETRY), BLOG_STATUS.IN_PUBLISHING);
});
