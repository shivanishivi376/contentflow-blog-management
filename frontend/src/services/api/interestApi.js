import apiClient from './apiClient.js'
import adminApiClient from './adminApiClient.js'

export const fetchInterestsRequest = () => apiClient.get('/api/interests')

export const createInterestRequest = (payload) => adminApiClient.post('/api/interests', payload)

export const updateInterestRequest = (interestId, payload) =>
  adminApiClient.patch(`/api/interests/${interestId}`, payload)

export const deleteInterestRequest = (interestId) =>
  adminApiClient.delete(`/api/interests/${interestId}`)
