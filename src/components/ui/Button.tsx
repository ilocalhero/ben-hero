import React from 'react'
import { motion } from 'framer-motion'

interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  className?: string
  type?: 'button' | 'submit'
  fullWidth?: boolean
}

const variants = {
  primary: 'bg-[#00d4ff] text-[#0a0b1a] hover:bg-[#00b8e6] glow-blue font-bold',
  secondary: 'bg-[#1e2248] text-[#e8eaff] hover:bg-[#252a5a] border border-[#00d4ff33]',
  success: 'bg-[#00ff88] text-[#0a0b1a] hover:bg-[#00e67a] glow-green font-bold',
  danger: 'bg-[#ff3ea5] text-white hover:bg-[#e6358e] font-bold',
  ghost: 'bg-transparent text-[#8b8fb0] hover:text-[#e8eaff] hover:bg-[#1e224820]',
}

const sizes = {
  sm: 'px-4 py-2 text-sm rounded-xl',
  md: 'px-6 py-3.5 text-base rounded-xl',
  lg: 'px-10 py-5 text-xl font-black rounded-2xl tracking-wide',
}

export function Button({
  children, onClick, variant = 'primary', size = 'md',
  disabled, className = '', type = 'button', fullWidth
}: ButtonProps) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileTap={{ scale: disabled ? 1 : 0.96 }}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      className={`
        ${variants[variant]} ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
        transition-all duration-150 inline-flex items-center justify-center gap-2
        ${className}
      `}
    >
      {children}
    </motion.button>
  )
}
