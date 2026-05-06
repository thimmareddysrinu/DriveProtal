
import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import { APIProvider, Map, AdvancedMarker, Pin, useMap } from '@vis.gl/react-google-maps'
import { FaChevronDown } from "react-icons/fa"
import LocationInput from '../LocationPoint'
import { VehicleSearch } from '../../../store/slices/VehicleSearch/VechicleSearch'
import { RiUserSharedFill } from "react-icons/ri";
import bike from '../../../images/vehicles/bike.png'
import bikesaver from '../../../images/vehicles/bikesaver.png'
import go from '../../../images/vehicles/go.png'
import premier from '../../../images/vehicles/premier.png'
import scooty from '../../../images/vehicles/scooty.png'
import xl_premier from '../../../images/vehicles/XL_Premium.png'
import xl from '../../../images/vehicles/xl.png'
import gononac from '../../../images/vehicles/gononac.png'
import auto from '../../../images/vehicles/TukTuk_Green_v1.png'
import { FaCaretDown } from "react-icons/fa";
import { VehicleBooking } from '../../../store/slices/vehicleBooking/VehicleBooking'




const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
const GOOGLE_MAPS_MAP_ID = import.meta.env.VITE_GOOGLE_MAPS_MAP_ID





function Directions({ pickup, drop }) {
    const map = useMap()

    useEffect(() => {
        if (!map || !pickup || !drop) return

        const directionsService = new google.maps.DirectionsService()
        const renderer = new google.maps.DirectionsRenderer({
            map,
            suppressMarkers: true,
            polylineOptions: {
                strokeColor: '#0a0a0a',
                strokeWeight: 5,
            }
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
    const initaldata = location.state || {}
    const dispatch = useDispatch()
    const [openRideDetails, setOpenRideDetails] = useState(true)
    const [setvehicles, setsetvehicles] = useState('')
    const [selectedvehicle, setselectedvehicle] = useState(null)
    const [selectedMode, setselectedMode] = useState("normal")
    const [tomercount, settomercount] = useState(3000)

    const [ride, setride] = useState(location.state?.ride || null)
    // const initaldata = location.state || ""
    const [searchinput, setsearchinput] = useState({
        start_address: initaldata.searchdata?.start_address || "",
        end_address: initaldata.searchdata?.end_address || "",
        start_lat: initaldata.searchdata?.start_lat || "",
        start_lon: initaldata.searchdata?.start_lon || "",
        end_lat: initaldata.searchdata?.end_lat || "",
        end_lon: initaldata.searchdata?.end_lon || ""
    })

    // Coordinates state - Fixed null handling

//   using timer of driver acceptance


useEffect(() => {
    if (ride?.id) {
        const interval=setInterval(() => {
            settomercount(tomercount - 1)
            
        }, interval);
        
    } else {
        
    }
  
}, [])



    // booking vehicle
    //   const bookvehicle = async () => {
    //     if (!selectedvehicle) {
    //       alert('Please select a vehicle first!')
    //       return
    //     }

    //     const bookingdata = {
    //       start_address: searchinput.start_address,
    //       end_address: searchinput.end_address,
    //       start_lat: Number(Number(searchinput.start_lat).toFixed(6)),
    //       start_lon: Number(Number(searchinput.start_lon).toFixed(6)),
    //       end_lat: Number(Number(searchinput.end_lat).toFixed(6)),
    //       end_lon: Number(Number(searchinput.end_lon).toFixed(6)),
    //       vehicle_type: selectedvehicle.vehicle_type,
    //       ride_mode: selectedMode,
    //     }
    //     console.log('booking data', bookingdata)
    //     try {
    //       const book = await dispatch(VehicleBooking(bookingdata)).unwrap()
    //       console.log(book)
    //     } catch (error) {
    //       console.error('Booking failed:', error)
    //       alert(error.message || 'Booking Is Failed')
    //     }
    //   }




    // booking vehicle

    const [pickupCoords, setPickupCoords] = useState(
        initaldata.pickupCoords ? {
            lat: Number(initaldata.pickupCoords.lat),
            lng: Number(initaldata.pickupCoords.lng)
        } : null
    )

    const [dropCoords, setDropCoords] = useState(
        initaldata.dropCoords ? {
            lat: Number(initaldata.dropCoords.lat),
            lng: Number(initaldata.dropCoords.lng)
        } : null
    )

    const [mapCenter, setMapCenter] = useState(
        initaldata.pickupCoords
            ? { lat: Number(initaldata.pickupCoords.lat), lng: Number(initaldata.pickupCoords.lng) }
            : { lat: 17.385044, lng: 78.486671 }
    )

    const [showRoute, setShowRoute] = useState(
        !!(initaldata.pickupCoords && initaldata.dropCoords)
    )
    // Initialize from location state
    useEffect(() => {
        if (initaldata.pickupCoords?.lat && initaldata.pickupCoords?.lon) {
            const pickup = { lat: Number(initaldata.pickupCoords.lat), lng: Number(initaldata.pickupCoords.lon) }
            setPickupCoords(pickup)
            setMapCenter(pickup)
            setShowRoute(true)
        }
        if (initaldata.dropCoords?.lat && initaldata.dropCoords?.lon) {
            setDropCoords({ lat: Number(initaldata.dropCoords.lat), lng: Number(initaldata.dropCoords.lon) })
        }
    }, [])

    useEffect(() => {
        if (searchinput.start_lat && searchinput.start_lon) {
            const coords = { lat: Number(searchinput.start_lat), lng: Number(searchinput.start_lon) }
            setPickupCoords(coords)
            setMapCenter(coords)
        }
    }, [searchinput.start_lat, searchinput.start_lon])

    useEffect(() => {
        if (searchinput.end_lat && searchinput.end_lon) {
            setDropCoords({ lat: Number(searchinput.end_lat), lng: Number(searchinput.end_lon) })
        }
    }, [searchinput.end_lat, searchinput.end_lon])

    const handleSearch = async () => {
        if (!searchinput.start_lat || !searchinput.end_lat) {
            alert("Enter both locations from the dropdown suggestions!")
            return
        }

        try {
            const result = await dispatch(VehicleSearch(searchinput)).unwrap()
            setShowRoute(true)
        } catch (error) {
            console.error('Search failed:', error)
            alert(error.message || 'Failed to search vehicles')
        }
    }
    return (
        <div >
            {GOOGLE_MAPS_API_KEY ? (
                <APIProvider apiKey={GOOGLE_MAPS_API_KEY} libraries={['places', 'routes']}>
                    <div className="d-flex flex-row gap-4 p-4" style={{ height: 'calc(100vh - 80px)', overflow: 'hidden' }}>
                        <div className="col-md-6 d-flex flex-column" style={{ height: '100%', minHeight: 0 }}>
                            {/* left content */}

                            <div
                                className="flex-grow-1 overflow-auto p-3"
                                style={{
                                    minHeight: 0,
                                    paddingBottom: '120px'
                                }}
                            >
                                {/* header + location card + vehicles */}
                                <div className="text-dark mb-5">
                                    <h1 style={{ fontWeight: "bold", fontSize: "2.5rem", margin: 0, "color": "green" }}>
                                        Booked  A Ride
                                    </h1>
                                </div>

                                {/* COLLAPSIBLE LOCATION INPUT */}
                                <div className="bg-light p-4 mb-4 rounded-4 shadow-sm">
                                    <div className="border-0 shadow-sm rounded-4 overflow-hidden">
                                        <button
                                            type="button"
                                            className="w-100 border-0 bg-white text-start p-4"
                                            onClick={() => setOpenRideDetails(!openRideDetails)}
                                        >
                                            <div className="d-flex justify-content-between align-items-start">
                                                <h6 className="mb-0 fw-bold text-dark" style={{
                                                    fontSize: "1.1rem",
                                                    lineHeight: "1.3",
                                                    whiteSpace: "nowrap",
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                    maxWidth: "75%"
                                                }}>
                                                    {searchinput.start_address && searchinput.end_address
                                                        ? `${searchinput.start_address.slice(0, 25)} → ${searchinput.end_address.split(",")[0]}`
                                                        : "Pickup location → Drop location"
                                                    }
                                                </h6>
                                                <FaChevronDown
                                                    size={20}
                                                    className="text-muted ms-3"
                                                    style={{
                                                        marginTop: "4px",
                                                        transform: openRideDetails ? "rotate(180deg)" : "rotate(0deg)",
                                                        transition: "transform 0.3s ease"
                                                    }}
                                                />
                                            </div>
                                        </button>

                                        {openRideDetails && (
                                            <div className="p-4" style={{ background: "#f8f9fa", borderRadius: "0 0 12px 12px" }}>
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
                                                        background: "#000",
                                                        color: "#fff",
                                                        borderRadius: "12px",
                                                        fontWeight: 600,
                                                        fontSize: "1.1rem"
                                                    }}
                                                >
                                                    Find Route
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* VEHICLES LIST */}
                                <div className=" shadow-sm rounded-4 p-4">
                                    <h3 className="text-dark mb-4" style={{ fontSize: "1.5rem" }}>
                                        Looking For Driver Accept

                                    </h3>
                                    {initaldata?.ride ? (
                                        <div className="shadow-sm rounded-4 p-4 bg-white">
                                            <h3 className="text-dark mb-4" style={{ fontSize: "1.5rem" }}>
                                                Waiting for driver acceptance
                                            </h3>

                                            <div className="text-center py-5">
                                                <div
                                                    className="spinner-border text-warning mb-4"
                                                    role="status"
                                                    style={{ width: '3rem', height: '3rem' }}
                                                >
                                                    <span className="visually-hidden">Loading...</span>
                                                </div>

                                                <h4 className="fw-bold text-dark mb-3">Looking for a driver nearby</h4>
                                                <p className="text-muted mb-2">Your ride request has been sent successfully.</p>
                                                <p className="text-muted mb-4">Please wait while a driver accepts your booking.</p>

                                                <div className="mx-auto p-3 rounded-4" style={{ maxWidth: '500px', background: '#f8f9fa' }}>
                                                    <p className="mb-2"><strong>Status:</strong> {initaldata.ride.status_display}</p>
                                                    <p className="mb-2"><strong>Vehicle:</strong> {initaldata.ride.vehicle_type_display}</p>
                                                    <p className="mb-2"><strong>Price:</strong> ₹{initaldata.ride.total_price}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="shadow-sm rounded-4 p-4 bg-white">
                                            <h3 className="text-dark mb-4" style={{ fontSize: "1.5rem" }}>
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
                                className="bg-white shadow-lg border-top rounded-top-4 p-3"
                                style={{
                                    flexShrink: 0
                                }}
                            >
                                {/* bottom buttons */}
                                <div className="row g-2">


                                    {/* <div className="col-5">
                    <div className="dropdown">
                      <button
                        className="btn btn-outline-warning w-100 py-3 fs-6 fw-bold rounded-3 shadow-sm text-warning border-warning"
                        type="button"
                        data-bs-toggle={isTwoWheeler ? undefined : "dropdown"}
                        aria-expanded="false"
                        disabled={isTwoWheeler}
                      >
                        {isTwoWheeler ? 'Normal Only' :
                          selectedMode === 'normal' ? 'Normal' : 'Shared'}
                        {isTwoWheeler ? null : <FaCaretDown />}
                      </button>

                      {!isTwoWheeler && (
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

                      {isTwoWheeler && (
                        <small className="text-muted mt-1 d-block">
                          🚲 Shared rides not available for two-wheelers
                        </small>
                      )}
                    </div>
                  </div> */}

                                    <div className="col-12">
                                        <button className="btn btn-warning w-100 py-3 fs-6 fw-bold rounded-3 shadow-sm">
                                            {tomercount}
                                        </button>
                                    </div>
                                </div>
                            </div>

                        </div>

                        <div className="col-md-6 p-0" style={{ height: '100%', minHeight: 0 }}>
                            <div style={{ height: '100%', width: '100%', borderRadius: '20px', overflow: 'hidden' }}>
                                <Map
                                    mapId={GOOGLE_MAPS_MAP_ID || 'DEMO_MAP_ID'}
                                    center={mapCenter}
                                    zoom={13}
                                    style={{ width: '100%', height: '100%' }}
                                >
                                    {pickupCoords && <AdvancedMarker position={pickupCoords}><Pin background="#22c55e" /></AdvancedMarker>}
                                    {dropCoords && <AdvancedMarker position={dropCoords}><Pin background="#ef4444" /></AdvancedMarker>}
                                    {showRoute && pickupCoords && dropCoords && <Directions pickup={pickupCoords} drop={dropCoords} />}
                                </Map>
                            </div>
                        </div>
                    </div>
                </APIProvider>
            ) : (
                <div className="alert alert-warning d-flex align-items-center justify-content-center vh-100">
                    <div className="text-center">
                        <h4>🚨 Map Configuration Required</h4>
                        <p>Add <code>VITE_GOOGLE_MAPS_API_KEY</code> to .env</p>
                        <small>Enable "Places API (New)" & "Maps JavaScript API"</small>
                    </div>
                </div>
            )}
        </div>
    )
}

export default WaitForDriverAcceptance