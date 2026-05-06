import React, { useEffect, useState } from 'react'
import { FaStar, FaRupeeSign } from 'react-icons/fa'
import { useSelector, useDispatch } from 'react-redux'
import {
  VehicleownerProfile, UpdateVehicleownerProfile

} from '../../store/slices/Owner/Ownerprofile'

import OwnVehicles from './OwnVehicles'

function OwnerProfilePage() {
  const dispatch = useDispatch()
  const { OwnerProf, loading, error, updateLoading } = useSelector(
    (state) => state.vehicleownerprofile
  )


  const user = JSON.parse(localStorage.getItem('user'))
  const BaseUrl = 'http://127.0.0.1:8000'

  const [formData, setFormData] = useState({
    full_name: '',
    phone_number: '',
    company_name: '',
    business_license: '',
    gst_number: '',
    office_address: '',
    city: '',
    state: '',
    pincode: '',
    bank_account_holder_name: '',
    bank_account_number: '',
    bank_ifsc: '',
   
    aadhar_number: '',
    pan_number: '',
   
    aadhar_image: null,
    pan_image: null,
    profile_image: null,
    business_license_image: null,
  })


  const [previewImages, setPreviewImages] = useState({
    
    aadhar_image: null,
    pan_image: null,
    profile_image: null,
  })

  useEffect(() => {
    dispatch(VehicleownerProfile())
  }, [dispatch])

  useEffect(() => {
    if (OwnerProf) {
      setFormData({
        full_name: OwnerProf.full_name || '',
        phone_number: OwnerProf.phone_number || '',
        company_name: OwnerProf.company_name || '',
        business_license: OwnerProf.business_license || '',
        gst_number: OwnerProf.gst_number || '',
        office_address: OwnerProf.office_address || '',
        city: OwnerProf.city || '',
        state: OwnerProf.state || '',
        pincode: OwnerProf.pincode || '',
        bank_account_holder_name: OwnerProf.bank_account_holder_name || '',
        bank_account_number: OwnerProf.bank_account_number || '',
        bank_ifsc: OwnerProf.bank_ifsc || '',
        
        aadhar_number: OwnerProf.aadhar_number || '',
        pan_number: OwnerProf.pan_number || '',
       
        aadhar_image: null,
        pan_image: null,
        profile_image: null,
        business_license_image: null,
      })
    }
  }, [OwnerProf])

  const handleChange = (e) => {
    const { name, value, files } = e.target

    if (files && files[0]) {
      const file = files[0]

      setFormData((prev) => ({
        ...prev,
        [name]: file,
      }))

      setPreviewImages((prev) => ({
        ...prev,
        [name]: URL.createObjectURL(file),
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
    data.append('full_name', formData.full_name)
    // data.append('phone_number', formData.phone_number)
 
  
    data.append('bank_account_number', formData.bank_account_number)
    data.append('bank_account_holder_name', formData.bank_account_holder_name)
    
    data.append('bank_ifsc', formData.bank_ifsc)
    data.append("company_name", formData.company_name)
    data.append("business_license", formData.business_license)
    data.append("gst_number", formData.gst_number)
    data.append("office_address", formData.office_address)
    data.append("city", formData.city)
    data.append("state", formData.state)
    data.append("pincode", formData.pincode)


  
    if (formData.aadhar_image) data.append('aadhar_image', formData.aadhar_image)
    if (formData.pan_image) data.append('pan_image', formData.pan_image)
   
    if (formData.business_license_image) data.append('business_license_image', formData.business_license_image)

    try {
      await dispatch(UpdateVehicleownerProfile(data)).unwrap()
      alert('VEHICLE OWNER Profile updated successfully')
      dispatch(VehicleownerProfile())
    } catch (err) {
      alert('VEHICLE OWNER Profile update failed')
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
      <h2 style={{ fontFamily: 'Poppins, sans-serif' }}>Vehicle Owner Profile 🚗</h2>
      <p style={{ color: '#A0AEC0' }}>Welcome, {user?.phone_number || 'Driver'}</p>

      {loading && <p>Loading profile...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!loading && (
        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label>Full Name</label>
              <input
                type="text"
                name="full_name"
                className="form-control"
                value={formData.full_name}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-6 mb-3">
              <label>Phone Number</label>
              <input
                type="text"
                name="phone_number"
                className="form-control"
                value={formData.phone_number}
                readOnly
              />
            </div>

            <div className="col-md-6 mb-3">
              <label>Company Name</label>
              <input
                type="text"
                name="company_name"
                className="form-control"
                value={formData.company_name}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-6 mb-3">
              <label>Business License</label>
              <input
                type="text"
                name="business_license"
                className="form-control"
                value={formData.business_license}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-6 mb-3">
              <label>GST Number</label>
              <input
                type="text"
                name="gst_number"
                className="form-control"
                value={formData.gst_number}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-6 mb-3">
              <label>Office Address</label>
              <input
                type="text"
                name="office_address"
                className="form-control"
                value={formData.office_address}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-6 mb-3">
              <label>City</label>
              <input
                type="text"
                name="city"
                className="form-control"
                value={formData.city}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-6 mb-3">
              <label>State</label>
              <input
                type="text"
                name="state"
                className="form-control"
                value={formData.state}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-6 mb-3">
              <label>Pincode</label>
              <input
                type="text"
                name="pincode"
                className="form-control"
                value={formData.pincode}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-6 mb-3">
              <label>Bank Account Holder Name</label>
              <input
                type="text"
                name="bank_account_holder_name"
                className="form-control"
                value={formData.bank_account_holder_name}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-6 mb-3">
              <label>Bank Account Number</label>
              <input
                type="text"
                name="bank_account_number"
                className="form-control"
                value={formData.bank_account_number}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-6 mb-3">
              <label>Bank IFSC</label>
              <input
                type="text"
                name="bank_ifsc"
                className="form-control"
                value={formData.bank_ifsc}
                onChange={handleChange}
              />
            </div>

         

         

           

           
          </div>

          <div style={{ marginTop: '24px' }}>
            <h4 style={{ color: '#F6AF12', marginBottom: '16px' }}>Document Images</h4>
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
             
              {renderImageCard('Aadhar Image', 'aadhar_image', OwnerProf?.aadhar_image)}
              {renderImageCard('PAN Image', 'pan_image', OwnerProf?.pan_image)}
              {renderImageCard('Business License Image', 'business_license_image', OwnerProf?.business_license_image)}
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-warning"
            disabled={updateLoading}
            style={{ marginTop: '24px' }}
          >
            {updateLoading ? 'Updating...' : 'Update Profile'}
          </button>
        </form>
      )}

      <OwnVehicles />
    </div>
  )
}

export default OwnerProfilePage