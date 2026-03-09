import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Zap, ChevronRight, BookOpen, Flame, CheckCircle, Trophy, Target, Check, Clock } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { TEMAS } from '../data'
import { NeonText, Badge, ProgressBar, StatCard } from '../components/ui'
import { useProgressStore } from '../stores/useProgressStore'
import { usePlayerStore } from '../stores/usePlayerStore'
import { getLevelTitle } from '../lib/xpCalculator'
import { getTemaEmoji } from '../lib/temaIcons'

const categoryColor = (cat: string) => cat === 'historia' ? 'orange' : 'green' as const

const springTransition = { type: 'spring' as const, stiffness: 300, damping: 22 }

function SectionHeader({ icon, label, color }: { icon: React.ReactNode; label: string; color: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-1 h-6 rounded-full" style={{ background: color, boxShadow: `0 0 10px ${color}` }} />
      <h2 className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-text-muted">
        <span style={{ color }}>{icon}</span>
        {label}
      </h2>
    </div>
  )
}

export function HomePage() {
  const navigate = useNavigate()
  const { dailyMissionCompleted, completedActivities, activityScores, completedTemas, getTemaProgress } = useProgressStore()
  const { name, streak, level, totalXP } = usePlayerStore()
  const levelTitle = getLevelTitle(level)

  const completedTemasCount = Object.keys(completedTemas).length

  // Find first incomplete tema for "Continue Learning"
  const currentTema = useMemo(() => {
    for (const tema of TEMAS) {
      const progress = getTemaProgress(tema.id, tema.activities.length)
      if (progress < 100) return { tema, progress }
    }
    return TEMAS.length > 0 ? { tema: TEMAS[0], progress: getTemaProgress(TEMAS[0].id, TEMAS[0].activities.length) } : null
  }, [completedActivities, getTemaProgress])

  // Recent completed activities
  const recentActivities = useMemo(() => {
    const activities: { title: string; temaTitle: string; xp: number; score: number }[] = []
    for (const tema of TEMAS) {
      for (const act of tema.activities) {
        if (completedActivities[act.id]) {
          activities.push({
            title: act.title,
            temaTitle: tema.title,
            xp: act.xpReward,
            score: activityScores[act.id] ?? 0,
          })
        }
      }
    }
    return activities.slice(-5).reverse()
  }, [completedActivities, activityScores])

  return (
    <div className="space-y-8 lg:space-y-10">

      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <NeonText as="h1" color="blue" className="text-3xl lg:text-4xl mb-2 font-black tracking-tight">
          ¡Hola, {name}!
        </NeonText>
        <p className="text-text-secondary text-sm lg:text-base">Listo para conquistar la historia de España</p>
      </motion.div>

      {/* ── Hero Banner — Daily Mission ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <button
          onClick={() => !dailyMissionCompleted && navigate('/daily')}
          disabled={dailyMissionCompleted}
          className="w-full text-left rounded-3xl relative overflow-hidden group transition-transform duration-200 hover:scale-[1.005] active:scale-[0.995] disabled:scale-100 disabled:cursor-default"
          style={{
            minHeight: '160px',
            background: dailyMissionCompleted
              ? 'linear-gradient(135deg, #0d1a1a 0%, #0a1414 50%, #0f1818 100%)'
              : 'linear-gradient(135deg, #1e0e38 0%, #180838 30%, #120828 60%, #0e0620 100%)',
            border: dailyMissionCompleted ? '1px solid rgba(0,255,136,0.15)' : '1px solid rgba(178,75,255,0.25)',
            boxShadow: dailyMissionCompleted
              ? '0 16px 48px rgba(0,0,0,0.6)'
              : '0 16px 80px rgba(0,0,0,0.7), 0 0 80px rgba(178,75,255,0.12)',
          }}
        >
          {/* Top accent line */}
          <div
            className="absolute top-0 left-8 right-8 h-px"
            style={{
              background: dailyMissionCompleted
                ? 'linear-gradient(90deg, transparent, rgba(0,255,136,0.6), transparent)'
                : 'linear-gradient(90deg, transparent, rgba(178,75,255,0.8), transparent)',
            }}
          />

          {/* Ambient glow blob */}
          {!dailyMissionCompleted && (
            <div
              className="absolute -top-10 -right-10 w-64 h-64 rounded-full opacity-20 pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(178,75,255,0.4) 0%, transparent 70%)' }}
            />
          )}

          {/* Shimmer on hover */}
          {!dailyMissionCompleted && (
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 shimmer rounded-3xl" />
          )}

          <div className="relative flex flex-col lg:flex-row lg:items-center gap-6 p-6 lg:p-8">
            {/* Large icon */}
            <div
              className="w-20 h-20 lg:w-24 lg:h-24 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={
                dailyMissionCompleted
                  ? {
                      background: 'rgba(0,255,136,0.1)',
                      border: '1px solid rgba(0,255,136,0.25)',
                      boxShadow: '0 0 40px rgba(0,255,136,0.2)',
                    }
                  : {
                      background: 'rgba(178,75,255,0.15)',
                      border: '1px solid rgba(178,75,255,0.35)',
                      boxShadow: '0 0 48px rgba(178,75,255,0.3)',
                    }
              }
            >
              {dailyMissionCompleted
                ? <CheckCircle size={40} className="text-neon-green" style={{ filter: 'drop-shadow(0 0 12px #00ff88)' }} />
                : <Zap size={40} className="text-neon-purple" style={{ filter: 'drop-shadow(0 0 12px #b24bff)' }} />
              }
            </div>

            {/* Text content */}
            <div className="flex-1 min-w-0">
              <span
                className="text-xs font-black uppercase tracking-widest"
                style={{ color: dailyMissionCompleted ? '#00ff88' : '#b24bff' }}
              >
                {dailyMissionCompleted ? '✓ Misión Completada' : 'Misión del Día'}
              </span>
              <p className="font-black text-white text-2xl lg:text-4xl leading-tight mt-2">
                {dailyMissionCompleted ? '¡Bien hecho! Vuelve mañana' : 'Completa tu lección de hoy'}
              </p>
              <p className="text-text-secondary mt-2.5 text-sm lg:text-lg">
                {dailyMissionCompleted ? 'Has ganado tu recompensa diaria' : '+150 XP de recompensa · ~15-20 minutos'}
              </p>
            </div>

            {/* CTA Button */}
            {!dailyMissionCompleted && (
              <div className="flex-shrink-0">
                <div
                  className="px-8 py-4 rounded-xl font-black text-sm uppercase tracking-wider text-white"
                  style={{
                    background: 'linear-gradient(135deg, #b24bff 0%, #7a1bd2 100%)',
                    boxShadow: '0 0 32px rgba(178,75,255,0.4), 0 4px 16px rgba(0,0,0,0.4)',
                  }}
                >
                  Jugar Ahora
                </div>
              </div>
            )}
          </div>
        </button>
      </motion.div>

      {/* ── Stats Row ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
      >
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={<Zap size={22} />} label="XP Total" value={totalXP.toLocaleString()} color="#00d4ff" />
          <StatCard icon={<Trophy size={22} />} label="Nivel" value={levelTitle} color="#b24bff" subtitle={`Nv. ${level}`} />
          <StatCard icon={<Flame size={22} />} label="Racha" value={`${streak}d`} color={streak > 0 ? '#ff6b35' : '#4a4e6e'} />
          <StatCard icon={<Target size={22} />} label="Completados" value={`${completedTemasCount}/${TEMAS.length}`} color="#00ff88" />
        </div>
      </motion.div>

      {/* ── Continue Learning ── */}
      {currentTema && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <div className="mb-5">
            <SectionHeader icon={<BookOpen size={13} />} label="Continuar Aprendiendo" color="#00d4ff" />
          </div>

          <Link to={`/temas/${currentTema.tema.id}`} className="block group">
            <div
              className="rounded-2xl p-6 transition-all duration-200"
              style={{
                background: `linear-gradient(135deg, ${currentTema.tema.color}0a 0%, #141729 30%, #111425 100%)`,
                border: `1px solid ${currentTema.tema.color}25`,
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = `${currentTema.tema.color}55`
                e.currentTarget.style.boxShadow = `0 12px 40px rgba(0,0,0,0.6), 0 0 40px ${currentTema.tema.color}25`
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = `${currentTema.tema.color}25`
                e.currentTarget.style.boxShadow = ''
              }}
            >
              <div className="flex items-center gap-6">
                <div
                  className="w-16 h-16 lg:w-20 lg:h-20 rounded-2xl flex items-center justify-center text-4xl flex-shrink-0"
                  style={{
                    background: `${currentTema.tema.color}15`,
                    border: `1px solid ${currentTema.tema.color}35`,
                    boxShadow: `0 0 28px ${currentTema.tema.color}25`,
                  }}
                >
                  {getTemaEmoji(currentTema.tema.icon)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="text-[10px] font-bold px-1.5 py-0.5 rounded-md"
                      style={{
                        background: `${currentTema.tema.color}18`,
                        color: currentTema.tema.color,
                        border: `1px solid ${currentTema.tema.color}30`,
                      }}
                    >
                      T{currentTema.tema.number}
                    </span>
                    <Badge color={categoryColor(currentTema.tema.category)} size="sm">
                      {currentTema.tema.category}
                    </Badge>
                  </div>
                  <p className="font-black text-text-primary text-xl lg:text-2xl leading-snug">{currentTema.tema.title}</p>
                  <div className="mt-3.5">
                    <ProgressBar value={currentTema.progress} color="blue" height={6} animated />
                    <p className="text-xs text-text-secondary mt-2">{currentTema.progress}% completado</p>
                  </div>
                </div>
                <ChevronRight size={22} className="text-text-muted group-hover:text-neon-blue transition-colors flex-shrink-0" />
              </div>
            </div>
          </Link>
        </motion.div>
      )}

      {/* ── Temas Horizontal Carousel ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.25 }}
      >
        <div className="flex items-center justify-between mb-5">
          <SectionHeader icon={<BookOpen size={13} />} label="Explorar Temas" color="#00d4ff" />
          <Link
            to="/temas"
            className="flex items-center gap-1 text-xs font-semibold text-neon-blue hover:text-white transition-colors"
          >
            Ver todos <ChevronRight size={11} />
          </Link>
        </div>

        <div className="flex gap-5 overflow-x-auto pb-3 scrollbar-hide">
          {TEMAS.map((tema, i) => {
            const temaProgress = getTemaProgress(tema.id, tema.activities.length)
            return (
              <motion.div
                key={tema.id}
                className="flex-shrink-0 w-[280px] lg:w-[320px]"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.28 + i * 0.05 }}
                whileHover={{ y: -4, transition: springTransition }}
              >
                <Link to={`/temas/${tema.id}`} className="block h-full">
                  <div
                    className="rounded-2xl p-5 h-full transition-all duration-200"
                    style={{
                      background: `linear-gradient(135deg, ${tema.color}0c 0%, #141729 100%)`,
                      border: `1px solid ${tema.color}25`,
                      backdropFilter: 'blur(6px)',
                      WebkitBackdropFilter: 'blur(6px)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = `${tema.color}55`
                      e.currentTarget.style.boxShadow = `0 8px 32px rgba(0,0,0,0.5), 0 0 28px ${tema.color}18`
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = `${tema.color}25`
                      e.currentTarget.style.boxShadow = ''
                    }}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl flex-shrink-0"
                        style={{
                          background: `${tema.color}15`,
                          border: `1px solid ${tema.color}30`,
                        }}
                      >
                        {getTemaEmoji(tema.icon)}
                      </div>
                      <Badge color={categoryColor(tema.category)} size="sm">{tema.category}</Badge>
                    </div>
                    <p className="font-black text-text-primary text-lg leading-snug">{tema.title}</p>
                    <p className="text-xs text-text-secondary mt-1.5 line-clamp-2">{tema.subtitle}</p>
                    <div className="mt-4">
                      <ProgressBar value={temaProgress} color="blue" height={4} animated />
                      <p className="text-xs text-text-muted mt-1.5">{temaProgress}%</p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      {/* ── Recent Activity Feed ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <div className="mb-5">
          <SectionHeader icon={<Clock size={13} />} label="Actividad Reciente" color="#b24bff" />
        </div>

        <div className="space-y-2.5">
          {recentActivities.length === 0 ? (
            <div
              className="text-text-muted text-sm py-8 text-center rounded-2xl"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}
            >
              Aún no has completado actividades
            </div>
          ) : (
            recentActivities.map((activity, i) => (
              <motion.div
                key={`${activity.title}-${i}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: 0.32 + i * 0.04 }}
                className="flex items-center gap-4 p-4 rounded-xl"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(0,255,136,0.1)', border: '1px solid rgba(0,255,136,0.2)' }}
                >
                  <Check size={15} className="text-neon-green" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-text-primary truncate">{activity.title}</p>
                  <p className="text-xs text-text-muted truncate">{activity.temaTitle}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs font-bold text-neon-yellow">+{activity.xp} XP</p>
                  <p className="text-xs text-text-muted">{activity.score}%</p>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  )
}
