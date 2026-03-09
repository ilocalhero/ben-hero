import type React from 'react'
import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, BookOpen, User, Target, Zap, Flame } from 'lucide-react'
import { usePlayerStore } from '../../stores/usePlayerStore'
import { getXPProgress, getLevelTitle } from '../../lib/xpCalculator'
import { ProgressBar } from '../ui'

interface NavItem {
  label: string
  path: string
  icon: React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Inicio', path: '/', icon: Home },
  { label: 'Misiones', path: '/daily', icon: Target },
  { label: 'Mis Temas', path: '/temas', icon: BookOpen },
  { label: 'Perfil', path: '/perfil', icon: User },
]

export function Sidebar() {
  const { name, totalXP, level, streak } = usePlayerStore()
  const xpProgress = getXPProgress(totalXP)
  const levelTitle = getLevelTitle(level)

  return (
    <aside
      className="hidden lg:flex flex-col w-[240px] h-full flex-shrink-0"
      style={{
        background: 'linear-gradient(180deg, #0c0f20 0%, #090b18 100%)',
        borderRight: '1px solid rgba(0, 212, 255, 0.08)',
      }}
    >
      {/* Player Identity */}
      <div className="px-5 pt-5 pb-4 space-y-4">
        <div className="flex items-center gap-3">
          <div
            className="w-[52px] h-[52px] rounded-2xl flex items-center justify-center text-xl font-black text-neon-blue flex-shrink-0"
            style={{
              background: 'rgba(0,212,255,0.12)',
              border: '1px solid rgba(0,212,255,0.3)',
              boxShadow: '0 0 20px rgba(0,212,255,0.18)',
            }}
          >
            {name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-text-primary text-[15px] truncate">{name}</p>
            <p className="text-[11px] text-text-secondary">Nv. {level} · {levelTitle}</p>
          </div>
        </div>

        <ProgressBar
          value={xpProgress.current}
          max={xpProgress.needed || 1}
          color="blue"
          height={4}
          animated
        />

        <div className="flex items-center gap-5">
          <div className="flex items-center gap-1.5">
            <Zap size={13} style={{ color: '#00d4ff', filter: 'drop-shadow(0 0 4px #00d4ff)' }} />
            <span className="text-xs font-bold text-neon-blue">{totalXP} XP</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Flame
              size={13}
              style={{ color: streak > 0 ? '#ff6b35' : '#4a4e6e', filter: streak > 0 ? 'drop-shadow(0 0 4px #ff6b35)' : undefined }}
            />
            <span className="text-xs font-bold" style={{ color: streak > 0 ? '#ff6b35' : '#4a4e6e' }}>
              {streak}d
            </span>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-5 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1.5">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className="block"
            >
              {({ isActive }) => (
                <motion.div
                  className="relative flex items-center gap-3 px-5 py-2.5 rounded-xl cursor-pointer transition-colors duration-150"
                  style={
                    isActive
                      ? {
                          background: 'linear-gradient(90deg, rgba(0,212,255,0.14) 0%, rgba(0,212,255,0.04) 100%)',
                          border: '1px solid rgba(0,212,255,0.2)',
                          boxShadow: 'inset 0 0 20px rgba(0,212,255,0.04)',
                        }
                      : {
                          border: '1px solid transparent',
                        }
                  }
                  whileHover={isActive ? {} : {
                    backgroundColor: 'rgba(255,255,255,0.04)',
                  }}
                  transition={{ duration: 0.15 }}
                >
                  {/* Active left accent */}
                  {isActive && (
                    <div
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-7 rounded-full"
                      style={{ background: '#00d4ff', boxShadow: '0 0 12px #00d4ff, 0 0 24px #00d4ff55' }}
                    />
                  )}

                  <Icon
                    size={22}
                    style={
                      isActive
                        ? { color: '#00d4ff', filter: 'drop-shadow(0 0 6px #00d4ff)' }
                        : { color: '#5a5e80' }
                    }
                  />
                  <span
                    className="text-[15px] font-semibold"
                    style={{ color: isActive ? '#e8eaff' : '#5a5e80' }}
                  >
                    {item.label}
                  </span>

                  {isActive && (
                    <motion.div
                      layoutId="sidebar-dot"
                      className="ml-auto w-2 h-2 rounded-full"
                      style={{ background: '#00d4ff', boxShadow: '0 0 8px #00d4ff' }}
                    />
                  )}
                </motion.div>
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* Branding */}
      <div
        className="px-4 py-3 mx-4 mb-5 rounded-xl text-center"
        style={{
          background: 'linear-gradient(135deg, rgba(0,212,255,0.04) 0%, rgba(178,75,255,0.03) 100%)',
          border: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        <p className="text-xs text-text-muted font-medium tracking-wider font-orbitron">BENHERO v0.1</p>
      </div>
    </aside>
  )
}
