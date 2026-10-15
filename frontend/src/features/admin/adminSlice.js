import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { adminService } from './adminService.js'

const getStoredAdminState = () => {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const stored = window.localStorage.getItem('adminAuthState')
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

const storedAdminState = getStoredAdminState()

const initialState = {
  admin: storedAdminState?.admin || null,
  accessToken: storedAdminState?.accessToken || null,
  loading: false,
  error: null,
  message: null,
}

const persistAdminState = (state) => {
  if (typeof window === 'undefined') {
    return
  }

  if (!state.admin || !state.accessToken) {
    window.localStorage.removeItem('adminAuthState')
    return
  }

  window.localStorage.setItem(
    'adminAuthState',
    JSON.stringify({
      admin: state.admin,
      accessToken: state.accessToken,
    }),
  )
}

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback

export const loginAdmin = createAsyncThunk(
  'admin/login',
  async (payload, { rejectWithValue }) => {
    try {
      return await adminService.login(payload)
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Admin login failed'))
    }
  },
)

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    adminLogout: (state) => {
      state.admin = null
      state.accessToken = null
      state.error = null
      state.message = null
      persistAdminState(state)
    },
    clearAdminMessage: (state) => {
      state.error = null
      state.message = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginAdmin.pending, (state) => {
        state.loading = true
        state.error = null
        state.message = null
      })
      .addCase(loginAdmin.fulfilled, (state, action) => {
        state.loading = false
        state.admin = action.payload?.data?.admin || null
        state.accessToken = action.payload?.data?.accessToken || null
        state.message = action.payload?.message || 'Admin login successful'
        persistAdminState(state)
      })
      .addCase(loginAdmin.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Something went wrong'
      })
  },
})

export const { adminLogout, clearAdminMessage } = adminSlice.actions
export default adminSlice.reducer
