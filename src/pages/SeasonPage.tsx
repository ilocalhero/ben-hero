import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Check, Circle, ExternalLink } from 'lucide-react'
import { MATE_SEASON_2 } from '../data'
import type { Season } from '../data/seasons/mate-season-2'
import { useProgressStore } from '../stores/useProgressStore'
import { ProgressBar } from '../components/ui'

function getSeasonById(id: string): Season | undefined {
  if (id === MATE_SEASON_2.id) return MATE_SEASON_2
  return undefined
}

export function SeasonPage() {
  const { seasonId } = useParams<{ seasonId: string }>()
  const { completedSeasonItems, toggleSeasonItem, getSeasonProgress } = useProgressStore()

  const season = seasonId ? getSeasonById(seasonId) : undefined

  if (!season) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <p className="text-2xl text-[#8b8fb0]">Season no encontrada</p>
        <Link
          to="/"
          className="flex items-center gap-2 text-[#00d4ff] hover:text-[#00b8e6] transition-colors"
        >
          <ArrowLeft size={18} />
          Volver al inicio
        </Link>
      </div>
    )
  }

  const progress = getSeasonProgress(season.id, season.items.length)
  const doneCount = Object.keys(completedSeasonItems).filter(k => k.startsWith(`${season.id}:`)).length

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="max-w-4xl mx-auto space-y-6"
    >
      {/* Back link */}
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors text-base group"
      >
        <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
        Volver al inicio
      </Link>

      {/* Hero banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
      >
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            border: `1px solid ${season.color}30`,
            boxShadow: `0 8px 40px rgba(0,0,0,0.5), 0 0 60px ${season.color}15`,
          }}
        >
          <img
            src={season.bannerImage}
            alt={season.title}
            className="w-full object-cover"
            style={{ maxHeight: '380px' }}
          />
        </div>
      </motion.div>

      {/* Title + Progress */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="space-y-3"
      >
        <h1 className="text-3xl lg:text-4xl font-black text-white">{season.title}</h1>
        <p className="text-text-secondary text-sm lg:text-base">{season.subtitle}</p>
        <div className="pt-2">
          <ProgressBar value={progress} color="orange" height={8} animated />
          <p className="text-xs text-text-secondary mt-2">
            {doneCount}/{season.items.length} completados · {progress}%
          </p>
        </div>
      </motion.div>

      {/* PDF Items List */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="space-y-3"
      >
        <h2
          className="flex items-center gap-3 text-[11px] font-black uppercase tracking-widest text-text-muted"
        >
          <div className="w-1 h-6 rounded-full" style={{ background: season.color, boxShadow: `0 0 10px ${season.color}` }} />
          Problemas del Profesor
        </h2>

        <div className="space-y-2.5">
          {season.items.map((item, i) => {
            const key = `${season.id}:${item.id}`
            const isDone = completedSeasonItems[key] === true

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: 0.18 + i * 0.03 }}
                className="flex items-center gap-4 p-4 rounded-xl"
                style={{
                  background: isDone
                    ? 'linear-gradient(135deg, rgba(0,255,136,0.04) 0%, rgba(20,23,41,1) 100%)'
                    : 'rgba(255,255,255,0.03)',
                  border: isDone
                    ? '1px solid rgba(0,255,136,0.2)'
                    : '1px solid rgba(255,255,255,0.06)',
                }}
              >
                {/* Toggle checkbox */}
                <button
                  onClick={() => toggleSeasonItem(season.id, item.id)}
                  className="flex-shrink-0 transition-all duration-200 hover:scale-110"
                  aria-label={isDone ? 'Marcar como pendiente' : 'Marcar como completado'}
                >
                  {isDone ? (
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{
                        background: 'rgba(0,255,136,0.15)',
                        border: '1px solid rgba(0,255,136,0.3)',
                        boxShadow: '0 0 16px rgba(0,255,136,0.2)',
                      }}
                    >
                      <Check size={20} className="text-neon-green" />
                    </div>
                  ) : (
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.1)',
                      }}
                    >
                      <Circle size={20} className="text-text-muted" />
                    </div>
                  )}
                </button>

                {/* Title */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold ${isDone ? 'text-text-secondary line-through' : 'text-text-primary'}`}>
                    {item.title}
                  </p>
                </div>

                {/* Open PDF button */}
                <button
                  onClick={() => window.open(item.pdfPath, '_blank')}
                  className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 hover:scale-105"
                  style={{
                    background: `${season.color}15`,
                    color: season.color,
                    border: `1px solid ${season.color}30`,
                  }}
                >
                  <ExternalLink size={14} />
                  Ver PDF
                </button>
              </motion.div>
            )
          })}
        </div>
      </motion.div>
    </motion.div>
  )
}
