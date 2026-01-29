import {
  CheckCircle,
  GraduationCap,
  Target,
  Shield,
  FileText,
  Sparkles,
  Clock,
  Globe,
} from "lucide-react"
import { HOW_WE_HELP_FEATURES, LEARNING_AREAS } from "@/lib/constants/sales-content"
import { CTAButtons } from "./cta-buttons"

const iconMap = {
  Target,
  GraduationCap,
  Shield,
  FileText,
  CheckCircle,
  Clock,
  Globe,
} as const

interface HowItWorksSectionProps {
  onBookTrial: () => void
}

export function HowItWorksSection({ onBookTrial }: HowItWorksSectionProps) {
  return (
    <section className="py-12 md:py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Section 3: How We Help */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-secondary/10 px-4 py-2 rounded-full mb-4">
              <Sparkles className="h-4 w-4 text-secondary" aria-hidden="true" />
              <span className="text-sm font-semibold text-secondary">
                Our Approach
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              How We Help Children Turn{" "}
              <span className="text-secondary">Confusion into Confidence</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Every session at D-Lighter Tutor is built around your child, not a classroom full of learners.
            </p>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-12">
              <strong>We help children:</strong>
            </p>
          </div>

          {/* How We Help Features */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {HOW_WE_HELP_FEATURES.map((feature, i) => {
              const Icon = iconMap[feature.icon as keyof typeof iconMap]
              return (
                <article
                  key={i}
                  className="text-center p-6 bg-card border rounded-2xl hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                >
                  <div
                    className={`h-14 w-14 rounded-2xl ${feature.color} flex items-center justify-center mx-auto mb-4`}
                  >
                    <Icon className="h-7 w-7 text-white" aria-hidden="true" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </article>
              )
            })}
          </div>

          <div className="text-center mb-16">
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-12">
              All lessons are delivered online, in a calm, focused learning environment.
            </p>
          </div>

          {/* Section 4: What Your Child Can Learn */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              What Your Child Can{" "}
              <span className="text-secondary">Learn With Us</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We support learners with:
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {LEARNING_AREAS.slice(0, 5).map((area, i) => {
              const Icon = iconMap[area.icon as keyof typeof iconMap] || CheckCircle
              return (
                <article
                  key={i}
                  className="bg-card border rounded-2xl p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                >
                  <div
                    className={`h-14 w-14 rounded-2xl ${area.color} flex items-center justify-center mb-5`}
                  >
                    <Icon className="h-7 w-7 text-white" aria-hidden="true" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">{area.title}</h3>
                  <p className="text-muted-foreground">{area.description}</p>
                </article>
              )
            })}
          </div>

          <div className="text-center mb-12">
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              No matter where your child is starting from, we meet them there - and walk the journey with them.
            </p>
          </div>

          <CTAButtons onBookTrial={onBookTrial} />
        </div>
      </div>
    </section>
  )
}
