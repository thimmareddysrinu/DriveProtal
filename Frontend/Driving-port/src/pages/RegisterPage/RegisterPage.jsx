import { Link, useLocation, useNavigate } from 'react-router-dom'
import './RegisterPage.css'
import { FaCar, FaPhone } from 'react-icons/fa'
import toast from 'react-hot-toast'
import { useDispatch, useSelector } from 'react-redux'
import { registerUser } from '../../store/slices/User-All/RegisterUserSlice'
import { useState } from 'react'
import GoRydLogo from '../../LOGOS/IconMain'


// Role options — label shown to user, value sent to backend
const ROLES = [
  { label: '🧑‍💼 Customer ', value: 'customer' },
  { label: '🚗 Driver (Rider)',             value: 'driver'   },
  { label: '🏢 Vehicle Owner',      value: 'vehicle_owner' },
]

const RegisterPage = () => {
  const location=useLocation()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading, error } = useSelector(state => state.register)

  const [formData, setFormData] = useState({
    phone_number: '',
    role: 'customer',   // default role
  })

  const [validationError, setValidationError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setValidationError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Client-side validation
    if (!/^[6-9]\d{9}$/.test(formData.phone_number)) {
      setValidationError('Enter a valid 10-digit mobile number')
      return
    }
    if (!formData.role) {
      setValidationError('Please select a role')
      return
    }

    try {
      const result = await dispatch(registerUser(formData)).unwrap()
      toast.success(result.message || 'OTP sent! Please verify.')
      // Navigate to OTP page, pass phone_number + role via state
      navigate('/verify-otp', { state: { phone_number: formData.phone_number } })
    } catch (err) {
      toast.error(err?.message || 'Registration failed')
    }
  }

  return (
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
              <h2 className="fw-bold text-white">Create Account</h2>
              <p className="text-muted">Start your journey with us today</p>

              {/* <select className="form-control mb-5 "  style={{'height':'50px',"background":'#a4959500',"color":'#a49465fb'}}
                >
                <option>👤 Customer</option>
                <option>🚗 Driver</option>
                <option>🚗 vehicle owner</option>
              </select> */}
               <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                 className="form-control role-select mb-5 "  style={{'height':'50px',"background":'#a4959500',"color":'#a49465fb'}}
                >
                  {ROLES.map(r => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>

              <input
                 type="tel"
                  name="phone_number"
                  placeholder="10-digit mobile number"
                  maxLength={10}
                  value={formData.phone_number}
                  onChange={handleChange}
                className="form-control role-select mb-5 "
                
                style={{'height':'50px',"background":'#0000',"color":'#d2ae0dd5'}}
                

              />
               {/* Validation Error */}
            {(validationError || error) && (
              <span className="error">{validationError || error}</span>
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
  )
}

export default RegisterPage
