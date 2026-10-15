import {
  createKeyword,
  deleteKeyword,
  getKeywordById,
  getKeywords,
  updateKeyword
} from '../services/keywordService.js';

export const listKeywordsController = async (req, res, next) => {
  try {
    const keywords = await getKeywords(req.actor || null, req.query);

    return res.status(200).json({
      success: true,
      message: 'Keywords fetched successfully',
      data: {
        keywords
      },
      error: null
    });
  } catch (error) {
    return next(error);
  }
};

export const getKeywordByIdController = async (req, res, next) => {
  try {
    const keyword = await getKeywordById(req.params.id, req.actor || null);

    return res.status(200).json({
      success: true,
      message: 'Keyword fetched successfully',
      data: {
        keyword
      },
      error: null
    });
  } catch (error) {
    return next(error);
  }
};

export const createKeywordController = async (req, res, next) => {
  try {
    const keyword = await createKeyword(req.body, req.actor);

    return res.status(201).json({
      success: true,
      message: 'Keyword created successfully',
      data: {
        keyword
      },
      error: null
    });
  } catch (error) {
    return next(error);
  }
};

export const updateKeywordController = async (req, res, next) => {
  try {
    const keyword = await updateKeyword(req.params.id, req.body, req.actor);

    return res.status(200).json({
      success: true,
      message: 'Keyword updated successfully',
      data: {
        keyword
      },
      error: null
    });
  } catch (error) {
    return next(error);
  }
};

export const deleteKeywordController = async (req, res, next) => {
  try {
    await deleteKeyword(req.params.id, req.actor);

    return res.status(200).json({
      success: true,
      message: 'Keyword deleted successfully',
      data: null,
      error: null
    });
  } catch (error) {
    return next(error);
  }
};
