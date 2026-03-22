import type { Request, Response } from 'express'
import { getUserData, upsertUserData, resetUserData } from '../db/index.ts'

const ALLOWED_EMAILS = new Set([
  'benjaminrfcb@gmail.com',
  'sean@ilocalhero.com',
  'verovr@gmail.com',
])

export async function syncPullHandler(req: Request, res: Response) {
  const email = req.query.email as string | undefined
  if (!email || !ALLOWED_EMAILS.has(email)) {
    res.status(403).json({ error: 'unauthorized' })
    return
  }

  try {
    const data = await getUserData(email)
    if (!data) {
      res.json({ playerData: null, progressData: null, resetVersion: 0 })
      return
    }
    res.json({ playerData: data.playerData, progressData: data.progressData, resetVersion: data.resetVersion })
  } catch (e) {
    console.error('sync pull error:', e)
    res.status(500).json({ error: 'db_error' })
  }
}

export async function syncPushHandler(req: Request, res: Response) {
  const { email, playerData, progressData } = req.body ?? {}
  if (!email || !ALLOWED_EMAILS.has(email)) {
    res.status(403).json({ error: 'unauthorized' })
    return
  }
  if (!playerData || !progressData) {
    res.status(400).json({ error: 'missing_data' })
    return
  }

  try {
    const updatedAt = await upsertUserData(email, playerData, progressData)
    res.json({ ok: true, updatedAt })
  } catch (e) {
    console.error('sync push error:', e)
    res.status(500).json({ error: 'db_error' })
  }
}

export async function syncResetHandler(req: Request, res: Response) {
  const { email } = req.body ?? {}
  if (!email || !ALLOWED_EMAILS.has(email)) {
    res.status(403).json({ error: 'unauthorized' })
    return
  }

  try {
    await resetUserData(email)
    res.json({ ok: true })
  } catch (e) {
    console.error('reset error:', e)
    res.status(500).json({ error: 'db_error' })
  }
}
