import React from 'react'

import { Link, useLocation, useNavigate } from 'react-router-dom'
import './RegisterPage.css'
import { FaCar, FaPhone } from 'react-icons/fa'
import toast from 'react-hot-toast'
import { useDispatch, useSelector } from 'react-redux'
import { MpinSet } from '../../store/slices/User-All/Mpinslice'
import { useState } from 'react'
import GoRydLogo from '../../LOGOS/IconMain'

function DemoSetmpin() {
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
              <h2 className="fw-bold text-white">Create Account</h2>
              <p className="text-muted">Start your journey with us today</p>

             
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
    </div>
  )
}

export default DemoSetmpin



return (
  <div className="container-fluid bg-dark min-vh-100 d-flex align-items-center justify-content-center">
    
    <div className="row w-100 shadow-lg rounded overflow-hidden" style={{ maxWidth: "900px" }}>
      
      {/* LEFT SIDE */}
      <div className="col-md-5 d-flex flex-column justify-content-center align-items-center bg-black text-center p-4">
        <GoRydLogo className="mb-3 text-warning" />
        <h2 className="fw-bold text-white">DrivePortal</h2>
        <p className="text-secondary">Let's get you on the road 🚗</p>
      </div>

      {/* RIGHT SIDE */}
      <div className="col-md-7 bg-dark p-5">
        
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
)



return (
  <div className="container-fluid bg-dark min-vh-100 d-flex align-items-center justify-content-center">
    
    <div className="row w-100 shadow-lg rounded overflow-hidden" style={{ maxWidth: "900px" }}>

      {/* LEFT */}
      <div className="col-md-5 bg-black text-center d-flex flex-column justify-content-center p-4">
        <GoRydLogo className="mb-3 text-warning" />
        <h2 className="text-white fw-bold">DrivePortal</h2>
        <p className="text-secondary">Let's get you on the road 🚗</p>
      </div>

      {/* RIGHT */}
      <div className="col-md-7 bg-dark p-5">

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
            {ROLES.map(r => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

        {/* Phone */}
        <div className="mb-3">
          <label className="form-label text-light">Mobile Number</label>
          <input
            type="tel"
            name="phone_number"
            className="form-control form-control-lg"
            placeholder="Enter 10-digit number"
            maxLength={10}
            value={formData.phone_number}
            onChange={handleChange}
          />
        </div>

        {/* Errors */}
        {(validationError || error) && (
          <div className="alert alert-danger py-2">
            {validationError || error}
          </div>
        )}

        {/* Button */}
        <button
          onClick={handleSubmit}
          className="btn btn-warning w-100 fw-bold py-2"
          disabled={loading}
        >
          {loading ? "Sending OTP..." : "Send OTP"}
        </button>

        <p className="text-center mt-3 text-secondary">
          Already have an account?{" "}
          <span
            className="text-warning fw-bold"
            style={{ cursor: "pointer" }}
            onClick={() => navigate("/login")}
          >
            Login
          </span>
        </p>

      </div>
    </div>
  </div>
)