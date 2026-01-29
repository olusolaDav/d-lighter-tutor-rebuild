import { BadgeCheck, CheckCircle } from "lucide-react"
import { TRUST_INDICATORS } from "@/lib/constants/sales-content"
import { CTAButtons } from "./cta-buttons"

interface GuaranteeSectionProps {
  onBookTrial: () => void
}

export function GuaranteeSection({ onBookTrial }: GuaranteeSectionProps) {
  return (
    <section className="py-12 md:py-16 bg-secondary/10">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-secondary/20 mb-6">
            <BadgeCheck className="h-10 w-10 text-secondary" aria-hidden="true" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Our <span className="text-secondary">100% Satisfaction</span> Guarantee
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            If you&apos;re not completely satisfied after your child&apos;s first paid month,
            we&apos;ll give you a full refund. No questions asked. That&apos;s how confident we
            are in our tutors.
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-sm mb-8">
            {TRUST_INDICATORS.map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-foreground">
                <CheckCircle className="h-5 w-5 text-secondary" aria-hidden="true" />
                {item}
              </div>
            ))}
          </div>

          <CTAButtons onBookTrial={onBookTrial} showTrustIndicators={false} />
        </div>
      </div>
    </section>
  )
}
