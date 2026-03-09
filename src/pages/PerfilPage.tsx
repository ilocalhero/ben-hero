import { motion } from 'framer-motion'
import { Flame, Star, Zap, Trophy } from 'lucide-react'
import { usePlayerStore } from '../stores/usePlayerStore'
import { getXPProgress, getLevelTitle, LEVELS } from '../lib/xpCalculator'
import { NeonText, ProgressBar, Card } from '../components/ui'

interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: string | number
  color: string
  glowColor: string
}

function StatCard({ icon, label, value, color, glowColor }: StatCardProps) {
  return (
    <Card className="flex flex-col gap-3">
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${glowColor}22`, border: `1px solid ${glowColor}44` }}
      >
        <div style={{ color }}>{icon}</div>
      </div>
      <div>
        <p className="text-xs text-[#8b8fb0] font-semibold">{label}</p>
        <p className="font-black text-white text-2xl lg:text-3xl leading-tight">{value}</p>
      </div>
    </Card>
  )
}

export function PerfilPage() {
  const { name, totalXP, level, streak } = usePlayerStore()
  const xpProgress = getXPProgress(totalXP)
  const levelTitle = getLevelTitle(level)
  const nextLevelXP = LEVELS[level]?.xpRequired ?? totalXP

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center gap-4"
      >
        {/* Avatar */}
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl font-black text-neon-blue flex-shrink-0"
          style={{
            background: '#00d4ff15',
            border: '2px solid #00d4ff55',
            boxShadow: '0 0 32px #00d4ff30',
          }}
        >
          {name.charAt(0).toUpperCase()}
        </div>
        <div>
          <NeonText as="h1" color="blue" className="text-3xl">
            {name}
          </NeonText>
          <p className="text-[#8b8fb0] text-sm mt-0.5">{levelTitle} · Nivel {level}</p>
        </div>
      </motion.div>

      {/* XP Progress */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Card>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Star size={16} className="text-neon-blue" style={{ filter: 'drop-shadow(0 0 4px #00d4ff)' }} />
              <span className="font-bold text-white text-sm">Progreso de nivel</span>
            </div>
            <span className="text-xs text-[#8b8fb0]">Nv. {level} → Nv. {level + 1}</span>
          </div>
          <ProgressBar
            value={xpProgress.current}
            max={xpProgress.needed || 1}
            color="blue"
            height={10}
            animated
          />
          <div className="flex justify-between mt-2 text-xs text-[#8b8fb0]">
            <span>{xpProgress.current} XP</span>
            <span>{xpProgress.needed} XP necesarios</span>
          </div>
          {level < 30 && (
            <p className="text-xs text-[#8b8fb0] mt-1 text-right">
              Faltan {nextLevelXP - totalXP} XP para <span className="text-neon-blue font-semibold">{getLevelTitle(level + 1)}</span>
            </p>
          )}
        </Card>
      </motion.div>

      {/* Stats grid */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-5"
      >
        <StatCard
          icon={<Zap size={20} />}
          label="XP Total"
          value={totalXP.toLocaleString()}
          color="#00d4ff"
          glowColor="#00d4ff"
        />
        <StatCard
          icon={<Flame size={20} />}
          label="Racha actual"
          value={`${streak} días`}
          color="#ff6b35"
          glowColor="#ff6b35"
        />
        <StatCard
          icon={<Star size={20} />}
          label="Nivel"
          value={level}
          color="#ffd700"
          glowColor="#ffd700"
        />
        <StatCard
          icon={<Trophy size={20} />}
          label="Rango"
          value={levelTitle}
          color="#b24bff"
          glowColor="#b24bff"
        />
      </motion.div>
    </div>
  )
}
