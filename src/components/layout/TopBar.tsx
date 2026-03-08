import { motion } from 'framer-motion'
import { Flame, Star } from 'lucide-react'
import { usePlayerStore } from '../../stores/usePlayerStore'
import { getXPProgress, getLevelTitle } from '../../lib/xpCalculator'
import { ProgressBar } from '../ui'

export function TopBar() {
  const { totalXP, level, streak } = usePlayerStore()
  const xpProgress = getXPProgress(totalXP)
  const levelTitle = getLevelTitle(level)

  return (
    <header className="h-[60px] flex items-center px-4 gap-4 bg-bg-secondary border-b border-neon-blue/20 z-50 sticky top-0">
      {/* Logo */}
      <motion.div
        className="flex-shrink-0 font-black text-xl tracking-widest text-neon-blue"
        style={{
          textShadow: '0 0 12px #00d4ff, 0 0 24px #00d4ff66',
          letterSpacing: '0.15em',
        }}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
      >
        BENHERO
      </motion.div>

      {/* XP Bar (center) */}
      <div className="flex-1 flex flex-col justify-center min-w-0 max-w-xs mx-auto">
        <div className="flex justify-between text-xs text-[#8b8fb0] mb-1">
          <span className="font-semibold text-neon-blue">Nv. {level}</span>
          <span>{xpProgress.current} / {xpProgress.needed} XP</span>
        </div>
        <ProgressBar
          value={xpProgress.current}
          max={xpProgress.needed || 1}
          color="blue"
          height={6}
          animated
        />
      </div>

      {/* Right: streak + level badge */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {/* Streak */}
        <motion.div
          className="flex items-center gap-1"
          whileHover={{ scale: 1.05 }}
        >
          <Flame
            size={18}
            className={streak > 0 ? 'text-neon-orange' : 'text-[#4a4d6a]'}
            style={streak > 0 ? { filter: 'drop-shadow(0 0 6px #ff6b35)' } : undefined}
          />
          <span className={`text-sm font-bold ${streak > 0 ? 'text-neon-orange' : 'text-[#4a4d6a]'}`}>
            {streak}
          </span>
        </motion.div>

        {/* Level badge */}
        <motion.div
          className="flex items-center gap-1.5 bg-[#00d4ff15] border border-neon-blue/30 rounded-full px-2.5 py-1"
          whileHover={{ scale: 1.03 }}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Star size={12} className="text-neon-blue" />
          <span className="text-xs font-bold text-neon-blue hidden sm:inline">{levelTitle}</span>
          <span className="text-xs text-[#8b8fb0] hidden sm:inline">·</span>
          <span className="text-xs font-semibold text-white">{totalXP} XP</span>
        </motion.div>
      </div>
    </header>
  )
}
