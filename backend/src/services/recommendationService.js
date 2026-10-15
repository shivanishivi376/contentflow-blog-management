import Blog from '../models/Blog.js';
import User from '../models/User.js';

export const getRecommendedBlogs = async (user) => {
  const userId = user.id || user._id;
  const userDoc = await User.findById(userId).populate('interests').lean();

  const filter = { status: 'PUBLISHED' };

  if (userDoc?.interests && userDoc.interests.length > 0) {
    const interestIds = userDoc.interests.map((i) => i._id);
    filter.$or = [
      { category: { $in: interestIds } },
      { subcategory: { $in: interestIds } },
      { primaryKeywords: { $in: interestIds } }
    ];
  }

  let recommended = await Blog.find(filter)
    .sort({ publishedAt: -1, createdAt: -1 })
    .limit(10)
    .populate('category', 'name slug')
    .populate('subcategory', 'name slug')
    .populate('author', 'name username profileImage')
    .lean();

  // Fallback if no matching interest blogs found
  if (recommended.length === 0) {
    recommended = await Blog.find({ status: 'PUBLISHED' })
      .sort({ publishedAt: -1, createdAt: -1 })
      .limit(10)
      .populate('category', 'name slug')
      .populate('subcategory', 'name slug')
      .populate('author', 'name username profileImage')
      .lean();
  }

  return recommended.map((b) => ({
    id: b._id,
    title: b.title,
    slug: b.slug,
    description: b.description,
    featuredImage: b.featuredImage,
    publishedAt: b.publishedAt || b.createdAt,
    category: b.category ? { id: b.category._id, name: b.category.name, slug: b.category.slug } : null,
    author: b.author ? { name: b.author.name || b.author.username, profileImage: b.author.profileImage } : null
  }));
};
