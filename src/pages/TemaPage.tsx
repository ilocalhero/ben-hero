import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  ChevronRight,
  ChevronDown,
  Check,
  Star,
  HelpCircle,
  Type,
  PenLine,
  BookOpen,
} from 'lucide-react'
import { getTema } from '../data'
import { useProgressStore } from '../stores/useProgressStore'
import { NeonText, Badge, ProgressBar } from '../components/ui'
import type { ActivityType } from '../types/tema'
import { getTemaEmoji } from '../lib/temaIcons'

function activityIcon(type: ActivityType) {
  if (type === 'quiz') return <HelpCircle size={18} />
  if (type === 'fill_blank') return <Type size={18} />
  if (type === 'writing_mission') return <PenLine size={18} />
  return <BookOpen size={18} />
}

function activityTypeLabel(type: ActivityType): string {
  const labels: Record<ActivityType, string> = {
    quiz: 'Cuestionario',
    fill_blank: 'Rellenar',
    timeline_drag: 'Línea de tiempo',
    map_label: 'Mapa',
    image_label: 'Imagen',
    match_pairs: 'Emparejar',
    sort_order: 'Ordenar',
    sentence_builder: 'Construir frases',
    paragraph_template: 'Párrafo',
    writing_mission: 'Misión escrita',
    source_analysis: 'Análisis de fuente',
    compare_contrast: 'Comparar',
  }
  return labels[type] ?? type
}

