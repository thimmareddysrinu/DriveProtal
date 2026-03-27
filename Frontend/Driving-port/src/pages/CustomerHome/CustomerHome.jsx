import { FaCar, FaMapMarkerAlt, FaHistory } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import { useSelector,useDispatch } from 'react-redux'
import { logout } from '../../store/slices/User-All/LoginSlice'
const CustomerHome = () => {
  const { user } = useSelector(state => state.login)
  const dispatch=useDispatch()
 const onClicked=()=>{
  dispatch(logout())
 }
  return (
    <div style={{ minHeight: '100vh', background: '#0F0F1A', color: '#fff', padding: '24px' }}>
      <h2 style={{ fontFamily: 'Poppins, sans-serif' }}>
        Hello, {user?.full_name || 'there'} 👋
      </h2>
      <p style={{ color: '#A0AEC0' }}>Where are you going today?</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '400px', marginTop: '24px' }}>
        <Link to="/customer/book" style={cardStyle}>
          <FaCar style={{ fontSize: '1.5rem', color: '#F6AF12' }} />
          <div>
            <strong>Book a Ride</strong>
            <p style={{ color: '#A0AEC0', margin: 0, fontSize: '0.85rem' }}>Find nearby vehicles</p>
          </div>
        </Link>

        <Link to="/customer/history" style={cardStyle}>
          <FaHistory style={{ fontSize: '1.5rem', color: '#F6AF12' }} />
          <div>
            <strong>Ride History</strong>
            <p style={{ color: '#A0AEC0', margin: 0, fontSize: '0.85rem' }}>View past trips</p>
          </div>
        </Link>
      </div>
       <button className='btn btn-danger' onClick={onClicked}>Logou</button>
    </div>
  )
}

const cardStyle = {
  display: 'flex', alignItems: 'center', gap: '16px',
  padding: '20px', borderRadius: '12px',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.08)',
  color: '#fff', textDecoration: 'none',
}

export default CustomerHome
