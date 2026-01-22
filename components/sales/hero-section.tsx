import {
  GraduationCap,
  BookOpen,
  Star,
  Globe,
  Gift,
  ChevronDown,
  CheckCircle,
} from "lucide-react"
import { HERO_STATS } from "@/lib/constants/sales-content"
import { CTAButtons } from "./cta-buttons"

const iconMap = {
  Star,
  GraduationCap,
  Globe,
} as const

interface HeroSectionProps {
  onBookTrial: () => void
}

export function HeroSection({ onBookTrial }: HeroSectionProps) {
  return (
    <section className="relative min-h-[90vh] flex items-center bg-gradient-to-br from-primary via-primary to-primary/90 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-[10%] h-24 w-24 rounded-full bg-secondary/20 blur-xl animate-pulse" />
        <div
          className="absolute top-40 right-[15%] h-32 w-32 rounded-full bg-accent/20 blur-xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute bottom-32 left-[20%] h-20 w-20 rounded-full bg-secondary/15 blur-lg animate-pulse"
          style={{ animationDelay: "0.5s" }}
        />
        <div
          className="absolute bottom-20 right-[25%] h-16 w-16 rounded-full bg-accent/15 blur-lg animate-pulse"
          style={{ animationDelay: "1.5s" }}
        />
        {/* Floating icons */}
        <div
          className="absolute top-32 right-[30%] animate-bounce"
          style={{ animationDelay: "0.3s", animationDuration: "3s" }}
        >
          <GraduationCap className="h-8 w-8 text-secondary/30" />
        </div>
        <div
          className="absolute bottom-40 left-[30%] animate-bounce"
          style={{ animationDelay: "0.7s", animationDuration: "4s" }}
        >
          <BookOpen className="h-6 w-6 text-accent/30" />
        </div>
      </div>

      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            {/* Limited Offer Badge */}
            <div className="inline-flex items-center gap-2 bg-secondary/20 backdrop-blur-sm border border-secondary/30 px-5 py-2.5 rounded-full mb-6 animate-pulse">
              <Gift className="h-4 w-4 text-secondary" />
              <span className="text-sm font-bold text-secondary">
                LIMITED TIME: First Trial Class is FREE!
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-primary-foreground mb-6 leading-tight">
              Expert Tutoring for{" "}
              <span className="relative inline-block">
                <span className="text-secondary">African Children</span>
                <svg
                  className="absolute -bottom-2 left-0 w-full"
                  viewBox="0 0 300 12"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M2 10C50 4 100 2 150 6C200 10 250 4 298 8"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    className="text-secondary/50"
                  />
                </svg>
              </span>
              <br className="hidden sm:block" />
              <span className="text-primary-foreground/90">in the Diaspora</span>
            </h1>

            <p className="text-xl md:text-2xl text-primary-foreground/90 mb-4 max-w-3xl mx-auto leading-relaxed">
              We support <strong>Nigerian and African parents</strong> in the UK, US, Canada, and
              beyond with <strong>personalized 1-on-1 online tutoring</strong> for learners aged{" "}
              <strong>3 to 16 years</strong>.
            </p>

            <p className="text-lg text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
              Designed to fit your schedule • Tailored to your child&apos;s curriculum • Trained
              professionals in early childhood education
            </p>

            {/* CTA Buttons */}
            <CTAButtons onBookTrial={onBookTrial} variant="hero" className="mb-12" />


            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
              {HERO_STATS.map((stat, i) => {
                const Icon = iconMap[stat.icon as keyof typeof iconMap]
                return (
                  <div
                    key={i}
                    className="text-center p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all"
                  >
                    <Icon className="h-5 w-5 text-secondary mx-auto mb-2" />
                    <p className="text-2xl md:text-3xl font-bold text-primary-foreground">
                      {stat.number}
                    </p>
                    <p className="text-xs text-primary-foreground/70">{stat.label}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <ChevronDown className="h-8 w-8 text-primary-foreground/50" />
      </div>

      {/* Wave Divider */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          className="fill-background w-full h-16"
          aria-hidden="true"
        >
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C57.1,118.92,156.63,69.08,321.39,56.44Z" />
        </svg>
      </div>
    </section>
  )
}
