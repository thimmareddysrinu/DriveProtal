import { Link, useLocation, useNavigate } from 'react-router-dom'
import './RegisterPage.css'
import { FaCar, FaPhone } from 'react-icons/fa'
import toast from 'react-hot-toast'
import { useDispatch, useSelector } from 'react-redux'
import { registerUser } from '../../store/slices/User-All/RegisterUserSlice'
import { useState } from 'react'
import GoRydLogo from '../../LOGOS/IconMain'
import { FaShieldAlt } from 'react-icons/fa'


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
  const [formError, setFormError] = useState('')

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
    <div className="container-fluid bg-dark min-vh-100 d-flex align-items-center justify-content-center">

      <div className="row w-100 shadow-lg rounded overflow-hidden" style={{  }}>

        {/* LEFT SIDE (7 columns) */}
        <div className="col-md-7 bg-black d-flex flex-column justify-content-center align-items-center text-center p-5">
          <GoRydLogo className="mb-3 text-warning" />
          <h1 className="text-white fw-bold">DrivePortal</h1>
          <p className="text-secondary">Let's get you on the road 🚗</p>
        </div>

        {/* RIGHT SIDE (5 columns) */}
        <div className="col-md-5 bg-dark p-5">

          <h3 className="text-white fw-bold mb-3">Create Account</h3>
          <p className="text-muted mb-4">Start your journey with us</p>

          {/* Role */}
          <div className="mb-3">
            <label className="form-label text-light">Select Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="form-select form-select-lg"
            >
              {ROLES.map(role => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
          </div>

          {/* Phone Number */}
          <div className="mb-3">
            <label className="form-label text-light">Mobile Number</label>
            <input
              type="tel"
              name="phone_number"
              className="form-control form-control-lg"
              placeholder="Enter 10-digit mobile number"
              maxLength={10}
              value={formData.phone_number}
              onChange={handleChange}
            />
          </div>

          {/* Error Messages */}
          {(validationError || error) && (
            <div className="alert alert-danger py-2">
              {validationError || error}
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            className="btn btn-warning w-100 fw-bold py-2"
            disabled={loading}
          >
            {loading ? "Sending OTP..." : "Send OTP"}
          </button>

          {/* Footer */}
          <p className="text-center mt-3 text-secondary">
            Already have an account?{" "}
            <span
              className="text-warning fw-bold"
              style={{ cursor: "pointer" }}
              onClick={() => navigate('/login')}
            >
              Login
            </span>
          </p>

        </div>
      </div>
    </div>
  )
}

export default RegisterPage