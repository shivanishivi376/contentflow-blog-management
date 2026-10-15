import apiClient from './apiClient.js'

export const completeOnboardingRequest = (payload) =>
  apiClient.post('/api/onboarding/complete', payload)
