import { useEffect, useRef, useState } from 'react'
import { FaStar, FaRupeeSign } from 'react-icons/fa'
import { useDispatch } from 'react-redux'
import { DriverAcceptVehicleBooking,CheckRideStatus } from '../../store/slices/vehicleBooking/VehicleBooking'

const DriverDashboard = () => {
  const user = JSON.parse(localStorage.getItem('user'))
  const dispatch = useDispatch()

  const wsRef = useRef(null)
  const reconnectTimeoutRef = useRef(null)
  const pingIntervalRef = useRef(null)
  const watchIdRef = useRef(null)
  const intentionalCloseRef = useRef(false)

  const [rideAlert, setRideAlert] = useState([])
  const [countdown, setCountdown] = useState({})
  const [isOnline, setIsOnline] = useState(
    localStorage.getItem('driverOnlineStatus') === 'true'
  )
  const [wsStatus, setWsStatus] = useState('disconnected')

  const sendMessage = (payload) => {
    const ws = wsRef.current
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      console.log('WebSocket not open, skipping message:', payload)
      return false
    }

    ws.send(JSON.stringify(payload))
    return true
  }

  const sendDriverStatus = (onlineStatus) => {
    const sent = sendMessage({
      type: 'driver_status',
      is_online: onlineStatus,
      is_available: onlineStatus,
    })

    if (sent) {
      console.log('🚦 Driver status sent:', onlineStatus)
    }
  }

  const sendLocation = (lat, lng) => {
    const sent = sendMessage({
      type: 'update_location',
      lat,
      lng,
    })

    if (sent) {
      console.log('📍 Location sent:', lat, lng)
    }
  }

  const requestAndSendCurrentLocation = () => {
    if (!navigator.geolocation) {
      console.log('Geolocation not supported')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        sendLocation(latitude, longitude)
      },
      (error) => {
        console.log('Geolocation error:', error)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    )
  }

  const startLocationUpdates = () => {
    if (!navigator.geolocation) {
      console.log('Geolocation not supported')
      return
    }

    if (watchIdRef.current !== null) return

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        sendLocation(latitude, longitude)
      },
      (error) => {
        console.log('Watch location error:', error)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000,
      }
    )

    console.log('🛰️ Location watch started')
  }

  const stopLocationUpdates = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
      console.log('🛑 Location watch stopped')
    }
  }

  useEffect(() => {
    let isMounted = true

    const connectWebSocket = () => {
      const token = localStorage.getItem('access')
      if (!token) {
        console.log('❌ No access token found, cannot connect WebSocket')
        return
      }

      const existing = wsRef.current
      if (
        existing &&
        (existing.readyState === WebSocket.OPEN ||
          existing.readyState === WebSocket.CONNECTING)
      ) {
        return
      }

      intentionalCloseRef.current = false

      const wsUrl = `ws://127.0.0.1:8000/ws/driver/?token=${token}`
      console.log('🔌 Connecting WebSocket to:', wsUrl)

      const ws = new WebSocket(wsUrl)
      wsRef.current = ws

      if (isMounted) setWsStatus('connecting')

      ws.onopen = () => {
        if (!isMounted) return

        setWsStatus('connected')
        console.log('✅ WebSocket connected')

        if (pingIntervalRef.current) clearInterval(pingIntervalRef.current)
        pingIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ping' }))
          }
        }, 30000)

        const savedStatus = localStorage.getItem('driverOnlineStatus') === 'true'
        if (savedStatus) {
          sendDriverStatus(true)
          requestAndSendCurrentLocation()
          startLocationUpdates()
        }
      }

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data)
        console.log('📩 WebSocket message:', data)

        if (data.type === 'ride_request') {
          setRideAlert((prev) => {
            const exists = prev.some((item) => item.ride_id === data.ride_id)
            return exists ? prev : [...prev, data]
          })

          setCountdown((prev) => ({
            ...prev,
            [data.ride_id]: data.expires_in || 90,
          }))
        }
      }

      ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error)
        if (isMounted) setWsStatus('disconnected')
      }

      ws.onclose = (event) => {
        console.log('🔌 WebSocket closed:', event.code, event.reason)

        if (wsRef.current === ws) {
          wsRef.current = null
        }

        if (isMounted) {
          setWsStatus('disconnected')
        }

        if (pingIntervalRef.current) {
          clearInterval(pingIntervalRef.current)
          pingIntervalRef.current = null
        }

        if (!intentionalCloseRef.current && isMounted) {
          console.log('🔄 Reconnecting in 3 seconds...')
          reconnectTimeoutRef.current = setTimeout(() => {
            connectWebSocket()
          }, 3000)
        }
      }
    }

    connectWebSocket()

    return () => {
      isMounted = false
      intentionalCloseRef.current = true

      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current)
      if (pingIntervalRef.current) clearInterval(pingIntervalRef.current)

      stopLocationUpdates()

      if (wsRef.current) {
        const ws = wsRef.current
        wsRef.current = null

        if (
          ws.readyState === WebSocket.OPEN ||
          ws.readyState === WebSocket.CONNECTING
        ) {
          ws.close(1000, 'Component unmount')
        }
      }
    }
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        const updated = { ...prev }

        Object.keys(updated).forEach((rideId) => {
          if (updated[rideId] > 0) {
            updated[rideId] -= 1
          } else {
            delete updated[rideId]
            setRideAlert((current) =>
              current.filter((ride) => String(ride.ride_id) !== String(rideId))
            )
          }
        })

        return updated
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const toggleOnline = () => {
    const newStatus = !isOnline
    setIsOnline(newStatus)
    localStorage.setItem('driverOnlineStatus', String(newStatus))

    if (newStatus) {
      sendDriverStatus(true)
      requestAndSendCurrentLocation()
      startLocationUpdates()
    } else {
      sendDriverStatus(false)
      stopLocationUpdates()
    }
  }

  const handleAcceptedRide = async (ride) => {
    try {
      const res = await dispatch(DriverAcceptVehicleBooking(ride.ride_id)).unwrap()

      console.log('ACCEPT FULL RESPONSE =>', res)
      console.log('ACCEPT RIDE =>', res?.ride)
      console.log('ACCEPT STATUS =>', res?.status)
      if (res?.ride?.status === 'driver_assigned') {
      await dispatch(CheckRideStatus(res?.ride?.id || ride.ride_id)).unwrap()
    }
      setRideAlert((prev) => prev.filter((r) => r.ride_id !== ride.ride_id))

      setCountdown((prev) => {
        const updated = { ...prev }
        delete updated[ride.ride_id]
        return updated
      })

      sendMessage({
        type: 'ride_accept_ack',
        ride_id: ride.ride_id,
      })
    } catch (error) {
      console.error('❌ Ride acceptance failed:', error)
      alert(error?.error || error?.message || 'Ride acceptance failed')
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0F0F1A', color: '#fff', padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontFamily: 'Poppins, sans-serif' }}>Driver Dashboard 🚗</h2>
          <p style={{ color: '#A0AEC0' }}>Welcome, {user?.phone_number || 'Driver'}</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span
            style={{
              fontSize: '0.75rem',
              color:
                wsStatus === 'connected'
                  ? '#48BB78'
                  : wsStatus === 'connecting'
                  ? '#F6AF12'
                  : '#E53E3E',
            }}
          >
            {wsStatus === 'connected'
              ? '🟢 WS Connected'
              : wsStatus === 'connecting'
              ? '🟡 Connecting...'
              : '🔴 WS Disconnected'}
          </span>

          <button
            onClick={toggleOnline}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              background: isOnline ? '#48BB78' : '#E53E3E',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            {isOnline ? '🟢 Online' : '🔴 Offline'}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '24px' }}>
        {[
          { label: "Today's Earnings", value: '₹0', icon: <FaRupeeSign /> },
          { label: 'Rating', value: '—', icon: <FaStar /> },
        ].map((card) => (
          <div
            key={card.label}
            style={{
              flex: '1',
              minWidth: '140px',
              padding: '20px',
              borderRadius: '12px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              textAlign: 'center',
            }}
          >
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
          background: 'transparent',
          border: '1px solid rgba(237, 196, 59, 0.86)',
          width: '400px',
        }}
      >
        {rideAlert.length === 0 ? (
          <p style={{ color: '#A0AEC0', textAlign: 'center' }}>No ride requests yet...</p>
        ) : (
          rideAlert.map((ride) => (
            <div
              key={ride.ride_id}
              style={{
                marginBottom: '16px',
                padding: '16px',
                background: 'transparent',
                borderRadius: '10px',
              }}
            >
              <h4>Ride Request</h4>
              <hr />
              <p>Pickup: {ride.pickup}</p>
              <p>Drop: {ride.drop}</p>
              <p>Vehicle: {ride.vehicle_type}</p>
              <p>Customer: {ride.customer_name}</p>
              <p>Distance: {ride.distance_km} Km</p>
              <p>Ride Mode: {ride.ride_mode}</p>
              <p>Ride Amount: {ride.price_breakdown?.ride_price}</p>
              <p>Expires in: {countdown[ride.ride_id] ?? 0}s</p>

              <button className="btn btn-warning me-3" onClick={() => handleAcceptedRide(ride)}>
                Accept
              </button>
              <button className="btn btn-danger">Rejected</button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default DriverDashboard
