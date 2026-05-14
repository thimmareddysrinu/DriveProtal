import React, { useEffect } from 'react'
import { FaStar, FaRupeeSign } from 'react-icons/fa'
import { useSelector, useDispatch } from 'react-redux'
import { AdminDriverList } from '../../store/slices/Admin/AdminvehicleApprove'
import { useNavigate } from 'react-router-dom'
import { AdminOwnerVehicleList } from '../../store/slices/Admin/AdminOwnerVehicleApproval'

function AdminHome() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { drivers, loading, error,actionLoading } = useSelector((state) => state.adminDriverlist)
  const { ownersVehicles, ownloading, ownerror } = useSelector((state) => state.adminOwnerVehiclelist)
  useEffect(() => {
    dispatch(AdminDriverList())
     dispatch(AdminOwnerVehicleList())
  }, [dispatch])

  const refresh = () => {
    dispatch(AdminDriverList())
     dispatch(AdminOwnerVehicleList())
  }

  const driveronclick = (id) => {
    navigate(`/admin/driver-approval/${id}`)
  }

  const ownerVehicleonclick = (id) => {
    navigate(`/admin/owner-vehicle-approval/${id}`)
  }
  console.log(drivers)
  console.log(ownersVehicles)

  return (
    <div style={{ minHeight: '100vh', background: '#0F0F1A', color: '#fff', padding: '24px' }}>
      <h2 style={{ fontFamily: 'Poppins, sans-serif' }}>Admin Dashboard 🚗</h2>
      
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '24px' }}>
        {[
          { label: "Today's Earnings", value: '₹0', icon: <FaRupeeSign /> },
          { label: 'Rating', value: '—', icon: <FaStar /> },
        ].map(card => (
          <div key={card.label} style={{
            flex: '1', minWidth: '140px', padding: '20px', borderRadius: '12px',
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '1.5rem', color: '#F6AF12' }}>{card.icon}</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700 }}>{card.value}</div>
            <div style={{ color: '#A0AEC0', fontSize: '0.8rem' }}>{card.label}</div>
          </div>
        ))}
      </div>

     <div
  style={{
    marginTop: '32px',
    padding: '20px',
    borderRadius: '12px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.08)'
  }}
>
  <h3 className="text-center text-warning">Driver Vehicles</h3>
  <button className="btn btn-warning m-3" onClick={refresh}>Refresh</button>

  {loading && <p>Loading drivers...</p>}
  {error && <p style={{ color: 'red' }}>{error}</p>}
  {!loading && drivers.length === 0 && <p>No drivers found</p>}

  {!loading && drivers.length > 0 && (
    <table className="table table-dark">
      <thead>
        <tr>
          <th scope="col">ID</th>
          <th scope="col">Driver Name</th>
          <th scope="col">Phone</th>
          <th scope="col">Status</th>
          <th scope="col">Total Vehicles</th>
          <th scope="col">Actions</th>
        </tr>
      </thead>
      <tbody>
        {drivers.map((driver) => (
          <tr key={driver.id}>
            <td>{driver.id}</td>
            <td>{driver.full_name}</td>
            <td>{driver.phone_number}</td>
            <td>
              <span
                className={`badge ${
                  driver.verification_status === 'approved'
                    ? 'bg-success'
                    : 'bg-warning text-dark'
                }`}
              >
                {driver.verification_status}
              </span>
            </td>
            <td>{driver.vehicles?.length || 0}</td>
            <td>
              {driver.verification_status !== 'approved' ? (
                <button
                  className="btn btn-warning"
                   onClick={() => navigate(`/admin/driver-approval/${driver.id}`)}
            
                >
                  View
                </button>
              ) : (
                <button className="btn btn-success">Approved</button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )}
</div>
       <div style={{
        marginTop: '32px', padding: '20px', borderRadius: '12px',
        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)'
      }}>
        <h2 className='text-center text-warning'> VehicleOwner Vehicles </h2>
        <button className='btn btn-warning ms-3 mb-4' onClick={refresh}>Refresh</button>
        
        {loading && <p>Loading owners' vehicles...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}

        {!loading && ownersVehicles.length === 0 && <p>No owners' vehicles found</p>}

        {ownersVehicles.map((vehicle) => (
          <div key={vehicle.id}>
            <table className="table table-dark">
              <thead>
                <tr>
                  <th scope="col">ID</th>
                  <th scope="col">Driver Name</th>
                  <th scope="col">Phone</th>
                  <th scope="col">Status</th>
                  <th scope="col">Total Vehicles</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{vehicle.id}</td>
                  <td>{vehicle.owner_name}</td>
                  <td>{vehicle.
owner_profile?.phone_number}</td>
                  <td>
                    <span className={`badge ${vehicle.owner_profile?.verified === true ? 'bg-success' : 'bg-warning'}`}>
                      {vehicle.owner_profile?.verified === true ? 'approved':'pending'}
                    </span>
                  </td>
                  <td>{vehicle.vehicles?.length || 0}</td>
                  <td>
                    {vehicle.owner_profile?.verified !== true ? (
                      <button
                        className='btn btn-warning'
                         onClick={() => navigate(`/admin/owner-vehicle-approval/${vehicle.id}`)}
            
                      >
                        View
                      </button>
                    ) : (
                      <button className='btn btn-success'>Approved</button>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AdminHome