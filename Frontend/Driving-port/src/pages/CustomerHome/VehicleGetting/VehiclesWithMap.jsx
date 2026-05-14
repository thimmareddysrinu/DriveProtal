import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  useMap,
} from '@vis.gl/react-google-maps'
import { FaChevronDown, FaCaretDown } from 'react-icons/fa'
import { RiUserSharedFill } from 'react-icons/ri'
import LocationInput from '../LocationPoint'
import { VehicleSearch } from '../../../store/slices/VehicleSearch/VechicleSearch'
import { VehicleBooking } from '../../../store/slices/vehicleBooking/VehicleBooking'

import bike from '../../../images/vehicles/bike.png'
import go from '../../../images/vehicles/go.png'
import premier from '../../../images/vehicles/premier.png'
import scooty from '../../../images/vehicles/scooty.png'
import xl from '../../../images/vehicles/xl.png'
import gononac from '../../../images/vehicles/gononac.png'
import auto from '../../../images/vehicles/TukTuk_Green_v1.png'

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
const GOOGLE_MAPS_MAP_ID = import.meta.env.VITE_GOOGLE_MAPS_MAP_ID

const getVehicleIcon = (vehicleType) => {
  switch (vehicleType?.toLowerCase()) {
    case 'bike':
      return bike
    case 'scooty':
      return scooty
    case 'car_mini':
      return go
    case 'car_premium':
      return premier
    case 'car_sedan':
      return gononac
    case 'car_suv':
      return xl
    case 'auto':
      return auto
    default:
      return bike
  }
}

