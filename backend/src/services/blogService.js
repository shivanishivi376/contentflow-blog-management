import mongoose from 'mongoose';
import Category from '../models/Category.js';
import Subcategory from '../models/Subcategory.js';
import Keyword from '../models/Keyword.js';
import Comment from '../models/Comment.js';
import Team from '../models/Team.js';
import AppError from '../utils/AppError.js';
import {
  createBlogRecord,
  deleteBlogRecord,
  findBlogById,
  findBlogBySlug,
  findBlogsWithFilters,
  updateBlogRecord
} from '../repositories/blogRepository.js';
import { createVersionSnapshot } from './versionService.js';

export const validateTaxonomyHierarchy = async ({ categoryId, subcategoryId, primaryKeywords = [], secondaryKeywords = [], user = null }) => {
  if (!categoryId || !mongoose.Types.ObjectId.isValid(categoryId)) {
    throw new AppError('Please select a valid category', 400, 'INVALID_CATEGORY');
  }

  if (!subcategoryId || !mongoose.Types.ObjectId.isValid(subcategoryId)) {
    throw new AppError('Please select a valid subcategory', 400, 'INVALID_SUBCATEGORY');
  }

  const category = await Category.findById(categoryId);
  if (!category || !category.isActive) {
    throw new AppError('Invalid or inactive category selected', 400, 'INVALID_CATEGORY');
  }

  if (user) {
    const userId = String(user.id || user._id || '');
    const userTeamId = String(user.teamMembership?.teamId || user.team?._id || user.team || '');
    if (category.scope === 'TEAM') {
      const categoryTeamId = String(category.team?._id || category.team || '');
      if (!userTeamId || categoryTeamId !== userTeamId) {
        throw new AppError('Selected category belongs to another team', 403, 'FORBIDDEN_CATEGORY_ACCESS');
      }
    } else if (category.scope === 'INDIVIDUAL') {
      const creatorId = String(category.createdBy?._id || category.createdBy || '');
      if (creatorId && creatorId !== userId) {
        throw new AppError('Selected category belongs to another user', 403, 'FORBIDDEN_CATEGORY_ACCESS');
      }
    }
  }

  const subcategory = await Subcategory.findById(subcategoryId);
  if (!subcategory || !subcategory.isActive) {
    throw new AppError('Invalid or inactive subcategory selected', 400, 'INVALID_SUBCATEGORY');
  }

  if (String(subcategory.category) !== String(categoryId)) {
    throw new AppError('Selected subcategory does not belong to the chosen category', 400, 'SUBCATEGORY_CATEGORY_MISMATCH');
  }

  if (user) {
    const userId = String(user.id || user._id || '');
    const userTeamId = String(user.teamMembership?.teamId || user.team?._id || user.team || '');
    if (subcategory.scope === 'TEAM') {
      const subcategoryTeamId = String(subcategory.team?._id || subcategory.team || '');
      if (!userTeamId || subcategoryTeamId !== userTeamId) {
        throw new AppError('Selected subcategory belongs to another team', 403, 'FORBIDDEN_SUBCATEGORY_ACCESS');
      }
    } else if (subcategory.scope === 'INDIVIDUAL') {
      const creatorId = String(subcategory.createdBy?._id || subcategory.createdBy || '');
      if (creatorId && creatorId !== userId) {
        throw new AppError('Selected subcategory belongs to another user', 403, 'FORBIDDEN_SUBCATEGORY_ACCESS');
      }
    }
  }

  if (!primaryKeywords || !Array.isArray(primaryKeywords) || primaryKeywords.length === 0) {
    throw new AppError('At least one primary keyword is required', 400, 'PRIMARY_KEYWORD_REQUIRED');
  }

  const allKeywordIds = [...new Set([...primaryKeywords, ...secondaryKeywords])];
  const validKeywords = await Keyword.find({
    _id: { $in: allKeywordIds },
    subcategory: subcategoryId,
    isActive: true
  });

  if (validKeywords.length !== allKeywordIds.length) {
    throw new AppError('One or more selected keywords are invalid or do not belong to the selected subcategory', 400, 'INVALID_KEYWORD_RELATIONSHIP');
  }

  const primaryIds = primaryKeywords.map(String);
  const invalidPrimary = validKeywords.some(
    (k) => primaryIds.includes(String(k._id)) && k.keywordType === 'secondary'
  );
  if (invalidPrimary) {
    throw new AppError('Selected primary keywords must be of primary keyword type', 400, 'INVALID_PRIMARY_KEYWORD');
  }
};

