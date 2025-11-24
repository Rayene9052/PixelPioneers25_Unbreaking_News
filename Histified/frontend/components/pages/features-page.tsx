export default function FeaturesPage() {
  const features = [
    {
      title: "Forensic Analysis",
      description:
        "Advanced metadata examination, compression analysis, and pixel pattern detection to identify manipulation.",
      icon: "🔍",
    },
    {
      title: "OSINT Research",
      description: "Reverse image search, geolocation verification, and face recognition to trace content origins.",
      icon: "🌍",
    },
    {
      title: "AI Detection",
      description: "Semantic analysis and deepfake indicators using machine learning to detect synthetic content.",
      icon: "🤖",
    },
    {
      title: "Blockchain Verification",
      description: "Immutable proof of analysis using Hedera distributed ledger for transparency.",
      icon: "⛓️",
    },
    {
      title: "Source Credibility",
      description: "Cross-reference with verified news sources and fact-checking databases.",
      icon: "✓",
    },
    {
      title: "Real-Time Reporting",
      description: "Instant comprehensive reports with severity levels and actionable insights.",
      icon: "📊",
    },
  ]

  return (
    <div className="pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="font-playfair text-4xl md:text-5xl font-bold mb-4">
            Powerful <span className="text-primary">Detection Features</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            VerityCheck combines multiple analysis techniques to provide comprehensive multimedia authenticity
            verification
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div key={index} className="bg-card border border-border rounded-lg p-6 hover:border-primary transition">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="font-playfair text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* How It Works */}
        <div className="mt-20">
          <h2 className="font-playfair text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="flex flex-col md:flex-row gap-8 justify-center">
            {[
              { step: "1", title: "Upload", desc: "Select your media file" },
              { step: "2", title: "Analyze", desc: "Multi-stage verification" },
              { step: "3", title: "Review", desc: "Comprehensive report" },
              { step: "4", title: "Verify", desc: "Blockchain proof" },
            ].map((item) => (
              <div key={item.step} className="flex-1 max-w-xs">
                <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold mb-4 mx-auto">
                  {item.step}
                </div>
                <h3 className="font-semibold text-center mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm text-center">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
