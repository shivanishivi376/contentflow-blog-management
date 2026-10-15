import axios from 'axios'

const adminApiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
})

adminApiClient.interceptors.request.use((config) => {
  if (typeof window === 'undefined') {
    return config
  }

  const adminAuthState = window.localStorage.getItem('adminAuthState')

  if (!adminAuthState) {
    return config
  }

  try {
    const parsedState = JSON.parse(adminAuthState)
    const accessToken = parsedState?.accessToken

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }
  } catch {
    window.localStorage.removeItem('adminAuthState')
  }

  return config
})

adminApiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem('adminAuthState')
        if (!window.location.pathname.startsWith('/admin/login')) {
          window.location.href = '/admin/login'
        }
      }
    }
    return Promise.reject(error)
  }
)

export default adminApiClient
