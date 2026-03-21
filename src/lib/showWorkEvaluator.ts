import type { ShowWorkData } from '../types/tema'
import type { EvaluationResult } from '../types/gamification'

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(w => w.length > 1).length
}

const ENCOURAGING = [
  'Excelente trabajo mostrando tus pasos. Sigue asi, cada problema que resuelves te hace mas fuerte.',
  'Muy bien explicado. Se nota que entiendes el proceso. Sigue practicando para dominar el tema.',
]

const GOOD = [
  'Buen intento. Intenta explicar cada paso con mas detalle para demostrar que entiendes el proceso.',
  'Vas por buen camino. Recuerda mostrar cada operacion y explicar por que la haces.',
]

const KEEP_GOING = [
  'No te rindas. Intenta escribir cada paso de la solucion y explicar que haces en cada uno.',
  'Sigue practicando. Lee los pasos requeridos y trata de explicar cada uno con tus palabras.',
]

export function evaluateShowWork(
  response: string,
  data: ShowWorkData
): EvaluationResult {
  const wordCount = countWords(response)
  const lower = response.toLowerCase()

  // 1. Word count score (20 pts)
  let wordScore = 5
  if (wordCount >= data.minimumWords) wordScore = 20
  else if (wordCount >= data.minimumWords * 0.7) wordScore = 12

  // 2. Key terms found (30 pts)
  const termsFound = data.rubricKeyTerms.filter(term =>
    lower.includes(term.toLowerCase())
  ).length
  const termRatio = data.rubricKeyTerms.length > 0
    ? termsFound / data.rubricKeyTerms.length
    : 0
  const termScore = Math.round(termRatio * 30)

  // 3. Solution steps addressed (35 pts)
  // Check if keywords from each step appear in the response
  const stepsAddressed = data.solutionSteps.filter(step => {
    // Extract key words from step (3+ chars, skip common words)
    const stepWords = step.toLowerCase()
      .replace(/\$[^$]*\$/g, '') // remove LaTeX
      .split(/\s+/)
      .filter(w => w.length >= 3)
      .filter(w => !['que', 'del', 'los', 'las', 'una', 'con', 'para', 'por'].includes(w))
    if (stepWords.length === 0) return true
    // At least 40% of step keywords found
    const found = stepWords.filter(w => lower.includes(w)).length
    return found / stepWords.length >= 0.4
  }).length
  const stepRatio = data.solutionSteps.length > 0
    ? stepsAddressed / data.solutionSteps.length
    : 0
  const stepScore = Math.round(stepRatio * 35)

  // 4. Contains expected answer (15 pts)
  const expectedLower = data.expectedAnswer.toLowerCase()
    .replace(/\s+/g, '')
  const responseCleaned = lower.replace(/\s+/g, '')
  const hasAnswer = responseCleaned.includes(expectedLower) ? 15 : 0

  const score = Math.min(100, wordScore + termScore + stepScore + hasAnswer)

  // Stars & XP
  let stars: number, xpBonus: number
  if (score >= 85) { stars = 5; xpBonus = 30 }
  else if (score >= 75) { stars = 4; xpBonus = 15 }
  else if (score >= 65) { stars = 3; xpBonus = 10 }
  else if (score >= 50) { stars = 2; xpBonus = 0 }
  else { stars = 1; xpBonus = 0 }

  // Feedback
  const strengths: string[] = []
  const improvements: string[] = []

  if (hasAnswer > 0) strengths.push('Has llegado al resultado correcto.')
  if (termRatio >= 0.6) strengths.push('Usas vocabulario matematico adecuado.')
  if (stepRatio >= 0.7) strengths.push('Has cubierto los pasos principales de la solucion.')
  if (wordCount >= data.minimumWords) strengths.push('Tu respuesta tiene buena extension.')

  if (hasAnswer === 0) improvements.push('Asegurate de incluir el resultado final.')
  if (termRatio < 0.5) improvements.push('Usa mas terminos matematicos especificos en tu explicacion.')
  if (stepRatio < 0.6) improvements.push('Desarrolla mas los pasos intermedios de la solucion.')
  if (wordCount < data.minimumWords) improvements.push(`Necesitas escribir mas. Minimo ${data.minimumWords} palabras.`)

  const pool = score >= 75 ? ENCOURAGING : score >= 50 ? GOOD : KEEP_GOING
  const encouragement = pool[Math.floor(Math.random() * pool.length)]

  return {
    score,
    stars,
    strengths: strengths.slice(0, 2),
    improvements: improvements.slice(0, 2),
    encouragement,
    xpBonus,
    wordCount,
  }
}
