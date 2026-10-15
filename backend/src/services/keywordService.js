import AppError from '../utils/AppError.js';
import Blog from '../models/Blog.js';
import { findCategoryById } from '../repositories/categoryRepository.js';
import { findSubcategoryById } from '../repositories/subcategoryRepository.js';
import {
  createKeywordRecord,
  deleteKeywordRecord,
  findKeywordById,
  findKeywordBySubcategoryAndNameAndType,
  findKeywordBySubcategoryAndSlug,
  findKeywords,
  updateKeywordRecord
} from '../repositories/keywordRepository.js';

const generateSlug = (text) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const normalizeKeywordPayload = (payload) => {
  const name = payload.name.trim();
  const slug = payload.slug?.trim() ? payload.slug.trim().toLowerCase() : generateSlug(name);
  return {
    category: (payload.categoryId || payload.category).toString().trim(),
    subcategory: (payload.subcategoryId || payload.subcategory).toString().trim(),
    name,
    slug,
    keywordType: payload.keywordType,
    description: payload.description?.trim() || ''
  };
};

const formatKeywordWithPermissions = (keyword, actor) => {
  const kwObj = keyword.toObject ? keyword.toObject() : { ...keyword };
  const creatorId = kwObj.createdBy?._id ? String(kwObj.createdBy._id) : (kwObj.createdBy ? String(kwObj.createdBy) : null);
  const actorId = actor?.id ? String(actor.id) : null;
  const isOwner = Boolean(actorId && creatorId && actorId === creatorId);
  const isAdmin = actor?.type === 'ADMIN';

  let canEdit = false;
  let canDelete = false;

  if (isAdmin) {
    canEdit = true;
    canDelete = true;
  } else if (isOwner) {
    if (kwObj.scope === 'TEAM') {
      const kwTeamId = kwObj.team?._id ? String(kwObj.team._id) : (kwObj.team ? String(kwObj.team) : null);
      const actorTeamId = actor?.teamMembership?.teamId ? String(actor.teamMembership.teamId) : null;
      if (kwTeamId && actorTeamId && kwTeamId === actorTeamId) {
        canEdit = true;
        canDelete = true;
      }
    } else if (kwObj.scope === 'INDIVIDUAL') {
      canEdit = true;
      canDelete = true;
    }
  }

  return {
    ...kwObj,
    isOwner,
    canEdit,
    canDelete
  };
};

const validateCategoryAndSubcategory = async (categoryId, subcategoryId, actor = null) => {
  const category = await findCategoryById(categoryId);

  if (!category || !category.isActive) {
    throw new AppError('Category not found', 404, 'CATEGORY_NOT_FOUND');
  }

  const subcategory = await findSubcategoryById(subcategoryId);

  if (!subcategory || !subcategory.isActive) {
    throw new AppError('Subcategory not found', 404, 'SUBCATEGORY_NOT_FOUND');
  }

  const subcategoryCategoryId = String(subcategory.category?._id || subcategory.category);

  if (subcategoryCategoryId !== String(category._id)) {
    throw new AppError('Subcategory does not belong to the selected category', 400, 'INVALID_CATEGORY_RELATION');
  }

  if (actor?.type === 'USER') {
    const creatorId = subcategory.createdBy?._id ? String(subcategory.createdBy._id) : (subcategory.createdBy ? String(subcategory.createdBy) : null);
    const subcategoryTeamId = subcategory.team?._id ? String(subcategory.team._id) : (subcategory.team ? String(subcategory.team) : null);
    const actorTeamId = actor.teamMembership?.teamId ? String(actor.teamMembership.teamId) : null;

    if (subcategory.scope === 'TEAM') {
      if (!actorTeamId || subcategoryTeamId !== actorTeamId) {
        throw new AppError('Cannot use subcategory from another team', 403, 'FORBIDDEN');
      }
    } else if (subcategory.scope === 'INDIVIDUAL') {
      if (creatorId && creatorId !== String(actor.id)) {
        throw new AppError('Cannot use subcategory created by another user', 403, 'FORBIDDEN');
      }
    }
  }

  return { category, subcategory };
};

export const getKeywords = async (actor = null, query = {}) => {
  let filter = {};

  if (!actor) {
    filter = { $or: [{ scope: 'GLOBAL' }, { scope: { $exists: false } }] };
  } else if (actor.type === 'ADMIN') {
    filter = {};
  } else if (actor.type === 'USER') {
    const userId = actor.id;
    const teamId = actor.teamMembership?.teamId || null;

    if (teamId) {
      filter = {
        $or: [
          { scope: 'GLOBAL' },
          { scope: { $exists: false } },
          { scope: 'TEAM', team: teamId }
        ]
      };
    } else {
      filter = {
        $or: [
          { scope: 'GLOBAL' },
          { scope: { $exists: false } },
          { scope: 'INDIVIDUAL', createdBy: userId }
        ]
      };
    }
  }

  if (query.subcategoryId) {
    filter.subcategory = query.subcategoryId.trim();
  }

  if (query.categoryId) {
    filter.category = query.categoryId.trim();
  }

  if (query.keywordType) {
    filter.keywordType = query.keywordType;
  }

  const keywords = await findKeywords(filter);
  return keywords.map((k) => formatKeywordWithPermissions(k, actor));
};

