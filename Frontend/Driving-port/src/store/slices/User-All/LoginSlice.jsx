import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

const BaseUrl = 'http://127.0.0.1:8000'

// Login → POST phone_number + mpin → backend returns access + refresh tokens
export const loginUser = createAsyncThunk(
  'login/loginUser',
  async ({ phone_number, mpin }, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${BaseUrl}/authentication/login/`, { phone_number, mpin })
      // res.data = { message, access, refresh, user: { phone_number, role, full_name, profile } }
      const { access, refresh, user } = res.data

      // Save tokens to localStorage
      localStorage.setItem('access', access)
      localStorage.setItem('refresh', refresh)
      localStorage.setItem('user', JSON.stringify(user))

      return res.data
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: 'Login failed' })
    }
  }
)

const initialState = {
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  access: localStorage.getItem('access') || null,
  refresh: localStorage.getItem('refresh') || null,
  isAuthenticated: !!localStorage.getItem('access'),
  loading: false,
  error: null,
}

const loginSlice = createSlice({
  name: 'login',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null
      state.access = null
      state.refresh = null
      state.isAuthenticated = false
      localStorage.removeItem('access')
      localStorage.removeItem('refresh')
      localStorage.removeItem('user')
    },
    clearError: (state) => { state.error = null },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false
        state.isAuthenticated = true
        state.access = action.payload.access
        state.refresh = action.payload.refresh
        state.user = action.payload.user
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.message || 'Login failed'
      })
  },
})

export const { logout, clearError } = loginSlice.actions
export default loginSlice.reducer