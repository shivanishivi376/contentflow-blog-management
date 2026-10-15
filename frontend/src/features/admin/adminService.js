import { adminLoginRequest } from '../../services/api/adminApi.js'

export const adminService = {
  login: async (payload) => {
    const response = await adminLoginRequest(payload)
    return response.data
  },
}
