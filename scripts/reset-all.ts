/**
 * One-time script to reset all user stats and progress while keeping profiles.
 *
 * Usage: npx tsx scripts/reset-all.ts
 *
 * Requires DATABASE_URL environment variable.
 */
import { resetUserData } from '../db/index.ts'

const EMAILS = [
  'benjaminrfcb@gmail.com',
  'sean@ilocalhero.com',
  'verovr@gmail.com',
]

async function main() {
  for (const email of EMAILS) {
    console.log(`Resetting ${email}...`)
    await resetUserData(email)
    console.log(`  Done.`)
  }
  console.log('\nAll users reset. Stats and progress wiped, profiles preserved.')
  process.exit(0)
}

main().catch((err) => {
  console.error('Reset failed:', err)
  process.exit(1)
})
