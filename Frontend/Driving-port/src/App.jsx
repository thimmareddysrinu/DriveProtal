import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'

// Auth pages (public)
import LoginPage    from './pages/LoginPage/LoginPage.jsx'
import RegisterPage from './pages/RegisterPage/RegisterPage.jsx'
import Otpverify   from './pages/OtpVerify/Otpverify.jsx'
import SetMpin     from './pages/SetMpin/SetMpin.jsx'
import NotFoundPage from './pages/NotFoundPage/NotFoundPage.jsx'

// Role guards
import RoleRoute from './components/Auth/RoleRoute.jsx'

// Customer pages
import CustomerHome from './pages/CustomerHome/CustomerHome.jsx'
import BookRidePage from './pages/BookRidePage/BookRidePage.jsx'
import TrackingPage from './pages/TrackingPage/TrackingPage.jsx'
import RideHistoryPage from './pages/RideHistoryPage/RideHistoryPage.jsx'
import ProfilePage from './pages/DriverDashboard/ProfilePage.jsx'

// Driver pages
import DriverDashboard from './pages/DriverDashboard/DriverDashboard.jsx'
import { APIProvider } from '@vis.gl/react-google-maps'

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
// Vehicle Owner pages
import OwnerDashboard from './pages/OwnerDashboard/OwnerDashboard.jsx'
import DemoREgister from './pages/RegisterPage/DemoREgister.jsx'
import Navbar from './components/Navbar/Navbar.jsx'
import Footer from './pages/Footer/Footer.jsx'
import VehiclesWithMap from './pages/CustomerHome/VehicleGetting/VehiclesWithMap.jsx'
import WaitForDriverAcceptance from './pages/CustomerHome/BookingProgress/WaitForDriverAcceptance.jsx'
import AdminHome from './pages/Admin/AdminHome.jsx'
import AdminDriverVehicleApprovalPage from './pages/Admin/AdminDriverVehicleApprovalPage.jsx'
import AdminOwnerVehicleApproval from './pages/Admin/AdminOwnerVehicleApproval.jsx'
import OwnerProfilePage from './pages/OwnerDashboard/OwnerProfilePage.jsx'
import AcceptedRide from './pages/CustomerHome/BookingProgress/AcceptedRide.jsx';

function App() {
  const navigate=useNavigate()
  return (
    <>
    <APIProvider
      apiKey={GOOGLE_MAPS_API_KEY}
      libraries={['places', 'routes']}
    >
        <Navbar/>
    <>  

    
    <Routes>
   
       
      

      {/* ── Public Routes ── */}
      <Route path="/login"      element={<LoginPage />} />
      <Route path="/register"   element={<RegisterPage />} />
       <Route path="/demoregister"   element={<DemoREgister />} />
      <Route path="/verify-otp" element={<Otpverify />} />
      <Route path="/set-mpin"   element={<SetMpin />} />

      {/* ── Customer Only Routes ── */}
      <Route element={<RoleRoute allowedRoles={['customer']} />}>
        <Route path="/customer/home"              element={<CustomerHome />} />
        <Route path="/customer/book"              element={<BookRidePage />} />
        <Route path="/customer/tracking/:rideId"  element={<TrackingPage />} />
        <Route path="/customer/history"           element={<RideHistoryPage />} />
        <Route path="/customer/profile"           element={<ProfilePage />} />
        <Route path='/customer/home/vehiclewithmap' element={<VehiclesWithMap/>}/>
          <Route path='/vehicleBooking/Progress' element={<WaitForDriverAcceptance/>}/>
          <Route path='/ride-accepted' element={<AcceptedRide/>}/>
      </Route>
       <Route element={<RoleRoute allowedRoles={['admin']} />}>
        
         <Route path="/admin/profile"              element={<ProfilePage />} />
        
      <Route path="/admin/home" element={<AdminHome />} />
        <Route path="/admin/driver-approval/:id" element={<AdminDriverVehicleApprovalPage />} />
        <Route path="/admin/owner-vehicle-approval/:id" element={<AdminOwnerVehicleApproval />} />
      </Route>

      {/* ── Driver Only Routes ── */}
      <Route element={<RoleRoute allowedRoles={['driver']} />}>
        <Route path="/driver/dashboard" element={<DriverDashboard />} />
        <Route path="/driver/profile"   element={<ProfilePage />} />
      </Route>

      {/* ── Vehicle Owner Only Routes ── */}
      <Route element={<RoleRoute allowedRoles={['vehicle_owner']} />}>
        <Route path="/owner/dashboard" element={<OwnerDashboard />} />
        <Route path="/owner/profile"   element={<OwnerProfilePage />} />
      </Route>

      {/* ── Fallback ── */}
      <Route path="/"    element={<Navigate to="/login" replace />} />
      <Route path="/404" element={<NotFoundPage />} />
      <Route path="*"    element={<Navigate to="/404" replace />} />

    </Routes>
    </>
    {/* <Footer/> */}
       </APIProvider>
    
    </>
  
  )
}

export default App
       