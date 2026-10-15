import {
  createRole,
  deleteRole,
  getRoleById,
  getRoles,
  updateRole
} from '../services/roleService.js';

export const listRolesController = async (req, res, next) => {
  try {
    const roles = await getRoles();

    return res.status(200).json({
      success: true,
      message: 'Roles fetched successfully',
      data: { roles },
      error: null
    });
  } catch (error) {
    return next(error);
  }
};

export const getRoleByIdController = async (req, res, next) => {
  try {
    const role = await getRoleById(req.params.id);

    return res.status(200).json({
      success: true,
      message: 'Role fetched successfully',
      data: { role },
      error: null
    });
  } catch (error) {
    return next(error);
  }
};

export const createRoleController = async (req, res, next) => {
  try {
    const role = await createRole(req.body);

    return res.status(201).json({
      success: true,
      message: 'Role created successfully',
      data: { role },
      error: null
    });
  } catch (error) {
    return next(error);
  }
};

export const updateRoleController = async (req, res, next) => {
  try {
    const role = await updateRole(req.params.id, req.body);

    return res.status(200).json({
      success: true,
      message: 'Role updated successfully',
      data: { role },
      error: null
    });
  } catch (error) {
    return next(error);
  }
};

export const deleteRoleController = async (req, res, next) => {
  try {
    await deleteRole(req.params.id);

    return res.status(200).json({
      success: true,
      message: 'Role deleted successfully',
      data: null,
      error: null
    });
  } catch (error) {
    return next(error);
  }
};
