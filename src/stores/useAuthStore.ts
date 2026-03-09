import { create } from 'zustand'
import { setUserPrefix, loadFromStorage } from '../lib/storage'
import { usePlayerStore } from './usePlayerStore'
import type { PlayerState } from '../types/player'

const AUTH_KEY = 'benhero_auth'

export const ALLOWED_USERS: Record<string, string> = {
  'benjaminrfcb@gmail.com': 'ben',
  'sean@ilocalhero.com': 'sean',
  'verovr@gmail.com': 'veronica',
}

export const DISPLAY_NAMES: Record<string, string> = {
  'benjaminrfcb@gmail.com': 'Ben',
  'sean@ilocalhero.com': 'Sean',
  'verovr@gmail.com': 'Veronica',
}

// For known users: auto-seed their profile on any new device so they never
// see onboarding again. Handle defaults to display name (e.g. "Ben").
// Update this map if a user picked a custom handle during onboarding.
export const DEFAULT_HANDLES: Record<string, string> = {
  'benjaminrfcb@gmail.com': 'Ben',
  'sean@ilocalhero.com': 'Sean',
  'verovr@gmail.com': 'Veronica',
}

// If the user has no local player profile yet (new device), seed it from
// the known-user maps so onboarding is skipped entirely.
function seedPlayerIfNeeded(email: string) {
  const existing = loadFromStorage<PlayerState>('player')
  if (existing?.onboarded) return

  const name = DISPLAY_NAMES[email]
  const handle = DEFAULT_HANDLES[email]
  if (!name || !handle) return // Unknown user — let onboarding run normally

  usePlayerStore.getState().completeOnboarding(name, handle)
}

// Initialize synchronously at module load — sets email + user prefix before any component renders
function initAuth(): { email: string | null } {
  try {
    const stored = localStorage.getItem(AUTH_KEY)
    if (stored) {
      const { email } = JSON.parse(stored)
      if (email && ALLOWED_USERS[email]) {
        setUserPrefix(ALLOWED_USERS[email])
        seedPlayerIfNeeded(email)
        return { email }
      }
    }
  } catch {
    // ignore
  }
  return { email: null }
}

interface AuthState {
  email: string | null
  login: (email: string) => boolean
  logout: () => void
  load: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  ...initAuth(),

  load: () => {
    // No-op: auth is now initialized synchronously above.
    // Kept for backward compat with AppShell's useEffect.
  },

  login: (email: string) => {
    const prefix = ALLOWED_USERS[email.toLowerCase().trim()]
    if (!prefix) return false
    const normalised = email.toLowerCase().trim()
    setUserPrefix(prefix)
    localStorage.setItem(AUTH_KEY, JSON.stringify({ email: normalised }))
    set({ email: normalised })
    seedPlayerIfNeeded(normalised)
    return true
  },

  logout: () => {
    localStorage.removeItem(AUTH_KEY)
    setUserPrefix('')
    set({ email: null })
  },
}))
