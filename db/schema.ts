import { pgTable, text, jsonb, timestamp } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  email: text('email').primaryKey(),
  playerData: jsonb('player_data').notNull().default({}),
  progressData: jsonb('progress_data').notNull().default({}),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
