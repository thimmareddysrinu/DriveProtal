import { Link } from 'react-router-dom'
import { FaCar } from 'react-icons/fa'


const NotFoundPage = () => (
  <div className="notfound-page">
    <div className="notfound-content">
      <div className="notfound-icon"><FaCar /></div>
      <h1>404</h1>
      <h2>Road Not Found</h2>
      <p>The page you're looking for doesn't exist or has been moved.</p>
      <Link to="/" className="btn-primary-custom">← Back to Home</Link>
    </div>
  </div>
)

export default NotFoundPage
