import api from './axiosInstance.js'

export const authAPI = {
  login: (data) => api.post('/authentication/login/', data),
  register: (data) => api.post('/authentication/register/', data),
  Mpinset: (phone,mpin) => api.post('/authentication/mpinset/', { phone,mpin }),
  verifyOTP: (phone, otp) => api.post('/authentication/register/', { phone, otp }),
  resendOTP: (phone, otp) => api.post('/authentication/resendotp/', { phone, otp }),
 
}
