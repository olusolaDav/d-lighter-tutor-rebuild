import { Button } from "@/components/ui/button"
import { Gift, MessageCircle, CheckCircle, Mail } from "lucide-react"
import { WHATSAPP_URL, WHATSAPP_NUMBER, CONTACT_EMAIL } from "@/lib/constants/form-data"
import { TRUST_INDICATORS } from "@/lib/constants/sales-content"

interface FinalCTASectionProps {
  onBookTrial: () => void
}

export function FinalCTASection({ onBookTrial }: FinalCTASectionProps) {
  return (
    <section className="py-12 md:py-16 bg-gradient-to-br from-primary via-primary to-primary/95 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-10 left-[10%] h-32 w-32 rounded-full bg-secondary/10 blur-2xl" />
        <div className="absolute bottom-10 right-[10%] h-40 w-40 rounded-full bg-accent/10 blur-2xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-primary-foreground mb-6">
            Try It Free - See the{" "}
            <span className="text-secondary">Difference in 30 Minutes</span>
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-10">
            We invite you to book a <strong>FREE 30-minute trial session</strong> and experience how personalised tutoring can change your child&apos;s learning journey.
          </p>
          <p className="text-lg text-primary-foreground/80 mb-10">
            Click "Get Started" below to enrol and book your <strong>FREE trial today</strong>.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={onBookTrial}
              size="lg"
              className="bg-secondary hover:bg-secondary/90 text-secondary-foreground text-lg h-16 px-10 rounded-full font-bold shadow-lg shadow-secondary/30"
            >
              <Gift className="mr-2 h-6 w-6" />
              Get Started
            </Button>
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-lg text-primary-foreground/90 mb-4">
              Do you prefer to chat first?
            </p>
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="cursor-pointer">
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-primary-foreground/30 bg-white/10 text-white hover:bg-white/20 rounded-full font-semibold text-lg h-16 px-10 font-bold"
              >
                <MessageCircle className="mr-2 h-6 w-6" />
                WhatsApp us
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
