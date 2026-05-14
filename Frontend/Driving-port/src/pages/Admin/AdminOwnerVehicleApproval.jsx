import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams, useNavigate } from 'react-router-dom'
import { FaStar, FaUser, FaCar } from 'react-icons/fa'
import {
  AdminOwnervehicleDetails,
  AdminOwnerVehicleApproval,
} from '../../store/slices/Admin/AdminOwnerVehicleApproval'

function AdminOwnerByVehicleApproval() {
  const [activeTab, setActiveTab] = useState('profile')
  const [vehicleAction, setVehicleAction] = useState('')

  const { id } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { ownerVehicleDetail, ownloading, ownerror, actionLoading } = useSelector(
    (state) => state.adminOwnerVehiclelist
  )

  useEffect(() => {
    if (id) {
      dispatch(AdminOwnervehicleDetails(id))
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
        AdminOwnerVehicleApproval({
          id: vehicleId,
          action: vehicleAction,
        })
      ).unwrap()

      alert('Vehicle approval updated successfully!')
      setVehicleAction('')
      dispatch(AdminOwnervehicleDetails(id))
    } catch (err) {
      alert('Approval failed: ' + (err?.message || 'Unknown error'))
    }
  }

  const goBack = () => {
    navigate('/admin/home')
  }

  if (ownloading) {
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
          <p className="mt-3">Loading vehicle details...</p>
        </div>
      </div>
    )
  }

  if (ownerror) {
    return (
      <div style={{ minHeight: '100vh', background: '#0F0F1A', color: '#fff', padding: '24px' }}>
        <div className="alert alert-danger text-center">
          <h4>Error loading vehicle details</h4>
          <p>{ownerror}</p>
          <button className="btn btn-warning" onClick={() => dispatch(AdminOwnervehicleDetails(id))}>
            Retry
          </button>
          <button className="btn btn-secondary ms-2" onClick={goBack}>
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  if (!ownerVehicleDetail) {
    return (
      <div style={{ minHeight: '100vh', background: '#0F0F1A', color: '#fff', padding: '24px' }}>
        <div className="alert alert-warning text-center">
          <h4>No owner vehicle found</h4>
          <p>Owner vehicle with ID {id} not found.</p>
          <button className="btn btn-secondary" onClick={goBack}>
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  const owner = ownerVehicleDetail.owner_profile || {}

  return (
    <div style={{ minHeight: '100vh', background: '#0F0F1A', color: '#fff', padding: '24px' }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 style={{ fontFamily: 'Poppins, sans-serif' }}>
          Owner Vehicle Approval #{ownerVehicleDetail.id} - {owner.full_name || 'Owner'}
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
                <div className="fs-5 fw-bold">{owner.full_name || owner.company_name || 'N/A'}</div>
                <div className="text-muted">{owner.phone_number || 'N/A'}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3 col-lg-2">
          <div className="card bg-transparent border-light text-white p-4 text-center h-100">
            <FaStar className="fs-2 text-warning mb-2" />
            <div className="fs-4 fw-bold">{owner.rating || ownerVehicleDetail.rating || '0.00'}</div>
            <div className="text-muted small">Rating</div>
          </div>
        </div>

        <div className="col-md-3 col-lg-2">
          <div className="card bg-transparent border-light text-white p-4 text-center h-100">
            <FaCar className="fs-2 text-warning mb-2" />
            <div className="fs-4 fw-bold">1</div>
            <div className="text-muted small">Vehicles</div>
          </div>
        </div>

        <div className="col-md-6 col-lg-4">
          <div className="card bg-transparent border-light text-white p-4 h-100">
            <div className="d-flex align-items-center">
              <div className={`badge fs-6 me-3 p-2 ${owner.verified ? 'bg-success' : 'bg-warning'}`}>
                {owner.verified ? 'PROFILE VERIFIED' : 'PROFILE PENDING'}
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
              Vehicle
            </button>
          </li>
        </ul>

        {activeTab === 'profile' && (
          <div className="card-body p-4">
            <div className="row">
              <div className="col-md-12">
                <table className="table table-dark table-bordered">
                  <tbody>
                    <tr><th>Full Name</th><td>{owner.full_name || 'N/A'}</td></tr>
                    <tr><th>Phone</th><td>{owner.phone_number || 'N/A'}</td></tr>
                    <tr><th>Business License</th><td>{owner.business_license || 'N/A'}</td></tr>
                    <tr><th>Company Name</th><td>{owner.company_name || 'N/A'}</td></tr>
                    <tr><th>GST Number</th><td>{owner.gst_number || 'N/A'}</td></tr>
                    <tr><th>Bank Account</th><td>{owner.bank_account_number || 'N/A'}</td></tr>
                    <tr><th>IFSC</th><td>{owner.bank_ifsc || 'N/A'}</td></tr>
                    <tr><th>City</th><td>{owner.city || 'N/A'}</td></tr>
                    <tr><th>State</th><td>{owner.state || 'N/A'}</td></tr>
                    <tr><th>Pincode</th><td>{owner.pincode || 'N/A'}</td></tr>
                    <tr><th>Office Address</th><td>{owner.office_address || 'N/A'}</td></tr>
                  </tbody>
                </table>
                <div className='d-flex flex-row g-3 align-items-center'>
                   {owner.aadhar_image && (
                  <div className="position-relative m-3 ">
                    <img
                      src={`http://127.0.0.1:8000${owner.aadhar_image}`}
                      alt="Aadhar"
                      className="img-fluid rounded shadow-lg w-100"
                      style={{ height: '200px', objectFit: 'cover' }}
                    />
                    <div className="position-absolute top-0 end-0 m-2">
                      <span className="badge bg-dark">Aadhar</span>
                    </div>
                  </div>
                )}

                {owner.business_license_image && (
                  <div className="position-relative m-3">
                    <img
                      src={`http://127.0.0.1:8000${owner.business_license_image}`}
                      alt="Business License"
                      className="img-fluid rounded shadow-lg w-100"
                      style={{ height: '200px', objectFit: 'cover' }}
                    />
                    <div className="position-absolute top-0 end-0 m-2">
                      <span className="badge bg-dark">License</span>
                    </div>
                  </div>
                )}

                {owner.pan_image && (
                  <div className="position-relative m-3">
                    <img
                      src={`http://127.0.0.1:8000${owner.pan_image}`}
                      alt="PAN"
                      className="img-fluid rounded shadow-lg w-100"
                      style={{ height: '200px', objectFit: 'cover' }}
                    />
                    <div className="position-absolute top-0 end-0 m-2">
                      <span className="badge bg-dark">PAN</span>
                    </div>
                  </div>
                )}

                </div>

               
              </div>

              <div className="col-md-12">
                <div className="text-center">
                  <div className="mb-3">
                    <span className={`badge fs-5 px-4 py-3 ${owner.verified ? 'bg-success' : 'bg-warning text-dark'}`}>
                      {owner.verified ? 'VERIFIED' : 'PENDING'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'vehicle' && (
          <div className="card-body p-4">
            <div className="mb-5 p-4 border rounded bg-dark border-light">
              <div className="d-flex justify-content-between align-items-start mb-4">
                <h5 className="mb-0">
                  Vehicle - {ownerVehicleDetail.registration_number?.toUpperCase()}
                </h5>
                <span className={`badge fs-6 px-3 py-2 ${ownerVehicleDetail.is_verified ? 'bg-success' : 'bg-warning text-dark'}`}>
                  {ownerVehicleDetail.is_verified ? 'VERIFIED' : 'PENDING'}
                </span>
              </div>

              <div className="row">
                <div className="col-lg-8">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <table className="table table-dark table-sm w-100">
                        <tbody>
                          <tr><th>Brand</th><td>{ownerVehicleDetail.brand}</td></tr>
                          <tr><th>Model</th><td>{ownerVehicleDetail.vehiclemodel}</td></tr>
                          <tr><th>Type</th><td>{ownerVehicleDetail.vehicle}</td></tr>
                          <tr><th>Year</th><td>{ownerVehicleDetail.year}</td></tr>
                          <tr><th>Color</th><td>{ownerVehicleDetail.colour}</td></tr>
                          <tr><th>Seats</th><td>{ownerVehicleDetail.seat_capacity}</td></tr>
                          <tr><th>Fuel</th><td>{ownerVehicleDetail.fuel_type}</td></tr>
                          <tr><th>Transmission</th><td>{ownerVehicleDetail.transmission_type}</td></tr>
                          <tr>
                            <th>Status</th>
                            <td>
                              <span className="badge bg-info">
                                {ownerVehicleDetail.is_active || 'Not Set'}
                              </span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <div className="col-md-6">
                      <table className="table table-dark table-sm w-100">
                        <tbody>
                          <tr><th>Price/Day</th><td>₹{ownerVehicleDetail.rental_price_per_day}</td></tr>
                          <tr><th>Price/Hour</th><td>₹{ownerVehicleDetail.rental_price_per_hour}</td></tr>
                          <tr><th>Security Deposit</th><td>₹{ownerVehicleDetail.security_depoist}</td></tr>
                          <tr><th>Extra KM</th><td>₹{ownerVehicleDetail.extra_km_charge}</td></tr>
                          <tr><th>Total Distance</th><td>{ownerVehicleDetail.total_distance} km</td></tr>
                          <tr><th>Rentals</th><td>{ownerVehicleDetail.total_rentals}</td></tr>
                          <tr><th>Rating</th><td>{ownerVehicleDetail.rating}</td></tr>
                          <tr><th>Min Rental Hours</th><td>{ownerVehicleDetail.min_rental_hours}</td></tr>
                          <tr><th>Max Rental Days</th><td>{ownerVehicleDetail.max_rental_days}</td></tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                <div className="col-lg-3">
                  {ownerVehicleDetail.vehicle_front && (
                    <div className="position-relative mb-3">
                      <img
                        src={`http://127.0.0.1:8000${ownerVehicleDetail.vehicle_front}`}
                        alt={`${ownerVehicleDetail.brand} ${ownerVehicleDetail.vehiclemodel}`}
                        className="img-fluid rounded shadow-lg w-100"
                        style={{ height: '250px', objectFit: 'cover' }}
                      />
                      <div className="position-absolute top-0 end-0 m-2">
                        <span className="badge bg-dark">Front View</span>
                      </div>
                    </div>
                  )}

                  {ownerVehicleDetail.insurance_image && (
                    <div className="position-relative mb-3">
                      <img
                        src={`http://127.0.0.1:8000${ownerVehicleDetail.insurance_image}`}
                        alt="Insurance"
                        className="img-fluid rounded shadow-lg w-100"
                        style={{ height: '250px', objectFit: 'cover' }}
                      />
                      <div className="position-absolute top-0 end-0 m-2">
                        <span className="badge bg-dark">Insurance</span>
                      </div>
                    </div>
                  )}

                  {ownerVehicleDetail.pollution_image && (
                    <div className="position-relative mb-3">
                      <img
                        src={`http://127.0.0.1:8000${ownerVehicleDetail.pollution_image}`}
                        alt="Pollution"
                        className="img-fluid rounded shadow-lg w-100"
                        style={{ height: '250px', objectFit: 'cover' }}
                      />
                      <div className="position-absolute top-0 end-0 m-2">
                        <span className="badge bg-dark">Pollution</span>
                      </div>
                    </div>
                  )}

                  {ownerVehicleDetail.rc_book_image && (
                    <div className="position-relative mb-3">
                      <img
                        src={`http://127.0.0.1:8000${ownerVehicleDetail.rc_book_image}`}
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

              {!ownerVehicleDetail.is_verified && (
                <form
                  onSubmit={(e) => handleVehicleApproval(e, ownerVehicleDetail.id)}
                  className="mt-4 pt-4 border-top border-light"
                >
                  <div className="d-flex gap-4 align-items-center flex-wrap">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="vehicleAction"
                        value="approve"
                        id="approveVehicle"
                        checked={vehicleAction === 'approve'}
                        onChange={(e) => setVehicleAction(e.target.value)}
                      />
                      <label htmlFor="approveVehicle" className="form-check-label text-success fs-5 fw-bold">
                        Approve Vehicle
                      </label>
                    </div>

                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="vehicleAction"
                        value="reject"
                        id="rejectVehicle"
                        checked={vehicleAction === 'reject'}
                        onChange={(e) => setVehicleAction(e.target.value)}
                      />
                      <label htmlFor="rejectVehicle" className="form-check-label text-danger fs-5 fw-bold">
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
                        'Update Vehicle Approval'
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminOwnerByVehicleApproval