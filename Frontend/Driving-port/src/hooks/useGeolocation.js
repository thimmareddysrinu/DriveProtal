import { useState, useEffect, useCallback } from 'react'
import { useDispatch } from 'react-redux'


export const useGeolocation = (options = {}) => {
  const dispatch = useDispatch()
  const [location, setLocation] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  const handleSuccess = useCallback((position) => {
    const coords = {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
      accuracy: position.coords.accuracy,
    }
    setLocation(coords)
    dispatch(setUserLocation(coords))
    setLoading(false)
  }, [dispatch])

  const handleError = useCallback((err) => {
    setError(err.message)
    setLoading(false)
  }, [])

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser')
      setLoading(false)
      return
    }
    const watchId = navigator.geolocation.watchPosition(
      handleSuccess, handleError,
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0, ...options }
    )
    return () => navigator.geolocation.clearWatch(watchId)
  }, [])

  return { location, error, loading }
}
