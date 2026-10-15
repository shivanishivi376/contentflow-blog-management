import {
  createComment,
  deleteComment,
  listBlogComments,
  replyToComment,
  resolveComment,
  updateComment
} from '../services/commentService.js';

export const createCommentController = async (req, res, next) => {
  try {
    const comment = await createComment(req.body, req.user);

    return res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: { comment },
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
      data: { comments },
      error: null
    });
  } catch (error) {
    return next(error);
  }
};

export const updateCommentController = async (req, res, next) => {
  try {
    const comment = await updateComment(req.params.id, req.body.content, req.user);

    return res.status(200).json({
      success: true,
      message: 'Comment updated successfully',
      data: { comment },
      error: null
    });
  } catch (error) {
    return next(error);
  }
};

export const deleteCommentController = async (req, res, next) => {
  try {
    await deleteComment(req.params.id, req.user);

    return res.status(200).json({
      success: true,
      message: 'Comment deleted successfully',
      data: null,
      error: null
    });
  } catch (error) {
    return next(error);
  }
};

export const replyToCommentController = async (req, res, next) => {
  try {
    const reply = await replyToComment(req.params.id, req.body.content, req.user);

    return res.status(201).json({
      success: true,
      message: 'Reply added successfully',
      data: { reply },
      error: null
    });
  } catch (error) {
    return next(error);
  }
};

export const resolveCommentController = async (req, res, next) => {
  try {
    const comment = await resolveComment(req.params.id, req.user);

    return res.status(200).json({
      success: true,
      message: `Comment status updated to ${comment.status}`,
      data: { comment },
      error: null
    });
  } catch (error) {
    return next(error);
  }
};
