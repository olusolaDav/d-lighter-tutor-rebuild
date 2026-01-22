import { CalendarCheck, Users, Play, TrendingUp } from "lucide-react"
import { HOW_IT_WORKS_STEPS } from "@/lib/constants/sales-content"
import { CTAButtons } from "./cta-buttons"

const iconMap = {
  CalendarCheck,
  Users,
  Play,
  TrendingUp,
} as const

interface HowItWorksSectionProps {
  onBookTrial: () => void
}

export function HowItWorksSection({ onBookTrial }: HowItWorksSectionProps) {
  return (
    <section className="py-20 bg-primary/5">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How It <span className="text-secondary">Works</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Getting started is simple — your child could be learning within 24 hours
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {HOW_IT_WORKS_STEPS.map((item, i) => {
              const Icon = iconMap[item.icon as keyof typeof iconMap]
              return (
                <div key={i} className="relative text-center">
                  <div className="h-16 w-16 rounded-full bg-secondary text-secondary-foreground text-2xl font-bold flex items-center justify-center mx-auto mb-4">
                    {item.step}
                  </div>
                  {i < 3 && (
                    <div
                      className="hidden md:block absolute top-8 left-[60%] w-[80%] border-t-2 border-dashed border-secondary/30"
                      aria-hidden="true"
                    />
                  )}
                  <Icon className="h-8 w-8 text-secondary mx-auto mb-3" aria-hidden="true" />
                  <h3 className="text-lg font-bold text-foreground mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              )
            })}
          </div>

          <CTAButtons onBookTrial={onBookTrial} className="mt-12" />
        </div>
      </div>
    </section>
  )
}
