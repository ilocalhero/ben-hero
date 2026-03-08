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
    <aside className="hidden lg:flex flex-col w-[240px] bg-bg-secondary border-r border-neon-blue/10 h-full">
      <nav className="flex-1 py-6 px-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `group flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 relative
                ${isActive
                  ? 'bg-neon-blue/10 text-neon-blue border-l-2 border-neon-blue pl-[10px]'
                  : 'text-[#8b8fb0] hover:text-white hover:bg-white/5 border-l-2 border-transparent'
                }`
              }
            >
              {({ isActive }) => (
                <motion.div
                  className="flex items-center gap-3 w-full"
                  whileHover={{ x: isActive ? 0 : 3 }}
                  transition={{ duration: 0.15 }}
                >
                  <Icon
                    size={20}
                    className={isActive ? 'text-neon-blue' : 'text-[#8b8fb0] group-hover:text-white transition-colors'}
                    style={isActive ? { filter: 'drop-shadow(0 0 6px #00d4ff)' } : undefined}
                  />
                  <span className="font-semibold text-sm">{item.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-indicator"
                      className="ml-auto w-1.5 h-1.5 rounded-full bg-neon-blue"
                      style={{ boxShadow: '0 0 6px #00d4ff' }}
                    />
                  )}
                </motion.div>
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* Version info */}
      <div className="px-4 py-4 border-t border-white/5">
        <p className="text-xs text-[#4a4d6a] text-center">BenHero v0.1.0</p>
      </div>
    </aside>
  )
}
