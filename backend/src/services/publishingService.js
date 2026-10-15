import Blog from '../models/Blog.js';
import ExternalPublication from '../models/ExternalPublication.js';
import AppError from '../utils/AppError.js';
import {
  createDevToArticle,
  isDevToConfigured,
  updateDevToArticle
} from '../integrations/devto/devtoClient.js';
import { findBlogById, updateBlogRecord } from '../repositories/blogRepository.js';

const getStoredDevToArticleId = async (blog) => {
  if (blog.devToArticleId !== null && blog.devToArticleId !== undefined) {
    return blog.devToArticleId;
  }

  const previousPublication = await ExternalPublication.findOne({
    blog: blog._id,
    externalPlatform: 'DEVTO',
    publicationStatus: 'SUCCESS'
  }).sort({ createdAt: -1 });
  const legacyId = Number(previousPublication?.externalArticleId);
  return Number.isSafeInteger(legacyId) && legacyId > 0 ? legacyId : null;
};

export const syncBlogToDevTo = async (blogId, user, options = {}) => {
  const blog = await findBlogById(blogId);
  if (!blog) {
    throw new AppError('Blog post not found', 404, 'BLOG_NOT_FOUND');
  }
  if (blog.status !== 'PUBLISHED') {
    throw new AppError('Only PUBLISHED blog articles can be cross-posted to Dev.to', 400, 'BLOG_NOT_PUBLISHED');
  }
  if (!isDevToConfigured()) {
    const message = 'Dev.to publishing is not configured. Set DEVTO_API_KEY on the backend.';
    await updateBlogRecord(blogId, {
      devToPublished: false,
      devToPublishError: message,
      devToPublishInProgress: false,
      devToPublishStartedAt: null
    });
    return { published: false, error: message };
  }

  const now = new Date();
  const lockExpiredBefore = new Date(now.getTime() - 2 * 60 * 1000);
  const claimedBlog = await Blog.findOneAndUpdate(
    {
      _id: blogId,
      status: 'PUBLISHED',
      $or: [
        { devToPublishInProgress: { $ne: true } },
        { devToPublishStartedAt: { $lt: lockExpiredBefore } }
      ]
    },
    {
      $set: {
        devToPublishInProgress: true,
        devToPublishStartedAt: now
      }
    },
    { new: true }
  );

  if (!claimedBlog) {
    const latestBlog = await Blog.findById(blogId);
    if (latestBlog?.devToPublished) {
      return {
        published: true,
        articleId: latestBlog.devToArticleId,
        url: latestBlog.devToUrl
      };
    }
    return { published: false, error: 'A Dev.to publishing attempt is already in progress.' };
  }

  let result;
  const articleId = await getStoredDevToArticleId(claimedBlog);
  const tags = Array.isArray(options.tags) ? options.tags : [];
  try {
    result = articleId
      ? await updateDevToArticle({ blog: claimedBlog, articleId, tags })
      : await createDevToArticle({ blog: claimedBlog, tags });
  } catch (error) {
    const message = String(error.message || 'Dev.to publishing failed').slice(0, 500);
    await updateBlogRecord(blogId, {
      devToPublished: false,
      devToPublishError: message,
      devToPublishInProgress: false,
      devToPublishStartedAt: null
    });
    return { published: false, error: message };
  }

  await Promise.all([
    updateBlogRecord(blogId, {
      devToArticleId: result.id,
      devToUrl: result.url,
      devToPublished: true,
      devToPublishedAt: new Date(),
      devToPublishError: null,
      devToPublishInProgress: false,
      devToPublishStartedAt: null
    }),
    ExternalPublication.findOneAndUpdate(
      { blog: claimedBlog._id, externalPlatform: 'DEVTO' },
      {
        $set: {
          user: user.id || user._id,
          externalArticleId: String(result.id),
          externalUrl: result.url,
          publicationStatus: 'SUCCESS',
          responseMetadata: { id: result.id, url: result.url }
        }
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    )
  ]);

  return { published: true, articleId: result.id, url: result.url };
};

export const publishToDevTo = async (blogId, user, options = {}) => {
  const result = await syncBlogToDevTo(blogId, user, options);
  if (!result.published) {
    throw new AppError(result.error, 502, 'DEVTO_PUBLISH_FAILED');
  }

  const publication = await ExternalPublication.findOne({
    blog: blogId,
    externalPlatform: 'DEVTO',
    externalArticleId: String(result.articleId)
  }).lean();
  return publication;
};

export const listExternalPublications = async (blogId) => {
  const publications = await ExternalPublication.find({ blog: blogId }).sort({ createdAt: -1 }).lean();
  return publications;
};
