import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, CheckCircle, AlertCircle, Send, FileText } from 'lucide-react'
import { NeonText } from '../ui/NeonText'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { evaluateWriting } from '../../lib/writingEvaluator'
import { evaluateWritingAI } from '../../lib/aiWritingEvaluator'
import type { EvaluationResult } from '../../types/gamification'
import type { Activity, WritingMissionData } from '../../types/tema'
interface WritingMissionProps {
  activity: Activity
  temaId?: string
  onComplete: (score: number, xpEarned: number) => void
  onEvaluated?: (result: EvaluationResult) => void
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(w => w.length > 1).length
}

// ---------------------------------------------------------------------------
// Chip component — a small clickable tag for starters, vocabulary, connectors
// ---------------------------------------------------------------------------
function Chip({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.93 }}
      whileHover={{ scale: 1.05 }}
      className="
        inline-block cursor-pointer select-none
        bg-[#00d4ff15] text-[#00d4ff] border border-[#00d4ff33]
        rounded-full px-3 py-2 text-sm font-medium
        hover:bg-[#00d4ff25] hover:border-[#00d4ff66]
        transition-colors duration-150
      "
    >
      {label}
    </motion.button>
  )
}

// ---------------------------------------------------------------------------
// Star display — three stars, filled according to result.stars (1–5 mapped to 3)
// ---------------------------------------------------------------------------
function StarDisplay({ stars }: { stars: number }) {
  // Map 1–5 scale to 1–3 visual stars
  const visualStars = stars >= 4 ? 3 : stars >= 2 ? 2 : 1

  return (
    <div className="flex items-center justify-center gap-3">
      {[1, 2, 3].map(i => (
        <motion.div
          key={i}
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.3 + i * 0.15, type: 'spring', stiffness: 260, damping: 18 }}
        >
          <Star
            size={44}
            className={
              i <= visualStars
                ? 'text-[#ffd700] fill-[#ffd700] drop-shadow-[0_0_8px_#ffd700]'
                : 'text-[#1e2248] fill-[#1e2248]'
            }
          />
        </motion.div>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// XP count-up number
// ---------------------------------------------------------------------------
function XPCountUp({ target }: { target: number }) {
  const [displayed, setDisplayed] = useState(0)

  useEffect(() => {
    if (target === 0) return
    const steps = 40
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
      transition={{ delay: 0.6, type: 'spring', stiffness: 200, damping: 14 }}
      className="text-5xl font-black text-[#ffd700] text-glow-yellow"
    >
      +{displayed} XP
    </motion.span>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export function WritingMission({ activity, onComplete, onEvaluated }: WritingMissionProps) {
  const data = activity.data as WritingMissionData
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const [text, setText] = useState('')
  const [showReport, setShowReport] = useState(false)
  const [result, setResult] = useState<EvaluationResult | null>(null)
  const [isEvaluating, setIsEvaluating] = useState(false)

  const wordCount = countWords(text)
  const wordsNeeded = Math.max(0, data.minimumWords - wordCount)
  const canSubmit = wordCount >= data.minimumWords
  const isScaffolded = data.scaffoldLevel <= 3

  // Append text to textarea at cursor or end
  function appendToTextarea(snippet: string) {
    const el = textareaRef.current
    if (!el) {
      setText(prev => prev + (prev.endsWith(' ') || prev === '' ? '' : ' ') + snippet + ' ')
      return
    }
    const start = el.selectionStart ?? text.length
    const end = el.selectionEnd ?? text.length
    const before = text.slice(0, start)
    const after = text.slice(end)
    const separator = before.length > 0 && !before.endsWith(' ') ? ' ' : ''
    const newText = before + separator + snippet + ' ' + after
    setText(newText)
    // Restore focus and move cursor to after inserted text
    requestAnimationFrame(() => {
      el.focus()
      const newPos = before.length + separator.length + snippet.length + 1
      el.setSelectionRange(newPos, newPos)
    })
  }

  async function handleSubmit() {
    if (!canSubmit || isEvaluating) return
    setIsEvaluating(true)

    let evaluation: EvaluationResult
    try {
      evaluation = await evaluateWritingAI(text, data)
    } catch {
      evaluation = evaluateWriting(text, data)
    }

    setIsEvaluating(false)
    setResult(evaluation)

    // Notify parent of evaluation result (parent decides whether to persist)
    onEvaluated?.(evaluation)

    setShowReport(true)
  }

  function handleContinue() {
    if (!result) return
    onComplete(result.score, activity.xpReward + result.xpBonus)
  }

  // Shared page transition variants
  const pageVariants = {
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.35 } },
    exit: { opacity: 0, x: -50, transition: { duration: 0.25 } },
  }

  return (
    <div className="text-white">
      <AnimatePresence mode="wait">
        {/* ================================================================
            PHASE 1 — Writing phase
        ================================================================ */}
        {!showReport && (
          <motion.div
            key="writing-phase"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="px-0 py-6 space-y-5"
          >
            {/* Top bar */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <FileText size={20} className="text-[#00d4ff]" />
                <h1 className="text-2xl font-bold text-white leading-tight">{activity.title}</h1>
              </div>
              <div className="flex items-center gap-2">
                <Badge color={canSubmit ? 'green' : 'blue'} size="md">
                  {wordCount} palabras / mínimo {data.minimumWords}
                </Badge>
              </div>
            </div>

            {/* Prompt callout */}
            <div className="border-l-4 border-[#00d4ff] bg-[#00d4ff0d] rounded-r-xl px-4 py-3 sm:px-5 sm:py-4">
              <p className="text-sm text-[#8b8fb0] uppercase tracking-wider font-semibold mb-1">
                Misión de escritura
              </p>
              <p className="text-white text-xl leading-relaxed">{data.prompt}</p>
            </div>

            {/* Key points (all scaffold levels) */}
            {data.keyPointsToAddress && data.keyPointsToAddress.length > 0 && (
              <div className="bg-[#12152e] rounded-xl px-4 py-3 sm:px-5 sm:py-4 space-y-2">
                <p className="text-sm text-[#8b8fb0] uppercase tracking-wider font-semibold">
                  Puntos clave a desarrollar
                </p>
                <ul className="space-y-1">
                  {data.keyPointsToAddress.map((point, i) => (
                    <li key={i} className="flex items-start gap-2 text-base text-[#c8caeb]">
                      <span className="text-[#00d4ff] mt-0.5">•</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Scaffolding panels — only if scaffoldLevel <= 3 */}
            {isScaffolded && (
              <div className="space-y-4">
                {/* Sentence starters */}
                {data.sentenceStarters && data.sentenceStarters.length > 0 && (
                  <div className="bg-[#12152e] rounded-xl px-4 py-3 sm:px-5 sm:py-4 space-y-3">
                    <p className="text-sm text-[#8b8fb0] uppercase tracking-wider font-semibold">
                      Iniciadores de frases
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {data.sentenceStarters.map((starter, i) => (
                        <Chip
                          key={i}
                          label={starter}
                          onClick={() => appendToTextarea(starter)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Vocabulary hints */}
                {data.vocabularyHints && data.vocabularyHints.length > 0 && (
                  <div className="bg-[#12152e] rounded-xl px-4 py-3 sm:px-5 sm:py-4 space-y-3">
                    <p className="text-sm text-[#8b8fb0] uppercase tracking-wider font-semibold">
                      Vocabulario
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {data.vocabularyHints.map((word, i) => (
                        <Chip
                          key={i}
                          label={word}
                          onClick={() => appendToTextarea(word)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Connectors */}
                {data.connectors && data.connectors.length > 0 && (
                  <div className="bg-[#12152e] rounded-xl px-4 py-3 sm:px-5 sm:py-4 space-y-3">
                    <p className="text-sm text-[#8b8fb0] uppercase tracking-wider font-semibold">
                      Conectores
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {data.connectors.map((connector, i) => (
                        <Chip
                          key={i}
                          label={connector}
                          onClick={() => appendToTextarea(connector)}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Textarea */}
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={text}
                onChange={e => setText(e.target.value)}
                readOnly={isEvaluating}
                rows={5}
                placeholder="Escribe aquí tu respuesta... Usa los iniciadores y el vocabulario para desarrollar tus ideas."
                className="
                  w-full bg-[#1a1d3a] border border-[#00d4ff30]
                  focus:border-[#00d4ff] focus:outline-none focus:ring-1 focus:ring-[#00d4ff40]
                  rounded-xl px-5 py-4 text-white placeholder-[#4a4e7a]
                  text-lg leading-relaxed resize-y
                  transition-colors duration-200
                "
              />
              {/* Live word count overlay */}
              <div className="absolute bottom-3 right-4 pointer-events-none">
                <span className={`text-sm font-semibold ${canSubmit ? 'text-[#00ff88]' : 'text-[#8b8fb0]'}`}>
                  {wordCount} palabras
                </span>
              </div>
            </div>

            {/* Submit button */}
            <div className="flex flex-col items-stretch gap-2">
              {isEvaluating ? (
                <div className="flex flex-col items-center gap-3 py-6">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    className="w-10 h-10 rounded-full border-4 border-[#00d4ff33] border-t-[#00d4ff]"
                  />
                  <p className="text-[#8b8fb0] text-sm">Evaluando tu misión...</p>
                </div>
              ) : canSubmit ? (
                <motion.div
                  animate={{ boxShadow: ['0 0 0px #00d4ff00', '0 0 18px #00d4ff55', '0 0 0px #00d4ff00'] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="rounded-2xl"
                >
                  <Button
                    onClick={handleSubmit}
                    variant="primary"
                    size="lg"
                    fullWidth
                  >
                    <Send size={18} />
                    Enviar Misión
                  </Button>
                </motion.div>
              ) : (
                <div>
                  <Button
                    onClick={undefined}
                    variant="secondary"
                    size="lg"
                    fullWidth
                    disabled
                  >
                    <Send size={18} />
                    Enviar Misión
                  </Button>
                  <p className="text-center text-sm text-[#8b8fb0] mt-2">
                    Necesitas {wordsNeeded} {wordsNeeded === 1 ? 'palabra' : 'palabras'} más
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ================================================================
            PHASE 2 — Mission report
        ================================================================ */}
        {showReport && result && (
          <motion.div
            key="report-phase"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="px-0 py-8 space-y-6"
          >
            {/* Title */}
            <div className="text-center">
              <NeonText color="purple" as="h1" className="text-3xl tracking-widest uppercase">
                Informe de Misión
              </NeonText>
            </div>

            {/* Stars */}
            <StarDisplay stars={result.stars} />

            {/* Score + word count */}
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
                className="text-center"
              >
                <span className="text-6xl font-black text-white">{result.score}</span>
                <span className="text-2xl font-bold text-[#8b8fb0]">%</span>
              </motion.div>
              <Badge color="blue" size="md">
                {result.wordCount} palabras escritas
              </Badge>
            </div>

            {/* Encouragement callout */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="border-l-4 border-[#b24bff] bg-[#b24bff0d] rounded-r-xl px-5 py-4"
            >
              <p className="text-[#c8caeb] text-base leading-relaxed italic">
                {result.encouragement}
              </p>
            </motion.div>

            {/* Strengths */}
            {result.strengths.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 }}
                className="bg-[#12152e] rounded-xl px-5 py-4 space-y-2"
              >
                <p className="text-sm text-[#00ff88] uppercase tracking-wider font-semibold">
                  Puntos Fuertes
                </p>
                <ul className="space-y-2">
                  {result.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-base text-[#c8caeb]">
                      <CheckCircle size={16} className="text-[#00ff88] mt-0.5 flex-shrink-0" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}

            {/* Improvements */}
            {result.improvements.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.65 }}
                className="bg-[#12152e] rounded-xl px-5 py-4 space-y-2"
              >
                <p className="text-sm text-[#ff6b35] uppercase tracking-wider font-semibold">
                  Áreas de Mejora
                </p>
                <ul className="space-y-2">
                  {result.improvements.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-base text-[#c8caeb]">
                      <AlertCircle size={16} className="text-[#ff6b35] mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}

            {/* XP earned */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col items-center gap-1 py-4"
            >
              <p className="text-base text-[#8b8fb0] uppercase tracking-wider font-semibold">
                XP Ganados
              </p>
              <XPCountUp target={activity.xpReward + result.xpBonus} />
              {result.xpBonus > 0 && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1 }}
                  className="text-xs text-[#ffd700] font-semibold"
                >
                  ({activity.xpReward} base + {result.xpBonus} bonus por puntuacion alta)
                </motion.span>
              )}
            </motion.div>

            {/* Continue button */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.75 }}
            >
              <Button onClick={handleContinue} variant="success" size="lg" fullWidth>
                Continuar
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
