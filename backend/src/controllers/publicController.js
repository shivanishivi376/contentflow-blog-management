import { getPublicBlogBySlug, getPublicBlogs, getPublicCategories } from '../services/publicService.js';

export const getPublicBlogsController = async (req, res, next) => {
  try {
    const result = await getPublicBlogs(req.query);

    return res.status(200).json({
      success: true,
      message: 'Public blogs fetched successfully',
      data: result,
      error: null
    });
  } catch (error) {
    return next(error);
  }
};

export const getPublicBlogBySlugController = async (req, res, next) => {
  try {
    const blog = await getPublicBlogBySlug(req.params.slug);

    return res.status(200).json({
      success: true,
      message: 'Public blog fetched successfully',
      data: { blog },
      error: null
    });
  } catch (error) {
    return next(error);
  }
};

export const getPublicCategoriesController = async (req, res, next) => {
  try {
    const categories = await getPublicCategories();

    return res.status(200).json({
      success: true,
      message: 'Public categories fetched successfully',
      data: { categories },
      error: null
    });
  } catch (error) {
    return next(error);
  }
};
