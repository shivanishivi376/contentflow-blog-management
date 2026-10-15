import apiClient from './apiClient.js'

export const fetchUserProfileRequest = () => apiClient.get('/api/users/me')

export const updateUserProfileRequest = (payload) => apiClient.patch('/api/users/me', payload)

export const updateUserPasswordRequest = (payload) => apiClient.patch('/api/users/me/password', payload)

export const fetchRecommendedBlogsRequest = () => apiClient.get('/api/users/me/recommendations')
