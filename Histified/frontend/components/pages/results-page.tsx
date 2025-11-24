"use client"

import { useState } from "react"
import type React from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Download } from "lucide-react"
import ScoreCard from "@/components/results/score-card"
import RedFlagsList from "@/components/results/red-flags-list"
import RecommendationsList from "@/components/results/recommendations-list"
import MetadataSection from "@/components/results/metadata-section"

interface ResultsPageProps {
  data: any
  fileName: string
  onBack: () => void
}

export default function ResultsPage({ data, fileName, onBack }: ResultsPageProps) {
  const [activeTab, setActiveTab] = useState("overview")

  const isImageData = data?.visualForensics !== undefined
  const isArticleData = data?.detailedAnalysis !== undefined

  // Extract summary data from backend response
  const summary = data?.summary || {}
  const toNumStrict = (v: any) => {
    if (typeof v === "number") return v
    if (typeof v === "string") {
      const cleaned = v.trim().replace(/%$/, "")
      const n = Number(cleaned)
      return Number.isFinite(n) ? n : NaN
    }
    return Number(v)
  }
  const candidatesExact = [
    summary.credibilityScore,
    summary.confidence,
    data?.visualForensics?.confidence,
    data?.metadataAnalysis?.confidence,
    data?.detailedAnalysis?.overallScore,
    data?.detailedAnalysis?.credibilityScore,
  ]
  const firstNumeric = candidatesExact
    .map(toNumStrict)
    .find((n) => Number.isFinite(n)) as number | undefined
  const finalScoreNum = Number.isFinite(firstNumeric as number)
    ? Math.max(0, Math.min(100, firstNumeric as number))
    : 0
  const verdict = summary.verdict || "UNKNOWN"
  const confidence = summary.confidence || summary.reliability || "UNKNOWN"

  // Determine credibility level based on score
  const credibilityLevel = finalScoreNum >= 75 ? "authentic" : finalScoreNum >= 50 ? "uncertain" : "suspicious"

  const credibilityColor =
    credibilityLevel === "authentic" ? "text-success" : credibilityLevel === "uncertain" ? "text-warning" : "text-error"

  const tabs = isImageData
    ? [
        { id: "overview", label: "Overview" },
        { id: "metadata", label: "Metadata Analysis" },
        { id: "forensics", label: "Visual Forensics" },
        { id: "warnings", label: "Warnings" },
        { id: "recommendations", label: "Recommendations" },
      ]
    : [
        { id: "overview", label: "Overview" },
        { id: "documentInfo", label: "Document Info" },
        { id: "analysis", label: "Detailed Analysis" },
        { id: "recommendations", label: "Recommendations" },
      ]

  // Simple progress bar for numeric metrics
  const ProgressBar = ({ value }: { value: number }) => {
    const pct = Math.max(0, Math.min(100, Number.isFinite(value) ? value : 0))
    return (
      <div className="w-full">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-foreground/60">Score</span>
          <span className="text-xs font-semibold text-accent">{pct.toFixed(0)}%</span>
        </div>
        <div className="h-2 w-full rounded bg-border/60 overflow-hidden">
          <div className="h-full bg-accent" style={{ width: `${pct}%` }} />
        </div>
      </div>
    )
  }

  // Badge for boolean values
  const BoolBadge = ({ v }: { v: boolean }) => (
    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${v ? "bg-success/20 text-success" : "bg-error/20 text-error"}`}>
      {v ? "Yes" : "No"}
    </span>
  )

  // Render arbitrary values in a readable way
  const renderValue = (val: any): React.ReactNode => {
    if (val === null || val === undefined) return <span className="text-foreground/50">N/A</span>
    if (typeof val === "number") return <ProgressBar value={val} />
    if (typeof val === "boolean") return <BoolBadge v={val} />
    if (typeof val === "string") return <span className="text-foreground/80 text-sm break-words">{val}</span>
    if (Array.isArray(val))
      return (
        <ul className="list-disc list-inside space-y-1 text-sm text-foreground/80">
          {val.map((item, idx) => (
            <li key={idx}>{typeof item === "object" ? renderObject(item) : String(item)}</li>
          ))}
        </ul>
      )
    if (typeof val === "object") return renderObject(val)
    return <span className="text-foreground/80 text-sm">{String(val)}</span>
  }

  const isNumeric = (x: any) => typeof x === "number" && Number.isFinite(x)

  const renderObject = (obj: Record<string, any>): React.ReactNode => {
    // Surface common keys first
    const preferredOrder = ["score", "confidence", "probability", "suspicion", "mean", "max", "min"]
    const keys = Object.keys(obj)
    const sorted = [
      ...preferredOrder.filter((k) => keys.includes(k)),
      ...keys.filter((k) => !preferredOrder.includes(k)),
    ]
    return (
      <div className="grid md:grid-cols-2 gap-3">
        {sorted.map((k) => (
          <div key={k} className="p-3 rounded border border-border/50 bg-surface/40">
            <p className="text-xs text-foreground/60 mb-1 capitalize">{k.replace(/([A-Z])/g, " $1")}</p>
            {isNumeric(obj[k]) ? (
              <ProgressBar value={obj[k]} />
            ) : (
              <div className="text-sm text-foreground/80">{renderValue(obj[k])}</div>
            )}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="min-h-screen px-4 py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-12 max-w-6xl mx-auto">
        <div>
          <h1 className="text-4xl font-playfair font-bold mb-2">Analysis Report</h1>
          <p className="text-foreground/60 text-sm">{fileName}</p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" className="gap-2 bg-transparent">
            <Download className="w-4 h-4" />
            Export Report
          </Button>
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 text-foreground/70 hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            New Analysis
          </button>
        </div>
      </div>

      {/* Credibility Score */}
      <div className="max-w-6xl mx-auto mb-12 p-8 rounded border border-accent/20 bg-surface/50">
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="font-playfair text-2xl font-bold mb-4">
              {isImageData ? "Authenticity Assessment" : "Credibility Assessment"}
            </h2>
            <p className="text-foreground/70 mb-4">
              {isImageData ? "Based on forensic and visual analysis" : "Based on document and content analysis"}
            </p>
            <div className={`text-5xl font-playfair font-bold ${credibilityColor}`}>{finalScoreNum.toFixed(0)}%</div>
            <p className={`mt-2 text-lg font-semibold ${credibilityColor} uppercase tracking-wide`}>{verdict}</p>
          </div>
          <div>
            <div className="space-y-4">
              <div className="p-4 rounded border border-border bg-surface/50">
                <p className="text-sm text-foreground/60 mb-1">Confidence</p>
                <p className="font-semibold text-accent">{confidence}</p>
              </div>
              {summary.explanation && (
                <div className="p-4 rounded border border-border bg-surface/50">
                  <p className="text-sm text-foreground/60 mb-1">Assessment</p>
                  <p className="text-sm text-foreground">{summary.explanation}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-6xl mx-auto">
        <div className="flex gap-2 overflow-x-auto pb-4 mb-8 border-b border-border">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 whitespace-nowrap font-semibold transition-colors ${
                activeTab === tab.id
                  ? "text-accent border-b-2 border-accent"
                  : "text-foreground/60 hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="space-y-8">
          {activeTab === "overview" && (
            <div className="p-6 rounded border border-border bg-surface/30">
              <h3 className="font-playfair text-xl font-bold mb-4">Analysis Overview</h3>
              {isImageData && data.visualForensics && (
                <div className="grid md:grid-cols-3 gap-4">
                  <ScoreCard label="Metadata" score={data.metadataAnalysis?.confidence || 0} icon="📋" />
                  <ScoreCard label="Visual Forensics" score={data.visualForensics?.confidence || 0} icon="🔬" />
                  <ScoreCard label="Suspicion" score={100 - (data.visualForensics?.suspicionScore || 0)} icon="⚠️" />
                </div>
              )}
              {isArticleData && (
                <div className="grid md:grid-cols-2 gap-4">
                  <ScoreCard label="Sources" score={data.detailedAnalysis?.sourceCitations?.score || 0} icon="📚" />
                  <ScoreCard
                    label="Writing Quality"
                    score={data.detailedAnalysis?.writingQuality?.score || 0}
                    icon="✍️"
                  />
                  <ScoreCard label="Factual Claims" score={data.detailedAnalysis?.factualClaims?.score || 0} icon="✓" />
                  <ScoreCard label="Bias Detection" score={data.detailedAnalysis?.biasDetection?.score || 0} icon="⚖️" />
                </div>
              )}
            </div>
          )}

          {isImageData && activeTab === "metadata" && (
            <div className="p-6 rounded border border-border bg-surface/30 space-y-4">
              <h3 className="font-playfair text-xl font-bold">Metadata Analysis</h3>
              {data.metadataAnalysis ? (
                <MetadataSection metadata={data.metadataAnalysis} />
              ) : (
                <p className="text-foreground/60">No metadata analysis available</p>
              )}
            </div>
          )}

          {isImageData && activeTab === "forensics" && (
            <div className="p-6 rounded border border-border bg-surface/30 space-y-4">
              <h3 className="font-playfair text-xl font-bold">Visual Forensics</h3>
              {data.visualForensics?.analyses ? (
                <div className="space-y-4">
                  {Object.entries(data.visualForensics.analyses).map(([key, value]: [string, any]) => (
                    <div key={key} className="p-4 bg-surface rounded border border-border/50 space-y-3">
                      <p className="font-semibold text-accent capitalize">{key.replace(/([A-Z])/g, " $1")}</p>
                      {renderValue(value)}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-foreground/60">No forensics data available</p>
              )}
            </div>
          )}

          {isImageData && activeTab === "warnings" && (
            <RedFlagsList
              flags={
                data.allWarnings?.map((warning: string) => ({
                  type: warning,
                  severity: "medium",
                  description: "Warning detected during analysis",
                })) || []
              }
            />
          )}

          {isArticleData && activeTab === "documentInfo" && (
            <div className="p-6 rounded border border-border bg-surface/30 space-y-4">
              <h3 className="font-playfair text-xl font-bold">Document Information</h3>
              {data.documentInfo ? (
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-surface rounded border border-border/50">
                    <p className="text-sm text-foreground/60 mb-1">Pages</p>
                    <p className="text-xl font-bold text-accent">{data.documentInfo?.pages || "N/A"}</p>
                  </div>
                  <div className="p-4 bg-surface rounded border border-border/50">
                    <p className="text-sm text-foreground/60 mb-1">Word Count</p>
                    <p className="text-xl font-bold text-accent">{data.documentInfo?.wordCount || "N/A"}</p>
                  </div>
                  <div className="p-4 bg-surface rounded border border-border/50">
                    <p className="text-sm text-foreground/60 mb-1">Characters</p>
                    <p className="text-xl font-bold text-accent">{data.documentInfo?.characterCount || "N/A"}</p>
                  </div>
                  <div className="p-4 bg-surface rounded border border-border/50">
                    <p className="text-sm text-foreground/60 mb-1">Author</p>
                    <p className="text-sm text-foreground">{data.documentInfo?.metadata?.author || "Unknown"}</p>
                  </div>
                </div>
              ) : (
                <p className="text-foreground/60">No document info available</p>
              )}
            </div>
          )}

          {isArticleData && activeTab === "analysis" && (
            <div className="p-6 rounded border border-border bg-surface/30 space-y-4">
              <h3 className="font-playfair text-xl font-bold">Detailed Analysis</h3>
              {data.detailedAnalysis ? (
                <div className="grid gap-4">
                  {Object.entries(data.detailedAnalysis).map(([key, value]: [string, any]) => (
                    <div key={key} className="p-4 bg-surface rounded border border-border/50 space-y-3">
                      <p className="font-semibold text-accent capitalize">{key.replace(/([A-Z])/g, " $1")}</p>
                      {renderValue(value)}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-foreground/60">No analysis data available</p>
              )}
            </div>
          )}

          {activeTab === "recommendations" && <RecommendationsList recommendations={data.recommendations || []} />}
        </div>
      </div>
    </div>
  )
}
