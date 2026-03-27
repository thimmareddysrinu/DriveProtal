import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

const BaseUrl = 'http://127.0.0.1:8000'

// Verify OTP → POST phone_number + otp
export const verifyOTP = createAsyncThunk(
  'otpverify/verifyOTP',
  async ({ phone_number, otp }, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${BaseUrl}/authentication/otpverify/`, { phone_number, otp })
      return res.data  // { message }
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: 'OTP verification failed' })
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

const otpSlice = createSlice({
  name: 'otpverify',
  initialState,
  reducers: {
    clearOtpError: (state) => { state.error = null },
    resetOtp: () => initialState,
  },
  extraReducers: (builder) => {

    // verifyOTP
    builder
      .addCase(verifyOTP.pending, (state) => {
        state.loading = true; state.error = null
      })
      .addCase(verifyOTP.fulfilled, (state, action) => {
        state.loading = false
        state.success = true
        state.message = action.payload.message
      })
      .addCase(verifyOTP.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.message || 'OTP verification failed'
      })

    // resendOTP
   
  },
})

export const { clearOtpError, resetOtp } = otpSlice.actions
export default otpSlice.reducer