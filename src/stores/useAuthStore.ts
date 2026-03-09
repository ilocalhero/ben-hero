import { create } from 'zustand'
import { setUserPrefix } from '../lib/storage'

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

interface AuthState {
  email: string | null
  login: (email: string) => boolean
  logout: () => void
  load: () => void
}

// Initialize synchronously at module load — sets email + user prefix before any component renders
function initAuth(): { email: string | null } {
  try {
    const stored = localStorage.getItem(AUTH_KEY)
    if (stored) {
      const { email } = JSON.parse(stored)
      if (email && ALLOWED_USERS[email]) {
        setUserPrefix(ALLOWED_USERS[email])
        return { email }
      }
    }
  } catch {
    // ignore
  }
  return { email: null }
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
    return true
  },

  logout: () => {
    localStorage.removeItem(AUTH_KEY)
    setUserPrefix('')
    set({ email: null })
  },
}))
