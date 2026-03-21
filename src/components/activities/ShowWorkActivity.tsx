import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, CheckCircle, AlertCircle, Send, Calculator, Lightbulb } from 'lucide-react'
import { NeonText } from '../ui/NeonText'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { MathRenderer } from '../ui/MathRenderer'
import { evaluateShowWorkAI } from '../../lib/aiShowWorkEvaluator'
import { evaluateShowWork } from '../../lib/showWorkEvaluator'
import type { EvaluationResult } from '../../types/gamification'
import type { Activity, ShowWorkData } from '../../types/tema'
import { isPassing, getThreshold } from '../../lib/passingThresholds'

interface ShowWorkActivityProps {
  activity: Activity
  temaId?: string
  onComplete: (score: number, xpEarned: number) => void
  onEvaluated?: (result: EvaluationResult) => void
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(w => w.length > 1).length
}

function StarDisplay({ stars }: { stars: number }) {
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

export function ShowWorkActivity({ activity, onComplete, onEvaluated }: ShowWorkActivityProps) {
  const data = activity.data as ShowWorkData
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const [text, setText] = useState('')
  const [showReport, setShowReport] = useState(false)
  const [result, setResult] = useState<EvaluationResult | null>(null)
  const [isEvaluating, setIsEvaluating] = useState(false)
  const [showHints, setShowHints] = useState(false)

  const wordCount = countWords(text)
  const wordsNeeded = Math.max(0, data.minimumWords - wordCount)
  const canSubmit = wordCount >= data.minimumWords

  async function handleSubmit() {
    if (!canSubmit || isEvaluating) return
    setIsEvaluating(true)

    let evaluation: EvaluationResult
    try {
      evaluation = await evaluateShowWorkAI(text, data)
    } catch {
      evaluation = evaluateShowWork(text, data)
    }

    setIsEvaluating(false)
    setResult(evaluation)
    onEvaluated?.(evaluation)
    setShowReport(true)
  }

  function handleContinue() {
    if (!result) return
    onComplete(result.score, activity.xpReward + result.xpBonus)
  }

  const pageVariants = {
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.35 } },
    exit: { opacity: 0, x: -50, transition: { duration: 0.25 } },
  }

  return (
    <div className="text-white">
      <AnimatePresence mode="wait">
        {/* PHASE 1 — Solve & Show Work */}
        {!showReport && (
          <motion.div
            key="work-phase"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="px-0 py-6 space-y-5"
          >
            {/* Top bar */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <Calculator size={20} className="text-[#b24bff]" />
                <h1 className="text-2xl font-bold text-white leading-tight">{activity.title}</h1>
              </div>
              <div className="flex items-center gap-2">
                <Badge color={canSubmit ? 'green' : 'purple'} size="md">
                  {wordCount} palabras / min {data.minimumWords}
                </Badge>
              </div>
            </div>

            {/* Problem callout */}
            <div className="border-l-4 border-[#b24bff] bg-[#b24bff0d] rounded-r-xl px-4 py-3 sm:px-5 sm:py-4">
              <p className="text-sm text-[#8b8fb0] uppercase tracking-wider font-semibold mb-2">
                Problema
              </p>
              <div className="text-white text-xl leading-relaxed">
                <MathRenderer content={data.problem} />
              </div>
            </div>

            {/* Solution steps to show */}
            <div className="bg-[#12152e] rounded-xl px-4 py-3 sm:px-5 sm:py-4 space-y-2">
              <p className="text-sm text-[#8b8fb0] uppercase tracking-wider font-semibold">
                Tu respuesta debe incluir
              </p>
              <ul className="space-y-1">
                {data.solutionSteps.map((step, i) => (
                  <li key={i} className="flex items-start gap-2 text-base text-[#c8caeb]">
                    <span className="text-[#b24bff] mt-0.5 font-bold">{i + 1}.</span>
                    <span><MathRenderer content={step} /></span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Hints (collapsible) */}
            {data.hints && data.hints.length > 0 && (
              <div>
                <button
                  type="button"
                  onClick={() => setShowHints(!showHints)}
                  className="flex items-center gap-2 text-sm text-[#ffd700] font-semibold hover:text-[#ffe44d] transition-colors"
                >
                  <Lightbulb size={16} />
                  {showHints ? 'Ocultar pistas' : 'Mostrar pistas'}
                </button>
                <AnimatePresence>
                  {showHints && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-2 bg-[#ffd70010] border border-[#ffd70025] rounded-xl px-4 py-3 space-y-1">
                        {data.hints.map((hint, i) => (
                          <p key={i} className="text-sm text-[#c8caeb]">
                            <span className="text-[#ffd700]">Pista {i + 1}:</span>{' '}
                            <MathRenderer content={hint} />
                          </p>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Textarea */}
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={text}
                onChange={e => setText(e.target.value)}
                readOnly={isEvaluating}
                rows={6}
                placeholder="Escribe aqui tu solucion paso a paso. Explica cada operacion que hagas y por que..."
                className="
                  w-full bg-[#1a1d3a] border border-[#b24bff30]
                  focus:border-[#b24bff] focus:outline-none focus:ring-1 focus:ring-[#b24bff40]
                  rounded-xl px-5 py-4 text-white placeholder-[#4a4e7a]
                  text-lg leading-relaxed resize-y
                  transition-colors duration-200
                "
              />
              <div className="absolute bottom-3 right-4 pointer-events-none">
                <span className={`text-sm font-semibold ${canSubmit ? 'text-[#00ff88]' : 'text-[#8b8fb0]'}`}>
                  {wordCount} palabras
                </span>
              </div>
            </div>

            {/* Submit */}
            <div className="flex flex-col items-stretch gap-2">
              {isEvaluating ? (
                <div className="flex flex-col items-center gap-3 py-6">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    className="w-10 h-10 rounded-full border-4 border-[#b24bff33] border-t-[#b24bff]"
                  />
                  <p className="text-[#8b8fb0] text-sm">Evaluando tu solucion...</p>
                </div>
              ) : canSubmit ? (
                <motion.div
                  animate={{ boxShadow: ['0 0 0px #b24bff00', '0 0 18px #b24bff55', '0 0 0px #b24bff00'] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="rounded-2xl"
                >
                  <Button onClick={handleSubmit} variant="primary" size="lg" fullWidth>
                    <Send size={18} />
                    Enviar Solucion
                  </Button>
                </motion.div>
              ) : (
                <div>
                  <Button onClick={undefined} variant="secondary" size="lg" fullWidth disabled>
                    <Send size={18} />
                    Enviar Solucion
                  </Button>
                  <p className="text-center text-sm text-[#8b8fb0] mt-2">
                    Necesitas {wordsNeeded} {wordsNeeded === 1 ? 'palabra' : 'palabras'} mas
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* PHASE 2 — Report */}
        {showReport && result && (
          <motion.div
            key="report-phase"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="px-0 py-8 space-y-6"
          >
            <div className="text-center">
              <NeonText color="purple" as="h1" className="text-3xl tracking-widest uppercase">
                Resultado
              </NeonText>
            </div>

            <StarDisplay stars={result.stars} />

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
              <Badge color="purple" size="md">
                {result.wordCount} palabras escritas
              </Badge>
            </div>

            {/* Encouragement */}
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
                  Areas de Mejora
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

            {/* XP / pass-fail */}
            {isPassing('show_work', result.score) ? (
              <>
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
                      ({activity.xpReward} base + {result.xpBonus} bonus)
                    </motion.span>
                  )}
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.75 }}
                >
                  <Button onClick={handleContinue} variant="success" size="lg" fullWidth>
                    Continuar
                  </Button>
                </motion.div>
              </>
            ) : (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="rounded-2xl p-5 text-center space-y-2"
                  style={{ background: '#ff6b3515', border: '1px solid #ff6b3540' }}
                >
                  <p className="text-[#ff6b35] font-bold text-lg">
                    Necesitas {getThreshold('show_work')}% para aprobar
                  </p>
                  <p className="text-[#8b8fb0] text-sm">
                    Revisa los pasos que te faltan y vuelve a intentarlo.
                  </p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.75 }}
                >
                  <Button onClick={handleContinue} variant="primary" size="lg" fullWidth>
                    Continuar
                  </Button>
                </motion.div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
