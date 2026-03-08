import type { WritingMissionData } from '../types/tema'
import type { EvaluationResult } from '../types/gamification'

const SPANISH_CONNECTORS = [
  'porque', 'además', 'sin embargo', 'por lo tanto', 'en primer lugar',
  'en segundo lugar', 'por otro lado', 'finalmente', 'en conclusión',
  'por ejemplo', 'es decir', 'aunque', 'también', 'asimismo',
  'no obstante', 'de hecho', 'por ello', 'gracias a', 'a pesar de',
]

const ENCOURAGING_MESSAGES = [
  '¡Eres un guerrero de las palabras! Cada misión te hace más fuerte.',
  '¡Excelente trabajo, campeón! Tu pluma es tu mejor arma.',
  '¡Sigue así! Los grandes historiadores empezaron igual que tú.',
  '¡Victoria! Cada respuesta te acerca a ser un Rey Sabio.',
  '¡Increíble! Eres el escritor más épico de la historia.',
  '¡Brutal! Tu respuesta merece estar en los libros de historia.',
]

const GOOD_MESSAGES = [
  '¡Bien hecho! Con un poco más de detalle serás imparable.',
  '¡Buen trabajo, guerrero! Añade más ejemplos y subirás de nivel.',
  '¡Vas por buen camino! La próxima vez intenta conectar mejor tus ideas.',
]

const KEEP_GOING_MESSAGES = [
  '¡No te rindas! Cada intento te hace más sabio.',
  '¡Sigue practicando! Los grandes conquistadores nunca se rinden.',
  '¡Puedes hacerlo mejor! Mira las pistas y vuelve a intentarlo.',
]

export function evaluateWriting(
  response: string,
  missionData: WritingMissionData
): EvaluationResult {
  const words = response.trim().split(/\s+/).filter(w => w.length > 1)
  const wordCount = words.length
  const sentences = response.split(/[.!?]+/).filter(s => s.trim().length > 0)
  const lowerResponse = response.toLowerCase()

  let score = 0
  const strengths: string[] = []
  const improvements: string[] = []

  // 1. Word count (30 points)
  const minWords = missionData.minimumWords
  if (wordCount >= minWords) {
    score += 30
    strengths.push(`Escribiste ${wordCount} palabras — ¡cumpliste el mínimo!`)
  } else if (wordCount >= minWords * 0.7) {
    score += 15
    improvements.push(`Intenta escribir al menos ${minWords} palabras. Llevas ${wordCount}.`)
  } else {
    score += 5
    improvements.push(`Necesitas desarrollar más tu respuesta. Mínimo ${minWords} palabras.`)
  }

  // 2. Key terms (35 points)
  const foundTerms = missionData.rubricKeyTerms.filter(term =>
    lowerResponse.includes(term.toLowerCase())
  )
  const termScore = Math.round((foundTerms.length / Math.max(missionData.rubricKeyTerms.length, 1)) * 35)
  score += termScore
  if (foundTerms.length > 0) {
    strengths.push(`Usaste correctamente: ${foundTerms.slice(0, 3).join(', ')}`)
  }
  const missingTerms = missionData.rubricKeyTerms.filter(t => !lowerResponse.includes(t.toLowerCase()))
  if (missingTerms.length > 0 && improvements.length < 2) {
    improvements.push(`Intenta incluir: ${missingTerms.slice(0, 2).join(', ')}`)
  }

  // 3. Connectors (20 points)
  const usedConnectors = SPANISH_CONNECTORS.filter(c => lowerResponse.includes(c))
  if (usedConnectors.length >= 3) {
    score += 20
    strengths.push(`Excelente uso de conectores: "${usedConnectors.slice(0, 2).join('", "')}"`)
  } else if (usedConnectors.length >= 1) {
    score += 10
    strengths.push(`Usaste conectores: "${usedConnectors[0]}" — ¡bien!`)
    if (improvements.length < 2) improvements.push('Añade más conectores como: además, sin embargo, por lo tanto')
  } else {
    if (improvements.length < 2) improvements.push('Usa conectores para enlazar tus ideas: porque, además, sin embargo...')
  }

  // 4. Sentence structure (15 points)
  const avgLen = wordCount / Math.max(sentences.length, 1)
  if (sentences.length >= 3 && avgLen >= 5 && avgLen <= 25) {
    score += 15
  } else if (sentences.length >= 2) {
    score += 8
  }

  // Stars
  const stars = score >= 85 ? 5 : score >= 70 ? 4 : score >= 55 ? 3 : score >= 35 ? 2 : 1

  // Encouragement
  let encouragement: string
  let xpBonus = 0
  if (score >= 80) {
    encouragement = ENCOURAGING_MESSAGES[Math.floor(Math.random() * ENCOURAGING_MESSAGES.length)]
    xpBonus = 30
  } else if (score >= 55) {
    encouragement = GOOD_MESSAGES[Math.floor(Math.random() * GOOD_MESSAGES.length)]
    xpBonus = 15
  } else {
    encouragement = KEEP_GOING_MESSAGES[Math.floor(Math.random() * KEEP_GOING_MESSAGES.length)]
    xpBonus = 0
  }

  return { score, stars, strengths, improvements, encouragement, xpBonus, wordCount }
}
