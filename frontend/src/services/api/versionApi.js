import apiClient from './apiClient.js'

export const fetchVersionsRequest = (blogId) => apiClient.get(`/api/blogs/${blogId}/versions`)

export const fetchVersionByIdRequest = (blogId, versionId) =>
  apiClient.get(`/api/blogs/${blogId}/versions/${versionId}`)

export const restoreVersionRequest = (blogId, versionId) =>
  apiClient.post(`/api/blogs/${blogId}/versions/${versionId}/restore`)
