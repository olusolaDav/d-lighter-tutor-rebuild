import { X } from "lucide-react"
import { PROBLEMS } from "@/lib/constants/sales-content"
import { CTAButtons } from "./cta-buttons"

interface ProblemSectionProps {
  onBookTrial: () => void
}

export function ProblemSection({ onBookTrial }: ProblemSectionProps) {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Is Your Child <span className="text-destructive">Struggling</span> with...
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
            {PROBLEMS.map((problem, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-4 bg-destructive/5 border border-destructive/20 rounded-xl text-left"
              >
                <X className="h-5 w-5 text-destructive shrink-0" aria-hidden="true" />
                <span className="text-foreground">{problem}</span>
              </div>
            ))}
          </div>
          <p className="text-xl text-muted-foreground mb-8">
            You&apos;re not alone. Many African parents in the diaspora face these exact challenges.
          </p>
          <p className="text-2xl font-semibold text-foreground mb-8">
            But there&apos;s a <span className="text-secondary">better way</span>...
          </p>

          <CTAButtons onBookTrial={onBookTrial} />
        </div>
      </div>
    </section>
  )
}
