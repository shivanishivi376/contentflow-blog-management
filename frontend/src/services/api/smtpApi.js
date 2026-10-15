import adminApiClient from './adminApiClient.js'

export const fetchSMTPConfigRequest = () => adminApiClient.get('/api/admin/smtp')

export const updateSMTPConfigRequest = (payload) => adminApiClient.put('/api/admin/smtp', payload)

export const testSMTPConnectionRequest = (testEmail) =>
  adminApiClient.post('/api/admin/smtp/test', { testEmail })

export const unlinkSMTPConfigRequest = () => adminApiClient.delete('/api/admin/smtp')
