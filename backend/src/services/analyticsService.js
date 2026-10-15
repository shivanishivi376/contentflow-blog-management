import Blog from '../models/Blog.js';
import User from '../models/User.js';
import Team from '../models/Team.js';
import Category from '../models/Category.js';

export const getAdminOverviewAnalytics = async () => {
  const [
    totalUsers,
    totalTeams,
    totalCategories,
    statusCounts,
    topAuthors,
    categoryDistribution
  ] = await Promise.all([
    User.countDocuments(),
    Team.countDocuments(),
    Category.countDocuments(),

    Blog.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]),

    Blog.aggregate([
      { $match: { status: 'PUBLISHED' } },
      {
        $group: {
          _id: '$author',
          publishedCount: { $sum: 1 }
        }
      },
      { $sort: { publishedCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'authorInfo'
        }
      },
      { $unwind: '$authorInfo' },
      {
        $project: {
          name: '$authorInfo.name',
          username: '$authorInfo.username',
          email: '$authorInfo.email',
          publishedCount: 1
        }
      }
    ]),

    Blog.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'categoryInfo'
        }
      },
      { $unwind: { path: '$categoryInfo', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          name: { $ifNull: ['$categoryInfo.name', 'Uncategorized'] },
          count: 1
        }
      }
    ])
  ]);

  const countsMap = statusCounts.reduce((acc, curr) => {
    acc[curr._id] = curr.count;
    return acc;
  }, {});

  const totalBlogs = Object.values(countsMap).reduce((a, b) => a + b, 0);

  return {
    overview: {
      totalUsers,
      totalTeams,
      totalCategories,
      totalBlogs,
      draftBlogs: countsMap.DRAFT || 0,
      writingBlogs: countsMap.IN_WRITING || 0,
      reviewBlogs: countsMap.IN_REVIEW || 0,
      reassignedBlogs: countsMap.RE_ASSIGN || 0,
      publishingBlogs: countsMap.IN_PUBLISHING || 0,
      publishedBlogs: countsMap.PUBLISHED || 0
    },
    topAuthors,
    categoryDistribution
  };
};
