import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

// ── Async Thunks ───────────────────────────────────────────────────────────────
const BaseUrl='http://127.0.0.1:8000'
// Step 1: Register → POST phone_number + role → backend sends OTP via SMS
export const registerUser = createAsyncThunk(
  'register/registerUser',
  async ({ phone_number, role }, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${BaseUrl}/authentication/register/`, { phone_number, role })
      return res.data  // { message, phone_number }
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: 'Registration failed' })
    }
  }
)

// Step 2: Verify OTP → POST phone_number + otp


// Step 3: Resend OTP → POST phone_number


// ── Initial State ──────────────────────────────────────────────────────────────

const initialState = {
  phone_number: '',
  role: 'customer',   // 'customer' | 'driver' | 'vehicle_owner'
            // 1=Register, 2=OTP, 3=MPIN, 4=Done
  loading: false,
  success: false,
  error: null,
  message: '',
}

// ── Slice ──────────────────────────────────────────────────────────────────────

const registerSlice = createSlice({
  name: 'register',
  initialState,
  reducers: {
    
  },

  extraReducers: (builder) => {

    // ── registerUser ──
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true; state.error = null; state.message = ''
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false
        state.success = true
        state.message = action.payload.message
        state.phone_number = action.payload.phone_number
        state.step = 2  // → OTP step
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.message || 'Registration failed'
      })

 

   
   
  },
})

export default registerSlice.reducer