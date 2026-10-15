import BlogVersion from '../models/BlogVersion.js';
import Blog from '../models/Blog.js';
import AppError from '../utils/AppError.js';
import { findBlogById, updateBlogRecord } from '../repositories/blogRepository.js';

export const createVersionSnapshot = async (blog, userId, changeSummary = 'Version snapshot') => {
  const latestVersion = await BlogVersion.findOne({ blogId: blog._id || blog.id })
    .sort({ versionNumber: -1 })
    .lean();

  const nextVersionNumber = latestVersion ? latestVersion.versionNumber + 1 : 1;

  const version = await BlogVersion.create({
    blogId: blog._id || blog.id,
    versionNumber: nextVersionNumber,
    title: blog.title,
    content: blog.content,
    description: blog.description,
    changeSummary,
    metadata: blog.metadata || {},
    createdBy: userId
  });

  return version;
};

export const listBlogVersions = async (blogId, user) => {
  const blog = await findBlogById(blogId);
  if (!blog) {
    throw new AppError('Blog post not found', 404, 'BLOG_NOT_FOUND');
  }

  const versions = await BlogVersion.find({ blogId })
    .sort({ versionNumber: -1 })
    .populate('createdBy', 'name username email')
    .lean();

  return versions;
};

export const getBlogVersionById = async (blogId, versionId, user) => {
  const blog = await findBlogById(blogId);
  if (!blog) {
    throw new AppError('Blog post not found', 404, 'BLOG_NOT_FOUND');
  }

  const version = await BlogVersion.findOne({ _id: versionId, blogId })
    .populate('createdBy', 'name username email')
    .lean();

  if (!version) {
    throw new AppError('Version snapshot not found', 404, 'VERSION_NOT_FOUND');
  }

  return version;
};

export const restoreBlogVersion = async (blogId, versionId, user) => {
  const blog = await findBlogById(blogId);
  if (!blog) {
    throw new AppError('Blog post not found', 404, 'BLOG_NOT_FOUND');
  }

  const versionToRestore = await BlogVersion.findOne({ _id: versionId, blogId });
  if (!versionToRestore) {
    throw new AppError('Version snapshot not found', 404, 'VERSION_NOT_FOUND');
  }

  const userId = user.id || user._id;

  // Restore content to main Blog document
  const updatedBlog = await updateBlogRecord(blogId, {
    title: versionToRestore.title,
    content: versionToRestore.content,
    description: versionToRestore.description
  });

  // Create a NEW version snapshot representing the restore action (never overwrites history)
  const newVersion = await createVersionSnapshot(
    updatedBlog,
    userId,
    `Restored from Version ${versionToRestore.versionNumber}`
  );

  return {
    blog: updatedBlog,
    restoredVersion: versionToRestore,
    newVersion
  };
};
