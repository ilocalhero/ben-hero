import express from 'express'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import Anthropic from '@anthropic-ai/sdk'
import { Resend } from 'resend'

const __dirname = dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())

// ── Static files ────────────────────────────────────────────────────────────
app.use(express.static(join(__dirname, 'dist')))

// ── POST /api/evaluate ──────────────────────────────────────────────────────
app.post('/api/evaluate', async (req, res) => {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' })
  }

  const { response: studentResponse, prompt, rubricKeyTerms, minimumWords, keyPointsToAddress, playerName } = req.body

  if (!studentResponse || !prompt) {
    return res.status(400).json({ error: 'Missing required fields: response, prompt' })
  }

  const words = studentResponse.trim().split(/\s+/).filter(w => w.length > 1)
  const wordCount = words.length

  const client = new Anthropic({ apiKey })

  const systemPrompt = `You are a supportive and encouraging Spanish history teacher evaluating a student's written response. The student's name is ${playerName}. They are learning about Spanish history and geography through a gamified educational app called "Ben Hero".

Your evaluation should be:
- Warm, encouraging, and age-appropriate (the student is a young learner)
- In Spanish (all feedback should be in Spanish)
- Focused on both content accuracy and writing quality
- Constructive — highlight what they did well and gently suggest improvements

You MUST respond with valid JSON only, no other text. Use this exact structure:
{
  "score": <number 0-100>,
  "stars": <number 1-5>,
  "strengths": ["<strength 1 in Spanish>", "<strength 2 in Spanish>"],
  "improvements": ["<improvement 1 in Spanish>", "<improvement 2 in Spanish>"],
  "encouragement": "<a motivational message in Spanish, personalized to ${playerName}>"
}`

  const userPrompt = `## Writing Mission Prompt
${prompt}

## Key Points to Address
${keyPointsToAddress?.join('\n- ') || 'None specified'}

## Required Key Terms
${rubricKeyTerms.join(', ')}

## Minimum Words Required
${minimumWords} (student wrote ${wordCount})

## Student's Response
${studentResponse}

---

Evaluate this response. Consider:
1. **Content accuracy** (35 points): Did they address the key points and use the required terms correctly?
2. **Word count** (20 points): Did they meet the minimum word count of ${minimumWords}? They wrote ${wordCount} words.
3. **Use of Spanish connectors** (20 points): Did they use connectors like "porque", "además", "sin embargo", "por lo tanto"?
4. **Writing quality** (15 points): Sentence structure, clarity, and coherence.
5. **Effort and creativity** (10 points): Did they go beyond the minimum?

Respond with JSON only.`

  try {
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages: [{ role: 'user', content: userPrompt }],
      system: systemPrompt,
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return res.status(500).json({ error: 'Failed to parse AI response' })
    }

    const evaluation = JSON.parse(jsonMatch[0])

    const result = {
      score: Math.max(0, Math.min(100, Number(evaluation.score) || 0)),
      stars: Math.max(1, Math.min(5, Number(evaluation.stars) || 1)),
      strengths: Array.isArray(evaluation.strengths) ? evaluation.strengths.slice(0, 4) : [],
      improvements: Array.isArray(evaluation.improvements) ? evaluation.improvements.slice(0, 3) : [],
      encouragement: String(evaluation.encouragement || '¡Sigue practicando!'),
      xpBonus: 0,
      wordCount,
    }

    if (result.score >= 80) result.xpBonus = 30
    else if (result.score >= 55) result.xpBonus = 15

    return res.json(result)
  } catch (err) {
    console.error('AI evaluation error:', err)
    return res.status(500).json({ error: 'AI evaluation failed' })
  }
})

// ── POST /api/send-email ────────────────────────────────────────────────────
const NOTIFICATION_EMAILS = [
  'verovr@gmail.com',
  'sean.c.rosales@gmail.com',
]

