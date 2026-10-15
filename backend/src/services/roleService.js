import AppError from '../utils/AppError.js';
import { findPermissionsByIds } from '../repositories/permissionRepository.js';
import {
  createRoleRecord,
  deleteRoleRecord,
  findRoleById,
  findRoleByName,
  findRoleBySlug,
  findRoles,
  updateRoleRecord
} from '../repositories/roleRepository.js';

const normalizeRolePayload = (payload) => ({
  name: payload.name.trim(),
  slug: payload.slug.trim().toLowerCase(),
  description: payload.description?.trim() || ''
});

const resolvePermissionIds = async (permissionIds = []) => {
  if (!permissionIds.length) {
    return [];
  }

  const permissions = await findPermissionsByIds(permissionIds);

  if (permissions.length !== permissionIds.length) {
    throw new AppError('One or more permissions are invalid', 400, 'INVALID_PERMISSIONS');
  }

  return permissions.map((permission) => permission._id);
};

export const getRoles = async () => findRoles();

export const getRoleById = async (roleId) => {
  const role = await findRoleById(roleId);

  if (!role) {
    throw new AppError('Role not found', 404, 'ROLE_NOT_FOUND');
  }

  return role;
};

export const createRole = async (payload) => {
  const normalizedPayload = normalizeRolePayload(payload);
  const permissionIds = await resolvePermissionIds(payload.permissionIds || []);

  const existingBySlug = await findRoleBySlug(normalizedPayload.slug);

  if (existingBySlug) {
    throw new AppError('Role slug already exists', 409, 'ROLE_SLUG_EXISTS');
  }

  const existingByName = await findRoleByName(normalizedPayload.name);

  if (existingByName) {
    throw new AppError('Role name already exists', 409, 'ROLE_NAME_EXISTS');
  }

  return createRoleRecord({
    ...normalizedPayload,
    permissions: permissionIds,
    isDefault: false
  });
};

export const updateRole = async (roleId, payload) => {
  const role = await findRoleById(roleId);

  if (!role) {
    throw new AppError('Role not found', 404, 'ROLE_NOT_FOUND');
  }

  const normalizedPayload = normalizeRolePayload(payload);
  const permissionIds = await resolvePermissionIds(payload.permissionIds || []);

  if (normalizedPayload.slug !== role.slug) {
    const existingBySlug = await findRoleBySlug(normalizedPayload.slug);

    if (existingBySlug && String(existingBySlug._id) !== String(role._id)) {
      throw new AppError('Role slug already exists', 409, 'ROLE_SLUG_EXISTS');
    }
  }

  if (normalizedPayload.name !== role.name) {
    const existingByName = await findRoleByName(normalizedPayload.name);

    if (existingByName && String(existingByName._id) !== String(role._id)) {
      throw new AppError('Role name already exists', 409, 'ROLE_NAME_EXISTS');
    }
  }

  return updateRoleRecord(roleId, {
    ...normalizedPayload,
    permissions: permissionIds
  });
};

export const deleteRole = async (roleId) => {
  const role = await findRoleById(roleId);

  if (!role) {
    throw new AppError('Role not found', 404, 'ROLE_NOT_FOUND');
  }

  if (role.isDefault) {
    throw new AppError('Default roles cannot be deleted', 403, 'DEFAULT_ROLE_PROTECTED');
  }

  await deleteRoleRecord(roleId);
};
