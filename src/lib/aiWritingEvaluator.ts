import type { WritingMissionData } from '../types/tema'
import type { EvaluationResult } from '../types/gamification'

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(w => w.length > 1).length
}

export async function evaluateWritingAI(
  answer: string,
  missionData: WritingMissionData
): Promise<EvaluationResult> {
  const body = {
    answer,
    prompt: missionData.prompt,
    keyPoints: missionData.keyPointsToAddress ?? [],
    rubricKeyTerms: missionData.rubricKeyTerms,
    minimumWords: missionData.minimumWords,
  }

  const response = await fetch('/api/evaluate-writing', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`)
  }

  const data = await response.json() as EvaluationResult

  if (typeof data.score !== 'number' || !Array.isArray(data.strengths)) {
    throw new Error('Invalid response shape from API')
  }

  // Ensure wordCount is accurate (merge client-side count)
  data.wordCount = countWords(answer)

  return data
}
