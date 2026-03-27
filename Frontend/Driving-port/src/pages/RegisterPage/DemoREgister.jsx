import { FaCar } from 'react-icons/fa'
import GoRydLogo from '../../LOGOS/IconMain'


function DemoRegister() {
  return (
   
      <div className="register-page">
      {/* Left Panel */}
      <div className="register-left">
        <FaCar className="reg-brand-icon" />
        <h1>DrivePortal</h1>
        <p>Let's get you on the road 🚀</p>
      </div>

      {/* Right Panel */}
      <div className="register-right">
        <div className="register-card glass">
          <h2>Create Account</h2>
          <p className="reg-desc">Start your journey with us today</p>

          <form onSubmit={handleSubmit} className="reg-form">

            {/* Role Dropdown */}
            <div className="form-group">
              {/* <label>I am a...</label> */}
              <div className="input-wrapper">
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="role-select"
                >
                  {ROLES.map(r => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Phone Number */}
            <div className="form-group">
              {/* <label>Mobile Number</label> */}
              <div className="input-wrapper">
                <FaPhone className="input-icon" />
                <input
                  type="tel"
                  name="phone_number"
                  placeholder="10-digit mobile number"
                  maxLength={10}
                  value={formData.phone_number}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Validation Error */}
            {(validationError || error) && (
              <span className="error">{validationError || error}</span>
            )}

            {/* Submit */}
            <button
              type="submit"
              className="btn-primary-custom w-100"
              disabled={loading}
            >
              {loading ? 'Sending OTP...' : 'Send OTP & Register'}
            </button>
          </form>

          <p className="reg-footer">
            Already have an account? <Link to="/login">Login here</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default DemoRegister