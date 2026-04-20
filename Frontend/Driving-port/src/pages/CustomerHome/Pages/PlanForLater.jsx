import React from 'react'
import watch from '../../../images/watch.png'
import { BsCalendarEventFill } from "react-icons/bs";
import { FaRegTimesCircle } from "react-icons/fa";
import { MdAccessTime } from "react-icons/md";
import  './PlanForlater.css'
function PlanForLater() {
  return (

   <>
   <h3 className='ps-5 mt-5 text-dark'>Plan For Shared Ride</h3>
  <div className='d-flex flex-column gap-3 flex-lg-row m-2 m-sm-5 p-3 pair'>
       
     <div className='card-body col-12 col-lg-8 d-flex flex-row p-3 going css-dtnQzW' style={{ "backgroundColor":"rgb(157, 205, 214) ","borderRadius":"20px"}}>
            <div className='card-content col-lg-8 '>
                <h2 className='text-dark fw-bolder mb-3'>Get Your ride right With GoRyd Sharing</h2>
                <p className='mb-3'>Choose Your As You wish</p>
                 <p className='mb-3'>Choose Your As You wish</p>
                  <p className='mb-3'>Choose Your As You wish</p>
                <button className='btn btn-warning btn-lg mt-2 ' style={{"justifyItems":"center"}}>Book Now</button>

            </div>
            {/* <div className='col col-4'>
               <img src={watch} className='' style={{"height":"200px"}} />

            </div> */}
          

     </div>






        
        
         <div className='card col col-lg-4 d-flex flex-row p-3 shadow-sm ' style={{"backgroundColor":"rgb(241 240 240)","border":'1px solid rgb(241 240 240)'}}>
            <div className='card-content'>
                <h5 className='text-dark '>Benefits</h5>
                <div className='gap-4 pt-3 '>
                    <div className='m-3 pt-3'>
                        <BsCalendarEventFill className='me-3 fs-5' />
Choose your exact pickup time up to 90 days in advance.

                    </div>
                     <div className='m-3 pt-3'>
                        <MdAccessTime className='me-3 fs-5'/>

Extra wait time included to meet your ride.

                    </div>
                     <div className='m-3 pt-3'>
                       <FaRegTimesCircle className='me-3 fs-5' />
Choose your exact pickup time up to 90 days in advance.

                    </div>

                </div>
                <button className='btn btn-dark mt-4 ' style={{'textAlign':'left'}}>Book Now</button>

            </div>
            <div className=''>
               

            </div>
          

        </div>

    </div>
   </>
   
       
       



   
  )
}

export default PlanForLater