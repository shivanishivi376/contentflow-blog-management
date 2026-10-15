import Keyword from '../models/Keyword.js';

export const findKeywords = async (filter = {}) =>
  Keyword.find(filter)
    .populate('category subcategory')
    .populate({
      path: 'createdBy',
      select: 'name username email'
    })
    .populate({
      path: 'team',
      select: 'name slug'
    })
    .sort({ name: 1 });

export const findKeywordById = async (keywordId) =>
  Keyword.findById(keywordId)
    .populate('category subcategory')
    .populate({
      path: 'createdBy',
      select: 'name username email'
    })
    .populate({
      path: 'team',
      select: 'name slug'
    });

export const findKeywordBySubcategoryAndSlug = async (subcategoryId, slug, filter = {}) =>
  Keyword.findOne({
    subcategory: subcategoryId,
    slug: slug.toLowerCase().trim(),
    ...filter
  });

export const findKeywordBySubcategoryAndNameAndType = async (subcategoryId, name, keywordType, filter = {}) =>
  Keyword.findOne({
    subcategory: subcategoryId,
    name: new RegExp(`^${name.trim()}$`, 'i'),
    keywordType,
    ...filter
  });

export const createKeywordRecord = async (payload) => Keyword.create(payload);

export const updateKeywordRecord = async (keywordId, payload) =>
  Keyword.findByIdAndUpdate(keywordId, payload, {
    new: true,
    runValidators: true
  })
    .populate('category subcategory')
    .populate({
      path: 'createdBy',
      select: 'name username email'
    })
    .populate({
      path: 'team',
      select: 'name slug'
    });

export const deleteKeywordRecord = async (keywordId) => Keyword.findByIdAndDelete(keywordId);
