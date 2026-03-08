import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Check } from 'lucide-react'
import { getTema } from '../data'
import { useProgressStore } from '../stores/useProgressStore'
import { usePlayerStore } from '../stores/usePlayerStore'
import { useXPAnimation } from '../stores/useXPAnimation'
import { NeonText, Button } from '../components/ui'
import type { LessonSection } from '../types/tema'

function renderSection(section: LessonSection, index: number) {
  switch (section.type) {
    case 'text':
      return (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="space-y-3"
        >
          {section.title && (
            <h3 className="text-[#e8eaff] font-semibold text-base">{section.title}</h3>
          )}
          {section.content && section.content.split('\n').map((para, i) =>
            para.trim() ? (
              <p key={i} className="text-[#c0c4e0] leading-relaxed text-sm">
                {para.trim()}
              </p>
            ) : null
          )}
        </motion.div>
      )

    case 'callout':
      return (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="border-l-4 border-[#00d4ff] bg-[#00d4ff0d] rounded-r-xl px-4 py-3 space-y-2"
        >
          {section.title && (
            <p className="text-[#00d4ff] font-semibold text-sm">{section.title}</p>
          )}
          {section.content && (
            <p className="text-[#c0c4e0] text-sm leading-relaxed">{section.content}</p>
          )}
          {section.highlights && section.highlights.length > 0 && (
            <ul className="space-y-1 mt-2">
              {section.highlights.map((h, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-[#c0c4e0]">
                  <span className="text-[#00d4ff] mt-0.5 flex-shrink-0">•</span>
                  {h}
                </li>
              ))}
            </ul>
          )}
        </motion.div>
      )

    case 'timeline':
      return (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="space-y-2"
        >
          {section.title && (
            <h3 className="text-[#e8eaff] font-semibold text-base">{section.title}</h3>
          )}
          {section.content && (
            <div className="relative pl-4 space-y-2">
              <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-[#b24bff30] rounded-full" />
              {section.content.split('\n').map((item, i) =>
                item.trim() ? (
                  <div key={i} className="relative flex items-start gap-2">
                    <div className="absolute -left-4 top-1.5 w-2 h-2 rounded-full bg-[#b24bff] flex-shrink-0" />
                    <p className="text-[#c0c4e0] text-sm">{item.trim()}</p>
                  </div>
                ) : null
              )}
            </div>
          )}
        </motion.div>
      )

    case 'image':
    case 'map':
      return (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="space-y-2"
        >
          {section.title && (
            <h3 className="text-[#e8eaff] font-semibold text-base">{section.title}</h3>
          )}
          <div className="rounded-xl bg-[#1e2248] border border-[#ffffff10] p-8 flex flex-col items-center justify-center gap-2 min-h-[140px]">
            <p className="text-[#8b8fb0] text-xs font-mono">{section.imageUrl}</p>
            <p className="text-[#5a5e80] text-xs">
              {section.type === 'map' ? '[ Mapa ]' : '[ Imagen ]'}
            </p>
          </div>
          {section.caption && (
            <p className="text-[#8b8fb0] text-xs text-center italic">{section.caption}</p>
          )}
        </motion.div>
      )

    case 'source':
      return (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="border-l-4 border-[#ffd700] bg-[#ffd7000a] rounded-r-xl px-4 py-3 space-y-1"
        >
          {section.title && (
            <p className="text-[#ffd700] text-xs font-semibold uppercase tracking-wide">{section.title}</p>
          )}
          {section.content && (
            <blockquote className="text-[#c0c4e0] text-sm leading-relaxed italic">
              "{section.content}"
            </blockquote>
          )}
        </motion.div>
      )

    default:
      return null
  }
}

export function LessonPage() {
  const { temaId, lessonId } = useParams<{ temaId: string; lessonId: string }>()
  const navigate = useNavigate()
  const { completeLesson, isLessonDone } = useProgressStore()
  const { addXP } = usePlayerStore()
  const { addGain } = useXPAnimation()

  const tema = temaId ? getTema(temaId) : undefined
  const lesson = tema?.lessons.find((l) => l.id === lessonId)

  if (!tema || !lesson) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <p className="text-2xl text-[#8b8fb0]">Lección no encontrada</p>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[#00d4ff] hover:text-[#00b8e6] transition-colors"
        >
          <ArrowLeft size={18} />
          Volver
        </button>
      </div>
    )
  }

  const lessonDone = isLessonDone(lesson.id)
  const totalLessons = tema.lessons.length

  function handleMarkDone() {
    completeLesson(lesson!.id)
    addXP(15)
    addGain(15)
    navigate(`/temas/${temaId}`)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-28">
      {/* Back button */}
      <motion.button
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-[#8b8fb0] hover:text-[#e8eaff] transition-colors text-sm mb-6"
      >
        <ArrowLeft size={16} />
        Volver
      </motion.button>

      {/* Lesson header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="mb-6 space-y-1"
      >
        <p className="text-[#8b8fb0] text-xs">
          Lección {lesson.order} de {totalLessons}
        </p>
        <NeonText color="blue" as="h1" className="text-2xl font-bold leading-tight">
          {lesson.title}
        </NeonText>
        {lesson.subtitle && (
          <p className="text-[#8b8fb0] text-sm">{lesson.subtitle}</p>
        )}
      </motion.div>

      {/* Sections */}
      <div className="space-y-5">
        {lesson.sections.map((section, i) => renderSection(section, i))}
      </div>

      {/* Sticky bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-bg-primary border-t border-[#ffffff10] px-4 py-3 flex justify-center">
        <div className="max-w-2xl w-full flex justify-end">
          {lessonDone ? (
            <Button variant="success" disabled>
              <Check size={18} />
              Lección completada
            </Button>
          ) : (
            <Button variant="success" onClick={handleMarkDone}>
              <Check size={18} />
              Marcar como leída
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
