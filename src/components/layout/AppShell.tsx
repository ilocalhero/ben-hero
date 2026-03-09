import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { usePlayerStore } from '../../stores/usePlayerStore'
import { useProgressStore } from '../../stores/useProgressStore'
import { TopBar } from './TopBar'
import { Sidebar } from './Sidebar'
import { BottomNav } from './BottomNav'

export function AppShell() {
  const { load: loadPlayer, resetStreakIfNeeded } = usePlayerStore()
  const { load: loadProgress } = useProgressStore()

  useEffect(() => {
    loadPlayer()
    loadProgress()
    resetStreakIfNeeded()
  }, [loadPlayer, loadProgress, resetStreakIfNeeded])

  return (
    <div className="flex flex-col h-screen bg-bg-primary overflow-hidden">
      <TopBar />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        {/* Main content */}
        <main className="flex-1 overflow-y-auto bg-bg-primary pb-[70px] lg:pb-0 main-gradient-mesh">
          <div className="px-6 py-6 lg:px-8 lg:py-8 max-w-[1200px] mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>

      <BottomNav />
    </div>
  )
}
