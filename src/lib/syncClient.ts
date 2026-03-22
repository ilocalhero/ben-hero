import type { PlayerState, ProgressState } from '../types/player'
import { usePlayerStore } from '../stores/usePlayerStore'
import { useProgressStore } from '../stores/useProgressStore'
import { saveToStorage, loadFromStorage } from './storage'

// --- Fetch helpers ---

async function pullFromServer(email: string): Promise<{
  playerData: PlayerState | null
  progressData: ProgressState | null
  resetVersion: number
} | null> {
  try {
    const res = await fetch(`/api/sync?email=${encodeURIComponent(email)}`, {
      cache: 'no-store',
    })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

async function pushToServer(
  email: string,
  playerData: PlayerState,
  progressData: ProgressState,
): Promise<boolean> {
  try {
    const res = await fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, playerData, progressData }),
    })
    return res.ok
  } catch {
    return false
  }
}

// --- Extract data fields from store state (strip action methods) ---

function extractPlayerData(): PlayerState {
  const s = usePlayerStore.getState()
  return {
    name: s.name,
    handle: s.handle,
    onboarded: s.onboarded,
    totalXP: s.totalXP,
    level: s.level,
    streak: s.streak,
    lastPlayedDate: s.lastPlayedDate,
    writingHistory: s.writingHistory,
  }
}

function extractProgressData(): ProgressState {
  const s = useProgressStore.getState()
  return {
    completedActivities: s.completedActivities,
    activityScores: s.activityScores,
    completedLessons: s.completedLessons,
    completedTemas: s.completedTemas,
    temaBonuses: s.temaBonuses,
    dailyMissionsToday: s.dailyMissionsToday,
    dailyMissionDate: s.dailyMissionDate,
    lastDailyMissionTemaId: s.lastDailyMissionTemaId,
    lastDailyMissionLessonIndex: s.lastDailyMissionLessonIndex,
  }
}

// --- Pull, merge, and push ---

export async function pullAndMerge(email: string): Promise<void> {
  const remote = await pullFromServer(email)
  if (!remote) return // offline or no server data

  const localPlayer = extractPlayerData()
  const localProgress = extractProgressData()

  // Check if the server triggered a reset since we last synced
  const localResetVersion = loadFromStorage<number>('resetVersion') ?? 0
  const serverResetVersion = remote.resetVersion ?? 0
  const wasReset = serverResetVersion > localResetVersion

  if (remote.playerData && remote.progressData) {
    let finalPlayer: PlayerState
    let finalProgress: ProgressState

    if (wasReset) {
      // Server was reset — accept server data as-is instead of merging
      finalPlayer = remote.playerData
      finalProgress = remote.progressData
      saveToStorage('resetVersion', serverResetVersion)
    } else {
      // Server is the source of truth on initial load.
      // Local changes from the current session are pushed via debounced sync,
      // so on page reload the server already has the latest data.
      // Use server data to avoid stale localStorage resurrecting old progress.
      finalPlayer = {
        ...remote.playerData,
        // Preserve local profile fields (name/handle) in case they were changed offline
        name: localPlayer.name || remote.playerData.name,
        handle: localPlayer.handle ?? remote.playerData.handle,
      }
      finalProgress = remote.progressData
    }

    // Update stores
    usePlayerStore.setState(finalPlayer)
    useProgressStore.setState(finalProgress)

    // Persist to localStorage
    saveToStorage('player', finalPlayer)
    saveToStorage('progress', finalProgress)

    // Push result back so server has canonical state
    await pushToServer(email, finalPlayer, finalProgress)
  } else {
    // Server has no data yet — push local data to seed it
    await pushToServer(email, localPlayer, localProgress)
  }
}

// --- Debounced sync on store changes ---

let syncTimer: ReturnType<typeof setTimeout> | null = null
let unsubPlayer: (() => void) | null = null
let unsubProgress: (() => void) | null = null

function scheduleSyncToServer(email: string) {
  if (syncTimer) clearTimeout(syncTimer)
  syncTimer = setTimeout(async () => {
    await pushToServer(email, extractPlayerData(), extractProgressData())
  }, 2000)
}

function flushPendingSync(email: string) {
  if (syncTimer) {
    clearTimeout(syncTimer)
    syncTimer = null
    const data = JSON.stringify({
      email,
      playerData: extractPlayerData(),
      progressData: extractProgressData(),
    })
    // Use sendBeacon for reliability when page is closing
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/sync', new Blob([data], { type: 'application/json' }))
    }
  }
}

let visibilityHandler: (() => void) | null = null
let beforeUnloadHandler: (() => void) | null = null

export function initStoreSync(email: string): void {
  // Clean up any previous subscriptions
  unsubPlayer?.()
  unsubProgress?.()
  if (visibilityHandler) document.removeEventListener('visibilitychange', visibilityHandler)
  if (beforeUnloadHandler) window.removeEventListener('beforeunload', beforeUnloadHandler)

  unsubPlayer = usePlayerStore.subscribe(() => scheduleSyncToServer(email))
  unsubProgress = useProgressStore.subscribe(() => scheduleSyncToServer(email))

  // Re-pull from server when app regains focus (switching back to tab/app)
  visibilityHandler = () => {
    if (document.visibilityState === 'visible') {
      pullAndMerge(email)
    } else {
      flushPendingSync(email)
    }
  }
  document.addEventListener('visibilitychange', visibilityHandler)

  // Flush any pending sync when page is about to close
  beforeUnloadHandler = () => flushPendingSync(email)
  window.addEventListener('beforeunload', beforeUnloadHandler)
}
