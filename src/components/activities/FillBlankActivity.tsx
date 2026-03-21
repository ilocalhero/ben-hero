import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Activity, FillBlankData } from '../../types/tema'
import { MathRenderer } from '../ui/MathRenderer'

interface FillBlankActivityProps {
  activity: Activity
  temaId: string
  onComplete: (score: number, xpEarned: number) => void
}

type CheckState = 'unchecked' | 'checked'

export function FillBlankActivity({ activity, onComplete }: FillBlankActivityProps) {
  const data = activity.data as FillBlankData

  // Split paragraph on ___ to get text segments
  const segments = data.paragraph.split('___')
  const blankCount = segments.length - 1

  // Placed words: one slot per blank (null = empty)
  const [placed, setPlaced] = useState<(string | null)[]>(
    Array.from({ length: blankCount }, () => null)
  )
  // Word bank: tracks which words are still available (by original index in wordBank)
  const [bankUsed, setBankUsed] = useState<Set<number>>(new Set())
  const [checkState, setCheckState] = useState<CheckState>('unchecked')
  const [results, setResults] = useState<boolean[]>([])

  const allFilled = placed.every((w) => w !== null)

  // Find the next empty blank index
  const nextEmpty = placed.findIndex((w) => w === null)

  // Handle clicking a word from the bank
  const handleWordClick = (wordIndex: number, word: string) => {
    if (checkState === 'checked') return

    if (bankUsed.has(wordIndex)) return // already placed

    const newPlaced = [...placed]
    const newBankUsed = new Set(bankUsed)

    if (nextEmpty !== -1) {
      newPlaced[nextEmpty] = word
      newBankUsed.add(wordIndex)
    } else {
      // All filled — replace last blank
      const lastIndex = blankCount - 1
      const previousWord = newPlaced[lastIndex]
      // Return the replaced word to bank
      if (previousWord !== null) {
        const prevBankIdx = data.wordBank.findIndex(
          (w, i) => w === previousWord && newBankUsed.has(i)
        )
        if (prevBankIdx !== -1) {
          newBankUsed.delete(prevBankIdx)
        }
      }
      newPlaced[lastIndex] = word
      newBankUsed.add(wordIndex)
    }

    setPlaced(newPlaced)
    setBankUsed(newBankUsed)
  }

  // Handle clicking a filled blank to remove the word
  const handleBlankClick = (blankIndex: number) => {
    if (checkState === 'checked') return

    const word = placed[blankIndex]
    if (word === null) return

    const newPlaced = [...placed]
    newPlaced[blankIndex] = null

    const newBankUsed = new Set(bankUsed)
    // Find the word's index in the original bank and free it
    const bankIdx = data.wordBank.findIndex((w, i) => w === word && newBankUsed.has(i))
    if (bankIdx !== -1) {
      newBankUsed.delete(bankIdx)
    }

    setPlaced(newPlaced)
    setBankUsed(newBankUsed)
  }

  const handleCheck = () => {
    if (!allFilled) return
    const res = placed.map((word, i) => word === data.blanks[i])
    setResults(res)
    setCheckState('checked')
  }

  const handleComplete = () => {
    const correctCount = results.filter(Boolean).length
    const scorePercent = Math.round((correctCount / blankCount) * 100)
    const xpEarned = Math.max(10, Math.round(activity.xpReward * (scorePercent / 100)))
    onComplete(scorePercent, xpEarned)
  }

  const getBlankBorderColor = (blankIndex: number) => {
    if (checkState === 'unchecked') return '#b24bff'
    return results[blankIndex] ? '#00ff88' : '#ff3ea5'
  }

  const getBlankTextColor = (blankIndex: number) => {
    if (checkState === 'unchecked') return '#00d4ff'
    return results[blankIndex] ? '#00ff88' : '#ff3ea5'
  }

  return (
    <div className="space-y-6">
      {/* Activity card */}
      <div className="bg-[#1a1d3a] rounded-2xl p-4 sm:p-6 border border-[#ffffff10] space-y-6">

        {/* Paragraph with blanks */}
        <div>
          <p className="text-[#8b8fb0] text-sm font-semibold uppercase tracking-wider mb-3">
            Completa el texto
          </p>
          <div className="text-[#e8eaff] text-xl leading-10 select-none">
            {segments.map((segment, segIdx) => (
              <span key={segIdx}>
                <MathRenderer content={segment} />
                {segIdx < blankCount && (
                  <motion.button
                    onClick={() => handleBlankClick(segIdx)}
                    disabled={checkState === 'checked'}
                    whileHover={
                      placed[segIdx] !== null && checkState === 'unchecked'
                        ? { scale: 1.05 }
                        : {}
                    }
                    whileTap={
                      placed[segIdx] !== null && checkState === 'unchecked'
                        ? { scale: 0.95 }
                        : {}
                    }
                    className={`
                      inline-flex items-center justify-center
                      mx-1 px-3 py-0.5 rounded-lg border-2 border-dashed
                      min-w-[80px] text-base font-semibold
                      transition-colors duration-200
                      ${placed[segIdx] !== null && checkState === 'unchecked'
                        ? 'cursor-pointer'
                        : 'cursor-default'
                      }
                    `}
                    style={{
                      borderColor: getBlankBorderColor(segIdx),
                      color: placed[segIdx] ? getBlankTextColor(segIdx) : '#4a4e6a',
                      backgroundColor: placed[segIdx]
                        ? checkState === 'checked'
                          ? results[segIdx]
                            ? '#00ff8810'
                            : '#ff3ea510'
                          : '#00d4ff10'
                        : 'transparent',
                    }}
                  >
                    {placed[segIdx] ?? '\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0'}
                  </motion.button>
                )}
              </span>
            ))}
          </div>
        </div>

        {/* Wrong answer corrections */}
        <AnimatePresence>
          {checkState === 'checked' && results.some((r) => !r) && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 rounded-xl bg-[#ff3ea510] border border-[#ff3ea530] space-y-1"
            >
              <p className="text-[#ff3ea5] text-sm font-semibold uppercase tracking-wider mb-2">
                Respuestas correctas
              </p>
              {results.map((correct, i) =>
                !correct ? (
                  <p key={i} className="text-[#c0c4e0] text-base">
                    Hueco {i + 1}:{' '}
                    <span className="line-through text-[#ff3ea5] mr-2">
                      {placed[i]}
                    </span>
                    <span className="text-[#00ff88] font-semibold">
                      {data.blanks[i]}
                    </span>
                  </p>
                ) : null
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Word bank */}
        <div>
          <p className="text-[#8b8fb0] text-sm font-semibold uppercase tracking-wider mb-3">
            Banco de palabras
          </p>
          <div className="flex flex-wrap gap-2">
            {data.wordBank.map((word, idx) => {
              const isUsed = bankUsed.has(idx)
              return (
                <motion.button
                  key={idx}
                  onClick={() => handleWordClick(idx, word)}
                  disabled={isUsed || checkState === 'checked'}
                  whileHover={!isUsed && checkState === 'unchecked' ? { scale: 1.05 } : {}}
                  whileTap={!isUsed && checkState === 'unchecked' ? { scale: 0.95 } : {}}
                  layout
                  className={`
                    px-4 py-2.5 rounded-full border text-base font-medium
                    transition-all duration-200
                    ${isUsed
                      ? 'border-[#b24bff30] text-[#4a4e6a] bg-[#b24bff08] cursor-default opacity-40'
                      : checkState === 'unchecked'
                        ? 'border-[#b24bff] text-[#b24bff] bg-[#b24bff10] cursor-pointer hover:bg-[#b24bff20]'
                        : 'border-[#b24bff30] text-[#4a4e6a] cursor-default opacity-50'
                    }
                  `}
                >
                  <MathRenderer content={word} />
                </motion.button>
              )
            })}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex justify-end gap-3 pt-2">
          {checkState === 'unchecked' ? (
            <motion.button
              onClick={handleCheck}
              disabled={!allFilled}
              whileHover={allFilled ? { scale: 1.03 } : {}}
              whileTap={allFilled ? { scale: 0.97 } : {}}
              className={`
                px-6 py-2.5 rounded-xl font-bold text-base transition-colors
                ${allFilled
                  ? 'bg-[#00d4ff] text-[#0a0b1a] hover:bg-[#00b8e6] cursor-pointer'
                  : 'bg-[#1e2248] text-[#6b6f8a] cursor-not-allowed'
                }
              `}
            >
              Comprobar
            </motion.button>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-3"
            >
              <span
                className="text-base font-semibold"
                style={{
                  color:
                    results.every(Boolean)
                      ? '#00ff88'
                      : results.filter(Boolean).length > blankCount / 2
                        ? '#ffd700'
                        : '#ff3ea5',
                }}
              >
                {results.filter(Boolean).length}/{blankCount} correctas
              </span>
              <motion.button
                onClick={handleComplete}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="px-6 py-2.5 rounded-xl bg-[#00ff88] text-[#0a0b1a] font-bold
                  text-base hover:bg-[#00e67a] transition-colors cursor-pointer"
              >
                Completar →
              </motion.button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
