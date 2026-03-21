import { Resend } from 'resend'
import type { Request, Response } from 'express'

interface ActivityReport {
  id: string
  title: string
  type: string
  score: number
  xpReward: number
}

interface WritingReport {
  title: string
  score: number
  wordCount: number
  completedAt: string
}

interface TemaReportBody {
  temaId: string
  temaTitle: string
  temaNumber: number
  temaCategory: string
  playerName: string
  playerLevel: number
  playerXP: number
  playerStreak: number
  lessonsCompleted: number
  totalLessons: number
  activities: ActivityReport[]
  writingRecords: WritingReport[]
}

const RECIPIENTS = [
  'sean.c.rosales@gmail.com',
  'verovr@gmail.com',
]

function getTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    quiz: 'Quiz',
    fill_blank: 'Rellenar huecos',
    writing_mission: 'Mision escrita',
  }
  return labels[type] ?? type
}

function getScoreColor(score: number): string {
  if (score >= 80) return '#00ff88'
  if (score >= 65) return '#ffd700'
  return '#ff6b35'
}

function getScoreEmoji(score: number): string {
  if (score >= 90) return '🌟'
  if (score >= 80) return '⭐'
  if (score >= 65) return '👍'
  if (score >= 50) return '📝'
  return '💪'
}

function getStarBar(score: number): string {
  const filled = score >= 80 ? 3 : score >= 50 ? 2 : 1
  return '★'.repeat(filled) + '☆'.repeat(3 - filled)
}

