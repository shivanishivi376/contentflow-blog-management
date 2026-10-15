import apiClient from './apiClient.js'

export const fetchBlogsRequest = (params = {}) =>
  apiClient.get('/api/blogs', {
    params,
  })

export const fetchBlogByIdRequest = (blogId) => apiClient.get(`/api/blogs/${blogId}`)

export const createBlogRequest = (payload) => apiClient.post('/api/blogs', payload)

export const updateBlogRequest = (blogId, payload) => apiClient.patch(`/api/blogs/${blogId}`, payload)

export const assignBlogRolesRequest = (blogId, payload) =>
  apiClient.post(`/api/blogs/${blogId}/assignment`, payload)

export const updateBlogContentRequest = (blogId, payload) =>
  apiClient.patch(`/api/blogs/${blogId}/content`, payload)

export const generateBlogAIContentRequest = (blogId, payload) =>
  apiClient.post(`/api/blogs/${blogId}/content/ai-generate`, payload)

export const transitionBlogStatusRequest = (blogId, payload) =>
  apiClient.post(`/api/blogs/${blogId}/status`, payload)

export const publishBlogRequest = (blogId) =>
  apiClient.post(`/api/blogs/${blogId}/publish`)

export const retryPublishBlogRequest = (blogId) =>
  apiClient.post(`/api/blogs/${blogId}/publish/retry`)

export const fetchBlogCommentsRequest = (blogId) =>
  apiClient.get(`/api/blogs/${blogId}/comments`)

export const addBlogCommentRequest = (blogId, payload) =>
  apiClient.post(`/api/blogs/${blogId}/comments`, payload)

export const resolveBlogCommentRequest = (blogId, commentId) =>
  apiClient.patch(`/api/blogs/${blogId}/comments/${commentId}/resolve`)

export const deleteBlogRequest = (blogId) => apiClient.delete(`/api/blogs/${blogId}`)

