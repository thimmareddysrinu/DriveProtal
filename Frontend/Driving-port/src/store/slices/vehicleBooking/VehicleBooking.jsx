import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

const BaseUrl = 'http://127.0.0.1:8000'

// Login → POST phone_number + mpin → backend returns access + refresh tokens
export const VehicleBooking = createAsyncThunk(
  'vehicles/booking',
  async (bookingdata, { rejectWithValue }) => {
    console.log('📤 Sending to backend:', bookingdata) 

    






    try {
        const token = localStorage.getItem('access')
        console.log(token)
      const res = await axios.post(`${BaseUrl}/rides/book/vehicles/`, {
         "start_address":bookingdata.start_address ,
  "start_lat":bookingdata.start_lat ,
  "start_lon":bookingdata.start_lon ,
  "end_address":bookingdata.end_address ,
  "end_lat": bookingdata.end_lat,
  "end_lon": bookingdata.end_lon,
  'vehicle_type':bookingdata.vehicle_type,
  'ride_mode':bookingdata.ride_mode,

      },
    {
         headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
    })
      // res.data = { message, access, refresh, user: { phone_number, role, full_name, profile } }
     

      return res.data
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: 'Booking Failed' })
    }
  }
)

const initialState = {
 
  loading: false,
  error: null,
}

const VehicleBookingSlice = createSlice({
  name: 'vehiclebook',
  initialState,
  reducers: {
   
    
  },
  extraReducers: (builder) => {
    builder
      .addCase(VehicleBooking.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(VehicleBooking.fulfilled, (state, action) => {
        state.loading = false
        state.vehicles = action.payload.vehicles ||[]
        
      })
      .addCase(VehicleBooking.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.message || 'booking failed'
      })
  },
})


export default VehicleBookingSlice.reducer