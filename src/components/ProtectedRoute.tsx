import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../stores/useAuthStore'
import { loadFromStorage } from '../lib/storage'
import type { PlayerState } from '../types/player'

export function ProtectedRoute() {
  const email = useAuthStore((s) => s.email)
  if (!email) return <Navigate to="/login" replace />

  const player = loadFromStorage<PlayerState>('player')
  if (!player?.onboarded) return <Navigate to="/onboarding" replace />

  return <Outlet />
}
