import React from 'react'
import rideoptions from '../../../images/RideOptions.webp'
import airport from '../../../images/airport.webp'
import cities from '../../../images/cities.webp'
import  './Position.css'


function Positions() {

    const carddata=[
        {"title":'Ride Options',"icon":rideoptions,"details":"There’s more than one way to move with Uber, no matter where you are or where you’re headed next.","button":"search Rides"},
           {"title":'Air Ports',"icon":airport,"details":"You can request a ride to and from most major airports. Schedule a ride to the airport for one less thing to worry about","button":"search Airports"},
              {"title":'15,000+ cities',"icon":cities,"details":"The app is available in thousands of cities worldwide, so you can request a ride even when you’re far from home..","button":"search Cities"}
    ]
  return (
   
   <div className=' m-5 '>
  <h2 className='text-dark mb-4'>Use the GoRyd app to help you travel your way</h2>
  
  <div className='row g-4 '>
    {carddata.map((item, index) => (
      <div className='col-12 col-md-6 col-lg-4' key={index}>
        <div className=' h-100 carding text-center '>
          <div className=' mb-3'>
            <img 
              src={item.icon} 
              className='position-imag'
              alt={item.title}
            />
          </div>
          <div>
            <h3 className='h5 text-dark fw-bold mb-3'>{item.title}</h3>
            <p className='text-muted mb-4'>{item.details}</p>
            <button className='align-item-start btn btn-lg btn-warning w-auto'>{item.button}</button>
          </div>
        </div>
      </div>
    ))}
  </div>
</div>
  )
}

export default Positions