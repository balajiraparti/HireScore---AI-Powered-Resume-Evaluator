'use client'

import { motion } from 'framer-motion'

interface ProcessingScreenProps {
  status: 'queued' | 'processing' | 'completed'
}

export function ProcessingScreen({ status }: ProcessingScreenProps) {
  const statusText = status === 'queued' ? 'QUEUED' : status === 'processing' ? 'PROCESSING' : 'COMPLETED'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="flex flex-col items-center justify-center min-h-[60vh] space-y-8"
    >
      {/* Animated Loader */}
      <div className="relative">
        {/* Outer Ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          className="w-32 h-32 rounded-full border-4 border-slate-800"
        />
        
        {/* Inner Ring */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-2 rounded-full border-4 border-transparent border-t-indigo-500 border-r-indigo-500"
        />
        
        {/* Center Pulse */}
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-6 rounded-full bg-indigo-500/20"
        />
        
        {/* Core */}
        <motion.div
          animate={{ 
            boxShadow: [
              '0 0 20px rgba(99, 102, 241, 0.3)',
              '0 0 40px rgba(99, 102, 241, 0.6)',
              '0 0 20px rgba(99, 102, 241, 0.3)'
            ]
          }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-10 rounded-full bg-indigo-600"
        />
      </div>

      {/* Status Text */}
      <div className="text-center space-y-2">
        <motion.div
          key={status}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
          <p className="text-slate-500 text-sm uppercase tracking-widest">Status</p>
          <motion.h2
            animate={{ 
              color: status === 'processing' 
                ? ['#6366f1', '#0ea5e9', '#6366f1'] 
                : '#6366f1'
            }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="text-4xl md:text-5xl font-black tracking-tighter"
          >
            {statusText}
          </motion.h2>
        </motion.div>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-slate-400 text-lg"
        >
          {status === 'queued' && 'Your resume is in the queue...'}
          {status === 'processing' && 'AI is analyzing your resume...'}
          {status === 'completed' && 'Analysis complete!'}
        </motion.p>
      </div>

      {/* Progress Dots */}
      <div className="flex gap-2">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{ 
              scale: [1, 1.3, 1],
              opacity: [0.3, 1, 0.3]
            }}
            transition={{ 
              duration: 1.5, 
              repeat: Infinity, 
              delay: i * 0.2,
              ease: 'easeInOut'
            }}
            className="w-3 h-3 rounded-full bg-indigo-500"
          />
        ))}
      </div>
    </motion.div>
  )
}
