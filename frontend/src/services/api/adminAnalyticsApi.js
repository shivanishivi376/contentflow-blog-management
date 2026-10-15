import adminApiClient from './adminApiClient.js'

export const fetchAdminAnalyticsRequest = () => adminApiClient.get('/api/admin/analytics/overview')

export const fetchAdminUsersRequest = (params = {}) =>
  adminApiClient.get('/api/admin/users', { params })

export const updateUserStatusRequest = (userId, isActive) =>
  adminApiClient.patch(`/api/admin/users/${userId}/status`, { isActive })

export const deleteUserRequest = (userId) =>
  adminApiClient.delete(`/api/admin/users/${userId}`)

export const fetchAdminTeamsRequest = (params = {}) =>
  adminApiClient.get('/api/admin/teams', { params })

export const deleteTeamRequest = (teamId) =>
  adminApiClient.delete(`/api/admin/teams/${teamId}`)



