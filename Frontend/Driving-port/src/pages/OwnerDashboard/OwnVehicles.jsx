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
    registration_number: '',
    seat_capacity: 1,
    fuel_type: '',
    transmission_type: '',
    has_ac: false,
    has_gps: false,
    has_music_system: false,
    has_bluetooth: false,
    sharing_price: '',
    extra_km_charge: '',
    ride_type: 'notmention',
    is_active: 'notavaliable',
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
    vehicle_left: null,
    vehicle_back: null,
    vehicle_seats_front: null,
    vehicle_trumpat: null,
    vehicle_Seats_back: null,
  })

  useEffect(() => {
    dispatch(Ownervehicle())
  }, [dispatch])

  const hasVehicle = !!OwnerVeh?.id
  const currentVehicleData = hasVehicle ? OwnerVeh : null

  useEffect(() => {
    if (OwnerVeh?.id) {
      setFormData({
        vehicle: OwnerVeh.vehicle || "",
        brand: OwnerVeh.brand || "",
        vehiclemodel: OwnerVeh.vehiclemodel || "",
        year: OwnerVeh.year || "",
        colour: OwnerVeh.colour || "",
        registration_number: OwnerVeh.registration_number || "",
        seat_capacity: OwnerVeh.seat_capacity || "",
        fuel_type: OwnerVeh.fuel_type || "",
        transmission_type: OwnerVeh.transmission_type || "",
        has_ac: OwnerVeh.has_ac || false,
        has_gps: OwnerVeh.has_gps || false,
        has_music_system: OwnerVeh.has_music_system || false,
        has_bluetooth: OwnerVeh.has_bluetooth || false,
        sharing_price: OwnerVeh.sharing_price || "",
        extra_km_charge: OwnerVeh.extra_km_charge || "",
        ride_type: OwnerVeh.ride_type || 'notmention',
        is_active: OwnerVeh.is_active || 'notavaliable',
        is_verified: OwnerVeh.is_verified || false,
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
        rental_price_per_hour: OwnerVeh.rental_price_per_hour || 0,
        rental_price_per_day: OwnerVeh.rental_price_per_day || 0,
        security_depoist: OwnerVeh.security_depoist || 0,
        min_rental_hours: OwnerVeh.min_rental_hours || 0,
        max_rental_days: OwnerVeh.max_rental_days || 0,
        km_limit_per_day: OwnerVeh.km_limit_per_day || 0,
      })
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

  if (formData.rc_book_image) data.append('rc_book_image', formData.rc_book_image)
  if (formData.insurance_image) data.append('insurance_image', formData.insurance_image)
  if (formData.insurance_expiary) data.append('insurance_expiary', formData.insurance_expiary)
  if (formData.pollution_image) data.append('pollution_image', formData.pollution_image)
  if (formData.pollution_expiary) data.append('pollution_expiary', formData.pollution_expiary)
  if (formData.vehicle_front) data.append('vehicle_front', formData.vehicle_front)
  if (formData.vehicle_right) data.append('vehicle_right', formData.vehicle_right)
  if (formData.vehicle_left) data.append('vehicle_left', formData.vehicle_left)
  if (formData.vehicle_back) data.append('vehicle_back', formData.vehicle_back)
  if (formData.vehicle_seats_front) data.append('vehicle_seats_front', formData.vehicle_seats_front)
  if (formData.vehicle_trumpat) data.append('vehicle_trumpat', formData.vehicle_trumpat)
  if (formData.vehicle_Seats_back) data.append('vehicle_Seats_back', formData.vehicle_Seats_back)

  try {
    if (hasVehicle) {
      await dispatch(UpdateOwnerVehicle(data)).unwrap()
      alert('Vehicle updated successfully')
    } else {
      await dispatch(CreateOwnerVehicle(data)).unwrap()
      alert('Vehicle created successfully')
    }

    dispatch(Ownervehicle())
  } catch (err) {
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
              >
                <option value="bike">Bike</option>
                <option value="scooty">Scooty</option>
                <option value="car">Car</option>
                <option value="loory">Lorry</option>
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
                step="0.01"
                name="sharing_price"
                className="form-control"
                value={formData.sharing_price}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-6 mb-3">
              <label>Extra KM Charge (₹)</label>
              <input
                type="number"
                step="0.01"
                name="extra_km_charge"
                className="form-control"
                value={formData.extra_km_charge}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-6 mb-3">
              <label>Ride Type</label>
              <select
                name="ride_type"
                className="form-control"
                value={formData.ride_type}
                onChange={handleChange}
              >
                <option value="sharing">Sharing</option>
                <option value="fully">Fully</option>
                <option value="notmention">Not Mentioned</option>
              </select>
            </div>

            <div className="col-md-6 mb-3">
              <label>Status</label>
              <select
                name="is_active"
                className="form-control"
                value={formData.is_active}
                onChange={handleChange}
              >
                <option value="avaliable">Available</option>
                <option value="notavaliable">Not Available</option>
                <option value="running">Running</option>
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
          </div>

         <div style={{ marginTop: '24px' }}>
  <h4 style={{ color: '#F6AF12', marginBottom: '16px' }}>Vehicle Images & Documents</h4>
  <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
    {renderImageCard('Vehicle Right', 'vehicle_right', currentVehicleData?.vehicle_right)}
    {renderImageCard('Vehicle Left', 'vehicle_left', currentVehicleData?.vehicle_left)}
    {renderImageCard('Vehicle Back', 'vehicle_back', currentVehicleData?.vehicle_back)}
    {renderImageCard('Vehicle Seats Front', 'vehicle_seats_front', currentVehicleData?.vehicle_seats_front)}
    {renderImageCard('Vehicle Trumpt', 'vehicle_trumpat', currentVehicleData?.vehicle_trumpat)}
    {renderImageCard('Vehicle Seats Back', 'vehicle_seats_back', currentVehicleData?.vehicle_seats_back)}
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