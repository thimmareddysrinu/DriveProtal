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
          <div className="col-md-7 d-flex flex-column justify-content-center align-items-center left-side" style={{"background":"#191816e2", }}>

          
            < GoRydLogo className="mb-3 text-warning" />
            <h1 className="fw-bold text-white">DrivePortal</h1>
            <p className="text-secondary">Let's get you on the road </p>
            
          </div>



          {/* RIGHT SIDE */}
         <div className="col-md-5 bg-dark p-5">
        
        <div className="text-center mb-4">
          <FaShieldAlt size={40} className="text-warning mb-2" />
          <h3 className="fw-bold text-white">Set MPIN</h3>
          <p className="text-muted">Secure your account with 6-digit MPIN</p>
        </div>

        {/* Phone Number */}
        <div className="mb-3">
          <label className="form-label text-light">Phone Number</label>
          <input
            type="text"
            className="form-control form-control-lg"
            value={phone_number}
            disabled
          />
        </div>

        {/* MPIN Input */}
        <div className="mb-3">
          <label className="form-label text-light">Enter MPIN</label>
          <input
            type="password"
            className="form-control form-control-lg text-center fw-bold"
            maxLength={6}
            value={mpin}
            onChange={(e) => {
              setMPIN(e.target.value)
              setFormError('')
            }}
          />
        </div>

        {/* Errors */}
        {(validationError || error) && (
          <div className="alert alert-danger py-2">
            {validationError || error}
          </div>
        )}

        {(formError || error) && (
          <div className="alert alert-warning py-2">
            {formError || error}
          </div>
        )}

        {/* Button */}
        <button
          onClick={handleSubmit}
          className="btn btn-warning w-100 fw-bold py-2"
          disabled={loading}
        >
          {loading ? "Processing..." : "Set MPIN"}
        </button>

        {/* Footer */}
        <p className="text-center mt-3 text-secondary">
          Already have an account?{" "}
          <span
            className="text-warning fw-bold"
            style={{ cursor: "pointer" }}
            onClick={() => navigate("/login")}
          >
            Login here
          </span>
        </p>

      </div>

        </div>
      </div>
      

    </div>
    </div>
    
    
   


  )
}

export default SetMpin