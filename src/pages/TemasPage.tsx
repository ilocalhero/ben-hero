import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { TEMAS } from '../data'
import { Card, NeonText, Badge } from '../components/ui'

const categoryColor = (cat: string) => cat === 'historia' ? 'orange' : 'green' as const

export function TemasPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <NeonText as="h1" color="blue" className="text-2xl lg:text-3xl mb-1">
          Mis Temas
        </NeonText>
        <p className="text-[#8b8fb0] text-sm">{TEMAS.length} temas disponibles</p>
      </motion.div>

      {/* Temas grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {TEMAS.map((tema, i) => (
          <motion.div
            key={tema.id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.07 }}
          >
            <Link to={`/temas/${tema.id}`} className="block">
              <Card
                glow="none"
                className="hover:border-neon-blue/40 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer h-full"
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 mt-0.5"
                    style={{ background: `${tema.color}22`, border: `1px solid ${tema.color}44` }}
                  >
                    {tema.icon}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{ background: `${tema.color}22`, color: tema.color, border: `1px solid ${tema.color}33` }}
                      >
                        Tema {tema.number}
                      </span>
                      <Badge color={categoryColor(tema.category)} size="sm">
                        {tema.category}
                      </Badge>
                    </div>

                    <h3 className="font-bold text-white text-sm leading-snug mb-1">{tema.title}</h3>
                    <p className="text-xs text-[#8b8fb0] line-clamp-2 leading-relaxed">{tema.description}</p>

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-3 text-xs text-[#8b8fb0]">
                        <span>{tema.lessons.length} lecciones</span>
                        <span>·</span>
                        <span>{tema.activities.length} actividades</span>
                      </div>
                      <ChevronRight size={14} className="text-neon-blue" />
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Coming soon placeholder */}
      {TEMAS.length < 10 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: TEMAS.length * 0.07 + 0.1 }}
        >
          <div
            className="rounded-2xl border border-dashed border-[#2a2d4a] p-6 text-center"
          >
            <p className="text-[#4a4d6a] text-sm font-semibold">Más temas próximamente...</p>
          </div>
        </motion.div>
      )}
    </div>
  )
}
