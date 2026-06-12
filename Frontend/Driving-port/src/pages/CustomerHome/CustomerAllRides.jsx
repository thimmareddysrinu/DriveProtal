import React from 'react'

function CustomerAllRides() {
    const user=JSON.parse(localStorage.getItem('user'))
    const phone_number=user?.phone_number
  return (
    <div className='container mt-4'>
        <h2 className='text-warning'>Hi,{phone_number} All Your Rides</h2>
        <div className='d-flex flex-column flex-lg-row gap-3 '>
            <div className='card mt-5' >
                <div className='card-body ps-5 pe-5 pt-2 p'>
                    <p>Your ride details</p>
                    <hr className='text-warning ' style={{"textDecorationLine":"40px"}}/>
                <p>Ride Id:1234</p>
                <p>from:Newyoprk</p>
                <p>from:Newyoprk</p>
                <p>Ride Amount:123</p>
                <button className='btn btn-primary'>View Details</button>

                </div>
                

            </div>

        </div>

    </div>
  )
}

export default CustomerAllRides