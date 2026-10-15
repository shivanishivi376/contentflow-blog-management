import {
  addBlogComment,
  assignBlogRoles,
  createBlog,
  deleteBlog,
  getBlogById,
  listBlogComments,
  listBlogs,
  resolveBlogComment,
  updateBlog,
  updateBlogContent
} from '../services/blogService.js';
import {
  publishBlog,
  retryPublishBlog,
  transitionBlogAction,
  transitionBlogStatus
} from '../services/blogWorkflowService.js';
import { generateAIContent } from '../services/aiService.js';

export const createBlogController = async (req, res, next) => {
  try {
    const actor = { ...req.user, teamMembership: req.teamMembership };
    const blog = await createBlog(req.body, actor);

    return res.status(201).json({
      success: true,
      message: 'Blog created successfully',
      data: {
        blog
      },
      error: null
    });
  } catch (error) {
    return next(error);
  }
};

export const listBlogsController = async (req, res, next) => {
  try {
    const actor = req.user ? { ...req.user, teamMembership: req.teamMembership } : null;
    const result = await listBlogs(req.query, actor);

    return res.status(200).json({
      success: true,
      message: 'Blogs fetched successfully',
      data: result,
      error: null
    });
  } catch (error) {
    return next(error);
  }
};

export const getBlogByIdController = async (req, res, next) => {
  try {
    const actor = req.user ? { ...req.user, teamMembership: req.teamMembership } : null;
    const blog = await getBlogById(req.params.id, actor);

    return res.status(200).json({
      success: true,
      message: 'Blog fetched successfully',
      data: {
        blog
      },
      error: null
    });
  } catch (error) {
    return next(error);
  }
};

export const updateBlogController = async (req, res, next) => {
  try {
    const actor = { ...req.user, teamMembership: req.teamMembership };
    const blog = await updateBlog(req.params.id, req.body, actor);

    return res.status(200).json({
      success: true,
      message: 'Blog updated successfully',
      data: {
        blog
      },
      error: null
    });
  } catch (error) {
    return next(error);
  }
};

export const assignBlogRolesController = async (req, res, next) => {
  try {
    const actor = { ...req.user, teamMembership: req.teamMembership };
    const blog = await assignBlogRoles(req.params.id, req.body, actor);

    return res.status(200).json({
      success: true,
      message: 'Team roles assigned successfully',
      data: {
        blog
      },
      error: null
    });
  } catch (error) {
    return next(error);
  }
};


export const updateBlogContentController = async (req, res, next) => {
  try {
    const blog = await updateBlogContent(req.params.id, req.body, req.user);

    return res.status(200).json({
      success: true,
      message: 'Blog content saved successfully',
      data: {
        blog
      },
      error: null
    });
  } catch (error) {
    return next(error);
  }
};

export const transitionBlogStatusController = async (req, res, next) => {
  try {
    let blog;
    if (req.body.action) {
      blog = await transitionBlogAction(req.params.id, req.body.action, req.user, req.body);
    } else if (req.body.status) {
      blog = await transitionBlogStatus(req.params.id, req.body.status, req.user, req.body);
    } else {
      return res.status(400).json({
        success: false,
        message: 'Either action or status must be provided',
        data: null,
        error: { code: 'INVALID_TRANSITION_PAYLOAD' }
      });
    }

    const devTo = blog.status === 'PUBLISHED'
      ? {
          published: Boolean(blog.devToPublished),
          articleId: blog.devToArticleId || null,
          url: blog.devToUrl || null,
          error: blog.devToPublishError || null
        }
      : null;

    return res.status(200).json({
      success: true,
      message: devTo && !devTo.published
        ? 'Blog published successfully, but Dev.to publishing failed.'
        : 'Blog workflow status updated successfully',
      data: {
        blog,
        ...(devTo ? { devTo } : {})
      },
      error: null
    });
  } catch (error) {
    return next(error);
  }
};

export const publishBlogController = async (req, res, next) => {
  try {
    const { blog, devTo } = await publishBlog(req.params.id, req.user);

    return res.status(200).json({
      success: true,
      message: 'Blog published successfully',
      data: {
        blog,
        devTo
      },
      error: null
    });
  } catch (error) {
    return next(error);
  }
};

export const retryPublishBlogController = async (req, res, next) => {
  try {
    const { blog, devTo } = await retryPublishBlog(req.params.id, req.user);

    return res.status(200).json({
      success: true,
      message: 'Blog publishing retried successfully',
      data: {
        blog,
        devTo
      },
      error: null
    });
  } catch (error) {
    return next(error);
  }
};

export const listBlogCommentsController = async (req, res, next) => {
  try {
    const comments = await listBlogComments(req.params.id, req.user);

    return res.status(200).json({
      success: true,
      message: 'Comments fetched successfully',
      data: {
        comments
      },
      error: null
    });
  } catch (error) {
    return next(error);
  }
};

export const addBlogCommentController = async (req, res, next) => {
  try {
    const comment = await addBlogComment(req.params.id, req.body, req.user);

    return res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: {
        comment
      },
      error: null
    });
  } catch (error) {
    return next(error);
  }
};

export const resolveBlogCommentController = async (req, res, next) => {
  try {
    const comment = await resolveBlogComment(req.params.id, req.params.commentId, req.user);

    return res.status(200).json({
      success: true,
      message: 'Comment status updated successfully',
      data: {
        comment
      },
      error: null
    });
  } catch (error) {
    return next(error);
  }
};

export const generateBlogAIContentController = async (req, res, next) => {
  try {
    const result = await generateAIContent(req.body);

    return res.status(200).json({
      success: true,
      message: 'AI content generated successfully',
      data: result,
      error: null
    });
  } catch (error) {
    return next(error);
  }
};

export const deleteBlogController = async (req, res, next) => {
  try {
    await deleteBlog(req.params.id, req.user);

    return res.status(200).json({
      success: true,
      message: 'Blog deleted successfully',
      data: null,
      error: null
    });
  } catch (error) {
    return next(error);
  }
};
