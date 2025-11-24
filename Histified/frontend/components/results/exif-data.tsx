interface ExifDataProps {
  data: Record<string, any>
}

export default function ExifData({ data }: ExifDataProps) {
  const entries = Object.entries(data).filter(([_, value]) => value !== null && value !== undefined)

  if (entries.length === 0) {
    return (
      <div className="p-6 rounded border border-border bg-surface/30 text-center">
        <p className="text-foreground/60">No EXIF metadata found</p>
      </div>
    )
  }

  return (
    <div className="p-6 rounded border border-border bg-surface/30">
      <h3 className="font-playfair text-lg font-bold mb-6">EXIF Metadata</h3>
      <div className="grid md:grid-cols-2 gap-4">
        {entries.map(([key, value]) => (
          <div key={key} className="p-3 bg-surface/50 rounded border border-border/50">
            <p className="text-xs text-foreground/60 uppercase tracking-wider mb-1">{key.replace(/_/g, " ")}</p>
            <p className="text-sm text-foreground break-words">
              {typeof value === "object" ? JSON.stringify(value) : String(value)}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
