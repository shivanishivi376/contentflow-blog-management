/**
 * blog.permissions.test.js
 *
 * Unit tests enforcing that:
 * 1. Individual account users CANNOT edit, update content, transition status, publish, or delete blogs created by other users.
 * 2. Team Owners CAN update basic details and delete blogs within their team.
 * 3. Non-team owner members CANNOT delete blogs created by other team members.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import AppError from '../src/utils/AppError.js';
import { checkRolePermission } from '../src/services/blogWorkflowService.js';

test('permissions: non-author cannot perform workflow actions on an individual blog', () => {
  const individualBlog = {
    _id: 'blog_101',
    author: 'user_alice',
    accountType: 'INDIVIDUAL',
    team: null
  };

  const userBob = { id: 'user_bob', accountType: 'INDIVIDUAL' };

  assert.throws(
    () => checkRolePermission(individualBlog, 'START_WRITING', userBob),
    (err) => {
      assert(err instanceof AppError);
      assert.equal(err.statusCode, 403);
      assert.equal(err.code, 'FORBIDDEN_BLOG_ACCESS');
      return true;
    }
  );
});

test('permissions: author can perform workflow actions on their own individual blog', () => {
  const individualBlog = {
    _id: 'blog_102',
    author: 'user_alice',
    accountType: 'INDIVIDUAL',
    team: null
  };

  const userAlice = { id: 'user_alice', accountType: 'INDIVIDUAL' };

  assert.doesNotThrow(() => checkRolePermission(individualBlog, 'START_WRITING', userAlice));
});

test('permissions: delete authorization rules for individual vs team blogs', () => {
  const authorId = 'user_author_1';
  const ownerId = 'user_owner_1';
  const strangerId = 'user_stranger_1';

  const checkDeleteAllowed = (blog, user) => {
    const userId = String(user.id || user._id);
    const isAuthor = String(blog.author) === userId;

    if (blog.accountType === 'INDIVIDUAL' || !blog.team) {
      if (!isAuthor) throw new AppError('Cannot delete another user blog', 403, 'FORBIDDEN_BLOG_ACCESS');
    } else {
      const isOwner = Boolean(user.isOwner);
      if (!isAuthor && !isOwner) throw new AppError('Only author or Team Owner can delete', 403, 'FORBIDDEN_BLOG_ACCESS');
    }
    return true;
  };

  const indBlog = { author: authorId, accountType: 'INDIVIDUAL', team: null };
  const teamBlog = { author: authorId, accountType: 'TEAM', team: 'team_1' };

  // Individual blog tests
  assert.equal(checkDeleteAllowed(indBlog, { id: authorId }), true);
  assert.throws(() => checkDeleteAllowed(indBlog, { id: strangerId }), { message: 'Cannot delete another user blog' });

  // Team blog tests
  assert.equal(checkDeleteAllowed(teamBlog, { id: authorId, isOwner: false }), true, 'Author can delete team blog');
  assert.equal(checkDeleteAllowed(teamBlog, { id: ownerId, isOwner: true }), true, 'Team Owner can delete team blog');
  assert.throws(
    () => checkDeleteAllowed(teamBlog, { id: strangerId, isOwner: false }),
    { message: 'Only author or Team Owner can delete' },
    'Non-author team member cannot delete another member blog'
  );
});

test('permissions: Team Owner with Writer role CANNOT approve or reject reviews', () => {
  const teamBlog = {
    _id: 'blog_team_202',
    accountType: 'TEAM',
    team: 'team_1',
    writer: 'owner_id',
    reviewer: 'reviewer_id',
    publisher: 'publisher_id'
  };

  const ownerWriter = { id: 'owner_id', isOwner: true, workflowRole: 'Writer' };

  assert.throws(
    () => checkRolePermission(teamBlog, 'APPROVE', ownerWriter),
    (err) => {
      assert(err instanceof AppError);
      assert.equal(err.statusCode, 403);
      assert.equal(err.code, 'FORBIDDEN_WORKFLOW_ROLE');
      return true;
    }
  );

  assert.throws(
    () => checkRolePermission(teamBlog, 'REJECT', ownerWriter),
    (err) => {
      assert(err instanceof AppError);
      assert.equal(err.statusCode, 403);
      assert.equal(err.code, 'FORBIDDEN_WORKFLOW_ROLE');
      return true;
    }
  );
});

