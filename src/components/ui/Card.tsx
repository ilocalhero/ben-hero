import React from 'react'

interface CardProps {
  children: React.ReactNode
  className?: string
  glow?: 'blue' | 'purple' | 'green' | 'orange' | 'none'
  onClick?: () => void
}

export function Card({ children, className = '', glow = 'none', onClick }: CardProps) {
  const glowClass = glow !== 'none' ? `glow-${glow}` : ''
  return (
    <div
      onClick={onClick}
      className={`
        bg-[#12152e] border border-[#1e2248] rounded-2xl p-4
        ${glowClass}
        ${onClick ? 'cursor-pointer hover:border-[#00d4ff44] hover:bg-[#1a1e3e] transition-all duration-200' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  )
}
