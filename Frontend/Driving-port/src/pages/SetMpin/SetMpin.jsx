import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { FaShieldAlt } from 'react-icons/fa'
import toast from 'react-hot-toast'
import { MpinSet } from '../../store/slices/User-All/Mpinslice'
import GoRydLogo from '../../LOGOS/IconMain'


const SetMpin = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { loading, error } = useSelector(state => state.mpinset)

  // ← phone_number arrives automatically from RegisterPage navigate()
  const phone_number = location.state?.phone_number || ''

  const [mpin, setMPIN] = useState('')
  const [formError, setFormError] = useState('')
  const [validationError, setValidationError] = useState('')
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (mpin.length !== 6) {
      setFormError('Enter the 6-digit OTP')
      return
    }
    try {
      const result = await dispatch(MpinSet({ phone_number, mpin })).unwrap()
      toast.success(result.message || 'Mpin  Set Succesfully!')
      navigate('/login', { state: { phone_number,mpin } })
    } catch (err) {
      toast.error(err?.message || 'Ser Mpin failed')
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
              <h2 className="fw-bold text-white">Set Mpin</h2>
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
              value={mpin}
              onChange={(e) => { setMPIN(e.target.value); setFormError('') }}
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
                Send OTP & Register
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

export default SetMpin