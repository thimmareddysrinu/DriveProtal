import React, { useEffect, useState, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Map, AdvancedMarker, Pin, useMap } from '@vis.gl/react-google-maps'
import { CheckRideStatus, DriverArrived, StartRide } from '../../store/slices/vehicleBooking/VehicleBooking'

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
const GOOGLE_MAPS_MAP_ID = import.meta.env.VITE_GOOGLE_MAPS_MAP_ID

function Directions({ pickup, drop }) {
  const map = useMap()

  useEffect(() => {
    if (!map || !pickup || !drop || !window.google) return

    const directionsService = new google.maps.DirectionsService()
    const renderer = new google.maps.DirectionsRenderer({
      map,
      suppressMarkers: true,
      polylineOptions: {
        strokeColor: '#f4be0f',
        strokeWeight: 6,
      },
    })

    directionsService.route(
      {
        origin: pickup,
        destination: drop,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === 'OK') {
          renderer.setDirections(result)
          const bounds = result.routes[0].bounds
          map.fitBounds(bounds, {
            padding: { top: 80, right: 80, bottom: 80, left: 80 }
          })
        }
      }
    )

    return () => renderer.setMap(null)
  }, [map, pickup, drop])

  return null
}

function DriverRideView() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  
  const { currentRide } = useSelector((state) => state.Vehiclebooks)

  const [pickupCoords, setPickupCoords] = useState(null)
  const [dropCoords, setDropCoords] = useState(null)
  const [otpInput, setOtpInput] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  
  const pollingRef = useRef(null)

  useEffect(() => {
    if (!currentRide) {
      navigate('/driver/dashboard')
      return
    }

    if (currentRide.start_lat && currentRide.start_lon) {
      setPickupCoords({
        lat: Number(currentRide.start_lat),
        lng: Number(currentRide.start_lon),
      })
    }
    if (currentRide.end_lat && currentRide.end_lon) {
      setDropCoords({
        lat: Number(currentRide.end_lat),
        lng: Number(currentRide.end_lon),
      })
    }

    const fetchRideStatus = async () => {
      try {
        const result = await dispatch(CheckRideStatus(currentRide.id)).unwrap()
        if (result?.ride?.status === 'completed') {
          navigate('/driver/dashboard')
        }
      } catch (err) {
        console.log('CheckRideStatus FAILED:', err)
      }
    }

    pollingRef.current = setInterval(fetchRideStatus, 3000)
    return () => clearInterval(pollingRef.current)
  }, [currentRide?.id, dispatch, navigate])

  const handleArrived = async () => {
    try {
      await dispatch(DriverArrived(currentRide.id)).unwrap()
      dispatch(CheckRideStatus(currentRide.id))
    } catch (err) {
      alert(err.message || 'Failed to update status to arrived')
    }
  }

  const handleStartRide = async () => {
    if (otpInput.length !== 4) {
      setErrorMsg('OTP must be 4 digits')
      return
    }
    setErrorMsg('')
    try {
      await dispatch(StartRide({ rideId: currentRide.id, otp: otpInput })).unwrap()
      dispatch(CheckRideStatus(currentRide.id))
    } catch (err) {
      setErrorMsg(err.message || 'Invalid OTP. Please try again.')
    }
  }

  if (!currentRide) return <div className="p-5 text-center text-white">Loading...</div>

  return (
    <div className="d-flex flex-column-reverse flex-lg-row" style={{ height: '100vh', background: '#0F0F1A', color: '#fff', overflow: 'hidden' }}>
      
      {/* LEFT PANEL */}
      <div className="col-lg-5 p-4 d-flex flex-column" style={{ overflowY: 'auto', borderRight: '1px solid rgba(255,255,255,0.1)' }}>
        <h2 className="fw-bold mb-4" style={{ color: '#F6AF12' }}>Active Ride</h2>

        {/* Customer Details */}
        <div className="p-4 mb-4" style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '16px' }}>
          <h5 className="mb-3 text-muted">Customer Information</h5>
          <h4 className="fw-bold">{currentRide.customer_name || 'Customer'}</h4>
          <p className="mb-0 fs-5">📞 {currentRide.customer_phone || 'N/A'}</p>
        </div>

        {/* Route Details */}
        <div className="p-4 mb-4" style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '16px' }}>
          <h5 className="mb-3 text-muted">Route</h5>
          <div className="mb-3">
            <span className="text-success fw-bold">🟢 Pickup:</span>
            <p className="mb-0">{currentRide.pickup_address}</p>
          </div>
          <div>
            <span className="text-danger fw-bold">🔴 Drop:</span>
            <p className="mb-0">{currentRide.drop_address}</p>
          </div>
        </div>

        {/* Actions based on status */}
        <div className="mt-auto">
          {currentRide.status === 'driver_assigned' && (
            <button 
              className="btn btn-warning w-100 py-3 fs-5 fw-bold rounded-4"
              onClick={handleArrived}
            >
              I have arrived at Pickup
            </button>
          )}

          {currentRide.status === 'driver_arrived' && (
            <div className="p-4" style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '16px' }}>
              <h5 className="text-center mb-3">Enter OTP from Customer</h5>
              <input 
                type="text" 
                className="form-control text-center mb-3 fs-3 fw-bold" 
                style={{ letterSpacing: '8px', background: 'rgba(0,0,0,0.2)', color: '#fff', border: '1px solid #F6AF12' }}
                maxLength={4}
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value)}
                placeholder="----"
              />
              {errorMsg && <p className="text-danger text-center">{errorMsg}</p>}
              <button 
                className="btn btn-success w-100 py-3 fs-5 fw-bold rounded-4"
                onClick={handleStartRide}
              >
                Verify & Start Ride
              </button>
            </div>
          )}

          {currentRide.status === 'ongoing' && (
            <div className="p-4 text-center" style={{ background: 'rgba(40,167,69,0.2)', borderRadius: '16px', border: '1px solid #28a745' }}>
              <h4 className="text-success fw-bold mb-0">Ride is Ongoing</h4>
              <p className="text-muted mt-2 mb-0">Follow the map to the drop location</p>
            </div>
          )}
        </div>

      </div>

      {/* RIGHT PANEL - MAP */}
      <div className="col-lg-7" style={{ height: '100%', position: 'relative' }}>
        {GOOGLE_MAPS_API_KEY && pickupCoords && dropCoords ? (
          <Map
            mapId={GOOGLE_MAPS_MAP_ID || 'DEMO_MAP_ID'}
            defaultCenter={pickupCoords}
            defaultZoom={13}
            gestureHandling="greedy"
            disableDefaultUI={true}
            style={{ width: '100%', height: '100%' }}
          >
            <AdvancedMarker position={pickupCoords}>
              <Pin background="#28a745" borderColor="#1e7e34" glyphColor="#fff" />
            </AdvancedMarker>
            
            <AdvancedMarker position={dropCoords}>
              <Pin background="#dc3545" borderColor="#c82333" glyphColor="#fff" />
            </AdvancedMarker>

            <Directions pickup={pickupCoords} drop={dropCoords} />
          </Map>
        ) : (
          <div className="d-flex justify-content-center align-items-center h-100" style={{ background: '#1A1A2E' }}>
            <p className="text-muted fs-4">Loading Map...</p>
          </div>
        )}
      </div>

    </div>
  )
}

export default DriverRideView
