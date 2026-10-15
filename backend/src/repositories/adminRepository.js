import Admin from '../models/Admin.js';

export const findAdminByEmailWithPassword = async (email) =>
  Admin.findOne({ email: email.toLowerCase().trim(), isActive: true }).select('+password');

export const findMainAdmin = async () => Admin.findOne({ isMainAdmin: true });

export const findAdminById = async (adminId) => Admin.findById(adminId);

export const toSafeAdmin = (admin) => ({
  id: admin._id,
  name: admin.name,
  email: admin.email,
  profileImage: admin.profileImage,
  isMainAdmin: admin.isMainAdmin,
  isActive: admin.isActive,
  createdAt: admin.createdAt,
  updatedAt: admin.updatedAt
});
