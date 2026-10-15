import User from '../models/User.js';
import AppError from '../utils/AppError.js';
import { comparePassword, hashPassword } from '../utils/password.js';
import { updateUserPasswordById } from '../repositories/userRepository.js';

export const getUserProfile = async (userId) => {
  const user = await User.findById(userId)
    .select('-password')
    .populate('interests', 'name slug')
    .populate('team', 'name slug')
    .lean();

  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  return user;
};

export const updateUserProfile = async (userId, data) => {
  const allowed = ['name', 'bio', 'profileImage', 'interests'];
  const updateData = {};

  for (const key of allowed) {
    if (data[key] !== undefined) {
      updateData[key] = data[key];
    }
  }

  const updated = await User.findByIdAndUpdate(userId, updateData, { new: true })
    .select('-password')
    .populate('interests', 'name slug')
    .populate('team', 'name slug')
    .lean();

  return updated;
};

export const updateUserPassword = async (userId, currentPassword, newPassword) => {
  if (!currentPassword || !newPassword) {
    throw new AppError('Current password and new password are required', 400, 'VALIDATION_ERROR');
  }

  if (typeof newPassword !== 'string' || newPassword.length < 8) {
    throw new AppError('New password must be at least 8 characters long', 400, 'VALIDATION_ERROR');
  }

  const user = await User.findById(userId).select('+password');
  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  const isMatch = await comparePassword(currentPassword, user.password);
  if (!isMatch) {
    throw new AppError('Current password is incorrect', 400, 'INVALID_CURRENT_PASSWORD');
  }

  const hashedPassword = await hashPassword(newPassword);
  await updateUserPasswordById(userId, hashedPassword);

  return { success: true };
};
