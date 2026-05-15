import React, { useEffect, useState, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Map, AdvancedMarker, Pin, useMap } from '@vis.gl/react-google-maps'
import { CheckRideStatus } from '../../../store/slices/vehicleBooking/VehicleBooking'

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
        strokeColor: '#eda909',
        strokeWeight: 5,
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

function AcceptedRide() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  
  const { currentRide, currentDriver, currentVehicle } = useSelector((state) => state.Vehiclebooks)

  const [pickupCoords, setPickupCoords] = useState(null)
  const [dropCoords, setDropCoords] = useState(null)
  const [timer, setTimer] = useState(180) // 3 mins mock ETA
  
  const pollingRef = useRef(null)

  useEffect(() => {
    if (!currentRide) {
      navigate('/customer/home')
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

    // Polling ride status
    const fetchRideStatus = async () => {
      try {
        const result = await dispatch(CheckRideStatus(currentRide.id)).unwrap()
        if (result?.ride?.status === 'completed') {
          navigate('/customer/history')
        }
      } catch (err) {
        console.log('CheckRideStatus FAILED:', err)
      }
    }

    fetchRideStatus()
    pollingRef.current = setInterval(fetchRideStatus, 3000)

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current)
    }
  }, [currentRide?.id, dispatch, navigate])

  useEffect(() => {
    const countdown = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(countdown)
  }, [])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${String(secs).padStart(2, '0')}`
  }

  if (!currentRide) return <div className="p-5 text-center">Loading...</div>

  return (
    <div className="d-flex flex-column flex-lg-row" style={{ height: 'calc(100vh - 80px)', overflow: 'hidden' }}>
      
      {/* LEFT PANEL */}
      <div className="col-lg-5 p-4 d-flex flex-column bg-light" style={{ overflowY: 'auto' }}>
        <h2 className="fw-bold mb-4">Ride Details</h2>

        {/* OTP Section */}
        {['driver_assigned', 'driver_arrived'].includes(currentRide.status) && (
          <div className="card shadow-sm border-0 mb-4 bg-white rounded-4 p-4 text-center">
            <h5 className="text-muted mb-2">Share this OTP to start the ride</h5>
            <div className="display-4 fw-bold text-success" style={{ letterSpacing: '8px' }}>
              {currentRide.otp || '1234'}
            </div>
          </div>
        )}

        {/* Status & Timer */}
        <div className="card shadow-sm border-0 mb-4 bg-white rounded-4 p-4">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h5 className="fw-bold mb-1">
                {currentRide.status === 'driver_assigned' && 'Driver is on the way'}
                {currentRide.status === 'driver_arrived' && 'Driver has arrived!'}
                {currentRide.status === 'ongoing' && 'Ride in progress'}
              </h5>
              <p className="text-muted mb-0">{currentRide.status_display}</p>
            </div>
            {currentRide.status === 'driver_assigned' && (
              <div className="bg-warning text-dark px-3 py-2 rounded-3 fw-bold fs-5">
                {formatTime(timer)}
              </div>
            )}
          </div>
        </div>

        {/* Driver Details */}
        {currentDriver && (
          <div className="card shadow-sm border-0 mb-4 bg-white rounded-4 p-4">
            <div className="d-flex align-items-center mb-3">
              <div className="bg-secondary text-white rounded-circle d-flex justify-content-center align-items-center" style={{ width: 60, height: 60, fontSize: '1.5rem' }}>
                {currentDriver.full_name?.charAt(0) || currentDriver.name?.charAt(0) || 'D'}
              </div>
              <div className="ms-3">
                <h5 className="fw-bold mb-0">{currentDriver.full_name || currentDriver.name}</h5>
                <p className="text-muted mb-0">{currentDriver.phone_number}</p>
              </div>
            </div>
            {currentVehicle && (
              <div className="bg-light rounded-3 p-3 mt-2 border">
                <p className="mb-1 fw-bold fs-5 text-center">{currentVehicle.registration_number}</p>
                <p className="mb-0 text-center text-muted">{currentVehicle.brand} {currentVehicle.vehicle_model}</p>
              </div>
            )}
          </div>
        )}
         {currentRide && (
          <div className="card shadow-sm border-0 mb-4 bg-white rounded-4 p-4">
            <div className="d-flex align-items-center mb-3">
             
              <div className="ms-3">
                <h5 className="fw-bold mb-0">{currentRide.total_price}</h5>
             </div>
            </div>
         
          </div>
        )}

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
          <div className="d-flex justify-content-center align-items-center h-100 bg-light">
            <p>Loading Map...</p>
          </div>
        )}
      </div>

    </div>
  )
}

export default AcceptedRide