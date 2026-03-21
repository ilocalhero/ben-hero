import type { PlayerState } from '../types/player'

interface ActivityReportData {
  id: string
  title: string
  type: string
  score: number
  xpReward: number
}

interface TemaData {
  id: string
  title: string
  number: number
  category: string
  activities: { id: string; title: string; type: string; xpReward: number }[]
  lessons: { id: string }[]
}

export async function sendTemaReport(
  tema: TemaData,
  activityScores: Record<string, number>,
  completedLessons: Record<string, boolean>,
  player: PlayerState,
) {
  const activities: ActivityReportData[] = tema.activities
    .filter(a => activityScores[a.id] !== undefined)
    .map(a => ({
      id: a.id,
      title: a.title,
      type: a.type,
      score: activityScores[a.id],
      xpReward: a.xpReward,
    }))

  const lessonsCompleted = tema.lessons.filter(l => completedLessons[l.id]).length

  const writingRecords: { title: string; score: number; wordCount: number; completedAt: string }[] = []
  const temaWritingHistory = player.writingHistory[tema.id] ?? []
  for (const record of temaWritingHistory) {
    const activity = tema.activities.find(a => a.id === record.activityId)
    writingRecords.push({
      title: activity?.title ?? record.activityId,
      score: record.score,
      wordCount: record.wordCount,
      completedAt: record.completedAt,
    })
  }

  try {
    const resp = await fetch('/api/send-tema-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        temaId: tema.id,
        temaTitle: tema.title,
        temaNumber: tema.number,
        temaCategory: tema.category,
        playerName: player.name,
        playerLevel: player.level,
        playerXP: player.totalXP,
        playerStreak: player.streak,
        lessonsCompleted,
        totalLessons: tema.lessons.length,
        activities,
        writingRecords,
      }),
    })
    if (!resp.ok) {
      console.error('Tema report failed:', resp.status)
    }
  } catch (err) {
    console.error('Tema report error:', err)
  }
}
