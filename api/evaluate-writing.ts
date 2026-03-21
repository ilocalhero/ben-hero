import Anthropic from '@anthropic-ai/sdk'
import type { Request, Response } from 'express'

interface RequestBody {
  answer: string
  prompt: string
  keyPoints: string[]
  rubricKeyTerms: string[]
  minimumWords: number
}

interface EvaluationResult {
  score: number
  stars: number
  strengths: string[]
  improvements: string[]
  encouragement: string
  xpBonus: number
  wordCount: number
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(w => w.length > 1).length
}

function scoreToStarsAndXP(score: number): { stars: number; xpBonus: number } {
  if (score >= 85) return { stars: 5, xpBonus: 50 }
  if (score >= 75) return { stars: 4, xpBonus: 30 }
  if (score >= 65) return { stars: 3, xpBonus: 15 }
  if (score >= 50) return { stars: 2, xpBonus: 0 }
  return { stars: 1, xpBonus: 0 }
}

export async function evaluateWritingHandler(req: Request, res: Response) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    res.status(500).json({ error: 'config' })
    return
  }

  const body = req.body as Partial<RequestBody>
  if (!body?.answer || !body?.prompt || !Array.isArray(body?.keyPoints)) {
    res.status(400).json({ error: 'bad_request' })
    return
  }

  const { answer, prompt, keyPoints, rubricKeyTerms = [], minimumWords = 50 } = body

  const wordCount = countWords(answer)

  // Short-circuit for very short answers — saves API cost
  if (wordCount < minimumWords * 0.5) {
    const score = Math.round((wordCount / minimumWords) * 30)
    const { stars, xpBonus } = scoreToStarsAndXP(score)
    const result: EvaluationResult = {
      score,
      stars,
      strengths: [],
      improvements: [`Necesitas desarrollar más tu respuesta. Llevas ${wordCount} palabras, el mínimo es ${minimumWords}.`],
      encouragement: '¡Sigue practicando! Los grandes historiadores nunca se rinden. ¡Escribe más y subirás de nivel!',
      xpBonus,
      wordCount,
    }
    res.status(200).json(result)
    return
  }

  const client = new Anthropic({ apiKey })

  const keyPointsList = keyPoints.map((p, i) => `${i + 1}. ${p}`).join('\n')

  const userPrompt = `PREGUNTA: ${prompt}

PUNTOS CLAVE A CUBRIR:
${keyPointsList}

TÉRMINOS CLAVE DEL RÚBRICA: ${rubricKeyTerms.join(', ')}

RESPUESTA DEL ALUMNO:
${answer}

INSTRUCCIONES DE EVALUACIÓN:
Sé exigente pero justo. Ben tiene 13 años y necesita aprender a escribir bien. No regales puntos.

RÚBRICA (100 puntos):
1. CONTENIDO (40 pts): ¿Cubre TODOS los puntos clave con detalle? No basta con mencionarlos — debe EXPLICARLOS.
   - Todos cubiertos con explicación = 35-40 pts
   - Algunos cubiertos bien = 20-34 pts
   - Solo menciona sin explicar = 10-19 pts
   - Falta la mayoría = 0-9 pts

2. VOCABULARIO (25 pts): ¿Usa los términos clave de forma contextual y correcta?
   - Todos usados correctamente en contexto = 20-25 pts
   - Algunos usados bien = 10-19 pts
   - Solo los menciona sin contexto = 5-9 pts
   - No usa vocabulario específico = 0-4 pts

3. ESTRUCTURA Y CONECTORES (20 pts): ¿Tiene introducción, desarrollo y conclusión? ¿Usa conectores?
   - Estructura clara con conectores variados = 16-20 pts
   - Estructura básica con algunos conectores = 8-15 pts
   - Sin estructura clara = 0-7 pts

4. EXPRESIÓN ESCRITA (15 pts): ¿Las frases tienen sentido? ¿Son propias o solo copian los iniciadores?
   - Frases propias, bien construidas = 12-15 pts
   - Mezcla de frases propias y copiadas = 6-11 pts
   - Solo copia iniciadores sin añadir nada = 0-5 pts

IMPORTANTE:
- Si el alumno solo pega los iniciadores de frases sin desarrollarlos, la puntuación máxima es 30.
- Si no explica los puntos clave (solo los lista), máximo 50.
- Una respuesta de 65+ requiere explicaciones reales y vocabulario en contexto.

- strengths: 2 cosas específicas que hizo bien (en español)
- improvements: 2 áreas concretas donde debe mejorar (en español, con ejemplo de qué podría escribir)
- encouragement: mensaje motivador estilo videojuego en español — reconoce el esfuerzo pero empújale a mejorar

Devuelve EXACTAMENTE este JSON:
{"score": <0-100>, "strengths": ["..."], "improvements": ["..."], "encouragement": "..."}`

  try {
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 768,
      system: `Eres un profesor exigente pero motivador de Historia de España para estudiantes de 2.º ESO (13 años).
Evalúa la respuesta del alumno con rigor académico — no regales puntos. Devuelve ÚNICAMENTE JSON válido, sin texto adicional.
El alumno se llama Ben. Necesita mejorar su escritura, así que sé honesto en el feedback: señala exactamente qué falta y cómo mejorarlo.
El tono debe ser motivador pero exigente — como un entrenador que sabe que Ben puede dar más.`,
      messages: [{ role: 'user', content: userPrompt }],
    })

    const raw = message.content[0].type === 'text' ? message.content[0].text : ''
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      res.status(503).json({ error: 'ai_unavailable' })
      return
    }

    const parsed = JSON.parse(jsonMatch[0]) as {
      score: unknown
      strengths: unknown
      improvements: unknown
      encouragement: unknown
    }

    if (
      typeof parsed.score !== 'number' ||
      !Array.isArray(parsed.strengths) ||
      !Array.isArray(parsed.improvements) ||
      typeof parsed.encouragement !== 'string'
    ) {
      res.status(503).json({ error: 'ai_unavailable' })
      return
    }

    const score = Math.max(0, Math.min(100, Math.round(parsed.score)))
    const { stars, xpBonus } = scoreToStarsAndXP(score)

    const result: EvaluationResult = {
      score,
      stars,
      strengths: (parsed.strengths as string[]).slice(0, 2),
      improvements: (parsed.improvements as string[]).slice(0, 2),
      encouragement: parsed.encouragement as string,
      xpBonus,
      wordCount,
    }

    res.status(200).json(result)
  } catch (err) {
    console.error('Anthropic API error:', err)
    res.status(503).json({ error: 'ai_unavailable' })
  }
}
