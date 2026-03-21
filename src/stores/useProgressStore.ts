import { create } from 'zustand'
import type { ProgressState } from '../types/player'
import { saveToStorage, loadFromStorage } from '../lib/storage'

interface ProgressActions {
  completeActivity: (activityId: string, score: number) => void
  uncompleteActivity: (activityId: string) => void
  completeLesson: (lessonId: string) => void
  completeTema: (temaId: string) => void
  awardTemaBonus: (temaId: string) => void
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
  temaBonuses: {},
  dailyMissionsToday: 0,
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
    const saved = loadFromStorage<Record<string, unknown>>('progress')
    if (saved) {
      const today = todayStr()
      // Migrate old boolean dailyMissionCompleted → dailyMissionsToday count
      let dailyMissionsToday: number
      if ('dailyMissionsToday' in saved && typeof saved.dailyMissionsToday === 'number') {
        dailyMissionsToday = saved.dailyMissionDate === today ? saved.dailyMissionsToday : 0
      } else if ('dailyMissionCompleted' in saved) {
        // Old format migration
        dailyMissionsToday = (saved.dailyMissionDate === today && saved.dailyMissionCompleted) ? 1 : 0
      } else {
        dailyMissionsToday = 0
      }
      set({ ...DEFAULT_STATE, ...saved, dailyMissionsToday } as ProgressState)
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

  uncompleteActivity: (activityId: string) => {
    const state = get()
    const { [activityId]: _done, ...restActivities } = state.completedActivities
    const { [activityId]: _score, ...restScores } = state.activityScores
    const update = {
      completedActivities: restActivities,
      activityScores: restScores,
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

  awardTemaBonus: (temaId: string) => {
    const state = get()
    if (state.temaBonuses[temaId]) return
    const update = { temaBonuses: { ...state.temaBonuses, [temaId]: true } }
    set(update)
    saveToStorage('progress', { ...state, ...update })
  },

  completeDailyMission: (temaId: string, lessonIndex: number) => {
    const state = get()
    const today = todayStr()
    const update = {
      dailyMissionsToday: state.dailyMissionsToday + 1,
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
