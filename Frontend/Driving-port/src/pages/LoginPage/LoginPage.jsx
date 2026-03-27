import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import { FaCar, FaPhone, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa'
import toast from 'react-hot-toast'
import { loginUser } from '../../store/slices/User-All/LoginSlice'


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
    <div className="login-page">

      {/* Left Panel */}
      <div className="login-left">
        <div className="login-brand">
          <FaCar className="login-brand-icon" />
          <h1>DrivePortal</h1>
          <p>Your ride, your way</p>
        </div>
        <div className="login-features">
          {['Real-time tracking', 'Safe & Secure rides', 'Best prices in town'].map(f => (
            <div key={f} className="login-feature">✓ {f}</div>
          ))}
        </div>
      </div>

      {/* Right Panel */}
      <div className="login-right">
        <div className="login-card glass">
          <h2>Welcome Back</h2>
          <p className="login-desc">Sign in to continue your journey</p>

          <form onSubmit={handleSubmit} className="login-form">

            {/* Phone Number */}
            <div className="form-group">
              <label>Mobile Number</label>
              <div className="input-wrapper">
                <FaPhone className="input-icon" />
                <input
                  type="tel"
                  name="phone_number"
                  placeholder="Enter 10-digit mobile number"
                  maxLength={10}
                  value={formData.phone_number}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* MPIN */}
            <div className="form-group">
              <label>MPIN</label>
              <div className="input-wrapper">
                <FaLock className="input-icon" />
                <input
                  type={showMpin ? 'text' : 'password'}
                  name="mpin"
                  placeholder="Enter your MPIN"
                  maxLength={6}
                  value={formData.mpin}
                  onChange={handleChange}
                />
                <button type="button" className="eye-btn" onClick={() => setShowMpin(!showMpin)}>
                  {showMpin ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* Errors */}
            {(formError || error) && (
              <span className="error">{formError || error}</span>
            )}

            {/* Submit */}
            <button type="submit" className="btn-primary-custom w-100" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="login-footer">
            Don't have an account? <Link to="/register">Register here</Link>
          </p>
        </div>
      </div>

    </div>
  )
}

export default LoginPage
