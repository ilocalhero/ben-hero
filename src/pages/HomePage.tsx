import { motion } from 'framer-motion'
import { Zap, ChevronRight, BookOpen, Flame, CheckCircle, Star, Trophy } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { TEMAS } from '../data'
import { Card, NeonText, Badge } from '../components/ui'
import { useProgressStore } from '../stores/useProgressStore'
import { usePlayerStore } from '../stores/usePlayerStore'
import { getLevelTitle } from '../lib/xpCalculator'
import { getTemaEmoji } from '../lib/temaIcons'

const categoryColor = (cat: string) => cat === 'historia' ? 'orange' : 'green' as const

export function HomePage() {
  const featuredTemas = TEMAS.slice(0, 2)
  const navigate = useNavigate()
  const { dailyMissionCompleted } = useProgressStore()
  const { streak, level, totalXP } = usePlayerStore()
  const levelTitle = getLevelTitle(level)

  return (
    <div className="space-y-7 max-w-2xl">

      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <NeonText as="h1" color="blue" className="text-3xl lg:text-4xl mb-1.5 font-black tracking-tight">
          ¡Hola, Ben!
        </NeonText>
        <p className="text-text-secondary text-sm">Listo para conquistar la historia de España</p>
      </motion.div>

      {/* ── Stats strip ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.08 }}
        className="grid grid-cols-3 gap-3"
      >
        {[
          {
            icon: <Zap size={16} style={{ color: '#00d4ff', filter: 'drop-shadow(0 0 5px #00d4ff)' }} />,
            label: 'XP Total',
            value: totalXP.toLocaleString(),
            color: '#00d4ff',
            accent: 'rgba(0,212,255,0.1)',
            border: 'rgba(0,212,255,0.2)',
          },
          {
            icon: <Flame size={16} style={{ color: streak > 0 ? '#ff6b35' : '#4a4e6e', filter: streak > 0 ? 'drop-shadow(0 0 5px #ff6b35)' : undefined }} />,
            label: 'Racha',
            value: `${streak}d`,
            color: streak > 0 ? '#ff6b35' : '#4a4e6e',
            accent: streak > 0 ? 'rgba(255,107,53,0.1)' : 'rgba(255,255,255,0.03)',
            border: streak > 0 ? 'rgba(255,107,53,0.2)' : 'rgba(255,255,255,0.06)',
          },
          {
            icon: <Trophy size={16} style={{ color: '#b24bff', filter: 'drop-shadow(0 0 5px #b24bff)' }} />,
            label: 'Rango',
            value: levelTitle,
            color: '#b24bff',
            accent: 'rgba(178,75,255,0.1)',
            border: 'rgba(178,75,255,0.2)',
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl px-3 py-2.5 flex flex-col gap-1"
            style={{
              background: stat.accent,
              border: `1px solid ${stat.border}`,
            }}
          >
            <div className="flex items-center gap-1.5">
              {stat.icon}
              <span className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider">{stat.label}</span>
            </div>
            <p className="text-sm font-black truncate" style={{ color: stat.color }}>{stat.value}</p>
          </div>
        ))}
      </motion.div>

      {/* ── Misión del día ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.14 }}
        className="space-y-2"
      >
        <div className="flex items-center justify-between px-0.5 mb-1">
          <h2 className="text-xs font-bold uppercase tracking-widest text-text-muted">Misión del Día</h2>
        </div>

        <button
          onClick={() => !dailyMissionCompleted && navigate('/daily')}
          disabled={dailyMissionCompleted}
          className="w-full text-left rounded-2xl relative overflow-hidden group transition-transform duration-200 hover:scale-[1.01] active:scale-[0.99] disabled:scale-100 disabled:cursor-default"
          style={{
            background: dailyMissionCompleted
              ? 'linear-gradient(135deg, #141a1a 0%, #0f1818 100%)'
              : 'linear-gradient(135deg, #180e2e 0%, #150b28 100%)',
            border: dailyMissionCompleted ? '1px solid rgba(0,255,136,0.2)' : '1px solid rgba(178,75,255,0.25)',
            boxShadow: dailyMissionCompleted
              ? '0 4px 24px rgba(0,0,0,0.4), 0 0 20px rgba(0,255,136,0.06)'
              : '0 4px 32px rgba(0,0,0,0.5), 0 0 32px rgba(178,75,255,0.08)',
          }}
        >
          {/* Shimmer on hover */}
          {!dailyMissionCompleted && (
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 shimmer rounded-2xl" />
          )}

          {/* Top accent line */}
          <div
            className="absolute top-0 left-6 right-6 h-px"
            style={{
              background: dailyMissionCompleted
                ? 'linear-gradient(90deg, transparent, rgba(0,255,136,0.4), transparent)'
                : 'linear-gradient(90deg, transparent, rgba(178,75,255,0.5), transparent)',
            }}
          />

          <div className="relative flex items-center gap-4 p-5">
            {/* Icon */}
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={
                dailyMissionCompleted
                  ? {
                      background: 'rgba(0,255,136,0.12)',
                      border: '1px solid rgba(0,255,136,0.3)',
                      boxShadow: '0 0 16px rgba(0,255,136,0.15)',
                    }
                  : {
                      background: 'rgba(178,75,255,0.15)',
                      border: '1px solid rgba(178,75,255,0.35)',
                      boxShadow: '0 0 20px rgba(178,75,255,0.2)',
                    }
              }
            >
              {dailyMissionCompleted
                ? <CheckCircle size={24} className="text-neon-green" style={{ filter: 'drop-shadow(0 0 8px #00ff88)' }} />
                : <Zap size={24} className="text-neon-purple" style={{ filter: 'drop-shadow(0 0 8px #b24bff)' }} />
              }
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="text-[10px] font-bold uppercase tracking-widest"
                  style={{ color: dailyMissionCompleted ? '#00ff88' : '#b24bff' }}
                >
                  {dailyMissionCompleted ? '✓ Completada' : 'Pendiente'}
                </span>
              </div>
              <p className="font-bold text-white text-[17px] leading-tight">
                {dailyMissionCompleted ? 'Misión completada' : 'Completa tu lección de hoy'}
              </p>
              <p className="text-xs text-text-secondary mt-1">
                {dailyMissionCompleted
                  ? 'Vuelve mañana para la próxima misión'
                  : '+150 XP · ~15-20 min'}
              </p>
            </div>

            {!dailyMissionCompleted && (
              <div
                className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(178,75,255,0.2)', border: '1px solid rgba(178,75,255,0.3)' }}
              >
                <ChevronRight size={16} className="text-neon-purple" />
              </div>
            )}
          </div>
        </button>
      </motion.div>

      {/* ── Temas recientes ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="space-y-3"
      >
        <div className="flex items-center justify-between px-0.5">
          <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-text-muted">
            <BookOpen size={13} className="text-neon-blue" />
            Temas recientes
          </h2>
          <Link
            to="/temas"
            className="flex items-center gap-1 text-xs font-semibold text-neon-blue hover:text-white transition-colors"
          >
            Ver todos <ChevronRight size={11} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {featuredTemas.map((tema, i) => (
            <motion.div
              key={tema.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.26 + i * 0.07 }}
              whileHover={{ y: -2 }}
            >
              <Link to={`/temas/${tema.id}`} className="block group">
                <div
                  className="rounded-2xl p-4 transition-all duration-200"
                  style={{
                    background: 'linear-gradient(135deg, #141729 0%, #111425 100%)',
                    border: '1px solid rgba(255,255,255,0.07)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = `${tema.color}44`
                    e.currentTarget.style.boxShadow = `0 4px 20px rgba(0,0,0,0.4), 0 0 20px ${tema.color}18`
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'
                    e.currentTarget.style.boxShadow = ''
                  }}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                      style={{
                        background: `${tema.color}18`,
                        border: `1px solid ${tema.color}33`,
                        boxShadow: `0 0 12px ${tema.color}18`,
                      }}
                    >
                      {getTemaEmoji(tema.icon)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span
                          className="text-[10px] font-bold px-1.5 py-0.5 rounded-md"
                          style={{
                            background: `${tema.color}18`,
                            color: tema.color,
                            border: `1px solid ${tema.color}30`,
                          }}
                        >
                          T{tema.number}
                        </span>
                        <Badge color={categoryColor(tema.category)} size="sm">
                          {tema.category}
                        </Badge>
                      </div>
                      <p className="font-bold text-text-primary text-sm leading-snug">{tema.title}</p>
                      <p className="text-xs text-text-secondary mt-0.5 line-clamp-1">{tema.subtitle}</p>
                    </div>

                    <ChevronRight
                      size={15}
                      className="text-text-muted group-hover:text-neon-blue transition-colors flex-shrink-0 mt-1"
                    />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ── Next steps teaser ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <Link to="/temas" className="block group">
          <div
            className="rounded-2xl p-4 flex items-center gap-4 transition-all duration-200"
            style={{
              background: 'linear-gradient(90deg, rgba(0,212,255,0.05) 0%, rgba(178,75,255,0.03) 100%)',
              border: '1px dashed rgba(0,212,255,0.18)',
            }}
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.2)' }}
            >
              <Star size={16} className="text-neon-blue" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-text-primary">Explora todos los temas</p>
              <p className="text-xs text-text-secondary mt-0.5">{TEMAS.length} temas disponibles · Historia y Geografía</p>
            </div>
            <ChevronRight size={16} className="text-text-muted group-hover:text-neon-blue transition-colors" />
          </div>
        </Link>
      </motion.div>
    </div>
  )
}
