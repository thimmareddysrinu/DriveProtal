import { configureStore } from '@reduxjs/toolkit'
import registerReducer from './slices/User-All/RegisterUserSlice'
import otpReducer from './slices/User-All/OtpSlice'
import mpinSetReducer from './slices/User-All/Mpinslice'
import loginReducer from './slices/User-All/LoginSlice'
import vehiclesearchReducer  from './slices/VehicleSearch/VechicleSearch'
import vehiclebooksReducer  from './slices/vehicleBooking/VehicleBooking'
import adminlistReducer from './slices/Admin/AdminvehicleApprove'

import driverprofileReducer from './slices/Driver/Driverprofile'
import drivervehicleReducer from './slices/Driver/DriverVehicle'

import vehicleownerprofileReducer from './slices/Owner/Ownerprofile'
import vehicleownervehicleReducer from './slices/Owner/OwnerVehicle'
export const store = configureStore({
  reducer: {
   register: registerReducer,
   otpverify: otpReducer,
   mpinset: mpinSetReducer,
   login: loginReducer,
   Vehiclesearch:vehiclesearchReducer,
   Vehiclebooks:vehiclesearchReducer,
  //  admin store

  adminlist:adminlistReducer,

  // driver store

  driverprofile:driverprofileReducer,
  drivervehicle:drivervehicleReducer,

  // vehicleowner store

  vehicleownerprofile:vehicleownerprofileReducer,
  vehicleownervehicle:vehicleownervehicleReducer
  },
})
