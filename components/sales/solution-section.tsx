import {
  Sparkles,
  GraduationCap,
  Target,
  Globe,
  Clock,
  FileText,
  Shield,
} from "lucide-react"
import { SOLUTION_FEATURES } from "@/lib/constants/sales-content"
import { CTAButtons } from "./cta-buttons"

const iconMap = {
  GraduationCap,
  Target,
  Globe,
  Clock,
  FileText,
  Shield,
} as const

interface SolutionSectionProps {
  onBookTrial: () => void
}

export function SolutionSection({ onBookTrial }: SolutionSectionProps) {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-secondary/10 px-4 py-2 rounded-full mb-4">
              <Sparkles className="h-4 w-4 text-secondary" aria-hidden="true" />
              <span className="text-sm font-semibold text-secondary">
                The D-lighter Difference
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Expert Tutoring Designed for{" "}
              <span className="text-secondary">African Children</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We combine academic excellence with cultural understanding to help your child
              thrive
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {SOLUTION_FEATURES.map((feature, i) => {
              const Icon = iconMap[feature.icon as keyof typeof iconMap]
              return (
                <article
                  key={i}
                  className="bg-card border rounded-2xl p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                >
                  <div
                    className={`h-14 w-14 rounded-2xl ${feature.color} flex items-center justify-center mb-5`}
                  >
                    <Icon className="h-7 w-7 text-white" aria-hidden="true" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </article>
              )
            })}
          </div>

          <CTAButtons onBookTrial={onBookTrial} className="mt-12" />
        </div>
      </div>
    </section>
  )
}
