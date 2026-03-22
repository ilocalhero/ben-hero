import { useEffect, useRef } from 'react'
import { Outlet } from 'react-router-dom'
import { usePlayerStore } from '../../stores/usePlayerStore'
import { useProgressStore } from '../../stores/useProgressStore'
import { useAuthStore } from '../../stores/useAuthStore'
import { TEMAS } from '../../data'
import { sendTemaReport } from '../../lib/sendTemaReport'
import { isPassing } from '../../lib/passingThresholds'
import { saveToStorage } from '../../lib/storage'
import { pullAndMerge, initStoreSync } from '../../lib/syncClient'
import { TopBar } from './TopBar'
import { Sidebar } from './Sidebar'
import { BottomNav } from './BottomNav'

export function AppShell() {
  const { load: loadPlayer, resetStreakIfNeeded } = usePlayerStore()
  const { load: loadProgress } = useProgressStore()
  const { load: loadAuth } = useAuthStore()
  const checkedRef = useRef(false)

  const email = useAuthStore(s => s.email)

  useEffect(() => {
    loadAuth()
    loadPlayer()
    loadProgress()
    resetStreakIfNeeded()
  }, [loadAuth, loadPlayer, loadProgress, resetStreakIfNeeded])

  // Sync with server after local stores are loaded
  useEffect(() => {
    if (!email) return
    pullAndMerge(email)
    initStoreSync(email)
  }, [email])

  // Retroactive: detect temas where all activities are done but completedTemas wasn't set
  useEffect(() => {
    if (checkedRef.current) return
    checkedRef.current = true
    // Small delay to ensure stores are loaded
    const timer = setTimeout(() => {
      const progress = useProgressStore.getState()
      const player = usePlayerStore.getState()

      // First pass: un-complete any activities with failing scores
      for (const tema of TEMAS) {
        for (const a of tema.activities) {
          if (
            progress.completedActivities[a.id] &&
            !isPassing(a.type, progress.activityScores[a.id] ?? 0)
          ) {
            useProgressStore.getState().uncompleteActivity(a.id)
          }
        }
      }

      // Second pass: un-complete any wrongly completed temas, or complete new ones
      const freshProgress = useProgressStore.getState()
      for (const tema of TEMAS) {
        const allDone = tema.activities.length > 0 && tema.activities.every(a =>
          freshProgress.completedActivities[a.id] &&
          isPassing(a.type, freshProgress.activityScores[a.id] ?? 0)
        )
        if (freshProgress.completedTemas[tema.id] && !allDone) {
          // Wrongly marked complete — un-mark it
          const { [tema.id]: _, ...rest } = freshProgress.completedTemas
          useProgressStore.setState({ completedTemas: rest })
          saveToStorage('progress', { ...useProgressStore.getState(), completedTemas: rest })
        } else if (!freshProgress.completedTemas[tema.id] && allDone) {
          useProgressStore.getState().completeTema(tema.id)
          sendTemaReport(tema, freshProgress.activityScores, freshProgress.completedLessons, player)
        }
      }

      // Third pass: retroactive bonus check for completed temas with 80%+ average
      const latestProgress = useProgressStore.getState()
      for (const tema of TEMAS) {
        if (!latestProgress.completedTemas[tema.id]) continue
        if (latestProgress.temaBonuses?.[tema.id]) continue
        if (tema.activities.length === 0) continue
        const scores = tema.activities.map(a => latestProgress.activityScores[a.id] ?? 0)
        const avg = scores.reduce((s, v) => s + v, 0) / scores.length
        if (avg >= 80) {
          useProgressStore.getState().awardTemaBonus(tema.id)
          usePlayerStore.getState().addXP(250)
        }
      }
    }, 2000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="flex flex-col h-screen bg-bg-primary overflow-hidden">
      <TopBar />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        {/* Main content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-bg-primary pb-[70px] lg:pb-0 main-gradient-mesh">
          <div className="px-6 py-6 lg:px-8 lg:py-8 max-w-[1200px] mx-auto w-full min-w-0">
            <Outlet />
          </div>
        </main>
      </div>

      <BottomNav />
    </div>
  )
}
