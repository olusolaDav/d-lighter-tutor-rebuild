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
    <section className="py-12 md:py-16 bg-muted/30">
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
              A Different Learning Experience{" "}
              <span className="text-secondary">Begins Here</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-6">
              At D-Lighter Tutor, we believe children don't fail because they are slow - 
              <strong>they struggle because they don't get enough personal attention.</strong>
            </p>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-6">
              That's why we provide <strong>one-on-one online tutoring</strong> for children aged <strong>3-16</strong>, 
              supporting Nigerian families and African families in the diaspora, wherever they live in the world.
            </p>
            <div className="text-lg text-muted-foreground max-w-3xl mx-auto mb-6">
              <p className="mb-4">When a child finally has someone who:</p>
              <div className="space-y-2 mb-4">
                <p>• explains patiently</p>
                <p>• teaches at their pace</p>
                <p>• listens, encourages, and corrects gently</p>
              </div>
              <p className="font-semibold">Something amazing happens.</p>
            </div>
            <div className="text-lg text-muted-foreground max-w-3xl mx-auto mb-8 space-y-2">
              <p>They begin to understand.</p>
              <p>They begin to believe in themselves.</p>
              <p>And learning stops being a struggle.</p>
            </div>
          </div>

          {/* <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
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
          </div> */}

          <CTAButtons onBookTrial={onBookTrial} className="mt-12" />
        </div>
      </div>
    </section>
  )
}
