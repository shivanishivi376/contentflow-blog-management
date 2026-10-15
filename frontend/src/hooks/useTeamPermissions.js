import { useSelector } from 'react-redux';
import { ROLE_PERMISSIONS, TEAM_PERMISSIONS } from '../constants/permissions.js';

export const useTeamPermissions = () => {
  const user = useSelector((state) => state.auth?.user);

  const accountType = user?.accountType || 'INDIVIDUAL';
  const isTeam = accountType === 'TEAM';
  const isIndividual = accountType === 'INDIVIDUAL';
  const isOwner = Boolean(user?.isOwner);
  const workflowRole = user?.workflowRole || null;

  const hasPermission = (permissionCode) => {
    if (isIndividual) {
      return true; // Individual users have full access to their own workflow
    }

    // Team Owner can view, create blogs, edit basic details, and assign roles irrespective of workflowRole
    if (isOwner && (
      permissionCode === TEAM_PERMISSIONS.BLOG_VIEW ||
      permissionCode === TEAM_PERMISSIONS.BLOG_CREATE ||
      permissionCode === TEAM_PERMISSIONS.BLOG_BASIC_DETAILS ||
      permissionCode === TEAM_PERMISSIONS.BLOG_ASSIGN
    )) {
      return true;
    }

    if (!workflowRole) {
      return false;
    }

    const permissions = ROLE_PERMISSIONS[workflowRole] || [];
    return permissions.includes(permissionCode);
  };

  return {
    isTeam,
    isIndividual,
    isOwner,
    workflowRole,
    hasPermission,
    user
  };
};



export default useTeamPermissions;
