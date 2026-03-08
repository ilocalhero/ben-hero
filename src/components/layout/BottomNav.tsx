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
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50"
      style={{
        background: 'linear-gradient(180deg, #0c0f20 0%, #09091a 100%)',
        borderTop: '1px solid rgba(0,212,255,0.1)',
        boxShadow: '0 -4px 24px rgba(0,0,0,0.5)',
      }}
    >
      <div className="flex items-center justify-around h-[58px] px-2">
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
                  className="flex flex-col items-center gap-1 py-2"
                  whileTap={{ scale: 0.9 }}
                >
                  <div
                    className="flex items-center justify-center w-8 h-6 rounded-lg transition-all"
                    style={isActive ? { background: 'rgba(0,212,255,0.12)' } : undefined}
                  >
                    <Icon
                      size={18}
                      style={
                        isActive
                          ? { color: '#00d4ff', filter: 'drop-shadow(0 0 6px #00d4ff)' }
                          : { color: '#3a3e5c' }
                      }
                    />
                  </div>
                  <span
                    className="text-[9px] font-bold tracking-wide uppercase"
                    style={
                      isActive
                        ? { color: '#00d4ff', textShadow: '0 0 8px #00d4ff66' }
                        : { color: '#3a3e5c' }
                    }
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
