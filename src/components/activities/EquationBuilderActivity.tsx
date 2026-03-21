import { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, X, Lightbulb, ArrowRight, Trophy, RotateCcw } from 'lucide-react'
import { NeonText } from '../ui/NeonText'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { MathRenderer } from '../ui/MathRenderer'
import type { Activity, EquationBuilderData, EquationBuilderProblem } from '../../types/tema'

interface EquationBuilderActivityProps {
  activity: Activity
  temaId?: string
  onComplete: (score: number, xpEarned: number) => void
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Support both old format (single problem) and new format (problems array)
function getProblems(data: EquationBuilderData): EquationBuilderProblem[] {
  if (data.problems && data.problems.length > 0) return data.problems
  // Backwards compat: old format with top-level problem/steps/finalAnswer
  const legacy = data as unknown as EquationBuilderProblem
  if (legacy.steps) return [legacy]
  return []
}

export function EquationBuilderActivity({ activity, onComplete }: EquationBuilderActivityProps) {
  const data = activity.data as EquationBuilderData
  const problems = useMemo(() => getProblems(data), [data])
  const totalProblems = problems.length

  const [currentProblem, setCurrentProblem] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)
  const [selected, setSelected] = useState<string[]>([])
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [showHint, setShowHint] = useState(false)
  const [mistakes, setMistakes] = useState(0)
  const [totalStepsCompleted, setTotalStepsCompleted] = useState(0)
  const [finished, setFinished] = useState(false)
  const [hintsUsed, setHintsUsed] = useState(0)
  const [showProblemTransition, setShowProblemTransition] = useState(false)

  const problem = problems[currentProblem]
  const step = problem?.steps[currentStep]
  const totalStepsInProblem = problem?.steps.length ?? 0
  const totalStepsAll = problems.reduce((sum, p) => sum + p.steps.length, 0)

  // Shuffle parts once per step (keyed by problem + step)
  const shuffledParts = useMemo(() => {
    if (!step) return []
    return shuffle([...step.correctParts, ...step.distractors])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentProblem, currentStep])

  const handleTapPart = useCallback((part: string) => {
    if (feedback) return
    setSelected(prev => {
      const idx = prev.indexOf(part)
      if (idx >= 0) {
        const next = [...prev]
        next.splice(idx, 1)
        return next
      }
      return [...prev, part]
    })
  }, [feedback])

  const handleCheck = useCallback(() => {
    if (!step || feedback) return
    const correct = step.correctParts
    const isCorrect =
      selected.length === correct.length &&
      selected.every((s, i) => s === correct[i])

    if (isCorrect) {
      setFeedback('correct')
      setTotalStepsCompleted(prev => prev + 1)
      setTimeout(() => {
        if (currentStep + 1 >= totalStepsInProblem) {
          // Problem complete — move to next problem or finish
          if (currentProblem + 1 >= totalProblems) {
            setFinished(true)
          } else {
            // Show transition screen
            setShowProblemTransition(true)
          }
        } else {
          setCurrentStep(prev => prev + 1)
          setSelected([])
          setFeedback(null)
          setShowHint(false)
        }
      }, 1200)
    } else {
      setFeedback('wrong')
      setMistakes(prev => prev + 1)
      setTimeout(() => {
        setFeedback(null)
        setSelected([])
      }, 1500)
    }
  }, [step, selected, feedback, currentStep, totalStepsInProblem, currentProblem, totalProblems])

  const handleNextProblem = useCallback(() => {
    setCurrentProblem(prev => prev + 1)
    setCurrentStep(0)
    setSelected([])
    setFeedback(null)
    setShowHint(false)
    setShowProblemTransition(false)
  }, [])

  const handleShowHint = useCallback(() => {
    if (!showHint) setHintsUsed(prev => prev + 1)
    setShowHint(true)
  }, [showHint])

  // Score: start at 100, lose 10 per mistake, lose 3 per hint, minimum 20
  const score = Math.max(20, 100 - mistakes * 10 - hintsUsed * 3)

  // Problem transition screen
  if (showProblemTransition && problem) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="px-0 py-10 space-y-6 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 14 }}
        >
          <Check size={56} className="mx-auto text-[#00ff88] drop-shadow-[0_0_12px_#00ff8888]" />
        </motion.div>

        <div className="space-y-2">
          <NeonText color="green" as="h2" className="text-2xl font-black">
            Problema {currentProblem + 1} resuelto!
          </NeonText>
          <p className="text-[#8b8fb0]">
            Respuesta: <span className="text-[#00d4ff] font-bold">
              <MathRenderer content={`$${problem.finalAnswer}$`} />
            </span>
          </p>
        </div>

