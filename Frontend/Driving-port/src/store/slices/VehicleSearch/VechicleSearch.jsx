import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

const BaseUrl = 'http://127.0.0.1:8000'

// Login → POST phone_number + mpin → backend returns access + refresh tokens
export const VehicleSearch = createAsyncThunk(
  'vehiclesSearch/Prices',
  async (searchinput, { rejectWithValue }) => {
    console.log('📤 Sending to backend:', searchinput) 

    






    try {
        const token = localStorage.getItem('access')
        console.log(token)
      const res = await axios.post(`${BaseUrl}/rides/search/vehicles/`, {
         "start_address":searchinput.start_address ,
  "start_lat":searchinput.start_lat ,
  "start_lon":searchinput.start_lon ,
  "end_address":searchinput.end_address ,
  "end_lat": searchinput.end_lat,
  "end_lon": searchinput.end_lon
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
      return rejectWithValue(err.response?.data || { message: 'Searching Failed' })
    }
  }
)

const initialState = {
 vehicles:[],
  loading: false,
  error: null,
}

const VehicleSearchSlice = createSlice({
  name: 'vehiclesearch',
  initialState,
  reducers: {
   
    
  },
  extraReducers: (builder) => {
    builder
      .addCase(VehicleSearch.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(VehicleSearch.fulfilled, (state, action) => {
        state.loading = false
        state.vehicles = action.payload.vehicles ||[]
        
      })
      .addCase(VehicleSearch.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.message || 'Search failed'
      })
  },
})


export default VehicleSearchSlice.reducer