app.post('/api/send-email', async (req, res) => {
  const resendKey = process.env.RESEND_API_KEY
  if (!resendKey) {
    return res.status(500).json({ error: 'RESEND_API_KEY not configured' })
  }

  const resend = new Resend(resendKey)
  const data = req.body

  const starEmojis = '⭐'.repeat(data.stars) + '☆'.repeat(5 - data.stars)
  const completedDate = new Date(data.completedAt).toLocaleDateString('es-ES', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0a0b1a; color: #c8caeb; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 24px; }
    .header { text-align: center; padding: 24px 0; }
    .header h1 { color: #b24bff; font-size: 28px; margin: 0 0 8px; letter-spacing: 2px; }
    .header p { color: #8b8fb0; font-size: 14px; margin: 0; }
    .card { background: #1a1d3a; border-radius: 16px; padding: 20px; margin-bottom: 16px; border: 1px solid #ffffff10; }
    .score-section { text-align: center; padding: 16px 0; }
    .score { font-size: 48px; font-weight: 900; color: #fff; }
    .stars { font-size: 28px; letter-spacing: 4px; }
    .label { color: #8b8fb0; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600; margin-bottom: 8px; }
    .strength { color: #00ff88; }
    .improvement { color: #ff6b35; }
    .encouragement { border-left: 4px solid #b24bff; background: #b24bff0d; border-radius: 0 12px 12px 0; padding: 16px; margin: 16px 0; font-style: italic; color: #c8caeb; }
    .response-box { background: #12152e; border-radius: 12px; padding: 16px; white-space: pre-wrap; line-height: 1.6; font-size: 14px; color: #c8caeb; border: 1px solid #ffffff08; }
    .stat { text-align: center; background: #12152e; border-radius: 12px; padding: 12px 8px; display: inline-block; width: 45%; margin: 4px; }
    .stat-value { font-size: 24px; font-weight: 900; color: #fff; }
    .stat-label { font-size: 11px; color: #8b8fb0; text-transform: uppercase; }
    .footer { text-align: center; padding: 24px 0; color: #4a4e7a; font-size: 12px; }
    ul { list-style: none; padding: 0; margin: 0; }
    li { padding: 4px 0; }
    li.s::before { content: '✓ '; color: #00ff88; }
    li.i::before { content: '→ '; color: #ff6b35; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>BEN HERO — INFORME DE MISIÓN</h1>
      <p>${data.temaTitle} · ${data.lessonTitle}</p>
    </div>
    <div class="card">
      <div class="label">Estudiante</div>
      <p style="color:#00d4ff;font-weight:700;font-size:18px;margin:4px 0">${data.playerName}</p>
      <p style="color:#8b8fb0;font-size:13px;margin:0">${data.playerEmail} · ${completedDate}</p>
    </div>
    <div class="card score-section">
      <div class="score">${data.score}%</div>
      <div class="stars">${starEmojis}</div>
    </div>
    <div class="card" style="text-align:center">
      <div class="stat"><div class="stat-value" style="color:#ffd700">+${data.xpEarned}</div><div class="stat-label">XP Ganado</div></div>
      <div class="stat"><div class="stat-value" style="color:#00d4ff">${data.wordCount}</div><div class="stat-label">Palabras</div></div>
    </div>
    <div class="encouragement">${data.encouragement}</div>
    ${data.strengths?.length ? `<div class="card"><div class="label strength">Puntos Fuertes</div><ul>${data.strengths.map(s => `<li class="s">${s}</li>`).join('')}</ul></div>` : ''}
    ${data.improvements?.length ? `<div class="card"><div class="label improvement">Áreas de Mejora</div><ul>${data.improvements.map(s => `<li class="i">${s}</li>`).join('')}</ul></div>` : ''}
    <div class="card">
      <div class="label">Respuesta del Estudiante</div>
      <div class="response-box">${data.writtenResponse}</div>
    </div>
    <div class="footer">Ben Hero — Aprende historia de España como un héroe</div>
  </div>
</body>
</html>`

  const subject = `Ben Hero — ${data.playerName} completó una misión (${data.score}%) — ${data.temaTitle}`

  try {
    const { error } = await resend.emails.send({
      from: 'Ben Hero <onboarding@resend.dev>',
      to: NOTIFICATION_EMAILS,
      subject,
      html,
    })

    if (error) {
      console.error('Resend error:', error)
      return res.status(500).json({ error: 'Failed to send email' })
    }

    return res.json({ success: true })
  } catch (err) {
    console.error('Email send error:', err)
    return res.status(500).json({ error: 'Email sending failed' })
  }
})

// ── SPA fallback ────────────────────────────────────────────────────────────
app.get('*', (_req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'))
})

app.listen(PORT, () => {
  console.log(`Ben Hero server running on port ${PORT}`)
})
