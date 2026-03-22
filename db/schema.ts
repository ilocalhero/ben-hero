import { pgTable, text, jsonb, timestamp, integer } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  email: text('email').primaryKey(),
  playerData: jsonb('player_data').notNull().default({}),
  progressData: jsonb('progress_data').notNull().default({}),
  resetVersion: integer('reset_version').notNull().default(0),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
