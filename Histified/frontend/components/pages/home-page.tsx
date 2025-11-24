"use client"

import { Button } from "@/components/ui/button"
import { Shield, Search, Lock } from "lucide-react"

interface HomePageProps {
  onStartAnalysis: () => void
}

export default function HomePage({ onStartAnalysis }: HomePageProps) {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-20">
      {/* Header */}
      <div className="text-center mb-20 max-w-3xl">
        <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded border border-accent/30 bg-surface/50">
          <Lock className="w-4 h-4 text-accent" />
          <span className="text-xs uppercase tracking-widest text-accent">Classified Analysis Platform</span>
        </div>

        <h1 className="text-6xl md:text-7xl font-playfair font-bold mb-6 text-foreground leading-tight">Histified</h1>

        <p className="text-xl text-foreground/70 mb-4 font-lora">
          Digital Forensic Intelligence & Authenticity Verification
        </p>

        <p className="text-base text-foreground/60 max-w-xl mx-auto font-lora leading-relaxed">
          Advanced multimedia analysis combining forensic science, open-source intelligence, and AI-powered semantic
          analysis to detect deepfakes, verify authenticity, and combat misinformation.
        </p>
      </div>

      {/* Mission Statement */}
      <div className="grid md:grid-cols-3 gap-8 mb-16 max-w-4xl">
        <div className="p-6 rounded border border-accent/20 bg-surface/40">
          <Shield className="w-8 h-8 text-accent mb-3" />
          <h3 className="font-playfair text-lg font-bold mb-2">Forensic Analysis</h3>
          <p className="text-sm text-foreground/70">
            Detect manipulation, metadata analysis, and integrity verification
          </p>
        </div>

        <div className="p-6 rounded border border-accent/20 bg-surface/40">
          <Search className="w-8 h-8 text-accent mb-3" />
          <h3 className="font-playfair text-lg font-bold mb-2">OSINT Research</h3>
          <p className="text-sm text-foreground/70">
            Cross-reference sources, reverse image search, and origin tracing
          </p>
        </div>

        <div className="p-6 rounded border border-accent/20 bg-surface/40">
          <Lock className="w-8 h-8 text-accent mb-3" />
          <h3 className="font-playfair text-lg font-bold mb-2">AI Verification</h3>
          <p className="text-sm text-foreground/70">Semantic analysis, NLP detection, and authenticity scoring</p>
        </div>
      </div>

      {/* CTA Button */}
      <Button
        onClick={onStartAnalysis}
        className="px-12 py-3 text-lg bg-accent hover:bg-accent-muted text-background font-semibold rounded transition-all"
      >
        Begin Analysis →
      </Button>

      {/* Footer */}
      <div className="mt-20 pt-12 border-t border-border text-center text-sm text-foreground/50">
        <p>Classified Analysis System | Powered by Advanced AI & Forensic Intelligence</p>
      </div>
    </div>
  )
}
