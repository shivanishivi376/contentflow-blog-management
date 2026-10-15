import AppError from '../utils/AppError.js';
import { TEAM_WORKFLOW_PERMISSIONS } from '../constants/permissions.js';
import Role from '../models/Role.js';

const normalizePermissionCode = (value) => {
  if (!value) {
    return null;
  }

  if (typeof value === 'string') {
    return value.trim().toUpperCase();
  }

  if (typeof value === 'object') {
    return (
      value.code?.trim().toUpperCase() ||
      value.name?.trim().toUpperCase() ||
      value.slug?.trim().toUpperCase() ||
      null
    );
  }

  return null;
};

const collectPermissionCodes = (source) => {
  if (!source) {
    return [];
  }

  const directPermissions = Array.isArray(source.permissions) ? source.permissions : [];
  const rolePermissions = Array.isArray(source.role?.permissions) ? source.role.permissions : [];

  return [...directPermissions, ...rolePermissions]
    .map(normalizePermissionCode)
    .filter(Boolean);
};

const hasAnyRequiredPermission = (availablePermissions, requiredPermissions) =>
  requiredPermissions.some((permission) => availablePermissions.includes(permission));

const permissionMiddleware = (...requiredPermissions) => {
  const normalizedRequiredPermissions = requiredPermissions
    .flat()
    .map(normalizePermissionCode)
    .filter(Boolean);

  return (req, res, next) => {
    try {
      if (normalizedRequiredPermissions.length === 0) {
        return next();
      }

      const principal = req.user || req.admin || req.actor || null;

      if (!principal) {
        throw new AppError('Authentication required', 401, 'AUTHENTICATION_REQUIRED');
      }

      if (principal.isMainAdmin) {
        return next();
      }

      const availablePermissions = collectPermissionCodes(principal);

      if (!hasAnyRequiredPermission(availablePermissions, normalizedRequiredPermissions)) {
        throw new AppError('Forbidden', 403, 'FORBIDDEN');
      }

      return next();
    } catch (error) {
      return next(error);
    }
  };
};

export const teamPermissionMiddleware = (...requiredPermissions) => {
  const normalizedRequiredPermissions = requiredPermissions
    .flat()
    .map(normalizePermissionCode)
    .filter(Boolean);

  return async (req, res, next) => {
    try {
      if (normalizedRequiredPermissions.length === 0) {
        return next();
      }

      const user = req.user;

      if (!user) {
        throw new AppError('Authentication required', 401, 'AUTHENTICATION_REQUIRED');
      }

      // Individual users bypass team workflow permission restrictions
      if (user.accountType === 'INDIVIDUAL') {
        return next();
      }

      if (!req.teamMembership || !req.teamMembership.workflowRole) {
        throw new AppError('Forbidden: No active team membership', 403, 'FORBIDDEN');
      }

      // Team Owner can create blogs, edit basic details, view versions, restore versions, and publish approved blogs irrespective of workflowRole
      if (req.teamMembership?.isOwner) {
        const ownerAllowed = [
          'BLOG_CREATE',
          'BLOG_BASIC_DETAILS',
          'BLOG_VERSION_HISTORY',
          'BLOG_WRITE',
          'BLOG_PUBLISH',
          'BLOG_DEVTO_PUBLISH'
        ];
        if (normalizedRequiredPermissions.some((p) => ownerAllowed.includes(p))) {
          return next();
        }
      }

      let rolePermissions = TEAM_WORKFLOW_PERMISSIONS[req.teamMembership.workflowRole] || [];

      // Check dynamic DB role permissions if configured
      try {
        const dbRole = await Role.findOne({
          $or: [
            { name: req.teamMembership.workflowRole },
            { slug: req.teamMembership.workflowRole.toLowerCase() }
          ],
          isActive: true
        }).populate('permissions').lean();

        if (dbRole?.permissions?.length) {
          const dbPermissionCodes = dbRole.permissions
            .map((p) => p.code || p.name || p.slug)
            .filter(Boolean)
            .map(normalizePermissionCode);
          rolePermissions = Array.from(new Set([...rolePermissions, ...dbPermissionCodes]));
        }
      } catch {
        // Fall back gracefully to static permissions on DB errors or during unit tests
      }

      if (!hasAnyRequiredPermission(rolePermissions, normalizedRequiredPermissions)) {
        throw new AppError('Forbidden: Insufficient role permissions', 403, 'FORBIDDEN');
      }

      return next();
    } catch (error) {
      return next(error);
    }
  };
};

export default permissionMiddleware;

