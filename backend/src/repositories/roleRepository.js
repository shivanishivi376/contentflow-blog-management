import Role from '../models/Role.js';

export const findRoles = async () =>
  Role.find({}).populate('permissions').sort({ name: 1 });

export const findRoleById = async (roleId) => Role.findById(roleId).populate('permissions');

export const findRoleBySlug = async (slug) =>
  Role.findOne({ slug: slug.trim().toLowerCase() }).populate('permissions');

export const findRoleByName = async (name) => Role.findOne({ name: name.trim() });

export const createRoleRecord = async (payload) =>
  Role.create(payload).then((role) => role.populate('permissions'));

export const updateRoleRecord = async (roleId, payload) =>
  Role.findByIdAndUpdate(roleId, payload, {
    new: true,
    runValidators: true
  }).populate('permissions');

export const deleteRoleRecord = async (roleId) => Role.findByIdAndDelete(roleId);

export const countRolesUsingPermission = async (permissionId) =>
  Role.countDocuments({ permissions: permissionId });
