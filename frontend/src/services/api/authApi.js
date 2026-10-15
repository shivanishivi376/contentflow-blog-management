import apiClient from './apiClient.js'

export const signupRequest = (payload) => apiClient.post('/api/auth/signup', payload)
export const loginRequest = (payload) => apiClient.post('/api/auth/login', payload)
export const googleAuthRequest = (credential) =>
  apiClient.post('/api/auth/google', { credential })
export const forgotPasswordRequest = (payload) =>
  apiClient.post('/api/auth/forgot-password', payload)
export const resetPasswordRequest = (payload) =>
  apiClient.post('/api/auth/reset-password', payload)
export const refreshTokenRequest = (payload) =>
  apiClient.post('/api/auth/refresh', payload)
