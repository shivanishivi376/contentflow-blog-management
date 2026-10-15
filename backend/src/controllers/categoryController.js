import {
  createCategory,
  deleteCategory,
  getCategories,
  getCategoryById,
  updateCategory
} from '../services/categoryService.js';

export const listCategoriesController = async (req, res, next) => {
  try {
    const categories = await getCategories(req.actor || null);

    return res.status(200).json({
      success: true,
      message: 'Categories fetched successfully',
      data: {
        categories
      },
      error: null
    });
  } catch (error) {
    return next(error);
  }
};

export const getCategoryByIdController = async (req, res, next) => {
  try {
    const category = await getCategoryById(req.params.id, req.actor || null);

    return res.status(200).json({
      success: true,
      message: 'Category fetched successfully',
      data: {
        category
      },
      error: null
    });
  } catch (error) {
    return next(error);
  }
};

export const createCategoryController = async (req, res, next) => {
  try {
    const category = await createCategory(req.body, req.actor);

    return res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: {
        category
      },
      error: null
    });
  } catch (error) {
    return next(error);
  }
};

export const updateCategoryController = async (req, res, next) => {
  try {
    const category = await updateCategory(req.params.id, req.body, req.actor);

    return res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      data: {
        category
      },
      error: null
    });
  } catch (error) {
    return next(error);
  }
};

export const deleteCategoryController = async (req, res, next) => {
  try {
    await deleteCategory(req.params.id, req.actor);

    return res.status(200).json({
      success: true,
      message: 'Category deleted successfully',
      data: null,
      error: null
    });
  } catch (error) {
    return next(error);
  }
};
