import AppError from '../utils/AppError.js';
import Blog from '../models/Blog.js';
import Subcategory from '../models/Subcategory.js';
import Keyword from '../models/Keyword.js';
import {
  createCategoryRecord,
  deleteCategoryRecord,
  findCategories,
  findCategoryById,
  findCategoryByName,
  findCategoryBySlug,
  updateCategoryRecord
} from '../repositories/categoryRepository.js';

const generateSlug = (text) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const normalizeCategoryPayload = (payload) => {
  const name = payload.name.trim();
  const slug = payload.slug?.trim() ? payload.slug.trim().toLowerCase() : generateSlug(name);
  return {
    name,
    slug,
    description: payload.description?.trim() || ''
  };
};

const formatCategoryWithPermissions = (category, actor) => {
  const catObj = category.toObject ? category.toObject() : { ...category };
  const creatorId = catObj.createdBy?._id ? String(catObj.createdBy._id) : (catObj.createdBy ? String(catObj.createdBy) : null);
  const actorId = actor?.id ? String(actor.id) : null;
  const isOwner = Boolean(actorId && creatorId && actorId === creatorId);
  const isAdmin = actor?.type === 'ADMIN';

  let canEdit = false;
  let canDelete = false;

  if (isAdmin) {
    canEdit = true;
    canDelete = true;
  } else if (isOwner) {
    if (catObj.scope === 'TEAM') {
      const categoryTeamId = catObj.team?._id ? String(catObj.team._id) : (catObj.team ? String(catObj.team) : null);
      const actorTeamId = actor?.teamMembership?.teamId ? String(actor.teamMembership.teamId) : null;
      if (categoryTeamId && actorTeamId && categoryTeamId === actorTeamId) {
        canEdit = true;
        canDelete = true;
      }
    } else if (catObj.scope === 'INDIVIDUAL') {
      canEdit = true;
      canDelete = true;
    }
  }

  return {
    ...catObj,
    isOwner,
    canEdit,
    canDelete
  };
};

export const getCategories = async (actor = null) => {
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

  const categories = await findCategories(filter);
  return categories.map((cat) => formatCategoryWithPermissions(cat, actor));
};

export const getCategoryById = async (categoryId, actor = null) => {
  const category = await findCategoryById(categoryId);

  if (!category) {
    throw new AppError('Category not found', 404, 'CATEGORY_NOT_FOUND');
  }

  if (actor?.type === 'USER') {
    const creatorId = category.createdBy?._id ? String(category.createdBy._id) : (category.createdBy ? String(category.createdBy) : null);
    const categoryTeamId = category.team?._id ? String(category.team._id) : (category.team ? String(category.team) : null);
    const actorTeamId = actor.teamMembership?.teamId ? String(actor.teamMembership.teamId) : null;

    if (category.scope === 'TEAM' && categoryTeamId !== actorTeamId) {
      throw new AppError('Category not found or unauthorized', 403, 'FORBIDDEN');
    }

    if (category.scope === 'INDIVIDUAL' && creatorId !== String(actor.id)) {
      throw new AppError('Category not found or unauthorized', 403, 'FORBIDDEN');
    }
  }

  return formatCategoryWithPermissions(category, actor);
};

export const createCategory = async (payload, actor) => {
  if (!actor) {
    throw new AppError('Authentication required', 401, 'AUTHENTICATION_REQUIRED');
  }

  const normalizedPayload = normalizeCategoryPayload(payload);
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

  const existingCategoryBySlug = await findCategoryBySlug(normalizedPayload.slug, duplicateScopeFilter);
  if (existingCategoryBySlug) {
    throw new AppError('Category slug already exists in this scope', 409, 'CATEGORY_SLUG_EXISTS');
  }

  const existingCategoryByName = await findCategoryByName(normalizedPayload.name, duplicateScopeFilter);
  if (existingCategoryByName) {
    throw new AppError('Category with this name already exists in this scope', 409, 'CATEGORY_NAME_EXISTS');
  }

  const category = await createCategoryRecord({
    ...normalizedPayload,
    scope,
    createdBy,
    createdByModel,
    team
  });

  const populated = await findCategoryById(category._id);
  return formatCategoryWithPermissions(populated, actor);
};

