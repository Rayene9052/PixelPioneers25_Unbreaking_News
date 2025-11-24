export default function AboutPage() {
  return (
    <div className="pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-playfair text-4xl md:text-5xl font-bold mb-4">
            About <span className="text-primary">VerityCheck</span>
          </h1>
          <p className="text-muted-foreground text-lg">Combating misinformation through advanced technology</p>
        </div>

        {/* Mission */}
        <div className="bg-card border border-border rounded-lg p-8 mb-8">
          <h2 className="font-playfair text-2xl font-bold mb-4 text-primary">Our Mission</h2>
          <p className="text-foreground mb-4">
            VerityCheck is dedicated to protecting truth in the digital age. As multimedia deepfakes and manipulated
            content become increasingly sophisticated, we provide forensic-grade analysis tools to help individuals,
            journalists, and organizations verify the authenticity of digital media.
          </p>
          <p className="text-foreground">
            Our mission is to make advanced forensic analysis accessible to everyone, empowering people to detect and
            combat misinformation before it spreads.
          </p>
        </div>

        {/* What We Do */}
        <div className="bg-card border border-border rounded-lg p-8 mb-8">
          <h2 className="font-playfair text-2xl font-bold mb-4 text-primary">What We Do</h2>
          <ul className="space-y-4">
            <li className="flex gap-4">
              <span className="text-primary font-bold flex-shrink-0">→</span>
              <div>
                <h3 className="font-semibold mb-1">Deep Forensic Analysis</h3>
                <p className="text-muted-foreground text-sm">
                  Examine metadata, compression artifacts, and pixel patterns to detect manipulation
                </p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="text-primary font-bold flex-shrink-0">→</span>
              <div>
                <h3 className="font-semibold mb-1">OSINT Research</h3>
                <p className="text-muted-foreground text-sm">
                  Cross-reference images with reverse search, geolocation, and facial recognition
                </p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="text-primary font-bold flex-shrink-0">→</span>
              <div>
                <h3 className="font-semibold mb-1">AI-Powered Detection</h3>
                <p className="text-muted-foreground text-sm">
                  Identify deepfakes and synthetic content using advanced machine learning
                </p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="text-primary font-bold flex-shrink-0">→</span>
              <div>
                <h3 className="font-semibold mb-1">Blockchain Verification</h3>
                <p className="text-muted-foreground text-sm">
                  Create immutable proof of analysis on distributed ledger for transparency
                </p>
              </div>
            </li>
          </ul>
        </div>

        {/* Why It Matters */}
        <div className="bg-card border border-border rounded-lg p-8">
          <h2 className="font-playfair text-2xl font-bold mb-4 text-primary">Why It Matters</h2>
          <p className="text-foreground mb-4">
            The digital landscape is facing an unprecedented challenge. AI-generated deepfakes have become nearly
            indistinguishable from authentic content, and manipulated images spread faster than ever before. In 2024
            alone, misinformation influenced elections, triggered mass panic, and damaged reputations worldwide.
          </p>
          <p className="text-foreground">
            VerityCheck provides the definitive answer to the question: "Is this real?" Our comprehensive analysis
            framework combines forensic science, open-source intelligence, and machine learning to provide an
            authoritative assessment of multimedia authenticity.
          </p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          {[
            { number: "10K+", label: "Files Analyzed" },
            { number: "98%", label: "Accuracy Rate" },
            { number: "45+", label: "Fact Sources" },
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">{stat.number}</div>
              <p className="text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
