import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Navigate } from 'react-router-dom'
import { Zap, User, AtSign, ArrowRight, Gamepad2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { usePlayerStore } from '../stores/usePlayerStore'
import { useAuthStore } from '../stores/useAuthStore'
import { loadFromStorage } from '../lib/storage'
import type { PlayerState } from '../types/player'

const HANDLE_REGEX = /^[a-zA-Z0-9_]{3,16}$/

export function OnboardingPage() {
  const [step, setStep] = useState<1 | 2>(1)
  const [name, setName] = useState('')
  const [handle, setHandle] = useState('')
  const completeOnboarding = usePlayerStore((s) => s.completeOnboarding)
  const navigate = useNavigate()
  const email = useAuthStore((s) => s.email)

  if (!email) return <Navigate to="/login" replace />
  const player = loadFromStorage<PlayerState>('player')
  if (player?.onboarded) return <Navigate to="/" replace />

  const nameValid = name.trim().length >= 2
  const handleValid = HANDLE_REGEX.test(handle)
  const handleError = handle.length > 0 && !handleValid
    ? handle.length < 3
      ? 'Mínimo 3 caracteres'
      : handle.length > 16
        ? 'Máximo 16 caracteres'
        : 'Solo letras, números y guiones bajos'
    : null

  function handleFinish() {
    if (!nameValid || !handleValid) return
    completeOnboarding(name.trim(), handle)
    navigate('/', { replace: true })
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: '#0a0b1a' }}
    >
      {/* Ambient glow */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            'radial-gradient(ellipse 70% 60% at 50% 40%, rgba(178,75,255,0.08), transparent)',
        }}
      />
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            'radial-gradient(ellipse 40% 40% at 80% 20%, rgba(0,212,255,0.05), transparent)',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3"
            style={{
              background: 'linear-gradient(135deg, rgba(178,75,255,0.25) 0%, rgba(0,212,255,0.15) 100%)',
              border: '1px solid rgba(178,75,255,0.4)',
              boxShadow: '0 0 32px rgba(178,75,255,0.25)',
            }}
          >
            <Zap size={26} style={{ color: '#b24bff', filter: 'drop-shadow(0 0 8px #b24bff)' }} />
          </div>
          <span
            className="font-black tracking-[0.25em] text-lg"
            style={{
              fontFamily: "'Orbitron', sans-serif",
              color: '#b24bff',
              textShadow: '0 0 14px #b24bffaa, 0 0 28px #b24bff44',
            }}
          >
            BENHERO
          </span>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2].map((s) => (
            <div
              key={s}
              className="rounded-full transition-all duration-500"
              style={{
                width: step === s ? 24 : 8,
                height: 8,
                background: step === s ? '#b24bff' : 'rgba(178,75,255,0.25)',
                boxShadow: step === s ? '0 0 12px rgba(178,75,255,0.6)' : 'none',
              }}
            />
          ))}
        </div>

        {/* Card */}
        <div
          className="rounded-3xl p-8"
          style={{
            background: 'linear-gradient(160deg, #131629 0%, #0f1224 100%)',
            border: '1px solid rgba(178,75,255,0.15)',
            boxShadow: '0 32px 80px rgba(0,0,0,0.7), 0 0 60px rgba(178,75,255,0.06)',
          }}
        >
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{
                      background: 'rgba(178,75,255,0.15)',
                      border: '1px solid rgba(178,75,255,0.3)',
                    }}
                  >
                    <User size={18} style={{ color: '#b24bff' }} />
                  </div>
                  <div>
                    <h1 className="text-white font-black text-xl leading-tight">
                      ¿Cuál es tu nombre?
                    </h1>
                    <p className="text-text-secondary text-sm mt-0.5">
                      Como te llamaremos en el juego
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && nameValid && setStep(2)}
                    placeholder="Tu nombre"
                    maxLength={30}
                    autoFocus
                    className="w-full rounded-xl px-4 py-3.5 text-base font-semibold text-text-primary outline-none transition-all duration-200"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(178,75,255,0.25)',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'rgba(178,75,255,0.6)'
                      e.target.style.boxShadow = '0 0 16px rgba(178,75,255,0.15)'
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(178,75,255,0.25)'
                      e.target.style.boxShadow = ''
                    }}
                  />

                  <motion.button
                    onClick={() => setStep(2)}
                    disabled={!nameValid}
                    whileHover={nameValid ? { scale: 1.02 } : {}}
                    whileTap={nameValid ? { scale: 0.98 } : {}}
                    className="w-full py-3.5 rounded-xl font-black text-sm uppercase tracking-wider text-white flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
                    style={{
                      background: 'linear-gradient(135deg, #b24bff 0%, #7c2dd6 100%)',
                      boxShadow: nameValid
                        ? '0 0 24px rgba(178,75,255,0.4), 0 4px 16px rgba(0,0,0,0.4)'
                        : 'none',
                    }}
                  >
                    Continuar
                    <ArrowRight size={16} />
                  </motion.button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 30 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{
                      background: 'rgba(0,255,136,0.12)',
                      border: '1px solid rgba(0,255,136,0.3)',
                    }}
                  >
                    <Gamepad2 size={18} style={{ color: '#00ff88' }} />
                  </div>
                  <div>
                    <h1 className="text-white font-black text-xl leading-tight">
                      Hola, {name.trim()}! 👋
                    </h1>
                    <p className="text-text-secondary text-sm mt-0.5">
                      Ahora elige tu nombre de jugador
                    </p>
                  </div>
                </div>

                {/* Handle preview card */}
                <AnimatePresence>
                  {handle.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -8 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="flex items-center gap-3 rounded-2xl p-4 mb-4"
                      style={{
                        background: 'linear-gradient(135deg, rgba(0,255,136,0.07) 0%, rgba(0,212,255,0.05) 100%)',
                        border: handleValid
                          ? '1px solid rgba(0,255,136,0.3)'
                          : '1px solid rgba(255,62,165,0.3)',
                      }}
                    >
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg flex-shrink-0"
                        style={{
                          background: 'linear-gradient(135deg, rgba(0,255,136,0.2), rgba(0,212,255,0.15))',
                          border: '1px solid rgba(0,255,136,0.3)',
                          color: '#00ff88',
                          textShadow: '0 0 10px rgba(0,255,136,0.6)',
                        }}
                      >
                        {name.trim()[0]?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <div className="text-text-secondary text-xs font-semibold uppercase tracking-widest">
                          Nombre de jugador
                        </div>
                        <div
                          className="font-black text-base"
                          style={{
                            color: handleValid ? '#00ff88' : '#ff3ea5',
                            textShadow: handleValid
                              ? '0 0 10px rgba(0,255,136,0.5)'
                              : '0 0 10px rgba(255,62,165,0.5)',
                          }}
                        >
                          @{handle}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex flex-col gap-3">
                  {/* Input with @ prefix */}
                  <div className="relative">
                    <div
                      className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-1"
                      style={{ color: 'rgba(0,212,255,0.6)' }}
                    >
                      <AtSign size={15} />
                    </div>
                    <input
                      type="text"
                      value={handle}
                      onChange={(e) => setHandle(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                      onKeyDown={(e) => e.key === 'Enter' && handleValid && handleFinish()}
                      placeholder="tu_nombre"
                      maxLength={16}
                      autoFocus
                      className="w-full rounded-xl pl-9 pr-4 py-3.5 text-base font-semibold text-text-primary outline-none transition-all duration-200"
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: handleError
                          ? '1px solid rgba(255,62,165,0.5)'
                          : '1px solid rgba(0,212,255,0.25)',
                      }}
                      onFocus={(e) => {
                        if (!handleError) e.target.style.borderColor = 'rgba(0,212,255,0.6)'
                        if (!handleError) e.target.style.boxShadow = '0 0 16px rgba(0,212,255,0.12)'
                      }}
                      onBlur={(e) => {
                        if (!handleError) e.target.style.borderColor = 'rgba(0,212,255,0.25)'
                        if (!handleError) e.target.style.boxShadow = ''
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between px-1">
                    {handleError ? (
                      <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xs font-semibold"
                        style={{ color: '#ff3ea5' }}
                      >
                        {handleError}
                      </motion.p>
                    ) : (
                      <p className="text-xs text-text-secondary">
                        Letras, números y _ · 3–16 caracteres
                      </p>
                    )}
                    <p
                      className="text-xs font-bold tabular-nums"
                      style={{ color: handle.length > 13 ? '#ffd700' : 'rgba(255,255,255,0.3)' }}
                    >
                      {handle.length}/16
                    </p>
                  </div>

                  <div className="flex gap-3 mt-1">
                    <motion.button
                      onClick={() => setStep(1)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-shrink-0 px-4 py-3.5 rounded-xl font-bold text-sm text-text-secondary transition-colors"
                      style={{
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.1)',
                      }}
                    >
                      Atrás
                    </motion.button>

                    <motion.button
                      onClick={handleFinish}
                      disabled={!handleValid}
                      whileHover={handleValid ? { scale: 1.02 } : {}}
                      whileTap={handleValid ? { scale: 0.98 } : {}}
                      className="flex-1 py-3.5 rounded-xl font-black text-sm uppercase tracking-wider text-white flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
                      style={{
                        background: 'linear-gradient(135deg, #00ff88 0%, #00c86a 100%)',
                        boxShadow: handleValid
                          ? '0 0 24px rgba(0,255,136,0.4), 0 4px 16px rgba(0,0,0,0.4)'
                          : 'none',
                        color: '#0a0b1a',
                      }}
                    >
                      ¡Comenzar!
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}
