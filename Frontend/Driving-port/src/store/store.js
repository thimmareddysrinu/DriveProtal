import { configureStore } from '@reduxjs/toolkit'
import registerReducer from './slices/User-All/RegisterUserSlice'
import otpReducer from './slices/User-All/OtpSlice'
import mpinSetReducer from './slices/User-All/Mpinslice'
import loginReducer from './slices/User-All/LoginSlice'
export const store = configureStore({
  reducer: {
   register: registerReducer,
   otpverify: otpReducer,
   mpinset: mpinSetReducer,
   login: loginReducer,
  },
})
