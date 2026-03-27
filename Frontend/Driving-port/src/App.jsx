import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'

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
import ProfilePage from './pages/ProfilePage/ProfilePage.jsx'

// Driver pages
import DriverDashboard from './pages/DriverDashboard/DriverDashboard.jsx'

// Vehicle Owner pages
import OwnerDashboard from './pages/OwnerDashboard/OwnerDashboard.jsx'
import DemoREgister from './pages/RegisterPage/DemoREgister.jsx'
import HomePage from './pages/HomePage/HomePage.jsx'

function App() {
  const [user, setUser] = useState(null)
  
  useEffect(() => {
    // Parse user from localStorage
    const userStr = localStorage.getItem("user")
    if (userStr && userStr !== "null" && userStr !== "undefined") {
      try {
        const parsedUser = JSON.parse(userStr)
        setUser(parsedUser)
      } catch (err) {
        console.error("Failed to parse user from localStorage:", err)
        localStorage.removeItem("user")
      }
    }
  }, [])
  
  console.log("Current user:", user)
  
  return (
    <Routes>
      {/* ── Public Routes (only accessible when NOT logged in) ── */}
      <Route path="/login"        element={!user ? <LoginPage /> : <Navigate to={`/${user.role === 'customer' ? 'customer/home' : user.role === 'driver' ? 'driver/dashboard' : 'owner/dashboard'}`} replace />} />
      <Route path="/register"     element={!user ? <RegisterPage /> : <Navigate to="/login" replace />} />
      <Route path="/demoregister" element={!user ? <DemoREgister /> : <Navigate to="/login" replace />} />
      <Route path="/verify-otp"   element={!user ? <Otpverify /> : <Navigate to="/login" replace />} />
      <Route path="/set-mpin"     element={!user ? <SetMpin /> : <Navigate to="/login" replace />} />

      {/* ── Customer Only Routes ── */}
      <Route element={<RoleRoute allowedRoles={['customer']} />}>
        <Route path="/customer/home"              element={<HomePage />} />
        <Route path="/customer/book"              element={<BookRidePage />} />
        <Route path="/customer/tracking/:rideId"  element={<TrackingPage />} />
        <Route path="/customer/history"           element={<RideHistoryPage />} />
        <Route path="/customer/profile"           element={<ProfilePage />} />
      </Route>

      {/* ── Driver Only Routes ── */}
      <Route element={<RoleRoute allowedRoles={['driver']} />}>
        <Route path="/driver/dashboard" element={<DriverDashboard />} />
        <Route path="/driver/profile"   element={<ProfilePage />} />
      </Route>

      {/* ── Vehicle Owner Only Routes ── */}
      <Route element={<RoleRoute allowedRoles={['vehicle_owner']} />}>
        <Route path="/owner/dashboard" element={<OwnerDashboard />} />
        <Route path="/owner/profile"   element={<ProfilePage />} />
      </Route>

      {/* ── Fallback ── */}
      <Route path="/" element={
        user 
          ? <Navigate to={`/${user.role === 'customer' ? 'customer/home' : user.role === 'driver' ? 'driver/dashboard' : 'owner/dashboard'}`} replace />
          : <Navigate to="/login" replace />
      } />
      <Route path="/404" element={<NotFoundPage />} />
      <Route path="*"    element={<Navigate to="/404" replace />} />
    </Routes>
  )
}

export default App
