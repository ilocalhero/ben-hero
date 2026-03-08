import { create } from 'zustand'
import type { XPGain } from '../types/gamification'

interface XPAnimationState {
  gains: XPGain[]
  addGain: (amount: number) => void
  removeGain: (id: string) => void
}

let idCounter = 0

export const useXPAnimation = create<XPAnimationState>((set) => ({
  gains: [],
  addGain: (amount: number) => {
    const id = `xp-${++idCounter}`
    // Center of screen approximately
    const x = window.innerWidth / 2 + (Math.random() - 0.5) * 100
    const y = window.innerHeight / 2
    set(state => ({ gains: [...state.gains, { id, amount, x, y }] }))
    // Auto-remove after animation
    setTimeout(() => {
      set(state => ({ gains: state.gains.filter(g => g.id !== id) }))
    }, 1600)
  },
  removeGain: (id: string) => {
    set(state => ({ gains: state.gains.filter(g => g.id !== id) }))
  },
}))
