import { Button } from "@/components/ui/button"
import { Gift, MessageCircle, CheckCircle, Mail } from "lucide-react"
import { WHATSAPP_URL, WHATSAPP_NUMBER, CONTACT_EMAIL } from "@/lib/constants/form-data"
import { TRUST_INDICATORS } from "@/lib/constants/sales-content"

interface FinalCTASectionProps {
  onBookTrial: () => void
}

export function FinalCTASection({ onBookTrial }: FinalCTASectionProps) {
  return (
    <section className="py-24 bg-gradient-to-br from-primary via-primary to-primary/95 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-10 left-[10%] h-32 w-32 rounded-full bg-secondary/10 blur-2xl" />
        <div className="absolute bottom-10 right-[10%] h-40 w-40 rounded-full bg-accent/10 blur-2xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-primary-foreground mb-6">
            Ready to Give Your Child the{" "}
            <span className="text-secondary">Academic Edge?</span>
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-10">
            Join families across the UK, USA, Canada, and UAE who have transformed their
            children&apos;s education with D-lighter Tutor. Start with a FREE trial class
            today.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={onBookTrial}
              size="lg"
              className="bg-secondary hover:bg-secondary/90 text-secondary-foreground text-lg h-16 px-10 rounded-full font-bold shadow-lg shadow-secondary/30"
            >
              <Gift className="mr-2 h-6 w-6" />
              Book Your Free Trial Now
            </Button>
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="cursor-pointer">
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-primary-foreground/30 bg-white/10 text-white hover:bg-white/20 rounded-full font-semibold text-lg h-16 px-10 font-bold w-full sm:w-auto"
              >
                <MessageCircle className="mr-2 h-6 w-6" />
                Chat on WhatsApp
              </Button>
            </a>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mt-8 text-primary-foreground/80 text-sm">
            {TRUST_INDICATORS.map((indicator, i) => (
              <div key={i} className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-secondary" aria-hidden="true" />
                <span>{indicator}</span>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-6 text-primary-foreground/80">
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-primary-foreground transition-colors"
            >
              <MessageCircle className="h-5 w-5" aria-hidden="true" />
              WhatsApp: +234 {WHATSAPP_NUMBER.slice(3, 6)} {WHATSAPP_NUMBER.slice(6, 9)}{" "}
              {WHATSAPP_NUMBER.slice(9)}
            </a>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="flex items-center gap-2 hover:text-primary-foreground transition-colors"
            >
              <Mail className="h-5 w-5" aria-hidden="true" />
              {CONTACT_EMAIL}
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
