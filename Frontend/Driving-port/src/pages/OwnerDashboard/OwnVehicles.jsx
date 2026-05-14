import React, { useEffect, useState } from 'react'
import { FaStar } from 'react-icons/fa'
import { useSelector, useDispatch } from 'react-redux'
import {
  CreateOwnerVehicle, Ownervehicle, UpdateOwnerVehicle
} from '../../store/slices/Owner/OwnerVehicle'

function OwnVehicles() {
  const dispatch = useDispatch()
  const { OwnerVeh, loading, error, updateLoading } = useSelector(
    (state) => state.vehicleownervehicle
  )

  const BaseUrl = 'http://127.0.0.1:8000'

  const [formData, setFormData] = useState({
    vehicle: 'bike',
    brand: '',
    vehiclemodel: '',
    year: '',
    colour: '',
    owner_name:"",
    registration_number: '',
    seat_capacity: 1,
   transmission_type: 'manual',   // ✅ was ''
  is_active: 'available', 
  fuel_type:'petrol',
    has_ac: false,
    has_gps: false,
    has_music_system: false,
    has_bluetooth: false,
    sharing_price: '',
    extra_km_charge: '',
    ride_type: 'notmention',
    
    is_verified: false,
    rc_book_image: null,
    insurance_image: null,
    insurance_expiary: null,
    pollution_image: null,
    pollution_expiary: null,
    vehicle_front: null,
    vehicle_right: null,
    vehicle_left: null,
    vehicle_back: null,
    vehicle_seats_front: null,
    vehicle_trumpat: null,
    vehicle_Seats_back: null,
    rental_price_per_hour: 0,
    rental_price_per_day: 0,
    security_depoist: 0,
    min_rental_hours: 0,
    max_rental_days: 0,
    km_limit_per_day: 0,



  })

  const [previewImages, setPreviewImages] = useState({
    rc_book_image: null,
    insurance_image: null,
    insurance_expiary: null,
    pollution_image: null,
    pollution_expiary: null,
    vehicle_front: null,
    vehicle_right: null,
    Vehicle_left: null,
    vehicle_back: null,
    vehicle_seats_front: null,
    vehicle_trumpat: null,
    vehicle_Seats_back: null,
  })

  useEffect(() => {
    dispatch(Ownervehicle())
  }, [dispatch])

// Replace these two lines:
const hasVehicle = Array.isArray(OwnerVeh) ? OwnerVeh.length > 0 : !!OwnerVeh?.id
const currentVehicleData = Array.isArray(OwnerVeh) ? OwnerVeh[0] : OwnerVeh || null

useEffect(() => {
  if (Array.isArray(OwnerVeh) && OwnerVeh.length > 0) {
    const vehicle = OwnerVeh[0]

    setFormData((prev) => ({
      ...prev,
      vehicle: vehicle.vehicle ?? 'bike',
      brand: vehicle.brand ?? '',
      owner_name: vehicle.owner_name ?? '',
      vehiclemodel: vehicle.vehiclemodel ?? '',
      year: vehicle.year ?? '',
      colour: vehicle.colour ?? '',
      registration_number: vehicle.registration_number ?? '',
      seat_capacity: vehicle.seat_capacity ?? 1,
      fuel_type: vehicle.fuel_type ?? 'petrol',
      transmission_type: vehicle.transmission_type ?? 'manual',
      has_ac: vehicle.has_ac ?? false,
      has_gps: vehicle.has_gps ?? false,
      has_music_system: vehicle.has_music_system ?? false,
      has_bluetooth: vehicle.has_bluetooth ?? false,
      sharing_price: vehicle.sharing_price ?? '',
      extra_km_charge: vehicle.extra_km_charge ?? '',
      ride_type: vehicle.ride_type ?? 'notmention',
      is_active: vehicle.is_active ?? 'available',
      is_verified: vehicle.is_verified ?? false,
      rental_price_per_hour: vehicle.rental_price_per_hour ?? 0,
      rental_price_per_day: vehicle.rental_price_per_day ?? 0,
      security_depoist: vehicle.security_depoist ?? 0,
      min_rental_hours: vehicle.min_rental_hours ?? 0,
      max_rental_days: vehicle.max_rental_days ?? 0,
      km_limit_per_day: vehicle.km_limit_per_day ?? 0,
    }))
  }
}, [OwnerVeh])

  const handleChange = (e) => {
    const { name, value, files, type, checked } = e.target

    if (type === 'file' && files && files[0]) {
      const file = files[0]
      setFormData((prev) => ({
        ...prev,
        [name]: file,
      }))
      setPreviewImages((prev) => ({
        ...prev,
        [name]: URL.createObjectURL(file),
      }))
    } else if (type === 'checkbox') {
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }))
    }
  }

