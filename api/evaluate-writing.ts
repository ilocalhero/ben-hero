import Anthropic from '@anthropic-ai/sdk'
import type { Request, Response } from 'express'

interface RequestBody {
  mode?: 'writing' | 'show_work'
  answer: string
  prompt: string
  keyPoints: string[]
  rubricKeyTerms: string[]
  minimumWords: number
  expectedAnswer?: string
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
  if (score >= 80) return { stars: 5, xpBonus: 50 }
  if (score >= 65) return { stars: 4, xpBonus: 30 }
  if (score >= 55) return { stars: 3, xpBonus: 15 }
  if (score >= 40) return { stars: 2, xpBonus: 5 }
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

  const { answer, prompt, keyPoints, rubricKeyTerms = [], minimumWords = 50, mode = 'writing', expectedAnswer = '' } = body

  const wordCount = countWords(answer)

  // Short-circuit for very short answers — saves API cost
  if (wordCount < minimumWords * 0.5) {
    const score = Math.round((wordCount / minimumWords) * 30)
    const { stars, xpBonus } = scoreToStarsAndXP(score)
    const result: EvaluationResult = {
      score,
      stars,
      strengths: wordCount > 0 ? ['Has empezado a escribir — ¡buen comienzo!'] : [],
      improvements: [`Intenta escribir un poco más — llevas ${wordCount} palabras y necesitas ${minimumWords}. ¡Usa los iniciadores de frases para ayudarte!`],
      encouragement: mode === 'show_work'
        ? '¡Buen intento! Prueba a mostrar cada paso — vas por buen camino.'
        : '¡Buen intento! Usa los iniciadores de frases y el vocabulario — están ahí para ayudarte. ¡Cada palabra cuenta!',
      xpBonus,
      wordCount,
    }
    res.status(200).json(result)
    return
  }

  const client = new Anthropic({ apiKey })

  const keyPointsList = keyPoints.map((p, i) => `${i + 1}. ${p}`).join('\n')

  const isShowWork = mode === 'show_work'

