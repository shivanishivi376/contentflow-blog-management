import AppError from '../utils/AppError.js';
import {
  createPermissionRecord,
  deletePermissionRecord,
  findPermissionByCode,
  findPermissionById,
  findPermissions,
  updatePermissionRecord
} from '../repositories/permissionRepository.js';
import { countRolesUsingPermission } from '../repositories/roleRepository.js';

const normalizePermissionPayload = (payload) => ({
  code: payload.code.trim().toUpperCase(),
  description: payload.description?.trim() || ''
});

export const getPermissions = async () => findPermissions();

export const getPermissionById = async (permissionId) => {
  const permission = await findPermissionById(permissionId);

  if (!permission) {
    throw new AppError('Permission not found', 404, 'PERMISSION_NOT_FOUND');
  }

  return permission;
};

export const createPermission = async (payload) => {
  const normalizedPayload = normalizePermissionPayload(payload);
  const existingPermission = await findPermissionByCode(normalizedPayload.code);

  if (existingPermission) {
    throw new AppError('Permission code already exists', 409, 'PERMISSION_CODE_EXISTS');
  }

  return createPermissionRecord(normalizedPayload);
};

export const updatePermission = async (permissionId, payload) => {
  const permission = await findPermissionById(permissionId);

  if (!permission) {
    throw new AppError('Permission not found', 404, 'PERMISSION_NOT_FOUND');
  }

  const normalizedPayload = normalizePermissionPayload(payload);

  if (normalizedPayload.code !== permission.code) {
    const existingPermission = await findPermissionByCode(normalizedPayload.code);

    if (existingPermission && String(existingPermission._id) !== String(permission._id)) {
      throw new AppError('Permission code already exists', 409, 'PERMISSION_CODE_EXISTS');
    }
  }

  return updatePermissionRecord(permissionId, normalizedPayload);
};

export const deletePermission = async (permissionId) => {
  const permission = await findPermissionById(permissionId);

  if (!permission) {
    throw new AppError('Permission not found', 404, 'PERMISSION_NOT_FOUND');
  }

  const roleCount = await countRolesUsingPermission(permissionId);

  if (roleCount > 0) {
    throw new AppError('Permission is assigned to one or more roles', 409, 'PERMISSION_IN_USE');
  }

  await deletePermissionRecord(permissionId);
};
