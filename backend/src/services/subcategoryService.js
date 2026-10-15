import AppError from '../utils/AppError.js';
import Blog from '../models/Blog.js';
import Keyword from '../models/Keyword.js';
import { findCategoryById } from '../repositories/categoryRepository.js';
import {
  createSubcategoryRecord,
  deleteSubcategoryRecord,
  findSubcategories,
  findSubcategoryByCategoryAndName,
  findSubcategoryByCategoryAndSlug,
  findSubcategoryById,
  updateSubcategoryRecord
} from '../repositories/subcategoryRepository.js';

const generateSlug = (text) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const normalizeSubcategoryPayload = (payload) => {
  const name = payload.name.trim();
  const slug = payload.slug?.trim() ? payload.slug.trim().toLowerCase() : generateSlug(name);
  return {
    category: payload.categoryId.trim(),
    name,
    slug,
    description: payload.description?.trim() || ''
  };
};

const formatSubcategoryWithPermissions = (subcategory, actor) => {
  const subObj = subcategory.toObject ? subcategory.toObject() : { ...subcategory };
  const creatorId = subObj.createdBy?._id ? String(subObj.createdBy._id) : (subObj.createdBy ? String(subObj.createdBy) : null);
  const actorId = actor?.id ? String(actor.id) : null;
  const isOwner = Boolean(actorId && creatorId && actorId === creatorId);
  const isAdmin = actor?.type === 'ADMIN';

  let canEdit = false;
  let canDelete = false;

  if (isAdmin) {
    canEdit = true;
    canDelete = true;
  } else if (isOwner) {
    if (subObj.scope === 'TEAM') {
      const subcategoryTeamId = subObj.team?._id ? String(subObj.team._id) : (subObj.team ? String(subObj.team) : null);
      const actorTeamId = actor?.teamMembership?.teamId ? String(actor.teamMembership.teamId) : null;
      if (subcategoryTeamId && actorTeamId && subcategoryTeamId === actorTeamId) {
        canEdit = true;
        canDelete = true;
      }
    } else if (subObj.scope === 'INDIVIDUAL') {
      canEdit = true;
      canDelete = true;
    }
  }

  return {
    ...subObj,
    isOwner,
    canEdit,
    canDelete
  };
};

const validateCategoryAccess = async (categoryId, actor) => {
  const category = await findCategoryById(categoryId);

  if (!category || !category.isActive) {
    throw new AppError('Category not found', 404, 'CATEGORY_NOT_FOUND');
  }

  if (actor?.type === 'USER') {
    const creatorId = category.createdBy?._id ? String(category.createdBy._id) : (category.createdBy ? String(category.createdBy) : null);
    const categoryTeamId = category.team?._id ? String(category.team._id) : (category.team ? String(category.team) : null);
    const actorTeamId = actor.teamMembership?.teamId ? String(actor.teamMembership.teamId) : null;

    if (category.scope === 'TEAM') {
      if (!actorTeamId || categoryTeamId !== actorTeamId) {
        throw new AppError('Cannot use category from another team', 403, 'FORBIDDEN');
      }
    } else if (category.scope === 'INDIVIDUAL') {
      if (creatorId !== String(actor.id)) {
        throw new AppError('Cannot use category created by another user', 403, 'FORBIDDEN');
      }
    }
  }

  return category;
};

export const getSubcategories = async (actor = null, query = {}) => {
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

  if (query.categoryId) {
    filter.category = query.categoryId;
  }

  const subcategories = await findSubcategories(filter);
  return subcategories.map((sub) => formatSubcategoryWithPermissions(sub, actor));
};

