import apiClient from './apiClient.js'

export const fetchMyTeamRequest = async () => {
  const response = await apiClient.get('/api/teams/me')
  return response.data
}
