import { useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Star, Zap } from 'lucide-react'
import { getTema } from '../data'
import { NeonText, Badge, Button } from '../components/ui'
import { QuizActivity } from '../components/activities/QuizActivity'
import { FillBlankActivity } from '../components/activities/FillBlankActivity'
import { WritingMission } from '../components/activities/WritingMission'
import { useProgressStore } from '../stores/useProgressStore'
import { usePlayerStore } from '../stores/usePlayerStore'
import { useXPAnimation } from '../stores/useXPAnimation'

const activityTypeLabel: Record<string, string> = {
  quiz: 'Cuestionario',
  fill_blank: 'Rellenar huecos',
  timeline_drag: 'Línea de tiempo',
  map_label: 'Mapa interactivo',
  image_label: 'Etiquetar imagen',
  match_pairs: 'Emparejar',
  sort_order: 'Ordenar',
  sentence_builder: 'Construir frases',
  paragraph_template: 'Párrafo guiado',
  writing_mission: 'Misión escrita',
  source_analysis: 'Análisis de fuente',
  compare_contrast: 'Comparar y contrastar',
}

interface CompletionData {
  score: number
  xpEarned: number
  leveledUp: boolean
  newLevel: number
}

function StarRating({ score }: { score: number }) {
  const filledCount = score >= 80 ? 3 : score >= 50 ? 2 : 1
  return (
    <div className="flex items-center justify-center gap-2">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2 + i * 0.15, type: 'spring', stiffness: 200 }}
        >
          <Star
            size={40}
            className={i < filledCount ? 'fill-[#ffd700] text-[#ffd700]' : 'text-[#2a2d50]'}
            fill={i < filledCount ? '#ffd700' : 'transparent'}
          />
        </motion.div>
      ))}
    </div>
  )
}

function AnimatedXP({ xp }: { xp: number }) {
  return (
    <motion.span
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.6, type: 'spring', stiffness: 180 }}
      className="text-4xl font-black text-[#ffd700]"
    >
      +{xp} XP
    </motion.span>
  )
}

function ComingSoon({ xpReward }: { xpReward: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.15 }}
      className="bg-[#1a1d3a] rounded-2xl p-8 border border-[#ffd70020] flex flex-col
        items-center gap-4 text-center"
    >
      <div className="w-16 h-16 rounded-full bg-[#ffd70015] border border-[#ffd70030]
        flex items-center justify-center">
        <Zap size={28} className="text-[#ffd700]" />
      </div>
      <div className="space-y-1">
        <p className="text-[#e8eaff] font-semibold text-base">¡Próximamente!</p>
        <p className="text-[#8b8fb0] text-sm">
          Esta actividad estará disponible muy pronto.
        </p>
      </div>
      <Badge color="yellow">+{xpReward} XP al completar</Badge>
    </motion.div>
  )
}

