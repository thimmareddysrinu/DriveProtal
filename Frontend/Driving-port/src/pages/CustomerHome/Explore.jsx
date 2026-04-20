import React from 'react'
import GoRydLogo from '../../LOGOS/IconMain'
import bike from "../../images/bike.png"
import car from "../../images/car.png"
import goods from "../../images/goods.png"
import intercity from "../../images/intercity.png"
import rental from "../../images/rental.png"
import reserve from "../../images/reserve.png"
import './explore.css'

function Explore() {
  const carddata = [
    { 'title': 'ride', 'icon': car, "details": "Go any where with GoRyd. Request A ride" },
    { 'title': 'Reserve', 'icon': reserve, "details": "Go any where with GoRyd. Request A ride" },
    { 'title': 'Intercity', 'icon': intercity, "details": "Go any where with GoRyd. Request A ride" },
    { 'title': 'Goods', 'icon': goods, "details": "Go any where with GoRyd. Request A ride" },
    { 'title': 'Rentals', 'icon': rental, "details": "Go any where with GoRyd. Request A ride" },
    { 'title': 'Bike', 'icon': bike, "details": "Get affordable Motorbike in GoRyd" },
  ]

  return (
    <>
      <h3 className="f-5  mb-4 text-dark text-center">Explore what you can do with GoRyd</h3>
      
      {/* NO container here - just the row */}
      <div className="row row-cols-3 row-cols-md-2 row-cols-lg-3 m-4  g-4">
        {carddata.map((data, index) => (
          <div key={index} className="carding">
            <div className="card h-100 shadow-sm border-0" style={{backgroundColor: "#d6d6d6"}}>
             <div className="card-body d-flex flex-column flex-md-row p-3 align-items-center">
                <div className=" ">
                  <h5 className="card-title   text-dark mb-2">{data.title}</h5>
                  <p className="card-text text-muted d-none d-md-block d-lg-block small mb-2">{data.details}</p>
                  <button className="btn btn-secondary d-none d-lg-block d-md-block btn-sm " style={{"backgroundColor":"#fff","color":"#928b8b","borderRadius":"70px","border":"1px solid #fff"}} >Details</button>
                </div>
                <div className=" text-center  p-2">
                  <img 
                    src={data.icon} 
                    alt={data.title}
                    style={{
                       
                    
                      
                    }} 
                    className='explore-icon'
                   
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

export default Explore