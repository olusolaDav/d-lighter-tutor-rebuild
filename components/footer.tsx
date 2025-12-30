import Link from "next/link"
import { Facebook, Instagram, Mail, Phone, MessageCircle } from "lucide-react"
import { websiteContent } from "@/content/website-content"

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
      case "twitter":
        return <XIcon className="h-5 w-5" />
      case "medium":
        return <MediumIcon className="h-5 w-5" />
      default:
        return null
    }
  }

  return (
    <footer className="bg-primary text-primary-foreground py-12">
      <div className="container mx-auto px-4">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="text-lg font-bold mb-4">D-lighter Tutor</h3>
            <p className="text-sm text-primary-foreground/80 leading-relaxed mb-4">
              {
                "Empowering Nigerian children in diaspora with quality online education that bridges continents and cultures."
              }
            </p>
            <div className="flex gap-4">
              {websiteContent.socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-secondary transition-colors"
                  aria-label={social.name}
                >
                  {getSocialIcon(social.icon)}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li>
                <Link href="#subjects" className="hover:text-secondary transition-colors">
                  Subjects
                </Link>
              </li>
              <li>
                <Link href="#how-it-works" className="hover:text-secondary transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="#pricing" className="hover:text-secondary transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="#faq" className="hover:text-secondary transition-colors">
                  FAQ
                </Link>
              </li>
              {/* <li>
                <Link href="#blog" className="hover:text-secondary transition-colors">
                  Blog
                </Link>
              </li> */}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-4">Subjects We Offer</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li>Mathematics & English</li>
              <li>Sciences (Biology, Chemistry, Physics)</li>
              <li>Nigerian Languages (Igbo, Yoruba)</li>
              <li>IT Skills & Coding</li>
              <li>Music Lessons</li>
              <li>Exam Preparation</li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3 text-sm text-primary-foreground/80">
              <li className="flex items-start gap-2">
                <Phone className="h-4 w-4 mt-0.5 shrink-0" />
                <a href={`tel:${websiteContent.contact.phone}`} className="hover:text-secondary transition-colors">
                  {websiteContent.contact.phone}
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MessageCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <a
                  href={websiteContent.contact.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-secondary transition-colors"
                >
                  WhatsApp Us
                </a>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="h-4 w-4 mt-0.5 shrink-0" />
                <a href={`mailto:${websiteContent.contact.email}`} className="hover:text-secondary transition-colors">
                  {websiteContent.contact.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center">
          <p className="text-sm text-primary-foreground/60">
            {
              "© 2025 D-lighter Tutor. All rights reserved. Serving Nigerian families in UK, US, Canada, UAE, and Saudi Arabia."
            }
          </p>
        </div>
      </div>
    </footer>
  )
}
