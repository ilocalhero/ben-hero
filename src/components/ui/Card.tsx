import React from 'react'

interface CardProps {
  children: React.ReactNode
  className?: string
  glow?: 'blue' | 'purple' | 'green' | 'orange' | 'none'
  onClick?: () => void
}

const glowStyles: Record<string, React.CSSProperties> = {
  blue:   { boxShadow: '0 0 24px rgba(0,212,255,0.2), 0 0 48px rgba(0,212,255,0.06)', borderColor: 'rgba(0,212,255,0.3)' },
  purple: { boxShadow: '0 0 24px rgba(178,75,255,0.2), 0 0 48px rgba(178,75,255,0.06)', borderColor: 'rgba(178,75,255,0.3)' },
  green:  { boxShadow: '0 0 24px rgba(0,255,136,0.2), 0 0 48px rgba(0,255,136,0.06)', borderColor: 'rgba(0,255,136,0.3)' },
  orange: { boxShadow: '0 0 24px rgba(255,107,53,0.2)', borderColor: 'rgba(255,107,53,0.3)' },
  none:   {},
}

export function Card({ children, className = '', glow = 'none', onClick }: CardProps) {
  const baseStyle: React.CSSProperties = {
    background: 'linear-gradient(135deg, #141729 0%, #111425 100%)',
    border: '1px solid rgba(255,255,255,0.07)',
    ...glowStyles[glow],
  }

  return (
    <div
      onClick={onClick}
      className={`rounded-2xl p-4 transition-all duration-200 ${onClick ? 'cursor-pointer' : ''} ${className}`}
      style={baseStyle}
    >
      {children}
    </div>
  )
}
