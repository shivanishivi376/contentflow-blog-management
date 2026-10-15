import apiClient from './apiClient.js'
import adminApiClient from './adminApiClient.js'

// User & Public endpoints (uses apiClient)
export const fetchCategoriesRequest = () => apiClient.get('/api/categories')
export const fetchCategoryByIdRequest = (id) => apiClient.get(`/api/categories/${id}`)
export const createCategoryRequest = (payload) => apiClient.post('/api/categories', payload)
export const updateCategoryRequest = (categoryId, payload) => apiClient.patch(`/api/categories/${categoryId}`, payload)
export const deleteCategoryRequest = (categoryId) => apiClient.delete(`/api/categories/${categoryId}`)

export const fetchSubcategoriesRequest = (params = {}) => apiClient.get('/api/subcategories', { params })
export const fetchSubcategoryByIdRequest = (id) => apiClient.get(`/api/subcategories/${id}`)
export const createSubcategoryRequest = (payload) => apiClient.post('/api/subcategories', payload)
export const updateSubcategoryRequest = (subcategoryId, payload) => apiClient.patch(`/api/subcategories/${subcategoryId}`, payload)
export const deleteSubcategoryRequest = (subcategoryId) => apiClient.delete(`/api/subcategories/${subcategoryId}`)

export const fetchKeywordsRequest = (params = {}) => apiClient.get('/api/keywords', { params })
export const fetchKeywordByIdRequest = (id) => apiClient.get(`/api/keywords/${id}`)
export const createKeywordRequest = (payload) => apiClient.post('/api/keywords', payload)
export const updateKeywordRequest = (keywordId, payload) => apiClient.patch(`/api/keywords/${keywordId}`, payload)
export const deleteKeywordRequest = (keywordId) => apiClient.delete(`/api/keywords/${keywordId}`)

// Admin specific endpoints (uses adminApiClient)
export const adminFetchCategoriesRequest = () => adminApiClient.get('/api/categories')
export const adminCreateCategoryRequest = (payload) => adminApiClient.post('/api/categories', payload)
export const adminUpdateCategoryRequest = (categoryId, payload) => adminApiClient.patch(`/api/categories/${categoryId}`, payload)
export const adminDeleteCategoryRequest = (categoryId) => adminApiClient.delete(`/api/categories/${categoryId}`)

export const adminFetchSubcategoriesRequest = (params = {}) => adminApiClient.get('/api/subcategories', { params })
export const adminCreateSubcategoryRequest = (payload) => adminApiClient.post('/api/subcategories', payload)
export const adminUpdateSubcategoryRequest = (subcategoryId, payload) => adminApiClient.patch(`/api/subcategories/${subcategoryId}`, payload)
export const adminDeleteSubcategoryRequest = (subcategoryId) => adminApiClient.delete(`/api/subcategories/${subcategoryId}`)

export const adminFetchKeywordsRequest = (params = {}) => adminApiClient.get('/api/keywords', { params })
export const adminCreateKeywordRequest = (payload) => adminApiClient.post('/api/keywords', payload)
export const adminUpdateKeywordRequest = (keywordId, payload) => adminApiClient.patch(`/api/keywords/${keywordId}`, payload)
export const adminDeleteKeywordRequest = (keywordId) => adminApiClient.delete(`/api/keywords/${keywordId}`)
