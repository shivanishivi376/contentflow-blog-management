import Comment from '../models/Comment.js';
import Blog from '../models/Blog.js';
import Team from '../models/Team.js';
import AppError from '../utils/AppError.js';

export const createComment = async (payload, user) => {
  const blog = await Blog.findById(payload.blog);
  if (!blog) {
    throw new AppError('Blog post not found', 404, 'BLOG_NOT_FOUND');
  }

  const userId = String(user.id || user._id);
  const isTeamBlog = blog.accountType === 'TEAM' || Boolean(blog.team);
  const isReply = Boolean(payload.parentComment);
  const isReviewFeedback = Boolean(payload.isReviewFeedback);

  // Top-level reviewer comments on team blogs must only be published by the Reviewer.
  // Other roles can resolve or reply to reviewer comments.
  // General discussion comments can be created by any team member.
  if (isTeamBlog && isReviewFeedback && !isReply) {
    const isAssignedReviewer = blog.reviewer && String(blog.reviewer._id || blog.reviewer) === userId;
    let isReviewerRole =
      user.teamMembership?.workflowRole?.toLowerCase() === 'reviewer' ||
      user.workflowRole?.toLowerCase() === 'reviewer' ||
      user.role?.toLowerCase() === 'reviewer' ||
      user.teamRole?.toLowerCase() === 'reviewer';

    if (!isAssignedReviewer && !isReviewerRole && blog.team) {
      try {
        const teamDoc = await Team.findById(blog.team).lean();
        const member = (teamDoc?.members || []).find(
          (m) => String(m.user) === userId && m.status === 'ACTIVE'
        );
        if (member && member.workflowRole?.toLowerCase() === 'reviewer') {
          isReviewerRole = true;
        }
      } catch {
        // fail silently on team query error
      }
    }

    const isAdmin = Boolean(user.isMainAdmin || user.role === 'ADMIN');

    if (!isAssignedReviewer && !isReviewerRole && !isAdmin) {
      throw new AppError(
        'Only the Reviewer can publish review comments on this blog. Other roles can reply to or resolve comments.',
        403,
        'REVIEWER_ROLE_REQUIRED'
      );
    }
  }

  const comment = await Comment.create({
    blog: payload.blog,
    author: user.id || user._id,
    content: payload.content.trim(),
    parentComment: payload.parentComment || null,
    isReviewFeedback: isReviewFeedback
  });

  return Comment.findById(comment._id).populate('author', 'name username email profileImage');
};

export const listBlogComments = async (blogId, user) => {
  const comments = await Comment.find({ blog: blogId, parentComment: null })
    .sort({ createdAt: -1 })
    .populate('author', 'name username email profileImage')
    .lean();

  const commentIds = comments.map((c) => c._id);
  const replies = await Comment.find({ parentComment: { $in: commentIds } })
    .sort({ createdAt: 1 })
    .populate('author', 'name username email profileImage')
    .lean();

  const repliesMap = new Map();
  for (const reply of replies) {
    const parentId = String(reply.parentComment);
    if (!repliesMap.has(parentId)) {
      repliesMap.set(parentId, []);
    }
    repliesMap.get(parentId).push(reply);
  }

  return comments.map((comment) => ({
    ...comment,
    replies: repliesMap.get(String(comment._id)) || []
  }));
};

export const updateComment = async (commentId, content, user) => {
  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new AppError('Comment not found', 404, 'COMMENT_NOT_FOUND');
  }

  const isAuthor = String(comment.author) === String(user.id || user._id);
  if (!isAuthor) {
    throw new AppError('You are not authorized to edit this comment', 403, 'COMMENT_ACCESS_DENIED');
  }

  comment.content = content.trim();
  await comment.save();

  return Comment.findById(commentId).populate('author', 'name username email profileImage');
};

export const deleteComment = async (commentId, user) => {
  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new AppError('Comment not found', 404, 'COMMENT_NOT_FOUND');
  }

  const isAuthor = String(comment.author) === String(user.id || user._id);
  if (!isAuthor) {
    throw new AppError('You are not authorized to delete this comment', 403, 'COMMENT_ACCESS_DENIED');
  }

  await Comment.deleteMany({ $or: [{ _id: commentId }, { parentComment: commentId }] });
  return { success: true };
};

export const replyToComment = async (commentId, content, user) => {
  const parent = await Comment.findById(commentId);
  if (!parent) {
    throw new AppError('Parent comment not found', 404, 'COMMENT_NOT_FOUND');
  }

  const reply = await Comment.create({
    blog: parent.blog,
    author: user.id || user._id,
    content: content.trim(),
    parentComment: parent._id
  });

  return Comment.findById(reply._id).populate('author', 'name username email profileImage');
};

export const resolveComment = async (commentId, user) => {
  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new AppError('Comment not found', 404, 'COMMENT_NOT_FOUND');
  }

  comment.status = comment.status === 'RESOLVED' ? 'OPEN' : 'RESOLVED';
  if (comment.status === 'RESOLVED') {
    comment.resolvedBy = user.id || user._id;
    comment.resolvedAt = new Date();
  } else {
    comment.resolvedBy = undefined;
    comment.resolvedAt = undefined;
  }

  await comment.save();

  return Comment.findById(commentId)
    .populate('author', 'name username email profileImage')
    .populate('resolvedBy', 'name username');
};
