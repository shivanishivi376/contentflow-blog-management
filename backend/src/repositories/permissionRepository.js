import Permission from '../models/Permission.js';

export const findPermissions = async () => Permission.find({}).sort({ code: 1 });

export const findPermissionById = async (permissionId) => Permission.findById(permissionId);

export const findPermissionByCode = async (code) =>
  Permission.findOne({ code: code.trim().toUpperCase() });

export const createPermissionRecord = async (payload) => Permission.create(payload);

export const updatePermissionRecord = async (permissionId, payload) =>
  Permission.findByIdAndUpdate(permissionId, payload, {
    new: true,
    runValidators: true
  });

export const deletePermissionRecord = async (permissionId) =>
  Permission.findByIdAndDelete(permissionId);

export const findPermissionsByIds = async (permissionIds) =>
  Permission.find({ _id: { $in: permissionIds } });
