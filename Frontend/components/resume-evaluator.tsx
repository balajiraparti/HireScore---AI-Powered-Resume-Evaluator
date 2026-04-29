'use client'

import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { InputScreen } from './input-screen'
import { ProcessingScreen } from './processing-screen'
import { ResultsScreen } from './results-screen'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import HeroWave from './ui/dynamic-wave-canvas-background'

type ViewState = 'input' | 'processing' | 'results'

export interface EvaluationResult {
  _id: string
  name: string
  status: 'saving'| 'queued' | 'processed' | 'converting pdf to images' | 'converting pdf to images success'
  JD: string
  Strength: string
  Weaknesses: string
  Improvements: string
  Score: number
}

// Demo mode: Simulates API responses for demonstration
const DEMO_MODE = false
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
const demoResults: EvaluationResult = {
  _id: 'demo-123',
  name: 'John_Doe_Resume.pdf',
  status: 'processed',
  JD: 'Senior Full-Stack Developer position requiring 5+ years of experience with React, Node.js, and cloud technologies. Must have strong problem-solving skills and experience with agile methodologies.',
  Strength: '• Strong technical background with 6 years of full-stack development experience\n• Extensive React and Node.js expertise demonstrated through multiple production applications\n• AWS certified with hands-on cloud infrastructure experience\n• Proven track record of leading agile teams and delivering projects on time\n• Excellent communication skills evidenced by technical blog posts and conference talks',
  Weaknesses: '• Limited experience with GraphQL mentioned in the job requirements\n• No specific mention of TypeScript proficiency which is preferred\n• Could highlight more specific metrics and KPIs from previous roles\n• Missing keywords around CI/CD pipeline management',
  Improvements: '• Add a dedicated skills section with TypeScript and GraphQL\n• Quantify achievements with specific metrics (e.g., "improved performance by 40%")\n• Include keywords from the job description naturally throughout\n• Add a brief summary section that directly addresses the senior developer requirements\n• Consider adding links to GitHub projects or portfolio demonstrating relevant work',
  Score: 78
}

export function ResumeEvaluator() {
  const [view, setView] = useState<ViewState>('input')
  const [fileId, setFileId] = useState<string | null>(null)
  const [uploadedFileName, setUploadedFileName] = useState<string>('')
  const [jobDescription, setJobDescription] = useState<string>('')

  // Demo mode simulation
  const [demoStatus, setDemoStatus] = useState<'queued' | 'processing' | 'completed'>('queued')

  const { data: result } = useQuery<EvaluationResult>({
    queryKey: ['evaluation', fileId],
    queryFn: async () => {
      if (DEMO_MODE) {
        // Simulate API delay and status progression
        return { ...demoResults, status: demoStatus, name: uploadedFileName, JD: jobDescription }
      }
      const response = await axios.get(`${API_URL}/${fileId}`)
      return response.data
    },
    enabled: !!fileId && view === 'processing',
    refetchInterval: (query) => {
      const data = query.state.data
      if (data?.status === 'processed') {
        return false
      }
      return 3000
    },
  })

  // Handle demo mode status progression
  const simulateProcessing = () => {
    if (DEMO_MODE) {
      setDemoStatus('queued')
      setTimeout(() => setDemoStatus('processing'), 2000)
      setTimeout(() => {
        setDemoStatus('completed')
        setView('results')
      }, 5000)
    }
  }

  // Watch for completion in non-demo mode
  if (result?.status === 'processed' && view === 'processing' && !DEMO_MODE) {
    setView('results')
  }

  const handleUploadComplete = (id: string, fileName: string, jd: string) => {
    setFileId(id)
    setUploadedFileName(fileName)
    setJobDescription(jd)
    setView('processing')
    simulateProcessing()
  }

  const handleReset = () => {
    setView('input')
    setFileId(null)
    setUploadedFileName('')
    setJobDescription('')
    setDemoStatus('queued')
  }

  const currentResult = DEMO_MODE 
    ? { ...demoResults, status: demoStatus, name: uploadedFileName, JD: jobDescription }
    : result

  return (
    <div className="relative min-h-screen bg-slate-950 overflow-hidden">
      {/* Animated Wave Background */}
      <div className="absolute inset-0 z-0">
        <HeroWave />
        {/* Gradient overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-slate-950/60 to-slate-950/90" />
      </div>
      
      {/* Main Content */}
      <div className="relative z-10 px-4 py-8 md:py-16">
        <div className="mx-auto max-w-6xl">
          <AnimatePresence mode="wait">
            {view === 'input' && (
              <InputScreen key="input" onUploadComplete={handleUploadComplete} />
            )}
            {view === 'processing' && (
              <ProcessingScreen 
                key="processing" 
                status={currentResult?.status || 'queued'} 
              />
            )}
            {view === 'results' && currentResult && (
              <ResultsScreen 
                key="results" 
                result={currentResult as EvaluationResult} 
                onReset={handleReset}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
