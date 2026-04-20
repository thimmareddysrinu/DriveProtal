import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { logout } from '../../store/slices/User-All/LoginSlice'
import Navbar from '../../components/Navbar/Navbar'
import { APIProvider, Map, AdvancedMarker, Pin, useMap } from '@vis.gl/react-google-maps'
import LocationInput from './LocationPoint'
import { VehicleSearch } from '../../store/slices/VehicleSearch/VechicleSearch'
import logo from "../../images/main.webp"
import { FaLocationDot } from "react-icons/fa6";
import { FaTags } from "react-icons/fa6";
import '../CustomerHome/Locationpoint.css'
import Explore from './Explore'
import PlanForLater from './Pages/PlanForLater'
import Membership from './Pages/Membership'
import Positions from './Pages/Positions'







const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
const GOOGLE_MAPS_MAP_ID = import.meta.env.VITE_GOOGLE_MAPS_MAP_ID


// Directions Component
function Directions({ pickup, drop }) {
  const map = useMap()

  useEffect(() => {
    if (!map || !pickup || !drop) return

    const directionsService = new google.maps.DirectionsService()
    const renderer = new google.maps.DirectionsRenderer({
      map,
      suppressMarkers: true,
      polylineOptions: {
        strokeColor: '#000000',
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
        if (status === 'OK') renderer.setDirections(result)
      }
    )

    return () => renderer.setMap(null)
  }, [map, pickup, drop])

  return null
}

const CustomerHome = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [pickupCoords, setPickupCoords] = useState(null)
  const [dropCoords, setDropCoords] = useState(null)
  const [currentLocation, setCurrentLocation] = useState(null)
  const [showRoute, setShowRoute] = useState(false)
  const [mapReady, setMapReady] = useState(false) // ✅ Add loading state

  // ✅ Default to Hyderabad coordinates as plain object
  const [mapCenter, setMapCenter] = useState({ lat: 17.385044, lng: 78.486671 })
  
  const [searchinput, setSearchInput] = useState({
    start_address: "",
    end_address: "",
    start_lat: "",
    start_lon: "",
    end_lat: "",
    end_lon: ""
  })
  console.log(searchinput)

  // Get current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          }
          setCurrentLocation(coords)
          setMapCenter(coords)
          setMapReady(true) // ✅ Map is ready after getting location
        },
        (error) => {
          console.error('Geolocation error:', error)
          setMapReady(true) // ✅ Show map with default center even if location fails
        }
      )
    } else {
      setMapReady(true) // ✅ No geolocation support, use default
    }
  }, [])

  // Update map coordinates when search input changes
  useEffect(() => {
    if (searchinput.start_lat && searchinput.start_lon) {
      const coords = { 
        lat: Number(searchinput.start_lat), 
        lng: Number(searchinput.start_lon) 
      }
      setPickupCoords(coords)
      setMapCenter(coords)
    }
  }, [searchinput.start_lat, searchinput.start_lon])

  useEffect(() => {
    if (searchinput.end_lat && searchinput.end_lon) {
      setDropCoords({ 
        lat: Number(searchinput.end_lat), 
        lng: Number(searchinput.end_lon) 
      })
    }
  }, [searchinput.end_lat, searchinput.end_lon])

  const handleSearch = async() => {
    if (!searchinput.start_lat || !searchinput.end_lat) {
      return alert("Enter both locations from the dropdown suggestions!")
    }
    try{
      const result= await dispatch(VehicleSearch(searchinput)).unwrap()
      console.log("search Results",result)
        setShowRoute(true)
     navigate("/customer/home/vehiclewithmap",{
      state:{
        searchdata:searchinput,
        vehicles:result,
           pickupCoords: {
          lat: Number(searchinput.start_lat),
          lng: Number(searchinput.start_lon)
        },
        dropCoords: {
          lat: Number(searchinput.end_lat),
          lng: Number(searchinput.end_lon)
        }
      }
     })
    

    }catch(error){
      console.error('Search failed:', error)
      alert(error.message || 'Failed to search vehicles')

    }
  
  }

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  return (
    <>
      
         <nav className="navbar navbar-expand-lg " style={{'background':"#efefef"}}>
  <div className="container-fluid">
    <a className="navbar-brand " href="#" style={{"color":"#dfab32"}}>
     Ride
        </a>
    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
      <span className="navbar-toggler-icon"></span>
    </button>
    <div className="collapse navbar-collapse justify-items-end" id="navbarSupportedContent">
      <ul className="navbar-nav ms-auto  me-2 mb-lg-0 g-2">
       
        <li className="nav-item dropdown  me-5" style={{"color":"#565252e3"}}>
          Requset a ride
        </li>
        <li className="nav-item dropdown  me-5" style={{"color":"#565252e3"}}>
          Reserve a ride
        </li>
        <li className="nav-item dropdown  me-5" style={{"color":"#565252e3"}}>
          See all prices
        </li>
        <li className="nav-item dropdown  me-5" style={{"color":"#565252e3"}}>
          Explore Ride options
        </li>
        
      </ul>
     
    </div>
  </div>
         </nav>

      <div className="container mt-5" style={{"backgroundColor":'transparent',"height":"100%"}} >
        {GOOGLE_MAPS_API_KEY ? (
          <APIProvider apiKey={GOOGLE_MAPS_API_KEY} libraries={['places']}>
            <div className="row g-3">
              {/* LEFT PANEL */}

                <div className='col-md-6'>
                <div className=' text-dark'>

               
                  <h3 style={{"fontWeight":"bold","fontSize":"50px"}}>
                    Choose A Ride
                  </h3>
                  <p><FaTags style={{"margin":"10px","color":"#04b51c"}} />Up to 50% off your first 5 Uber rides. T&Cs apply.* *Valid within 15 days of signup.</p>
                </div>
              <div className=" bg-light text-dark p-5 " style={{ "height": "auto" ,"borderRadius":"14px" ,}}>

                
              

                <LocationInput
                  placeholder="Pickup location "
                  field="start"
                  setSearchInput={setSearchInput}
                   
                  
                />

                <LocationInput
                  placeholder="Drop location"
                  field="end"
                  setSearchInput={setSearchInput}
                   

                />

                <button onClick={handleSearch} className="btn btn-primary mt-3 w-100">
                  Find Route
                </button>
              </div>


              </div>

              {/* RIGHT PANEL */}
            

               <div className="col-md-6 p-0 br-3" style={{ height: "","borderRadius":"14px" }}>
                {/* {mapReady ? ( // ✅ Only render Map when ready
                  <Map
                    mapId={GOOGLE_MAPS_MAP_ID || "DEMO_MAP_ID"}
                    center={mapCenter}
                    zoom={13}
                    gestureHandling={'greedy'}
                    disableDefaultUI={true}
                  >
                    {currentLocation && (
                      <AdvancedMarker position={currentLocation}>
                        <Pin background={'blue'} />
                      </AdvancedMarker>
                    )}

                    {pickupCoords && (
                      <AdvancedMarker position={pickupCoords}>
                        <Pin background={'green'} />
                      </AdvancedMarker>
                    )}

                    {dropCoords && (
                      <AdvancedMarker position={dropCoords}>
                        <Pin background={'red'} />
                      </AdvancedMarker>
                    )}

                    {showRoute && pickupCoords && dropCoords && (
                      <Directions pickup={pickupCoords} drop={dropCoords} />
                    )}
                  </Map>
                ) : (
                  <div className="d-flex align-items-center justify-content-center h-100">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading map...</span>
                    </div>
                  </div>
                )} */}
            <img
  src={logo}
  alt="main-img"
  className="img-fluid rounded-4"
  style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
/></div>
              

         
            </div>
          </APIProvider>
        ) : (
          <div className="alert alert-warning">
            Add VITE_GOOGLE_MAPS_API_KEY to .env - Enable "Places API (New)"
          </div>
        )}
      </div>
      <hr/>
      <Explore/>
      <hr/>
      <PlanForLater/>
      <Membership/>
      <Positions/>


    </>
  )
}

export default CustomerHome


