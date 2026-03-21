import { motion } from 'framer-motion'
import { Lock, Trophy } from 'lucide-react'
import { PRIZES } from '../data/prizes'
import { usePlayerStore } from '../stores/usePlayerStore'
import { LEVELS } from '../lib/xpCalculator'
import { NeonText } from '../components/ui'

export function AwardsPage() {
  const { level, totalXP } = usePlayerStore()

  return (
    <div className="max-w-2xl mx-auto px-0 py-6 space-y-6">
      <div className="text-center space-y-1">
        <NeonText color="yellow" as="h1" className="text-3xl font-black">
          Premios
        </NeonText>
        <p className="text-[#8b8fb0] text-sm">
          Nivel {level} · {totalXP.toLocaleString()} XP
        </p>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div
          className="absolute left-6 top-0 bottom-0 w-0.5"
          style={{ background: 'linear-gradient(180deg, #00d4ff44, #b24bff44, #ffd70044)' }}
        />

        {PRIZES.map((prize, i) => {
          const unlocked = level >= prize.level
          const nextPrize = !unlocked && (i === 0 || level >= PRIZES[i - 1].level)
          const prizeXP = LEVELS[Math.min(prize.level - 1, LEVELS.length - 1)]?.xpRequired ?? 0
          const xpRemaining = Math.max(0, prizeXP - totalXP)
          const prevLevelXP = i > 0
            ? LEVELS[Math.min(PRIZES[i - 1].level - 1, LEVELS.length - 1)]?.xpRequired ?? 0
            : 0
          const segmentTotal = prizeXP - prevLevelXP
          const segmentProgress = segmentTotal > 0
            ? Math.min(100, Math.max(0, Math.round(((totalXP - prevLevelXP) / segmentTotal) * 100)))
            : 0

          return (
            <motion.div
              key={prize.level}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              className="relative pl-16 pb-8 last:pb-0"
            >
              {/* Node on timeline */}
              <div
                className="absolute left-[14px] w-[30px] h-[30px] rounded-full flex items-center justify-center border-2 z-10"
                style={
                  unlocked
                    ? {
                        background: 'linear-gradient(135deg, #ffd700, #ff6b35)',
                        borderColor: '#ffd700',
                        boxShadow: '0 0 16px #ffd70066',
                      }
                    : nextPrize
                      ? {
                          background: '#1a1d3a',
                          borderColor: '#00d4ff',
                          boxShadow: '0 0 12px #00d4ff44',
                        }
                      : {
                          background: '#0a0b1a',
                          borderColor: '#2a2d50',
                        }
                }
              >
                {unlocked ? (
                  <Trophy size={14} className="text-[#0a0b1a]" />
                ) : (
                  <Lock size={12} style={{ color: nextPrize ? '#00d4ff' : '#2a2d50' }} />
                )}
              </div>

              {/* Card */}
              <div
                className="rounded-2xl overflow-hidden border transition-all"
                style={
                  unlocked
                    ? {
                        borderColor: '#ffd70044',
                        boxShadow: '0 0 24px #ffd70022',
                      }
                    : nextPrize
                      ? {
                          borderColor: '#00d4ff33',
                          boxShadow: '0 0 16px #00d4ff11',
                        }
                      : {
                          borderColor: '#ffffff08',
                        }
                }
              >
                {/* Prize image */}
                <div className="relative">
                  <img
                    src={prize.image}
                    alt={prize.title}
                    className="w-full object-cover"
                    style={{ height: '26rem', ...(unlocked ? {} : { filter: 'grayscale(0.7) brightness(0.4)' }) }}
                  />
                  {/* Level badge */}
                  <div
                    className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider"
                    style={
                      unlocked
                        ? { background: '#ffd700', color: '#0a0b1a' }
                        : { background: '#0a0b1acc', color: '#8b8fb0', border: '1px solid #ffffff15' }
                    }
                  >
                    Nivel {prize.level}
                  </div>
                  {unlocked && (
                    <div
                      className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider"
                      style={{ background: '#00ff88', color: '#0a0b1a' }}
                    >
                      Desbloqueado
                    </div>
                  )}
                  {!unlocked && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Lock size={48} className="text-[#ffffff30]" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div
                  className="p-4 space-y-2"
                  style={{ background: unlocked ? '#1a1d3a' : '#0d0f22' }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{prize.emoji}</span>
                    <h3
                      className="text-lg font-black"
                      style={{ color: unlocked ? '#ffd700' : '#e8eaff' }}
                    >
                      {prize.title}
                    </h3>
                  </div>
                  <p className="text-sm" style={{ color: '#8b8fb0' }}>
                    {prize.description}
                  </p>

                  {/* Progress bar for next prize */}
                  {nextPrize && (
                    <div className="space-y-1 pt-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-[#00d4ff] font-bold">
                          {segmentProgress}%
                        </span>
                        <span className="text-[#8b8fb0]">
                          {xpRemaining.toLocaleString()} XP restantes
                        </span>
                      </div>
                      <div className="h-2 rounded-full overflow-hidden" style={{ background: '#0a0b1a' }}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${segmentProgress}%` }}
                          transition={{ delay: 0.5 + i * 0.1, duration: 0.8, ease: 'easeOut' }}
                          className="h-full rounded-full"
                          style={{
                            background: 'linear-gradient(90deg, #00d4ff, #b24bff)',
                            boxShadow: '0 0 8px #00d4ff66',
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {unlocked && (
                    <div className="flex items-center gap-1.5 pt-1">
                      <div className="w-2 h-2 rounded-full bg-[#00ff88]" />
                      <span className="text-[#00ff88] text-xs font-bold uppercase tracking-wider">
                        Premio ganado
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
