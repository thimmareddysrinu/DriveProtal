import React from 'react'
import GoRydLogo from '../../LOGOS/IconMain'

function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg position-relative " style={{'background':"#060505de","left":'0','right':"0",'top':'0'}}>
  <div className="container-fluid">
    <a className="navbar-brand " href="#" style={{"color":"#dfab32"}}>
       GoRyd <GoRydLogo size={50}/>
        </a>
    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
      <span className="navbar-toggler-icon"></span>
    </button>
    <div className="collapse navbar-collapse justify-items-end" id="navbarSupportedContent">
      <ul className="navbar-nav ms-auto  mb-2 mb-lg-0">
       
        <li className="nav-item dropdown">
          <a className="nav-link dropdown-toggle " href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false" style={{"color":"#dfab32"}}>
            Dropdown
          </a>
          <ul className="dropdown-menu">
            <li><a className="dropdown-item" href="#">Profile</a></li>
          
            <li><hr className="dropdown-divider"/></li>
            <li><a className="dropdown-item text-danger" href="#">Logout</a></li>
          </ul>
        </li>
        
      </ul>
     
    </div>
  </div>
</nav>
  )
}

export default Navbar