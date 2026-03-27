import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

const BaseUrl = 'http://127.0.0.1:8000'

// Verify OTP → POST phone_number + otp
export const MpinSet = createAsyncThunk(
  'Mpin/SetMpin',
  async ({ phone_number, mpin }, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${BaseUrl}/authentication/mpinset/`, { phone_number, mpin })
      return res.data  // { message }
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: 'Mpin Set   failed' })
    }
  }
)

// Resend OTP → POST phone_number


const initialState = {
  loading: false,
  success: false,
  error: null,
  message: '',
}

const mpinSlice = createSlice({
  name: 'MpinSet',
  initialState,
  reducers: {
    clearOtpError: (state) => { state.error = null },
    
  },
  extraReducers: (builder) => {

    // verifyOTP
    builder
      .addCase(MpinSet.pending, (state) => {
        state.loading = true; state.error = null
      })
      .addCase(MpinSet.fulfilled, (state, action) => {
        state.loading = false
        state.success = true
        state.message = action.payload.message
      })
      .addCase(MpinSet.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.message || 'Mpin set  failed'
      })

    // resendOTP
   
  },
})


export default mpinSlice.reducer