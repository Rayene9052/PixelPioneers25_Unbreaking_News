"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Upload, ArrowLeft, AlertCircle } from "lucide-react"

interface UploadPageProps {
  onFileSelected: (file: File) => void
  onBack: () => void
}

export default function UploadPage({ onFileSelected, onBack }: UploadPageProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const allowedTypes = ["image/jpeg", "image/png", "video/mp4", "video/quicktime", "application/pdf"]
  const maxSize = 100 * 1024 * 1024 // 100MB

  const handleFileSelection = (file: File) => {
    setError(null)

    if (!allowedTypes.includes(file.type)) {
      setError("Invalid file type. Allowed: JPEG, PNG, MP4, MOV, PDF")
      return
    }

    if (file.size > maxSize) {
      setError("File too large. Maximum size: 100MB")
      return
    }

    setSelectedFile(file)

    // Create preview
    if (file.type.startsWith("image")) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    } else if (file.type.startsWith("video")) {
      setPreview("video")
    } else {
      setPreview("pdf")
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFileSelection(file)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFileSelection(file)
  }

  return (
    <div className="min-h-screen flex flex-col px-4 py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-12">
        <div>
          <h1 className="text-4xl font-playfair font-bold mb-2">Evidence Submission</h1>
          <p className="text-foreground/60">Upload multimedia for forensic analysis</p>
        </div>
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 text-foreground/70 hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
      </div>

      {/* Upload Area */}
      <div className="max-w-2xl mx-auto w-full">
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative p-12 rounded border-2 border-dashed cursor-pointer transition-all ${
            isDragging
              ? "border-accent bg-surface/60"
              : selectedFile
                ? "border-success bg-success/5"
                : "border-accent/50 hover:border-accent bg-surface/30"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileInput}
            accept={allowedTypes.join(",")}
            className="hidden"
          />

          <div className="text-center">
            {!selectedFile ? (
              <>
                <Upload className="w-12 h-12 text-accent mx-auto mb-4" />
                <h3 className="text-xl font-playfair font-bold mb-2">Upload Your File</h3>
                <p className="text-foreground/70 mb-2">Drag and drop or click to browse</p>
                <p className="text-sm text-foreground/50">Supported: JPEG, PNG, MP4, MOV, PDF (Max 100MB)</p>
              </>
            ) : preview === "video" ? (
              <>
                <div className="w-16 h-16 bg-surface rounded mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl">🎬</span>
                </div>
                <h3 className="text-xl font-playfair font-bold mb-1">{selectedFile.name}</h3>
                <p className="text-sm text-foreground/70">{(selectedFile.size / 1024 / 1024).toFixed(2)}MB</p>
              </>
            ) : preview === "pdf" ? (
              <>
                <div className="w-16 h-16 bg-surface rounded mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl">📄</span>
                </div>
                <h3 className="text-xl font-playfair font-bold mb-1">{selectedFile.name}</h3>
                <p className="text-sm text-foreground/70">{(selectedFile.size / 1024 / 1024).toFixed(2)}MB</p>
              </>
            ) : (
              <>
                {preview ? (
                  <img src={preview} alt="Preview" className="w-48 h-48 object-cover rounded mx-auto mb-4" />
                ) : null}
                <h3 className="text-xl font-playfair font-bold mb-1">{selectedFile.name}</h3>
                <p className="text-sm text-foreground/70">{(selectedFile.size / 1024 / 1024).toFixed(2)}MB</p>
              </>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-6 p-4 rounded border border-error/50 bg-error/10 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-error flex-shrink-0 mt-0.5" />
            <p className="text-sm text-error">{error}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 mt-12 justify-center">
          <Button onClick={onBack} variant="outline" className="px-8 py-2 bg-transparent">
            Cancel
          </Button>
          <Button
            onClick={() => selectedFile && onFileSelected(selectedFile)}
            disabled={!selectedFile}
            className="px-8 py-2 bg-accent hover:bg-accent-muted text-background disabled:opacity-50"
          >
            Begin Forensic Analysis
          </Button>
        </div>
      </div>
    </div>
  )
}
