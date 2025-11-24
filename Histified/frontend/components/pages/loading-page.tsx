"use client"

import { useState, useEffect } from "react"

interface LoadingPageProps {
  fileName: string
}

const analysisStages = [
  { name: "Metadata Extraction", duration: 2 },
  { name: "Forensic Analysis", duration: 3 },
  { name: "OSINT Research", duration: 2 },
  { name: "AI Semantic Analysis", duration: 3 },
  { name: "Hedera Verification", duration: 2 },
  { name: "Report Generation", duration: 1 },
]

export default function LoadingPage({ fileName }: LoadingPageProps) {
  const [currentStageIndex, setCurrentStageIndex] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const totalDuration = analysisStages.reduce((acc, s) => acc + s.duration, 0) * 1000
    const startTime = Date.now()

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const newProgress = Math.min((elapsed / totalDuration) * 100, 100)
      setProgress(newProgress)

      let cumulativeDuration = 0
      for (let i = 0; i < analysisStages.length; i++) {
        cumulativeDuration += analysisStages[i].duration * 1000
        if (elapsed >= cumulativeDuration && i !== currentStageIndex) {
          setCurrentStageIndex(i)
        }
      }

      if (newProgress >= 100) clearInterval(interval)
    }, 100)

    return () => clearInterval(interval)
  }, [currentStageIndex])

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-playfair font-bold mb-2">Analysis in Progress</h1>
        <p className="text-foreground/60">{fileName}</p>
      </div>

      {/* Analysis Stages */}
      <div className="max-w-md w-full space-y-6 mb-12">
        {analysisStages.map((stage, index) => (
          <div key={stage.name} className="flex items-start gap-4">
            <div className="flex-shrink-0">
              {index < currentStageIndex ? (
                <div className="w-8 h-8 rounded-full bg-success flex items-center justify-center text-white text-sm">
                  ✓
                </div>
              ) : index === currentStageIndex ? (
                <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-background animate-pulse" />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-surface border border-border" />
              )}
            </div>
            <div className="flex-1">
              <p className={`font-semibold ${index <= currentStageIndex ? "text-foreground" : "text-foreground/50"}`}>
                {stage.name}
              </p>
              {index === currentStageIndex && (
                <div className="h-1 bg-surface rounded mt-2 overflow-hidden">
                  <div className="h-full bg-accent animate-pulse" style={{ width: "60%" }} />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Overall Progress Bar */}
      <div className="max-w-md w-full">
        <div className="h-2 bg-surface rounded overflow-hidden mb-2">
          <div
            className="h-full bg-gradient-to-r from-accent to-accent-muted transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-center text-sm text-foreground/60">{Math.round(progress)}% Complete</p>
      </div>

      {/* Loading Animation */}
      <div className="mt-12">
        <div className="flex gap-1 justify-center">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-accent animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
