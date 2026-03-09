import type React from 'react'
import { motion } from 'framer-motion'

interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: string | number
  color: string
  subtitle?: string
}

const springTransition = { type: 'spring' as const, stiffness: 300, damping: 22 }

export function StatCard({ icon, label, value, color, subtitle }: StatCardProps) {
  return (
    <motion.div
      className="rounded-2xl p-5 lg:p-7 relative overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, #131629 10%, #111425 100%)',
        border: `1px solid ${color}22`,
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
      whileHover={{ y: -3, borderColor: `${color}55`, transition: springTransition }}
    >
      {/* Top accent line */}
      <div
        className="absolute top-0 left-4 right-4 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${color}77, transparent)` }}
      />

      <div
        className="w-11 h-11 lg:w-14 lg:h-14 rounded-xl lg:rounded-2xl flex items-center justify-center mb-4"
        style={{
          background: `${color}18`,
          border: `1px solid ${color}33`,
          color,
          filter: `drop-shadow(0 0 8px ${color})`,
        }}
      >
        {icon}
      </div>

      <p className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider mb-1.5">{label}</p>
      <p className="text-2xl lg:text-4xl font-black truncate leading-none" style={{ color }}>{value}</p>
      {subtitle && <p className="text-[11px] text-text-muted mt-1.5">{subtitle}</p>}
    </motion.div>
  )
}
