import AppError from '../utils/AppError.js';
import { comparePassword } from '../utils/password.js';
import { createAuthTokens } from '../utils/token.js';
import { findAdminByEmailWithPassword, toSafeAdmin } from '../repositories/adminRepository.js';

export const adminLogin = async (payload) => {
  const email = payload.email.trim().toLowerCase();
  const admin = await findAdminByEmailWithPassword(email);

  if (!admin) {
    throw new AppError('Invalid email or password', 401, 'INVALID_ADMIN_CREDENTIALS');
  }

  const isPasswordValid = await comparePassword(payload.password, admin.password);

  if (!isPasswordValid) {
    throw new AppError('Invalid email or password', 401, 'INVALID_ADMIN_CREDENTIALS');
  }

  const { accessToken } = createAuthTokens({
    adminId: String(admin._id),
    role: 'ADMIN'
  });

  return {
    admin: toSafeAdmin(admin),
    accessToken
  };
};