export const getSubcategoryById = async (subcategoryId, actor = null) => {
  const subcategory = await findSubcategoryById(subcategoryId);

  if (!subcategory) {
    throw new AppError('Subcategory not found', 404, 'SUBCATEGORY_NOT_FOUND');
  }

  if (actor?.type === 'USER') {
    const creatorId = subcategory.createdBy?._id ? String(subcategory.createdBy._id) : (subcategory.createdBy ? String(subcategory.createdBy) : null);
    const subcategoryTeamId = subcategory.team?._id ? String(subcategory.team._id) : (subcategory.team ? String(subcategory.team) : null);
    const actorTeamId = actor.teamMembership?.teamId ? String(actor.teamMembership.teamId) : null;

    if (subcategory.scope === 'TEAM' && subcategoryTeamId !== actorTeamId) {
      throw new AppError('Subcategory not found or unauthorized', 403, 'FORBIDDEN');
    }

    if (subcategory.scope === 'INDIVIDUAL' && creatorId !== String(actor.id)) {
      throw new AppError('Subcategory not found or unauthorized', 403, 'FORBIDDEN');
    }
  }

  return formatSubcategoryWithPermissions(subcategory, actor);
};

export const createSubcategory = async (payload, actor) => {
  if (!actor) {
    throw new AppError('Authentication required', 401, 'AUTHENTICATION_REQUIRED');
  }

  const normalizedPayload = normalizeSubcategoryPayload(payload);
  const parentCategory = await validateCategoryAccess(normalizedPayload.category, actor);

  let scope = 'GLOBAL';
  let createdBy = actor.id;
  let createdByModel = 'Admin';
  let team = null;
  let duplicateScopeFilter = {};

  if (actor.type === 'ADMIN') {
    scope = parentCategory.scope || 'GLOBAL';
    team = parentCategory.team ? (parentCategory.team._id || parentCategory.team) : null;
    createdBy = actor.id;
    createdByModel = 'Admin';
    duplicateScopeFilter = scope === 'GLOBAL' ? { $or: [{ scope: 'GLOBAL' }, { scope: { $exists: false } }] } : { scope, team };
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

  const existingSlug = await findSubcategoryByCategoryAndSlug(
    normalizedPayload.category,
    normalizedPayload.slug,
    duplicateScopeFilter
  );

  if (existingSlug) {
    throw new AppError('Subcategory slug already exists in this category', 409, 'SUBCATEGORY_SLUG_EXISTS');
  }

  const existingName = await findSubcategoryByCategoryAndName(
    normalizedPayload.category,
    normalizedPayload.name,
    duplicateScopeFilter
  );

  if (existingName) {
    throw new AppError('Subcategory name already exists in this category', 409, 'SUBCATEGORY_NAME_EXISTS');
  }

  const subcategory = await createSubcategoryRecord({
    ...normalizedPayload,
    scope,
    createdBy,
    createdByModel,
    team
  });

  const populated = await findSubcategoryById(subcategory._id);
  return formatSubcategoryWithPermissions(populated, actor);
};

export const updateSubcategory = async (subcategoryId, payload, actor) => {
  if (!actor) {
    throw new AppError('Authentication required', 401, 'AUTHENTICATION_REQUIRED');
  }

  const subcategory = await findSubcategoryById(subcategoryId);

  if (!subcategory) {
    throw new AppError('Subcategory not found', 404, 'SUBCATEGORY_NOT_FOUND');
  }

  // Permission checks
  if (actor.type === 'USER') {
    const creatorId = subcategory.createdBy?._id ? String(subcategory.createdBy._id) : (subcategory.createdBy ? String(subcategory.createdBy) : null);

    if (subcategory.scope === 'GLOBAL' || subcategory.createdByModel === 'Admin' || !subcategory.createdBy) {
      throw new AppError('Cannot edit global or admin-created subcategories', 403, 'FORBIDDEN');
    }

    if (subcategory.scope === 'TEAM') {
      const subcategoryTeamId = subcategory.team?._id ? String(subcategory.team._id) : (subcategory.team ? String(subcategory.team) : null);
      const actorTeamId = actor.teamMembership?.teamId ? String(actor.teamMembership.teamId) : null;

      if (!actorTeamId || subcategoryTeamId !== actorTeamId) {
        throw new AppError('Active team membership required to edit team subcategories', 403, 'FORBIDDEN');
      }

      if (creatorId !== String(actor.id)) {
        throw new AppError('You can only edit subcategories you personally created', 403, 'FORBIDDEN');
      }
    } else if (subcategory.scope === 'INDIVIDUAL') {
      if (creatorId !== String(actor.id)) {
        throw new AppError('You can only edit subcategories you personally created', 403, 'FORBIDDEN');
      }
    }
  }

  const normalizedPayload = normalizeSubcategoryPayload(payload);
  await validateCategoryAccess(normalizedPayload.category, actor);

  let duplicateScopeFilter = {};
  if (subcategory.scope === 'TEAM') {
    duplicateScopeFilter = { scope: 'TEAM', team: subcategory.team?._id || subcategory.team };
  } else if (subcategory.scope === 'INDIVIDUAL') {
    duplicateScopeFilter = { scope: 'INDIVIDUAL', createdBy: subcategory.createdBy?._id || subcategory.createdBy };
  } else {
    duplicateScopeFilter = { $or: [{ scope: 'GLOBAL' }, { scope: { $exists: false } }] };
  }

  const slugChanged = normalizedPayload.slug !== subcategory.slug;
  const categoryChanged = String(normalizedPayload.category) !== String(subcategory.category?._id || subcategory.category);
  const nameChanged = normalizedPayload.name !== subcategory.name;

  if (slugChanged || categoryChanged) {
    const existingSlug = await findSubcategoryByCategoryAndSlug(
      normalizedPayload.category,
      normalizedPayload.slug,
      duplicateScopeFilter
    );

    if (existingSlug && String(existingSlug._id) !== String(subcategory._id)) {
      throw new AppError('Subcategory slug already exists in this category', 409, 'SUBCATEGORY_SLUG_EXISTS');
    }
  }

  if (nameChanged || categoryChanged) {
    const existingName = await findSubcategoryByCategoryAndName(
      normalizedPayload.category,
      normalizedPayload.name,
      duplicateScopeFilter
    );

    if (existingName && String(existingName._id) !== String(subcategory._id)) {
      throw new AppError('Subcategory name already exists in this category', 409, 'SUBCATEGORY_NAME_EXISTS');
    }
  }

  const updated = await updateSubcategoryRecord(subcategoryId, normalizedPayload);
  return formatSubcategoryWithPermissions(updated, actor);
};

export const deleteSubcategory = async (subcategoryId, actor) => {
  if (!actor) {
    throw new AppError('Authentication required', 401, 'AUTHENTICATION_REQUIRED');
  }

  const subcategory = await findSubcategoryById(subcategoryId);

  if (!subcategory) {
    throw new AppError('Subcategory not found', 404, 'SUBCATEGORY_NOT_FOUND');
  }

  // Permission checks
  if (actor.type === 'USER') {
    const creatorId = subcategory.createdBy?._id ? String(subcategory.createdBy._id) : (subcategory.createdBy ? String(subcategory.createdBy) : null);

    if (subcategory.scope === 'GLOBAL' || subcategory.createdByModel === 'Admin' || !subcategory.createdBy) {
      throw new AppError('Cannot delete global or admin-created subcategories', 403, 'FORBIDDEN');
    }

    if (subcategory.scope === 'TEAM') {
      const subcategoryTeamId = subcategory.team?._id ? String(subcategory.team._id) : (subcategory.team ? String(subcategory.team) : null);
      const actorTeamId = actor.teamMembership?.teamId ? String(actor.teamMembership.teamId) : null;

      if (!actorTeamId || subcategoryTeamId !== actorTeamId) {
        throw new AppError('Active team membership required to delete team subcategories', 403, 'FORBIDDEN');
      }

      if (creatorId !== String(actor.id)) {
        throw new AppError('You can only delete subcategories you personally created', 403, 'FORBIDDEN');
      }
    } else if (subcategory.scope === 'INDIVIDUAL') {
      if (creatorId !== String(actor.id)) {
        throw new AppError('You can only delete subcategories you personally created', 403, 'FORBIDDEN');
      }
    }
  }

  // Dependent check: Do blogs exist using this subcategory?
  const blogInUse = await Blog.exists({ subcategory: subcategoryId });
  if (blogInUse) {
    throw new AppError('Cannot delete subcategory because it is currently used by one or more blogs', 400, 'SUBCATEGORY_IN_USE');
  }

  // Cascade cleanup keywords
  await Keyword.deleteMany({ subcategory: subcategoryId });
  await deleteSubcategoryRecord(subcategoryId);

  return subcategory;
};
