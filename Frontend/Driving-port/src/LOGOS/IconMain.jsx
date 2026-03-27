import { useEffect, useState } from 'react'
import { FaCar, FaMotorcycle, FaTruck } from 'react-icons/fa'

const GoRydLogo = ({
  size = 100,
  className = '',
  gradient = { start: '#0e0d0b', end: '#27231e' }
}) => {
  const [active, setActive] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setActive((prev) => (prev + 1) % 3)
    }, 1200)
    return () => clearInterval(interval)
  }, [])

  return (
    <svg width={size} height={size} viewBox="0 0 180 180" className={className}>
      
      <defs>
        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={gradient.start} />
          <stop offset="100%" stopColor={gradient.end} />
        </linearGradient>
      </defs>

      {/* Background */}
      <rect width="180" height="180" rx="32" fill="url(#bgGradient)" />

      {/* CENTER ICON (ALL SAME POSITION) */}
      <g transform="translate(60,60)">
        <foreignObject width="60" height="60">
          <div
            style={{
              opacity: active === 0 ? 1 : 0,
              transition: 'opacity 0.4s ease',
              color: '#F6AF12',
              fontSize: '48px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <FaMotorcycle />
          </div>
        </foreignObject>
      </g>

      <g transform="translate(60,60)">
        <foreignObject width="60" height="60">
          <div
            style={{
              opacity: active === 1 ? 1 : 0,
              transition: 'opacity 0.4s ease',
              color: '#F6AF12',
              fontSize: '48px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <FaCar />
          </div>
        </foreignObject>
      </g>

      <g transform="translate(60,60)">
        <foreignObject width="60" height="60">
          <div
            style={{
              opacity: active === 2 ? 1 : 0,
              transition: 'opacity 0.4s ease',
              color: '#F6AF12',
              fontSize: '48px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <FaTruck />
          </div>
        </foreignObject>
      </g>

    </svg>
  )
}

export default GoRydLogo