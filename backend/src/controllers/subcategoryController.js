import {
  createSubcategory,
  deleteSubcategory,
  getSubcategories,
  getSubcategoryById,
  updateSubcategory
} from '../services/subcategoryService.js';

export const listSubcategoriesController = async (req, res, next) => {
  try {
    const subcategories = await getSubcategories(req.actor || null, req.query);

    return res.status(200).json({
      success: true,
      message: 'Subcategories fetched successfully',
      data: {
        subcategories
      },
      error: null
    });
  } catch (error) {
    return next(error);
  }
};

export const getSubcategoryByIdController = async (req, res, next) => {
  try {
    const subcategory = await getSubcategoryById(req.params.id, req.actor || null);

    return res.status(200).json({
      success: true,
      message: 'Subcategory fetched successfully',
      data: {
        subcategory
      },
      error: null
    });
  } catch (error) {
    return next(error);
  }
};

export const createSubcategoryController = async (req, res, next) => {
  try {
    const subcategory = await createSubcategory(req.body, req.actor);

    return res.status(201).json({
      success: true,
      message: 'Subcategory created successfully',
      data: {
        subcategory
      },
      error: null
    });
  } catch (error) {
    return next(error);
  }
};

export const updateSubcategoryController = async (req, res, next) => {
  try {
    const subcategory = await updateSubcategory(req.params.id, req.body, req.actor);

    return res.status(200).json({
      success: true,
      message: 'Subcategory updated successfully',
      data: {
        subcategory
      },
      error: null
    });
  } catch (error) {
    return next(error);
  }
};

export const deleteSubcategoryController = async (req, res, next) => {
  try {
    await deleteSubcategory(req.params.id, req.actor);

    return res.status(200).json({
      success: true,
      message: 'Subcategory deleted successfully',
      data: null,
      error: null
    });
  } catch (error) {
    return next(error);
  }
};
