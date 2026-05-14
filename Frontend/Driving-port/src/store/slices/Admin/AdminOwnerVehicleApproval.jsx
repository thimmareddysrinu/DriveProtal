import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

const BaseUrl = 'http://127.0.0.1:8000'

export const AdminOwnerVehicleList = createAsyncThunk(
  'admin/OwnerVehicleList',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('access')
      const res = await axios.get(`${BaseUrl}/owner/admin/vehicles/`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })
      return res.data
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { message: 'Owner vehicle list failed' }
      )
    }
  }
)

export const AdminOwnervehicleDetails = createAsyncThunk(
  'admin/OwnerVehicleDetails',
  async (id, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('access')
      const res = await axios.get(`${BaseUrl}/owner/admin/vehicle/${id}/`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })
      return res.data
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { message: 'Owner vehicle detail failed' }
      )
    }
  }
)

export const AdminOwnerVehicleApproval = createAsyncThunk(
  'admin/OwnerVehicleApproval',
  async ({ id, action }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('access')
      const res = await axios.patch(
        `${BaseUrl}/owner/admin/vehicle/${id}/approval/`,
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
        err.response?.data || { message: 'Owner vehicle approval failed' }
      )
    }
  }
)

const initialState = {
  ownersVehicles: [],
  ownerVehicleDetail: null,
  ownloading: false,
  ownerror: null,
  actionLoading: false,
}

export const AdminOwnerVehiclelistSlice = createSlice({
  name: 'adminownervehiclelist',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(AdminOwnerVehicleList.pending, (state) => {
        state.ownloading = true
        state.ownerror = null
      })
      .addCase(AdminOwnerVehicleList.fulfilled, (state, action) => {
        state.ownloading = false
        state.ownersVehicles = Array.isArray(action.payload) ? action.payload : []
      })
      .addCase(AdminOwnerVehicleList.rejected, (state, action) => {
        state.ownloading = false
        state.ownerror = action.payload?.message || 'Owner vehicle list failed'
      })

      .addCase(AdminOwnervehicleDetails.pending, (state) => {
        state.ownloading = true
        state.ownerror = null
      })
      .addCase(AdminOwnervehicleDetails.fulfilled, (state, action) => {
        state.ownloading = false
        state.ownerVehicleDetail = action.payload
      })
      .addCase(AdminOwnervehicleDetails.rejected, (state, action) => {
        state.ownloading = false
        state.ownerror = action.payload?.message || 'Owner vehicle detail failed'
      })

      .addCase(AdminOwnerVehicleApproval.pending, (state) => {
        state.actionLoading = true
        state.ownerror = null
      })
      .addCase(AdminOwnerVehicleApproval.fulfilled, (state, action) => {
        state.actionLoading = false
        const { id, action: reviewAction } = action.payload

        if (state.ownerVehicleDetail && state.ownerVehicleDetail.id === id) {
          state.ownerVehicleDetail.is_verified = reviewAction === 'approve'
          state.ownerVehicleDetail.is_active = reviewAction === 'approve' ? 'available' : 'not available'
        }

        state.ownersVehicles = state.ownersVehicles.map((vehicle) =>
          vehicle.id === id
            ? {
                ...vehicle,
                is_verified: reviewAction === 'approve',
                is_active: reviewAction === 'approve' ? 'available' : 'not available',
              }
            : vehicle
        )
      })
      .addCase(AdminOwnerVehicleApproval.rejected, (state, action) => {
        state.actionLoading = false
        state.ownerror = action.payload?.message || 'Owner vehicle approval failed'
      })
  },
})

export default AdminOwnerVehiclelistSlice.reducer