function Directions({ pickup, drop }) {
  const map = useMap()

  useEffect(() => {
    if (!map || !pickup || !drop || !window.google) return

    const directionsService = new google.maps.DirectionsService()
    const renderer = new google.maps.DirectionsRenderer({
      map,
      suppressMarkers: true,
      polylineOptions: {
        strokeColor: '#0a0a0a',
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

function VehiclesWithMap() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()

  const { vehicles: vehiclewithprice, loading, error } = useSelector(
    (state) => state.Vehiclesearch
  )

  const initialData = location.state || {}

  const [openRideDetails, setOpenRideDetails] = useState(true)
  const [selectedvehicle, setselectedvehicle] = useState(null)
  const [selectedMode, setselectedMode] = useState('normal')

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
          lng: Number(
            initialData.pickupCoords.lng ?? initialData.pickupCoords.lon
          ),
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
          lng: Number(
            initialData.pickupCoords.lng ?? initialData.pickupCoords.lon
          ),
        }
      : { lat: 17.385044, lng: 78.486671 }
  )

  const [showRoute, setShowRoute] = useState(
    !!(initialData.pickupCoords && initialData.dropCoords)
  )

  const isTwoWheeler = ['bike', 'scooty'].includes(
    selectedvehicle?.vehicle_type?.toLowerCase()
  )

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
    if (isTwoWheeler && selectedMode === 'shared') {
      setselectedMode('normal')
    }
  }, [isTwoWheeler, selectedMode])

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

  const bookvehicle = async () => {
    if (!selectedvehicle) {
      alert('Please select a vehicle first!')
      return
    }

    const bookingdata = {
      start_address: searchinput.start_address,
      end_address: searchinput.end_address,
      start_lat: Number(Number(searchinput.start_lat).toFixed(6)),
      start_lon: Number(Number(searchinput.start_lon).toFixed(6)),
      end_lat: Number(Number(searchinput.end_lat).toFixed(6)),
      end_lon: Number(Number(searchinput.end_lon).toFixed(6)),
      vehicle_type: selectedvehicle.vehicle_type,
      ride_mode: isTwoWheeler ? 'normal' : selectedMode,
    }

    try {
      const book = await dispatch(VehicleBooking(bookingdata)).unwrap()

      navigate('/vehicleBooking/Progress', {
        state: {
          searchdata: bookingdata,
          ride: book?.ride || book,
          pickupCoords: {
            lat: Number(bookingdata.start_lat),
            lng: Number(bookingdata.start_lon),
          },
          dropCoords: {
            lat: Number(bookingdata.end_lat),
            lng: Number(bookingdata.end_lon),
          },
        },
      })
    } catch (err) {
      console.error('Booking failed:', err)
      alert(err?.message || 'Booking failed')
    }
  }

  return (
    <div>
      {GOOGLE_MAPS_API_KEY ? (
        <APIProvider apiKey={GOOGLE_MAPS_API_KEY} libraries={['places', 'routes']}>
          <div
            className="d-flex flex-row gap-4 p-4"
            style={{ height: 'calc(100vh - 80px)', overflow: 'hidden' }}
          >
            <div className="col-md-6 d-flex flex-column" style={{ height: '100%', minHeight: 0 }}>
              <div
                className="flex-grow-1 overflow-auto p-3"
                style={{ minHeight: 0, paddingBottom: '120px' }}
              >
                <div className="text-dark mb-5">
                  <h1 style={{ fontWeight: 'bold', fontSize: '2.5rem', margin: 0 }}>
                    Choose A Ride
                  </h1>
                </div>

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

                <div className="shadow-sm rounded-4 p-4 bg-white">
                  <h3 className="text-dark mb-4" style={{ fontSize: '1.5rem' }}>
                    Rides we think you'll like
                  </h3>

                  {loading && <p className="text-muted">Loading vehicles...</p>}
                  {error && (
                    <p className="text-danger">
                      {typeof error === 'string' ? error : error?.message || 'Something went wrong'}
                    </p>
                  )}

                  {vehiclewithprice?.length > 0 ? (
                    vehiclewithprice.map((vehicle, index) => (
                      <div
                        key={index}
                        className="mb-3 p-4 shadow-sm"
                        style={{
                          borderRadius: '18px',
                          border:
                            selectedvehicle?.vehicle_type === vehicle.vehicle_type
                              ? '4px solid #eabd1ad4'
                              : '4px solid transparent',
                          cursor: 'pointer',
                          background: '#fff',
                        }}
                        onClick={() => setselectedvehicle(vehicle)}
                      >
                        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                          <div className="d-flex align-items-center gap-3">
                            <img
                              src={getVehicleIcon(vehicle.vehicle_type)}
                              alt={vehicle.vehicle_name}
                              width={124}
                              height={124}
                              style={{ objectFit: 'contain' }}
                            />
                            <div>
                              <h5 className="mb-1 text-dark fw-bold">{vehicle.vehicle_name}</h5>
                            </div>
                          </div>

                          <div className="d-flex align-items-center gap-4">
                            <div className="text-center">
                              <p className="mb-1 text-danger fw-semibold">Normal</p>
                              <div className="fw-bold fs-4 text-warning">
                                ₹{vehicle.normal?.total_price ?? 'N/A'}
                              </div>
                            </div>

                            <div
                              style={{
                                width: '1px',
                                height: '60px',
                                backgroundColor: '#ddd',
                              }}
                            ></div>

                            <div className="text-center">
                              <p className="mb-1 text-primary fw-semibold">Shared</p>
                              <div className="fw-bold fs-4 text-warning">
                                ₹{vehicle.shared?.total_price ?? 'N/A'}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    !loading && (
                      <div className="text-center py-5 text-muted">
                        <p className="mb-0">No vehicles found</p>
                        <small>Enter locations to see available rides</small>
                      </div>
                    )
                  )}
                </div>
              </div>

              <div
                className="bg-white shadow-lg border-top rounded-top-4 p-3"
                style={{ flexShrink: 0 }}
              >
                <div className="row g-2">
                  <div className="col-5">
                    <div className="dropdown">
                      <button
                        className="btn btn-outline-warning w-100 py-3 fs-6 fw-bold rounded-3 shadow-sm text-warning border-warning"
                        type="button"
                        data-bs-toggle={isTwoWheeler ? undefined : 'dropdown'}
                        aria-expanded="false"
                        disabled={!selectedvehicle || isTwoWheeler}
                      >
                        {!selectedvehicle
                          ? 'Select Ride'
                          : isTwoWheeler
                          ? 'Normal Only'
                          : selectedMode === 'normal'
                          ? 'Normal'
                          : 'Shared'}
                        {!isTwoWheeler && selectedvehicle ? <FaCaretDown className="ms-2" /> : null}
                      </button>

                      {!isTwoWheeler && selectedvehicle && (
                        <ul className="dropdown-menu w-100">
                          <li>
                            <button
                              className={`dropdown-item ${selectedMode === 'normal' ? 'active fw-bold' : ''}`}
                              onClick={() => setselectedMode('normal')}
                            >
                              Normal
                            </button>
                          </li>
                          <li>
                            <button
                              className={`dropdown-item ${selectedMode === 'shared' ? 'active fw-bold' : ''}`}
                              onClick={() => setselectedMode('shared')}
                            >
                              Shared <RiUserSharedFill size={16} className="ms-2" />
                            </button>
                          </li>
                        </ul>
                      )}

                      {isTwoWheeler && selectedvehicle && (
                        <small className="text-muted mt-1 d-block">
                          Shared rides not available for two-wheelers
                        </small>
                      )}
                    </div>
                  </div>

                  <div className="col-7">
                    <button
                      onClick={bookvehicle}
                      className="btn btn-warning w-100 py-3 fs-6 fw-bold rounded-3 shadow-sm"
                    >
                      Request {selectedvehicle?.vehicle_name || 'Ride'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-6 p-0" style={{ height: '100%', minHeight: 0 }}>
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
                      <Pin background="#22c55e" />
                    </AdvancedMarker>
                  )}

                  {dropCoords && (
                    <AdvancedMarker position={dropCoords}>
                      <Pin background="#ef4444" />
                    </AdvancedMarker>
                  )}

                  {showRoute && pickupCoords && dropCoords && (
                    <Directions pickup={pickupCoords} drop={dropCoords} />
                  )}
                </Map>
              </div>
            </div>
          </div>
        </APIProvider>
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

export default VehiclesWithMap