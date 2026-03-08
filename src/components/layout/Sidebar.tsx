import type React from 'react'
import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, BookOpen, User } from 'lucide-react'

interface NavItem {
  label: string
  path: string
  icon: React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Inicio', path: '/', icon: Home },
  { label: 'Mis Temas', path: '/temas', icon: BookOpen },
  { label: 'Perfil', path: '/perfil', icon: User },
]

export function Sidebar() {
  return (
    <aside
      className="hidden lg:flex flex-col w-[220px] h-full flex-shrink-0"
      style={{
        background: 'linear-gradient(180deg, #0c0f20 0%, #090b18 100%)',
        borderRight: '1px solid rgba(0, 212, 255, 0.08)',
      }}
    >
      <nav className="flex-1 py-5 px-3 space-y-1">
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
                  className="relative flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-colors duration-150"
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
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full"
                      style={{ background: '#00d4ff', boxShadow: '0 0 8px #00d4ff' }}
                    />
                  )}

                  <Icon
                    size={18}
                    style={
                      isActive
                        ? { color: '#00d4ff', filter: 'drop-shadow(0 0 6px #00d4ff)' }
                        : { color: '#5a5e80' }
                    }
                  />
                  <span
                    className="text-sm font-semibold"
                    style={{ color: isActive ? '#e8eaff' : '#5a5e80' }}
                  >
                    {item.label}
                  </span>

                  {isActive && (
                    <motion.div
                      layoutId="sidebar-dot"
                      className="ml-auto w-1.5 h-1.5 rounded-full"
                      style={{ background: '#00d4ff', boxShadow: '0 0 6px #00d4ff' }}
                    />
                  )}
                </motion.div>
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* Version info */}
      <div
        className="px-4 py-3 mx-3 mb-4 rounded-xl text-center"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
      >
        <p className="text-[11px] text-text-muted font-medium tracking-wider">BenHero v0.1.0</p>
      </div>
    </aside>
  )
}
