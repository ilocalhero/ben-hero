import type { ShowWorkData } from '../types/tema'
import type { EvaluationResult } from '../types/gamification'

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(w => w.length > 1).length
}

export async function evaluateShowWorkAI(
  answer: string,
  data: ShowWorkData
): Promise<EvaluationResult> {
  const body = {
    mode: 'show_work',
    answer,
    prompt: data.problem,
    keyPoints: data.solutionSteps,
    rubricKeyTerms: data.rubricKeyTerms,
    minimumWords: data.minimumWords,
    expectedAnswer: data.expectedAnswer,
  }

  const response = await fetch('/api/evaluate-writing', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`)
  }

  const result = await response.json() as EvaluationResult

  if (typeof result.score !== 'number' || !Array.isArray(result.strengths)) {
    throw new Error('Invalid response shape from API')
  }

  result.wordCount = countWords(answer)
  return result
}