export const createBlog = async (payload, user) => {
  const userTeamId = user.teamMembership?.teamId || user.team?._id || user.team || null;
  const isTeamBlog = Boolean(userTeamId);

  if (user.accountType === 'TEAM' || isTeamBlog) {
    const isOwner = Boolean(user.teamMembership?.isOwner || user.isOwner);
    const userRole = user.teamMembership?.workflowRole || user.workflowRole;
    if (!isOwner && userRole !== 'Writer') {
      throw new AppError('Only the Team Owner or team members with the Writer role can create blogs', 403, 'FORBIDDEN_WORKFLOW_ROLE');
    }
  }

  await validateTaxonomyHierarchy({
    categoryId: payload.category,
    subcategoryId: payload.subcategory,
    primaryKeywords: payload.primaryKeywords,
    secondaryKeywords: payload.secondaryKeywords,
    user
  });

  const existingBlog = await findBlogBySlug(payload.slug);
  if (existingBlog) {
    throw new AppError('A blog post with this slug already exists', 409, 'BLOG_SLUG_EXISTS');
  }

  const blogData = {
    ...payload,
    author: user._id || user.id,
    accountType: isTeamBlog ? 'TEAM' : 'INDIVIDUAL',
    team: userTeamId || undefined,
    // For team blogs, initialize as DRAFT until all 3 roles are assigned by the Team Owner
    status: isTeamBlog ? 'DRAFT' : (payload.status || 'IN_WRITING')
  };

  const blog = await createBlogRecord(blogData);
  await createVersionSnapshot(blog, user._id || user.id, 'Initial draft created');
  return blog;
};

export const listBlogs = async (query = {}, user) => {
  const { page = 1, limit = 20, status, category, subcategory, search } = query;

  const filter = {};

  // Scope listing: users see only their own/assigned/team blogs in workspace
  if (user) {
    if (user.type === 'ADMIN' || user.isMainAdmin || user.role === 'ADMIN') {
      // Admin sees all blogs across platform
    } else {
      const userId = user.id || user._id;
      const userTeamId = user.teamMembership?.teamId || user.team?._id || user.team || null;

      const userConditions = [
        { author: userId },
        { writer: userId },
        { reviewer: userId },
        { publisher: userId }
      ];

      if (userId && mongoose.Types.ObjectId.isValid(userId)) {
        const userObjId = new mongoose.Types.ObjectId(userId);
        userConditions.push(
          { author: userObjId },
          { writer: userObjId },
          { reviewer: userObjId },
          { publisher: userObjId }
        );
      }

      if (userTeamId) {
        userConditions.push({ team: userTeamId });
        if (mongoose.Types.ObjectId.isValid(userTeamId)) {
          userConditions.push({ team: new mongoose.Types.ObjectId(userTeamId) });
        }
      }

      filter.$or = userConditions;
    }
  } else {
    filter.status = 'PUBLISHED';
  }

  if (status) filter.status = status;
  if (category) filter.category = category;
  if (subcategory) filter.subcategory = subcategory;
  if (search) {
    const searchFilter = {
      $or: [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ]
    };
    if (filter.$or) {
      filter.$and = [{ $or: filter.$or }, searchFilter];
      delete filter.$or;
    } else {
      filter.$or = searchFilter.$or;
    }
  }

  return findBlogsWithFilters(filter, Number(page), Number(limit));
};

