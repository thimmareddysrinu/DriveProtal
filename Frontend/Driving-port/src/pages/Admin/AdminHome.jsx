import React, { useEffect } from 'react'
import { FaStar, FaRupeeSign } from 'react-icons/fa'
import { useSelector, useDispatch } from 'react-redux'
import { AdminDriverList } from '../../store/slices/Admin/AdminvehicleApprove'
import { useNavigate } from 'react-router-dom'

function AdminHome() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { drivers, loading, error } = useSelector((state) => state.adminlist)
 
  useEffect(() => {
    dispatch(AdminDriverList())
  }, [dispatch])

  const refresh = () => {
    dispatch(AdminDriverList())
  }

  const onclick = (id) => {
    navigate(`/admin/approval/${id}`)
  }
  console.log(drivers)

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

      <div style={{
        marginTop: '32px', padding: '20px', borderRadius: '12px',
        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)'
      }}>
        <button className='btn btn-warning me-3' onClick={refresh}>Refresh</button>
        
        {loading && <p>Loading drivers...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}

        {!loading && drivers.length === 0 && <p>No drivers found</p>}

        {drivers.map((driver) => (
          <div key={driver.id}>
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
                  <td>{driver.id}</td>
                  <td>{driver.full_name}</td>
                  <td>{driver.phone_number}</td>
                  <td>
                    <span className={`badge ${driver.verification_status === 'approved' ? 'bg-success' : 'bg-warning'}`}>
                      {driver.verification_status}
                    </span>
                  </td>
                  <td>{driver.vehicles?.length || 0}</td>
                  <td>
                    {driver.verification_status !== 'approved' ? (
                      <button
                        className='btn btn-warning'
                        onClick={() => onclick(driver.id)}
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