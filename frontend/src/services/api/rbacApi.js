import adminApiClient from './adminApiClient.js'

export const fetchPermissionsRequest = () => adminApiClient.get('/api/permissions')

export const createPermissionRequest = (payload) => adminApiClient.post('/api/permissions', payload)

export const updatePermissionRequest = (permissionId, payload) =>
  adminApiClient.patch(`/api/permissions/${permissionId}`, payload)

export const deletePermissionRequest = (permissionId) =>
  adminApiClient.delete(`/api/permissions/${permissionId}`)

export const fetchRolesRequest = () => adminApiClient.get('/api/roles')

export const createRoleRequest = (payload) => adminApiClient.post('/api/roles', payload)

export const updateRoleRequest = (roleId, payload) =>
  adminApiClient.patch(`/api/roles/${roleId}`, payload)

export const deleteRoleRequest = (roleId) => adminApiClient.delete(`/api/roles/${roleId}`)
