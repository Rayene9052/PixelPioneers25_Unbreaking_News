interface MetadataAnalysis {
  available?: boolean
  confidence?: number
  isOriginal?: boolean
  warnings?: string[]
  extractedFields?: Record<string, string>
}

interface MetadataSectionProps {
  metadata: MetadataAnalysis
}

export default function MetadataSection({ metadata }: MetadataSectionProps) {
  return (
    <div className="space-y-4">
      {/* Availability and Confidence */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="p-4 bg-surface rounded border border-border/50">
          <p className="text-sm text-foreground/60 mb-1">Metadata Available</p>
          <p className="text-lg font-bold text-accent">{metadata.available ? "Yes" : "No"}</p>
        </div>
        <div className="p-4 bg-surface rounded border border-border/50">
          <p className="text-sm text-foreground/60 mb-1">Confidence</p>
          <p className="text-lg font-bold text-accent">{metadata.confidence || 0}%</p>
        </div>
      </div>

      {/* Warnings */}
      {metadata.warnings && metadata.warnings.length > 0 && (
        <div className="p-4 bg-warning/10 rounded border border-warning/50">
          <p className="font-semibold text-warning mb-2">Warnings</p>
          <ul className="text-sm text-foreground/70 space-y-1">
            {metadata.warnings.map((warning, idx) => (
              <li key={idx}>• {warning}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Extracted Fields */}
      {metadata.extractedFields && (
        <div className="space-y-2">
          <p className="font-semibold">Extracted Fields</p>
          <div className="grid md:grid-cols-2 gap-2">
            {Object.entries(metadata.extractedFields).map(([key, value]) => (
              <div key={key} className="p-3 bg-surface rounded border border-border/50">
                <p className="text-xs text-foreground/60">{key}</p>
                <p className="text-sm font-mono text-foreground/80 truncate">{value}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
