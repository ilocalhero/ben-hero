import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ChevronRight, Sparkles } from 'lucide-react'
import { TEMAS } from '../data'
import { NeonText, Badge } from '../components/ui'
import { getTemaEmoji } from '../lib/temaIcons'

const categoryColor = (cat: string) => cat === 'historia' ? 'orange' : 'green' as const

export function TemasPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <NeonText as="h1" color="blue" className="text-3xl lg:text-4xl font-black tracking-tight mb-1.5">
          Mis Temas
        </NeonText>
        <p className="text-text-secondary text-sm">{TEMAS.length} temas disponibles</p>
      </motion.div>

      {/* Temas grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {TEMAS.map((tema, i) => (
          <motion.div
            key={tema.id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.06 }}
            whileHover={{ y: -2 }}
          >
            <Link to={`/temas/${tema.id}`} className="block group">
              <div
                className="rounded-2xl p-4 h-full transition-all duration-200"
                style={{
                  background: 'linear-gradient(135deg, #141729 0%, #111425 100%)',
                  border: '1px solid rgba(255,255,255,0.07)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = `${tema.color}44`
                  e.currentTarget.style.boxShadow = `0 6px 24px rgba(0,0,0,0.5), 0 0 24px ${tema.color}18`
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'
                  e.currentTarget.style.boxShadow = ''
                }}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                    style={{
                      background: `${tema.color}18`,
                      border: `1px solid ${tema.color}33`,
                      boxShadow: `0 0 16px ${tema.color}18`,
                    }}
                  >
                    {getTemaEmoji(tema.icon)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      <span
                        className="text-[10px] font-bold px-1.5 py-0.5 rounded-md"
                        style={{
                          background: `${tema.color}18`,
                          color: tema.color,
                          border: `1px solid ${tema.color}30`,
                        }}
                      >
                        Tema {tema.number}
                      </span>
                      <Badge color={categoryColor(tema.category)} size="sm">
                        {tema.category}
                      </Badge>
                    </div>

                    <h3 className="font-bold text-text-primary text-sm leading-snug mb-1">{tema.title}</h3>
                    <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">{tema.description}</p>

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-3 text-[11px] text-text-muted">
                        <span>{tema.lessons.length} lecciones</span>
                        <span>·</span>
                        <span>{tema.activities.length} actividades</span>
                      </div>
                      <ChevronRight
                        size={14}
                        className="text-text-muted group-hover:text-neon-blue transition-colors"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Coming soon placeholder */}
      {TEMAS.length < 10 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: TEMAS.length * 0.06 + 0.1 }}
        >
          <div
            className="rounded-2xl p-6 flex flex-col items-center gap-2"
            style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px dashed rgba(255,255,255,0.08)',
            }}
          >
            <Sparkles size={20} className="text-text-muted" />
            <p className="text-text-muted text-sm font-semibold">Más temas próximamente...</p>
            <p className="text-text-muted text-xs">{10 - TEMAS.length} temas en desarrollo</p>
          </div>
        </motion.div>
      )}
    </div>
  )
}
