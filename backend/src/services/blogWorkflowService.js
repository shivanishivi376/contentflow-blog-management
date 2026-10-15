import AppError from '../utils/AppError.js';
import { BLOG_STATUS } from '../constants/blogStatus.js';
import { isValidTransition, transition, WORKFLOW_ACTIONS } from '../constants/workflow.js';
import { findBlogById, updateBlogRecord } from '../repositories/blogRepository.js';
import { createVersionSnapshot } from './versionService.js';
import Comment from '../models/Comment.js';

const validateBlogForPublication = (blog) => {
  if (!blog.title?.trim() || !blog.content?.trim() || blog.content === '<p></p>') {
    throw new AppError('Cannot publish a blog without a title and content', 400, 'INVALID_PUBLISH_CONTENT');
  }
};

export const checkRolePermission = (blog, action, user) => {
  const userId = String(user.id || user._id);
  const authorId = String(blog.author?._id || blog.author);
  const isAuthor = authorId === userId;

  if (blog.accountType !== 'TEAM' || !blog.team) {
    if (!isAuthor) {
      throw new AppError('You do not have permission to perform actions on a blog post created by another user', 403, 'FORBIDDEN_BLOG_ACCESS');
    }
    return true;
  }

  const writerId = blog.writer ? String(blog.writer?._id || blog.writer) : null;
  const reviewerId = blog.reviewer ? String(blog.reviewer?._id || blog.reviewer) : null;
  const publisherId = blog.publisher ? String(blog.publisher?._id || blog.publisher) : null;

  if (!writerId || !reviewerId || !publisherId) {
    throw new AppError(
      'Cannot proceed: All team roles (Writer, Reviewer, Publisher) must be assigned by the Team Owner first',
      400,
      'TEAM_ROLES_UNASSIGNED'
    );
  }

  const isOwner = Boolean(user.teamMembership?.isOwner || user.isOwner);

  switch (action) {
    case WORKFLOW_ACTIONS.START_WRITING:
    case WORKFLOW_ACTIONS.RESUME_WRITING:
    case WORKFLOW_ACTIONS.SUBMIT_FOR_REVIEW:
      if (writerId !== userId) {
        throw new AppError('Only the assigned Writer can write or submit for review', 403, 'FORBIDDEN_WORKFLOW_ROLE');
      }
      break;
    case WORKFLOW_ACTIONS.APPROVE:
    case WORKFLOW_ACTIONS.REJECT:
      if (reviewerId !== userId) {
        throw new AppError('Only the assigned Reviewer can approve or reject reviews', 403, 'FORBIDDEN_WORKFLOW_ROLE');
      }
      break;
    case WORKFLOW_ACTIONS.PUBLISH_SUCCESS:
    case WORKFLOW_ACTIONS.PUBLISH_FAIL:
    case WORKFLOW_ACTIONS.RETRY:
      if (publisherId !== userId) {
        throw new AppError('Only the assigned Publisher can publish or retry publishing', 403, 'FORBIDDEN_WORKFLOW_ROLE');
      }
      break;
    default:
      break;
  }
  return true;
};




export const transitionBlogAction = async (blogId, action, user, payload = {}) => {
  const blog = await findBlogById(blogId);
  if (!blog) {
    throw new AppError('Blog post not found', 404, 'BLOG_NOT_FOUND');
  }

  checkRolePermission(blog, action, user);

  let targetStatus;
  try {
    targetStatus = transition(blog.status, action);
  } catch (err) {
    throw new AppError(err.message, 400, 'INVALID_WORKFLOW_TRANSITION');
  }

  const userId = user.id || user._id;
  const updateData = { status: targetStatus };

  if (targetStatus === BLOG_STATUS.PUBLISHED) {
    validateBlogForPublication(blog);
    updateData.publishedAt = new Date();
    updateData.publishedBy = userId;
    updateData.publishFailReason = null;
    updateData.publishFailedAt = null;
  } else if (targetStatus === BLOG_STATUS.PUBLISH_FAILED) {
    updateData.publishFailReason = payload.reason || 'Publishing failed';
    updateData.publishFailedAt = new Date();
  }

  if (action === WORKFLOW_ACTIONS.REJECT && payload.reason) {
    await Comment.create({
      blog: blog._id,
      author: userId,
      content: `[Revision Request] ${payload.reason}`,
      isReviewFeedback: true,
      status: 'OPEN'
    });
  }

  const updatedBlog = await updateBlogRecord(blogId, updateData);

  const changeSummary = payload.reason
    ? `Action: ${action} -> Status: ${targetStatus} (${payload.reason})`
    : `Action: ${action} -> Status: ${targetStatus}`;

  await createVersionSnapshot(updatedBlog, userId, changeSummary);

  if (targetStatus === BLOG_STATUS.PUBLISHED) {
    return (await findBlogById(blogId)) || updatedBlog;
  }

  return updatedBlog;
};

