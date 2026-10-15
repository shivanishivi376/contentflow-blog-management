import adminApiClient from './adminApiClient.js'

export const adminLoginRequest = (payload) => adminApiClient.post('/api/admin/login', payload)
