import {
  completeOnboardingRequest,
} from '../../services/api/onboardingApi.js'
import {
  forgotPasswordRequest,
  googleAuthRequest,
  loginRequest,
  resetPasswordRequest,
  signupRequest,
} from '../../services/api/authApi.js'
import { acceptInvitationRequest } from '../../services/api/invitationApi.js'

export const authService = {
  signup: async (payload) => {
    const response = await signupRequest(payload)
    return response.data
  },
  login: async (payload) => {
    const response = await loginRequest(payload)
    return response.data
  },
  googleAuth: async (credential) => {
    const response = await googleAuthRequest(credential)
    return response.data
  },
  forgotPassword: async (payload) => {
    const response = await forgotPasswordRequest(payload)
    return response.data
  },
  resetPassword: async (payload) => {
    const response = await resetPasswordRequest(payload)
    return response.data
  },
  completeOnboarding: async (payload) => {
    const response = await completeOnboardingRequest(payload)
    return response.data
  },
  /**
   * Accept an invitation post-authentication.
   * The server resolves team/role from the stored invitation — no frontend values are trusted.
   */
  acceptInvitation: async (token) => {
    const response = await acceptInvitationRequest(token)
    return response.data
  },
}