export function ActivityPage() {
  const { temaId, activityId } = useParams<{ temaId: string; activityId: string }>()
  const navigate = useNavigate()

  const completeActivity = useProgressStore((s) => s.completeActivity)
  const addXP = usePlayerStore((s) => s.addXP)
  const addGain = useXPAnimation((s) => s.addGain)

  const [completion, setCompletion] = useState<CompletionData | null>(null)
  const [started, setStarted] = useState(false)

  const tema = temaId ? getTema(temaId) : undefined
  const activity = tema?.activities.find((a) => a.id === activityId)

  if (!tema || !activity) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <p className="text-2xl text-[#8b8fb0]">Actividad no encontrada</p>
        <Link
          to={temaId ? `/temas/${temaId}` : '/temas'}
          className="flex items-center gap-2 text-[#00d4ff] hover:text-[#00b8e6] transition-colors"
        >
          <ArrowLeft size={18} />
          Volver al tema
        </Link>
      </div>
    )
  }

  const typeLabel = activityTypeLabel[activity.type] ?? activity.type

  // Called by quiz / fill_blank — needs to save progress + XP
  const handleComplete = (score: number, xpEarned: number) => {
    completeActivity(activity.id, score)
    const { newLevel, leveledUp } = addXP(xpEarned)
    addGain(xpEarned)
    setCompletion({ score, xpEarned, leveledUp, newLevel })
  }

  // Called by WritingMission — it already saved progress/XP internally, we just show the screen
  const handleWritingComplete = (score: number, xpEarned: number) => {
    // WritingMission has already called completeActivity + addXP + addWritingRecord
    // We only need to trigger the completion UI
    addGain(xpEarned)
    setCompletion({ score, xpEarned, leveledUp: false, newLevel: 0 })
  }

  // Completion screen
  if (completion) {
    const congratsMessages = [
      '¡Increíble trabajo!',
      '¡Muy bien hecho!',
      '¡Fantástico!',
      '¡Eres un campeón!',
    ]
    const msgIndex = Math.min(
      Math.floor(completion.score / 25),
      congratsMessages.length - 1
    )
    const congrats = congratsMessages[msgIndex]

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="max-w-xl mx-auto px-4 py-10 flex flex-col items-center gap-6 text-center"
      >
        {/* Stars */}
        <StarRating score={completion.score} />

        {/* Congrats heading */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-1"
        >
          <p className="text-3xl font-black text-white">{congrats}</p>
          <p className="text-[#8b8fb0] text-lg">
            Has completado: <span className="text-[#e8eaff] font-semibold">{activity.title}</span>
          </p>
        </motion.div>

        {/* Score */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-[#1a1d3a] rounded-2xl p-6 border border-[#ffffff10] w-full space-y-4"
        >
          <div className="flex items-center justify-between">
            <span className="text-[#8b8fb0] text-base">Puntuación</span>
            <span
              className="text-2xl font-bold"
              style={{
                color:
                  completion.score >= 80
                    ? '#00ff88'
                    : completion.score >= 50
                      ? '#ffd700'
                      : '#ff6b35',
              }}
            >
              {completion.score}%
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[#8b8fb0] text-base">XP ganado</span>
            <AnimatedXP xp={completion.xpEarned} />
          </div>

          {/* Level up notice */}
          <AnimatePresence>
            {completion.leveledUp && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="p-3 rounded-xl bg-[#b24bff20] border border-[#b24bff40]
                  flex items-center gap-3"
              >
                <span className="text-2xl">🎉</span>
                <div className="text-left">
                  <p className="text-[#b24bff] font-bold text-base">¡Subiste de nivel!</p>
                  <p className="text-[#c0c4e0] text-sm">
                    Ahora eres nivel {completion.newLevel}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Continue button */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Button
            onClick={() => navigate(`/temas/${temaId}`)}
            variant="primary"
            size="lg"
          >
            Continuar
          </Button>
        </motion.div>
      </motion.div>
    )
  }

  // Pre-start info screen
  if (!started) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-4xl mx-auto px-4 py-6 space-y-6"
      >
        {/* Back link */}
        <Link
          to={`/temas/${temaId}`}
          className="inline-flex items-center gap-2 text-[#8b8fb0] hover:text-[#e8eaff]
            transition-colors text-base"
        >
          <ArrowLeft size={16} />
          Volver al tema
        </Link>

        {/* Activity info card */}
        <div className="bg-[#1a1d3a] rounded-2xl p-6 border border-[#ffffff10] space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge color="purple" size="sm">{typeLabel}</Badge>
            <Badge color="yellow" size="sm">+{activity.xpReward} XP</Badge>
          </div>

          <NeonText color="blue" as="h1" className="text-3xl font-bold leading-tight">
            {activity.title}
          </NeonText>

          <p className="text-[#c0c4e0] text-base lg:text-lg leading-relaxed">{activity.description}</p>

          <p className="text-[#8b8fb0] text-sm">
            Tiempo estimado: ~{activity.estimatedMinutes} minutos
          </p>
        </div>

        {/* Start or coming soon */}
        {(activity.type === 'quiz' ||
          activity.type === 'fill_blank' ||
          activity.type === 'writing_mission') ? (
          <div className="flex justify-center">
            <Button
              onClick={() => setStarted(true)}
              variant="primary"
              size="lg"
            >
              <Zap size={18} />
              ¡Empezar actividad!
            </Button>
          </div>
        ) : (
          <ComingSoon xpReward={activity.xpReward} />
        )}

        {/* Back button (only for non-startable types) */}
        {activity.type !== 'quiz' &&
          activity.type !== 'fill_blank' &&
          activity.type !== 'writing_mission' && (
          <div className="flex justify-center">
            <Link to={`/temas/${temaId}`}>
              <Button variant="secondary">
                <ArrowLeft size={16} />
                Volver al tema
              </Button>
            </Link>
          </div>
        )}
      </motion.div>
    )
  }

  // Active activity view
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-4xl mx-auto px-4 py-6 space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setStarted(false)}
          className="inline-flex items-center gap-2 text-[#8b8fb0] hover:text-[#e8eaff]
            transition-colors text-base"
        >
          <ArrowLeft size={16} />
          Salir
        </button>
        <div className="flex items-center gap-2">
          <Badge color="purple" size="sm">{typeLabel}</Badge>
          <Badge color="yellow" size="sm">+{activity.xpReward} XP</Badge>
        </div>
      </div>

      {/* Activity title */}
      <NeonText color="blue" as="h2" className="text-2xl font-bold leading-tight">
        {activity.title}
      </NeonText>

      {/* Activity component */}
      {activity.type === 'quiz' && (
        <QuizActivity
          activity={activity}
          temaId={temaId!}
          onComplete={handleComplete}
        />
      )}

      {activity.type === 'fill_blank' && (
        <FillBlankActivity
          activity={activity}
          temaId={temaId!}
          onComplete={handleComplete}
        />
      )}

      {activity.type === 'writing_mission' && (
        <WritingMission
          activity={activity}
          temaId={temaId!}
          onComplete={handleWritingComplete}
        />
      )}

      {activity.type !== 'quiz' &&
        activity.type !== 'fill_blank' &&
        activity.type !== 'writing_mission' && (
          <ComingSoon xpReward={activity.xpReward} />
        )}
    </motion.div>
  )
}
