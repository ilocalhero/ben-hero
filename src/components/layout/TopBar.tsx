import { motion } from 'framer-motion'
import { Flame, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'
import { usePlayerStore } from '../../stores/usePlayerStore'
import { getXPProgress, getLevelTitle } from '../../lib/xpCalculator'
import { ProgressBar } from '../ui'

export function TopBar() {
  const { name, totalXP, level, streak } = usePlayerStore()
  const xpProgress = getXPProgress(totalXP)
  const levelTitle = getLevelTitle(level)

  return (
    <header
      className="h-[72px] flex items-center px-4 lg:px-6 gap-4 z-50 sticky top-0 flex-shrink-0"
      style={{
        background: 'linear-gradient(180deg, rgba(15,18,36,0.85) 0%, rgba(12,15,30,0.9) 100%)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(0, 212, 255, 0.08)',
        boxShadow: '0 1px 24px rgba(0,0,0,0.5)',
      }}
    >
      {/* Logo */}
      <motion.div
        className="flex-shrink-0 flex items-center gap-2"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center text-base"
          style={{
            background: 'linear-gradient(135deg, #00d4ff33 0%, #b24bff33 100%)',
            border: '1px solid #00d4ff44',
            boxShadow: '0 0 18px #00d4ff44',
          }}
        >
          ⚡
        </div>
        <span
          className="font-black tracking-[0.25em] text-[18px]"
          style={{
            fontFamily: "'Orbitron', sans-serif",
            color: '#00d4ff',
            textShadow: '0 0 14px #00d4ffaa, 0 0 28px #00d4ff44',
          }}
        >
          BENHERO
        </span>
      </motion.div>

      {/* XP Bar (center) */}
      <div className="flex-1 flex flex-col justify-center min-w-0 max-w-sm mx-auto">
        <div className="flex justify-between items-center mb-[5px]">
          <span className="text-xs font-bold text-neon-blue tracking-wide">Nv. {level}</span>
          <span className="text-xs text-text-secondary">
            {xpProgress.current}<span className="text-text-muted"> / {xpProgress.needed} XP</span>
          </span>
        </div>
        <ProgressBar
          value={xpProgress.current}
          max={xpProgress.needed || 1}
          color="blue"
          height={5}
          animated
        />
      </div>

      {/* Right: streak + level badge + mobile avatar */}
      <div className="flex items-center gap-2.5 flex-shrink-0">
        {/* Streak */}
        <motion.div
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full"
          style={{
            background: streak > 0 ? 'rgba(255,107,53,0.12)' : 'rgba(255,255,255,0.04)',
            border: streak > 0 ? '1px solid rgba(255,107,53,0.3)' : '1px solid rgba(255,255,255,0.06)',
          }}
          whileHover={{ scale: 1.05 }}
        >
          <Flame
            size={15}
            className={streak > 0 ? 'text-neon-orange' : 'text-text-muted'}
            style={streak > 0 ? { filter: 'drop-shadow(0 0 5px #ff6b35)' } : undefined}
          />
          <span className={`text-sm font-bold ${streak > 0 ? 'text-neon-orange' : 'text-text-muted'}`}>
            {streak}
          </span>
        </motion.div>

        {/* Level badge (desktop) */}
        <motion.div
          className="hidden sm:flex items-center gap-2 rounded-full px-4 py-1.5"
          style={{
            background: 'linear-gradient(135deg, rgba(0,212,255,0.12) 0%, rgba(178,75,255,0.08) 100%)',
            border: '1px solid rgba(0,212,255,0.25)',
            boxShadow: '0 0 12px rgba(0,212,255,0.1)',
          }}
          whileHover={{ scale: 1.03 }}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Zap size={13} className="text-neon-blue" style={{ filter: 'drop-shadow(0 0 4px #00d4ff)' }} />
          <span className="text-xs font-bold text-neon-blue">{levelTitle}</span>
          <span className="text-xs text-text-muted">·</span>
          <span className="text-xs font-semibold text-white">{totalXP} XP</span>
        </motion.div>

        {/* Mobile avatar */}
        <Link to="/perfil" className="lg:hidden">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-neon-blue"
            style={{
              background: 'rgba(0,212,255,0.12)',
              border: '1px solid rgba(0,212,255,0.3)',
            }}
          >
            {name.charAt(0).toUpperCase()}
          </div>
        </Link>
      </div>
    </header>
  )
}
