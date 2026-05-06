import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

const BaseUrl = 'http://127.0.0.1:8000'

export const DriverProfile = createAsyncThunk(
  'driver/profile',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('access')
      const res = await axios.get(`${BaseUrl}/driver/profile/`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })
      return res.data
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { message: 'Driver Profile failed' }
      )
    }
  }
)
export const UpdateDriverProfile = createAsyncThunk(
  'driver/updateprofile',
  async (formData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('access')

      const res = await axios.patch(
        `${BaseUrl}/driver/profile/`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      return res.data
    } catch (err) {
      console.log("Backend validation error:", err.response?.data)
      return rejectWithValue(
        err.response?.data || { message: 'Driver update failed' }
      )
    }
  }
)

const initialState = {
   DriverProf: null,  // ✅ Fixed: single object, not array
  loading: false,
  updateLoading: false,  // ✅ Added missing state
  error: null,
  
}
export const DriverProfileSlice = createSlice({
  name: 'driverprofile',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(DriverProfile.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(DriverProfile.fulfilled, (state, action) => {
        state.loading = false
        state.DriverProf = action.payload
      })
      .addCase(DriverProfile.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.message || 'Driver Profile failed'
      })
       .addCase(UpdateDriverProfile.pending, (state) => {
        state.updateLoading = true
        state.error = null
      })
      .addCase(UpdateDriverProfile.fulfilled, (state, action) => {
        state.updateLoading = false
        state.DriverProf = action.payload
      })
      .addCase(UpdateDriverProfile.rejected, (state, action) => {
        state.updateLoading = false
        state.error = action.payload?.message || 'Driver Profile failed'
      })

      
  },
})
export default DriverProfileSlice.reducer
