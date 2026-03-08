import { create } from 'zustand'
import type { PlayerState, WritingRecord } from '../types/player'
import { getLevelFromXP } from '../lib/xpCalculator'
import { saveToStorage, loadFromStorage } from '../lib/storage'

interface PlayerActions {
  addXP: (amount: number) => { newLevel: number; leveledUp: boolean }
  incrementStreak: () => void
  resetStreakIfNeeded: () => void
  addWritingRecord: (temaId: string, record: WritingRecord) => void
  setName: (name: string) => void
  load: () => void
}

const DEFAULT_STATE: PlayerState = {
  name: 'Ben',
  totalXP: 0,
  level: 1,
  streak: 0,
  lastPlayedDate: null,
  writingHistory: {},
}

function todayStr(): string {
  return new Date().toISOString().split('T')[0]
}

export const usePlayerStore = create<PlayerState & PlayerActions>((set, get) => ({
  ...DEFAULT_STATE,

  load: () => {
    const saved = loadFromStorage<PlayerState>('player')
    if (saved) {
      set({ ...saved, level: getLevelFromXP(saved.totalXP) })
    }
  },

  addXP: (amount: number) => {
    const state = get()
    const newXP = state.totalXP + amount
    const newLevel = getLevelFromXP(newXP)
    const leveledUp = newLevel > state.level
    const nextState = { totalXP: newXP, level: newLevel }
    set(nextState)
    saveToStorage('player', { ...state, ...nextState })
    return { newLevel, leveledUp }
  },

  incrementStreak: () => {
    const state = get()
    const today = todayStr()
    if (state.lastPlayedDate === today) return // already counted today

    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]

    const newStreak = state.lastPlayedDate === yesterdayStr ? state.streak + 1 : 1
    const update = { streak: newStreak, lastPlayedDate: today }
    set(update)
    saveToStorage('player', { ...state, ...update })
  },

  resetStreakIfNeeded: () => {
    const state = get()
    if (!state.lastPlayedDate) return
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]
    const today = todayStr()
    // If last played was not today or yesterday, reset streak
    if (state.lastPlayedDate !== today && state.lastPlayedDate !== yesterdayStr) {
      const update = { streak: 0 }
      set(update)
      saveToStorage('player', { ...state, ...update })
    }
  },

  addWritingRecord: (temaId: string, record: WritingRecord) => {
    const state = get()
    const history = state.writingHistory[temaId] || []
    const update = {
      writingHistory: {
        ...state.writingHistory,
        [temaId]: [...history, record],
      },
    }
    set(update)
    saveToStorage('player', { ...state, ...update })
  },

  setName: (name: string) => {
    const state = get()
    set({ name })
    saveToStorage('player', { ...state, name })
  },
}))
