import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Check, X, Lightbulb, ArrowRight, Trophy, RotateCcw,
  Clock, AlertTriangle,
} from 'lucide-react'
import { NeonText } from '../ui/NeonText'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { MathRenderer } from '../ui/MathRenderer'
import type {
  Activity, ExamData, QuizQuestion, FillBlankData,
  EquationBuilderProblem,
} from '../../types/tema'

interface ExamActivityProps {
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

// ─── Timer Bar ───────────────────────────────────────────────────────────────
function TimerBar({ seconds, onExpire }: { seconds: number; onExpire: () => void }) {
  const [remaining, setRemaining] = useState(seconds)

  useEffect(() => {
    setRemaining(seconds)
  }, [seconds])

  useEffect(() => {
    if (remaining <= 0) {
      onExpire()
      return
    }
    const timer = setTimeout(() => setRemaining(r => r - 1), 1000)
    return () => clearTimeout(timer)
  }, [remaining, onExpire])

  const pct = (remaining / seconds) * 100
  const urgent = remaining <= 10

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-1.5">
          <Clock size={14} className={urgent ? 'text-[#ff6b35]' : 'text-[#8b8fb0]'} />
          <span className={urgent ? 'text-[#ff6b35] font-bold' : 'text-[#8b8fb0]'}>
            {remaining}s
          </span>
        </div>
        {urgent && (
          <motion.span
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ repeat: Infinity, duration: 0.8 }}
            className="text-[#ff6b35] text-xs font-bold"
          >
            Date prisa!
          </motion.span>
        )}
      </div>
      <div className="h-1.5 bg-[#1a1d3a] rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{
            background: urgent
              ? 'linear-gradient(90deg, #ff6b35, #ff3ea5)'
              : 'linear-gradient(90deg, #00d4ff, #b24bff)',
          }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </div>
  )
}

// ─── Quiz Question Sub-component ─────────────────────────────────────────────
function QuizItem({
  question, onAnswer, timerKey,
}: {
  question: QuizQuestion
  onAnswer: (correct: boolean) => void
  timerKey: number
}) {
  const [selected, setSelected] = useState<number | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [expired, setExpired] = useState(false)

  const handleSelect = (idx: number) => {
    if (revealed || expired) return
    setSelected(idx)
    setRevealed(true)
    const correct = idx === question.correctIndex
    setTimeout(() => onAnswer(correct), 1400)
  }

  const handleExpire = useCallback(() => {
    if (revealed) return
    setExpired(true)
    setRevealed(true)
    setTimeout(() => onAnswer(false), 1400)
  }, [revealed, onAnswer])

  return (
    <div className="space-y-4" key={timerKey}>
      {!revealed && !expired && (
        <TimerBar seconds={45} onExpire={handleExpire} />
      )}

      {expired && !selected && (
        <div className="flex items-center gap-2 text-[#ff6b35] text-sm font-semibold">
          <AlertTriangle size={16} />
          Tiempo agotado!
        </div>
      )}

      <div className="text-white text-lg leading-relaxed font-medium">
        <MathRenderer content={question.question} />
      </div>

      <div className="space-y-2">
        {question.options.map((opt, i) => {
          const isCorrect = i === question.correctIndex
          const isSelected = i === selected
          let bg = 'rgba(26,29,58,0.8)'
          let border = '1px solid rgba(255,255,255,0.1)'
          let color = '#e8eaff'

          if (revealed) {
            if (isCorrect) {
              bg = 'rgba(0,255,136,0.12)'
              border = '1px solid rgba(0,255,136,0.4)'
              color = '#00ff88'
            } else if (isSelected && !isCorrect) {
              bg = 'rgba(255,107,53,0.12)'
              border = '1px solid rgba(255,107,53,0.4)'
              color = '#ff6b35'
            }
          }

          return (
            <motion.button
              key={i}
              whileTap={!revealed ? { scale: 0.97 } : undefined}
              onClick={() => handleSelect(i)}
              disabled={revealed}
              className="w-full text-left px-4 py-3 rounded-xl text-base transition-all"
              style={{ background: bg, border, color }}
            >
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{
                    background: revealed && isCorrect ? 'rgba(0,255,136,0.2)' : 'rgba(178,75,255,0.15)',
                    color: revealed && isCorrect ? '#00ff88' : '#b24bff',
                    border: revealed && isCorrect ? '1px solid rgba(0,255,136,0.3)' : '1px solid rgba(178,75,255,0.3)',
                  }}
                >
                  {revealed && isCorrect ? <Check size={14} /> : revealed && isSelected ? <X size={14} /> : String.fromCharCode(65 + i)}
                </span>
                <span className="flex-1"><MathRenderer content={opt} /></span>
              </div>
            </motion.button>
          )
        })}
      </div>

      {revealed && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#12152e] rounded-xl px-4 py-3 text-sm text-[#c8caeb]"
        >
          <MathRenderer content={question.explanation} />
        </motion.div>
      )}
    </div>
  )
}

