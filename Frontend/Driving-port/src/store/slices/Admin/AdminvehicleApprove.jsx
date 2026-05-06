import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

const BaseUrl = 'http://127.0.0.1:8000'

export const AdminDriverList = createAsyncThunk(
  'admin/DriverList',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('access')
      const res = await axios.get(`${BaseUrl}/driver/admin/drivers/`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })
      console.log(res.data)
      return res.data
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { message: 'Driver list failed' }
      )
    }
  }
)

export const AdminDriverDetail = createAsyncThunk(
  'admin/DriverDetail',
  async (id, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('access')
      const res = await axios.get(`${BaseUrl}/driver/admin/drivers/${id}/`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })
      console.log(res.data)
      return res.data
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { message: 'Driver detail failed' }
      )
    }
  }
)

export const AdminVehicleApproval = createAsyncThunk(
  'admin/VehicleApproval',
  async ({ id, action }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('access')
      const res = await axios.patch(
        `${BaseUrl}/driver/admin/vehicles/${id}/approval/`,
        { action },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      )
      return { id, action, data: res.data }
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { message: 'Vehicle approval failed' }
      )
    }
  }
)

export const AdminProfileApproval = createAsyncThunk(
  'admin/ProfileApproval',
  async ({ id, action }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('access')
      const res = await axios.patch(
        `${BaseUrl}/driver/admin/drivers/${id}/approval/`, // Fixed URL
        { action },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      )
      return { id, action, data: res.data }
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { message: 'Profile approval failed' }
      )
    }
  }
)

const initialState = {
  drivers: [], // Changed from vehicles
  driverDetail: null, // Changed from singleVehicle
  loading: false,
  error: null,
  actionLoading: false,
}

export const AdminVehiclelistSlice = createSlice({
  name: 'adminlist',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Driver List
      .addCase(AdminDriverList.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(AdminDriverList.fulfilled, (state, action) => {
        state.loading = false
        state.drivers = Array.isArray(action.payload) ? action.payload : []
      })
      .addCase(AdminDriverList.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.message || 'Driver list failed'
      })

      // Driver Detail
      .addCase(AdminDriverDetail.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(AdminDriverDetail.fulfilled, (state, action) => {
        state.loading = false
        state.driverDetail = action.payload
      })
      .addCase(AdminDriverDetail.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.message || 'Driver detail failed'
      })

      // Vehicle Approval
      .addCase(AdminVehicleApproval.pending, (state) => {
        state.actionLoading = true
        state.error = null
      })
      .addCase(AdminVehicleApproval.fulfilled, (state, action) => {
        state.actionLoading = false
        const { id, action: reviewAction } = action.payload
        
        // Update in driver vehicles list
        if (state.driverDetail?.vehicles) {
          const vehicle = state.driverDetail.vehicles.find((v) => v.id === id)
          if (vehicle) {
            vehicle.is_verified = reviewAction === 'approve'
            vehicle.is_active = reviewAction === 'approve' ? 'available' : 'not available'
          }
        }
      })
      .addCase(AdminVehicleApproval.rejected, (state, action) => {
        state.actionLoading = false
        state.error = action.payload?.message || 'Vehicle approval failed'
      })

      // Profile Approval
      .addCase(AdminProfileApproval.pending, (state) => {
        state.actionLoading = true
        state.error = null
      })
      .addCase(AdminProfileApproval.fulfilled, (state, action) => {
        state.actionLoading = false
        const { id, action: reviewAction } = action.payload
        if (state.driverDetail && state.driverDetail.id === id) {
          state.driverDetail.verification_status = reviewAction
        }
      })
      .addCase(AdminProfileApproval.rejected, (state, action) => {
        state.actionLoading = false
        state.error = action.payload?.message || 'Profile approval failed'
      })
  },
})

export default AdminVehiclelistSlice.reducer