import { motion } from 'framer-motion'

interface ProgressBarProps {
  value: number // 0-100
  max?: number
  color?: 'blue' | 'purple' | 'green' | 'orange' | 'yellow'
  height?: number
  showLabel?: boolean
  label?: string
  animated?: boolean
}

const colors = {
  blue: 'bg-[#00d4ff]',
  purple: 'bg-[#b24bff]',
  green: 'bg-[#00ff88]',
  orange: 'bg-[#ff6b35]',
  yellow: 'bg-[#ffd700]',
}

export function ProgressBar({
  value, max = 100, color = 'blue', height = 8,
  showLabel, label, animated = true
}: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))
  return (
    <div className="w-full">
      {(showLabel || label) && (
        <div className="flex justify-between text-xs text-[#8b8fb0] mb-1">
          <span>{label || ''}</span>
          <span>{Math.round(pct)}%</span>
        </div>
      )}
      <div
        className="w-full rounded-full overflow-hidden"
        style={{ height, background: '#1e2248' }}
      >
        <motion.div
          className={`h-full rounded-full ${colors[color]}`}
          initial={animated ? { width: 0 } : { width: `${pct}%` }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{ boxShadow: pct > 0 ? `0 0 8px currentColor` : 'none' }}
        />
      </div>
    </div>
  )
}