function buildEmailHTML(data: TemaReportBody): string {
  const avgScore = data.activities.length > 0
    ? Math.round(data.activities.reduce((sum, a) => sum + a.score, 0) / data.activities.length)
    : 0

  const totalXP = data.activities.reduce((sum, a) => sum + a.xpReward, 0)

  const quizzes = data.activities.filter(a => a.type === 'quiz')
  const fillBlanks = data.activities.filter(a => a.type === 'fill_blank')
  const writings = data.activities.filter(a => a.type === 'writing_mission')

  const quizAvg = quizzes.length > 0 ? Math.round(quizzes.reduce((s, a) => s + a.score, 0) / quizzes.length) : null
  const fillAvg = fillBlanks.length > 0 ? Math.round(fillBlanks.reduce((s, a) => s + a.score, 0) / fillBlanks.length) : null
  const writingAvg = writings.length > 0 ? Math.round(writings.reduce((s, a) => s + a.score, 0) / writings.length) : null

  const categoryEmoji = data.temaCategory === 'historia' ? '📜' : '🌍'
  const overallEmoji = avgScore >= 80 ? '🏆' : avgScore >= 65 ? '⭐' : '📚'

  const activityRows = data.activities.map(a => `
    <tr>
      <td style="padding: 12px 16px; border-bottom: 1px solid #1e2248; color: #e8eaff; font-size: 14px;">
        ${getTypeLabel(a.type)}
      </td>
      <td style="padding: 12px 16px; border-bottom: 1px solid #1e2248; color: #c0c4e0; font-size: 14px;">
        ${a.title}
      </td>
      <td style="padding: 12px 16px; border-bottom: 1px solid #1e2248; text-align: center;">
        <span style="color: ${getScoreColor(a.score)}; font-weight: 800; font-size: 16px;">${a.score}%</span>
      </td>
      <td style="padding: 12px 16px; border-bottom: 1px solid #1e2248; text-align: center; color: #ffd700; font-size: 13px;">
        ${getStarBar(a.score)}
      </td>
    </tr>
  `).join('')

  const writingSection = data.writingRecords.length > 0 ? `
    <div style="margin-top: 32px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
        <tr>
          <td style="padding: 20px 24px; background: linear-gradient(135deg, #1a0e38, #120828); border-radius: 16px 16px 0 0; border: 1px solid #b24bff44; border-bottom: none;">
            <h2 style="margin: 0; color: #b24bff; font-size: 16px; text-transform: uppercase; letter-spacing: 2px;">
              ✍️ Misiones de Escritura — Detalle
            </h2>
          </td>
        </tr>
        <tr>
          <td style="padding: 0 24px 20px; background: #12152e; border-radius: 0 0 16px 16px; border: 1px solid #b24bff44; border-top: none;">
            ${data.writingRecords.map(w => `
              <div style="margin-top: 16px; padding: 16px; background: #1a1d3a; border-radius: 12px; border: 1px solid #ffffff10;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                  <span style="color: #e8eaff; font-weight: 700; font-size: 15px;">${w.title}</span>
                </div>
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="color: #8b8fb0; font-size: 13px; padding: 4px 0;">Puntuacion</td>
                    <td style="text-align: right; font-weight: 800; font-size: 16px; color: ${getScoreColor(w.score)}; padding: 4px 0;">${w.score}% ${getScoreEmoji(w.score)}</td>
                  </tr>
                  <tr>
                    <td style="color: #8b8fb0; font-size: 13px; padding: 4px 0;">Palabras escritas</td>
                    <td style="text-align: right; color: #00d4ff; font-weight: 600; font-size: 14px; padding: 4px 0;">${w.wordCount}</td>
                  </tr>
                  <tr>
                    <td style="color: #8b8fb0; font-size: 13px; padding: 4px 0;">Fecha</td>
                    <td style="text-align: right; color: #8b8fb0; font-size: 13px; padding: 4px 0;">${new Date(w.completedAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                  </tr>
                </table>
              </div>
            `).join('')}
          </td>
        </tr>
      </table>
    </div>
  ` : ''

  const categoryBreakdown = [
    quizAvg !== null ? `<tr>
      <td style="padding: 10px 16px; color: #c0c4e0; font-size: 14px; border-bottom: 1px solid #1e2248;">🧠 Quizzes</td>
      <td style="padding: 10px 16px; text-align: center; color: ${getScoreColor(quizAvg)}; font-weight: 800; font-size: 16px; border-bottom: 1px solid #1e2248;">${quizAvg}%</td>
      <td style="padding: 10px 16px; text-align: center; color: #8b8fb0; font-size: 13px; border-bottom: 1px solid #1e2248;">${quizzes.length} completado${quizzes.length !== 1 ? 's' : ''}</td>
    </tr>` : '',
    fillAvg !== null ? `<tr>
      <td style="padding: 10px 16px; color: #c0c4e0; font-size: 14px; border-bottom: 1px solid #1e2248;">✏️ Rellenar huecos</td>
      <td style="padding: 10px 16px; text-align: center; color: ${getScoreColor(fillAvg)}; font-weight: 800; font-size: 16px; border-bottom: 1px solid #1e2248;">${fillAvg}%</td>
      <td style="padding: 10px 16px; text-align: center; color: #8b8fb0; font-size: 13px; border-bottom: 1px solid #1e2248;">${fillBlanks.length} completado${fillBlanks.length !== 1 ? 's' : ''}</td>
    </tr>` : '',
    writingAvg !== null ? `<tr>
      <td style="padding: 10px 16px; color: #c0c4e0; font-size: 14px;">✍️ Escritura</td>
      <td style="padding: 10px 16px; text-align: center; color: ${getScoreColor(writingAvg)}; font-weight: 800; font-size: 16px;">${writingAvg}%</td>
      <td style="padding: 10px 16px; text-align: center; color: #8b8fb0; font-size: 13px;">${writings.length} completado${writings.length !== 1 ? 's' : ''}</td>
    </tr>` : '',
  ].filter(Boolean).join('')

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #080918; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #080918;">
    <tr>
      <td align="center" style="padding: 32px 16px;">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%;">

          <!-- Header -->
          <tr>
            <td style="padding: 32px 24px; text-align: center; background: linear-gradient(135deg, #0a0b1a 0%, #12152e 100%); border-radius: 20px 20px 0 0; border: 1px solid #00d4ff33; border-bottom: none;">
              <div style="font-size: 13px; font-weight: 900; letter-spacing: 4px; color: #00d4ff; text-transform: uppercase; margin-bottom: 4px;">⚡ BENHERO</div>
              <h1 style="margin: 12px 0 4px; color: #ffd700; font-size: 28px; font-weight: 900; letter-spacing: 1px;">
                ${overallEmoji} TEMA COMPLETADO
              </h1>
              <p style="margin: 0; color: #8b8fb0; font-size: 15px;">
                ${data.playerName} ha completado un tema
              </p>
            </td>
          </tr>

          <!-- Tema Card -->
          <tr>
            <td style="padding: 0 24px; background: #0d0f22; border-left: 1px solid #00d4ff33; border-right: 1px solid #00d4ff33;">
              <div style="margin: 24px 0; padding: 24px; background: linear-gradient(135deg, #1a1d3a, #1e1040); border-radius: 16px; border: 1px solid #b24bff44;">
                <div style="font-size: 11px; font-weight: 800; color: #b24bff; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 8px;">
                  ${categoryEmoji} Tema ${data.temaNumber} · ${data.temaCategory}
                </div>
                <h2 style="margin: 0 0 16px; color: #ffffff; font-size: 24px; font-weight: 900;">
                  ${data.temaTitle}
                </h2>

                <!-- Stats Grid -->
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td width="25%" style="padding: 12px 8px; text-align: center; background: #0a0b1a; border-radius: 12px;">
                      <div style="color: ${getScoreColor(avgScore)}; font-size: 28px; font-weight: 900; line-height: 1;">${avgScore}%</div>
                      <div style="color: #8b8fb0; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; margin-top: 4px;">Media</div>
                    </td>
                    <td width="4%"></td>
                    <td width="25%" style="padding: 12px 8px; text-align: center; background: #0a0b1a; border-radius: 12px;">
                      <div style="color: #ffd700; font-size: 28px; font-weight: 900; line-height: 1;">+${totalXP}</div>
                      <div style="color: #8b8fb0; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; margin-top: 4px;">XP</div>
                    </td>
                    <td width="4%"></td>
                    <td width="21%" style="padding: 12px 8px; text-align: center; background: #0a0b1a; border-radius: 12px;">
                      <div style="color: #00d4ff; font-size: 28px; font-weight: 900; line-height: 1;">Nv.${data.playerLevel}</div>
                      <div style="color: #8b8fb0; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; margin-top: 4px;">Nivel</div>
                    </td>
                    <td width="4%"></td>
                    <td width="17%" style="padding: 12px 8px; text-align: center; background: #0a0b1a; border-radius: 12px;">
                      <div style="color: #ff6b35; font-size: 28px; font-weight: 900; line-height: 1;">${data.playerStreak}d</div>
                      <div style="color: #8b8fb0; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; margin-top: 4px;">Racha</div>
                    </td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>

          <!-- Category Breakdown -->
          <tr>
            <td style="padding: 0 24px; background: #0d0f22; border-left: 1px solid #00d4ff33; border-right: 1px solid #00d4ff33;">
              <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                <tr>
                  <td style="padding: 16px 24px; background: linear-gradient(135deg, #0e1a1a, #0a1414); border-radius: 16px 16px 0 0; border: 1px solid #00ff8844; border-bottom: none;">
                    <h2 style="margin: 0; color: #00ff88; font-size: 14px; text-transform: uppercase; letter-spacing: 2px;">
                      📊 Rendimiento por Tipo
                    </h2>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 0; background: #12152e; border-radius: 0 0 16px 16px; border: 1px solid #00ff8844; border-top: none;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                      ${categoryBreakdown}
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Activity Detail Table -->
          <tr>
            <td style="padding: 0 24px; background: #0d0f22; border-left: 1px solid #00d4ff33; border-right: 1px solid #00d4ff33;">
              <div style="margin-top: 24px;">
                <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                  <tr>
                    <td style="padding: 16px 24px; background: linear-gradient(135deg, #0e0e1e, #12152e); border-radius: 16px 16px 0 0; border: 1px solid #00d4ff44; border-bottom: none;">
                      <h2 style="margin: 0; color: #00d4ff; font-size: 14px; text-transform: uppercase; letter-spacing: 2px;">
                        📋 Detalle de Actividades
                      </h2>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 0; background: #12152e; border-radius: 0 0 16px 16px; border: 1px solid #00d4ff44; border-top: none;">
                      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                        <tr style="background: #0a0b1a;">
                          <th style="padding: 10px 16px; text-align: left; color: #8b8fb0; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #1e2248;">Tipo</th>
                          <th style="padding: 10px 16px; text-align: left; color: #8b8fb0; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #1e2248;">Actividad</th>
                          <th style="padding: 10px 16px; text-align: center; color: #8b8fb0; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #1e2248;">Nota</th>
                          <th style="padding: 10px 16px; text-align: center; color: #8b8fb0; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #1e2248;">★</th>
                        </tr>
                        ${activityRows}
                      </table>
                    </td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>

          <!-- Writing Detail -->
          <tr>
            <td style="padding: 0 24px; background: #0d0f22; border-left: 1px solid #00d4ff33; border-right: 1px solid #00d4ff33;">
              ${writingSection}
            </td>
          </tr>

          <!-- Lessons -->
          <tr>
            <td style="padding: 0 24px 24px; background: #0d0f22; border-left: 1px solid #00d4ff33; border-right: 1px solid #00d4ff33;">
              <div style="margin-top: 24px; padding: 16px 20px; background: #1a1d3a; border-radius: 12px; border: 1px solid #ffffff10;">
                <span style="color: #8b8fb0; font-size: 13px;">📖 Lecciones completadas:</span>
                <span style="color: #00d4ff; font-weight: 800; font-size: 15px; margin-left: 8px;">${data.lessonsCompleted} / ${data.totalLessons}</span>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px; text-align: center; background: linear-gradient(135deg, #0a0b1a 0%, #12152e 100%); border-radius: 0 0 20px 20px; border: 1px solid #00d4ff33; border-top: none;">
              <p style="margin: 0; color: #4a4e6e; font-size: 12px;">
                BenHero · Aprende historia y geografia de Espana
              </p>
              <p style="margin: 4px 0 0; color: #2a2d50; font-size: 11px;">
                Reporte automatico generado al completar un tema
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

export async function sendTemaReportHandler(req: Request, res: Response) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    res.status(500).json({ error: 'resend_not_configured' })
    return
  }

  const body = req.body as Partial<TemaReportBody>
  if (!body?.temaId || !body?.temaTitle || !body?.activities) {
    res.status(400).json({ error: 'bad_request' })
    return
  }

  const data = body as TemaReportBody
  const html = buildEmailHTML(data)

  const avgScore = data.activities.length > 0
    ? Math.round(data.activities.reduce((sum, a) => sum + a.score, 0) / data.activities.length)
    : 0

  const emoji = avgScore >= 80 ? '🏆' : avgScore >= 65 ? '⭐' : '📚'

  try {
    const resend = new Resend(apiKey)
    await resend.emails.send({
      from: 'BenHero <noreply@ilocalhero.com>',
      to: RECIPIENTS,
      subject: `${emoji} ${data.playerName} completo Tema ${data.temaNumber}: ${data.temaTitle} (${avgScore}%)`,
      html,
    })

    res.status(200).json({ success: true })
  } catch (err) {
    console.error('Resend error:', err)
    res.status(503).json({ error: 'email_failed' })
  }
}
