import test from 'node:test';
import assert from 'node:assert/strict';
import { TEAM_WORKFLOW_PERMISSIONS, PERMISSION_CODES } from '../src/constants/permissions.js';

test('Writer role permissions include writing and submitting for review but not publishing', () => {
  const writerPermissions = TEAM_WORKFLOW_PERMISSIONS.Writer;
  assert.equal(writerPermissions.includes(PERMISSION_CODES.BLOG_CREATE), true);
  assert.equal(writerPermissions.includes(PERMISSION_CODES.BLOG_WRITE), true);
  assert.equal(writerPermissions.includes(PERMISSION_CODES.BLOG_SUBMIT_REVIEW), true);
  assert.equal(writerPermissions.includes(PERMISSION_CODES.BLOG_APPROVE), false);
  assert.equal(writerPermissions.includes(PERMISSION_CODES.BLOG_PUBLISH), false);
  assert.equal(writerPermissions.includes(PERMISSION_CODES.BLOG_DEVTO_PUBLISH), false);
});

test('Reviewer role permissions include approving and rejecting but not creating or publishing', () => {
  const reviewerPermissions = TEAM_WORKFLOW_PERMISSIONS.Reviewer;
  assert.equal(reviewerPermissions.includes(PERMISSION_CODES.BLOG_CREATE), false);
  assert.equal(reviewerPermissions.includes(PERMISSION_CODES.BLOG_WRITE), false);
  assert.equal(reviewerPermissions.includes(PERMISSION_CODES.BLOG_APPROVE), true);
  assert.equal(reviewerPermissions.includes(PERMISSION_CODES.BLOG_REJECT), true);
  assert.equal(reviewerPermissions.includes(PERMISSION_CODES.BLOG_SUBMIT_PUBLISH), true);
  assert.equal(reviewerPermissions.includes(PERMISSION_CODES.BLOG_PUBLISH), false);
});

test('Publisher role permissions include live and Dev.to publishing but not reviewing or writing', () => {
  const publisherPermissions = TEAM_WORKFLOW_PERMISSIONS.Publisher;
  assert.equal(publisherPermissions.includes(PERMISSION_CODES.BLOG_CREATE), false);
  assert.equal(publisherPermissions.includes(PERMISSION_CODES.BLOG_WRITE), false);
  assert.equal(publisherPermissions.includes(PERMISSION_CODES.BLOG_APPROVE), false);
  assert.equal(publisherPermissions.includes(PERMISSION_CODES.BLOG_REJECT), false);
  assert.equal(publisherPermissions.includes(PERMISSION_CODES.BLOG_PUBLISH), true);
  assert.equal(publisherPermissions.includes(PERMISSION_CODES.BLOG_DEVTO_PUBLISH), true);
});
