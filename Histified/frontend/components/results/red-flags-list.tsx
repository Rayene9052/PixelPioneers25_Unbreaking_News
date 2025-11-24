import { AlertTriangle } from "lucide-react"

interface RedFlagsListProps {
  flags: Array<{
    type?: string
    description?: string
    severity?: "high" | "medium" | "low"
  }>
}

export default function RedFlagsList({ flags }: RedFlagsListProps) {
  if (!flags || flags.length === 0) {
    return (
      <div className="p-6 rounded border border-border bg-surface/30 text-center">
        <p className="text-foreground/60">No red flags detected</p>
      </div>
    )
  }

  const severityColor = {
    high: "text-error bg-error/10 border-error/30",
    medium: "text-warning bg-warning/10 border-warning/30",
    low: "text-accent bg-accent/10 border-accent/30",
  }

  return (
    <div className="space-y-4">
      {flags.map((flag, idx) => (
        <div key={idx} className={`p-4 rounded border ${severityColor[flag.severity || "medium"]}`}>
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold mb-1">{flag.type || "Unknown Issue"}</h4>
              <p className="text-sm opacity-90">{flag.description || "No details provided"}</p>
              <p className="text-xs mt-2 opacity-75">Severity: {(flag.severity || "medium").toUpperCase()}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
