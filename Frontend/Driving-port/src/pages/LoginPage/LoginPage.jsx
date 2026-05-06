import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import { FaCar, FaPhone, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa'
import toast from 'react-hot-toast'
import { loginUser } from '../../store/slices/User-All/LoginSlice'
import GoRydLogo from '../../LOGOS/IconMain'


const LoginPage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading, error } = useSelector(state => state.login)

  const [formData, setFormData] = useState({ phone_number: '', mpin: '' })
  const [showMpin, setShowMpin] = useState(false)
  const [formError, setFormError] = useState('')

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setFormError('')
  }

 const handleSubmit = async (e) => {
  e.preventDefault()

  // Validate
  if (!/^[6-9]\d{9}$/.test(formData.phone_number)) {
    setFormError('Enter a valid 10-digit mobile number')
    return
  }
  if (formData.mpin.length < 6) {
    setFormError('MPIN must be at least 6 digits')
    return
  }

  try {
    const result = await dispatch(loginUser(formData)).unwrap()
    
    // Store user in localStorage (should be done in your slice, but double-check)
    localStorage.setItem('user', JSON.stringify(result.user))
    
    toast.success(`Welcome back, ${result.user?.full_name || 'there'} 🚀`)

    // Navigate to role-specific home
    const roleHome = {
      customer: '/customer/home',
      driver: '/driver/dashboard',
      vehicle_owner: '/owner/dashboard',
       admin: '/admin/home',
    }
    
    const targetRoute = roleHome[result.user?.role] || '/login'
    console.log('Navigating to:', targetRoute) // Debug log
    
    // Use replace to prevent going back to login
    navigate(targetRoute, { replace: true })
    
    // Force page reload to update App.jsx state (not ideal, but works)
    // window.location.href = targetRoute
    
  } catch (err) {
    toast.error(err?.message || 'Login failed')
  }
}

 return (
  <div className="container-fluid bg-dark min-vh-100 d-flex align-items-center justify-content-center">

    <div className="card bg-dark text-light shadow-lg p-5" style={{ width: "400px" }}>

      <div className="text-center mb-4">
        <GoRydLogo className="text-warning mb-2" size={80} />
        <h3 className="fw-bold">Welcome Back</h3>
        <p className="text-muted">Sign in to continue</p>
      </div>

      {/* Phone */}
      <div className="mb-3">
        <label className="form-label">Mobile Number</label>
        <input
          type="tel"
          name="phone_number"
          className="form-control form-control-lg"
          maxLength={10}
          value={formData.phone_number}
          onChange={handleChange}
        />
      </div>

      {/* MPIN */}
      <div className="mb-3">
        <label className="form-label">MPIN</label>
        <div className="input-group">
          <input
            type={showMpin ? "text" : "password"}
            name="mpin"
            className="form-control form-control-lg"
            maxLength={6}
            value={formData.mpin}
            onChange={handleChange}
          />
          <button
            className="btn btn-outline-warning"
            onClick={() => setShowMpin(!showMpin)}
          >
            {showMpin ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>
      </div>

      {/* Errors */}
      {(formError || error) && (
        <div className="alert alert-danger py-2">
          {formError || error}
        </div>
      )}

      {/* Button */}
      <button
        type="submit"
        onClick={handleSubmit}
        className="btn btn-warning w-100 fw-bold py-2"
        disabled={loading}
      >
        {loading ? "Signing in..." : "Login"}
      </button>

      <p className="text-center mt-3 text-secondary">
        Don't have an account?{" "}
        <Link to="/register" className="text-warning fw-bold">
          Register
        </Link>
      </p>

    </div>
  </div>
)
}

export default LoginPage
