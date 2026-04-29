'use client'

import { motion } from 'framer-motion'
import { ArrowLeft, CheckCircle2, AlertCircle, Lightbulb } from 'lucide-react'
import { ScoreWidget } from './score-widget'
import type { EvaluationResult } from './resume-evaluator'

interface ResultsScreenProps {
  result: EvaluationResult
  onReset: () => void
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
    },
  },
}

export function ResultsScreen({ result, onReset }: ResultsScreenProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0, y: -20 }}
      variants={containerVariants}
      className="space-y-8"
    >
      {/* Back Button */}
      <motion.button
        variants={itemVariants}
        onClick={onReset}
        whileHover={{ x: -5 }}
        className="flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="font-medium">Analyze Another Resume</span>
      </motion.button>

      {/* Header Section */}
      <motion.div
        variants={itemVariants}
        className="grid gap-6 md:grid-cols-[1fr_auto]"
      >
        {/* Candidate Info Card */}
        <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6">
          <p className="text-sm text-slate-500 uppercase tracking-widest mb-2">Candidate</p>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-50 mb-4">{result.name}</h2>
          <p className="text-sm text-slate-500 uppercase tracking-widest mb-2">Job Description</p>
          <p className="text-slate-400 text-sm leading-relaxed line-clamp-3">{result.JD}</p>
        </div>

        {/* Score Widget */}
        <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6 flex items-center justify-center">
          <ScoreWidget score={result.Score} />
        </div>
      </motion.div>

      {/* Analysis Cards */}
      <motion.div
        variants={containerVariants}
        className="grid gap-6 md:grid-cols-3"
      >
        {/* Strengths Card */}
        <motion.div
          variants={itemVariants}
          className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl overflow-hidden"
        >
          <div className="h-1 bg-emerald-500" />
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-emerald-500/20 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-emerald-400 uppercase tracking-widest">
                Strengths
              </h3>
            </div>
            <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
              {result.Strength}
            </div>
          </div>
        </motion.div>

        {/* Weaknesses Card */}
        <motion.div
          variants={itemVariants}
          className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl overflow-hidden"
        >
          <div className="h-1 bg-rose-500" />
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-rose-500/20 rounded-lg">
                <AlertCircle className="w-5 h-5 text-rose-400" />
              </div>
              <h3 className="text-xl font-bold text-rose-400 uppercase tracking-widest">
                Weaknesses
              </h3>
            </div>
            <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
              {result.Weaknesses}
            </div>
          </div>
        </motion.div>

        {/* Improvements Card */}
        <motion.div
          variants={itemVariants}
          className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl overflow-hidden"
        >
          <div className="h-1 bg-sky-500" />
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-sky-500/20 rounded-lg">
                <Lightbulb className="w-5 h-5 text-sky-400" />
              </div>
              <h3 className="text-xl font-bold text-sky-400 uppercase tracking-widest">
                Improvements
              </h3>
            </div>
            <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
              {result.Improvements}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
