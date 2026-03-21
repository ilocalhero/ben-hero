import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useSearchParams } from 'react-router-dom'
import { ChevronRight, Lock } from 'lucide-react'
import { getTemasForSubject } from '../data'
import { SUBJECT_LIST } from '../data/subjects'
import { NeonText } from '../components/ui'
import { getTemaEmoji } from '../lib/temaIcons'
import { getCategoryConfig } from '../data/subjects'

const springTransition = { type: 'spring' as const, stiffness: 300, damping: 22 }

export function TemasPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialSubject = searchParams.get('subject') || 'historia_geografia'
  const [activeSubject, setActiveSubject] = useState(initialSubject)

  const subjectConfig = SUBJECT_LIST.find(s => s.id === activeSubject) ?? SUBJECT_LIST[0]
  const temas = getTemasForSubject(activeSubject)

  const handleTabChange = (subjectId: string) => {
    setActiveSubject(subjectId)
    setSearchParams({ subject: subjectId })
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <NeonText as="h1" color="blue" className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight mb-2">
          Mis Temas
        </NeonText>
        <p className="text-text-secondary text-base lg:text-lg">{temas.length} temas disponibles · {subjectConfig.description}</p>
      </motion.div>

      {/* Subject tabs */}
      <div className="flex gap-2">
        {SUBJECT_LIST.map(subject => {
          const isActive = subject.id === activeSubject
          return (
            <button
              key={subject.id}
              onClick={() => handleTabChange(subject.id)}
              className="px-5 py-2.5 rounded-xl font-bold text-sm uppercase tracking-wider transition-all duration-200"
              style={{
                background: isActive
                  ? `${subject.color}20`
                  : 'rgba(255,255,255,0.04)',
                color: isActive ? subject.color : '#8b8fb0',
                border: isActive
                  ? `1px solid ${subject.color}50`
                  : '1px solid rgba(255,255,255,0.08)',
                boxShadow: isActive ? `0 0 20px ${subject.color}15` : undefined,
              }}
            >
              {subject.shortLabel}
            </button>
          )
        })}
      </div>

      {/* Temas list */}
      <div className="space-y-4">
        {temas.map((tema, i) => {
          const catConfig = getCategoryConfig(tema)
          const catColor = catConfig?.color ?? tema.color
          const catLabel = catConfig?.label ?? tema.category

          return (
            <motion.div
              key={tema.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, delay: i * 0.06 }}
              whileHover={{ x: 4, scale: 1.005, transition: springTransition }}
            >
              <Link to={`/temas/${tema.id}`} className="block group">
                <div
                  className="rounded-2xl p-6 lg:p-7 transition-all duration-200 relative overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${tema.color}12 0%, #131727 50%, #0f1221 100%)`,
                    border: `1px solid ${tema.color}35`,
                    boxShadow: `0 4px 24px rgba(0,0,0,0.4), 0 0 32px ${tema.color}0a`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = `${tema.color}80`
                    e.currentTarget.style.boxShadow = `0 8px 48px rgba(0,0,0,0.6), 0 0 56px ${tema.color}28`
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = `${tema.color}35`
                    e.currentTarget.style.boxShadow = `0 4px 24px rgba(0,0,0,0.4), 0 0 32px ${tema.color}0a`
                  }}
                >
                  {/* Top accent line */}
                  <div
                    className="absolute top-0 left-0 right-0 h-px"
                    style={{ background: `linear-gradient(90deg, transparent, ${tema.color}60, transparent)` }}
                  />

                  <div className="flex items-center gap-5">
                    {/* Icon */}
                    <div
                      className="w-16 h-16 lg:w-20 lg:h-20 rounded-2xl overflow-hidden flex items-center justify-center text-4xl lg:text-5xl flex-shrink-0"
                      style={{
                        background: `linear-gradient(135deg, ${tema.color}22 0%, ${tema.color}10 100%)`,
                        border: `1px solid ${tema.color}50`,
                        boxShadow: `0 0 24px ${tema.color}28`,
                      }}
                    >
                      {tema.iconImage
                        ? <img src={tema.iconImage} alt={tema.title} className="w-full h-full object-cover" />
                        : getTemaEmoji(tema.icon)
                      }
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Badges */}
                      <div className="flex items-center gap-2 mb-2.5">
                        <span
                          className="text-xs font-black px-2.5 py-1 rounded-full uppercase tracking-wider"
                          style={{
                            background: `${tema.color}20`,
                            color: tema.color,
                            border: `1px solid ${tema.color}40`,
                          }}
                        >
                          Tema {tema.number}
                        </span>
                        <span
                          className="text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider"
                          style={{
                            background: `${catColor}12`,
                            color: catColor,
                            border: `1px solid ${catColor}30`,
                          }}
                        >
                          {catLabel}
                        </span>
                      </div>

                      <h3
                        className="font-black text-lg lg:text-xl leading-snug mb-1.5"
                        style={{ color: '#e8eaff' }}
                      >
                        {tema.title}
                      </h3>
                      <p className="text-sm text-text-secondary line-clamp-2 leading-relaxed">{tema.description}</p>

                      {/* Stats */}
                      <div className="flex items-center gap-3 mt-3">
                        <span
                          className="text-xs font-semibold px-2.5 py-1 rounded-md"
                          style={{ background: 'rgba(255,255,255,0.05)', color: '#8b8fb0' }}
                        >
                          {tema.lessons.length} lecciones
                        </span>
                        <span
                          className="text-xs font-semibold px-2.5 py-1 rounded-md"
                          style={{ background: 'rgba(255,255,255,0.05)', color: '#8b8fb0' }}
                        >
                          {tema.activities.length} actividades
                        </span>
                      </div>
                    </div>

                    {/* Arrow */}
                    <div
                      className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200"
                      style={{ background: `${tema.color}15`, border: `1px solid ${tema.color}30` }}
                    >
                      <ChevronRight
                        size={18}
                        style={{ color: tema.color }}
                      />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          )
        })}
      </div>

      {/* Coming soon */}
      {activeSubject === 'historia_geografia' && temas.length < 11 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: temas.length * 0.06 + 0.1 }}
        >
          <div
            className="rounded-2xl p-6 lg:p-7"
            style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px dashed rgba(255,255,255,0.08)',
            }}
          >
            <div className="flex items-center gap-5">
              <div
                className="w-16 h-16 lg:w-20 lg:h-20 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <Lock size={26} className="text-text-muted" />
              </div>
              <div>
                <p className="text-text-secondary font-black text-base lg:text-lg">Más temas próximamente</p>
                <p className="text-text-muted text-sm mt-1">{11 - temas.length} temas en desarrollo</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {activeSubject === 'matematicas' && temas.length < 11 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: temas.length * 0.06 + 0.1 }}
        >
          <div
            className="rounded-2xl p-6 lg:p-7"
            style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px dashed rgba(255,255,255,0.08)',
            }}
          >
            <div className="flex items-center gap-5">
              <div
                className="w-16 h-16 lg:w-20 lg:h-20 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <Lock size={26} className="text-text-muted" />
              </div>
              <div>
                <p className="text-text-secondary font-black text-base lg:text-lg">Más temas próximamente</p>
                <p className="text-text-muted text-sm mt-1">{11 - temas.length} temas en desarrollo</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
