"use client"

import { useState } from "react"

export default function Navbar({ onNavigate }: { onNavigate: (page: string) => void }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div
            onClick={() => {
              onNavigate("home")
              setIsOpen(false)
            }}
            className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition"
          >
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="font-bold text-primary-foreground text-sm">H</span>
            </div>
            <span className="font-playfair text-xl font-bold text-primary hidden sm:block">Histified</span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex gap-8">
            <button
              onClick={() => {
                onNavigate("home")
                setIsOpen(false)
              }}
              className="text-sm font-medium hover:text-primary transition"
            >
              Home
            </button>
            <button
              onClick={() => {
                onNavigate("features")
                setIsOpen(false)
              }}
              className="text-sm font-medium hover:text-primary transition"
            >
              Features
            </button>
            <button
              onClick={() => {
                onNavigate("about")
                setIsOpen(false)
              }}
              className="text-sm font-medium hover:text-primary transition"
            >
              About
            </button>
            <button
              onClick={() => {
                onNavigate("upload")
                setIsOpen(false)
              }}
              className="text-sm font-medium px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition"
            >
              Analyze
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-2 hover:bg-muted rounded">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden border-t border-border py-4 space-y-3">
            <button
              onClick={() => {
                onNavigate("home")
                setIsOpen(false)
              }}
              className="block w-full text-left px-4 py-2 hover:bg-muted rounded"
            >
              Home
            </button>
            <button
              onClick={() => {
                onNavigate("features")
                setIsOpen(false)
              }}
              className="block w-full text-left px-4 py-2 hover:bg-muted rounded"
            >
              Features
            </button>
            <button
              onClick={() => {
                onNavigate("about")
                setIsOpen(false)
              }}
              className="block w-full text-left px-4 py-2 hover:bg-muted rounded"
            >
              About
            </button>
            <button
              onClick={() => {
                onNavigate("upload")
                setIsOpen(false)
              }}
              className="block w-full text-center px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
            >
              Start Analysis
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}
