import Link from "next/link"
import { CONTACT_EMAIL } from "@/lib/constants/form-data"

export function SalesFooter() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-background py-8 border-t">
      <div className="container mx-auto px-4 text-center">
        <p className="text-sm text-muted-foreground mb-4">
          © {currentYear} D-lighter Tutor. All rights reserved.
        </p>
        <nav className="flex justify-center gap-6 text-sm" aria-label="Footer navigation">
          <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
            Home
          </Link>
          <Link
            href="/privacy-policy"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Privacy Policy
          </Link>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Contact
          </a>
        </nav>
      </div>
    </footer>
  )
}