export const getBlogById = async (blogId, user) => {
  const blog = await findBlogById(blogId);
  if (!blog) {
    throw new AppError('Blog post not found', 404, 'BLOG_NOT_FOUND');
  }

  // Authorization check
  const userId = user ? String(user.id || user._id) : null;
  const userTeamId = user ? String(user.teamMembership?.teamId || user.team?._id || user.team || '') : '';
  const blogTeamId = String(blog.team?._id || blog.team || '');

  const isAuthor = userId && String(blog.author?._id || blog.author) === userId;
  const isWriter = userId && blog.writer && String(blog.writer?._id || blog.writer) === userId;
  const isReviewer = userId && blog.reviewer && String(blog.reviewer?._id || blog.reviewer) === userId;
  const isPublisher = userId && blog.publisher && String(blog.publisher?._id || blog.publisher) === userId;
  const isSameTeam = Boolean(userTeamId && blogTeamId && userTeamId === blogTeamId);
  const isPublished = blog.status === 'PUBLISHED';

  if (!isPublished && !isAuthor && !isWriter && !isReviewer && !isPublisher && !isSameTeam) {
    throw new AppError('Access denied to this draft blog post', 403, 'BLOG_ACCESS_DENIED');
  }

  return blog;
};

export const updateBlog = async (blogId, payload, user) => {
  const blog = await findBlogById(blogId);
  if (!blog) {
    throw new AppError('Blog post not found', 404, 'BLOG_NOT_FOUND');
  }

  const userId = String(user.id || user._id);
  const userTeamId = String(user.teamMembership?.teamId || user.team?._id || user.team || '');
  const blogTeamId = String(blog.team?._id || blog.team || '');
  const isAuthor = String(blog.author?._id || blog.author) === userId;

  if (blog.accountType === 'INDIVIDUAL' || !blog.team) {
    if (!isAuthor) {
      throw new AppError('You cannot edit a blog created by another user', 403, 'FORBIDDEN_BLOG_ACCESS');
    }
  } else {
    // Team blog: author, assigned writer, or Team Owner can edit basic details
    let isOwner = Boolean(user.teamMembership?.isOwner || user.isOwner);
    if (!isOwner && blog.team) {
      const team = await Team.findById(blog.team);
      if (team && String(team.owner) === userId) {
        isOwner = true;
      }
    }
    const isWriter = blog.writer && String(blog.writer?._id || blog.writer) === userId;
    const isSameTeam = Boolean(userTeamId && blogTeamId && userTeamId === blogTeamId);

    if (!isAuthor && !isOwner && !isWriter && !isSameTeam) {
      throw new AppError('Only the Team Owner, author, or assigned writer can edit this team blog', 403, 'FORBIDDEN_BLOG_ACCESS');
    }
  }


  if (payload.slug && payload.slug !== blog.slug) {
    const existingBlog = await findBlogBySlug(payload.slug);
    if (existingBlog && String(existingBlog._id) !== String(blog._id)) {
      throw new AppError('A blog post with this slug already exists', 409, 'BLOG_SLUG_EXISTS');
    }
  }

  const categoryId = payload.category || (blog.category?._id || blog.category);
  const subcategoryId = payload.subcategory || (blog.subcategory?._id || blog.subcategory);

  if (payload.category || payload.subcategory || payload.primaryKeywords || payload.secondaryKeywords) {
    await validateTaxonomyHierarchy({
      categoryId,
      subcategoryId,
      primaryKeywords: payload.primaryKeywords || blog.primaryKeywords?.map((k) => k._id || k) || [],
      secondaryKeywords: payload.secondaryKeywords || blog.secondaryKeywords?.map((k) => k._id || k) || [],
      user
    });
  }

  const updatedBlog = await updateBlogRecord(blogId, payload);
  const hasPublishableChanges = [
    'title',
    'content',
    'description',
    'featuredImage',
    'category',
    'subcategory',
    'primaryKeywords',
    'secondaryKeywords'
  ].some((field) => {
    if (!Object.prototype.hasOwnProperty.call(payload, field)) return false;
    const currentValue = blog[field];
    const nextValue = payload[field];
    const normalize = (value) =>
      Array.isArray(value)
        ? value.map((item) => String(item?._id || item))
        : String(value?._id || value || '');
    return JSON.stringify(normalize(currentValue)) !== JSON.stringify(normalize(nextValue));
  });

  return updatedBlog;
};

