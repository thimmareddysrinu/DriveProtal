import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

const BaseUrl = 'http://127.0.0.1:8000'
export const CreateOwnerVehicle = createAsyncThunk(
  'Vehicleowner/createvehicle',
  async (formData, { rejectWithValue }) => {
    console.log("sendingbackend updated profile:",formData)
    try {
      const token = localStorage.getItem('access')
      const res = await axios.post(`${BaseUrl}/owner/vehicles/add/`,formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      })
      console.log(res.data)
      return res.data
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { message: 'Vehicle create By vehicleowner failed' }
      )
    }
  }
)
export const Ownervehicle = createAsyncThunk(
  'owner/vehicle',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('access')
      const res = await axios.get(`${BaseUrl}/owner/vehicles/`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })
      console.log(res.data)
      return res.data
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { message: 'vehicleowner  vehicle get  failed' }
      )
    }
  }
)

export const UpdateOwnerVehicle = createAsyncThunk(
  'vehicleowner/updatevehicle',
  async ({ formData,id }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('access')
      const res = await axios.patch(
        `${BaseUrl}/owner/vehicles/${id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      )
      return res.data
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { message: 'Vehicle data update by vehicleowner failed' }
      )
    }
  }
)

const initialState = {
  OwnerVeh: null,  // ✅ Fixed: single object, not array
  loading: false,
  updateLoading: false,  // ✅ Added missing state
  error: null,
  
}
export const OwnerVehicleSlice = createSlice({
  name: 'ownervehicle',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(Ownervehicle.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(Ownervehicle.fulfilled, (state, action) => {
        state.loading = false
        state.OwnerVeh = action.payload
      })
      .addCase(Ownervehicle.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.message || 'Vehicleowner  vehicle failed'
      })
       .addCase(UpdateOwnerVehicle.pending, (state) => {
        state.updateLoading = true
        state.error = null
      })
      .addCase(UpdateOwnerVehicle.fulfilled, (state, action) => {
        state.updateLoading = false
        state.OwnerVeh = action.payload
      })
      .addCase(UpdateOwnerVehicle.rejected, (state, action) => {
        state.updateLoading = false
        state.error = action.payload?.message || 'vehicleowner vehicle update failed'
      })
         .addCase(CreateOwnerVehicle.pending, (state) => {
        state.updateLoading = true
        state.error = null
      })
      .addCase(CreateOwnerVehicle.fulfilled, (state, action) => {
        state.updateLoading = false
        state.DriverVeh = action.payload
      })
      .addCase(CreateOwnerVehicle.rejected, (state, action) => {
        state.updateLoading = false
        state.error = action.payload?.message || 'Vehicleowner  vehicle Create failed'
      })

      
  },
})
export default OwnerVehicleSlice.reducer