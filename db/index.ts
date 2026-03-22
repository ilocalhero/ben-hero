import { drizzle } from 'drizzle-orm/node-postgres'
import pg from 'pg'
import { eq } from 'drizzle-orm'
import { users } from './schema.ts'
import type { PlayerState, ProgressState } from '../src/types/player.ts'

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
})

export const db = drizzle(pool)

export async function getUserData(email: string): Promise<{
  playerData: PlayerState | null
  progressData: ProgressState | null
} | null> {
  const rows = await db.select().from(users).where(eq(users.email, email)).limit(1)
  if (rows.length === 0) return null
  return {
    playerData: rows[0].playerData as PlayerState | null,
    progressData: rows[0].progressData as ProgressState | null,
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
