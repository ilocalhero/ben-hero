interface BadgeProps {
  children: React.ReactNode
  color?: 'blue' | 'purple' | 'green' | 'orange' | 'yellow'
  size?: 'sm' | 'md'
}

const colors = {
  blue: 'bg-[#00d4ff20] text-[#00d4ff] border-[#00d4ff44]',
  purple: 'bg-[#b24bff20] text-[#b24bff] border-[#b24bff44]',
  green: 'bg-[#00ff8820] text-[#00ff88] border-[#00ff8844]',
  orange: 'bg-[#ff6b3520] text-[#ff6b35] border-[#ff6b3544]',
  yellow: 'bg-[#ffd70020] text-[#ffd700] border-[#ffd70044]',
}

export function Badge({ children, color = 'blue', size = 'md' }: BadgeProps) {
  return (
    <span className={`
      ${colors[color]}
      ${size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1'}
      border rounded-full font-semibold inline-block
    `}>
      {children}
    </span>
  )
}
