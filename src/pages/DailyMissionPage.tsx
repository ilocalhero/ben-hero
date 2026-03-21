import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Zap, BookOpen, PenLine, Star, ChevronRight, Flame, Trophy, RotateCcw } from 'lucide-react'
import { TEMAS, getTemasForSubject } from '../data'
import { SUBJECT_LIST } from '../data/subjects'
import { getTemaEmoji } from '../lib/temaIcons'
import { useProgressStore } from '../stores/useProgressStore'
import { usePlayerStore } from '../stores/usePlayerStore'
import { getLevelTitle } from '../lib/xpCalculator'
import { QuizActivity, FillBlankActivity, WritingMission } from '../components/activities'
import { isPassing, getThreshold } from '../lib/passingThresholds'
import { MathRenderer } from '../components/ui/MathRenderer'
import type { LessonSection } from '../types/tema'
import type { EvaluationResult } from '../types/gamification'

type DailyStep = 'subject_pick' | 'intro' | 'warmup' | 'learn' | 'practice' | 'write' | 'victory'

// ---------------------------------------------------------------------------
// XP count-up for the victory screen
// ---------------------------------------------------------------------------
function XPCountUp({ target }: { target: number }) {
  const [displayed, setDisplayed] = useState(0)

  useEffect(() => {
    if (target === 0) return
    const steps = 50
    const increment = Math.ceil(target / steps)
    let current = 0
    const interval = setInterval(() => {
      current = Math.min(current + increment, target)
      setDisplayed(current)
      if (current >= target) clearInterval(interval)
    }, 30)
    return () => clearInterval(interval)
  }, [target])

  return (
    <motion.span
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.5, type: 'spring', stiffness: 200, damping: 14 }}
      className="text-6xl font-black"
      style={{ color: '#ffd700', textShadow: '0 0 30px #ffd700aa' }}
    >
      +{displayed} XP
    </motion.span>
  )
}

// ---------------------------------------------------------------------------
// Step progress dots
// ---------------------------------------------------------------------------
const ACTIVE_STEPS = ['warmup', 'learn', 'practice', 'write'] as const

