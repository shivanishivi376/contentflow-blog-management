import Blog from '../models/Blog.js';
import Category from '../models/Category.js';
import AppError from '../utils/AppError.js';

const sanitizePublicBlog = (blog) => ({
  id: blog._id,
  title: blog.title,
  slug: blog.slug,
  description: blog.description,
  featuredImage: blog.featuredImage,
  content: blog.content,
  devToUrl: blog.devToPublished ? blog.devToUrl : null,
  publishedAt: blog.publishedAt || blog.updatedAt,
  category: blog.category ? { id: blog.category._id, name: blog.category.name, slug: blog.category.slug } : null,
  subcategory: blog.subcategory ? { id: blog.subcategory._id, name: blog.subcategory.name, slug: blog.subcategory.slug } : null,
  primaryKeywords: (blog.primaryKeywords || []).map((k) => ({ id: k._id, name: k.name, slug: k.slug })),
  author: blog.author ? { name: blog.author.name || blog.author.username, username: blog.author.username, profileImage: blog.author.profileImage } : null,
  metadata: {
    metaTitle: blog.metadata?.metaTitle || blog.title,
    metaDescription: blog.metadata?.metaDescription || blog.description
  }
});

export const getPublicBlogs = async (query = {}) => {
  const { page = 1, limit = 12, category, subcategory, search } = query;
  const filter = { status: 'PUBLISHED' };

  if (category) filter.category = category;
  if (subcategory) filter.subcategory = subcategory;
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [blogs, total] = await Promise.all([
    Blog.find(filter)
      .sort({ publishedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('category', 'name slug')
      .populate('subcategory', 'name slug')
      .populate('primaryKeywords', 'name slug')
      .populate('author', 'name username profileImage')
      .lean(),
    Blog.countDocuments(filter)
  ]);

  return {
    blogs: blogs.map(sanitizePublicBlog),
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / Number(limit))
    }
  };
};

export const getPublicBlogBySlug = async (slug) => {
  const blog = await Blog.findOne({ slug, status: 'PUBLISHED' })
    .populate('category', 'name slug')
    .populate('subcategory', 'name slug')
    .populate('primaryKeywords', 'name slug')
    .populate('secondaryKeywords', 'name slug')
    .populate('author', 'name username profileImage bio')
    .lean();

  if (!blog) {
    throw new AppError('Published blog article not found', 404, 'PUBLIC_BLOG_NOT_FOUND');
  }

  return sanitizePublicBlog(blog);
};

export const getPublicCategories = async () => {
  const categories = await Category.find({ isActive: true }).select('name slug description').lean();
  return categories;
};