  const userPrompt = isShowWork
    ? `PROBLEMA: ${prompt}

PASOS ESPERADOS EN LA SOLUCIÓN:
${keyPointsList}

RESPUESTA CORRECTA: ${expectedAnswer}

TÉRMINOS MATEMÁTICOS CLAVE: ${rubricKeyTerms.join(', ')}

SOLUCIÓN DEL ALUMNO:
${answer}

INSTRUCCIONES DE EVALUACIÓN:
Sé exigente pero justo. Ben tiene 13 años y necesita aprender a resolver problemas paso a paso. No regales puntos.

RÚBRICA (100 puntos):
1. PROCEDIMIENTO (40 pts): ¿Muestra TODOS los pasos de la solución? ¿Están en orden lógico?
   - Todos los pasos correctos y ordenados = 35-40 pts
   - La mayoría de pasos correctos = 20-34 pts
   - Solo algunos pasos o desordenados = 10-19 pts
   - Falta la mayoría de pasos = 0-9 pts

2. RESULTADO (20 pts): ¿Llega a la respuesta correcta?
   - Resultado correcto y bien expresado = 18-20 pts
   - Resultado cercano o con error menor = 10-17 pts
   - Resultado incorrecto = 0-9 pts

3. EXPLICACIÓN (25 pts): ¿Explica POR QUÉ hace cada operación? No basta con escribir números — debe razonar.
   - Explica cada paso con claridad = 20-25 pts
   - Explica algunos pasos = 10-19 pts
   - Solo escribe operaciones sin explicar = 0-9 pts

4. VOCABULARIO MATEMÁTICO (15 pts): ¿Usa términos matemáticos correctamente?
   - Usa términos clave en contexto = 12-15 pts
   - Algunos términos usados = 6-11 pts
   - No usa vocabulario específico = 0-5 pts

IMPORTANTE:
- Si solo escribe el resultado sin mostrar pasos, máximo 25.
- Si copia los pasos sin explicarlos con sus palabras, máximo 45.
- Una respuesta de 65+ requiere pasos claros, resultado correcto, y explicación del razonamiento.

- strengths: 2 cosas específicas que hizo bien (en español)
- improvements: 2 áreas concretas donde debe mejorar (en español, con ejemplo concreto)
- encouragement: mensaje motivador estilo videojuego en español

Devuelve EXACTAMENTE este JSON:
{"score": <0-100>, "strengths": ["..."], "improvements": ["..."], "encouragement": "..."}`
    : `PREGUNTA: ${prompt}

PUNTOS CLAVE A CUBRIR:
${keyPointsList}

TÉRMINOS CLAVE: ${rubricKeyTerms.join(', ')}

RESPUESTA DEL ALUMNO:
${answer}

INSTRUCCIONES DE EVALUACIÓN:
Ben tiene 13 años y está aprendiendo a escribir textos de historia. La app le ofrece iniciadores de frases, vocabulario y conectores para ayudarle — usar esas herramientas es BUENO y debe ser recompensado, no penalizado. Evalúa con generosidad el esfuerzo.

RÚBRICA (100 puntos):
1. CONTENIDO (35 pts): ¿Menciona los puntos clave? Mencionar + añadir un breve comentario propio = puntuación alta.
   - Toca todos o casi todos los puntos con algo de desarrollo = 28-35 pts
   - Cubre la mayoría de puntos = 18-27 pts
   - Menciona algunos puntos = 10-17 pts
   - Apenas toca el tema = 0-9 pts

2. VOCABULARIO (25 pts): ¿Usa los términos clave? Usarlos en una frase = genial. Solo mencionarlos = aceptable.
   - La mayoría de términos usados en frases = 20-25 pts
   - Varios términos usados = 12-19 pts
   - Algunos términos mencionados = 5-11 pts
   - Ningún término = 0-4 pts

3. ESFUERZO Y DESARROLLO (25 pts): ¿Se nota que lo intentó? ¿Usó los iniciadores Y añadió algo propio? ¿Usó conectores? ¿Escribió más del mínimo?
   - Usó iniciadores + añadió contenido propio + conectores = 20-25 pts
   - Usó iniciadores + algo de contenido propio = 12-19 pts
   - Usó iniciadores con añadidos mínimos = 6-11 pts
   - Solo pegó texto sin ningún esfuerzo = 0-5 pts

4. ESTRUCTURA (15 pts): ¿Tiene algún orden? No necesita ser perfecto — solo que fluya.
   - Se nota alguna organización (intro, cuerpo, cierre) = 12-15 pts
   - Flujo básico = 6-11 pts
   - Sin ningún orden = 0-5 pts

GUÍA DE PUNTUACIÓN:
- Si usó los iniciadores y añadió CUALQUIER cosa propia → mínimo 50 pts.
- Si menciona los puntos clave y usa vocabulario → mínimo 60 pts.
- Una respuesta de 55+ significa que Ben se esforzó y aprendió algo.
- Sé generoso: estamos motivando a un chico de 13 años a que le guste escribir.

- strengths: 2 cosas específicas que hizo bien (celebra el esfuerzo, en español)
- improvements: 1 sugerencia concreta y alcanzable (NO "desarrolla más" — di exactamente qué añadir, ej: "Prueba añadir por qué los visigodos estaban débiles")
- encouragement: mensaje celebratorio estilo videojuego en español — hazle sentir que lo está logrando

Devuelve EXACTAMENTE este JSON:
{"score": <0-100>, "strengths": ["...", "..."], "improvements": ["..."], "encouragement": "..."}`

  try {
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 768,
      system: isShowWork
        ? `Eres un profesor exigente pero motivador de Matemáticas para estudiantes de 2.º ESO (13 años).
Evalúa la solución del alumno con rigor matemático — no regales puntos. Devuelve ÚNICAMENTE JSON válido, sin texto adicional.
El alumno se llama Ben. Necesita aprender a mostrar su trabajo y explicar su razonamiento matemático paso a paso.
El tono debe ser motivador pero exigente — como un entrenador que sabe que Ben puede dar más.`
        : `Eres un profesor amable y motivador de Historia de España para un estudiante de 2.º ESO (13 años).
Evalúa la respuesta del alumno con generosidad — premia el esfuerzo. Devuelve ÚNICAMENTE JSON válido, sin texto adicional.
El alumno se llama Ben. Le cuesta escribir, así que cada intento es un logro. La app le da iniciadores de frases, vocabulario y conectores — usarlos bien es positivo.
Tu tono debe ser como un mentor que celebra cada paso adelante. Si Ben se esforzó, que se note en la puntuación.`,
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
