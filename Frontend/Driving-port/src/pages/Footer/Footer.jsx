import React from 'react'
import { FaFacebook } from "react-icons/fa";
import { FaInstagram } from "react-icons/fa6";
import { FaTwitter } from "react-icons/fa6";

import { FaLinkedin } from "react-icons/fa";

function Footer() {
  return (
    
<footer className="text-center text-lg-start bg-dark text-warning">
  
  <section className="d-flex justify-content-center justify-content-lg-between p-4 border-bottom">
   
    <div className="me-5 d-none d-lg-block">
      <span>Get connected with us on social networks:</span>
    </div>
    
    <div>
      <a href="" className="me-4 text-reset">
       <FaFacebook style={{"color":"#134ea7","fontSize":"33px"}}/>
      </a>
      <a href="" className="me-4 text-reset">
       <FaTwitter style={{"color":"#118edc","fontSize":"33px"}}/>
      </a>
     
      <a href="" className="me-4 text-reset">
        <FaInstagram style={{"color":"#9c65a5","fontSize":"33px"}}/>
      </a>
      <a href="" className="me-4 text-reset">
       <FaLinkedin style={{"color":"#134ea7","fontSize":"33px"}}/>
      </a>
     
    </div>
   
  </section>
 
  <section className="">
    <div className="container text-center text-md-start mt-5">
     
      <div className="row mt-3">
       
        <div className="col-md-3 col-lg-4 col-xl-3 mx-auto mb-4">
          
           <h6 className="text-uppercase fw-bold mb-4">
            Company
          </h6>
          <p>
            <a href="#!" className="text-reset">Angular</a>
          </p>
          <p>
            <a href="#!" className="text-reset">React</a>
          </p>
          <p>
            <a href="#!" className="text-reset">Vue</a>
          </p>
          <p>
            <a href="#!" className="text-reset">Laravel</a>
          </p>
         
        </div>
       
        <div className="col-md-2 col-lg-2 col-xl-2 mx-auto mb-4">
         
          <h6 className="text-uppercase fw-bold mb-4">
            Products
          </h6>
          <p>
            <a href="#!" className="text-reset">Angular</a>
          </p>
          <p>
            <a href="#!" className="text-reset">React</a>
          </p>
          <p>
            <a href="#!" className="text-reset">Vue</a>
          </p>
          <p>
            <a href="#!" className="text-reset">Laravel</a>
          </p>
        </div>
       
        <div className="col-md-3 col-lg-2 col-xl-2 mx-auto mb-4">
         
          <h6 className="text-uppercase fw-bold mb-4">
            Useful links
          </h6>
          <p>
            <a href="#!" className="text-reset">Pricing</a>
          </p>
          <p>
            <a href="#!" className="text-reset">Settings</a>
          </p>
          <p>
            <a href="#!" className="text-reset">Orders</a>
          </p>
          <p>
            <a href="#!" className="text-reset">Help</a>
          </p>
        </div>
       
        <div className="col-md-4 col-lg-3 col-xl-3 mx-auto mb-md-0 mb-4">
         
          <h6 className="text-uppercase fw-bold mb-4">Contact</h6>
          <p><i className="fas fa-home me-3"></i> New York, NY 10012, US</p>
          <p>
            <i className="fas fa-envelope me-3"></i>
            info@example.com
          </p>
          <p><i className="fas fa-phone me-3"></i> + 01 234 567 88</p>
          <p><i className="fas fa-print me-3"></i> + 01 234 567 89</p>
        </div>
      
      </div>
      
    </div>
  </section>
 
  <div className="text-center p-4" style={{"backgroundColor":" rgba(26, 13, 13, 0.05)"}}>
    © 2021 Copyright:
    <a className="text-reset fw-bold" href="https://mdbootstrap.com/">MDBootstrap.com</a>
  </div>
  
</footer>

  )
}

export default Footer