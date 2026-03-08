import { create } from 'zustand'
import type { ProgressState } from '../types/player'
import { saveToStorage, loadFromStorage } from '../lib/storage'

interface ProgressActions {
  completeActivity: (activityId: string, score: number) => void
  completeLesson: (lessonId: string) => void
  completeTema: (temaId: string) => void
  completeDailyMission: (temaId: string, lessonIndex: number) => void
  isActivityDone: (activityId: string) => boolean
  isLessonDone: (lessonId: string) => boolean
  getActivityScore: (activityId: string) => number
  getTemaProgress: (temaId: string, totalActivities: number) => number
  getNextDailyLesson: (temaId: string) => number
  load: () => void
  reset: () => void
}

const DEFAULT_STATE: ProgressState = {
  completedActivities: {},
  activityScores: {},
  completedLessons: {},
  completedTemas: {},
  dailyMissionCompleted: false,
  dailyMissionDate: null,
  lastDailyMissionTemaId: null,
  lastDailyMissionLessonIndex: 0,
}

function todayStr(): string {
  return new Date().toISOString().split('T')[0]
}

export const useProgressStore = create<ProgressState & ProgressActions>((set, get) => ({
  ...DEFAULT_STATE,

  load: () => {
    const saved = loadFromStorage<ProgressState>('progress')
    if (saved) {
      // Reset daily mission if it's a new day
      const today = todayStr()
      const dailyMissionCompleted = saved.dailyMissionDate === today ? saved.dailyMissionCompleted : false
      set({ ...saved, dailyMissionCompleted })
    }
  },

  reset: () => {
    set(DEFAULT_STATE)
    saveToStorage('progress', DEFAULT_STATE)
  },

  completeActivity: (activityId: string, score: number) => {
    const state = get()
    const update = {
      completedActivities: { ...state.completedActivities, [activityId]: true },
      activityScores: { ...state.activityScores, [activityId]: score },
    }
    set(update)
    saveToStorage('progress', { ...state, ...update })
  },

  completeLesson: (lessonId: string) => {
    const state = get()
    const update = { completedLessons: { ...state.completedLessons, [lessonId]: true } }
    set(update)
    saveToStorage('progress', { ...state, ...update })
  },

  completeTema: (temaId: string) => {
    const state = get()
    const update = { completedTemas: { ...state.completedTemas, [temaId]: true } }
    set(update)
    saveToStorage('progress', { ...state, ...update })
  },

  completeDailyMission: (temaId: string, lessonIndex: number) => {
    const state = get()
    const today = todayStr()
    const update = {
      dailyMissionCompleted: true,
      dailyMissionDate: today,
      lastDailyMissionTemaId: temaId,
      lastDailyMissionLessonIndex: lessonIndex,
    }
    set(update)
    saveToStorage('progress', { ...state, ...update })
  },

  isActivityDone: (activityId: string) => get().completedActivities[activityId] === true,
  isLessonDone: (lessonId: string) => get().completedLessons[lessonId] === true,
  getActivityScore: (activityId: string) => get().activityScores[activityId] ?? 0,

  getTemaProgress: (temaId: string, totalActivities: number) => {
    if (totalActivities === 0) return 0
    const done = Object.keys(get().completedActivities).filter(id => id.startsWith(temaId)).length
    return Math.round((done / totalActivities) * 100)
  },

  getNextDailyLesson: (temaId: string) => {
    const state = get()
    if (state.lastDailyMissionTemaId !== temaId) return 0
    return state.lastDailyMissionLessonIndex + 1
  },
}))
