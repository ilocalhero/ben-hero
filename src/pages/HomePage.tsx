import { motion } from 'framer-motion'
import { Zap, ChevronRight, BookOpen, Flame, CheckCircle } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { TEMAS } from '../data'
import { Card, NeonText, Badge } from '../components/ui'
import { useProgressStore } from '../stores/useProgressStore'
import { usePlayerStore } from '../stores/usePlayerStore'

const categoryColor = (cat: string) => cat === 'historia' ? 'orange' : 'green' as const

export function HomePage() {
  const featuredTemas = TEMAS.slice(0, 2)
  const navigate = useNavigate()
  const { dailyMissionCompleted } = useProgressStore()
  const { streak } = usePlayerStore()

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <NeonText as="h1" color="blue" className="text-2xl lg:text-3xl mb-1">
          ¡Hola, Ben!
        </NeonText>
        <p className="text-[#8b8fb0] text-sm">Listo para conquistar la historia de España</p>
      </motion.div>

      {/* Misión del día */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="space-y-2"
      >
        <button
          onClick={() => !dailyMissionCompleted && navigate('/daily')}
          disabled={dailyMissionCompleted}
          className="w-full text-left rounded-2xl p-5 relative overflow-hidden group transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] disabled:scale-100 disabled:cursor-default"
          style={{
            background: dailyMissionCompleted
              ? 'linear-gradient(135deg, #1a1d3a 0%, #141a1a 100%)'
              : 'linear-gradient(135deg, #1a1d3a 0%, #1e1040 100%)',
            border: dailyMissionCompleted ? '1px solid #00ff8844' : '1px solid #b24bff44',
            boxShadow: dailyMissionCompleted ? '0 0 20px #00ff8822' : '0 0 20px #b24bff22',
          }}
        >
          {/* Glow effect on hover */}
          {!dailyMissionCompleted && (
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"
              style={{ background: 'linear-gradient(135deg, #b24bff0a 0%, #00d4ff0a 100%)' }}
            />
          )}

          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                style={
                  dailyMissionCompleted
                    ? { background: '#00ff8822', border: '1px solid #00ff8844' }
                    : { background: '#b24bff22', border: '1px solid #b24bff44' }
                }
              >
                {dailyMissionCompleted
                  ? <CheckCircle size={22} className="text-neon-green" style={{ filter: 'drop-shadow(0 0 6px #00ff88)' }} />
                  : <Zap size={22} className="text-neon-purple" style={{ filter: 'drop-shadow(0 0 6px #b24bff)' }} />
                }
              </div>
              <div>
                <div
                  className="text-xs font-semibold uppercase tracking-wider mb-0.5"
                  style={{ color: dailyMissionCompleted ? '#00ff88' : '#b24bff' }}
                >
                  Misión del Día
                </div>
                <div className="font-bold text-white text-base">
                  {dailyMissionCompleted ? '✓ Misión completada' : 'Completa tu lección de hoy'}
                </div>
                <div className="text-xs text-[#8b8fb0] mt-0.5">
                  {dailyMissionCompleted ? 'Vuelve mañana para la próxima' : '+150 XP · ~15-20 min'}
                </div>
              </div>
            </div>
            {!dailyMissionCompleted && (
              <ChevronRight size={20} className="text-[#8b8fb0] group-hover:text-white transition-colors flex-shrink-0" />
            )}
          </div>
        </button>

        {/* Streak display */}
        {streak > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-2 px-1"
          >
            <Flame size={14} style={{ color: '#ff6b35', filter: 'drop-shadow(0 0 4px #ff6b35)' }} />
            <span className="text-xs font-semibold" style={{ color: '#ff6b35' }}>
              {streak} día{streak !== 1 ? 's' : ''} de racha
            </span>
          </motion.div>
        )}
      </motion.div>

      {/* Temas section */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="space-y-3"
      >
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-white text-base flex items-center gap-2">
            <BookOpen size={16} className="text-neon-blue" />
            Temas recientes
          </h2>
          <Link
            to="/temas"
            className="text-xs text-neon-blue hover:underline font-semibold flex items-center gap-1"
          >
            Ver todos <ChevronRight size={12} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {featuredTemas.map((tema, i) => (
            <motion.div
              key={tema.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.25 + i * 0.08 }}
            >
              <Link to={`/temas/${tema.id}`}>
                <Card
                  glow="none"
                  onClick={undefined}
                  className="hover:border-neon-blue/40 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                      style={{ background: `${tema.color}22`, border: `1px solid ${tema.color}44` }}
                    >
                      {tema.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-xs text-[#8b8fb0] font-semibold">Tema {tema.number}</span>
                        <Badge color={categoryColor(tema.category)} size="sm">
                          {tema.category}
                        </Badge>
                      </div>
                      <p className="font-bold text-white text-sm leading-snug truncate">{tema.title}</p>
                      <p className="text-xs text-[#8b8fb0] mt-1 line-clamp-2">{tema.subtitle}</p>
                    </div>
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