// ─── Fill Blank Sub-component ────────────────────────────────────────────────
function FillBlankItem({
  data, onAnswer, timerKey,
}: {
  data: FillBlankData
  onAnswer: (correct: boolean) => void
  timerKey: number
}) {
  const segments = data.paragraph.split('___')
  const blankCount = segments.length - 1
  const [placed, setPlaced] = useState<(string | null)[]>(Array(blankCount).fill(null))
  const [bankUsed, setBankUsed] = useState<Set<number>>(new Set())
  const [checked, setChecked] = useState(false)
  const [results, setResults] = useState<boolean[]>([])
  const [expired, setExpired] = useState(false)

  const allFilled = placed.every(w => w !== null)
  const nextEmpty = placed.findIndex(w => w === null)

  const handleWordClick = (wordIndex: number, word: string) => {
    if (checked || expired) return
    if (bankUsed.has(wordIndex)) return
    const newPlaced = [...placed]
    const newBank = new Set(bankUsed)
    if (nextEmpty !== -1) {
      newPlaced[nextEmpty] = word
      newBank.add(wordIndex)
    }
    setPlaced(newPlaced)
    setBankUsed(newBank)
  }

  const handleBlankClick = (blankIdx: number) => {
    if (checked || expired) return
    const word = placed[blankIdx]
    if (!word) return
    const newPlaced = [...placed]
    newPlaced[blankIdx] = null
    const bankIdx = data.wordBank.findIndex((w, i) => w === word && bankUsed.has(i))
    const newBank = new Set(bankUsed)
    if (bankIdx >= 0) newBank.delete(bankIdx)
    setPlaced(newPlaced)
    setBankUsed(newBank)
  }

  const handleCheck = () => {
    const res = placed.map((w, i) => w === data.blanks[i])
    setResults(res)
    setChecked(true)
    const score = res.filter(Boolean).length / res.length
    setTimeout(() => onAnswer(score >= 0.5), 1800)
  }

  const handleExpire = useCallback(() => {
    if (checked) return
    setExpired(true)
    const res = placed.map((w, i) => w === data.blanks[i])
    setResults(res)
    setChecked(true)
    setTimeout(() => onAnswer(false), 1800)
  }, [checked, placed, data.blanks, onAnswer])

  return (
    <div className="space-y-4" key={timerKey}>
      {!checked && !expired && (
        <TimerBar seconds={60} onExpire={handleExpire} />
      )}

      {expired && (
        <div className="flex items-center gap-2 text-[#ff6b35] text-sm font-semibold">
          <AlertTriangle size={16} />
          Tiempo agotado!
        </div>
      )}

      {/* Paragraph with blanks */}
      <div className="text-white text-base leading-relaxed">
        {segments.map((seg, i) => (
          <span key={i}>
            <MathRenderer content={seg} />
            {i < blankCount && (
              <button
                onClick={() => handleBlankClick(i)}
                className="inline-flex items-center justify-center min-w-[80px] mx-1 px-2 py-0.5 rounded-lg text-sm font-semibold align-baseline transition-colors"
                style={{
                  background: checked
                    ? results[i] ? 'rgba(0,255,136,0.15)' : 'rgba(255,107,53,0.15)'
                    : placed[i] ? 'rgba(178,75,255,0.2)' : 'rgba(255,255,255,0.05)',
                  border: checked
                    ? results[i] ? '1px solid rgba(0,255,136,0.4)' : '1px solid rgba(255,107,53,0.4)'
                    : placed[i] ? '1px solid rgba(178,75,255,0.4)' : '1px dashed rgba(255,255,255,0.2)',
                  color: checked
                    ? results[i] ? '#00ff88' : '#ff6b35'
                    : placed[i] ? '#e8eaff' : '#4a4e7a',
                }}
              >
                {placed[i] ?? '___'}
              </button>
            )}
          </span>
        ))}
      </div>

      {/* Word bank */}
      <div className="flex flex-wrap gap-2">
        {data.wordBank.map((word, i) => (
          <button
            key={i}
            onClick={() => handleWordClick(i, word)}
            disabled={bankUsed.has(i) || checked || expired}
            className="px-3 py-1.5 rounded-lg text-sm font-semibold transition-all"
            style={{
              background: bankUsed.has(i) ? 'rgba(178,75,255,0.05)' : 'rgba(26,29,58,0.8)',
              border: bankUsed.has(i) ? '1px dashed rgba(178,75,255,0.2)' : '1px solid rgba(255,255,255,0.12)',
              color: bankUsed.has(i) ? '#4a4e7a' : '#e8eaff',
              opacity: bankUsed.has(i) ? 0.4 : 1,
            }}
          >
            <MathRenderer content={word} />
          </button>
        ))}
      </div>

      {!checked && !expired && (
        <Button onClick={handleCheck} variant="primary" size="md" fullWidth disabled={!allFilled}>
          Comprobar
        </Button>
      )}
    </div>
  )
}

