interface Recommendation {
  priority: string
  category?: string
  issue?: string
  action: string
  reason?: string
}

interface RecommendationsListProps {
  recommendations: Recommendation[]
}

export default function RecommendationsList({ recommendations }: RecommendationsListProps) {
  const getPriorityColor = (priority: string) => {
    if (priority.includes("CRITICAL") || priority.includes("🔴")) return "border-error/50 bg-error/10"
    if (priority.includes("HIGH") || priority.includes("🟡")) return "border-warning/50 bg-warning/10"
    return "border-success/50 bg-success/10"
  }

  return (
    <div className="p-6 rounded border border-border bg-surface/30 space-y-4">
      <h3 className="font-playfair text-xl font-bold">Recommendations</h3>
      <div className="grid gap-4">
        {recommendations.map((rec, idx) => (
          <div key={idx} className={`p-4 rounded border ${getPriorityColor(rec.priority)}`}>
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-semibold text-foreground">{rec.action}</p>
                <p className="text-sm text-foreground/70 mt-1">{rec.reason || rec.issue || "Review needed"}</p>
              </div>
              <span className="text-xs font-semibold px-2 py-1 rounded bg-surface/50">{rec.priority}</span>
            </div>
            {rec.category && <p className="text-xs text-foreground/60">Category: {rec.category}</p>}
          </div>
        ))}
      </div>
    </div>
  )
}
