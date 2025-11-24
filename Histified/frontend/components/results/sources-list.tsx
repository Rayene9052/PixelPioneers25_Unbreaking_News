import { ExternalLink } from "lucide-react"

interface SourcesListProps {
  sources: Array<{
    title?: string
    url?: string
    credibility?: number
    relevance?: string
  }>
}

export default function SourcesList({ sources }: SourcesListProps) {
  if (!sources || sources.length === 0) {
    return (
      <div className="p-6 rounded border border-border bg-surface/30 text-center">
        <p className="text-foreground/60">No sources found</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {sources.map((source, idx) => (
        <div key={idx} className="p-4 rounded border border-border bg-surface/30 hover:bg-surface/50 transition-colors">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-semibold text-accent mb-1">{source.title || "Untitled Source"}</h4>
              {source.url && (
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-foreground/60 hover:text-foreground flex items-center gap-1 w-fit"
                >
                  {source.url}
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
              {source.relevance && <p className="text-sm text-foreground/70 mt-2">{source.relevance}</p>}
            </div>
            {source.credibility !== undefined && (
              <div className="ml-4 text-right flex-shrink-0">
                <p className="text-sm text-foreground/60">Credibility</p>
                <p className="text-lg font-bold text-accent">{source.credibility.toFixed(0)}%</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