export const getKeywordById = async (keywordId, actor = null) => {
  const keyword = await findKeywordById(keywordId);

  if (!keyword) {
    throw new AppError('Keyword not found', 404, 'KEYWORD_NOT_FOUND');
  }

  if (actor?.type === 'USER') {
    const creatorId = keyword.createdBy?._id ? String(keyword.createdBy._id) : (keyword.createdBy ? String(keyword.createdBy) : null);
    const keywordTeamId = keyword.team?._id ? String(keyword.team._id) : (keyword.team ? String(keyword.team) : null);
    const actorTeamId = actor.teamMembership?.teamId ? String(actor.teamMembership.teamId) : null;

    if (keyword.scope === 'TEAM' && keywordTeamId !== actorTeamId) {
      throw new AppError('Keyword not found or unauthorized', 403, 'FORBIDDEN');
    }

    if (keyword.scope === 'INDIVIDUAL' && creatorId !== String(actor.id)) {
      throw new AppError('Keyword not found or unauthorized', 403, 'FORBIDDEN');
    }
  }

  return formatKeywordWithPermissions(keyword, actor);
};

export const createKeyword = async (payload, actor) => {
  if (!actor) {
    throw new AppError('Authentication required', 401, 'AUTHENTICATION_REQUIRED');
  }

  const normalizedPayload = normalizeKeywordPayload(payload);

  await validateCategoryAndSubcategory(normalizedPayload.category, normalizedPayload.subcategory, actor);

  let scope = 'GLOBAL';
  let createdBy = actor.id;
  let createdByModel = 'Admin';
  let team = null;
  let duplicateScopeFilter = {};

  if (actor.type === 'ADMIN') {
    scope = 'GLOBAL';
    createdBy = actor.id;
    createdByModel = 'Admin';
    team = null;
    duplicateScopeFilter = { $or: [{ scope: 'GLOBAL' }, { scope: { $exists: false } }] };
  } else if (actor.type === 'USER') {
    const teamId = actor.teamMembership?.teamId || null;
    if (teamId) {
      scope = 'TEAM';
      team = teamId;
      createdBy = actor.id;
      createdByModel = 'User';
      duplicateScopeFilter = { scope: 'TEAM', team: teamId };
    } else {
      scope = 'INDIVIDUAL';
      team = null;
      createdBy = actor.id;
      createdByModel = 'User';
      duplicateScopeFilter = { scope: 'INDIVIDUAL', createdBy: actor.id };
    }
  }

  const existingSlug = await findKeywordBySubcategoryAndSlug(
    normalizedPayload.subcategory,
    normalizedPayload.slug,
    duplicateScopeFilter
  );

  if (existingSlug) {
    throw new AppError('Keyword slug already exists in this scope', 409, 'KEYWORD_SLUG_EXISTS');
  }

  const existingName = await findKeywordBySubcategoryAndNameAndType(
    normalizedPayload.subcategory,
    normalizedPayload.name,
    normalizedPayload.keywordType,
    duplicateScopeFilter
  );

  if (existingName) {
    throw new AppError('Keyword with this name and type already exists in this scope', 409, 'KEYWORD_NAME_EXISTS');
  }

  const keyword = await createKeywordRecord({
    ...normalizedPayload,
    scope,
    createdBy,
    createdByModel,
    team
  });

  const populated = await findKeywordById(keyword._id);
  return formatKeywordWithPermissions(populated, actor);
};

