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
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="max-w-3xl mx-auto px-4 py-6 space-y-6"
    >
      {/* Back link */}
      <Link
        to="/temas"
        className="inline-flex items-center gap-2 text-[#8b8fb0] hover:text-[#e8eaff] transition-colors text-sm"
      >
        <ArrowLeft size={16} />
        Volver a temas
      </Link>

      {/* Header card */}
      <div className="bg-bg-card rounded-2xl p-6 border border-[#ffffff10] space-y-4">
        <div className="flex items-start gap-4">
          <div
            className="flex-shrink-0 w-16 h-16 rounded-xl flex items-center justify-center text-3xl"
            style={{ backgroundColor: `${tema.color}20`, border: `2px solid ${tema.color}44` }}
          >
            {tema.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <Badge color={categoryColor} size="sm">{categoryLabel}</Badge>
              <span className="text-[#8b8fb0] text-xs">Páginas {tema.textbookPages}</span>
            </div>
            <NeonText color="blue" as="h1" className="text-2xl font-bold leading-tight">
              {tema.title}
            </NeonText>
            <p className="text-[#8b8fb0] text-sm mt-1">{tema.subtitle}</p>
          </div>
        </div>

        <p className="text-[#c0c4e0] text-sm leading-relaxed">{tema.description}</p>

        <div className="space-y-1">
          <div className="flex justify-between text-xs text-[#8b8fb0]">
            <span>Progreso</span>
            <span>{progress}%</span>
          </div>
          <ProgressBar value={progress} color="blue" />
        </div>
      </div>

      {/* Lessons section */}
      {tema.lessons.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-[#e8eaff]">Lecciones</h2>
          <div className="space-y-2">
            {tema.lessons.map((lesson) => {
              const done = isLessonDone(lesson.id)
              return (
                <motion.div key={lesson.id} whileHover={{ x: 4 }}>
                  <Link
                    to={`/temas/${tema.id}/lessons/${lesson.id}`}
                    className={`
                      flex items-center gap-4 p-4 rounded-xl border transition-colors
                      bg-bg-card hover:bg-[#1e2248]
                      ${done
                        ? 'border-[#00ff8830]'
                        : 'border-[#ffffff10] hover:border-[#00d4ff33]'
                      }
                    `}
                  >
                    <div
                      className={`
                        flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center
                        text-sm font-bold
                        ${done
                          ? 'bg-[#00ff8820] text-[#00ff88]'
                          : 'bg-[#00d4ff15] text-[#00d4ff]'
                        }
                      `}
                    >
                      {done ? <Check size={14} /> : lesson.order}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium truncate ${done ? 'text-[#00ff88]' : 'text-[#e8eaff]'}`}>
                        {lesson.title}
                      </p>
                      {lesson.subtitle && (
                        <p className="text-[#8b8fb0] text-xs truncate mt-0.5">{lesson.subtitle}</p>
                      )}
                    </div>
                    <ChevronRight size={16} className="text-[#8b8fb0] flex-shrink-0" />
                  </Link>
                </motion.div>
              )
            })}
          </div>
        </div>
      )}

      {/* Activities section */}
      {tema.activities.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-[#e8eaff]">Actividades</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {tema.activities.map((activity) => {
              const done = isActivityDone(activity.id)
              return (
                <motion.div key={activity.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Link
                    to={`/temas/${tema.id}/activities/${activity.id}`}
                    className={`
                      block p-4 rounded-xl border transition-colors
                      bg-bg-card hover:bg-[#1e2248]
                      ${done
                        ? 'border-[#00ff8830]'
                        : 'border-[#ffffff10] hover:border-[#b24bff33]'
                      }
                    `}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className={done ? 'text-[#00ff88]' : 'text-[#b24bff]'}>
                          {done ? <Check size={18} /> : activityIcon(activity.type)}
                        </span>
                        <span className="text-[#8b8fb0] text-xs">{activityTypeLabel(activity.type)}</span>
                      </div>
                      <Badge color="yellow" size="sm">+{activity.xpReward} XP</Badge>
                    </div>

                    <p className={`font-medium text-sm leading-snug mb-2 ${done ? 'text-[#00ff88]' : 'text-[#e8eaff]'}`}>
                      {activity.title}
                    </p>

                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <Star
                          key={i}
                          size={12}
                          className={i < activity.difficulty ? 'text-[#ffd700] fill-[#ffd700]' : 'text-[#3a3d5c]'}
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
        <div className="bg-bg-card rounded-2xl border border-[#ffffff10] overflow-hidden">
          <button
            onClick={() => setTermsOpen((o) => !o)}
            className="w-full flex items-center justify-between p-4 hover:bg-[#1e2248] transition-colors"
          >
            <span className="font-semibold text-[#e8eaff]">Términos clave ({tema.keyTerms.length})</span>
            <motion.span animate={{ rotate: termsOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown size={18} className="text-[#8b8fb0]" />
            </motion.span>
          </button>

          <AnimatePresence initial={false}>
            {termsOpen && (
              <motion.div
                key="terms"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4 space-y-3 border-t border-[#ffffff10] pt-3">
                  {tema.keyTerms.map((kt) => (
                    <div key={kt.term} className="space-y-0.5">
                      <p className="font-semibold text-[#00d4ff] text-sm">{kt.term}</p>
                      <p className="text-[#c0c4e0] text-sm">{kt.definition}</p>
                      {kt.example && (
                        <p className="text-[#8b8fb0] text-xs italic">Ej: {kt.example}</p>
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
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-[#e8eaff]">Fechas clave</h2>
          <div className="relative space-y-3 pl-4">
            <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-[#ff6b3530] rounded-full" />
            {tema.keyDates.map((kd, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07 }}
                className="flex items-start gap-3 relative"
              >
                <div className="absolute -left-4 top-1 w-2 h-2 rounded-full bg-[#ff6b35] flex-shrink-0" />
                <Badge color="orange" size="sm">{kd.year}</Badge>
                <div>
                  <p className="text-[#e8eaff] text-sm font-medium">{kd.event}</p>
                  <p className="text-[#8b8fb0] text-xs mt-0.5">{kd.detail}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  )
}