// ─── Equation Builder Sub-component (no timer) ──────────────────────────────
function EquationBuilderItem({
  data, onAnswer,
}: {
  data: EquationBuilderProblem
  onAnswer: (correct: boolean) => void
}) {
  const [currentStep, setCurrentStep] = useState(0)
  const [selected, setSelected] = useState<string[]>([])
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [showHint, setShowHint] = useState(false)
  const [mistakes, setMistakes] = useState(0)

  const step = data.steps[currentStep]
  const totalSteps = data.steps.length

  const shuffledParts = useMemo(() => {
    if (!step) return []
    return shuffle([...step.correctParts, ...step.distractors])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep])

  const handleTap = (part: string) => {
    if (feedback) return
    setSelected(prev => {
      const idx = prev.indexOf(part)
      if (idx >= 0) { const n = [...prev]; n.splice(idx, 1); return n }
      return [...prev, part]
    })
  }

  const handleCheck = () => {
    if (!step || feedback) return
    const correct = step.correctParts
    const isCorrect = selected.length === correct.length && selected.every((s, i) => s === correct[i])

    if (isCorrect) {
      setFeedback('correct')
      setTimeout(() => {
        if (currentStep + 1 >= totalSteps) {
          onAnswer(mistakes <= 2) // pass if <= 2 mistakes across all steps
        } else {
          setCurrentStep(prev => prev + 1)
          setSelected([])
          setFeedback(null)
          setShowHint(false)
        }
      }, 1000)
    } else {
      setFeedback('wrong')
      setMistakes(prev => prev + 1)
      setTimeout(() => { setFeedback(null); setSelected([]) }, 1200)
    }
  }

  if (!step) return null

  return (
    <div className="space-y-4">
      {/* No timer label */}
      <div className="flex items-center gap-2 text-sm">
        <Badge color="green" size="sm">Sin limite de tiempo</Badge>
        <span className="text-[#8b8fb0]">Paso {currentStep + 1} de {totalSteps}</span>
      </div>

      {/* Problem */}
      <div
        className="rounded-xl px-4 py-4"
        style={{
          background: 'linear-gradient(135deg, #1e1145 0%, #12152e 100%)',
          border: '1px solid rgba(178,75,255,0.25)',
        }}
      >
        <div className="text-white text-lg font-medium">
          <MathRenderer content={`$${step.prompt}$`} />
        </div>
      </div>

      <p className="text-[#c0c4e0] text-sm text-center">
        Selecciona las partes del <span className="text-[#00d4ff] font-semibold">siguiente paso</span>
      </p>

      {/* Answer line */}
      <div
        className="min-h-[48px] rounded-xl px-3 py-2 flex flex-wrap items-center gap-2"
        style={{
          background: feedback === 'correct' ? 'rgba(0,255,136,0.08)' : feedback === 'wrong' ? 'rgba(255,107,53,0.08)' : 'rgba(26,29,58,0.8)',
          border: feedback === 'correct' ? '2px solid rgba(0,255,136,0.4)' : feedback === 'wrong' ? '2px solid rgba(255,107,53,0.4)' : '2px dashed rgba(255,255,255,0.12)',
        }}
      >
        {selected.length === 0 ? (
          <span className="text-[#4a4e7a] text-sm italic">Toca los elementos...</span>
        ) : (
          selected.map((part, i) => (
            <motion.button
              key={`${part}-${i}`}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={() => !feedback && handleTap(part)}
              className="px-2.5 py-1 rounded-lg text-sm font-semibold"
              style={{
                background: feedback === 'correct' ? 'rgba(0,255,136,0.15)' : feedback === 'wrong' ? 'rgba(255,107,53,0.15)' : 'rgba(178,75,255,0.2)',
                border: feedback === 'correct' ? '1px solid rgba(0,255,136,0.4)' : feedback === 'wrong' ? '1px solid rgba(255,107,53,0.4)' : '1px solid rgba(178,75,255,0.4)',
                color: feedback === 'correct' ? '#00ff88' : feedback === 'wrong' ? '#ff6b35' : '#e8eaff',
              }}
            >
              <MathRenderer content={`$${part}$`} />
            </motion.button>
          ))
        )}
        <AnimatePresence>
          {feedback === 'correct' && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="ml-auto"><Check size={20} className="text-[#00ff88]" /></motion.div>}
          {feedback === 'wrong' && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="ml-auto"><X size={20} className="text-[#ff6b35]" /></motion.div>}
        </AnimatePresence>
      </div>

      {/* Parts bank */}
      <div className="flex flex-wrap gap-2 justify-center">
        {shuffledParts.map((part, i) => {
          const sel = selected.includes(part)
          return (
            <motion.button
              key={`${part}-${i}`}
              whileTap={{ scale: 0.92 }}
              onClick={() => handleTap(part)}
              disabled={!!feedback}
              className="px-3 py-2 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: sel ? 'rgba(178,75,255,0.05)' : 'linear-gradient(135deg, #1a1d3a 0%, #141729 100%)',
                border: sel ? '1px dashed rgba(178,75,255,0.2)' : '1px solid rgba(255,255,255,0.12)',
                color: sel ? '#4a4e7a' : '#e8eaff',
                opacity: sel ? 0.4 : 1,
              }}
            >
              <MathRenderer content={`$${part}$`} />
            </motion.button>
          )
        })}
      </div>

      {/* Hint */}
      {!showHint && (
        <button onClick={() => setShowHint(true)} className="flex items-center gap-2 text-sm text-[#ffd700] font-semibold mx-auto">
          <Lightbulb size={14} /> Pista
        </button>
      )}
      <AnimatePresence>
        {showHint && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="bg-[#ffd70008] border border-[#ffd70020] rounded-xl px-4 py-3 text-sm text-[#c8caeb] flex gap-2">
              <Lightbulb size={14} className="text-[#ffd700] mt-0.5 flex-shrink-0" />
              <MathRenderer content={step.hint} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Buttons */}
      <div className="flex gap-3">
        <Button onClick={() => { setSelected([]); setShowHint(false) }} variant="ghost" size="md" disabled={selected.length === 0 || !!feedback}>
          <RotateCcw size={14} /> Limpiar
        </Button>
        <div className="flex-1">
          <Button onClick={handleCheck} variant="primary" size="md" fullWidth disabled={selected.length === 0 || !!feedback}>
            <ArrowRight size={16} /> Comprobar
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Exam Activity ──────────────────────────────────────────────────────
export function ExamActivity({ activity, onComplete }: ExamActivityProps) {
  const data = activity.data as ExamData
  const total = data.questions.length

  const [current, setCurrent] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [finished, setFinished] = useState(false)

  const question = data.questions[current]

  const handleAnswer = useCallback((isCorrect: boolean) => {
    if (isCorrect) setCorrect(prev => prev + 1)
    setTimeout(() => {
      if (current + 1 >= total) {
        setFinished(true)
      } else {
        setCurrent(prev => prev + 1)
      }
    }, 400)
  }, [current, total])

  const score = total > 0 ? Math.round((correct / total) * 100) : 0

  if (finished) {
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

        <NeonText color={score >= 60 ? 'green' : 'orange'} as="h2" className="text-3xl font-black">
          {score >= 80 ? 'Excelente!' : score >= 60 ? 'Aprobado!' : 'Necesitas repasar'}
        </NeonText>

        <div className="bg-[#12152e] rounded-2xl p-6 border border-[#ffffff10] space-y-4 max-w-sm mx-auto">
          <div className="flex items-center justify-between">
            <span className="text-[#8b8fb0]">Puntuacion</span>
            <span className="text-3xl font-black" style={{ color: score >= 80 ? '#00ff88' : score >= 60 ? '#ffd700' : '#ff6b35' }}>
              {score}%
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#8b8fb0]">Aciertos</span>
            <span className="text-white font-bold">{correct}/{total}</span>
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Button onClick={() => onComplete(score, activity.xpReward)} variant={score >= 60 ? 'success' : 'primary'} size="lg">
            Continuar
          </Button>
        </motion.div>
      </motion.div>
    )
  }

  if (!question) return null

  const typeLabel = question.type === 'quiz' ? 'Pregunta'
    : question.type === 'fill_blank' ? 'Rellenar'
    : 'Construye'

  return (
    <div className="text-white space-y-4 px-0 py-4">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Badge color="purple" size="sm">{typeLabel}</Badge>
            <span className="text-[#8b8fb0]">{current + 1} de {total}</span>
          </div>
          <span className="text-[#00ff88] font-bold">{correct} aciertos</span>
        </div>
        <div className="h-2 bg-[#1a1d3a] rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, #ffd700, #ff6b35)' }}
            animate={{ width: `${(current / total) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>

      {/* Question content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.25 }}
        >
          {question.type === 'quiz' && (
            <QuizItem
              question={question.data}
              onAnswer={handleAnswer}
              timerKey={current}
            />
          )}
          {question.type === 'fill_blank' && (
            <FillBlankItem
              data={question.data}
              onAnswer={handleAnswer}
              timerKey={current}
            />
          )}
          {question.type === 'equation_builder' && (
            <EquationBuilderItem
              data={question.data}
              onAnswer={handleAnswer}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
