import Image from "next/image"
import { Star } from "lucide-react"
import { REVIEW_IMAGES } from "@/lib/constants/sales-content"
import { CTAButtons } from "./cta-buttons"

interface TestimonialsSectionProps {
  onBookTrial: () => void
}

export function TestimonialsSection({ onBookTrial }: TestimonialsSectionProps) {
  return (
    <section className="py-12 md:py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-yellow-500/10 px-4 py-2 rounded-full mb-4">
              <Star
                className="h-4 w-4 text-yellow-500 fill-yellow-500"
                aria-hidden="true"
              />
              <span className="text-sm font-semibold text-yellow-600 dark:text-yellow-500">
                Loved by Parents
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              What <span className="text-secondary">Parents Are Saying</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Real stories from real families who&apos;ve seen real results
            </p>
          </div>

          {/* Review Images Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {REVIEW_IMAGES.map((src, i) => (
              <figure
                key={i}
                className="relative overflow-hidden rounded-2xl border bg-card shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02]"
              >
                <Image
                  src={src}
                  alt={`Parent testimonial ${i + 1} showing positive feedback about D-lighter Tutor services`}
                  width={400}
                  height={400}
                  className="w-full h-auto object-cover"
                  loading="lazy"
                />
              </figure>
            ))}
          </div>

          <CTAButtons onBookTrial={onBookTrial} className="mt-12" />
        </div>
      </div>
    </section>
  )
}
