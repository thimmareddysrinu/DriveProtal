import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

const BaseUrl = 'http://127.0.0.1:8000'
export const CreateDriverVehicle = createAsyncThunk(
  'driver/createvehicle',
  async (formData, { rejectWithValue }) => {
    console.log("sendingbackend updated profile:",formData)
    try {
      const token = localStorage.getItem('access')
      const res = await axios.post(`${BaseUrl}/driver/vehicle/`,formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      })
      console.log(res.data)
      return res.data
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { message: 'Vehicle create By driver failed' }
      )
    }
  }
)
export const Drivervehicle = createAsyncThunk(
  'driver/vehicle',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('access')
      const res = await axios.get(`${BaseUrl}/driver/vehicle/`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })
      return res.data
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { message: 'Driver vehicle get  failed' }
      )
    }
  }
)

export const UpdateDriverVehicle = createAsyncThunk(
  'driver/updatevehicle',
  async ({ formData }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('access')
      const res = await axios.patch(
        `${BaseUrl}/driver/vehicle/`,
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
        err.response?.data || { message: 'Vehicle data update by driver failed' }
      )
    }
  }
)

const initialState = {
  DriverVeh: null,  // ✅ Fixed: single object, not array
  loading: false,
  updateLoading: false,  // ✅ Added missing state
  error: null,
  
}
export const DriverVehicleSlice = createSlice({
  name: 'drivervehicle',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(Drivervehicle.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(Drivervehicle.fulfilled, (state, action) => {
        state.loading = false
        state.DriverVeh = action.payload
      })
      .addCase(Drivervehicle.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.message || 'Driver vehicle failed'
      })
       .addCase(UpdateDriverVehicle.pending, (state) => {
        state.updateLoading = true
        state.error = null
      })
      .addCase(UpdateDriverVehicle.fulfilled, (state, action) => {
        state.updateLoading = false
        state.DriverVeh = action.payload
      })
      .addCase(UpdateDriverVehicle.rejected, (state, action) => {
        state.updateLoading = false
        state.error = action.payload?.message || 'Driver vehicle update failed'
      })
         .addCase(CreateDriverVehicle.pending, (state) => {
        state.updateLoading = true
        state.error = null
      })
      .addCase(CreateDriverVehicle.fulfilled, (state, action) => {
        state.updateLoading = false
        state.DriverVeh = action.payload
      })
      .addCase(CreateDriverVehicle.rejected, (state, action) => {
        state.updateLoading = false
        state.error = action.payload?.message || 'Driver vehicle update failed'
      })

      
  },
})
export default DriverVehicleSlice.reducer