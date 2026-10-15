import test from 'node:test';
import assert from 'node:assert/strict';
import { BLOG_STATUS } from '../src/constants/blogStatus.js';
import { isValidTransition, transition, WORKFLOW_ACTIONS } from '../src/constants/workflow.js';

test('workflow state machine validates legal progression by action', () => {
  assert.equal(transition(BLOG_STATUS.DRAFT, WORKFLOW_ACTIONS.START_WRITING), BLOG_STATUS.IN_WRITING);
  assert.equal(transition(BLOG_STATUS.IN_WRITING, WORKFLOW_ACTIONS.SUBMIT_FOR_REVIEW), BLOG_STATUS.IN_REVIEW);
  assert.equal(transition(BLOG_STATUS.IN_REVIEW, WORKFLOW_ACTIONS.APPROVE), BLOG_STATUS.IN_PUBLISHING);
  assert.equal(transition(BLOG_STATUS.IN_REVIEW, WORKFLOW_ACTIONS.REJECT), BLOG_STATUS.RE_ASSIGN);
  assert.equal(transition(BLOG_STATUS.RE_ASSIGN, WORKFLOW_ACTIONS.RESUME_WRITING), BLOG_STATUS.IN_WRITING);
  assert.equal(transition(BLOG_STATUS.IN_PUBLISHING, WORKFLOW_ACTIONS.PUBLISH_SUCCESS), BLOG_STATUS.PUBLISHED);
  assert.equal(transition(BLOG_STATUS.IN_PUBLISHING, WORKFLOW_ACTIONS.PUBLISH_FAIL), BLOG_STATUS.PUBLISH_FAILED);
  assert.equal(transition(BLOG_STATUS.PUBLISH_FAILED, WORKFLOW_ACTIONS.RETRY), BLOG_STATUS.IN_PUBLISHING);
});

test('workflow state machine rejects invalid actions', () => {
  assert.throws(() => transition(BLOG_STATUS.DRAFT, WORKFLOW_ACTIONS.APPROVE), /Invalid transition/);
  assert.throws(() => transition(BLOG_STATUS.DRAFT, WORKFLOW_ACTIONS.PUBLISH_SUCCESS), /Invalid transition/);
  assert.throws(() => transition(BLOG_STATUS.PUBLISHED, WORKFLOW_ACTIONS.REJECT), /Invalid transition/);
});

test('workflow state machine validates legal progression for legacy transition', () => {
  assert.equal(isValidTransition(BLOG_STATUS.DRAFT, BLOG_STATUS.IN_WRITING), true);
  assert.equal(isValidTransition(BLOG_STATUS.IN_WRITING, BLOG_STATUS.IN_REVIEW), true);
  assert.equal(isValidTransition(BLOG_STATUS.IN_REVIEW, BLOG_STATUS.IN_PUBLISHING), true);
  assert.equal(isValidTransition(BLOG_STATUS.IN_PUBLISHING, BLOG_STATUS.PUBLISHED), true);
});

test('workflow state machine rejects illegal shortcut transitions', () => {
  assert.equal(isValidTransition(BLOG_STATUS.DRAFT, BLOG_STATUS.PUBLISHED), false);
  assert.equal(isValidTransition(BLOG_STATUS.DRAFT, BLOG_STATUS.IN_PUBLISHING), false);
  assert.equal(isValidTransition(BLOG_STATUS.RE_ASSIGN, BLOG_STATUS.PUBLISHED), false);
});

