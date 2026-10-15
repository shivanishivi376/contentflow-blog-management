import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Subscriber callbacks for Redux integration
let onTokenRefreshedCallback = null
let onSessionExpiredCallback = null

export const setupAuthInterceptors = ({ onRefreshed, onExpired }) => {
  onTokenRefreshedCallback = onRefreshed
  onSessionExpiredCallback = onExpired
}

apiClient.interceptors.request.use((config) => {
  if (typeof window === 'undefined') {
    return config
  }

  const isAdminRoute = config.url && config.url.includes('/api/admin')

  if (isAdminRoute) {
    const adminAuthState = window.localStorage.getItem('adminAuthState')
    if (adminAuthState) {
      try {
        const parsedAdmin = JSON.parse(adminAuthState)
        const adminToken = parsedAdmin?.accessToken
        if (adminToken) {
          config.headers.Authorization = `Bearer ${adminToken}`
          return config
        }
      } catch {
        window.localStorage.removeItem('adminAuthState')
      }
    }
  }

  const authState = window.localStorage.getItem('authState')

  if (authState) {
    try {
      const parsedState = JSON.parse(authState)
      const accessToken = parsedState?.accessToken

      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`
      }
    } catch {
      window.localStorage.removeItem('authState')
    }
  }

  return config
})

let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (!error.response || error.response.status !== 401 || !originalRequest) {
      return Promise.reject(error)
    }

    const requestUrl = originalRequest.url || ''
    const isAuthRoute =
      requestUrl.includes('/api/auth/login') ||
      requestUrl.includes('/api/auth/google') ||
      requestUrl.includes('/api/auth/signup') ||
      requestUrl.includes('/api/auth/refresh') ||
      requestUrl.includes('/api/auth/forgot-password') ||
      requestUrl.includes('/api/auth/reset-password') ||
      requestUrl.includes('/api/admin')

    if (isAuthRoute || originalRequest._retry) {
      return Promise.reject(error)
    }

    if (typeof window === 'undefined') {
      return Promise.reject(error)
    }

    const authStateStr = window.localStorage.getItem('authState')
    let authState
    try {
      authState = authStateStr ? JSON.parse(authStateStr) : null
    } catch {
      window.localStorage.removeItem('authState')
      return Promise.reject(error)
    }

    const refreshToken = authState?.refreshToken
    if (!refreshToken) {
      return Promise.reject(error)
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return apiClient(originalRequest)
        })
        .catch((err) => Promise.reject(err))
    }

    originalRequest._retry = true
    isRefreshing = true

    try {
      // Use raw axios to prevent infinite interceptor loops
      const response = await axios.post(
        `${baseURL}/api/auth/refresh`,
        { refreshToken },
        { headers: { 'Content-Type': 'application/json' } }
      )

      const refreshData = response.data?.data
      const newAccessToken = refreshData?.accessToken
      const newRefreshToken = refreshData?.refreshToken || refreshToken
      const updatedUser = refreshData?.user || authState.user

      if (newAccessToken) {
        const updatedState = {
          user: updatedUser,
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
        }

        window.localStorage.setItem('authState', JSON.stringify(updatedState))

        if (onTokenRefreshedCallback) {
          onTokenRefreshedCallback(updatedState)
        }

        processQueue(null, newAccessToken)
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
        return apiClient(originalRequest)
      } else {
        throw new Error('Refresh response missing access token')
      }
    } catch (refreshError) {
      processQueue(refreshError, null)
      window.localStorage.removeItem('authState')

      if (onSessionExpiredCallback) {
        onSessionExpiredCallback()
      }

      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  }
)

export default apiClient
