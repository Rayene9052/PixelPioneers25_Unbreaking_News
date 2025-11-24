interface ScoreCardProps {
  label: string
  score: number
  icon: string
}

export default function ScoreCard({ label, score, icon }: ScoreCardProps) {
  const color = score >= 75 ? "text-success" : score >= 50 ? "text-warning" : "text-error"

  return (
    <div className="p-4 rounded border border-border bg-surface/50 text-center">
      <div className="text-3xl mb-2">{icon}</div>
      <p className="text-sm text-foreground/60 mb-2">{label}</p>
      <p className={`text-3xl font-bold font-playfair ${color}`}>{score.toFixed(0)}</p>
      <div className="w-full h-1 bg-surface rounded mt-3 overflow-hidden">
        <div className={`h-full transition-all ${color.replace("text-", "bg-")}`} style={{ width: `${score}%` }} />
      </div>
    </div>
  )
}