export const updateKeyword = async (keywordId, payload, actor) => {
  if (!actor) {
    throw new AppError('Authentication required', 401, 'AUTHENTICATION_REQUIRED');
  }

  const keyword = await findKeywordById(keywordId);

  if (!keyword) {
    throw new AppError('Keyword not found', 404, 'KEYWORD_NOT_FOUND');
  }

  if (actor.type === 'USER') {
    const creatorId = keyword.createdBy?._id ? String(keyword.createdBy._id) : (keyword.createdBy ? String(keyword.createdBy) : null);

    if (keyword.scope === 'GLOBAL' || keyword.createdByModel === 'Admin' || !keyword.createdBy) {
      throw new AppError('Cannot edit global or admin-created keywords', 403, 'FORBIDDEN');
    }

    if (keyword.scope === 'TEAM') {
      const keywordTeamId = keyword.team?._id ? String(keyword.team._id) : (keyword.team ? String(keyword.team) : null);
      const actorTeamId = actor.teamMembership?.teamId ? String(actor.teamMembership.teamId) : null;

      if (!actorTeamId || keywordTeamId !== actorTeamId) {
        throw new AppError('Active team membership required to edit team keywords', 403, 'FORBIDDEN');
      }

      if (creatorId !== String(actor.id)) {
        throw new AppError('You can only edit keywords you personally created', 403, 'FORBIDDEN');
      }
    } else if (keyword.scope === 'INDIVIDUAL') {
      if (creatorId !== String(actor.id)) {
        throw new AppError('You can only edit keywords you personally created', 403, 'FORBIDDEN');
      }
    }
  }

  const normalizedPayload = normalizeKeywordPayload(payload);

  await validateCategoryAndSubcategory(normalizedPayload.category, normalizedPayload.subcategory, actor);

  let duplicateScopeFilter = {};
  if (keyword.scope === 'TEAM') {
    duplicateScopeFilter = { scope: 'TEAM', team: keyword.team?._id || keyword.team };
  } else if (keyword.scope === 'INDIVIDUAL') {
    duplicateScopeFilter = { scope: 'INDIVIDUAL', createdBy: keyword.createdBy?._id || keyword.createdBy };
  } else {
    duplicateScopeFilter = { $or: [{ scope: 'GLOBAL' }, { scope: { $exists: false } }] };
  }

  const slugChanged = normalizedPayload.slug !== keyword.slug;
  const subcategoryChanged = String(normalizedPayload.subcategory) !== String(keyword.subcategory?._id || keyword.subcategory);
  const nameChanged = normalizedPayload.name !== keyword.name;
  const typeChanged = normalizedPayload.keywordType !== keyword.keywordType;

  if (slugChanged || subcategoryChanged) {
    const existingSlug = await findKeywordBySubcategoryAndSlug(
      normalizedPayload.subcategory,
      normalizedPayload.slug,
      duplicateScopeFilter
    );

    if (existingSlug && String(existingSlug._id) !== String(keyword._id)) {
      throw new AppError('Keyword slug already exists in this scope', 409, 'KEYWORD_SLUG_EXISTS');
    }
  }

  if (nameChanged || subcategoryChanged || typeChanged) {
    const existingName = await findKeywordBySubcategoryAndNameAndType(
      normalizedPayload.subcategory,
      normalizedPayload.name,
      normalizedPayload.keywordType,
      duplicateScopeFilter
    );

    if (existingName && String(existingName._id) !== String(keyword._id)) {
      throw new AppError('Keyword with this name and type already exists in this scope', 409, 'KEYWORD_NAME_EXISTS');
    }
  }

  const updated = await updateKeywordRecord(keywordId, normalizedPayload);
  return formatKeywordWithPermissions(updated, actor);
};

export const deleteKeyword = async (keywordId, actor) => {
  if (!actor) {
    throw new AppError('Authentication required', 401, 'AUTHENTICATION_REQUIRED');
  }

  const keyword = await findKeywordById(keywordId);

  if (!keyword) {
    throw new AppError('Keyword not found', 404, 'KEYWORD_NOT_FOUND');
  }

  if (actor.type === 'USER') {
    const creatorId = keyword.createdBy?._id ? String(keyword.createdBy._id) : (keyword.createdBy ? String(keyword.createdBy) : null);

    if (keyword.scope === 'GLOBAL' || keyword.createdByModel === 'Admin' || !keyword.createdBy) {
      throw new AppError('Cannot delete global or admin-created keywords', 403, 'FORBIDDEN');
    }

    if (keyword.scope === 'TEAM') {
      const keywordTeamId = keyword.team?._id ? String(keyword.team._id) : (keyword.team ? String(keyword.team) : null);
      const actorTeamId = actor.teamMembership?.teamId ? String(actor.teamMembership.teamId) : null;

      if (!actorTeamId || keywordTeamId !== actorTeamId) {
        throw new AppError('Active team membership required to delete team keywords', 403, 'FORBIDDEN');
      }

      if (creatorId !== String(actor.id)) {
        throw new AppError('You can only delete keywords you personally created', 403, 'FORBIDDEN');
      }
    } else if (keyword.scope === 'INDIVIDUAL') {
      if (creatorId !== String(actor.id)) {
        throw new AppError('You can only delete keywords you personally created', 403, 'FORBIDDEN');
      }
    }
  }

  const inUseCount = await Blog.countDocuments({
    $or: [
      { primaryKeywords: keywordId },
      { secondaryKeywords: keywordId }
    ]
  });

  if (inUseCount > 0) {
    throw new AppError('Cannot delete keyword: it is referenced by existing blog posts', 400, 'KEYWORD_IN_USE');
  }

  await deleteKeywordRecord(keywordId);
  return { success: true };
};
