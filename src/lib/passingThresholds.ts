export const PASSING_SCORES = {
  quiz: 60,
  fill_blank: 60,
  writing_mission: 65,
} as const

export function isPassing(type: string, score: number): boolean {
  const threshold = PASSING_SCORES[type as keyof typeof PASSING_SCORES] ?? 60
  return score >= threshold
}

export function getThreshold(type: string): number {
  return PASSING_SCORES[type as keyof typeof PASSING_SCORES] ?? 60
}
