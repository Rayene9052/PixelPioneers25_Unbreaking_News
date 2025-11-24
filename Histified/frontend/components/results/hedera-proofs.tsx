"use client"

import { CheckCircle, Copy } from "lucide-react"
import { useState } from "react"

interface HederaProofsProps {
  proofs: Array<{
    transaction_id?: string
    timestamp?: string
    hash?: string
    status?: "verified" | "pending" | "failed"
  }>
}

export default function HederaProofs({ proofs }: HederaProofsProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(text)
    setTimeout(() => setCopiedId(null), 2000)
  }

  if (!proofs || proofs.length === 0) {
    return (
      <div className="p-6 rounded border border-border bg-surface/30 text-center">
        <p className="text-foreground/60">No blockchain proofs available</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {proofs.map((proof, idx) => (
        <div key={idx} className="p-6 rounded border border-success/30 bg-success/5">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-success" />
              <h4 className="font-semibold text-success">Blockchain Verified</h4>
            </div>
            <span className="text-xs px-2 py-1 rounded bg-success/20 text-success font-semibold">
              {proof.status?.toUpperCase() || "VERIFIED"}
            </span>
          </div>

          <div className="space-y-3">
            {proof.transaction_id && (
              <div>
                <p className="text-xs text-foreground/60 mb-1">Transaction ID</p>
                <div className="flex items-center gap-2 p-2 bg-surface/50 rounded font-mono text-sm">
                  <span className="text-foreground/70 truncate">{proof.transaction_id}</span>
                  <button
                    onClick={() => handleCopy(proof.transaction_id!)}
                    className="ml-auto p-1 hover:bg-surface rounded transition-colors"
                  >
                    <Copy className="w-4 h-4 text-foreground/60 hover:text-foreground" />
                  </button>
                </div>
              </div>
            )}

            {proof.hash && (
              <div>
                <p className="text-xs text-foreground/60 mb-1">Content Hash</p>
                <div className="flex items-center gap-2 p-2 bg-surface/50 rounded font-mono text-sm">
                  <span className="text-foreground/70 truncate">{proof.hash}</span>
                  <button
                    onClick={() => handleCopy(proof.hash!)}
                    className="ml-auto p-1 hover:bg-surface rounded transition-colors"
                  >
                    <Copy className="w-4 h-4 text-foreground/60 hover:text-foreground" />
                  </button>
                </div>
              </div>
            )}

            {proof.timestamp && (
              <div>
                <p className="text-xs text-foreground/60 mb-1">Verification Timestamp</p>
                <p className="text-sm text-foreground">{new Date(proof.timestamp).toLocaleString()}</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
