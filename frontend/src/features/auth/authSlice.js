import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { authService } from './authService.js'

const getStoredAuthState = () => {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const stored = window.localStorage.getItem('authState')
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

const storedAuthState = getStoredAuthState()

const initialState = {
  user: storedAuthState?.user || null,
  accessToken: storedAuthState?.accessToken || null,
  refreshToken: storedAuthState?.refreshToken || null,
  loading: false,
  error: null,
  message: null,
}

const persistAuthState = (state) => {
  if (typeof window === 'undefined') {
    return
  }

  if (!state.user || !state.accessToken || !state.refreshToken) {
    window.localStorage.removeItem('authState')
    return
  }

  window.localStorage.setItem(
    'authState',
    JSON.stringify({
      user: state.user,
      accessToken: state.accessToken,
      refreshToken: state.refreshToken,
    }),
  )
}

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback

export const signupUser = createAsyncThunk('auth/signup', async (payload, { rejectWithValue }) => {
  try {
    return await authService.signup(payload)
  } catch (error) {
    return rejectWithValue(getErrorMessage(error, 'Signup failed'))
  }
})

export const loginUser = createAsyncThunk('auth/login', async (payload, { rejectWithValue }) => {
  try {
    return await authService.login(payload)
  } catch (error) {
    return rejectWithValue(getErrorMessage(error, 'Login failed'))
  }
})

export const googleAuthUser = createAsyncThunk(
  'auth/google',
  async (credential, { rejectWithValue }) => {
    try {
      return await authService.googleAuth(credential)
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Google authentication failed'))
    }
  },
)

export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (payload, { rejectWithValue }) => {
    try {
      return await authService.forgotPassword(payload)
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Request failed'))
    }
  },
)

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async (payload, { rejectWithValue }) => {
    try {
      return await authService.resetPassword(payload)
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Reset failed'))
    }
  },
)

export const completeOnboarding = createAsyncThunk(
  'auth/completeOnboarding',
  async (payload, { rejectWithValue }) => {
    try {
      return await authService.completeOnboarding(payload)
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Onboarding failed'))
    }
  },
)

/**
 * Accept a team invitation after authentication.
 * The server resolves team and role from the stored invitation — the frontend only provides the token.
 * On success, the user's Redux state is updated: onboardingCompleted=true, accountType=TEAM, etc.
 * This is what allows ProtectedRoute to admit the user without redirecting to /onboarding.
 */
export const acceptInvitation = createAsyncThunk(
  'auth/acceptInvitation',
  async (token, { rejectWithValue }) => {
    try {
      return await authService.acceptInvitation(token)
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Failed to accept invitation'))
    }
  },
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null
      state.accessToken = null
      state.refreshToken = null
      state.error = null
      state.message = null
      persistAuthState({ ...state, user: null, accessToken: null, refreshToken: null })
    },
    clearAuthMessage: (state) => {
      state.error = null
      state.message = null
    },
    setAuthUser: (state, action) => {
      state.user = action.payload
      persistAuthState(state)
    },
    setAuthTokens: (state, action) => {
      const { user, accessToken, refreshToken } = action.payload || {}
      if (user) state.user = user
      if (accessToken) state.accessToken = accessToken
      if (refreshToken) state.refreshToken = refreshToken
      persistAuthState(state)
    },
  },
  extraReducers: (builder) => {
    const setPending = (state) => {
      state.loading = true
      state.error = null
      state.message = null
    }

    const setRejected = (state, action) => {
      state.loading = false
      state.error = action.payload || 'Something went wrong'
    }

    builder
      .addCase(signupUser.pending, setPending)
      .addCase(signupUser.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload?.data?.user || null
        state.message = action.payload?.message || 'Signup successful'
      })
      .addCase(signupUser.rejected, setRejected)
      .addCase(loginUser.pending, setPending)
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload?.data?.user || null
        state.accessToken = action.payload?.data?.accessToken || null
        state.refreshToken = action.payload?.data?.refreshToken || null
        state.message = action.payload?.message || 'Login successful'
        persistAuthState(state)
      })
      .addCase(loginUser.rejected, setRejected)
      .addCase(googleAuthUser.pending, setPending)
      .addCase(googleAuthUser.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload?.data?.user || null
        state.accessToken = action.payload?.data?.accessToken || null
        state.refreshToken = action.payload?.data?.refreshToken || null
        state.message = action.payload?.message || 'Google authentication successful'
        persistAuthState(state)
      })
      .addCase(googleAuthUser.rejected, setRejected)
      .addCase(forgotPassword.pending, setPending)
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.loading = false
        state.message = action.payload?.message || 'Request sent'
      })
      .addCase(forgotPassword.rejected, setRejected)
      .addCase(resetPassword.pending, setPending)
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.loading = false
        state.message = action.payload?.message || 'Password reset successful'
      })
      .addCase(resetPassword.rejected, setRejected)
      .addCase(completeOnboarding.pending, setPending)
      .addCase(completeOnboarding.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload?.data?.user || state.user
        state.message = action.payload?.message || 'Onboarding completed successfully'
        persistAuthState(state)
      })
      .addCase(completeOnboarding.rejected, setRejected)
      .addCase(acceptInvitation.pending, setPending)
      .addCase(acceptInvitation.fulfilled, (state, action) => {
        state.loading = false
        // Update user from the acceptance response: onboardingCompleted=true, accountType=TEAM,
        // team and workflowRole are now set. This persists so ProtectedRoute sees the updated state.
        const updatedUser = action.payload?.data?.user
        if (updatedUser) {
          state.user = updatedUser
          persistAuthState(state)
        }
        state.message = 'You have joined the team successfully!'
      })
      .addCase(acceptInvitation.rejected, setRejected)
  },
})

export const { logout, clearAuthMessage, setAuthUser, setAuthTokens } = authSlice.actions
export default authSlice.reducer
