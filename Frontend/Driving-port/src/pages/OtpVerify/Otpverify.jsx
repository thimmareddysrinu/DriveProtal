import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { FaShieldAlt } from 'react-icons/fa'
import toast from 'react-hot-toast'
import { verifyOTP } from '../../store/slices/User-All/OtpSlice'
import GoRydLogo from '../../LOGOS/IconMain'


const Otpverify = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { loading, error } = useSelector(state => state.otpverify)
  const [validationError, setValidationError] = useState('')

  // ← phone_number arrives automatically from RegisterPage navigate()
  const phone_number = location.state?.phone_number || ''

  const [otp, setOtp] = useState('')
  const [formError, setFormError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (otp.length !== 6) {
      setFormError('Enter the 6-digit OTP')
      return
    }
    try {
      const result = await dispatch(verifyOTP({ phone_number, otp })).unwrap()
      toast.success(result.message || 'OTP verified!')
      navigate('/set-mpin', { state: { phone_number } })
    } catch (err) {
      toast.error(err?.message || 'OTP verification failed')
    }
  }

  const handleResend = async () => {
    try {
      const result = await dispatch(resendOTP({ phone_number })).unwrap()
      toast.success(result.message || 'OTP resent!')
      setOtp('')
    } catch (err) {
      toast.error(err?.message || 'Resend failed')
    }
  }

  return (
    <div>
        <div className="register-page">

      <div className="container-fluid " style={{"marginTop":"4px"}}>
        <div className="row vh-100">

          {/* LEFT SIDE */}
          <div className="col-md-5 d-flex flex-column justify-content-center align-items-center left-side" style={{"background":"#191816e2", }}>

          
            < GoRydLogo className="mb-3 text-warning" />
            <h1 className="fw-bold text-white">DrivePortal</h1>
            <p className="text-secondary">Let's get you on the road </p>
            
          </div>

          {/* RIGHT SIDE */}
          <div className="col-md-7 d-flex justify-content-center align-items-center">
            
            <div className="card bg-dark register-card p-4">
              <h2 className="fw-bold text-white">Verify Otp</h2>
              <p className="text-muted">Start your journey with us today</p>

             
              

              <input
                 type="tel"
                  name="phone_number"
                  placeholder="10-digit mobile number"
                  maxLength={10}
                  value={phone_number}
                 
                className="form-control role-select mb-5 "
                
                style={{'height':'50px',"background":'#0000',"color":'#d2ae0dd5'}}
                

              />
               <input
                  type="tel"
              placeholder="Enter 6-digit OTP"
              maxLength={6}
              value={otp}
              onChange={(e) => { setOtp(e.target.value); setFormError('') }}
              autoFocus
                className="form-control role-select mb-5 "
                
                style={{'height':'50px',"background":'#0000',"color":'#d2ae0dd5'}}
                

              />
               {/* Validation Error */}
            {(validationError || error) && (
              <span className="error">{validationError || error}</span>
            )}
            {(formError || error) && (
            <span className="otp-error">{formError || error}</span>
          )}

              <button onClick={handleSubmit} className="btn btn-warning w-100 fw-bold"style={{'height':'50px'}}>
                Submit Otp & set Mpin
              </button>

              <p className="text-center mt-3 text-secondary">
                Already have an account? <span className="text-warning">Login here</span>
              </p>
            </div>

          </div>

        </div>
      </div>
      

    </div>
    </div>
  )
}

export default Otpverify