        <div className="flex items-center justify-center gap-2">
          {problems.map((_, i) => (
            <div
              key={i}
              className="w-3 h-3 rounded-full transition-colors"
              style={{
                background: i <= currentProblem ? '#00ff88' : '#2a2d50',
                boxShadow: i <= currentProblem ? '0 0 8px #00ff8844' : 'none',
              }}
            />
          ))}
        </div>

        <p className="text-[#c0c4e0]">
          Siguiente: problema {currentProblem + 2} de {totalProblems}
        </p>

        <Button onClick={handleNextProblem} variant="primary" size="lg">
          <ArrowRight size={18} />
          Siguiente problema
        </Button>
      </motion.div>
    )
  }

  // Final completion screen
  if (finished) {
    const lastProblem = problems[problems.length - 1]
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="px-0 py-8 space-y-6 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 14 }}
        >
          <Trophy size={64} className="mx-auto text-[#ffd700] drop-shadow-[0_0_16px_#ffd70088]" />
        </motion.div>

        <NeonText color="green" as="h2" className="text-3xl font-black">
          {totalProblems > 1 ? `${totalProblems} problemas completados!` : 'Completado!'}
        </NeonText>

        <div className="bg-[#12152e] rounded-2xl p-6 border border-[#ffffff10] space-y-4 max-w-sm mx-auto">
          <div className="flex items-center justify-between">
            <span className="text-[#8b8fb0]">Puntuacion</span>
            <span
              className="text-3xl font-black"
              style={{ color: score >= 80 ? '#00ff88' : score >= 50 ? '#ffd700' : '#ff6b35' }}
            >
              {score}%
            </span>
          </div>
          {totalProblems > 1 && (
            <div className="flex items-center justify-between">
              <span className="text-[#8b8fb0]">Problemas</span>
              <span className="text-white font-bold">{totalProblems}/{totalProblems}</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-[#8b8fb0]">Pasos resueltos</span>
            <span className="text-white font-bold">{totalStepsCompleted}/{totalStepsAll}</span>
          </div>
          {mistakes > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-[#8b8fb0]">Errores</span>
              <span className="text-[#ff6b35] font-bold">{mistakes}</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-[#8b8fb0]">Ultima respuesta</span>
            <span className="text-[#00d4ff] font-bold text-lg">
              <MathRenderer content={`$${lastProblem?.finalAnswer ?? ''}$`} />
            </span>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Button
            onClick={() => onComplete(score, activity.xpReward)}
            variant="success"
            size="lg"
          >
            Continuar
          </Button>
        </motion.div>
      </motion.div>
    )
  }

  if (!step || !problem) return null

  const isSelected = (part: string) => selected.includes(part)
  const canCheck = selected.length > 0

  // Calculate global step progress
  const stepsBeforeThisProblem = problems.slice(0, currentProblem).reduce((s, p) => s + p.steps.length, 0)
  const globalStep = stepsBeforeThisProblem + currentStep

  return (
    <div className="text-white space-y-5 px-0 py-4">
      {/* Problem indicator + progress bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            {totalProblems > 1 && (
              <Badge color="purple" size="sm">
                Problema {currentProblem + 1}/{totalProblems}
              </Badge>
            )}
            <span className="text-[#8b8fb0]">Paso {currentStep + 1} de {totalStepsInProblem}</span>
          </div>
          <Badge color="yellow" size="sm">
            {mistakes === 0 ? 'Sin errores' : `${mistakes} error${mistakes > 1 ? 'es' : ''}`}
          </Badge>
        </div>
        <div className="h-2 bg-[#1a1d3a] rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, #b24bff, #00d4ff)' }}
            animate={{ width: `${(globalStep / totalStepsAll) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>

      {/* Current expression */}
      <div
        className="rounded-2xl px-5 py-5"
        style={{
          background: 'linear-gradient(135deg, #1e1145 0%, #12152e 100%)',
          border: '1px solid rgba(178,75,255,0.25)',
          boxShadow: '0 8px 32px rgba(178,75,255,0.08)',
        }}
      >
        <p className="text-xs text-[#b24bff] uppercase tracking-[0.2em] font-bold mb-3">
          Expresion actual
        </p>
        <div className="text-white text-xl sm:text-2xl leading-relaxed font-medium">
          <MathRenderer content={`$${step.prompt}$`} />
        </div>
      </div>

      {/* Instruction */}
      <p className="text-[#c0c4e0] text-base text-center">
        Selecciona las partes que forman el <span className="text-[#00d4ff] font-semibold">siguiente paso</span>
      </p>

      {/* Answer line — shows selected parts */}
      <div
        className="min-h-[56px] rounded-xl px-4 py-3 flex flex-wrap items-center gap-2 transition-colors"
        style={{
          background: feedback === 'correct'
            ? 'rgba(0,255,136,0.08)'
            : feedback === 'wrong'
              ? 'rgba(255,107,53,0.08)'
              : 'rgba(26,29,58,0.8)',
          border: feedback === 'correct'
            ? '2px solid rgba(0,255,136,0.4)'
            : feedback === 'wrong'
              ? '2px solid rgba(255,107,53,0.4)'
              : '2px dashed rgba(255,255,255,0.12)',
        }}
      >
        {selected.length === 0 ? (
          <span className="text-[#4a4e7a] text-sm italic">Toca los elementos abajo para construir el paso...</span>
        ) : (
          selected.map((part, i) => (
            <motion.button
              key={`${part}-${i}`}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={() => !feedback && handleTapPart(part)}
              className="px-3 py-1.5 rounded-lg text-base font-semibold cursor-pointer transition-colors"
              style={{
                background: feedback === 'correct'
                  ? 'rgba(0,255,136,0.15)'
                  : feedback === 'wrong'
                    ? 'rgba(255,107,53,0.15)'
                    : 'rgba(178,75,255,0.2)',
                border: feedback === 'correct'
                  ? '1px solid rgba(0,255,136,0.4)'
                  : feedback === 'wrong'
                    ? '1px solid rgba(255,107,53,0.4)'
                    : '1px solid rgba(178,75,255,0.4)',
                color: feedback === 'correct' ? '#00ff88' : feedback === 'wrong' ? '#ff6b35' : '#e8eaff',
              }}
            >
              <MathRenderer content={`$${part}$`} />
            </motion.button>
          ))
        )}

        {/* Feedback icon */}
        <AnimatePresence>
          {feedback === 'correct' && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="ml-auto"
            >
              <Check size={24} className="text-[#00ff88]" />
            </motion.div>
          )}
          {feedback === 'wrong' && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="ml-auto"
            >
              <X size={24} className="text-[#ff6b35]" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Parts bank */}
      <div className="flex flex-wrap gap-2 justify-center">
        {shuffledParts.map((part, i) => {
          const sel = isSelected(part)
          return (
            <motion.button
              key={`${part}-${i}`}
              whileTap={{ scale: 0.92 }}
              onClick={() => handleTapPart(part)}
              disabled={!!feedback}
              className="px-4 py-2.5 rounded-xl text-base font-semibold transition-all duration-150"
              style={{
                background: sel
                  ? 'rgba(178,75,255,0.05)'
                  : 'linear-gradient(135deg, #1a1d3a 0%, #141729 100%)',
                border: sel
                  ? '1px dashed rgba(178,75,255,0.2)'
                  : '1px solid rgba(255,255,255,0.12)',
                color: sel ? '#4a4e7a' : '#e8eaff',
                opacity: sel ? 0.4 : 1,
                cursor: feedback ? 'default' : 'pointer',
              }}
            >
              <MathRenderer content={`$${part}$`} />
            </motion.button>
          )
        })}
      </div>

      {/* Hint */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={handleShowHint}
          className="flex items-center gap-2 text-sm text-[#ffd700] font-semibold hover:text-[#ffe44d] transition-colors"
        >
          <Lightbulb size={16} />
          {showHint ? '' : 'Necesito una pista'}
        </button>
      </div>

      <AnimatePresence>
        {showHint && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-[#ffd70008] border border-[#ffd70020] rounded-xl px-4 py-3">
              <p className="text-sm text-[#c8caeb] flex items-start gap-2">
                <Lightbulb size={14} className="text-[#ffd700] mt-0.5 flex-shrink-0" />
                <MathRenderer content={step.hint} />
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Check / Reset buttons */}
      <div className="flex gap-3">
        <Button
          onClick={() => { setSelected([]); setShowHint(false) }}
          variant="ghost"
          size="md"
          disabled={selected.length === 0 || !!feedback}
        >
          <RotateCcw size={16} />
          Limpiar
        </Button>
        <div className="flex-1">
          <Button
            onClick={handleCheck}
            variant="primary"
            size="lg"
            fullWidth
            disabled={!canCheck || !!feedback}
          >
            <ArrowRight size={18} />
            Comprobar
          </Button>
        </div>
      </div>
    </div>
  )
}