export const updateCategory = async (categoryId, payload, actor) => {
  if (!actor) {
    throw new AppError('Authentication required', 401, 'AUTHENTICATION_REQUIRED');
  }

  const category = await findCategoryById(categoryId);

  if (!category) {
    throw new AppError('Category not found', 404, 'CATEGORY_NOT_FOUND');
  }

  // Permission checks
  if (actor.type === 'USER') {
    const creatorId = category.createdBy?._id ? String(category.createdBy._id) : (category.createdBy ? String(category.createdBy) : null);

    if (category.scope === 'GLOBAL' || category.createdByModel === 'Admin' || !category.createdBy) {
      throw new AppError('Cannot edit global or admin-created categories', 403, 'FORBIDDEN');
    }

    if (category.scope === 'TEAM') {
      const categoryTeamId = category.team?._id ? String(category.team._id) : (category.team ? String(category.team) : null);
      const actorTeamId = actor.teamMembership?.teamId ? String(actor.teamMembership.teamId) : null;

      if (!actorTeamId || categoryTeamId !== actorTeamId) {
        throw new AppError('Active team membership required to edit team categories', 403, 'FORBIDDEN');
      }

      if (creatorId !== String(actor.id)) {
        throw new AppError('You can only edit categories you personally created', 403, 'FORBIDDEN');
      }
    } else if (category.scope === 'INDIVIDUAL') {
      if (creatorId !== String(actor.id)) {
        throw new AppError('You can only edit categories you personally created', 403, 'FORBIDDEN');
      }
    }
  }

  const normalizedPayload = normalizeCategoryPayload(payload);

  let duplicateScopeFilter = {};
  if (category.scope === 'TEAM') {
    duplicateScopeFilter = { scope: 'TEAM', team: category.team?._id || category.team };
  } else if (category.scope === 'INDIVIDUAL') {
    duplicateScopeFilter = { scope: 'INDIVIDUAL', createdBy: category.createdBy?._id || category.createdBy };
  } else {
    duplicateScopeFilter = { $or: [{ scope: 'GLOBAL' }, { scope: { $exists: false } }] };
  }

  if (normalizedPayload.slug !== category.slug) {
    const existingCategory = await findCategoryBySlug(normalizedPayload.slug, duplicateScopeFilter);

    if (existingCategory && String(existingCategory._id) !== String(category._id)) {
      throw new AppError('Category slug already exists in this scope', 409, 'CATEGORY_SLUG_EXISTS');
    }
  }

  if (normalizedPayload.name !== category.name) {
    const existingCategory = await findCategoryByName(normalizedPayload.name, duplicateScopeFilter);

    if (existingCategory && String(existingCategory._id) !== String(category._id)) {
      throw new AppError('Category with this name already exists in this scope', 409, 'CATEGORY_NAME_EXISTS');
    }
  }

  const updated = await updateCategoryRecord(categoryId, normalizedPayload);
  return formatCategoryWithPermissions(updated, actor);
};

export const deleteCategory = async (categoryId, actor) => {
  if (!actor) {
    throw new AppError('Authentication required', 401, 'AUTHENTICATION_REQUIRED');
  }

  const category = await findCategoryById(categoryId);

  if (!category) {
    throw new AppError('Category not found', 404, 'CATEGORY_NOT_FOUND');
  }

  // Permission checks
  if (actor.type === 'USER') {
    const creatorId = category.createdBy?._id ? String(category.createdBy._id) : (category.createdBy ? String(category.createdBy) : null);

    if (category.scope === 'GLOBAL' || category.createdByModel === 'Admin' || !category.createdBy) {
      throw new AppError('Cannot delete global or admin-created categories', 403, 'FORBIDDEN');
    }

    if (category.scope === 'TEAM') {
      const categoryTeamId = category.team?._id ? String(category.team._id) : (category.team ? String(category.team) : null);
      const actorTeamId = actor.teamMembership?.teamId ? String(actor.teamMembership.teamId) : null;

      if (!actorTeamId || categoryTeamId !== actorTeamId) {
        throw new AppError('Active team membership required to delete team categories', 403, 'FORBIDDEN');
      }

      if (creatorId !== String(actor.id)) {
        throw new AppError('You can only delete categories you personally created', 403, 'FORBIDDEN');
      }
    } else if (category.scope === 'INDIVIDUAL') {
      if (creatorId !== String(actor.id)) {
        throw new AppError('You can only delete categories you personally created', 403, 'FORBIDDEN');
      }
    }
  }

  // Dependent check: Do blogs exist using this category?
  const blogInUse = await Blog.exists({ category: categoryId });
  if (blogInUse) {
    throw new AppError('Cannot delete category because it is currently used by one or more blogs', 400, 'CATEGORY_IN_USE');
  }

  // Cascade cleanup dependent subcategories and keywords
  await Keyword.deleteMany({ category: categoryId });
  await Subcategory.deleteMany({ category: categoryId });
  await deleteCategoryRecord(categoryId);

  return category;
};