function StepDots({ step }: { step: DailyStep }) {
  const activeIndex = ACTIVE_STEPS.indexOf(step as typeof ACTIVE_STEPS[number])
  if (activeIndex === -1) return null

  return (
    <div className="flex items-center justify-center gap-2 py-3">
      {ACTIVE_STEPS.map((s, i) => {
        const done = i < activeIndex
        const current = i === activeIndex
        return (
          <motion.div
            key={s}
            animate={{
              scale: current ? 1.3 : 1,
              backgroundColor: done ? '#00ff88' : current ? '#00d4ff' : '#1e2248',
            }}
            transition={{ duration: 0.3 }}
            className="w-2.5 h-2.5 rounded-full"
          />
        )
      })}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Retry overlay for failed steps
// ---------------------------------------------------------------------------
function RetryOverlay({ score, threshold, onRetry }: { score: number; threshold: number; onRetry: () => void }) {
  const messages = [
    'Casi lo logras! Intentalo una vez mas.',
    'No te preocupes, cada intento te hace mas fuerte!',
    'Sigue adelante! La practica hace al maestro.',
  ]
  const msg = messages[Math.floor(Math.random() * messages.length)]

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35 }}
      className="space-y-5 py-6"
    >
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          {[0, 1, 2].map((i) => (
            <Star key={i} size={36} className="text-[#2a2d50]" fill="transparent" />
          ))}
        </div>
        <p className="text-2xl font-black text-white">Necesitas mas practica</p>
        <p className="text-[#8b8fb0] text-base">{msg}</p>
      </div>

      <div
        className="rounded-2xl p-5 space-y-3"
        style={{ background: '#1a1d3a', border: '1px solid #ffffff10' }}
      >
        <div className="flex items-center justify-between">
          <span className="text-[#8b8fb0] text-base">Tu puntuacion</span>
          <span className="text-xl font-bold text-[#ff6b35]">{score}%</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[#8b8fb0] text-base">Necesitas</span>
          <span className="text-xl font-bold text-[#00ff88]">{threshold}%</span>
        </div>
      </div>

      <motion.button
        onClick={onRetry}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full py-3.5 rounded-2xl font-bold text-base flex items-center justify-center gap-2 text-white"
        style={{
          background: 'linear-gradient(135deg, #ff6b35 0%, #ff3ea5 100%)',
        }}
      >
        <RotateCcw size={18} />
        Intentar de nuevo
      </motion.button>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Lesson section renderer
// ---------------------------------------------------------------------------
function renderSection(section: LessonSection, index: number) {
  switch (section.type) {
    case 'text':
      return (
        <div key={index} className="space-y-2">
          {section.title && (
            <h3 className="text-white font-bold text-xl">{section.title}</h3>
          )}
          {section.content && (
            <p className="text-[#c8caeb] leading-relaxed text-base lg:text-lg">
              <MathRenderer content={section.content} />
            </p>
          )}
        </div>
      )

    case 'math':
      return (
        <div key={index} className="space-y-2">
          {section.title && (
            <h3 className="text-white font-bold text-xl">{section.title}</h3>
          )}
          {section.content && (
            <div className="text-[#c8caeb] leading-relaxed text-base lg:text-lg">
              <MathRenderer content={section.content} />
            </div>
          )}
        </div>
      )

    case 'callout':
      return (
        <div
          key={index}
          className="rounded-r-xl px-5 py-4 border-l-4"
          style={{ borderColor: '#00d4ff', background: '#00d4ff0d' }}
        >
          {section.title && (
            <p className="text-sm font-bold uppercase tracking-wider mb-1" style={{ color: '#00d4ff' }}>
              {section.title}
            </p>
          )}
          {section.content && (
            <p className="text-[#c8caeb] text-base lg:text-lg leading-relaxed">{section.content}</p>
          )}
          {section.highlights && section.highlights.length > 0 && (
            <ul className="mt-2 space-y-1">
              {section.highlights.map((h, i) => (
                <li key={i} className="flex items-start gap-2 text-base text-[#c8caeb]">
                  <span style={{ color: '#00d4ff' }}>•</span>
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )

    case 'timeline':
      return (
        <div key={index} className="space-y-2">
          {section.title && (
            <h3 className="text-white font-bold text-xl">{section.title}</h3>
          )}
          {section.highlights && section.highlights.length > 0 && (
            <ul className="space-y-2 pl-2">
              {section.highlights.map((h, i) => (
                <li key={i} className="flex items-start gap-3 text-base text-[#c8caeb]">
                  <span
                    className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                    style={{ background: '#b24bff' }}
                  />
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          )}
          {section.content && (
            <p className="text-[#c8caeb] text-base lg:text-lg leading-relaxed">{section.content}</p>
          )}
        </div>
      )

    case 'image':
    case 'map':
      return (
        <div key={index} className="space-y-2">
          {section.title && (
            <h3 className="text-white font-bold text-xl">{section.title}</h3>
          )}
          <div
            className="w-full h-40 rounded-xl flex items-center justify-center"
            style={{ background: '#1e2248', border: '1px solid #ffffff15' }}
          >
            <span className="text-[#4a4e6a] text-sm">
              {section.type === 'map' ? '🗺️ Mapa' : '🖼️ Imagen'}
              {section.caption ? ` — ${section.caption}` : ''}
            </span>
          </div>
        </div>
      )

    case 'source':
      return (
        <blockquote
          key={index}
          className="border-l-4 border-[#ffd70060] pl-4 py-2 italic"
          style={{ background: '#ffd70008' }}
        >
          {section.title && (
            <p className="text-sm font-semibold text-[#ffd700] uppercase tracking-wider mb-1">
              {section.title}
            </p>
          )}
          {section.content && (
            <p className="text-[#c8caeb] text-base lg:text-lg leading-relaxed">{section.content}</p>
          )}
        </blockquote>
      )

    default:
      return null
  }
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------
export function DailyMissionPage() {
  const navigate = useNavigate()

  const { dailyMissionsToday, getNextDailyLesson, completeDailyMission, completeLesson, completeActivity } =
    useProgressStore()
  const { level, streak, addXP, incrementStreak, addWritingRecord } = usePlayerStore()

  const [selectedSubject, setSelectedSubject] = useState<string | null>(null)

  // Pick tema from the selected subject (or fall back to first tema)
  const subjectTemas = selectedSubject ? getTemasForSubject(selectedSubject) : TEMAS
  const tema = subjectTemas[0] ?? TEMAS[0]
  const lessonIndex = getNextDailyLesson(tema.id)
  const lesson = tema.lessons[lessonIndex % tema.lessons.length]

  const warmupActivity = tema.activities.find(a => a.type === 'quiz') ?? tema.activities[0]
  const practiceActivity = tema.activities.find(a => a.type === 'fill_blank') ?? tema.activities[1]
  const writeActivity = tema.activities.find(a => a.type === 'writing_mission') ?? tema.activities[2]

  const [step, setStep] = useState<DailyStep>('subject_pick')
  const [missionXP, setMissionXP] = useState(0)
  const [lessonCompleted, setLessonCompleted] = useState(false)
  const [victoryTriggered, setVictoryTriggered] = useState(false)

  // Failed step state for retry
  const [failedStep, setFailedStep] = useState<{ step: DailyStep; score: number; threshold: number } | null>(null)
  const [stepKeys, setStepKeys] = useState<Record<string, number>>({ warmup: 0, practice: 0, write: 0 })

  // Pending writing evaluation for persistence on pass
  const [pendingWritingResult, setPendingWritingResult] = useState<EvaluationResult | null>(null)

  // Trigger victory side-effects exactly once
  useEffect(() => {
    if (step === 'victory' && !victoryTriggered) {
      setVictoryTriggered(true)
      incrementStreak()
      completeDailyMission(tema.id, lessonIndex)
    }
  }, [step, victoryTriggered, incrementStreak, completeDailyMission, tema.id, lessonIndex])

  // Scroll to top on step change
  useEffect(() => {
    const main = document.querySelector('main')
    if (main) main.scrollTo(0, 0)
  }, [step, failedStep])

  function handleRetry(stepName: string) {
    setFailedStep(null)
    setPendingWritingResult(null)
    setStepKeys(prev => ({ ...prev, [stepName]: (prev[stepName] ?? 0) + 1 }))
  }

  function startAnotherMission() {
    // Reset state for a fresh mission
    setStep('subject_pick')
    setSelectedSubject(null)
    setMissionXP(0)
    setLessonCompleted(false)
    setVictoryTriggered(false)
    setFailedStep(null)
    setPendingWritingResult(null)
    setStepKeys({ warmup: 0, practice: 0, write: 0 })
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-0 py-8">

        {/* Step dots (shown during active steps) */}
        <AnimatePresence>
          {['warmup', 'learn', 'practice', 'write'].includes(step) && !failedStep && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <StepDots step={step} />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">

          {/* ============================================================
              SUBJECT PICKER
          ============================================================ */}
          {step === 'subject_pick' && (
            <motion.div
              key="subject_pick"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.4 }}
              className="space-y-6 pt-4"
            >
              <div className="text-center space-y-2">
                <motion.div
                  animate={{
                    textShadow: [
                      '0 0 10px #b24bff88',
                      '0 0 30px #b24bffcc',
                      '0 0 10px #b24bff88',
                    ],
                  }}
                  transition={{ repeat: Infinity, duration: 2.5 }}
                  className="text-3xl sm:text-5xl font-black uppercase tracking-widest"
                  style={{ color: '#b24bff' }}
                >
                  MISION DEL DIA
                </motion.div>
                <p className="text-[#8b8fb0] text-lg mt-2">Elige tu asignatura</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {SUBJECT_LIST.map(subject => {
                  const sTemas = getTemasForSubject(subject.id)
                  if (sTemas.length === 0) return null
                  return (
                    <motion.button
                      key={subject.id}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => {
                        setSelectedSubject(subject.id)
                        setStep('intro')
                      }}
                      className="rounded-2xl p-6 text-left transition-all duration-200"
                      style={{
                        background: `linear-gradient(135deg, ${subject.color}15 0%, #1a1d3a 100%)`,
                        border: `1px solid ${subject.color}40`,
                      }}
                    >
                      <div
                        className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl mb-4"
                        style={{
                          background: `${subject.color}18`,
                          border: `1px solid ${subject.color}40`,
                          boxShadow: `0 0 24px ${subject.color}20`,
                        }}
                      >
                        {getTemaEmoji(subject.icon)}
                      </div>
                      <p className="font-black text-white text-xl">{subject.label}</p>
                      <p className="text-[#8b8fb0] text-sm mt-1">{sTemas.length} temas disponibles</p>
                    </motion.button>
                  )
                })}
              </div>
            </motion.div>
          )}

          {/* ============================================================
              INTRO
          ============================================================ */}
          {step === 'intro' && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.4 }}
              className="space-y-6 pt-4"
            >
              {/* Header */}
              <div className="text-center space-y-2">
                <motion.div
                  animate={{
                    textShadow: [
                      '0 0 10px #b24bff88',
                      '0 0 30px #b24bffcc',
                      '0 0 10px #b24bff88',
                    ],
                  }}
                  transition={{ repeat: Infinity, duration: 2.5 }}
                  className="text-3xl sm:text-5xl font-black uppercase tracking-widest"
                  style={{ color: '#b24bff' }}
                >
                  MISION DEL DIA
                </motion.div>
                <p className="text-[#8b8fb0] text-base">Tema {tema.number}: {tema.title}</p>
                <p
                  className="font-bold text-white text-2xl"
                  style={{ textShadow: '0 0 8px #00d4ff55' }}
                >
                  {lesson.title}
                </p>
              </div>

              {/* Missions completed today badge */}
              {dailyMissionsToday > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-2xl p-4 text-center"
                  style={{ background: '#b24bff15', border: '1px solid #b24bff40' }}
                >
                  <p className="text-[#b24bff] font-bold text-base">
                    {dailyMissionsToday} {dailyMissionsToday === 1 ? 'mision completada' : 'misiones completadas'} hoy
                  </p>
                  <p className="text-[#8b8fb0] text-sm mt-1">Sigue adelante para ganar mas XP!</p>
                </motion.div>
              )}

              {/* Briefing card */}
              <div
                className="rounded-2xl p-4 sm:p-5 space-y-4"
                style={{
                  background: 'linear-gradient(135deg, #1a1d3a 0%, #1e1040 100%)',
                  border: '1px solid #b24bff44',
                }}
              >
                <p className="text-sm font-bold uppercase tracking-wider" style={{ color: '#b24bff' }}>
                  Plan de mision
                </p>
                <div className="space-y-3">
                  {[
                    { icon: '🔥', label: 'Calentamiento', desc: 'Quiz rapido para activar tu mente', color: '#ff6b35' },
                    { icon: '📖', label: 'Aprender', desc: 'Lectura del contenido del tema', color: '#00d4ff' },
                    { icon: '✏️', label: 'Practica', desc: 'Completa los huecos', color: '#b24bff' },
                    { icon: '🖊️', label: 'Mision escrita', desc: 'Escribe y demuestra lo aprendido', color: '#00ff88' },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.15 + i * 0.08 }}
                      className="flex items-center gap-3"
                    >
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                        style={{ background: `${item.color}22`, border: `1px solid ${item.color}44` }}
                      >
                        {item.icon}
                      </div>
                      <div>
                        <p className="font-semibold text-white text-base">{item.label}</p>
                        <p className="text-sm text-[#8b8fb0]">{item.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="pt-1 flex items-center gap-2">
                  <Zap size={14} style={{ color: '#ffd700' }} />
                  <span className="text-sm text-[#8b8fb0]">Tiempo estimado: ~15-20 minutos</span>
                </div>

                <div className="pt-1 flex items-center gap-2">
                  <Star size={14} style={{ color: '#ff6b35' }} />
                  <span className="text-sm text-[#8b8fb0]">Necesitas aprobar cada paso para avanzar</span>
                </div>
              </div>

              {/* Begin button */}
              <motion.button
                onClick={() => setStep('warmup')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                animate={{
                  boxShadow: [
                    '0 0 0px #b24bff00',
                    '0 0 24px #b24bff66',
                    '0 0 0px #b24bff00',
                  ],
                }}
                transition={{ boxShadow: { repeat: Infinity, duration: 2 } }}
                className="w-full py-4 rounded-2xl font-black text-lg uppercase tracking-widest text-white"
                style={{
                  background: 'linear-gradient(135deg, #b24bff 0%, #00d4ff 100%)',
                }}
              >
                COMENZAR MISION!
              </motion.button>
            </motion.div>
          )}

          {/* ============================================================
              WARMUP — Quiz
          ============================================================ */}
          {step === 'warmup' && warmupActivity && (
            <motion.div
              key="warmup"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.35 }}
              className="space-y-4 pt-2"
            >
              {/* Step header */}
              <div className="flex items-center gap-2 pb-1">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-base"
                  style={{ background: '#ff6b3522', border: '1px solid #ff6b3544' }}
                >
                  🔥
                </div>
                <div>
                  <p className="text-sm font-bold uppercase tracking-wider" style={{ color: '#ff6b35' }}>
                    Paso 1 — Calentamiento
                  </p>
                  <p className="text-white font-semibold text-base">{warmupActivity.title}</p>
                </div>
              </div>

              {failedStep?.step === 'warmup' ? (
                <RetryOverlay
                  score={failedStep.score}
                  threshold={failedStep.threshold}
                  onRetry={() => handleRetry('warmup')}
                />
              ) : (
                <QuizActivity
                  key={stepKeys.warmup}
                  activity={warmupActivity}
                  temaId={tema.id}
                  onComplete={(score, xpEarned) => {
                    if (isPassing(warmupActivity.type, score)) {
                      addXP(xpEarned)
                      setMissionXP(prev => prev + xpEarned)
                      setStep('learn')
                    } else {
                      setFailedStep({ step: 'warmup', score, threshold: getThreshold(warmupActivity.type) })
                    }
                  }}
                />
              )}
            </motion.div>
          )}

          {/* ============================================================
              LEARN — Lesson content
          ============================================================ */}
          {step === 'learn' && lesson && (
            <motion.div
              key="learn"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.35 }}
              className="space-y-5 pt-2"
            >
              {/* Step header */}
              <div className="flex items-center gap-2 pb-1">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: '#00d4ff22', border: '1px solid #00d4ff44' }}
                >
                  <BookOpen size={16} style={{ color: '#00d4ff' }} />
                </div>
                <div>
                  <p className="text-sm font-bold uppercase tracking-wider" style={{ color: '#00d4ff' }}>
                    Paso 2 — Aprender
                  </p>
                  <p className="text-white font-semibold text-base">{lesson.title}</p>
                </div>
              </div>

              {lesson.subtitle && (
                <p className="text-[#8b8fb0] text-base">{lesson.subtitle}</p>
              )}

              {/* Lesson sections */}
              <div
                className="rounded-2xl p-4 sm:p-5 space-y-5"
                style={{
                  background: '#1a1d3a',
                  border: '1px solid #ffffff10',
                }}
              >
                {lesson.sections.map((section, i) => renderSection(section, i))}
              </div>

              {/* Advance button */}
              <motion.button
                onClick={() => {
                  if (!lessonCompleted) {
                    completeLesson(lesson.id)
                    setLessonCompleted(true)
                  }
                  setStep('practice')
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3.5 rounded-2xl font-bold text-base flex items-center justify-center gap-2"
                style={{
                  background: 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)',
                  color: '#0a0b1a',
                }}
              >
                Siguiente: Practica
                <ChevronRight size={16} />
              </motion.button>
            </motion.div>
          )}

          {/* ============================================================
              PRACTICE — Fill blank
          ============================================================ */}
          {step === 'practice' && practiceActivity && (
            <motion.div
              key="practice"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.35 }}
              className="space-y-4 pt-2"
            >
              {/* Step header */}
              <div className="flex items-center gap-2 pb-1">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-base"
                  style={{ background: '#b24bff22', border: '1px solid #b24bff44' }}
                >
                  ✏️
                </div>
                <div>
                  <p className="text-sm font-bold uppercase tracking-wider" style={{ color: '#b24bff' }}>
                    Paso 3 — Practica
                  </p>
                  <p className="text-white font-semibold text-base">{practiceActivity.title}</p>
                </div>
              </div>

              {failedStep?.step === 'practice' ? (
                <RetryOverlay
                  score={failedStep.score}
                  threshold={failedStep.threshold}
                  onRetry={() => handleRetry('practice')}
                />
              ) : (
                <FillBlankActivity
                  key={stepKeys.practice}
                  activity={practiceActivity}
                  temaId={tema.id}
                  onComplete={(score, xpEarned) => {
                    if (isPassing(practiceActivity.type, score)) {
                      addXP(xpEarned)
                      setMissionXP(prev => prev + xpEarned)
                      setStep('write')
                    } else {
                      setFailedStep({ step: 'practice', score, threshold: getThreshold(practiceActivity.type) })
                    }
                  }}
                />
              )}
            </motion.div>
          )}

          {/* ============================================================
              WRITE — Writing mission
          ============================================================ */}
          {step === 'write' && writeActivity && (
            <motion.div
              key="write"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.35 }}
              className="space-y-4 pt-2"
            >
              {/* Step header */}
              <div className="flex items-center gap-2 pb-1">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: '#00ff8822', border: '1px solid #00ff8844' }}
                >
                  <PenLine size={16} style={{ color: '#00ff88' }} />
                </div>
                <div>
                  <p className="text-sm font-bold uppercase tracking-wider" style={{ color: '#00ff88' }}>
                    Paso 4 — Mision escrita
                  </p>
                  <p className="text-white font-semibold text-base">{writeActivity.title}</p>
                </div>
              </div>

              {failedStep?.step === 'write' ? (
                <RetryOverlay
                  score={failedStep.score}
                  threshold={failedStep.threshold}
                  onRetry={() => handleRetry('write')}
                />
              ) : (
                <WritingMission
                  key={stepKeys.write}
                  activity={writeActivity}
                  temaId={tema.id}
                  onEvaluated={(result: EvaluationResult) => {
                    setPendingWritingResult(result)
                  }}
                  onComplete={(score, xpEarned) => {
                    if (isPassing(writeActivity.type, score)) {
                      addXP(xpEarned)
                      setMissionXP(prev => prev + xpEarned)
                      // Persist writing data
                      if (pendingWritingResult) {
                        completeActivity(writeActivity.id, score)
                        addWritingRecord(tema.id, {
                          activityId: writeActivity.id,
                          score: pendingWritingResult.score,
                          wordCount: pendingWritingResult.wordCount,
                          completedAt: new Date().toISOString(),
                        })
                      }
                      setStep('victory')
                    } else {
                      setFailedStep({ step: 'write', score, threshold: getThreshold(writeActivity.type) })
                    }
                  }}
                />
              )}
            </motion.div>
          )}

          {/* ============================================================
              VICTORY — Fortnite-style celebration
          ============================================================ */}
          {step === 'victory' && (
            <motion.div
              key="victory"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, type: 'spring', stiffness: 180, damping: 18 }}
              className="space-y-6 pt-4 pb-10 text-center"
            >
              {/* Trophy icon */}
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 260, damping: 18 }}
                className="flex justify-center"
              >
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center"
                  style={{
                    background: 'radial-gradient(circle, #ffd70033 0%, #ffd70000 100%)',
                    border: '2px solid #ffd70066',
                    boxShadow: '0 0 40px #ffd70055',
                  }}
                >
                  <Trophy size={44} style={{ color: '#ffd700', filter: 'drop-shadow(0 0 12px #ffd700)' }} />
                </div>
              </motion.div>

              {/* VICTORIA text */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-1"
              >
                <motion.h1
                  animate={{
                    textShadow: [
                      '0 0 20px #ffd700aa',
                      '0 0 50px #ffd700ff',
                      '0 0 20px #ffd700aa',
                    ],
                  }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="text-3xl sm:text-5xl font-black uppercase tracking-widest"
                  style={{ color: '#ffd700' }}
                >
                  VICTORIA!
                </motion.h1>
                <p className="text-[#8b8fb0] text-base uppercase tracking-widest font-semibold">
                  Mision completada
                </p>
              </motion.div>

              {/* Stars */}
              <div className="flex items-center justify-center gap-4">
                {[1, 2, 3].map(i => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, rotate: -30 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{
                      delay: 0.3 + i * 0.15,
                      type: 'spring',
                      stiffness: 260,
                      damping: 18,
                    }}
                  >
                    <Star
                      size={48}
                      className="fill-[#ffd700] text-[#ffd700]"
                      style={{ filter: 'drop-shadow(0 0 10px #ffd700)' }}
                    />
                  </motion.div>
                ))}
              </div>

              {/* XP count-up */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="space-y-1"
              >
                <p className="text-sm text-[#8b8fb0] uppercase tracking-wider font-semibold">
                  XP ganado hoy
                </p>
                <XPCountUp target={missionXP} />
              </motion.div>

              {/* Stats row */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="grid grid-cols-3 gap-3"
              >
                {[
                  {
                    label: 'XP ganado',
                    value: `+${missionXP}`,
                    color: '#ffd700',
                    icon: <Zap size={16} />,
                  },
                  {
                    label: 'Racha actual',
                    value: `${streak} dia${streak !== 1 ? 's' : ''}`,
                    color: '#ff6b35',
                    icon: <Flame size={16} />,
                  },
                  {
                    label: 'Nivel actual',
                    value: `Nv. ${level}`,
                    color: '#00d4ff',
                    icon: <Star size={16} />,
                  },
                ].map((stat, i) => (
                  <div
                    key={i}
                    className="rounded-xl p-3 space-y-1"
                    style={{ background: '#1a1d3a', border: '1px solid #ffffff10' }}
                  >
                    <div
                      className="flex items-center justify-center gap-1 text-xs font-semibold"
                      style={{ color: stat.color }}
                    >
                      {stat.icon}
                    </div>
                    <p className="font-black text-white text-xl leading-tight">{stat.value}</p>
                    <p className="text-[#8b8fb0] text-sm">{stat.label}</p>
                  </div>
                ))}
              </motion.div>

              {/* Mission count badge */}
              {dailyMissionsToday > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.0 }}
                  className="rounded-xl px-4 py-2 inline-block"
                  style={{ background: '#b24bff15', border: '1px solid #b24bff33' }}
                >
                  <p className="text-sm font-bold" style={{ color: '#b24bff' }}>
                    {dailyMissionsToday} {dailyMissionsToday === 1 ? 'mision' : 'misiones'} hoy
                  </p>
                </motion.div>
              )}

              {/* Level title */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.1 }}
                className="rounded-xl px-4 py-3 inline-block"
                style={{ background: '#00d4ff15', border: '1px solid #00d4ff33' }}
              >
                <p className="text-sm text-[#8b8fb0] uppercase tracking-wider mb-0.5">Tu rango</p>
                <p className="font-bold text-base" style={{ color: '#00d4ff' }}>
                  {getLevelTitle(level)}
                </p>
              </motion.div>

              {/* Encouraging message */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                className="text-[#8b8fb0] text-base italic"
              >
                Puedes hacer otra mision o volver manana. Sigue aprendiendo!
              </motion.p>

              {/* Action buttons */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.3 }}
                className="space-y-3"
              >
                <button
                  onClick={startAnotherMission}
                  className="w-full py-3.5 rounded-2xl font-bold text-base"
                  style={{
                    background: 'linear-gradient(135deg, #b24bff 0%, #00d4ff 100%)',
                    color: '#fff',
                  }}
                >
                  Otra Mision
                </button>
                <button
                  onClick={() => navigate('/temas')}
                  className="w-full py-3 rounded-2xl font-semibold text-base"
                  style={{
                    background: '#1a1d3a',
                    border: '1px solid #ffffff15',
                    color: '#c0c4e0',
                  }}
                >
                  Ver mis Temas
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="w-full py-3 rounded-2xl font-semibold text-base"
                  style={{
                    background: 'transparent',
                    color: '#8b8fb0',
                  }}
                >
                  Ir al Inicio
                </button>
              </motion.div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  )
}
