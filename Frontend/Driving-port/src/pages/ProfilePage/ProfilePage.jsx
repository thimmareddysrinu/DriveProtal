import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { FaUser, FaPhone, FaEdit, FaSave } from 'react-icons/fa'
import toast from 'react-hot-toast'


const ProfilePage = () => {
  const dispatch = useDispatch()
  const { user } = useSelector(state => state.auth)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '' })

 

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-card glass">
          <div className="profile-avatar">
            <div className="avatar-circle">{user?.name?.[0]?.toUpperCase() || '?'}</div>
            <h2>{user?.name}</h2>
            <span className="user-role-badge">{user?.role || 'rider'}</span>
          </div>

          <div className="profile-info">
            <div className="info-field">
              <label><FaUser /> Full Name</label>
              {editing
                ? <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                : <span>{user?.name}</span>}
            </div>
            <div className="info-field">
              <label><FaPhone /> Mobile</label>
              <span>{user?.phone}</span>
            </div>
            <div className="info-field">
              <label>📧 Email</label>
              {editing
                ? <input value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                : <span>{user?.email || 'Not set'}</span>}
            </div>
          </div>

          <div className="profile-actions">
            {editing ? (
              <>
                <button className="btn-primary-custom" onClick={handleSave}><FaSave /> Save</button>
                <button className="btn-cancel" onClick={() => setEditing(false)}>Cancel</button>
              </>
            ) : (
              <button className="btn-primary-custom" onClick={() => setEditing(true)}><FaEdit /> Edit Profile</button>
            )}
          </div>
        </div>

        <div className="profile-stats glass">
          <div className="stat-item"><div className="stat-num">0</div><div className="stat-label">Total Rides</div></div>
          <div className="stat-item"><div className="stat-num">⭐ 5.0</div><div className="stat-label">Rating</div></div>
          <div className="stat-item"><div className="stat-num">₹0</div><div className="stat-label">Total Spent</div></div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
