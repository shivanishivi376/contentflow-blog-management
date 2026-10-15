import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { formatInvitation } from '../src/services/invitationService.js';
import { addBlogComment } from '../src/services/blogService.js';
import { createComment, replyToComment, resolveComment } from '../src/services/commentService.js';
import Blog from '../src/models/Blog.js';
import Team from '../src/models/Team.js';
import Comment from '../src/models/Comment.js';

test('formatInvitation exposes both assignedRole and role', () => {
  const dummyInvitation = {
    _id: new mongoose.Types.ObjectId(),
    team: { _id: new mongoose.Types.ObjectId(), name: 'Alpha Team' },
    email: 'member@test.com',
    assignedRole: 'Reviewer',
    status: 'PENDING',
    expiresAt: new Date(),
    createdAt: new Date()
  };

  const formatted = formatInvitation(dummyInvitation);
  assert.equal(formatted.assignedRole, 'Reviewer');
  assert.equal(formatted.role, 'Reviewer');
});

test('Reviewer comment publishing permissions on team blogs', async (t) => {
  const teamId = new mongoose.Types.ObjectId();
  const writerId = new mongoose.Types.ObjectId().toString();
  const reviewerId = new mongoose.Types.ObjectId().toString();
  const publisherId = new mongoose.Types.ObjectId().toString();

  const dummyTeamBlog = {
    _id: new mongoose.Types.ObjectId(),
    title: 'Team Blog Post',
    accountType: 'TEAM',
    team: teamId,
    writer: writerId,
    reviewer: reviewerId,
    publisher: publisherId,
    author: writerId,
    status: 'IN_REVIEW'
  };

  // Mock Blog.findById and findBlogById
  const origFindById = Blog.findById;
  Blog.findById = async () => dummyTeamBlog;

  const origTeamFindById = Team.findById;
  Team.findById = () => ({
    lean: async () => ({ members: [] })
  });

  // Mock Comment.create and Comment.findById
  const origCreate = Comment.create;
  const origFindByIdComment = Comment.findById;

  Comment.create = async (payload) => ({
    _id: new mongoose.Types.ObjectId(),
    ...payload
  });
  Comment.findById = (id) => ({
    populate: () => ({
      _id: id,
      content: 'Sample text'
    })
  });

  t.after(() => {
    Blog.findById = origFindById;
    Team.findById = origTeamFindById;
    Comment.create = origCreate;
    Comment.findById = origFindByIdComment;
  });

  const reviewerUser = {
    id: reviewerId,
    workflowRole: 'Reviewer',
    teamMembership: { workflowRole: 'Reviewer' }
  };

  const writerUser = {
    id: writerId,
    workflowRole: 'Writer',
    teamMembership: { workflowRole: 'Writer' }
  };

  const publisherUser = {
    id: publisherId,
    workflowRole: 'Publisher',
    teamMembership: { workflowRole: 'Publisher' }
  };

  // 1. Reviewer CAN publish top-level reviewer comments
  const reviewerComment = await createComment(
    { blog: dummyTeamBlog._id, content: 'Please polish paragraph 2.', isReviewFeedback: true },
    reviewerUser
  );
  assert.ok(reviewerComment, 'Reviewer should successfully publish top-level review comment');

  // 2. Writer CANNOT publish reviewer comments
  await assert.rejects(
    async () => {
      await createComment(
        { blog: dummyTeamBlog._id, content: 'Writer trying to publish a reviewer comment', isReviewFeedback: true },
        writerUser
      );
    },
    (err) => {
      assert.equal(err.statusCode, 403);
      assert.equal(err.code, 'REVIEWER_ROLE_REQUIRED');
      return true;
    }
  );

  // 3. Publisher CANNOT publish reviewer comments
  await assert.rejects(
    async () => {
      await createComment(
        { blog: dummyTeamBlog._id, content: 'Publisher trying to publish a reviewer comment', isReviewFeedback: true },
        publisherUser
      );
    },
    (err) => {
      assert.equal(err.statusCode, 403);
      assert.equal(err.code, 'REVIEWER_ROLE_REQUIRED');
      return true;
    }
  );

  // 4. Writer CAN publish general team comments (not review feedback)
  const writerGeneralComment = await createComment(
    { blog: dummyTeamBlog._id, content: 'Writer general team note' },
    writerUser
  );
  assert.ok(writerGeneralComment, 'Writer should be able to publish general discussion comments');

  // 5. Publisher CAN publish general team comments (not review feedback)
  const publisherGeneralComment = await createComment(
    { blog: dummyTeamBlog._id, content: 'Publisher general team note' },
    publisherUser
  );
  assert.ok(publisherGeneralComment, 'Publisher should be able to publish general discussion comments');

  // 6. Writer CAN reply to comments
  const replyResult = await createComment(
    {
      blog: dummyTeamBlog._id,
      content: 'Updated paragraph 2 as requested.',
      parentComment: new mongoose.Types.ObjectId()
    },
    writerUser
  );
  assert.ok(replyResult, 'Writer should be able to reply to review comments');
});
