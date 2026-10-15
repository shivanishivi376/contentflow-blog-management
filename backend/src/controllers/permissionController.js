import {
  createPermission,
  deletePermission,
  getPermissionById,
  getPermissions,
  updatePermission
} from '../services/permissionService.js';

export const listPermissionsController = async (req, res, next) => {
  try {
    const permissions = await getPermissions();

    return res.status(200).json({
      success: true,
      message: 'Permissions fetched successfully',
      data: { permissions },
      error: null
    });
  } catch (error) {
    return next(error);
  }
};

export const getPermissionByIdController = async (req, res, next) => {
  try {
    const permission = await getPermissionById(req.params.id);

    return res.status(200).json({
      success: true,
      message: 'Permission fetched successfully',
      data: { permission },
      error: null
    });
  } catch (error) {
    return next(error);
  }
};

export const createPermissionController = async (req, res, next) => {
  try {
    const permission = await createPermission(req.body);

    return res.status(201).json({
      success: true,
      message: 'Permission created successfully',
      data: { permission },
      error: null
    });
  } catch (error) {
    return next(error);
  }
};

export const updatePermissionController = async (req, res, next) => {
  try {
    const permission = await updatePermission(req.params.id, req.body);

    return res.status(200).json({
      success: true,
      message: 'Permission updated successfully',
      data: { permission },
      error: null
    });
  } catch (error) {
    return next(error);
  }
};

export const deletePermissionController = async (req, res, next) => {
  try {
    await deletePermission(req.params.id);

    return res.status(200).json({
      success: true,
      message: 'Permission deleted successfully',
      data: null,
      error: null
    });
  } catch (error) {
    return next(error);
  }
};
