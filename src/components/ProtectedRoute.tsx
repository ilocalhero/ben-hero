import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../stores/useAuthStore'

export function ProtectedRoute() {
  const email = useAuthStore((s) => s.email)
  if (!email) return <Navigate to="/login" replace />
  return <Outlet />
}
