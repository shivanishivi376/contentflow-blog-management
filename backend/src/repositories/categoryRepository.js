import Category from '../models/Category.js';

export const findCategories = async (filter = {}) =>
  Category.find(filter)
    .populate({
      path: 'createdBy',
      select: 'name username email'
    })
    .populate({
      path: 'team',
      select: 'name slug'
    })
    .sort({ name: 1 });

export const findCategoryById = async (categoryId) =>
  Category.findById(categoryId)
    .populate({
      path: 'createdBy',
      select: 'name username email'
    })
    .populate({
      path: 'team',
      select: 'name slug'
    });

export const findCategoryBySlug = async (slug, filter = {}) =>
  Category.findOne({
    slug: slug.toLowerCase().trim(),
    ...filter
  });

export const findCategoryByName = async (name, filter = {}) =>
  Category.findOne({
    name: new RegExp(`^${name.trim()}$`, 'i'),
    ...filter
  });

export const createCategoryRecord = async (payload) => Category.create(payload);

export const updateCategoryRecord = async (categoryId, payload) =>
  Category.findByIdAndUpdate(categoryId, payload, { new: true, runValidators: true })
    .populate({
      path: 'createdBy',
      select: 'name username email'
    })
    .populate({
      path: 'team',
      select: 'name slug'
    });

export const deleteCategoryRecord = async (categoryId) =>
  Category.findByIdAndDelete(categoryId);
