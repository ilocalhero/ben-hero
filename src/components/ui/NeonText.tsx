import React from 'react'

interface NeonTextProps {
  children: React.ReactNode
  color?: 'blue' | 'purple' | 'green' | 'orange' | 'yellow' | 'pink'
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'span' | 'p'
  className?: string
}

const glowColors = {
  blue: 'text-[#00d4ff] text-glow-blue',
  purple: 'text-[#b24bff] text-glow-purple',
  green: 'text-[#00ff88] text-glow-green',
  orange: 'text-[#ff6b35]',
  yellow: 'text-[#ffd700] text-glow-yellow',
  pink: 'text-[#ff3ea5]',
}

export function NeonText({ children, color = 'blue', as: Tag = 'span', className = '' }: NeonTextProps) {
  return (
    <Tag className={`${glowColors[color]} font-bold ${className}`}>
      {children}
    </Tag>
  )
}
