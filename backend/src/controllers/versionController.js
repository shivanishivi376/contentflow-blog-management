import { getBlogVersionById, listBlogVersions, restoreBlogVersion } from '../services/versionService.js';

export const listBlogVersionsController = async (req, res, next) => {
  try {
    const versions = await listBlogVersions(req.params.id, req.user);

    return res.status(200).json({
      success: true,
      message: 'Blog versions fetched successfully',
      data: {
        versions
      },
      error: null
    });
  } catch (error) {
    return next(error);
  }
};

export const getBlogVersionByIdController = async (req, res, next) => {
  try {
    const version = await getBlogVersionById(req.params.id, req.params.versionId, req.user);

    return res.status(200).json({
      success: true,
      message: 'Blog version fetched successfully',
      data: {
        version
      },
      error: null
    });
  } catch (error) {
    return next(error);
  }
};

export const restoreBlogVersionController = async (req, res, next) => {
  try {
    const result = await restoreBlogVersion(req.params.id, req.params.versionId, req.user);

    return res.status(200).json({
      success: true,
      message: `Restored blog to version snapshot successfully`,
      data: result,
      error: null
    });
  } catch (error) {
    return next(error);
  }
};
