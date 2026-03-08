import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Activity, QuizQuestion } from '../../types/tema'

interface QuizActivityProps {
  activity: Activity
  temaId: string
  onComplete: (score: number, xpEarned: number) => void
}

const TIMER_SECONDS = 30

export function QuizActivity({ activity, onComplete }: QuizActivityProps) {
  const questions = activity.data as QuizQuestion[]
  const total = questions.length

  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [timedOut, setTimedOut] = useState(false)
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS)
  // correctAnswers tracks how many questions were answered correctly up through and including current
  const correctAnswersRef = useRef(0)

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const currentQuestion = questions[currentIndex]
  const answered = selectedOption !== null || timedOut

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  // Start/reset timer when moving to a new question
  useEffect(() => {
    setTimeLeft(TIMER_SECONDS)
    setTimedOut(false)
    setSelectedOption(null)

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  // intentionally only reset when currentIndex changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex])

  // Handle timeout
  useEffect(() => {
    if (timeLeft === 0 && !answered) {
      stopTimer()
      setTimedOut(true)
    }
  }, [timeLeft, answered, stopTimer])

  const handleSelect = (optionIndex: number) => {
    if (answered) return
    stopTimer()
    setSelectedOption(optionIndex)
    if (optionIndex === currentQuestion.correctIndex) {
      correctAnswersRef.current += 1
    }
  }

  const handleContinue = () => {
    if (currentIndex < total - 1) {
      setCurrentIndex((i) => i + 1)
    } else {
      const scorePercent = Math.round((correctAnswersRef.current / total) * 100)
      const xpEarned = Math.max(10, Math.round(activity.xpReward * (scorePercent / 100)))
      onComplete(scorePercent, xpEarned)
    }
  }

  const timerPercent = (timeLeft / TIMER_SECONDS) * 100
  const progressPercent = (currentIndex / total) * 100

  const getOptionAnimateStyle = (optionIndex: number) => {
    if (!answered) return {}
    if (optionIndex === currentQuestion.correctIndex) {
      return { borderColor: '#00ff88', backgroundColor: '#00ff8820' }
    }
    if (optionIndex === selectedOption && optionIndex !== currentQuestion.correctIndex) {
      return { borderColor: '#ff3ea5', backgroundColor: '#ff3ea520' }
    }
    return {}
  }

  const getLabelColor = (optionIndex: number) => {
    if (!answered) return '#8b8fb0'
    if (optionIndex === currentQuestion.correctIndex) return '#00ff88'
    if (optionIndex === selectedOption) return '#ff3ea5'
    return '#8b8fb0'
  }

  return (
    <div className="space-y-4">
      {/* Progress header */}
      <div className="flex items-center justify-between">
        <span className="text-[#00d4ff] text-sm font-semibold">
          Pregunta {currentIndex + 1} de {total}
        </span>
        <span
          className="text-sm font-mono font-bold"
          style={{ color: timeLeft <= 10 ? '#ff6b35' : '#8b8fb0' }}
        >
          {timeLeft}s
        </span>
      </div>

      {/* Question progress bar */}
      <div className="w-full h-2 rounded-full bg-[#1e2248] overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-[#00d4ff]"
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      {/* Timer bar */}
      <div className="w-full h-1.5 rounded-full bg-[#1e2248] overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: timeLeft <= 10 ? '#ff3ea5' : '#ff6b35' }}
          animate={{ width: `${timerPercent}%` }}
          transition={{ duration: 0.95, ease: 'linear' }}
        />
      </div>

      {/* Question card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.3 }}
          className="bg-[#1a1d3a] rounded-2xl p-6 border border-[#ffffff10] space-y-5"
        >
          {/* Optional question image */}
          {currentQuestion.image && (
            <img
              src={currentQuestion.image}
              alt="Imagen de la pregunta"
              className="w-full max-h-52 object-cover rounded-xl border border-[#ffffff15]"
            />
          )}

          {/* Question text */}
          <p className="text-white text-lg font-semibold leading-snug">
            {currentQuestion.question}
          </p>

          {/* Answer options */}
          <div className="space-y-3">
            {currentQuestion.options.map((option, idx) => (
              <motion.button
                key={idx}
                onClick={() => handleSelect(idx)}
                disabled={answered}
                whileHover={!answered ? { scale: 1.02 } : {}}
                whileTap={!answered ? { scale: 0.98 } : {}}
                animate={getOptionAnimateStyle(idx)}
                transition={{ duration: 0.25 }}
                className={`
                  w-full text-left px-4 py-3 rounded-xl border
                  border-[#ffffff15] bg-[#12152e]
                  text-[#e8eaff] text-sm leading-snug
                  ${!answered
                    ? 'cursor-pointer hover:border-[#00d4ff50] hover:bg-[#1e2248]'
                    : 'cursor-default'
                  }
                `}
              >
                <span className="inline-flex items-start gap-3">
                  <span
                    className="shrink-0 w-6 h-6 rounded-full border flex items-center
                      justify-center text-xs font-bold mt-0.5 transition-colors duration-200"
                    style={{ color: getLabelColor(idx), borderColor: getLabelColor(idx) }}
                  >
                    {String.fromCharCode(65 + idx)}
                  </span>
                  {option}
                </span>
              </motion.button>
            ))}
          </div>

          {/* Time out notice */}
          {timedOut && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 rounded-xl bg-[#ff6b3520] border border-[#ff6b3540]"
            >
              <p className="text-[#ff6b35] text-sm font-semibold">¡Se acabó el tiempo!</p>
              <p className="text-[#c0c4e0] text-sm mt-1">
                La respuesta correcta era:{' '}
                <span className="text-[#00ff88] font-semibold">
                  {currentQuestion.options[currentQuestion.correctIndex]}
                </span>
              </p>
              <p className="text-[#8b8fb0] text-xs mt-2 italic">
                {currentQuestion.explanation}
              </p>
            </motion.div>
          )}

          {/* Explanation after selecting */}
          {!timedOut && answered && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className={`p-3 rounded-xl ${
                selectedOption === currentQuestion.correctIndex
                  ? 'bg-[#00ff8818] border border-[#00ff8840]'
                  : 'bg-[#ff3ea518] border border-[#ff3ea540]'
              }`}
            >
              <p
                className="text-sm font-semibold mb-1"
                style={{
                  color:
                    selectedOption === currentQuestion.correctIndex
                      ? '#00ff88'
                      : '#ff3ea5',
                }}
              >
                {selectedOption === currentQuestion.correctIndex
                  ? '¡Correcto!'
                  : 'Incorrecto'}
              </p>
              <p className="text-[#c0c4e0] text-sm leading-relaxed">
                {currentQuestion.explanation}
              </p>
            </motion.div>
          )}

          {/* Continue / finish button */}
          {answered && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex justify-end"
            >
              <motion.button
                onClick={handleContinue}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="px-6 py-2.5 rounded-xl bg-[#00d4ff] text-[#0a0b1a] font-bold
                  text-sm hover:bg-[#00b8e6] transition-colors"
              >
                {currentIndex < total - 1 ? 'Continuar →' : 'Ver resultados'}
              </motion.button>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
