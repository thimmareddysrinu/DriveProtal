import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams, useNavigate } from 'react-router-dom'
import { FaStar, FaRupeeSign, FaUser, FaCar } from 'react-icons/fa'
import {
  AdminDriverDetail,
  AdminVehicleApproval,
  AdminProfileApproval
} from '../../store/slices/Admin/AdminvehicleApprove'

function AdminVehicleApprovalPage() {
  const [activeTab, setActiveTab] = useState('profile')
  const [vehicleAction, setVehicleAction] = useState('')
  const [profileAction, setProfileAction] = useState('')
  const { id } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { driverDetail, loading, error, actionLoading } = useSelector(
    (state) => state.adminlist
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
      await dispatch(AdminVehicleApproval({
        id: vehicleId,
        action: vehicleAction
      })).unwrap()
      alert('Vehicle approval updated successfully!')
      setVehicleAction('')
      // Refresh driver details
      dispatch(AdminDriverDetail(id))
    } catch (err) {
      alert('Approval failed: ' + (err.message || 'Unknown error'))
    }
  }

  const handleProfileApproval = async (e) => {
    e.preventDefault()
    if (!profileAction) {
      alert('Please select approve or reject')
      return
    }
    try {
      await dispatch(AdminProfileApproval({
        id: parseInt(id),
        action: profileAction
      })).unwrap()
      alert('Profile approval updated successfully!')
      setProfileAction('')
      // Refresh driver details
      dispatch(AdminDriverDetail(id))
    } catch (err) {
      alert('Approval failed: ' + (err.message || 'Unknown error'))
    }
  }

  const goBack = () => {
    navigate('/admin/home')
  }

  // Loading state
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0F0F1A', color: '#fff', padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="text-center">
          <div className="spinner-border text-warning" style={{ width: '3rem', height: '3rem' }}></div>
          <p className="mt-3">Loading driver details...</p>
        </div>
      </div>
    )
  }

  // Error state
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

  // No driver data
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

  return (
    <div style={{ minHeight: '100vh', background: '#0F0F1A', color: '#fff', padding: '24px' }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 style={{ fontFamily: 'Poppins, sans-serif' }}>
          Driver Approval #{driverDetail.id} - {driverDetail.full_name}
        </h2>
        <button className="btn btn-secondary" onClick={goBack}>
          Back to Dashboard
        </button>
      </div>

      {/* Stats Cards */}
      <div className="row mb-4 g-3">
        <div className="col-md-6 col-lg-4">
          <div className="card bg-transparent border-light text-white p-4 h-100">
            <div className="d-flex align-items-center">
              <FaUser className="fs-1 text-warning me-3" />
              <div>
                <div className="fs-5 fw-bold">{driverDetail.full_name}</div>
                <div className="text-muted">{driverDetail.phone_number}</div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3 col-lg-2">
          <div className="card bg-transparent border-light text-white p-4 text-center h-100">
            <FaStar className="fs-2 text-warning mb-2" />
            <div className="fs-4 fw-bold">{driverDetail.rating || '0.00'}</div>
            <div className="text-muted small">Rating</div>
          </div>
        </div>
        <div className="col-md-3 col-lg-2">
          <div className="card bg-transparent border-light text-white p-4 text-center h-100">
            <FaCar className="fs-2 text-warning mb-2" />
            <div className="fs-4 fw-bold">{driverDetail.vehicles?.length || 0}</div>
            <div className="text-muted small">Vehicles</div>
          </div>
        </div>
        <div className="col-md-6 col-lg-4">
          <div className="card bg-transparent border-light text-white p-4 h-100">
            <div className="d-flex align-items-center">
              <div className={`badge fs-6 me-3 p-2 ${driverDetail.verification_status === 'approved' ? 'bg-success' : 'bg-warning'}`}>
                {driverDetail.verification_status?.toUpperCase() || 'PENDING'}
              </div>
              <div>
                <div className="fs-6 fw-bold">Status</div>
                <div className="text-muted small">Profile Verification</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TABS */}
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
              Vehicles ({driverDetail.vehicles?.length || 0})
            </button>
          </li>
        </ul>

        {/* PROFILE TAB */}
        {activeTab === 'profile' && (
          <div className="card-body p-4">
            <div className="row">
              <div className="col-md-6">
                <table className="table table-dark table-bordered">
                  <tbody>
                    <tr><th>Full Name</th><td>{driverDetail.full_name}</td></tr>
                    <tr><th>Phone</th><td>{driverDetail.phone_number}</td></tr>
                    <tr><th>License No.</th><td>{driverDetail.license_number}</td></tr>
                    <tr><th>License Expiry</th><td>{driverDetail.license_expiry}</td></tr>
                    <tr><th>Aadhar</th><td>{driverDetail.aadhar_number}</td></tr>
                    <tr><th>PAN</th><td>{driverDetail.pan_number}</td></tr>
                    <tr><th>Bank Account</th><td>{driverDetail.bank_account_number}</td></tr>
                    <tr><th>IFSC</th><td>{driverDetail.bank_ifsc}</td></tr>
                   
                  </tbody>
                </table>
                  <div className="position-relative">
                          <img
                            src={`http://127.0.0.1:8000${driverDetail.aadhar_image}`}
                            alt={`${driverDetail.full_name} `}
                            className="img-fluid rounded shadow-lg w-100"
                            style={{ height: '300px', objectFit: 'cover' }}
                          />
                          <div className="position-absolute top-0 end-0 m-2">
                            <span className="badge bg-dark">Front View</span>
                          </div>
                        </div>
                         <div className="position-relative">
                          <img
                            src={`http://127.0.0.1:8000${driverDetail.license_image}`}
                            alt={`${driverDetail.full_name} `}
                            className="img-fluid rounded shadow-lg w-100"
                            style={{ height: '300px', objectFit: 'cover' }}
                          />
                          <div className="position-absolute top-0 end-0 m-2">
                            <span className="badge bg-dark">Front View</span>
                          </div>
                        </div>

                         <div className="position-relative">
                          <img
                            src={`http://127.0.0.1:8000${driverDetail.pan_image}`}
                            alt={`${driverDetail.full_name} `}
                            className="img-fluid rounded shadow-lg w-100"
                            style={{ height: '300px', objectFit: 'cover' }}
                          />
                          <div className="position-absolute top-0 end-0 m-2">
                            <span className="badge bg-dark">Front View</span>
                          </div>
                        </div>
              </div>
              <div className="col-md-6">
                <div className="text-center">
                  <div className="mb-3">
                    <span className={`badge fs-5 px-4 py-3 ${driverDetail.verification_status === 'approved' ? 'bg-success' : 'bg-warning'}`}>
                      {driverDetail.verification_status?.toUpperCase() || 'PENDING'}
                    </span>
                  </div>
                  {driverDetail.verification_status !== 'approved' && (
                    <form onSubmit={handleProfileApproval}>
                      <div className="form-check form-check-inline mb-3">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="profileAction"
                          value="approve"
                          id="approveProfile"
                          checked={profileAction === 'approve'}
                          onChange={(e) => setProfileAction(e.target.value)}
                        />
                        <label htmlFor="approveProfile" className="form-check-label text-success fs-5">
                          Approve Profile
                        </label>
                      </div>
                      <div className="form-check form-check-inline mb-3">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="profileAction"
                          value="reject"
                          id="rejectProfile"
                          checked={profileAction === 'reject'}
                          onChange={(e) => setProfileAction(e.target.value)}
                        />
                        <label htmlFor="rejectProfile" className="form-check-label text-danger fs-5">
                          Reject Profile
                        </label>
                      </div>
                      <button
                        type="submit"
                        className="btn btn-success btn-lg w-100"
                        disabled={actionLoading}
                      >
                        {actionLoading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            Processing...
                          </>
                        ) : (
                          'Submit Profile Approval'
                        )}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VEHICLE TAB */}
        {activeTab === 'vehicle' && (
          <div className="card-body p-4">
            {driverDetail.vehicles && driverDetail.vehicles.length > 0 ? (
              driverDetail.vehicles.map((vehicle, index) => (
                <div key={vehicle.id} className="mb-5 p-4 border rounded bg-dark border-light">
                  <div className="d-flex justify-content-between align-items-start mb-4">
                    <h5 className="mb-0">
                      Vehicle {index + 1} - {vehicle.registration_number?.toUpperCase()}
                    </h5>
                    <span className={`badge fs-6 px-3 py-2 ${vehicle.is_verified ? 'bg-success' : 'bg-warning'}`}>
                      {vehicle.is_verified ? 'VERIFIED' : 'PENDING'}
                    </span>
                  </div>

                  <div className="row">
                    <div className="col-lg-8">
                      <div className="row g-3">
                        <div className="col-md-6">
                          <table className="table table-dark table-sm w-100">
                            <tbody>
                              <tr><th>Brand</th><td>{vehicle.brand}</td></tr>
                              <tr><th>Model</th><td>{vehicle.vehiclemodel}</td></tr>
                              <tr><th>Type</th><td>{vehicle.vehicle}</td></tr>
                              <tr><th>Year</th><td>{vehicle.year}</td></tr>
                              <tr><th>Color</th><td>{vehicle.colour}</td></tr>
                              <tr><th>Seats</th><td>{vehicle.seat_capacity}</td></tr>
                              <tr><th>Status</th>
                                <td>
                                  <span className="badge bg-info">
                                    {vehicle.is_active || 'Not Set'}
                                  </span>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                        <div className="col-md-6">
                          <table className="table table-dark table-sm w-100">
                            <tbody>
                              <tr><th>Sharing Price</th><td>₹{vehicle.sharing_price}</td></tr>
                              <tr><th>Extra KM</th><td>₹{vehicle.extra_km_charge}</td></tr>
                              <tr><th>Total Distance</th><td>{vehicle.total_distance} km</td></tr>
                              <tr><th>Rentals</th><td>{vehicle.total_rentals}</td></tr>
                              <tr><th>Rating</th><td>{vehicle.rating}</td></tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                    <div className="col-lg-4">
                      {vehicle.vehicle_front && (
                        <div className="position-relative">
                          <img
                            src={`http://127.0.0.1:8000${vehicle.vehicle_front}`}
                            alt={`${vehicle.brand} ${vehicle.vehiclemodel}`}
                            className="img-fluid rounded shadow-lg w-100"
                            style={{ height: '250px', objectFit: 'cover' }}
                          />
                          <div className="position-absolute top-0 end-0 m-2">
                            <span className="badge bg-dark">Front View</span>
                          </div>
                        </div>
                      )}
                       {vehicle.insurance_image && (
                        <div className="position-relative">
                          <img
                            src={`http://127.0.0.1:8000${vehicle.insurance_image}`}
                            alt={`${vehicle.brand} ${vehicle.vehiclemodel}`}
                            className="img-fluid rounded shadow-lg w-100"
                            style={{ height: '250px', objectFit: 'cover' }}
                          />
                          <div className="position-absolute top-0 end-0 m-2">
                            <span className="badge bg-dark">Front View</span>
                          </div>
                        </div>
                      )}
                        {vehicle.insurance_expiary && (
                        <div className="position-relative">
                          <img
                            src={`http://127.0.0.1:8000${vehicle.insurance_expiary}`}
                            alt={`${vehicle.brand} ${vehicle.vehiclemodel}`}
                            className="img-fluid rounded shadow-lg w-100"
                            style={{ height: '250px', objectFit: 'cover' }}
                          />
                          <div className="position-absolute top-0 end-0 m-2">
                            <span className="badge bg-dark">Front View</span>
                          </div>
                        </div>
                      )}
                        {vehicle.pollution_expiary && (
                        <div className="position-relative">
                          <img
                            src={`http://127.0.0.1:8000${vehicle.pollution_expiary}`}
                            alt={`${vehicle.brand} ${vehicle.vehiclemodel}`}
                            className="img-fluid rounded shadow-lg w-100"
                            style={{ height: '250px', objectFit: 'cover' }}
                          />
                          <div className="position-absolute top-0 end-0 m-2">
                            <span className="badge bg-dark">Front View</span>
                          </div>
                        </div>
                      )}
                         {vehicle.pollution_image && (
                        <div className="position-relative">
                          <img
                            src={`http://127.0.0.1:8000${vehicle.pollution_image}`}
                            alt={`${vehicle.brand} ${vehicle.vehiclemodel}`}
                            className="img-fluid rounded shadow-lg w-100"
                            style={{ height: '250px', objectFit: 'cover' }}
                          />
                          <div className="position-absolute top-0 end-0 m-2">
                            <span className="badge bg-dark">Front View</span>
                          </div>
                        </div>
                      )}
                        {vehicle.rc_book_image && (
                        <div className="position-relative">
                          <img
                            src={`http://127.0.0.1:8000${vehicle.rc_book_image}`}
                            alt={`${vehicle.brand} ${vehicle.vehiclemodel}`}
                            className="img-fluid rounded shadow-lg w-100"
                            style={{ height: '250px', objectFit: 'cover' }}
                          />
                          <div className="position-absolute top-0 end-0 m-2">
                            <span className="badge bg-dark">Front View</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {!vehicle.is_verified && (
                    <form 
                      onSubmit={(e) => handleVehicleApproval(e, vehicle.id)}
                      className="mt-4 pt-4 border-top border-light"
                    >
                      <div className="d-flex gap-4 align-items-center">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="radio"
                            name={`vehicleAction_${vehicle.id}`}
                            value="approve"
                            id={`approveVehicle_${vehicle.id}`}
                            checked={vehicleAction === 'approve'}
                            onChange={(e) => setVehicleAction(e.target.value)}
                          />
                          <label htmlFor={`approveVehicle_${vehicle.id}`} className="form-check-label text-success fs-5 fw-bold">
                            Approve Vehicle
                          </label>
                        </div>
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="radio"
                            name={`vehicleAction_${vehicle.id}`}
                            value="reject"
                            id={`rejectVehicle_${vehicle.id}`}
                            checked={vehicleAction === 'reject'}
                            onChange={(e) => setVehicleAction(e.target.value)}
                          />
                          <label htmlFor={`rejectVehicle_${vehicle.id}`} className="form-check-label text-danger fs-5 fw-bold">
                            Reject Vehicle
                          </label>
                        </div>
                        <button
                          type="submit"
                          className="btn btn-success btn-lg ms-auto px-5"
                          disabled={actionLoading}
                        >
                          {actionLoading ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2"></span>
                              Processing...
                            </>
                          ) : (
                            `Update Vehicle ${index + 1}`
                          )}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-5">
                <FaCar className="fs-1 text-muted mb-3" />
                <h5 className="text-muted">No vehicles registered</h5>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminVehicleApprovalPage