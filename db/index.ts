import { drizzle } from 'drizzle-orm/node-postgres'
import pg from 'pg'
import { eq, sql } from 'drizzle-orm'
import { users } from './schema.ts'
import type { PlayerState, ProgressState } from '../src/types/player.ts'

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
})

export const db = drizzle(pool)

export async function getUserData(email: string): Promise<{
  playerData: PlayerState | null
  progressData: ProgressState | null
  resetVersion: number
} | null> {
  const rows = await db.select().from(users).where(eq(users.email, email)).limit(1)
  if (rows.length === 0) return null
  return {
    playerData: rows[0].playerData as PlayerState | null,
    progressData: rows[0].progressData as ProgressState | null,
    resetVersion: rows[0].resetVersion,
  }
}

export async function upsertUserData(
  email: string,
  playerData: PlayerState,
  progressData: ProgressState,
): Promise<Date> {
  const now = new Date()
  await db
    .insert(users)
    .values({ email, playerData, progressData, updatedAt: now })
    .onConflictDoUpdate({
      target: users.email,
      set: { playerData, progressData, updatedAt: now },
    })
  return now
}

const DEFAULT_PROGRESS: ProgressState = {
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

export async function resetUserData(email: string): Promise<void> {
  // Fetch existing row to preserve name/handle/onboarded
  const existing = await getUserData(email)
  const name = (existing?.playerData as PlayerState | null)?.name ?? ''
  const handle = (existing?.playerData as PlayerState | null)?.handle ?? null

  const resetPlayer: PlayerState = {
    name,
    handle,
    onboarded: true,
    totalXP: 0,
    level: 1,
    streak: 0,
    lastPlayedDate: null,
    writingHistory: {},
  }

  const now = new Date()
  await db
    .update(users)
    .set({
      playerData: resetPlayer,
      progressData: DEFAULT_PROGRESS,
      resetVersion: sql`${users.resetVersion} + 1`,
      updatedAt: now,
    })
    .where(eq(users.email, email))
}
