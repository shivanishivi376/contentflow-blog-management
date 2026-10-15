import apiClient from './apiClient.js'

export const fetchPublicBlogsRequest = (params = {}) =>
  apiClient.get('/api/public/blogs', {
    params,
  })

export const fetchPublicBlogBySlugRequest = (slug) => apiClient.get(`/api/public/blogs/${slug}`)

export const fetchPublicCategoriesRequest = () => apiClient.get('/api/public/categories')
