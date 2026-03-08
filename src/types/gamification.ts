export interface XPGain {
  id: string
  amount: number
  x: number
  y: number
}

export interface EvaluationResult {
  score: number
  stars: number
  strengths: string[]
  improvements: string[]
  encouragement: string
  xpBonus: number
  wordCount: number
}