export const transitionBlogStatus = async (blogId, targetStatus, user, payload = {}) => {
  const blog = await findBlogById(blogId);
  if (!blog) {
    throw new AppError('Blog post not found', 404, 'BLOG_NOT_FOUND');
  }

  const currentStatus = blog.status;

  if (!isValidTransition(currentStatus, targetStatus)) {
    throw new AppError(
      `Cannot transition status from ${currentStatus} to ${targetStatus}`,
      400,
      'INVALID_WORKFLOW_TRANSITION'
    );
  }

  if (targetStatus === BLOG_STATUS.PUBLISHED) {
    checkRolePermission(blog, WORKFLOW_ACTIONS.PUBLISH_SUCCESS, user);
    validateBlogForPublication(blog);
  }

  const userId = user.id || user._id;
  const updateData = { status: targetStatus };

  if (targetStatus === BLOG_STATUS.PUBLISHED) {
    updateData.publishedAt = new Date();
    updateData.publishedBy = userId;
    updateData.publishFailReason = null;
    updateData.publishFailedAt = null;
  }

  if (payload.assignedUser) {
    if (targetStatus === BLOG_STATUS.IN_WRITING || targetStatus === BLOG_STATUS.RE_ASSIGN) {
      updateData.writer = payload.assignedUser;
    } else if (targetStatus === BLOG_STATUS.IN_REVIEW) {
      updateData.reviewer = payload.assignedUser;
    } else if (targetStatus === BLOG_STATUS.IN_PUBLISHING) {
      updateData.publisher = payload.assignedUser;
    }
  }

  const updatedBlog = await updateBlogRecord(blogId, updateData);

  const changeSummary = payload.reason
    ? `Status transitioned: ${currentStatus} -> ${targetStatus} (${payload.reason})`
    : `Status transitioned: ${currentStatus} -> ${targetStatus}`;

  await createVersionSnapshot(updatedBlog, userId, changeSummary);

  if (targetStatus === BLOG_STATUS.PUBLISHED) {
    return (await findBlogById(blogId)) || updatedBlog;
  }

  return updatedBlog;
};

export const publishBlog = async (blogId, user) => {
  const blog = await findBlogById(blogId);
  if (!blog) {
    throw new AppError('Blog post not found', 404, 'BLOG_NOT_FOUND');
  }

  const userId = String(user.id || user._id);
  const authorId = String(blog.author?._id || blog.author);

  if (blog.accountType !== 'TEAM' || !blog.team) {
    if (userId !== authorId) {
      throw new AppError('You cannot publish a blog created by another user', 403, 'FORBIDDEN_BLOG_ACCESS');
    }
  } else {
    const publisherId = blog.publisher ? String(blog.publisher?._id || blog.publisher) : null;
    const isOwner = Boolean(user.teamMembership?.isOwner || user.isOwner);
    if (userId !== publisherId && userId !== authorId && !isOwner) {
      throw new AppError('Only the assigned publisher, author, or Team Owner can publish this team blog', 403, 'FORBIDDEN_WORKFLOW_ROLE');
    }
  }

  if (blog.status !== BLOG_STATUS.IN_PUBLISHING && blog.status !== BLOG_STATUS.IN_REVIEW) {
    throw new AppError(`Cannot publish blog from current status "${blog.status}". Must be in IN_PUBLISHING or IN_REVIEW.`, 400, 'INVALID_PUBLISH_STATE');
  }

  let updatedBlog;
  try {
    validateBlogForPublication(blog);

    updatedBlog = await updateBlogRecord(blogId, {
      status: BLOG_STATUS.PUBLISHED,
      publishedAt: new Date(),
      publishedBy: userId,
      publishFailReason: null,
      publishFailedAt: null
    });
    await createVersionSnapshot(updatedBlog, userId, 'Article published to live blog');
  } catch (error) {
    // Record publish failure
    const failedBlog = await updateBlogRecord(blogId, {
      status: BLOG_STATUS.PUBLISH_FAILED,
      publishFailReason: error.message || 'Failed to publish blog post',
      publishFailedAt: new Date()
    });

    await createVersionSnapshot(failedBlog, userId, `Publishing failed: ${error.message}`);
    throw new AppError(error.message || 'Publishing failed', 400, 'PUBLISH_FAILED');
  }

  const publishedBlog = await findBlogById(blogId);
  return { blog: publishedBlog || updatedBlog, devTo: { published: false, skipped: true } };
};

export const retryPublishBlog = async (blogId, user) => {
  const blog = await findBlogById(blogId);
  if (!blog) {
    throw new AppError('Blog post not found', 404, 'BLOG_NOT_FOUND');
  }

  if (blog.status !== BLOG_STATUS.PUBLISH_FAILED) {
    throw new AppError('Can only retry publishing for blogs in PUBLISH_FAILED status', 400, 'INVALID_RETRY_STATE');
  }

  // Transition to IN_PUBLISHING via RETRY
  await transitionBlogAction(blogId, WORKFLOW_ACTIONS.RETRY, user, { reason: 'Retrying publication' });

  // Execute publish
  return publishBlog(blogId, user);
};
