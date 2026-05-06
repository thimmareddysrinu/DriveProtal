import { useEffect, useRef, useState } from 'react'
import { FaStar, FaRupeeSign } from 'react-icons/fa'
import { useDispatch } from 'react-redux'

const DriverDashboard = () => {
  const user = JSON.parse(localStorage.getItem("user"))
  const dispatch = useDispatch()

  const wsRef = useRef(null)
  const locationIntervalRef = useRef(null)

  const [rideAlert, setRideAlert] = useState([])
  const [countdown, setCountdown] = useState({})
  const [isOnline, setIsOnline] = useState(false)

  const sendLocation = () => {
    if (!navigator.geolocation) {
      console.log("Geolocation not supported")
      return
    }

    if (wsRef.current?.readyState !== WebSocket.OPEN) {
      console.log("WebSocket not open")
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords

        wsRef.current.send(JSON.stringify({
          type: "update_location",
          lat: latitude,
          lng: longitude
        }))

        console.log("location sent", latitude, longitude)
      },
      (error) => {
        console.log("geolocation error", error)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    )
  }

  const sendDriverStatus = (onlineStatus) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: "driver_status",
        is_online: onlineStatus,
        is_available: onlineStatus
      }))
    }
  }

  const [wsStatus, setWsStatus] = useState('disconnected') // 'connecting', 'connected', 'disconnected'

useEffect(() => {
  let reconnectTimeout

  const connectWebSocket = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return

    const token = localStorage.getItem("access")
    if (!token) {
      console.log("No token, skipping WS")
      return
    }

    const protocol = window.location.protocol === "https:" ? "wss" : "ws"
    const ws = new WebSocket(`${protocol}://127.0.0.1:8000/ws/driver/?token=${token}`)
  
    wsRef.current = ws
    setWsStatus('connecting')

    ws.onopen = () => {
      console.log("✅ WebSocket connected")
      setWsStatus('connected')
    }

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      console.log("websocket message:", data)

      if (data.type === "ride_request") {
        setRideAlert((prev) => [...prev, data])
        setCountdown((prev) => ({
          ...prev,
          [data.ride_id]: data.expires_in || 90,
        }))
      }
    }

    ws.onerror = (error) => {
      console.error("❌ WebSocket error:", error)
      setWsStatus('disconnected')
    }

    ws.onclose = (event) => {
      console.log("🔌 WebSocket closed", event.code)
      wsRef.current = null
      setWsStatus('disconnected')

      // Auto-reconnect after 3 seconds (except if manual close)
      if (event.code !== 1000) {
        reconnectTimeout = setTimeout(connectWebSocket, 3000)
      }
    }
  }

  connectWebSocket()

  return () => {
    if (reconnectTimeout) clearTimeout(reconnectTimeout)
    if (locationIntervalRef.current) {
      clearInterval(locationIntervalRef.current)
      locationIntervalRef.current = null
    }
    
    // Only close if we opened it
    if (wsRef.current && [WebSocket.OPEN, WebSocket.CONNECTING].includes(wsRef.current.readyState)) {
      wsRef.current.close(1000) // Normal closure
    }
  }
}, [])

  const toggleOnline = () => {
    const newStatus = !isOnline
    setIsOnline(newStatus)

    sendDriverStatus(newStatus)

    if (newStatus) {
      sendLocation()

      if (locationIntervalRef.current) {
        clearInterval(locationIntervalRef.current)
      }

      locationIntervalRef.current = setInterval(() => {
        sendLocation()
      }, 10000)
    } else {
      if (locationIntervalRef.current) {
        clearInterval(locationIntervalRef.current)
        locationIntervalRef.current = null
      }
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0F0F1A', color: '#fff', padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontFamily: 'Poppins, sans-serif' }}>Driver Dashboard 🚗</h2>
          <p style={{ color: '#A0AEC0' }}>Welcome, {user?.phone_number || 'Driver'}</p>
        </div>

        <button
          onClick={toggleOnline}
          style={{
            padding: '10px 20px',
            borderRadius: '8px',
            background: isOnline ? '#48BB78' : '#E53E3E',
            color: 'white',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          {isOnline ? '🟢 Online' : '🔴 Offline'}
        </button>
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
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.08)'
        }}
      >
        {rideAlert.length === 0 ? (
          <p style={{ color: '#A0AEC0', textAlign: 'center' }}>No ride requests yet...</p>
        ) : (
          rideAlert.map((ride) => (
            <div key={ride.ride_id} style={{ marginBottom: '16px', padding: '16px', background: '#1b1b2a', borderRadius: '10px' }}>
              <h4>Ride Request</h4>
              <p>Pickup: {ride.pickup}</p>
              <p>Drop: {ride.drop}</p>
              <p>Vehicle: {ride.vehicle_type}</p>
              <p>Customer: {ride.customer_name}</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default DriverDashboard
