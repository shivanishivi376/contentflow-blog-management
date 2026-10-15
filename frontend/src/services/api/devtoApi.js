import apiClient from './apiClient.js'

export const publishToDevToRequest = (blogId, payload = {}) =>
  apiClient.post(`/api/blogs/${blogId}/publish/devto`, payload)

export const fetchExternalPublicationsRequest = (blogId) =>
  apiClient.get(`/api/blogs/${blogId}/external-publications`)
