import { useEffect, useRef } from 'react'
import { Outlet } from 'react-router-dom'
import { usePlayerStore } from '../../stores/usePlayerStore'
import { useProgressStore } from '../../stores/useProgressStore'
import { useAuthStore } from '../../stores/useAuthStore'
import { TEMAS } from '../../data'
import { sendTemaReport } from '../../lib/sendTemaReport'
import { TopBar } from './TopBar'
import { Sidebar } from './Sidebar'
import { BottomNav } from './BottomNav'

export function AppShell() {
  const { load: loadPlayer, resetStreakIfNeeded } = usePlayerStore()
  const { load: loadProgress } = useProgressStore()
  const { load: loadAuth } = useAuthStore()
  const checkedRef = useRef(false)

  useEffect(() => {
    loadAuth()
    loadPlayer()
    loadProgress()
    resetStreakIfNeeded()
  }, [loadAuth, loadPlayer, loadProgress, resetStreakIfNeeded])

  // Retroactive: detect temas where all activities are done but completedTemas wasn't set
  useEffect(() => {
    if (checkedRef.current) return
    checkedRef.current = true
    // Small delay to ensure stores are loaded
    const timer = setTimeout(() => {
      const progress = useProgressStore.getState()
      const player = usePlayerStore.getState()
      for (const tema of TEMAS) {
        if (progress.completedTemas[tema.id]) continue
        const allDone = tema.activities.every(a => progress.completedActivities[a.id])
        if (allDone && tema.activities.length > 0) {
          useProgressStore.getState().completeTema(tema.id)
          sendTemaReport(tema, progress.activityScores, progress.completedLessons, player)
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
