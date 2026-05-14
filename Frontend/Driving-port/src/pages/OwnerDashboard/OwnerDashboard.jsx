import { FaTruck, FaChartBar } from 'react-icons/fa'
import { useEffect,useState } from 'react'
import { useSelector,useDispatch } from 'react-redux'
import {
  VehicleownerProfile, UpdateVehicleownerProfile

} from '../../store/slices/Owner/Ownerprofile'


const OwnerDashboard = () => {
  const { user } = useSelector(state => state.login)
  const dispatch = useDispatch()
  const { OwnerProf, loading, error, updateLoading } = useSelector(
    (state) => state.vehicleownerprofile
  )
    useEffect(() => {
    dispatch(VehicleownerProfile())
  }, [dispatch])

  return (
    <div style={{ minHeight: '100vh', background: '#0F0F1A', color: '#fff', padding: '24px' }}>
      <h2 style={{ fontFamily: 'Poppins, sans-serif' }}>
        Owner Dashboard 🏢
      </h2>
      <p style={{ color: '#A0AEC0' }}>Welcome, {user?.full_name || 'Vehicle Owner'}</p>

      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '24px' }}>
        {[
          { label: 'Total Vehicles', value: '0', icon: <FaTruck /> },
          { label: 'Total Earnings', value: '₹0', icon: <FaChartBar /> },
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

      <div style={{ marginTop: '32px', padding: '20px', borderRadius: '12px',
        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <p style={{ color: '#A0AEC0', textAlign: 'center' }}>No vehicles registered yet...</p>
      </div>
    </div>
  )
}

export default OwnerDashboard
