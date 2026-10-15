import { deleteMediaFile, uploadMediaFile } from '../services/mediaService.js';

export const uploadMediaController = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const media = await uploadMediaFile(req.file, userId);

    return res.status(201).json({
      success: true,
      message: 'Media uploaded successfully',
      data: {
        media
      },
      error: null
    });
  } catch (error) {
    return next(error);
  }
};

export const deleteMediaController = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.user?._id;
    await deleteMediaFile(req.params.id, userId);

    return res.status(200).json({
      success: true,
      message: 'Media deleted successfully',
      data: null,
      error: null
    });
  } catch (error) {
    return next(error);
  }
};
