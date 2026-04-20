import React from 'react'
import Navbar from '../../components/Navbar/Navbar'


import { APIProvider, Map, AdvancedMarker, Pin, useMap } from '@vis.gl/react-google-maps'

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
const GOOGLE_MAPS_MAP_ID = import.meta.env.VITE_GOOGLE_MAPS_MAP_ID







function HomePage() {
  return (
    <>
    <div>
      <Navbar/>
    </div>
    <div>
       <div className="register-page">

      <div className="container-fluid " style={{"marginTop":"4px"}}>
        <div className="row vh-100">

          {/* LEFT SIDE */}
          <div className="col-md-7 d-flex flex-column justify-content-center align-items-center left-side" style={{"background":"#191816e2", }}>

          
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

          {/* RIGHT SIDE */}
          <div className="col-md-5 d-flex justify-content-center align-items-center">
            
            <div className="card bg-dark register-card p-4">
              <h2 className="fw-bold text-white">Create Account</h2>
              <p className="text-muted">Start your journey with us today</p>

              {/* <select className="form-control mb-5 "  style={{'height':'50px',"background":'#a4959500',"color":'#a49465fb'}}
                >
                <option>👤 Customer</option>
                <option>🚗 Driver</option>
                <option>🚗 vehicle owner</option>
              </select> */}
             

              <input
                 type="tel"
                  name="phone_number"
                  placeholder="10-digit mobile number"
                  maxLength={10}
                 
                className="form-control role-select mb-5 "
                
                style={{'height':'50px',"background":'#0000',"color":'#d2ae0dd5'}}
                

              />
               {/* Validation Error */}
          

              <button  className="btn btn-warning w-100 fw-bold"style={{'height':'50px'}}>
                Send OTP & Register
              </button>

              <p className="text-center mt-3 text-secondary">
                Already have an account? <span className="text-warning">Login here</span>
              </p>
            </div>

          </div>

        </div>
      </div>
      

    </div>
    </div>
    </>
  )
}

export default HomePage
