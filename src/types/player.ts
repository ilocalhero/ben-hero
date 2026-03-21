export interface LevelInfo {
  level: number
  title: string
  xpRequired: number
  xpForNext: number
}

export interface WritingRecord {
  activityId: string
  score: number
  wordCount: number
  completedAt: string
}

export interface PlayerState {
  name: string
  handle: string | null
  onboarded: boolean
  totalXP: number
  level: number
  streak: number
  lastPlayedDate: string | null
  writingHistory: Record<string, WritingRecord[]>
}

export interface ProgressState {
  completedActivities: Record<string, boolean>
  activityScores: Record<string, number>
  completedLessons: Record<string, boolean>
  completedTemas: Record<string, boolean>
  temaBonuses: Record<string, boolean>
  dailyMissionsToday: number
  dailyMissionDate: string | null
  lastDailyMissionTemaId: string | null
  lastDailyMissionLessonIndex: number
}
