import apiClient from './apiClient.js'

export const fetchBlogCommentsRequest = (blogId) => apiClient.get(`/api/comments/blogs/${blogId}`)

export const createCommentRequest = (payload) => apiClient.post('/api/comments', payload)

export const addBlogCommentRequest = (blogId, payload) => apiClient.post(`/api/blogs/${blogId}/comments`, payload)

export const replyCommentRequest = (commentId, content) =>
  apiClient.post(`/api/comments/${commentId}/replies`, { content })

export const resolveCommentRequest = (commentId) => apiClient.post(`/api/comments/${commentId}/resolve`)

export const resolveBlogCommentRequest = (blogId, commentId) =>
  apiClient.patch(`/api/blogs/${blogId}/comments/${commentId}/resolve`)

export const deleteCommentRequest = (commentId) => apiClient.delete(`/api/comments/${commentId}`)

