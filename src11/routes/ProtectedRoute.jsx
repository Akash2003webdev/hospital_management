import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from '../components/common/LoadingSpinner'

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, profile, loading, profileLoading } = useAuth()
  const location = useLocation()

  // Session check innum mudiyala
  if (loading) return <LoadingSpinner fullScreen />

  if (!user) return <Navigate to="/login" state={{ from: location }} replace />

  // user irukku, profile innum fetch aaagikittu irukku (active fetch),
  // konjam wait pannrom. profileLoading false aana but profile null aana,
  // andha fetch fail aaiduchu nu artham - login kku anuppidrom, infinite
  // spinner aaga vidamatom.
  if (profileLoading) return <LoadingSpinner fullScreen />

  if (!profile) {
    return <Navigate to="/login" state={{ from: location, profileError: true }} replace />
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(profile.role)) {
    const routes = {
      admin: '/admin-dashboard',
      doctor: '/doctor-dashboard',
      nurse: '/nurse-dashboard',
      patient: '/patient-dashboard',
    }
    return <Navigate to={routes[profile.role] || '/'} replace />
  }

  return children
}

export default ProtectedRoute
