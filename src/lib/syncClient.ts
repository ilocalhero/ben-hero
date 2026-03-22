import type { PlayerState, ProgressState, WritingRecord } from '../types/player'
import { usePlayerStore } from '../stores/usePlayerStore'
import { useProgressStore } from '../stores/useProgressStore'
import { saveToStorage } from './storage'
import { getLevelFromXP } from './xpCalculator'

// --- Fetch helpers ---

async function pullFromServer(email: string): Promise<{
  playerData: PlayerState | null
  progressData: ProgressState | null
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

// --- Merge logic ---

function mergePlayerData(local: PlayerState, remote: PlayerState): PlayerState {
  // Take higher XP
  const totalXP = Math.max(local.totalXP, remote.totalXP)

  // Take higher streak, using more recent lastPlayedDate to break ties
  let streak = local.streak
  let lastPlayedDate = local.lastPlayedDate
  if (remote.lastPlayedDate && (!local.lastPlayedDate || remote.lastPlayedDate > local.lastPlayedDate)) {
    streak = remote.streak
    lastPlayedDate = remote.lastPlayedDate
  } else if (local.lastPlayedDate === remote.lastPlayedDate) {
    streak = Math.max(local.streak, remote.streak)
  }

  // Merge writing history: union entries per tema, dedupe by completedAt
  const writingHistory: Record<string, WritingRecord[]> = { ...local.writingHistory }
  for (const [temaId, records] of Object.entries(remote.writingHistory ?? {})) {
    const existing = writingHistory[temaId] ?? []
    const existingKeys = new Set(existing.map(r => r.completedAt))
    const newRecords = records.filter(r => !existingKeys.has(r.completedAt))
    writingHistory[temaId] = [...existing, ...newRecords]
  }

  return {
    name: local.name || remote.name,
    handle: local.handle ?? remote.handle,
    onboarded: local.onboarded || remote.onboarded,
    totalXP,
    level: getLevelFromXP(totalXP),
    streak,
    lastPlayedDate,
    writingHistory,
  }
}

function mergeProgressData(local: ProgressState, remote: ProgressState): ProgressState {
  // Union boolean maps (true wins)
  const unionBool = (a: Record<string, boolean>, b: Record<string, boolean>) => {
    const result = { ...a }
    for (const [k, v] of Object.entries(b)) {
      if (v) result[k] = true
    }
    return result
  }

  // Higher score wins
  const mergeScores = (a: Record<string, number>, b: Record<string, number>) => {
    const result = { ...a }
    for (const [k, v] of Object.entries(b)) {
      result[k] = Math.max(result[k] ?? 0, v)
    }
    return result
  }

  // Daily mission: take whichever has more recent date
  let dailyMissionsToday = local.dailyMissionsToday
  let dailyMissionDate = local.dailyMissionDate
  let lastDailyMissionTemaId = local.lastDailyMissionTemaId
  let lastDailyMissionLessonIndex = local.lastDailyMissionLessonIndex

  if (remote.dailyMissionDate && (!local.dailyMissionDate || remote.dailyMissionDate > local.dailyMissionDate)) {
    dailyMissionsToday = remote.dailyMissionsToday
    dailyMissionDate = remote.dailyMissionDate
    lastDailyMissionTemaId = remote.lastDailyMissionTemaId
    lastDailyMissionLessonIndex = remote.lastDailyMissionLessonIndex
  } else if (local.dailyMissionDate === remote.dailyMissionDate) {
    dailyMissionsToday = Math.max(local.dailyMissionsToday, remote.dailyMissionsToday)
  }

  return {
    completedActivities: unionBool(local.completedActivities, remote.completedActivities),
    activityScores: mergeScores(local.activityScores, remote.activityScores),
    completedLessons: unionBool(local.completedLessons, remote.completedLessons),
    completedTemas: unionBool(local.completedTemas, remote.completedTemas),
    temaBonuses: unionBool(local.temaBonuses, remote.temaBonuses),
    dailyMissionsToday,
    dailyMissionDate,
    lastDailyMissionTemaId,
    lastDailyMissionLessonIndex,
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

  if (remote.playerData && remote.progressData) {
    const mergedPlayer = mergePlayerData(localPlayer, remote.playerData)
    const mergedProgress = mergeProgressData(localProgress, remote.progressData)

    // Update stores
    usePlayerStore.setState(mergedPlayer)
    useProgressStore.setState(mergedProgress)

    // Persist merged data to localStorage
    saveToStorage('player', mergedPlayer)
    saveToStorage('progress', mergedProgress)

    // Push merged result back so server has canonical state
    await pushToServer(email, mergedPlayer, mergedProgress)
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
