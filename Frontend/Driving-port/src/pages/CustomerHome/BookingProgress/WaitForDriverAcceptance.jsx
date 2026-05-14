import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Map,
  AdvancedMarker,
  Pin,
  useMap,
} from '@vis.gl/react-google-maps'
import { FaChevronDown } from 'react-icons/fa'
import LocationInput from '../LocationPoint'
import { VehicleSearch } from '../../../store/slices/VehicleSearch/VechicleSearch'
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
        strokeColor: '#e4c40a',
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
          
          // ✅ FIT MAP TO SHOW COMPLETE ROUTE
          const bounds = result.routes[0].bounds
          map.fitBounds(bounds, {
            padding: { top: 80, right: 80, bottom: 80, left: 80 } // Add padding so markers aren't at edges
          })
        }
      }
    )

    return () => renderer.setMap(null)
  }, [map, pickup, drop])

  return null
}


function WaitForDriverAcceptance() {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  const initialData = location.state || {}

  const [openRideDetails, setOpenRideDetails] = useState(true)
  const [tomercount, settomercount] = useState(300)

  const {
    currentRide,
    currentDriver,
    currentVehicle,
    loading,
    error,
  } = useSelector((state) => state.Vehiclebooks)

  const fallbackRide = initialData.ride || null
  const activeRide = currentRide || fallbackRide

  const isDriverAssigned =
    activeRide?.status === 'driver_assigned' &&
    !!currentDriver &&
    !!currentVehicle

  const [searchinput, setsearchinput] = useState({
    start_address: initialData.searchdata?.start_address || '',
    end_address: initialData.searchdata?.end_address || '',
    start_lat: initialData.searchdata?.start_lat || '',
    start_lon: initialData.searchdata?.start_lon || '',
    end_lat: initialData.searchdata?.end_lat || '',
    end_lon: initialData.searchdata?.end_lon || '',
  })

  const [pickupCoords, setPickupCoords] = useState(
    initialData.pickupCoords
      ? {
          lat: Number(initialData.pickupCoords.lat),
          lng: Number(initialData.pickupCoords.lng ?? initialData.pickupCoords.lon),
        }
      : null
  )

  const [dropCoords, setDropCoords] = useState(
    initialData.dropCoords
      ? {
          lat: Number(initialData.dropCoords.lat),
          lng: Number(initialData.dropCoords.lng ?? initialData.dropCoords.lon),
        }
      : null
  )

  const [mapCenter, setMapCenter] = useState(
    initialData.pickupCoords
      ? {
          lat: Number(initialData.pickupCoords.lat),
          lng: Number(initialData.pickupCoords.lng ?? initialData.pickupCoords.lon),
        }
      : { lat: 17.385044, lng: 78.486671 }
  )

  const [showRoute, setShowRoute] = useState(
    !!(initialData.pickupCoords && initialData.dropCoords)
  )

  const pollingRef = useRef(null)

  useEffect(() => {
    if (
      initialData.pickupCoords?.lat &&
      (initialData.pickupCoords?.lon || initialData.pickupCoords?.lng)
    ) {
      const pickup = {
        lat: Number(initialData.pickupCoords.lat),
        lng: Number(initialData.pickupCoords.lon ?? initialData.pickupCoords.lng),
      }
      setPickupCoords(pickup)
      setMapCenter(pickup)
      setShowRoute(true)
    }

    if (
      initialData.dropCoords?.lat &&
      (initialData.dropCoords?.lon || initialData.dropCoords?.lng)
    ) {
      setDropCoords({
        lat: Number(initialData.dropCoords.lat),
        lng: Number(initialData.dropCoords.lon ?? initialData.dropCoords.lng),
      })
    }
  }, [initialData.pickupCoords, initialData.dropCoords])

  useEffect(() => {
    if (searchinput.start_lat && searchinput.start_lon) {
      const coords = {
        lat: Number(searchinput.start_lat),
        lng: Number(searchinput.start_lon),
      }
      setPickupCoords(coords)
      setMapCenter(coords)
    }
  }, [searchinput.start_lat, searchinput.start_lon])

  useEffect(() => {
    if (searchinput.end_lat && searchinput.end_lon) {
      setDropCoords({
        lat: Number(searchinput.end_lat),
        lng: Number(searchinput.end_lon),
      })
    }
  }, [searchinput.end_lat, searchinput.end_lon])

  useEffect(() => {
    if (!activeRide?.id || isDriverAssigned || tomercount <= 0) {
      if (pollingRef.current) {
        clearInterval(pollingRef.current)
        pollingRef.current = null
      }
      return
    }

    const fetchRideStatus = async () => {
      try {
        const result = await dispatch(CheckRideStatus(activeRide.id)).unwrap()
        console.log('✅ Immediate/Polling SUCCESS, got data:', result)
      } catch (err) {
        console.log('❌ CheckRideStatus FAILED:', err?.message || err)
      }
    }

    fetchRideStatus()
    pollingRef.current = setInterval(fetchRideStatus, 3000)

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current)
        pollingRef.current = null
      }
    }
  }, [activeRide?.id, isDriverAssigned, tomercount, dispatch])

  useEffect(() => {
    if (isDriverAssigned) {
      settomercount(0)
      return
    }

    if (!activeRide?.id || tomercount <= 0) return

    const timer = setInterval(() => {
      settomercount((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          navigate('/ride-cancelled', { replace: true })
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isDriverAssigned, activeRide?.id, navigate])

  const handleSearch = async () => {
    if (!searchinput.start_lat || !searchinput.end_lat) {
      alert('Enter both locations from the dropdown suggestions!')
      return
    }

    try {
      await dispatch(VehicleSearch(searchinput)).unwrap()
      setShowRoute(true)
    } catch (err) {
      console.error('Search failed:', err)
      alert(err?.message || 'Failed to search vehicles')
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${String(secs).padStart(2, '0')}`
  }

  return (
    <div>
      {GOOGLE_MAPS_API_KEY ? (
        <div
          className="d-flex flex-column-reverse flex-lg-row gap-4 p-4 "
          style={{ height: 'calc(100vh - 80px)', overflow: 'hidden' }}
        >
          <div className="col-md-6 d-flex flex-column" style={{ height: '100%', minHeight: 0 }}>
            <div
              className="flex-grow-1 overflow-auto p-3"
              style={{ minHeight: 0, paddingBottom: '120px' }}
            >
              <div className="text-dark mb-5">
                <h1 style={{ fontWeight: 'bold', fontSize: '2.5rem', margin: 0, color: 'green' }}>
                  Booked A Ride
                </h1>
              </div>

              {isDriverAssigned && currentDriver && (
                <div className="alert alert-success mt-3">
                  Driver {currentDriver.full_name || currentDriver.name || 'Driver'} accepted your ride.
                </div>
              )}

              <div className="bg-light p-4 mb-4 rounded-4 shadow-sm">
                <div className="border-0 shadow-sm rounded-4 overflow-hidden">
                  <button
                    type="button"
                    className="w-100 border-0 bg-white text-start p-4"
                    onClick={() => setOpenRideDetails(!openRideDetails)}
                  >
                    <div className="d-flex justify-content-between align-items-start">
                      <h6
                        className="mb-0 fw-bold text-dark"
                        style={{
                          fontSize: '1.1rem',
                          lineHeight: '1.3',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          maxWidth: '75%',
                        }}
                      >
                        {searchinput.start_address && searchinput.end_address
                          ? `${searchinput.start_address.slice(0, 25)} → ${searchinput.end_address.split(',')[0]}`
                          : 'Pickup location → Drop location'}
                      </h6>

                      <FaChevronDown
                        size={20}
                        className="text-muted ms-3"
                        style={{
                          marginTop: '4px',
                          transform: openRideDetails ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: 'transform 0.3s ease',
                        }}
                      />
                    </div>
                  </button>

                  {openRideDetails && (
                    <div
                      className="p-4"
                      style={{ background: '#f8f9fa', borderRadius: '0 0 12px 12px' }}
                    >
                      <LocationInput
                        placeholder="Pickup location"
                        field="start"
                        setSearchInput={setsearchinput}
                        value={searchinput.start_address}
                      />
                      <LocationInput
                        placeholder="Drop location"
                        field="end"
                        setSearchInput={setsearchinput}
                        value={searchinput.end_address}
                      />
                      <button
                        onClick={handleSearch}
                        className="btn w-100 mt-3 py-2"
                        style={{
                          background: '#000',
                          color: '#fff',
                          borderRadius: '12px',
                          fontWeight: 600,
                          fontSize: '1.1rem',
                        }}
                      >
                        Find Route
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="shadow-sm rounded-4 p-0">
                {activeRide ? (
                  <div className="shadow-sm rounded-4  bg-white">

                  {/* <div className="shadow-sm rounded-4  bg-white">
                    <h3 className="text-dark mb-4" style={{ fontSize: '1.5rem' }}>
                      {isDriverAssigned
                        ? ''
                        : 'Waiting for driver acceptance'}
                    </h3>
                  </div> */}
                    <div className=" shadow-sm rounded-4  bg-white text-center py-3">
                      {!isDriverAssigned && (
                        <div
                          className="spinner-border text-warning mb-4"
                          role="status"
                          style={{ width: '3rem', height: '3rem' }}
                        >
                          <span className="visually-hidden">Loading...</span>
                        </div>
                      )}

                      <h4 className="fw-bold text-dark mb-3">
                        {isDriverAssigned
                          ? 'Pickup In 2 minus'
                          : 'Looking for a driver nearby'}
                      </h4>

                      {!isDriverAssigned && (
                        <>
                          <p className="text-dark mb-2">
                            Your ride request has been sent successfully.
                          </p>
                          <p className="text-dark mb-4">
                            Please wait while a driver accepts your booking.
                          </p>
                        </>
                      )}

                      <div
                        className="mx-auto ps-1 pb-4 pe-2 pt-4 rounded-4"
                        style={{ maxWidth: '500px' }}
                      >
                        {/* <div className='card mb-3 p-3'>
                          <p>Ride Details</p>
                                <h6
                        className="mb-0 fw-bold fs-4 text-dark"
                        style={{
                          fontSize: '1.1rem',
                          lineHeight: '1.3',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          maxWidth: '75%',
                        }}
                      >
                        
                        {activeRide.pickup_address && activeRide.drop_address
                          ? `${activeRide.pickup_address.slice(0, 14)} → ${activeRide.drop_address.split(',')[0]}`
                          : 'Pickup location → Drop location'}
                      </h6>

                        </div> */}
  
  <div className="card py-4 px-1 w-100 h-100">
    <div className="row align-items-center">
      <div className="col-4 text-center">
        <img
          src={activeRide.vehicle_image || 'https://via.placeholder.com/150'}
          alt="Vehicle"
          className="img-fluid"
          style={{
            width: '70px',
            height: '70px',
            borderRadius: '50%',
            background: '#b12c2c',
            padding: '10px',
            objectFit: 'cover'
          }}
        />
      </div>
        <div className="col-4">
        {isDriverAssigned && currentVehicle && (
          <div className="d-flex flex-column">
            <p className="mb-1 fw-bold">
              {currentVehicle.registration_number || 'N/A'}
            </p>
            <p className="mb-0">
              {`${currentVehicle.brand || ''} ${currentVehicle.vehicle_model || currentVehicle.vehiclemodel || ''}`.trim() || 'N/A'}
            </p>
          </div>
        )}
      </div>

      <div className="col-4">
        {isDriverAssigned && currentVehicle && (
          <div className="d-flex flex-column">
            <p className="mb-1 fw-bold">
              {currentVehicle.registration_number || 'N/A'}
            </p>
            <p className="mb-0">
              {`${currentVehicle.brand || ''} ${currentVehicle.vehicle_model || currentVehicle.vehiclemodel || ''}`.trim() || 'N/A'}
            </p>
          </div>
        )}
      </div>
    </div>
  </div>

                      
                        <p className="mb-2">
                          <strong>Status:</strong> {activeRide.status_display || activeRide.status}
                        </p>
                        <p className="mb-2">
                          <strong>Vehicle Type:</strong>{' '}
                          {activeRide.vehicle_type_display || activeRide.vehicle_type}
                        </p>
                        <p className="mb-2">
                          <strong>Price:</strong> ₹{activeRide.total_price}
                        </p>

                        {/* {isDriverAssigned && currentDriver && (
                          <div className="card">
                            <hr />
                            <p className="mb-2">
                              <strong>Driver Name:</strong>{' '}
                              {currentDriver.full_name || currentDriver.name || 'N/A'}
                            </p>
                            <p className="mb-2">
                              <strong>Driver Phone:</strong>{' '}
                              {currentDriver.phone_number || currentDriver.mobile || 'N/A'}
                            </p>
                          </div>
                        )}

                        {isDriverAssigned && currentVehicle && (
                          <div className="card">
                            <hr />
                            <p className="mb-2">
                              <strong>Vehicle Number:</strong>{' '}
                              {currentVehicle.registration_number || 'N/A'}
                            </p>
                            <p className="mb-2">
                              <strong>Vehicle:</strong>{' '}
                              {`${currentVehicle.brand || ''} ${currentVehicle.vehicle_model || currentVehicle.vehiclemodel || ''}`.trim() || 'N/A'}
                            </p>
                          </div>
                        )} */}
                      </div>

                      {loading && (
                        <p className="text-muted mt-3 mb-0">
                          Refreshing latest driver details...
                        </p>
                      )}

                      {error && !isDriverAssigned && (
                        <p className="text-danger mt-3 mb-0">
                          {typeof error === 'string'
                            ? error
                            : error?.message || 'Something went wrong while checking driver status.'}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="shadow-sm rounded-4 p-4 bg-white">
                    <h3 className="text-dark mb-4" style={{ fontSize: '1.5rem' }}>
                      Waiting for driver acceptance
                    </h3>
                    <div className="text-center py-5 text-muted">
                      No active ride request found.
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div
              className="bg-white shadow-lg border-top rounded-top-4 p-3 d-none d-md-block d-lg-block"
              style={{ flexShrink: 0 }}
            >
              <div className="row g-2">
                <div className="col-12">
<button className="btn btn-warning w-100 py-3 fs-6 fw-bold rounded-3 shadow-sm">
                    {isDriverAssigned
                      ? 'Driver Assigned'
                      : `Waiting Time: ${formatTime(tomercount)}`}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-6 pe-3" style={{ height: '100%', minHeight: 0 }}>
            <div
              style={{
                height: '100%',
                width: '100%',
                borderRadius: '20px',
                overflow: 'hidden',
              }}
            >
            <Map
  mapId={GOOGLE_MAPS_MAP_ID || 'DEMO_MAP_ID'}
  defaultCenter={mapCenter}
  defaultZoom={13}
  gestureHandling="greedy"
  tilt={0}
  heading={0}
  style={{ width: '100%', height: '100%' }}
>
                {pickupCoords && (
                  <AdvancedMarker position={pickupCoords}>
                    <Pin background="#f1d628" />
                  </AdvancedMarker>
                )}

                {dropCoords && (
                  <AdvancedMarker position={dropCoords}>
                    <Pin background="#f0e116" />
                  </AdvancedMarker>
                )}

                {showRoute && pickupCoords && dropCoords && (
                  <Directions pickup={pickupCoords} drop={dropCoords} />
                )}
              </Map>
            </div>
          </div>
        </div>
      ) : (
        <div className="alert alert-warning d-flex align-items-center justify-content-center vh-100">
          <div className="text-center">
            <h4>🚨 Map Configuration Required</h4>
            <p>
              Add <code>VITE_GOOGLE_MAPS_API_KEY</code> to .env
            </p>
            <small>Enable "Places API (New)" and "Maps JavaScript API"</small>
          </div>
        </div>
      )}
    </div>
  )
}

export default WaitForDriverAcceptance