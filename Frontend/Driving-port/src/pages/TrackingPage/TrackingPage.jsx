import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { FaPhone, FaStar, FaCar, FaCheckCircle } from 'react-icons/fa'
import MapView from '../../components/Map/MapView.jsx'



const STATUS_STEPS = [
  { key: 'searching', label: 'Finding Driver', icon: '🔍' },
  { key: 'accepted', label: 'Driver Assigned', icon: '✅' },
  { key: 'arriving', label: 'Driver Arriving', icon: '🚗' },
  { key: 'in_progress', label: 'Ride in Progress', icon: '🏁' },
]

const TrackingPage = () => {
  const { rideId } = useParams()
  const dispatch = useDispatch()
  const { currentRide, rideStatus } = useSelector(state => state.ride)
  const { on } = useSocket(rideId)

  useEffect(() => {
    const offLocation = on('driver:location', ({ driverId, lat, lng }) => {
      dispatch(updateDriverPosition({ driverId, lat, lng }))
    })
    const offAccepted = on('ride:accepted', (data) => {
      dispatch(rideAccepted(data))
    })
    const offStarted = on('ride:started', () => dispatch(rideStarted()))
    const offCompleted = on('ride:completed', () => dispatch(rideCompleted()))

    return () => { offLocation?.(); offAccepted?.(); offStarted?.(); offCompleted?.() }
  }, [on, dispatch])

  const currentStepIdx = STATUS_STEPS.findIndex(s => s.key === rideStatus)

  return (
    <div className="tracking-page">
      <div className="tracking-map">
        <MapView height="100%" showRoute />
      </div>

      <div className="tracking-panel glass">
        {/* Status Steps */}
        <div className="status-steps">
          {STATUS_STEPS.map((step, i) => (
            <div key={step.key} className={`status-step ${i <= currentStepIdx ? 'done' : ''} ${i === currentStepIdx ? 'active' : ''}`}>
              <div className="step-dot">{i <= currentStepIdx ? <FaCheckCircle /> : i + 1}</div>
              <span>{step.label}</span>
            </div>
          ))}
        </div>

        {/* Driver Info */}
        {currentRide?.driver && (
          <div className="driver-info glass">
            <div className="driver-avatar">🧑‍💼</div>
            <div className="driver-details">
              <div className="driver-name">{currentRide.driver.name}</div>
              <div className="driver-meta">
                <FaStar className="star-icon" /> {currentRide.driver.rating}
                &nbsp;•&nbsp;
                <FaCar /> {currentRide.driver.vehicle_number}
              </div>
            </div>
            <a href={`tel:${currentRide.driver.phone}`} className="call-btn">
              <FaPhone />
            </a>
          </div>
        )}

        {/* Ride Info */}
        {currentRide && (
          <div className="ride-info">
            <div className="info-row">
              <span>🟢 Pickup</span>
              <span>{currentRide.pickup_address || 'Loading...'}</span>
            </div>
            <div className="info-row">
              <span>🔴 Drop</span>
              <span>{currentRide.destination_address || 'Loading...'}</span>
            </div>
            <div className="info-row">
              <span>💰 Fare</span>
              <span>₹{currentRide.estimated_fare || '---'}</span>
            </div>
          </div>
        )}

        {rideStatus === 'searching' && (
          <div className="searching-pulse">
            <div className="pulse-ring" />
            Looking for nearby drivers...
          </div>
        )}
      </div>
    </div>
  )
}

export default TrackingPage
