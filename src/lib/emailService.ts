import type { EvaluationResult } from '../types/gamification'

interface MissionEmailPayload {
  playerName: string
  playerEmail: string
  temaTitle: string
  lessonTitle: string
  writtenResponse: string
  score: number
  stars: number
  strengths: string[]
  improvements: string[]
  encouragement: string
  xpEarned: number
  wordCount: number
  completedAt: string
}

/**
 * Sends mission results email to the configured notification addresses.
 * Fires and forgets — does not block the UI on failure.
 */
export async function sendMissionEmail(
  result: EvaluationResult,
  writtenResponse: string,
  xpEarned: number,
  playerName: string,
  playerEmail: string,
  temaTitle: string,
  lessonTitle: string
): Promise<void> {
  const payload: MissionEmailPayload = {
    playerName,
    playerEmail,
    temaTitle,
    lessonTitle,
    writtenResponse,
    score: result.score,
    stars: result.stars,
    strengths: result.strengths,
    improvements: result.improvements,
    encouragement: result.encouragement,
    xpEarned,
    wordCount: result.wordCount,
    completedAt: new Date().toISOString(),
  }

  try {
    const res = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      console.warn('Email send failed:', res.status)
    }
  } catch (err) {
    console.warn('Email service unavailable:', err)
  }
}
