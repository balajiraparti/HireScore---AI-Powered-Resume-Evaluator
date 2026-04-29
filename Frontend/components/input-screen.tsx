'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText, Loader2, X } from 'lucide-react'
import axios from 'axios'

interface InputScreenProps {
  onUploadComplete: (fileId: string, fileName: string, jd: string) => void
}
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
// Demo mode flag
const DEMO_MODE = false

export function InputScreen({ onUploadComplete }: InputScreenProps) {
  const [jobDescription, setJobDescription] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isFocused, setIsFocused] = useState(false)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0])
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
  })

  const handleSubmit = async () => {
    if (!file || !jobDescription.trim()) return

    setIsUploading(true)

    try {
      if (DEMO_MODE) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500))
        onUploadComplete('demo-file-id', file.name, jobDescription)
      } else {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('JD', jobDescription)

        const response = await axios.post(`${API_URL}/upload`, formData)
        onUploadComplete(response.data.file_id, file.name, jobDescription)
      }
    } catch (error) {
      console.error('Upload failed:', error)
      setIsUploading(false)
    }
  }

  const removeFile = () => {
    setFile(null)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="space-y-10"
    >
      {/* Hero Title */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 200, damping: 25 }}
        className="text-center"
      >
        <h1 className="text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-indigo-500 to-sky-400 md:text-7xl lg:text-8xl">
          Resume
          <br />
          Evaluator
        </h1>
        <p className="mt-4 text-lg text-slate-400 leading-relaxed max-w-2xl mx-auto">
          Upload your resume and paste the job description to get AI-powered insights on how well your profile matches the role.
        </p>
      </motion.div>

      {/* Main Form Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 25 }}
        className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6"
      >
        {/* Job Description Textarea */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
            Job Description
          </label>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Paste the job description here..."
            className={`w-full min-h-[150px] p-4 bg-slate-900 border rounded-xl text-sm text-slate-300 placeholder:text-slate-600 resize-none transition-all duration-300 focus:outline-none ${
              isFocused 
                ? 'border-indigo-500 ring-2 ring-indigo-500/20' 
                : 'border-slate-700 hover:border-slate-600'
            }`}
          />
        </div>

        {/* Dropzone */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
            Resume (PDF)
          </label>
          
          {!file ? (
            <motion.div
              {...getRootProps()}
              animate={{ 
                scale: isDragActive ? 1.02 : 1,
                borderColor: isDragActive ? '#6366f1' : '#334155'
              }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className={`relative border-2 border-dashed rounded-xl p-8 md:p-12 text-center cursor-pointer transition-colors ${
                isDragActive 
                  ? 'bg-indigo-500/10 border-indigo-500' 
                  : 'bg-slate-900/30 border-slate-700 hover:border-slate-600 hover:bg-slate-900/50'
              }`}
            >
              <input {...getInputProps()} />
              <motion.div
                animate={{ y: isDragActive ? -5 : 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <Upload className={`w-12 h-12 mx-auto mb-4 ${isDragActive ? 'text-indigo-400' : 'text-slate-500'}`} />
                <p className="text-slate-300 font-medium">
                  {isDragActive ? 'Drop your resume here' : 'Drag & drop your resume here'}
                </p>
                <p className="text-slate-500 text-sm mt-1">or click to browse</p>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-4 p-4 bg-slate-900/50 border border-slate-700 rounded-xl"
            >
              <div className="p-3 bg-indigo-500/20 rounded-lg">
                <FileText className="w-6 h-6 text-indigo-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-slate-200 font-medium truncate">{file.name}</p>
                <p className="text-slate-500 text-sm">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
              <button
                onClick={removeFile}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-400 hover:text-slate-200" />
              </button>
            </motion.div>
          )}
        </div>

        {/* Submit Button */}
        <motion.button
          onClick={handleSubmit}
          disabled={!file || !jobDescription.trim() || isUploading}
          whileHover={{ scale: !file || !jobDescription.trim() || isUploading ? 1 : 1.01 }}
          whileTap={{ scale: !file || !jobDescription.trim() || isUploading ? 1 : 0.99 }}
          className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 ${
            !file || !jobDescription.trim() || isUploading
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
              : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30'
          }`}
        >
          {isUploading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              Analyzing...
            </span>
          ) : (
            'Analyze Resume'
          )}
        </motion.button>
      </motion.div>
    </motion.div>
  )
}
