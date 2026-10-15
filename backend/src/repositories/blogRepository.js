import Blog from '../models/Blog.js';
import User from '../models/User.js';
import Team from '../models/Team.js';
import Category from '../models/Category.js';
import Subcategory from '../models/Subcategory.js';
import Keyword from '../models/Keyword.js';
import Comment from '../models/Comment.js';
import BlogVersion from '../models/BlogVersion.js';
import ExternalPublication from '../models/ExternalPublication.js';


export const createBlogRecord = async (blogData) => {
  const blog = await Blog.create(blogData);
  return Blog.findById(blog._id)
    .populate('category', 'name slug')
    .populate('subcategory', 'name slug')
    .populate('primaryKeywords', 'name slug')
    .populate('secondaryKeywords', 'name slug')
    .populate('author', 'name username email')
    .populate('writer', 'name username email')
    .populate('reviewer', 'name username email')
    .populate('publisher', 'name username email')
    .populate('team', 'name');
};

export const findBlogById = async (blogId) => {
  return Blog.findById(blogId)
    .populate('category', 'name slug')
    .populate('subcategory', 'name slug')
    .populate('primaryKeywords', 'name slug')
    .populate('secondaryKeywords', 'name slug')
    .populate('author', 'name username email profileImage')
    .populate('writer', 'name username email')
    .populate('reviewer', 'name username email')
    .populate('publisher', 'name username email')
    .populate('team', 'name');
};

export const findBlogBySlug = async (slug) => {
  return Blog.findOne({ slug })
    .populate('category', 'name slug')
    .populate('subcategory', 'name slug')
    .populate('primaryKeywords', 'name slug')
    .populate('secondaryKeywords', 'name slug')
    .populate('author', 'name username email profileImage')
    .populate('writer', 'name username email')
    .populate('reviewer', 'name username email')
    .populate('publisher', 'name username email')
    .populate('team', 'name');
};

export const findBlogsWithFilters = async (query = {}, pageOrOptions = 1, limitArg = 10, sortArg = { createdAt: -1 }) => {
  let page = 1;
  let limit = 10;
  let sort = { createdAt: -1 };

  if (typeof pageOrOptions === 'object' && pageOrOptions !== null) {
    page = Number(pageOrOptions.page) || 1;
    limit = Number(pageOrOptions.limit) || 10;
    sort = pageOrOptions.sort || sort;
  } else {
    page = Number(pageOrOptions) || 1;
    limit = Number(limitArg) || 10;
    sort = sortArg || sort;
  }

  const skip = (page - 1) * limit;

  const [blogs, total] = await Promise.all([
    Blog.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('category', 'name slug')
      .populate('subcategory', 'name slug')
      .populate('primaryKeywords', 'name slug')
      .populate('secondaryKeywords', 'name slug')
      .populate('author', 'name username email profileImage')
      .populate('writer', 'name username email')
      .populate('reviewer', 'name username email')
      .populate('publisher', 'name username email')
      .populate('team', 'name'),
    Blog.countDocuments(query),
  ]);

  return {
    blogs,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit) || 1,
  };
};

export const updateBlogRecord = async (blogId, updateData) => {
  return Blog.findByIdAndUpdate(blogId, updateData, { new: true, runValidators: true })
    .populate('category', 'name slug')
    .populate('subcategory', 'name slug')
    .populate('primaryKeywords', 'name slug')
    .populate('secondaryKeywords', 'name slug')
    .populate('author', 'name username email profileImage')
    .populate('writer', 'name username email')
    .populate('reviewer', 'name username email')
    .populate('publisher', 'name username email')
    .populate('team', 'name');
};

export const deleteBlogRecord = async (blogId) => {
  const [deletedBlog] = await Promise.all([
    Blog.findByIdAndDelete(blogId),
    Comment.deleteMany({ blog: blogId }),
    BlogVersion.deleteMany({ blog: blogId }),
    ExternalPublication.deleteMany({ blog: blogId })
  ]);
  return deletedBlog;
};

