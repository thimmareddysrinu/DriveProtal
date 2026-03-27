/**
 * Format currency in INR
 */
export const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)

/**
 * Format date to readable string
 */
export const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

/**
 * Format time to readable string
 */
export const formatTime = (dateStr) =>
  new Date(dateStr).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })

/**
 * Format minutes to human-readable duration
 */
export const formatDuration = (minutes) => {
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

/**
 * Truncate text with ellipsis
 */
export const truncate = (text, maxLen = 30) =>
  text?.length > maxLen ? `${text.slice(0, maxLen)}...` : text

/**
 * Get ride status badge color
 */
export const getRideStatusColor = (status) => {
  const colors = {
    searching: 'warning',
    accepted: 'info',
    arriving: 'primary',
    in_progress: 'success',
    completed: 'secondary',
    cancelled: 'danger',
  }
  return colors[status] || 'secondary'
}