export const deleteBlog = async (blogId, user) => {
  const blog = await findBlogById(blogId);
  if (!blog) {
    throw new AppError('Blog post not found', 404, 'BLOG_NOT_FOUND');
  }

  const userId = String(user.id || user._id);
  const isAuthor = String(blog.author?._id || blog.author) === userId;

  if (blog.accountType === 'INDIVIDUAL' || !blog.team) {
    if (!isAuthor) {
      throw new AppError('You cannot delete a blog created by another user', 403, 'FORBIDDEN_BLOG_ACCESS');
    }
  } else {
    // Team blog: only author OR Team Owner can delete
    let isOwner = Boolean(user.teamMembership?.isOwner || user.isOwner);
    if (!isOwner && blog.team) {
      const team = await Team.findById(blog.team);
      if (team && String(team.owner) === userId) {
        isOwner = true;
      }
    }
    if (!isAuthor && !isOwner) {
      throw new AppError('Only the blog author or Team Owner can delete this team blog', 403, 'FORBIDDEN_BLOG_ACCESS');
    }
  }

  return deleteBlogRecord(blogId);
};

export const assignBlogRoles = async (blogId, { writer, reviewer, publisher }, user) => {
  const blog = await findBlogById(blogId);
  if (!blog) {
    throw new AppError('Blog post not found', 404, 'BLOG_NOT_FOUND');
  }

  let isOwner = Boolean(user.teamMembership?.isOwner || user.isOwner);

  if (blog.accountType === 'TEAM' && !isOwner && blog.team) {
    const team = await Team.findById(blog.team);
    if (team && String(team.owner) === String(user.id || user._id)) {
      isOwner = true;
    }
  }

  if (blog.accountType === 'TEAM' && !isOwner) {
    throw new AppError('Only the Team Owner can assign team roles for this blog', 403, 'BLOG_ASSIGN_DENIED');
  }

  const set = new Set([String(writer), String(reviewer), String(publisher)]);
  if (set.size !== 3) {
    throw new AppError('Writer, Reviewer, and Publisher must be 3 distinct users', 400, 'DUPLICATE_ROLE_ASSIGNMENT');
  }

  if (blog.team) {
    const team = await Team.findById(blog.team);
    if (team && Array.isArray(team.members) && team.members.length > 0) {
      const getMemberRole = (userId) => {
        const member = team.members.find(
          (m) => String(m.user?._id || m.user) === String(userId) && m.status === 'ACTIVE'
        );
        return member?.workflowRole || null;
      };

      const writerRole = getMemberRole(writer);
      const reviewerRole = getMemberRole(reviewer);
      const publisherRole = getMemberRole(publisher);

      if (writerRole && writerRole !== 'Writer') {
        throw new AppError('The user assigned as Writer must have the Writer role', 400, 'INVALID_ROLE_ASSIGNMENT');
      }
      if (reviewerRole && reviewerRole !== 'Reviewer') {
        throw new AppError('The user assigned as Reviewer must have the Reviewer role', 400, 'INVALID_ROLE_ASSIGNMENT');
      }
      if (publisherRole && publisherRole !== 'Publisher') {
        throw new AppError('The user assigned as Publisher must have the Publisher role', 400, 'INVALID_ROLE_ASSIGNMENT');
      }
    }
  }

  const updatedBlog = await updateBlogRecord(blogId, {
    accountType: 'TEAM',
    writer,
    reviewer,
    publisher,
    status: blog.status === 'DRAFT' ? 'IN_WRITING' : blog.status
  });

  await createVersionSnapshot(updatedBlog, user.id || user._id, 'Assigned team roles (Writer, Reviewer, Publisher)');

  return updatedBlog;
};


