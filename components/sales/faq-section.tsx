import { FAQ_ITEMS } from "@/lib/constants/sales-content"
import { CTAButtons } from "./cta-buttons"

interface FAQSectionProps {
  onBookTrial: () => void
}

export function FAQSection({ onBookTrial }: FAQSectionProps) {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Frequently Asked <span className="text-secondary">Questions</span>
            </h2>
          </div>

          <div className="space-y-4">
            {FAQ_ITEMS.map((faq, i) => (
              <article key={i} className="bg-card border rounded-xl p-6">
                <h3 className="font-semibold text-foreground mb-2">{faq.q}</h3>
                <p className="text-muted-foreground">{faq.a}</p>
              </article>
            ))}
          </div>

          <CTAButtons onBookTrial={onBookTrial} className="mt-10" />
        </div>
      </div>
    </section>
  )
}
