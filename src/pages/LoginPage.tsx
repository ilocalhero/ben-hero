import { useState } from 'react'
import { motion } from 'framer-motion'
import { Zap } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/useAuthStore'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const login = useAuthStore((s) => s.login)
  const navigate = useNavigate()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const ok = login(email)
    if (ok) {
      navigate('/', { replace: true })
    } else {
      setError('Correo no autorizado')
      setLoading(false)
    }
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
            'radial-gradient(ellipse 60% 50% at 50% 40%, rgba(0,212,255,0.07), transparent)',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-sm"
      >
        {/* Card */}
        <div
          className="rounded-3xl p-8"
          style={{
            background: 'linear-gradient(160deg, #131629 0%, #0f1224 100%)',
            border: '1px solid rgba(0,212,255,0.15)',
            boxShadow: '0 32px 80px rgba(0,0,0,0.7), 0 0 60px rgba(0,212,255,0.06)',
          }}
        >
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
              style={{
                background: 'linear-gradient(135deg, rgba(0,212,255,0.2) 0%, rgba(178,75,255,0.2) 100%)',
                border: '1px solid rgba(0,212,255,0.4)',
                boxShadow: '0 0 32px rgba(0,212,255,0.3)',
              }}
            >
              <Zap size={30} className="text-neon-blue" style={{ filter: 'drop-shadow(0 0 8px #00d4ff)' }} />
            </div>
            <span
              className="font-black tracking-[0.25em] text-xl"
              style={{
                fontFamily: "'Orbitron', sans-serif",
                color: '#00d4ff',
                textShadow: '0 0 14px #00d4ffaa, 0 0 28px #00d4ff44',
              }}
            >
              BENHERO
            </span>
            <p className="text-text-secondary text-sm mt-2 text-center">
              Aprende historia, geografía y matemáticas
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-widest">
                Correo electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError('') }}
                placeholder="tu@correo.com"
                required
                autoFocus
                className="w-full rounded-xl px-4 py-3 text-sm font-medium text-text-primary outline-none transition-all duration-200"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: error
                    ? '1px solid rgba(255,62,165,0.6)'
                    : '1px solid rgba(0,212,255,0.2)',
                  boxShadow: error
                    ? '0 0 12px rgba(255,62,165,0.15)'
                    : undefined,
                }}
                onFocus={(e) => {
                  if (!error) e.target.style.borderColor = 'rgba(0,212,255,0.6)'
                  if (!error) e.target.style.boxShadow = '0 0 16px rgba(0,212,255,0.15)'
                }}
                onBlur={(e) => {
                  if (!error) e.target.style.borderColor = 'rgba(0,212,255,0.2)'
                  if (!error) e.target.style.boxShadow = ''
                }}
              />
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs font-semibold"
                  style={{ color: '#ff3ea5', textShadow: '0 0 8px rgba(255,62,165,0.5)' }}
                >
                  {error}
                </motion.p>
              )}
            </div>

            <motion.button
              type="submit"
              disabled={loading || !email}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3.5 rounded-xl font-black text-sm uppercase tracking-wider text-white mt-2 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
              style={{
                background: 'linear-gradient(135deg, #00d4ff 0%, #0096b3 100%)',
                boxShadow: '0 0 24px rgba(0,212,255,0.35), 0 4px 16px rgba(0,0,0,0.4)',
              }}
            >
              {loading ? 'Entrando…' : 'Entrar'}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  )
}
