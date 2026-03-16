import type { VercelRequest, VercelResponse } from '@vercel/node'
import { Resend } from 'resend'

interface MissionEmailBody {
  playerName: string
  playerEmail: string
  temaTitle: string
  lessonTitle: string
  writtenResponse: string
  score: number
  stars: number
  strengths: string[]
  improvements: string[]
  encouragement: string
  xpEarned: number
  wordCount: number
  completedAt: string
}

const NOTIFICATION_EMAILS = [
  'verovr@gmail.com',
  'sean.c.rosales@gmail.com',
]

function buildEmailHtml(data: MissionEmailBody): string {
  const starEmojis = '⭐'.repeat(data.stars) + '☆'.repeat(5 - data.stars)

  return `
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
    .stat-row { display: flex; gap: 12px; }
    .stat { flex: 1; text-align: center; background: #12152e; border-radius: 12px; padding: 12px 8px; }
    .stat-value { font-size: 24px; font-weight: 900; color: #fff; }
    .stat-label { font-size: 11px; color: #8b8fb0; text-transform: uppercase; }
    .footer { text-align: center; padding: 24px 0; color: #4a4e7a; font-size: 12px; }
    ul { list-style: none; padding: 0; margin: 0; }
    li { padding: 4px 0; }
    li::before { content: '✓ '; }
    .improvement li::before { content: '→ '; }
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
      <p style="color: #00d4ff; font-weight: 700; font-size: 18px; margin: 4px 0;">${data.playerName}</p>
      <p style="color: #8b8fb0; font-size: 13px; margin: 0;">${data.playerEmail} · ${new Date(data.completedAt).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
    </div>

    <div class="card score-section">
      <div class="score">${data.score}%</div>
      <div class="stars">${starEmojis}</div>
    </div>

    <div class="card" style="display: flex; gap: 12px;">
      <div class="stat">
        <div class="stat-value" style="color: #ffd700;">+${data.xpEarned}</div>
        <div class="stat-label">XP Ganado</div>
      </div>
      <div class="stat">
        <div class="stat-value" style="color: #00d4ff;">${data.wordCount}</div>
        <div class="stat-label">Palabras</div>
      </div>
    </div>

    <div class="encouragement">
      ${data.encouragement}
    </div>

    ${data.strengths.length > 0 ? `
    <div class="card">
      <div class="label strength">Puntos Fuertes</div>
      <ul class="strength">
        ${data.strengths.map(s => `<li>${s}</li>`).join('')}
      </ul>
    </div>
    ` : ''}

    ${data.improvements.length > 0 ? `
    <div class="card">
      <div class="label improvement">Áreas de Mejora</div>
      <ul class="improvement">
        ${data.improvements.map(s => `<li>${s}</li>`).join('')}
      </ul>
    </div>
    ` : ''}

    <div class="card">
      <div class="label">Respuesta del Estudiante</div>
      <div class="response-box">${data.writtenResponse}</div>
    </div>

    <div class="footer">
      Ben Hero — Aprende historia de España como un héroe 🏰
    </div>
  </div>
</body>
</html>
`
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const resendKey = process.env.RESEND_API_KEY
  if (!resendKey) {
    return res.status(500).json({ error: 'RESEND_API_KEY not configured' })
  }

  const resend = new Resend(resendKey)
  const data = req.body as MissionEmailBody

  if (!data.playerName || !data.score === undefined) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  const html = buildEmailHtml(data)
  const subject = `🏰 Ben Hero — ${data.playerName} completó una misión (${data.score}%) — ${data.temaTitle}`

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

    return res.status(200).json({ success: true })
  } catch (err: unknown) {
    console.error('Email send error:', err)
    return res.status(500).json({ error: 'Email sending failed' })
  }
}
