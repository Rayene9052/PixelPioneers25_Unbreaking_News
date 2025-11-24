export default function Footer() {
  return (
    <footer className="bg-card border-t border-border mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <h3 className="font-playfair text-lg font-bold text-primary mb-4">VerityCheck</h3>
            <p className="text-sm text-muted-foreground">
              Advanced multimedia authenticity verification and fact-checking platform powered by forensic analysis.
            </p>
          </div>

          {/* Features */}
          <div>
            <h4 className="font-semibold mb-4 text-primary">Features</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#" className="hover:text-primary transition">
                  Forensic Analysis
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition">
                  OSINT Research
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition">
                  Deepfake Detection
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition">
                  Blockchain Proof
                </a>
              </li>
            </ul>
          </div>

          {/* About */}
          <div>
            <h4 className="font-semibold mb-4 text-primary">Resources</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#" className="hover:text-primary transition">
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition">
                  Support
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4 text-primary">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#" className="hover:text-primary transition">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition">
                  Contact
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition">
                  Sitemap
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-border pt-8">
          <p className="text-center text-sm text-muted-foreground">
            © 2025 VerityCheck. All rights reserved. Built by PixelPioneers25
          </p>
        </div>
      </div>
    </footer>
  )
}
