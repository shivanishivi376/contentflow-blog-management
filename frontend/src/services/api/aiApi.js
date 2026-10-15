import apiClient from './apiClient.js'

export const generateAIContentRequest = (payload) => apiClient.post('/api/ai/generate', payload)

export const improveAITextRequest = (payload) => apiClient.post('/api/ai/improve', payload)

export const generateAIMetadataRequest = (payload) => apiClient.post('/api/ai/metadata', payload)