export function TemaPage() {
  const { temaId } = useParams<{ temaId: string }>()
  const { isLessonDone, isActivityDone, getTemaProgress } = useProgressStore()
  const [termsOpen, setTermsOpen] = useState(false)

  const tema = temaId ? getTema(temaId) : undefined

  if (!tema) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <p className="text-2xl text-[#8b8fb0]">Tema no encontrado</p>
        <Link
          to="/temas"
          className="flex items-center gap-2 text-[#00d4ff] hover:text-[#00b8e6] transition-colors"
        >
          <ArrowLeft size={18} />
          Volver a temas
        </Link>
      </div>
    )
  }

  const progress = getTemaProgress(tema.id, tema.activities.length)

  const categoryLabel = tema.category === 'historia' ? 'Historia' : 'Geografía'
  const categoryColor = tema.category === 'historia' ? 'purple' : 'blue'

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="max-w-4xl mx-auto space-y-6"
    >
      {/* Back link */}
      <Link
        to="/temas"
        className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors text-base group"
      >
        <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
        Volver a temas
      </Link>

      {/* Header card */}
      <div
        className="rounded-2xl p-6 lg:p-8 space-y-5 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #141729 0%, #111425 100%)',
          border: `1px solid ${tema.color}28`,
          boxShadow: `0 4px 32px rgba(0,0,0,0.5), 0 0 40px ${tema.color}0c`,
        }}
      >
        {/* Top accent */}
        <div
          className="absolute top-0 left-8 right-8 h-px"
          style={{ background: `linear-gradient(90deg, transparent, ${tema.color}55, transparent)` }}
        />
        <div className="flex items-start gap-4">
          <div
            className="flex-shrink-0 w-16 h-16 lg:w-20 lg:h-20 rounded-2xl flex items-center justify-center text-4xl lg:text-5xl"
            style={{
              background: `${tema.color}18`,
              border: `1px solid ${tema.color}44`,
              boxShadow: `0 0 20px ${tema.color}20`,
            }}
          >
            {getTemaEmoji(tema.icon)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <Badge color={categoryColor} size="sm">{categoryLabel}</Badge>
              <span className="text-text-muted text-sm">{tema.textbookPages}</span>
            </div>
            <NeonText color="blue" as="h1" className="text-3xl lg:text-4xl font-black leading-tight tracking-tight">
              {tema.title}
            </NeonText>
            <p className="text-text-secondary text-base mt-1">{tema.subtitle}</p>
          </div>
        </div>

        <p className="text-text-secondary text-base lg:text-lg leading-relaxed">{tema.description}</p>

        <div className="space-y-1.5">
          <div className="flex justify-between text-sm">
            <span className="text-text-muted font-medium">Progreso</span>
            <span className="font-bold" style={{ color: tema.color }}>{progress}%</span>
          </div>
          <ProgressBar value={progress} color="blue" />
        </div>
      </div>

      {/* Lessons section */}
      {tema.lessons.length > 0 && (
        <div className="space-y-2.5">
          <h2 className="text-base font-black uppercase tracking-widest text-text-muted px-0.5">Lecciones</h2>
          <div className="space-y-2">
            {tema.lessons.map((lesson, i) => {
              const done = isLessonDone(lesson.id)
              return (
                <motion.div
                  key={lesson.id}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <Link
                    to={`/temas/${tema.id}/lessons/${lesson.id}`}
                    className="flex items-center gap-4 p-4 lg:p-5 rounded-xl transition-all duration-150 group"
                    style={{
                      background: 'linear-gradient(135deg, #141729 0%, #111425 100%)',
                      border: done ? '1px solid rgba(0,255,136,0.2)' : '1px solid rgba(255,255,255,0.07)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = done ? 'rgba(0,255,136,0.3)' : 'rgba(0,212,255,0.25)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = done ? 'rgba(0,255,136,0.2)' : 'rgba(255,255,255,0.07)'
                    }}
                  >
                    <div
                      className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold"
                      style={
                        done
                          ? { background: 'rgba(0,255,136,0.12)', color: '#00ff88', border: '1px solid rgba(0,255,136,0.25)' }
                          : { background: 'rgba(0,212,255,0.1)', color: '#00d4ff', border: '1px solid rgba(0,212,255,0.2)' }
                      }
                    >
                      {done ? <Check size={13} /> : lesson.order}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold text-xl truncate ${done ? 'text-neon-green' : 'text-text-primary'}`}>
                        {lesson.title}
                      </p>
                      {lesson.subtitle && (
                        <p className="text-text-secondary text-sm truncate mt-0.5">{lesson.subtitle}</p>
                      )}
                    </div>
                    <ChevronRight size={14} className="text-text-muted group-hover:text-neon-blue transition-colors flex-shrink-0" />
                  </Link>
                </motion.div>
              )
            })}
          </div>
        </div>
      )}

      {/* Activities section */}
      {tema.activities.length > 0 && (
        <div className="space-y-2.5">
          <h2 className="text-base font-black uppercase tracking-widest text-text-muted px-0.5">Actividades</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {tema.activities.map((activity, i) => {
              const done = isActivityDone(activity.id)
              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link
                    to={`/temas/${tema.id}/activities/${activity.id}`}
                    className="block p-4 lg:p-5 rounded-xl transition-all duration-150"
                    style={{
                      background: 'linear-gradient(135deg, #141729 0%, #111425 100%)',
                      border: done ? '1px solid rgba(0,255,136,0.2)' : '1px solid rgba(255,255,255,0.07)',
                    }}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span style={{ color: done ? '#00ff88' : '#b24bff' }}>
                          {done ? <Check size={16} /> : activityIcon(activity.type)}
                        </span>
                        <span className="text-text-muted text-sm">{activityTypeLabel(activity.type)}</span>
                      </div>
                      <Badge color="yellow" size="sm">+{activity.xpReward} XP</Badge>
                    </div>

                    <p className={`font-semibold text-base leading-snug mb-2.5 ${done ? 'text-neon-green' : 'text-text-primary'}`}>
                      {activity.title}
                    </p>

                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 3 }).map((_, j) => (
                        <Star
                          key={j}
                          size={11}
                          className={j < activity.difficulty ? 'text-neon-yellow fill-neon-yellow' : 'text-text-muted'}
                        />
                      ))}
                    </div>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        </div>
      )}

      {/* Key Terms collapsible */}
      {tema.keyTerms.length > 0 && (
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #141729 0%, #111425 100%)',
            border: '1px solid rgba(255,255,255,0.07)',
          }}
        >
          <button
            onClick={() => setTermsOpen((o) => !o)}
            className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-white/[0.03] transition-colors"
          >
            <span className="font-bold text-base text-text-primary">
              Términos clave <span className="text-text-muted font-normal">({tema.keyTerms.length})</span>
            </span>
            <motion.div animate={{ rotate: termsOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown size={16} className="text-text-secondary" />
            </motion.div>
          </button>

          <AnimatePresence initial={false}>
            {termsOpen && (
              <motion.div
                key="terms"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.22 }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4 space-y-3 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  {tema.keyTerms.map((kt) => (
                    <div key={kt.term} className="space-y-0.5">
                      <p className="font-bold text-neon-blue text-base">{kt.term}</p>
                      <p className="text-text-secondary text-base leading-relaxed">{kt.definition}</p>
                      {kt.example && (
                        <p className="text-text-muted text-sm italic">Ej: {kt.example}</p>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Key Dates timeline */}
      {tema.keyDates && tema.keyDates.length > 0 && (
        <div className="space-y-2.5">
          <h2 className="text-base font-black uppercase tracking-widest text-text-muted px-0.5">Fechas clave</h2>
          <div className="relative space-y-2 pl-5">
            <div
              className="absolute left-1.5 top-2 bottom-2 w-px rounded-full"
              style={{ background: `linear-gradient(180deg, ${tema.color}60, ${tema.color}10)` }}
            />
            {tema.keyDates.map((kd, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className="flex items-start gap-3 relative"
              >
                <div
                  className="absolute -left-5 top-2 w-2.5 h-2.5 rounded-full"
                  style={{ background: tema.color, boxShadow: `0 0 8px ${tema.color}` }}
                />
                <Badge color="orange" size="sm">{kd.year}</Badge>
                <div>
                  <p className="text-text-primary text-base font-semibold">{kd.event}</p>
                  <p className="text-text-secondary text-sm mt-0.5 leading-relaxed">{kd.detail}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  )
}
