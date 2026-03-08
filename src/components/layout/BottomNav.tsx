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
  { label: 'Temas', path: '/temas', icon: BookOpen },
  { label: 'Perfil', path: '/perfil', icon: User },
]

export function BottomNav() {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-bg-secondary border-t border-neon-blue/20">
      <div className="flex items-center justify-around h-[60px] px-2">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className="flex-1"
            >
              {({ isActive }) => (
                <motion.div
                  className="flex flex-col items-center gap-0.5 py-2"
                  whileTap={{ scale: 0.92 }}
                >
                  <Icon
                    size={22}
                    className={isActive ? 'text-neon-blue' : 'text-[#4a4d6a]'}
                    style={isActive ? { filter: 'drop-shadow(0 0 8px #00d4ff)' } : undefined}
                  />
                  <span
                    className={`text-[10px] font-semibold transition-colors ${
                      isActive ? 'text-neon-blue' : 'text-[#4a4d6a]'
                    }`}
                    style={isActive ? { textShadow: '0 0 8px #00d4ff' } : undefined}
                  >
                    {item.label}
                  </span>
                </motion.div>
              )}
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
