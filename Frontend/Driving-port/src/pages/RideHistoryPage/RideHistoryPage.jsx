import { useSelector } from 'react-redux'
import { FaCar, FaStar, FaMapMarkerAlt } from 'react-icons/fa'
import { formatDate, formatTime, formatCurrency, getRideStatusColor } from '../../utils/helpers.js'


const RideHistoryPage = () => {
  const { rideHistory } = useSelector(state => state.ride)

  return (
    <div className="history-page">
      <div className="history-container">
        <div className="history-header">
          <h2>Ride History</h2>
          <span className="history-count">{rideHistory.length} rides</span>
        </div>

        {rideHistory.length === 0 ? (
          <div className="history-empty glass">
            <FaCar className="empty-icon" />
            <h3>No rides yet</h3>
            <p>Your completed rides will appear here</p>
          </div>
        ) : (
          <div className="ride-list">
            {rideHistory.map((ride, i) => (
              <div key={ride?.id || i} className="ride-history-card glass">
                <div className="ride-date-col">
                  <div className="ride-date">{formatDate(ride?.created_at)}</div>
                  <div className="ride-time">{formatTime(ride?.created_at)}</div>
                </div>
                <div className="ride-route">
                  <div className="route-point">
                    <span className="dot green-dot" />
                    <span>{ride?.pickup_address || 'Pickup'}</span>
                  </div>
                  <div className="route-line" />
                  <div className="route-point">
                    <span className="dot red-dot" />
                    <span>{ride?.destination_address || 'Destination'}</span>
                  </div>
                </div>
                <div className="ride-meta">
                  <span className={`badge bg-${getRideStatusColor(ride?.status)}`}>{ride?.status}</span>
                  <div className="ride-fare">{formatCurrency(ride?.fare || 0)}</div>
                  {ride?.driver && (
                    <div className="ride-driver">
                      <FaStar className="star" /> {ride.driver.rating}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default RideHistoryPage
