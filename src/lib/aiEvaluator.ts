import type { EvaluationResult } from '../types/gamification'
import type { WritingMissionData } from '../types/tema'
import { evaluateWriting } from './writingEvaluator'

/**
 * Calls the AI evaluation API endpoint.
 * Falls back to local rule-based evaluation if the API is unavailable.
 */
export async function evaluateWritingAI(
  response: string,
  missionData: WritingMissionData,
  playerName: string
): Promise<EvaluationResult> {
  try {
    const res = await fetch('/api/evaluate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        response,
        prompt: missionData.prompt,
        rubricKeyTerms: missionData.rubricKeyTerms,
        minimumWords: missionData.minimumWords,
        keyPointsToAddress: missionData.keyPointsToAddress,
        playerName,
      }),
    })

    if (!res.ok) {
      throw new Error(`API returned ${res.status}`)
    }

    const result: EvaluationResult = await res.json()
    return result
  } catch (err) {
    console.warn('AI evaluation unavailable, using local evaluator:', err)
    return evaluateWriting(response, missionData)
  }
}
