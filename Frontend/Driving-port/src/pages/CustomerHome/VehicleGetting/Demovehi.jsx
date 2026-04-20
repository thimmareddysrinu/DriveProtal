import React from 'react'

function Demovehi() {
  return (
    <div>
   <APIProvider apiKey={GOOGLE_MAPS_API_KEY} libraries={['places', 'routes']}>
  <div className="d-flex flex-row gap-4 p-4" style={{ height: 'calc(100vh - 80px)', overflow: 'hidden' }}>
    <div className="col-md-6 d-flex flex-column" style={{ height: '100%', minHeight: 0 }}>
      {/* left content */}
       <div
    className="col-md-6 d-flex flex-column"
    style={{ height: '100%', minHeight: 0 }}
  >
    <div
      className="flex-grow-1 overflow-auto p-3"
      style={{
        minHeight: 0,
        paddingBottom: '120px'
      }}
    >
      {/* header + location card + vehicles */}
       <div className="text-dark mb-5">
                <h1 style={{ fontWeight: "bold", fontSize: "2.5rem", margin: 0 }}>
                  Choose A Ride
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
                  Rides we think you'll like

                </h3>

                {vehiclewithprice?.length > 0 ? (
                  vehiclewithprice.map((vehicle, index) => (
                    <div
                      key={index}
                      className=" mb-3 p-4  shadow-sm"
                      style={{
                        borderRadius: '18px',
                        border: selectedvehicle?.vehicle_type === vehicle.vehicle_type
                          ? '4px solid #eabd1ad4'
                          : '4px solid transparent',
                        cursor: 'pointer'
                      }}
                      onClick={() => setselectedvehicle(vehicle)}
                    >
                      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">

                        {/* Left side: icon + name */}
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

                        {/* Right side: pricing */}
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
                              backgroundColor: '#ddd'
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
                  <div className="text-center py-5 text-muted">
                    <p className="mb-0">No vehicles found</p>
                    <small>Enter locations to see available rides</small>
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
                      <div className="col-2">
                        <button className="btn btn-warning w-100 py-3 fs-6 fw-bold rounded-3 shadow-sm">
                          <RiUserSharedFill />
                        </button>
                      </div>
                      <div className="col-3">
                        <button className="btn btn-warning w-100 py-3 fs-6 fw-bold rounded-3 shadow-sm">
                          Cab
                        </button>
                      </div>
                      <div className="col-7">
                        <button className="btn btn-warning w-100 py-3 fs-6 fw-bold rounded-3 shadow-sm">
                          Request {selectedvehicle?.vehicle_name || "Ride"}
                        </button>
                      </div>
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
    </div>
  )
}

export default Demovehi