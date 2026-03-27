import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { GoogleMap, LoadScript, Marker, DirectionsRenderer } from '@react-google-maps/api'
import Navbar from '../../components/Navbar/Navbar'
import './HomePage.css'

const GOOGLE_MAPS_API_KEY = 'YOUR_GOOGLE_MAPS_API_KEY' // Get from Google Cloud Console

function HomePage() {
  const navigate = useNavigate()
  const [currentLocation, setCurrentLocation] = useState(null)
  const [pickupLocation, setPickupLocation] = useState('')
  const [dropLocation, setDropLocation] = useState('')
  const [directions, setDirections] = useState(null)
  const [map, setMap] = useState(null)
  const [pickupCoords, setPickupCoords] = useState(null)
  const [dropCoords, setDropCoords] = useState(null)

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
          setCurrentLocation(pos)
          setPickupCoords(pos)
          // Reverse geocode to get address
          reverseGeocode(pos, setPickupLocation)
        },
        (error) => {
          console.error("Error getting location:", error)
          // Default to Hyderabad
          const defaultPos = { lat: 17.385044, lng: 78.486671 }
          setCurrentLocation(defaultPos)
          setPickupCoords(defaultPos)
        }
      )
    }
  }, [])

  // Reverse geocoding to get address from coordinates
  const reverseGeocode = async (coords, setter) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coords.lat},${coords.lng}&key=${GOOGLE_MAPS_API_KEY}`
      )
      const data = await response.json()
      if (data.results[0]) {
        setter(data.results[0].formatted_address)
      }
    } catch (error) {
      console.error("Geocoding error:", error)
    }
  }

  // Forward geocoding to get coordinates from address
  const geocodeAddress = async (address, setter) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_API_KEY}`
      )
      const data = await response.json()
      if (data.results[0]) {
        const location = data.results[0].geometry.location
        setter({ lat: location.lat, lng: location.lng })
        return { lat: location.lat, lng: location.lng }
      }
    } catch (error) {
      console.error("Geocoding error:", error)
    }
  }

  // Calculate route
  const calculateRoute = async () => {
    if (!pickupCoords || !dropCoords) {
      alert("Please enter both pickup and drop locations")
      return
    }

    const directionsService = new google.maps.DirectionsService()
    const results = await directionsService.route({
      origin: pickupCoords,
      destination: dropCoords,
      travelMode: google.maps.TravelMode.DRIVING,
    })
    
    setDirections(results)
  }

  const handleSearch = async () => {
    if (dropLocation) {
      const coords = await geocodeAddress(dropLocation, setDropCoords)
      if (coords) {
        calculateRoute()
      }
    }
  }

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
          setCurrentLocation(pos)
          setPickupCoords(pos)
          reverseGeocode(pos, setPickupLocation)
        },
        (error) => {
          alert("Unable to get your location. Please enable location services.")
        }
      )
    }
  }

  const mapContainerStyle = {
    width: '100%',
    height: '100%'
  }

  const defaultCenter = currentLocation || { lat: 17.385044, lng: 78.486671 }

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
              <div className="location-icon">⬤</div>
              <input
                type="text"
                placeholder="Pickup location"
                value={pickupLocation}
                onChange={(e) => setPickupLocation(e.target.value)}
                onBlur={() => pickupLocation && geocodeAddress(pickupLocation, setPickupCoords)}
              />
              <button 
                className="current-location-btn"
                onClick={handleUseCurrentLocation}
                title="Use current location"
              >
                📍
              </button>
            </div>

            {/* Drop Location */}
            <div className="location-input-group">
              <div className="location-icon">⬛</div>
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
            >
              Search
            </button>
          </div>
        </div>

        {/* Right Panel - Map */}
        <div className="map-container">
          <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={defaultCenter}
              zoom={13}
              onLoad={map => setMap(map)}
            >
              {/* Current Location Marker */}
              {currentLocation && (
                <Marker
                  position={currentLocation}
                  icon={{
                    url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
                  }}
                  title="Your location"
                />
              )}

              {/* Pickup Marker */}
              {pickupCoords && (
                <Marker
                  position={pickupCoords}
                  icon={{
                    url: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'
                  }}
                  title="Pickup"
                />
              )}

              {/* Drop Marker */}
              {dropCoords && (
                <Marker
                  position={dropCoords}
                  icon={{
                    url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
                  }}
                  title="Drop"
                />
              )}

              {/* Route */}
              {directions && (
                <DirectionsRenderer
                  directions={directions}
                  options={{
                    polylineOptions: {
                      strokeColor: '#000000',
                      strokeWeight: 4
                    }
                  }}
                />
              )}
            </GoogleMap>
          </LoadScript>

          {/* Destination Card */}
          {dropCoords && (
            <div className="destination-card">
              <div className="destination-header">
                To {dropLocation.split(',')[0]}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default HomePage

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix marker icons
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
})

// In your component:
<MapContainer
  center={[currentLocation.lat, currentLocation.lng]}
  zoom={13}
  style={{ height: '100%', width: '100%' }}
>
  <TileLayer
    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  />
  <Marker position={[currentLocation.lat, currentLocation.lng]}>
    <Popup>Your location</Popup>
  </Marker>
</MapContainer>