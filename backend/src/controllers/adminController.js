import { adminLogin } from '../services/adminService.js';
import { updateUserStatus, deleteUser, deleteTeam } from '../services/adminManagementService.js';

export const adminLoginController = async (req, res, next) => {
  try {
    const result = await adminLogin(req.body);

    return res.status(200).json({
      success: true,
      message: 'Admin login successful',
      data: result,
      error: null
    });
  } catch (error) {
    return next(error);
  }
};

export const adminMeController = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Admin profile loaded',
    data: {
      admin: req.admin
    },
    error: null
  });
};

export const updateUserStatusController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    const user = await updateUserStatus(id, isActive);

    return res.status(200).json({
      success: true,
      message: `User status updated to ${user.isActive ? 'Active' : 'Inactive'}`,
      data: { user },
      error: null
    });
  } catch (error) {
    return next(error);
  }
};

export const deleteUserController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await deleteUser(id);

    return res.status(200).json({
      success: true,
      message: result.message,
      data: null,
      error: null
    });
  } catch (error) {
    return next(error);
  }
};

export const deleteTeamController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await deleteTeam(id);

    return res.status(200).json({
      success: true,
      message: result.message,
      data: null,
      error: null
    });
  } catch (error) {
    return next(error);
  }
};


