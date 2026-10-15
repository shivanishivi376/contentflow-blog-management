import { generateAIContent, generateAIMetadata, improveAIText } from '../services/aiService.js';

export const generateAIContentController = async (req, res, next) => {
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

export const improveAITextController = async (req, res, next) => {
  try {
    const result = await improveAIText(req.body);

    return res.status(200).json({
      success: true,
      message: 'AI text improved successfully',
      data: result,
      error: null
    });
  } catch (error) {
    return next(error);
  }
};

export const generateAIMetadataController = async (req, res, next) => {
  try {
    const result = await generateAIMetadata(req.body);

    return res.status(200).json({
      success: true,
      message: 'AI metadata generated successfully',
      data: result,
      error: null
    });
  } catch (error) {
    return next(error);
  }
};
