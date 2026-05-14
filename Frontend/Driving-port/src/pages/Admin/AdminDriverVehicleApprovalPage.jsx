import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams, useNavigate } from 'react-router-dom'
import { FaStar, FaUser, FaCar } from 'react-icons/fa'
import {
  AdminDriverDetail,
  AdminVehicleApproval,
  AdminProfileApproval,
} from '../../store/slices/Admin/AdminvehicleApprove'

function AdminDriverVehicleApprovalPage() {
  const [activeTab, setActiveTab] = useState('profile')
  const [vehicleAction, setVehicleAction] = useState('')
  const [profileAction, setProfileAction] = useState('')

  const { id } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { driverDetail, loading, error, actionLoading } = useSelector(
    (state) => state.adminDriverlist
  )

  useEffect(() => {
    if (id) {
      dispatch(AdminDriverDetail(id))
    }
  }, [dispatch, id])

  const handleVehicleApproval = async (e, vehicleId) => {
    e.preventDefault()
    if (!vehicleAction) {
      alert('Please select approve or reject')
      return
    }
    try {
      await dispatch(
        AdminVehicleApproval({
          id: vehicleId,
          action: vehicleAction,
        })
      ).unwrap()
      alert('Vehicle approval updated successfully!')
      setVehicleAction('')
      dispatch(AdminDriverDetail(id))
    } catch (err) {
      alert('Approval failed: ' + (err?.message || 'Unknown error'))
    }
  }

  const handleProfileApproval = async (e) => {
    e.preventDefault()
    if (!profileAction) {
      alert('Please select approve or reject')
      return
    }
    try {
      await dispatch(
        AdminProfileApproval({
          id,
          action: profileAction,
        })
      ).unwrap()
      alert('Profile approval updated successfully!')
      setProfileAction('')
      dispatch(AdminDriverDetail(id))
    } catch (err) {
      alert('Approval failed: ' + (err?.message || 'Unknown error'))
    }
  }

  const goBack = () => {
    navigate('/admin/home')
  }

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#0F0F1A',
          color: '#fff',
          padding: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div className="text-center">
          <div
            className="spinner-border text-warning"
            style={{ width: '3rem', height: '3rem' }}
          ></div>
          <p className="mt-3">Loading driver details...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', background: '#0F0F1A', color: '#fff', padding: '24px' }}>
        <div className="alert alert-danger text-center">
          <h4>Error loading driver details</h4>
          <p>{error}</p>
          <button className="btn btn-warning" onClick={() => dispatch(AdminDriverDetail(id))}>
            Retry
          </button>
          <button className="btn btn-secondary ms-2" onClick={goBack}>
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  if (!driverDetail) {
    return (
      <div style={{ minHeight: '100vh', background: '#0F0F1A', color: '#fff', padding: '24px' }}>
        <div className="alert alert-warning text-center">
          <h4>No driver found</h4>
          <p>Driver with ID {id} not found.</p>
          <button className="btn btn-secondary" onClick={goBack}>
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  const driver = driverDetail || {}
  const vehicles = driver.vehicles || []

  return (
    <div style={{ minHeight: '100vh', background: '#0F0F1A', color: '#fff', padding: '24px' }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 style={{ fontFamily: 'Poppins, sans-serif' }}>
          Driver Approval #{driver.id} - {driver.full_name || 'Driver'}
        </h2>
        <button className="btn btn-secondary" onClick={goBack}>
          Back to Dashboard
        </button>
      </div>

      <div className="row mb-4 g-3">
        <div className="col-md-6 col-lg-4">
          <div className="card bg-transparent border-light text-white p-4 h-100">
            <div className="d-flex align-items-center">
              <FaUser className="fs-1 text-warning me-3" />
              <div>
                <div className="fs-5 fw-bold">{driver.full_name || 'N/A'}</div>
                <div className="text-muted">{driver.phone_number || 'N/A'}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3 col-lg-2">
          <div className="card bg-transparent border-light text-white p-4 text-center h-100">
            <FaStar className="fs-2 text-warning mb-2" />
            <div className="fs-4 fw-bold">{driver.rating || '0.00'}</div>
            <div className="text-muted small">Rating</div>
          </div>
        </div>

        <div className="col-md-3 col-lg-2">
          <div className="card bg-transparent border-light text-white p-4 text-center h-100">
            <FaCar className="fs-2 text-warning mb-2" />
            <div className="fs-4 fw-bold">{vehicles.length}</div>
            <div className="text-muted small">Vehicles</div>
          </div>
        </div>

        <div className="col-md-6 col-lg-4">
          <div className="card bg-transparent border-light text-white p-4 h-100">
            <div className="d-flex align-items-center">
              <div className={`badge fs-6 me-3 p-2 ${driver.verification_status === 'approved' ? 'bg-success' : 'bg-warning text-dark'}`}>
                {driver.verification_status === 'approved' ? 'PROFILE VERIFIED' : 'PROFILE PENDING'}
              </div>
              <div>
                <div className="fs-6 fw-bold">Status</div>
                <div className="text-muted small">Profile Verification</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card bg-transparent border-light mb-4">
        <ul className="nav nav-tabs bg-dark border-0">
          <li className="nav-item">
            <button
              className={`nav-link border-0 px-4 py-3 ${activeTab === 'profile' ? 'active text-warning fw-bold' : 'text-warning'}`}
              onClick={() => setActiveTab('profile')}
            >
              Profile
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link border-0 px-4 py-3 ${activeTab === 'vehicle' ? 'active text-warning fw-bold' : 'text-warning'}`}
              onClick={() => setActiveTab('vehicle')}
            >
              Vehicles
            </button>
          </li>
        </ul>

        {activeTab === 'profile' && (
          <div className="card-body p-4">
            <div className="row">
              <div className="col-md-12">
                <table className="table table-dark table-bordered">
                  <tbody>
                    <tr><th>Full Name</th><td>{driver.full_name || 'N/A'}</td></tr>
                    <tr><th>Phone</th><td>{driver.phone_number || 'N/A'}</td></tr>
                    <tr><th>License Number</th><td>{driver.license_number || 'N/A'}</td></tr>
                    <tr><th>License Expiry</th><td>{driver.license_expiry || 'N/A'}</td></tr>
                    <tr><th>Aadhar Number</th><td>{driver.aadhar_number || 'N/A'}</td></tr>
                    <tr><th>PAN Number</th><td>{driver.pan_number || 'N/A'}</td></tr>
                    <tr><th>Bank Account</th><td>{driver.bank_account_number || 'N/A'}</td></tr>
                    <tr><th>IFSC</th><td>{driver.bank_ifsc || 'N/A'}</td></tr>
                  </tbody>
                </table>
                <div className='d-flex flex-row g-3 align-items-center flex-wrap'>
                  {driver.aadhar_image && (
                    <div className="position-relative m-3">
                      <img
                        src={`http://127.0.0.1:8000${driver.aadhar_image}`}
                        alt="Aadhar"
                        className="img-fluid rounded shadow-lg"
                        style={{ height: '200px', objectFit: 'cover' }}
                      />
                      <div className="position-absolute top-0 end-0 m-2">
                        <span className="badge bg-dark">Aadhar</span>
                      </div>
                    </div>
                  )}

                  {driver.license_image && (
                    <div className="position-relative m-3">
                      <img
                        src={`http://127.0.0.1:8000${driver.license_image}`}
                        alt="License"
                        className="img-fluid rounded shadow-lg"
                        style={{ height: '200px', objectFit: 'cover' }}
                      />
                      <div className="position-absolute top-0 end-0 m-2">
                        <span className="badge bg-dark">License</span>
                      </div>
                    </div>
                  )}

                  {driver.pan_image && (
                    <div className="position-relative m-3">
                      <img
                        src={`http://127.0.0.1:8000${driver.pan_image}`}
                        alt="PAN"
                        className="img-fluid rounded shadow-lg"
                        style={{ height: '200px', objectFit: 'cover' }}
                      />
                      <div className="position-absolute top-0 end-0 m-2">
                        <span className="badge bg-dark">PAN</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {driver.verification_status !== 'approved' && (
                <div className="col-md-12 mt-4">
                  <form onSubmit={handleProfileApproval} className="pt-4 border-top border-light">
                    <div className="d-flex gap-4 align-items-center flex-wrap">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="profileAction"
                          value="approve"
                          id="approveProfile"
                          checked={profileAction === 'approve'}
                          onChange={(e) => setProfileAction(e.target.value)}
                        />
                        <label htmlFor="approveProfile" className="form-check-label text-success fs-5 fw-bold">
                          Approve Profile
                        </label>
                      </div>

                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="profileAction"
                          value="reject"
                          id="rejectProfile"
                          checked={profileAction === 'reject'}
                          onChange={(e) => setProfileAction(e.target.value)}
                        />
                        <label htmlFor="rejectProfile" className="form-check-label text-danger fs-5 fw-bold">
                          Reject Profile
                        </label>
                      </div>

                      <button
                        type="submit"
                        className="btn btn-success btn-lg ms-auto px-5"
                        disabled={actionLoading}
                      >
                        {actionLoading ? 'Processing...' : 'Update Profile Approval'}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'vehicle' && (
          <div className="card-body p-4">
            {vehicles.length === 0 ? (
               <div className="alert alert-info">No vehicles found for this driver.</div>
            ) : (
              vehicles.map((v) => (
                <div key={v.id} className="mb-5 p-4 border rounded bg-dark border-light">
                  <div className="d-flex justify-content-between align-items-start mb-4">
                    <h5 className="mb-0">
                      Vehicle - {v.registration_number?.toUpperCase()}
                    </h5>
                    <span className={`badge fs-6 px-3 py-2 ${v.is_verified ? 'bg-success' : 'bg-warning text-dark'}`}>
                      {v.is_verified ? 'VERIFIED' : 'PENDING'}
                    </span>
                  </div>

                  <div className="row">
                    <div className="col-lg-8">
                      <div className="row g-3">
                        <div className="col-md-6">
                          <table className="table table-dark table-sm w-100">
                            <tbody>
                              <tr><th>Brand</th><td>{v.brand}</td></tr>
                              <tr><th>Model</th><td>{v.vehiclemodel}</td></tr>
                              <tr><th>Type</th><td>{v.vehicle}</td></tr>
                              <tr><th>Year</th><td>{v.year}</td></tr>
                              <tr><th>Color</th><td>{v.colour}</td></tr>
                              <tr><th>Seats</th><td>{v.seat_capacity}</td></tr>
                              <tr><th>Fuel</th><td>{v.fuel_type}</td></tr>
                              <tr><th>Transmission</th><td>{v.transmission_type}</td></tr>
                            </tbody>
                          </table>
                        </div>

                        <div className="col-md-6">
                          <table className="table table-dark table-sm w-100">
                            <tbody>
                              <tr>
                                <th>Status</th>
                                <td>
                                  <span className="badge bg-info">
                                    {v.is_active || 'Not Set'}
                                  </span>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>

                    <div className="col-lg-3">
                      {v.vehicle_front && (
                        <div className="position-relative mb-3">
                          <img
                            src={`http://127.0.0.1:8000${v.vehicle_front}`}
                            alt={`${v.brand} ${v.vehiclemodel}`}
                            className="img-fluid rounded shadow-lg w-100"
                            style={{ height: '250px', objectFit: 'cover' }}
                          />
                          <div className="position-absolute top-0 end-0 m-2">
                            <span className="badge bg-dark">Front View</span>
                          </div>
                        </div>
                      )}

                      {v.insurance_image && (
                        <div className="position-relative mb-3">
                          <img
                            src={`http://127.0.0.1:8000${v.insurance_image}`}
                            alt="Insurance"
                            className="img-fluid rounded shadow-lg w-100"
                            style={{ height: '250px', objectFit: 'cover' }}
                          />
                          <div className="position-absolute top-0 end-0 m-2">
                            <span className="badge bg-dark">Insurance</span>
                          </div>
                        </div>
                      )}

                      {v.pollution_image && (
                        <div className="position-relative mb-3">
                          <img
                            src={`http://127.0.0.1:8000${v.pollution_image}`}
                            alt="Pollution"
                            className="img-fluid rounded shadow-lg w-100"
                            style={{ height: '250px', objectFit: 'cover' }}
                          />
                          <div className="position-absolute top-0 end-0 m-2">
                            <span className="badge bg-dark">Pollution</span>
                          </div>
                        </div>
                      )}

                      {v.rc_book_image && (
                        <div className="position-relative mb-3">
                          <img
                            src={`http://127.0.0.1:8000${v.rc_book_image}`}
                            alt="RC Book"
                            className="img-fluid rounded shadow-lg w-100"
                            style={{ height: '250px', objectFit: 'cover' }}
                          />
                          <div className="position-absolute top-0 end-0 m-2">
                            <span className="badge bg-dark">RC Book</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {!v.is_verified && (
                    <form
                      onSubmit={(e) => handleVehicleApproval(e, v.id)}
                      className="mt-4 pt-4 border-top border-light"
                    >
                      <div className="d-flex gap-4 align-items-center flex-wrap">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="radio"
                            name={`vehicleAction-${v.id}`}
                            value="approve"
                            id={`approveVehicle-${v.id}`}
                            checked={vehicleAction === 'approve'}
                            onChange={(e) => setVehicleAction(e.target.value)}
                          />
                          <label htmlFor={`approveVehicle-${v.id}`} className="form-check-label text-success fs-5 fw-bold">
                            Approve Vehicle
                          </label>
                        </div>

                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="radio"
                            name={`vehicleAction-${v.id}`}
                            value="reject"
                            id={`rejectVehicle-${v.id}`}
                            checked={vehicleAction === 'reject'}
                            onChange={(e) => setVehicleAction(e.target.value)}
                          />
                          <label htmlFor={`rejectVehicle-${v.id}`} className="form-check-label text-danger fs-5 fw-bold">
                            Reject Vehicle
                          </label>
                        </div>

                        <button
                          type="submit"
                          className="btn btn-success btn-lg ms-auto px-5"
                          disabled={actionLoading}
                        >
                          {actionLoading ? 'Processing...' : 'Update Vehicle Approval'}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminDriverVehicleApprovalPage