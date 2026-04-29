'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface ScoreWidgetProps {
  score: number
}

export function ScoreWidget({ score }: ScoreWidgetProps) {
  const [animatedScore, setAnimatedScore] = useState(0)
  
  // Determine color based on score
  const getColor = (value: number) => {
    if (value >= 80) return { stroke: '#10b981', text: 'text-emerald-400' } // Emerald
    if (value >= 60) return { stroke: '#f59e0b', text: 'text-amber-400' } // Amber
    return { stroke: '#f43f5e', text: 'text-rose-400' } // Rose
  }

  const color = getColor(score)
  
  // Circle parameters
  const size = 160
  const strokeWidth = 12
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const progress = (animatedScore / 100) * circumference
  const offset = circumference - progress

  useEffect(() => {
    // Animate score counting up
    const duration = 1500
    const steps = 60
    const increment = score / steps
    let current = 0
    
    const timer = setInterval(() => {
      current += increment
      if (current >= score) {
        setAnimatedScore(score)
        clearInterval(timer)
      } else {
        setAnimatedScore(Math.floor(current))
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [score])

  return (
    <div className="relative flex items-center justify-center">
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#1e293b"
          strokeWidth={strokeWidth}
        />
        
        {/* Progress Circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color.stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          style={{
            filter: `drop-shadow(0 0 8px ${color.stroke}40)`,
          }}
        />
      </svg>
      
      {/* Score Text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
          className={`text-6xl font-black ${color.text}`}
        >
          {animatedScore}
        </motion.span>
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-slate-500 text-sm font-medium uppercase tracking-wider"
        >
          Match Score
        </motion.span>
      </div>
    </div>
  )
}
