import { useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '../lib/utils'

interface TiltCardProps {
  children: React.ReactNode
  className?: string
}

export function TiltCard({ children, className }: TiltCardProps) {
  const [rotate, setRotate] = useState({ x: 0, y: 0 })

  const handleMouse = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = (e.clientY - rect.top - rect.height / 2) / 20
    const y = -(e.clientX - rect.left - rect.width / 2) / 20
    setRotate({ x, y })
  }

  return (
    <motion.div
      onMouseMove={handleMouse}
      onMouseLeave={() => setRotate({ x: 0, y: 0 })}
      animate={{ rotateX: rotate.x, rotateY: rotate.y }}
      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
      style={{ perspective: 1000, transformStyle: 'preserve-3d' }}
      className={cn('glass-card rounded-xl', className)}
    >
      {children}
    </motion.div>
  )
}
