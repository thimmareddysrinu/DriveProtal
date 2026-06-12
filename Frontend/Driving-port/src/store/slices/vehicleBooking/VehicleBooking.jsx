import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

const BaseUrl = 'http://127.0.0.1:8000'

export const VehicleBooking = createAsyncThunk(
  'vehicles/booking',
  async (bookingdata, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('access')

      const res = await axios.post(
        `${BaseUrl}/rides/book/vehicles/`,
        {
          start_address: bookingdata.start_address,
          start_lat: bookingdata.start_lat,
          start_lon: bookingdata.start_lon,
          end_address: bookingdata.end_address,
          end_lat: bookingdata.end_lat,
          end_lon: bookingdata.end_lon,
          vehicle_type: bookingdata.vehicle_type,
          ride_mode: bookingdata.ride_mode,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      )

      console.log('✅ Booking response from backend:', res.data)
      return res.data
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: 'srinu Booking Failed' })
    }
  }
)

export const DriverAcceptVehicleBooking = createAsyncThunk(
  'vehicle/bookingAccepted',
  async (rideId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('access')

      console.log('📤 Sending to backend:', { ride_id: rideId })

      const res = await axios.post(
        `${BaseUrl}/rides/book/vehicles/driveraccepted/`,
        { ride_id: rideId },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      )

      console.log('✅ Response from backend:', res.data)
      return res.data
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: 'Booking Failed' })
    }
  }
)

export const CheckRideStatus = createAsyncThunk(
  'vehicle/checkStatus',
  async (rideId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('access')

      const res = await axios.get(`${BaseUrl}/rides/status/${rideId}/`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })

      console.log('✅ Ride status response:', res.data)
      return res.data
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { message: 'Failed to fetch ride status' }
      )
    }
  }
)

export const DriverArrived = createAsyncThunk(
  'vehicle/driverArrived',
  async (rideId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('access')
      const res = await axios.post(`${BaseUrl}/rides/${rideId}/arrive/`, {}, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })
      console.log('✅ Driver arrived response:', res.data)
      return res.data
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { message: 'Failed to update arrived status' }
      )
    }
  }
)

export const StartRide = createAsyncThunk(
  'vehicle/startRide',
  async ({ rideId, otp }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('access')
      const res = await axios.post(`${BaseUrl}/rides/${rideId}/start/`, { otp }, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })
      console.log('✅ Ride started response:', res.data)
      return res.data
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { message: 'Failed to start ride' }
      )
    }
  }
)
export const CancelledRide = createAsyncThunk(
  'vehicle/cancelledRide',
  async ({ rideId, otp }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('access')
      const res = await axios.post(`${BaseUrl}/rides/cancelled/${rideId}/ride/`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })
      console.log('✅ Ride cancelled response:', res.data)
      return res.data
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { message: 'Failed to cancel ride' }
      )
    }
  }
)
export const CompletedRide = createAsyncThunk(
  'vehicle/completedRide',
  async ({ rideId}, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('access')
      const res = await axios.post(`${BaseUrl}/rides/completed/${rideId}/ride/`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })
      console.log('✅ Ride completed response:', res.data)
      return res.data
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { message: 'Failed to complete ride' }
      )
    }
  }
)
export const CustomerAllRide = createAsyncThunk(
  'vehicle/customerAllRides',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('access')
      const res = await axios.get(`${BaseUrl}/rides/customer/`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })
      console.log('✅ Customer all rides response:', res.data)
      return res.data
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { message: 'Failed to fetch customer rides' }
      )
    }
  }
)

     


const initialState = {
  bookingDetails: null,
  currentRide: null,
  currentDriver: null,
  currentVehicle: null,
  CustomerRides: [],
  loading: false,
  error: null,
}

const VehicleBookingSlice = createSlice({
  name: 'Vehiclebooks',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(DriverAcceptVehicleBooking.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(DriverAcceptVehicleBooking.fulfilled, (state, action) => {
        state.loading = false
        state.bookingDetails = action.payload
        state.currentRide = action.payload?.ride || null
        state.currentDriver = action.payload?.driver || null
        state.currentVehicle = action.payload?.driver_vehicle || null
        state.error = null
      })
      .addCase(DriverAcceptVehicleBooking.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || action.error?.message
      })
      .addCase(CheckRideStatus.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(CheckRideStatus.fulfilled, (state, action) => {
        state.loading = false
        state.bookingDetails = {
          ...state.bookingDetails,
          ...action.payload,
        }
        state.currentRide = action.payload?.ride || state.currentRide
        state.currentDriver = action.payload?.driver || state.currentDriver
        state.currentVehicle = action.payload?.driver_vehicle || state.currentVehicle
        state.error = null
      })
      .addCase(CheckRideStatus.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || action.error?.message
      })

       .addCase(CustomerAllRide.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(CustomerAllRide.fulfilled, (state, action) => {
        state.loading = false
        state.CustomerRides = action.payload
        state.error = null
      })
      .addCase(CustomerAllRide.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || action.error?.message
      })
       
  },
})

export default VehicleBookingSlice.reducer