const handleSubmit = async (e) => {
  e.preventDefault()

  const data = new FormData()
  data.append('vehicle', formData.vehicle)
  data.append('brand', formData.brand)
  data.append('owner_name', formData.owner_name)
  data.append('vehiclemodel', formData.vehiclemodel)
  data.append('year', formData.year)
  data.append('colour', formData.colour)
  data.append('registration_number', formData.registration_number)
  data.append('seat_capacity', formData.seat_capacity)
  data.append('fuel_type', formData.fuel_type)
  data.append('transmission_type', formData.transmission_type)
  data.append('has_ac', formData.has_ac)
  data.append('has_gps', formData.has_gps)
  data.append('has_music_system', formData.has_music_system)
  data.append('has_bluetooth', formData.has_bluetooth)
  data.append('ride_type', formData.ride_type)
  data.append('is_active', formData.is_active)
  data.append('is_verified', formData.is_verified)
  data.append('rental_price_per_hour', formData.rental_price_per_hour)
  data.append('rental_price_per_day', formData.rental_price_per_day)
  data.append('security_depoist', formData.security_depoist)
  data.append('min_rental_hours', formData.min_rental_hours)
  data.append('max_rental_days', formData.max_rental_days)
  data.append('km_limit_per_day', formData.km_limit_per_day)

  if (formData.sharing_price !== '') data.append('sharing_price', formData.sharing_price)
  if (formData.extra_km_charge !== '') data.append('extra_km_charge', formData.extra_km_charge)

  // ✅ FIXED: != null instead of truthy check
  if (formData.rc_book_image != null) data.append('rc_book_image', formData.rc_book_image)
  if (formData.insurance_image != null) data.append('insurance_image', formData.insurance_image)
  if (formData.insurance_expiary != null) data.append('insurance_expiary', formData.insurance_expiary)
  if (formData.pollution_image != null) data.append('pollution_image', formData.pollution_image)
  if (formData.pollution_expiary != null) data.append('pollution_expiary', formData.pollution_expiary)
  if (formData.vehicle_front != null) data.append('vehicle_front', formData.vehicle_front)
  if (formData.vehicle_right != null) data.append('vehicle_right', formData.vehicle_right)
  if (formData.vehicle_left != null) data.append('vehicle_left', formData.vehicle_left)
  if (formData.vehicle_back != null) data.append('vehicle_back', formData.vehicle_back)
  if (formData.vehicle_seats_front != null) data.append('vehicle_seats_front', formData.vehicle_seats_front)
  if (formData.vehicle_trumpat != null) data.append('vehicle_trumpat', formData.vehicle_trumpat)
  if (formData.vehicle_Seats_back != null) data.append('vehicle_Seats_back', formData.vehicle_Seats_back)

  try {
    if (hasVehicle && currentVehicleData?.id) {
      await dispatch(UpdateOwnerVehicle({
        id: currentVehicleData.id,
        formData: data
      })).unwrap()
      alert('Vehicle updated successfully')
    } else {
      await dispatch(CreateOwnerVehicle(data)).unwrap()
      alert('Vehicle created successfully')
    }
    dispatch(Ownervehicle())
  } catch (err) {
    console.error('Full error:', err)  // ✅ Better debugging
    alert(err?.error || err?.message || 'Vehicle operation failed')
  }
}

  const renderImageCard = (label, fieldName, existingImage) => (
    <div
      style={{
        width: '240px',
        padding: '16px',
        borderRadius: '14px',
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <h6 style={{ marginBottom: '12px', color: '#F6AF12' }}>{label}</h6>

      {previewImages[fieldName] ? (
        <img
          src={previewImages[fieldName]}
          alt={label}
          style={{
            width: '100%',
            height: '180px',
            objectFit: 'cover',
            borderRadius: '10px',
            marginBottom: '12px',
          }}
        />
      ) : existingImage ? (
        <img
          src={`${BaseUrl}${existingImage}`}
          alt={label}
          style={{
            width: '100%',
            height: '180px',
            objectFit: 'cover',
            borderRadius: '10px',
            marginBottom: '12px',
          }}
        />
      ) : (
        <div
          style={{
            width: '100%',
            height: '180px',
            borderRadius: '10px',
            marginBottom: '12px',
            border: '2px dashed rgba(255,255,255,0.18)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#A0AEC0',
          }}
        >
          No image
        </div>
      )}

      <input
        type="file"
        name={fieldName}
        accept="image/*"
        className="form-control"
        onChange={handleChange}
      />
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#0F0F1A', color: '#fff', padding: '24px' }}>
      <h2 style={{ fontFamily: 'Poppins, sans-serif' }}>Vehicle Details 🚗</h2>
      <p style={{ color: '#A0AEC0' }}>Manage your vehicle information and documents.</p>

      {loading && <p>Loading vehicle data...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!loading && currentVehicleData && (
        <div
          className="mb-4 p-3 rounded"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <h5 style={{ color: '#F6AF12' }}>Vehicle Statistics</h5>
          <div className="d-flex gap-4 flex-wrap">
            <div><span style={{ color: '#A0AEC0' }}>Current KM:</span> {currentVehicleData.current_km} km</div>
            <div><span style={{ color: '#A0AEC0' }}>Total Distance:</span> {currentVehicleData.total_distance} km</div>
            <div><span style={{ color: '#A0AEC0' }}>Total Rentals:</span> {currentVehicleData.total_rentals}</div>
            <div><span style={{ color: '#A0AEC0' }}>Rating:</span> <FaStar color="#F6AF12" /> {currentVehicleData.rating}</div>
            <div>
              <span style={{ color: '#A0AEC0' }}>Verification:</span>{' '}
              {currentVehicleData.is_verified ? (
                <span className="text-success">Verified</span>
              ) : (
                <span className="text-warning">Pending</span>
              )}
            </div>
          </div>
        </div>
      )}

      {!loading && (
        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label>Vehicle Type</label>
              <select
                name="vehicle"
                className="form-control"
                value={formData.vehicle}
                onChange={handleChange}
                style={{"color":"black"}}


                
              >
                <option cl value="bike">Bike</option>
                <option value="scooty">Scooty</option>
                <option value="sedan">Sedan</option>
                <option value="mini">Mini Car</option>
                 <option value="luxury">Luxury Car</option>
                <option value="hatchback">Hatchback</option>
                <option value="suv">Suv Car</option>
               
              </select>
            </div>

            <div className="col-md-6 mb-3">
              <label>Brand</label>
              <input
                type="text"
                name="brand"
                className="form-control"
                value={formData.brand}
                onChange={handleChange}
              />
            </div>
             <div className="col-md-6 mb-3">
              <label>Owner Nmae</label>
              <input
                type="text"
                name="owner_name"
                className="form-control"
                value={formData.owner_name}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-6 mb-3">
              <label>Vehicle Model</label>
              <input
                type="text"
                name="vehiclemodel"
                className="form-control"
                value={formData.vehiclemodel}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-6 mb-3">
              <label>Year</label>
              <input
                type="text"
                name="year"
                className="form-control"
                value={formData.year}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-6 mb-3">
              <label>Colour</label>
              <input
                type="text"
                name="colour"
                className="form-control"
                value={formData.colour}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-6 mb-3">
              <label>Registration Number</label>
              <input
                type="text"
                name="registration_number"
                className="form-control"
                value={formData.registration_number}
                onChange={handleChange}
              />
            </div>
            
          
             
              <div className="col-md-6 mb-3">
              <label>Transmission Type</label>
              <select
                name="transmission_type"
                className="form-control"
                value={formData.transmission_type}
                onChange={handleChange}
              >
                <option value="manual">Manual</option>
                <option value="automatic">Automatic</option>
                
              </select>
            </div>
             <div className="col-md-6 mb-3">
              <label>Fuel Type</label>
              <select
                name="fuel_type"
                className="form-control"
                value={formData.fuel_type}
                onChange={handleChange}
              >
                <option value="petrol">Petrol</option>
                <option value="diesel">Diesel</option>
                <option value="cng">CNG</option>
                <option value="electric">Electric</option>
                
              </select>
            </div>

            <div className="col-md-6 mb-3">
              <label>Seat Capacity</label>
              <input
                type="number"
                name="seat_capacity"
                className="form-control"
                value={formData.seat_capacity}
                onChange={handleChange}
                min="1"
              />
            </div>

            <div className="col-md-6 mb-3">
              <label>Sharing Price (₹)</label>
              <input
                type="number"
                
                name="sharing_price"
                className="form-control"
                value={formData.sharing_price}
                onChange={handleChange}
              />
            </div>

          
              <div className="col-md-6 mb-3">
              <label>Security Depoist (₹)</label>
              <input
                type="number"
                step="1"
                name="security_depoist"
                className="form-control"
                value={formData.security_depoist}
                onChange={handleChange}
              />
            </div>
               <div className="col-md-6 mb-3">
              <label>Rental Price per Hour (₹)</label>
              <input
                type="number"
               
                name="rental_price_per_hour"
                className="form-control"
                value={formData.rental_price_per_hour}
                onChange={handleChange}
              />
            </div>
                <div className="col-md-6 mb-3">
              <label>Rental Price per Day </label>
              <input
                type="number"
              
                name="rental_price_per_day"
                className="form-control"
                value={formData.rental_price_per_day}
                onChange={handleChange}
              />
            </div>
              <div className="col-md-6 mb-3">
              <label>Min Rental Hours</label>
              <input
                type="number"
              
                name="min_rental_hours"
                className="form-control"
                value={formData.min_rental_hours}
                onChange={handleChange}
              />
            </div>
               <div className="col-md-6 mb-3">
              <label>Max Rental Days</label>
              <input
                type="number"
               
                name="max_rental_days"
                className="form-control"
                value={formData.max_rental_days}
                onChange={handleChange}
              />
            </div>

           

            <div className="col-md-6 mb-3">
              <label>Is Active</label>
             <select name="is_active" className="form-control" value={formData.is_active} onChange={handleChange}>
  <option value="available">Available</option>
  <option value="rented">Currently Rented</option>
  <option value="maintenance">Under Maintenance</option>
  <option value="unavaliable">Unavaliable</option>
</select>
            </div>
            

            <div className="col-md-6 mb-3 d-flex align-items-end pb-2">
              <div className="form-check">
                <input
                  type="checkbox"
                  name="has_ac"
                  className="form-check-input"
                  id="has_ac"
                  checked={formData.has_ac}
                  onChange={handleChange}
                />
                <label className="form-check-label" htmlFor="has_ac">
                  Has AC
                </label>
              </div>
            </div>
              <div className="col-md-6 mb-3 d-flex align-items-end pb-2">
              <div className="form-check">
                <input
                  type="checkbox"
                  name="has_gps"
                  className="form-check-input"
                  id="has_gps"
                  checked={formData.has_gps}
                  onChange={handleChange}
                />
                <label className="form-check-label" htmlFor="has_gps">
                  Has GPS
                </label>
              </div>
            </div>
              <div className="col-md-6 mb-3 d-flex align-items-end pb-2">
              <div className="form-check">
                <input
                  type="checkbox"
                  name="has_music_system"
                  className="form-check-input"
                  id="has_music_system"
                  checked={formData.has_music_system}
                  onChange={handleChange}
                />
                <label className="form-check-label" htmlFor="has_music_system">
                  Has Music System
                </label>
              </div>
            </div>
              <div className="col-md-6 mb-3 d-flex align-items-end pb-2">
              <div className="form-check">
                <input
                  type="checkbox"
                  name="has_bluetooth"
                  className="form-check-input"
                  id="has_bluetooth"
                  checked={formData.has_bluetooth}
                  onChange={handleChange}
                />
                <label className="form-check-label" htmlFor="has_bluetooth">
                  Has Bluetooth
                </label>
              </div>
            </div>
          </div>

         <div style={{ marginTop: '24px' }}>
  <h4 style={{ color: '#F6AF12', marginBottom: '16px' }}>Vehicle Images & Documents</h4>
  <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
    {renderImageCard('Vehicle Right', 'vehicle_right', currentVehicleData?.vehicle_right)}
    {renderImageCard('Vehicle Left', 'vehicle_left', currentVehicleData?.vehicle_left)}
    {renderImageCard('Vehicle Back', 'vehicle_back', currentVehicleData?.vehicle_back)}
    {renderImageCard('Vehicle Seats Front', 'vehicle_seats_front', currentVehicleData?.vehicle_seats_front)}
    {renderImageCard('Vehicle Trumpt', 'vehicle_trumpat', currentVehicleData?.vehicle_trumpat)}
    {renderImageCard('Vehicle Seats Back', 'vehicle_Seats_back', currentVehicleData?.vehicle_Seats_back)}
    {renderImageCard('Vehicle Front', 'vehicle_front', currentVehicleData?.vehicle_front)}
    {renderImageCard('RC Book', 'rc_book_image', currentVehicleData?.rc_book_image)}
    {renderImageCard('Insurance Image', 'insurance_image', currentVehicleData?.insurance_image)}
    {renderImageCard('Insurance Expiry', 'insurance_expiary', currentVehicleData?.insurance_expiary)}
    {renderImageCard('Pollution Image', 'pollution_image', currentVehicleData?.pollution_image)}
    {renderImageCard('Pollution Expiry', 'pollution_expiary', currentVehicleData?.pollution_expiary)}
  </div>
</div>

          <button
            type="submit"
            className="btn btn-warning"
            disabled={updateLoading}
            style={{ marginTop: '24px' }}
          >
            {updateLoading
              ? hasVehicle
                ? 'Updating...'
                : 'Creating...'
              : hasVehicle
                ? 'Update Vehicle'
                : 'Create Vehicle'}
          </button>
        </form>
      )}
    </div>
  )
}

export default OwnVehicles