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
        <main className="flex-1 overflow-y-auto bg-bg-primary pb-[60px] lg:pb-0">
          <div className="p-4 lg:p-6 max-w-5xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      <BottomNav />
    </div>
  )
}
