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