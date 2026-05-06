import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import GoRydLogo from '../../LOGOS/IconMain'

function Navbar() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user'))
  const role = user?.role

  const profilePath = {
    customer: '/customer/profile',
    driver: '/driver/profile',
    vehicle_owner: '/owner/profile',
    admin: '/admin/home',
  }[role] || '/login'

  const handleLogout = () => {
    localStorage.removeItem('user')
    navigate('/login')
  }

  return (
    <nav className="navbar navbar-expand-lg position-relative" style={{ background: "#060505de", left: '0', right: "0", top: '0' }}>
      <div className="container-fluid">
        <Link className="navbar-brand" to="/" style={{ color: "#dfab32", textDecoration: 'none' }}>
          GoRyd <GoRydLogo size={50} />
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse justify-items-end" id="navbarSupportedContent">
          <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
            <li className="nav-item dropdown">
              <a
                className="nav-link dropdown-toggle"
                href="#"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                style={{ color: "#dfab32" }}
              >
                {user?.phone_number || 'Menu'}
              </a>

              <ul className="dropdown-menu">
                <li>
                  <Link className="dropdown-item" to={profilePath}>
                    Profile
                  </Link>
                </li>
                <li><hr className="dropdown-divider" /></li>
                <li>
                  <button className="dropdown-item text-danger" onClick={handleLogout}>
                    Logout
                  </button>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  )
}

export default Navbar