import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

const BaseUrl = 'http://127.0.0.1:8000'

export const VehicleownerProfile = createAsyncThunk(
  'Ownervehicle/profile',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('access')
      const res = await axios.get(`${BaseUrl}/owner/profile/`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })
      console.log(res.data)
      return res.data
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { message: 'Vehicle owner profile failed' }
      )
    }
  }
)

export const UpdateVehicleownerProfile = createAsyncThunk(
  'vehicleowner/updateprofile',
  async (formData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('access')
      const res = await axios.patch(`${BaseUrl}/owner/profile/`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      return res.data
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { message: 'Vehicle owner update failed' }
      )
    }
  }
)

const initialState = {
  OwnerProf: null,
  loading: false,
  updateLoading: false,
  error: null,
}

export const VehicleownerProfileSlice = createSlice({
  name: 'vehicleownerprofile',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(VehicleownerProfile.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(VehicleownerProfile.fulfilled, (state, action) => {
        state.loading = false
        state.OwnerProf = action.payload
      })
      .addCase(VehicleownerProfile.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.message || 'Vehicle owner profile failed'
      })
      .addCase(UpdateVehicleownerProfile.pending, (state) => {
        state.updateLoading = true
        state.error = null
      })
      .addCase(UpdateVehicleownerProfile.fulfilled, (state, action) => {
        state.updateLoading = false
        state.OwnerProf = action.payload
      })
      .addCase(UpdateVehicleownerProfile.rejected, (state, action) => {
        state.updateLoading = false
        state.error = action.payload?.message || 'Vehicle owner update failed'
      })
  },
})

export default VehicleownerProfileSlice.reducer
