import Subcategory from '../models/Subcategory.js';

export const findSubcategories = async (filter = {}) =>
  Subcategory.find(filter)
    .populate('category')
    .populate({
      path: 'createdBy',
      select: 'name username email'
    })
    .populate({
      path: 'team',
      select: 'name slug'
    })
    .sort({ name: 1 });

export const findSubcategoryById = async (subcategoryId) =>
  Subcategory.findById(subcategoryId)
    .populate('category')
    .populate({
      path: 'createdBy',
      select: 'name username email'
    })
    .populate({
      path: 'team',
      select: 'name slug'
    });

export const findSubcategoryByCategoryAndSlug = async (categoryId, slug, filter = {}) =>
  Subcategory.findOne({
    category: categoryId,
    slug: slug.toLowerCase().trim(),
    ...filter
  });

export const findSubcategoryByCategoryAndName = async (categoryId, name, filter = {}) =>
  Subcategory.findOne({
    category: categoryId,
    name: new RegExp(`^${name.trim()}$`, 'i'),
    ...filter
  });

export const createSubcategoryRecord = async (payload) => Subcategory.create(payload);

export const updateSubcategoryRecord = async (subcategoryId, payload) =>
  Subcategory.findByIdAndUpdate(subcategoryId, payload, {
    new: true,
    runValidators: true
  })
    .populate('category')
    .populate({
      path: 'createdBy',
      select: 'name username email'
    })
    .populate({
      path: 'team',
      select: 'name slug'
    });

export const deleteSubcategoryRecord = async (subcategoryId) =>
  Subcategory.findByIdAndDelete(subcategoryId);