export const updateBlogContent = async (blogId, { content }, user) => {
  const blog = await findBlogById(blogId);
  if (!blog) {
    throw new AppError('Blog post not found', 404, 'BLOG_NOT_FOUND');
  }

  const userId = String(user.id || user._id);
  const isAuthor = String(blog.author?._id || blog.author) === userId;

  if (blog.accountType === 'INDIVIDUAL' || !blog.team) {
    if (!isAuthor) {
      throw new AppError('You cannot edit content of a blog created by another user', 403, 'FORBIDDEN_BLOG_ACCESS');
    }
  } else {
    // Team blog: author, assigned writer, or Team Owner can edit content
    let isOwner = Boolean(user.teamMembership?.isOwner || user.isOwner);
    if (!isOwner && blog.team) {
      const team = await Team.findById(blog.team);
      if (team && String(team.owner) === userId) {
        isOwner = true;
      }
    }
    const isWriter = blog.writer && String(blog.writer?._id || blog.writer) === userId;

    if (!isAuthor && !isWriter && !isOwner) {
      throw new AppError('Only the assigned writer, author, or Team Owner can edit content for this team blog', 403, 'FORBIDDEN_BLOG_ACCESS');
    }
  }

  const updatedBlog = await updateBlogRecord(blogId, { content });
  await createVersionSnapshot(updatedBlog, user.id || user._id, 'Content autosave');

  return updatedBlog;
};


export const listBlogComments = async (blogId, user) => {
  const blog = await findBlogById(blogId);
  if (!blog) {
    throw new AppError('Blog post not found', 404, 'BLOG_NOT_FOUND');
  }

  const comments = await Comment.find({ blog: blogId })
    .populate('author', 'name username email profileImage')
    .populate('resolvedBy', 'name username email')
    .sort({ createdAt: 1 })
    .lean();

  return comments;
};

export const addBlogComment = async (blogId, payload, user) => {
  const blog = await findBlogById(blogId);
  if (!blog) {
    throw new AppError('Blog post not found', 404, 'BLOG_NOT_FOUND');
  }

  const userId = String(user.id || user._id);
  const isTeamBlog = blog.accountType === 'TEAM' || Boolean(blog.team);
  const isReply = Boolean(payload.parentComment);
  const isReviewFeedback = Boolean(payload.isReviewFeedback);

  // Top-level reviewer comments on team blogs must only be published by the Reviewer.
  // Other roles can only resolve or reply to reviewer comments.
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
    blog: blogId,
    author: user.id || user._id,
    content: payload.content,
    parentComment: payload.parentComment || null,
    isReviewFeedback: isReviewFeedback,
    status: 'OPEN'
  });

  return Comment.findById(comment._id)
    .populate('author', 'name username email profileImage')
    .populate('resolvedBy', 'name username email');
};

export const resolveBlogComment = async (blogId, commentId, user) => {
  const comment = await Comment.findOne({ _id: commentId, blog: blogId });
  if (!comment) {
    throw new AppError('Comment not found', 404, 'COMMENT_NOT_FOUND');
  }

  const newStatus = comment.status === 'RESOLVED' ? 'OPEN' : 'RESOLVED';
  comment.status = newStatus;
  comment.resolvedBy = newStatus === 'RESOLVED' ? (user.id || user._id) : null;
  comment.resolvedAt = newStatus === 'RESOLVED' ? new Date() : null;
  await comment.save();

  return Comment.findById(comment._id)
    .populate('author', 'name username email profileImage')
    .populate('resolvedBy', 'name username email');
};
