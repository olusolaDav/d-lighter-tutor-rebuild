import Link from "next/link"
import Image from "next/image"
import { Facebook, Instagram, Mail, Phone, MessageCircle, Heart, MapPin, Clock, Linkedin, Youtube } from "lucide-react"
import { websiteContent } from "@/content/website-content"

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-.88-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
    </svg>
  )
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

function MediumIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z" />
    </svg>
  )
}

export function Footer() {
  const getSocialIcon = (iconName: string) => {
    switch (iconName) {
      case "facebook":
        return <Facebook className="h-5 w-5" />
      case "instagram":
        return <Instagram className="h-5 w-5" />
      case "linkedin":
        return <Linkedin className="h-5 w-5" />
      case "youtube":
        return <Youtube className="h-5 w-5" />
      case "tiktok":
        return <TikTokIcon className="h-5 w-5" />
      case "medium":
        return <MediumIcon className="h-5 w-5" />
      default:
        return null
    }
  }

  const countries = ["🇬🇧 UK", "🇺🇸 USA", "🇨🇦 Canada", "🇦🇪 UAE", "🇸🇦 KSA"]

  return (
    <footer className="bg-gradient-to-br from-primary via-primary to-primary/95 text-primary-foreground relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-10 right-10 h-16 w-16 rounded-full bg-secondary/10 opacity-30 animate-float" />
      <div className="absolute bottom-20 left-10 h-20 w-20 rounded-full bg-accent/10 opacity-30 animate-float" style={{ animationDelay: "2s" }} />

      {/* Main footer content */}
      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand section */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="relative">
                <Image src="/images/brand-logo.svg" alt="D-lighter Tutor Logo" width={48} height={48} className="rounded-2xl" />
              </div>
              <div>
                <h3 className="text-xl font-bold">D-lighter Tutor</h3>
                <p className="text-xs text-primary-foreground/60">Where Learning Shines</p>
              </div>
            </div>
            <p className="text-sm text-primary-foreground/80 leading-relaxed mb-6">
              Empowering Nigerian & African children in diaspora with quality online education that bridges continents and keeps cultural roots strong.
            </p>
            
            {/* Social links */}
            <div className="flex gap-3">
              {websiteContent.socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-10 w-10 rounded-full bg-primary-foreground/10 hover:bg-secondary hover:text-secondary-foreground flex items-center justify-center transition-all hover:scale-110"
                  aria-label={social.name}
                >
                  {getSocialIcon(social.icon)}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold mb-6 flex items-center gap-2">
              <span className="h-6 w-6 rounded bg-secondary/20 flex items-center justify-center text-xs">→</span>
              Quick Links
            </h4>
            <ul className="space-y-3 text-sm text-primary-foreground/80">
              {[
                { href: "#subjects", label: "Our Subjects" },
                { href: "#how-it-works", label: "How It Works" },
                { href: "#pricing", label: "Pricing Plans" },
                { href: "#testimonials", label: "Success Stories" },
                { href: "#faq", label: "FAQ" },
              ].map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href} 
                    className="flex items-center gap-2 hover:text-secondary transition-colors group cursor-pointer"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-secondary/50 group-hover:bg-secondary transition-colors" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Subjects */}
          <div>
            <h4 className="text-sm font-bold mb-6 flex items-center gap-2">
              <span className="h-6 w-6 rounded bg-secondary/20 flex items-center justify-center text-xs">➕</span>
              What We Teach
            </h4>
            <ul className="space-y-3 text-sm text-primary-foreground/80">
              {[
                "Mathematics & English",
                "Sciences",
                "African Languages",
                "Tech & Digital Skills",
                "Music Lessons",
                "Exam Prep",
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-secondary/50" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-bold mb-6 flex items-center gap-2">
              <span className="h-6 w-6 rounded bg-secondary/20 flex items-center justify-center">
                <Phone className="h-3 w-3" />
              </span>
              Get In Touch
            </h4>
            <ul className="space-y-4 text-sm text-primary-foreground/80">
              <li>
                <a 
                  href={`tel:${websiteContent.contact.phone}`} 
                  className="flex items-start gap-3 hover:text-secondary transition-colors group"
                >
                  <div className="h-8 w-8 rounded-lg bg-primary-foreground/10 group-hover:bg-secondary/20 flex items-center justify-center shrink-0">
                    <Phone className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium text-primary-foreground">Phone</p>
                    <p>{websiteContent.contact.phone}</p>
                  </div>
                </a>
              </li>
              <li>
                <a
                  href={websiteContent.contact.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 hover:text-secondary transition-colors group"
                >
                  <div className="h-8 w-8 rounded-lg bg-green-500/20 group-hover:bg-green-500/30 flex items-center justify-center shrink-0">
                    <MessageCircle className="h-4 w-4 text-green-400" />
                  </div>
                  <div>
                    <p className="font-medium text-primary-foreground">WhatsApp</p>
                    <p>Chat with us 24/7</p>
                  </div>
                </a>
              </li>
              <li>
                <a 
                  href={`mailto:${websiteContent.contact.email}`} 
                  className="flex items-start gap-3 hover:text-secondary transition-colors group"
                >
                  <div className="h-8 w-8 rounded-lg bg-primary-foreground/10 group-hover:bg-secondary/20 flex items-center justify-center shrink-0">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium text-primary-foreground">Email</p>
                    <p className="text-xs">{websiteContent.contact.email}</p>
                  </div>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Countries served */}
        <div className="mt-12 pt-8 border-t border-primary-foreground/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2 text-sm text-primary-foreground/70">
              <MapPin className="h-4 w-4" />
              <span>Serving families in:</span>
              <div className="flex gap-2">
                {countries.map((country, i) => (
                  <span key={i} className="bg-primary-foreground/10 px-2 py-1 rounded text-xs">
                    {country}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-primary-foreground/70">
              <Clock className="h-4 w-4" />
              <span>Available across all time zones</span>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-8 border-t border-primary-foreground/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-primary-foreground/60 flex items-center gap-1">
            © {new Date().getFullYear()} D-lighter Tutor. Made with{" "}
            <Heart className="h-4 w-4 text-red-400 fill-red-400 animate-pulse" />{" "}
            for diaspora families
          </p>
          <div className="flex items-center gap-4 text-sm text-primary-foreground/60">
            <Link href="/privacy-policy" className="hover:text-secondary transition-colors cursor-pointer">Privacy Policy</Link>
            <span>•</span>
            <Link href="/terms-of-service" className="hover:text-secondary transition-colors cursor-pointer">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
