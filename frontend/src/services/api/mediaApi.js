import apiClient from './apiClient.js'

export const uploadMediaRequest = (file) => {
  const formData = new FormData()
  formData.append('file', file)

  return apiClient.post('/api/media', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

export const deleteMediaRequest = (mediaId) => apiClient.delete(`/api/media/${mediaId}`)
