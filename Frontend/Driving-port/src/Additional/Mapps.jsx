import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { APIProvider, Map, AdvancedMarker, Pin, useMap } from '@vis.gl/react-google-maps'
import Navbar from '../../components/Navbar/Navbar'
import './HomePage.css'

// Get API key from environment variables
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
const GOOGLE_MAPS_MAP_ID = import.meta.env.VITE_GOOGLE_MAPS_MAP_ID

// Component to handle directions
function Directions({ pickup, drop }) {
  const map = useMap()

  useEffect(() => {
    if (!map || !pickup || !drop) return

    const directionsService = new google.maps.DirectionsService()
    const renderer = new google.maps.DirectionsRenderer({
      map,
      suppressMarkers: true, // We're using our own markers
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
        if (status === 'OK') {
          renderer.setDirections(result)
        } else {
          console.error('Directions request failed:', status)
        }
      }
    )

    return () => {
      renderer.setMap(null)
    }
  }, [map, pickup, drop])

  return null
}

function HomePage() {
  const navigate = useNavigate()
  const [currentLocation, setCurrentLocation] = useState(null)
  const [pickupLocation, setPickupLocation] = useState('')
  const [dropLocation, setDropLocation] = useState('')
  const [pickupCoords, setPickupCoords] = useState(null)
  const [dropCoords, setDropCoords] = useState(null)
  const [showRoute, setShowRoute] = useState(false)
  const [mapCenter, setMapCenter] = useState({ lat: 17.385044, lng: 78.486671 })
  const [mapZoom, setMapZoom] = useState(13)
  const [loading, setLoading] = useState(false)

  // Get user's current location on mount
  useEffect(() => {
    getCurrentLocation()
  }, [])

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      setLoading(true)
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
          setCurrentLocation(pos)
          setPickupCoords(pos)
          setMapCenter(pos)
          reverseGeocode(pos, setPickupLocation)
          setLoading(false)
        },
        (error) => {
          console.error("Error getting location:", error)
          // Default to Hyderabad
          const defaultPos = { lat: 17.385044, lng: 78.486671 }
          setCurrentLocation(defaultPos)
          setPickupCoords(defaultPos)
          setLoading(false)
          
          // Show user-friendly error
          if (error.code === error.PERMISSION_DENIED) {
            alert("Please enable location access to use current location feature")
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      )
    } else {
      alert("Geolocation is not supported by your browser")
    }
  }

  // Reverse geocoding - convert coordinates to address
  const reverseGeocode = async (coords, setter) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coords.lat},${coords.lng}&key=${GOOGLE_MAPS_API_KEY}`
      )
      const data = await response.json()
      if (data.results && data.results[0]) {
        setter(data.results[0].formatted_address)
      }
    } catch (error) {
      console.error("Geocoding error:", error)
    }
  }

  // Forward geocoding - convert address to coordinates
  const geocodeAddress = async (address) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_API_KEY}`
      )
      const data = await response.json()
      if (data.results && data.results[0]) {
        const location = data.results[0].geometry.location
        return { lat: location.lat, lng: location.lng }
      }
    } catch (error) {
      console.error("Geocoding error:", error)
      alert("Error finding location. Please try again.")
    }
    return null
  }

  const handleSearch = async () => {
    if (!pickupLocation || !dropLocation) {
      alert("Please enter both pickup and drop locations")
      return
    }

    setLoading(true)
    const coords = await geocodeAddress(dropLocation)
    
    if (coords) {
      setDropCoords(coords)
      setShowRoute(true)
      setMapZoom(12)
    }
    setLoading(false)
  }

  const handleUseCurrentLocation = () => {
    getCurrentLocation()
  }

  const handlePickupBlur = async () => {
    if (pickupLocation) {
      const coords = await geocodeAddress(pickupLocation)
      if (coords) {
        setPickupCoords(coords)
        setMapCenter(coords)
      }
    }
  }

  const handleSwapLocations = () => {
    const tempLocation = pickupLocation
    const tempCoords = pickupCoords
    
    setPickupLocation(dropLocation)
    setPickupCoords(dropCoords)
    
    setDropLocation(tempLocation)
    setDropCoords(tempCoords)
  }

  return (
    <div className="home-page">
      <Navbar />
      
      <div className="home-content">
        {/* Left Panel - Booking Form */}
        <div className="booking-panel">
          <div className="booking-card">
            <h2>Get a ride</h2>

            {/* Pickup Location */}
            <div className="location-input-group">
              <div className="location-icon pickup-icon">⬤</div>
              <input
                type="text"
                placeholder="Pickup location"
                value={pickupLocation}
                onChange={(e) => setPickupLocation(e.target.value)}
                onBlur={handlePickupBlur}
              />
              <button 
                className="current-location-btn"
                onClick={handleUseCurrentLocation}
                title="Use current location"
                disabled={loading}
              >
                {loading ? '⏳' : '📍'}
              </button>
            </div>

            {/* Swap Button */}
            <button 
              className="swap-btn"
              onClick={handleSwapLocations}
              title="Swap locations"
            >
              ⇅
            </button>

            {/* Drop Location */}
            <div className="location-input-group">
              <div className="location-icon drop-icon">⬛</div>
              <input
                type="text"
                placeholder="Drop location"
                value={dropLocation}
                onChange={(e) => setDropLocation(e.target.value)}
              />
            </div>

            {/* Pickup Time */}
            <div className="time-selector">
              <div className="time-icon">🕐</div>
              <select className="time-select">
                <option>Pickup now</option>
                <option>Schedule for later</option>
              </select>
            </div>

            {/* For Me/For Someone */}
            <div className="rider-selector">
              <div className="rider-icon">👤</div>
              <select className="rider-select">
                <option>For me</option>
                <option>For someone else</option>
              </select>
            </div>

            {/* Search Button */}
            <button 
              className="search-btn"
              onClick={handleSearch}
              disabled={loading}
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>

        {/* Right Panel - Map */}
        <div className="map-container">
          {GOOGLE_MAPS_API_KEY ? (
            <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
              <Map
                mapId={GOOGLE_MAPS_MAP_ID}
                center={mapCenter}
                zoom={mapZoom}
                gestureHandling={'greedy'}
                disableDefaultUI={false}
                mapTypeControl={false}
                fullscreenControl={false}
                streetViewControl={false}
              >
                {/* Current Location Marker (Blue) */}
                {currentLocation && (
                  <AdvancedMarker position={currentLocation}>
                    <Pin
                      background={'#4285F4'}
                      borderColor={'#1a73e8'}
                      glyphColor={'#fff'}
                    />
                  </AdvancedMarker>
                )}

                {/* Pickup Marker (Green) */}
                {pickupCoords && (
                  <AdvancedMarker position={pickupCoords}>
                    <Pin
                      background={'#34A853'}
                      borderColor={'#0F9D58'}
                      glyphColor={'#fff'}
                    />
                  </AdvancedMarker>
                )}

                {/* Drop Marker (Red) */}
                {dropCoords && (
                  <AdvancedMarker position={dropCoords}>
                    <Pin
                      background={'#EA4335'}
                      borderColor={'#C5221F'}
                      glyphColor={'#fff'}
                    />
                  </AdvancedMarker>
                )}

                {/* Directions Route */}
                {showRoute && pickupCoords && dropCoords && (
                  <Directions pickup={pickupCoords} drop={dropCoords} />
                )}
              </Map>
            </APIProvider>
          ) : (
            <div className="map-error">
              <h3>⚠️ Google Maps API Key Missing</h3>
              <p>Please add your Google Maps API key to the .env file</p>
            </div>
          )}

          {/* Destination Card */}
          {dropCoords && (
            <div className="destination-card">
              <div className="destination-info">
                <div className="destination-header">
                  To {dropLocation.split(',')[0]}
                </div>
                <div className="destination-subtext">
                  From {pickupLocation.split(',')[0]}
                </div>
              </div>
              <button 
                className="view-route-btn"
                onClick={() => navigate('/customer/book', { 
                  state: { pickup: pickupLocation, drop: dropLocation, pickupCoords, dropCoords } 
                })}
              >
                View details →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default HomePage