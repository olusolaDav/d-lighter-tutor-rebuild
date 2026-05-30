"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, Crown, Gift, Sparkles, Star, Zap, Info } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { useBookingForm } from "@/components/booking-form-modal"
import { HOMEPAGE_PRICING } from "@/lib/constants/pricing-info"

export function PricingSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [currency, setCurrency] = useState<"NGN" | "GBP" | "USD">("NGN")
  const { openModal } = useBookingForm()

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  const fxRates = {
    GBP_TO_USD: 1.25,
    NGN_TO_USD: 1 / 1600,
  }

  const extractAmount = (value: string): number => Number(value.replace(/[^\d.]/g, ""))

  const formatMonthly = (ngnText: string, gbpText: string) => {
    const ngn = extractAmount(ngnText)
    const gbp = extractAmount(gbpText)
    const usd = Math.round(gbp * fxRates.GBP_TO_USD)

    if (currency === "NGN") return `N${ngn.toLocaleString()}/month`
    if (currency === "GBP") return `GBP${gbp}/month`
    return `$${usd}/month`
  }

  const formatOneOff = (ngn: number, gbp: number) => {
    const usd = Math.round(gbp * fxRates.GBP_TO_USD)
    if (currency === "NGN") return `N${ngn.toLocaleString()}/month`
    if (currency === "GBP") return `GBP${gbp}/month`
    return `$${usd}/month`
  }

  const elevenPlusGroupFee = formatOneOff(100000, 65)
  const combinedFee = formatOneOff(180000, 113)
  const satGroupFee = formatOneOff(100000, 65)

  const cards = [
    {
      name: HOMEPAGE_PRICING.receptionToYear3.title,
      tagline: "One-on-One Classes",
      bestFor: "Best for early foundation building",
      modes: ["1-on-1"],
      icon: Star,
      popular: false,
      sectionTitle: "Package Options",
      highlights: HOMEPAGE_PRICING.receptionToYear3.options.map((option) =>
        `${option.hours} - ${formatMonthly(option.ngn, option.gbp)}`
      ),
      details: [HOMEPAGE_PRICING.receptionToYear3.subtitle],
      bonuses: [HOMEPAGE_PRICING.receptionToYear3.bonus],
      supportHighlights: [
        "One-on-one personalized lessons",
        "Flexible scheduling",
        "Monthly progress report",
        "Monthly mock tests included",
        "100% Satisfaction Guaranteed",
      ],
      ctaPlan: "Reception to Year 3",
    },
    {
      name: "11+, SAT and GCSE Preparation",
      tagline: "Exam-focused pathways",
      bestFor: "Best for entrance and exam readiness",
      modes: ["Group", "1-on-1", "Combined"],
      icon: Crown,
      popular: true,
      sectionTitle: "Preparation Packages",
      highlights: [
        `11+ Group Class (Max 6 learners) - ${elevenPlusGroupFee}`,
        `11+ Combined Package (1-on-1 + Group) - ${combinedFee}`,
        `SAT Group Class (Max 6 learners) - ${satGroupFee}`,
        "GCSE One-on-One support (pricing follows Year 4 - Year 11 plans)",
      ],
      details: [
        "11+ Group Subjects: Maths, English, Verbal & Non-Verbal Reasoning",
        "11+ Schedule: Monday & Thursday, 5:00 PM - 8:00 PM",
        "Includes continuous assessments + monthly mock examination",
        "SAT Subjects: Maths (Arithmetic + Reasoning), English (Reading + SPaG), Science",
        "GCSE Subjects: Core Maths, English, Science and related support subjects",
      ],
      bonuses: [],
      supportHighlights: [],
      ctaPlan: "11+ / SAT / GCSE Preparation",
    },
    {
      name: HOMEPAGE_PRICING.year4To11.title,
      tagline: "Flexible Subject Options",
      bestFor: "Best for continuous long-term support",
      modes: ["1-on-1"],
      icon: Zap,
      popular: false,
      sectionTitle: "Package Options",
      highlights: HOMEPAGE_PRICING.year4To11.options.map((option) =>
        `${option.hours} - ${formatMonthly(option.ngn, option.gbp)}`
      ),
      details: [HOMEPAGE_PRICING.year4To11.subtitle],
      bonuses: [...HOMEPAGE_PRICING.year4To11.bonuses],
      supportHighlights: [
        "One-on-one personalized lessons",
        "Flexible scheduling",
        "Monthly progress report",
        "Monthly mock tests included",
        "100% Satisfaction Guaranteed",
      ],
      ctaPlan: "Year 4 to Year 11",
    },
  ]

  return (
    <section ref={sectionRef} id="pricing" className="py-20 bg-white relative overflow-hidden">

      <div className="container mx-auto px-4 relative z-10">
        <div className={`text-center mb-12 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
          <p className="text-secondary font-semibold text-sm uppercase tracking-wider mb-4">Packages Available</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Plans That <span className="text-secondary">Fit Your Family</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Choose a plan built around your child's goals, schedule, and pace, with expert guidance and measurable progress every month.
          </p>

          <div className="mt-6 inline-flex items-center gap-2 bg-muted rounded-full p-1">
            {[
              { code: "NGN" as const, label: "Naira (N)" },
              { code: "GBP" as const, label: "Pounds (GBP)" },
              { code: "USD" as const, label: "Dollar ($)" },
            ].map((curr) => (
              <button
                key={curr.code}
                onClick={() => setCurrency(curr.code)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer ${
                  currency === curr.code
                    ? "bg-secondary text-secondary-foreground shadow"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {curr.label}
              </button>
            ))}
          </div>
          {currency === "USD" && (
            <p className="text-xs text-muted-foreground mt-2">USD values are approximate equivalents.</p>
          )}
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          {cards.map((card, index) => (
            <div
              key={card.name}
              className={`transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              <Card
                className={`relative h-full border overflow-hidden transition-all duration-300 rounded-2xl ${
                  card.popular
                    ? "border-secondary shadow-lg scale-105 lg:scale-110"
                    : "border-border shadow-sm hover:shadow-md hover:border-secondary/50"
                }`}
              >
                {card.popular && (
                  <div className="absolute -top-0 -right-0">
                    <div className="bg-secondary text-secondary-foreground px-6 py-1 text-sm font-bold rounded-bl-xl">
                      POPULAR
                    </div>
                  </div>
                )}

                {card.popular && <div className="h-1 bg-secondary" />}

                <CardHeader className="text-center pb-4 pt-8">
                  <div className="mx-auto mb-4">
                    <div className={`h-14 w-14 rounded-2xl ${card.popular ? "bg-secondary" : "bg-blue-50"} flex items-center justify-center`}>
                      <card.icon className={`h-7 w-7 ${card.popular ? "text-white" : "text-secondary"}`} />
                    </div>
                  </div>

                  <CardTitle className="text-2xl font-bold text-foreground mb-1">{card.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{card.tagline}</p>
                  <p className="text-xs font-medium text-secondary mt-1">{card.bestFor}</p>

                  <div className="mt-3 flex flex-wrap justify-center gap-1.5">
                    {card.modes.map((mode) => (
                      <span key={mode} className="text-[11px] px-2.5 py-1 rounded-full bg-muted text-muted-foreground border border-border">
                        {mode}
                      </span>
                    ))}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 pb-8 px-6">
                  <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-secondary bg-secondary/10 rounded-full px-2.5 py-1">
                    <Info className="h-3 w-3" />
                    {card.sectionTitle}
                  </div>

                  <ul className="space-y-3">
                    {card.highlights.map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <div className="shrink-0 h-5 w-5 rounded-full bg-secondary/10 flex items-center justify-center mt-0.5">
                          <Check className="h-3 w-3 text-secondary" />
                        </div>
                        <span className="text-sm font-medium text-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="pt-2 border-t border-border/60 space-y-2">
                    {card.details.map((detail) => (
                      <p key={detail} className="text-xs text-muted-foreground leading-relaxed">
                        {detail}
                      </p>
                    ))}
                  </div>

                  {card.supportHighlights.length > 0 ? (
                    <div className="pt-2 border-t border-border/60 space-y-2">
                      {card.supportHighlights.map((item) => (
                        <p key={item} className="text-xs text-muted-foreground leading-relaxed">
                          {item}
                        </p>
                      ))}
                    </div>
                  ) : (
                    <div className="pt-2 border-t border-border/60">
                      <p className="text-xs text-muted-foreground leading-relaxed">All plans include progress tracking and guided academic support.</p>
                    </div>
                  )}

                  {card.bonuses.length > 0 && (
                    <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 space-y-2">
                      <p className="text-xs font-bold text-amber-900 uppercase tracking-wide">Bonuses</p>
                      {card.bonuses.map((bonus) => (
                        <p key={bonus} className="text-xs text-amber-800 leading-relaxed flex items-start gap-1.5">
                          <Sparkles className="h-3.5 w-3.5 mt-0.5" />
                          <span>{bonus}</span>
                        </p>
                      ))}
                    </div>
                  )}

                  <Button
                    onClick={() => openModal(card.ctaPlan)}
                    size="lg"
                    className={`w-full rounded-full transition-all ${
                      card.popular
                        ? "bg-secondary hover:bg-secondary/90 text-white shadow-md"
                        : "bg-primary hover:bg-primary/90 text-primary-foreground"
                    }`}
                  >
                    Get Started
                  </Button>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        <div className={`mt-16 text-center space-y-6 transition-all duration-700 delay-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
          <div className="grid gap-6 lg:grid-cols-1 text-left max-w-4xl mx-auto">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-lg">Exams + Age Group</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-semibold mb-1">We prepare learners for:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {HOMEPAGE_PRICING.examsPrepared.map((exam) => (
                      <p key={exam} className="text-sm text-muted-foreground bg-muted/40 rounded-lg px-3 py-1.5">{exam}</p>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold mb-1">Age Group / Class Level</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {HOMEPAGE_PRICING.ageGroup.map((item) => (
                      <p key={item} className="text-sm text-muted-foreground bg-muted/40 rounded-lg px-3 py-1.5">{item}</p>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="inline-flex flex-col sm:flex-row items-center gap-4 bg-blue-50 border border-secondary/20 rounded-2xl px-8 py-4">
            <div className="h-12 w-12 rounded-xl bg-secondary/10 flex items-center justify-center">
              <Gift className="h-6 w-6 text-secondary" />
            </div>
            <div className="text-center sm:text-left">
              <p className="font-bold text-foreground text-lg">Free 20-Minute Trial Assessment</p>
              <p className="text-muted-foreground">Start with a guided trial and get a personalized study recommendation.</p>
            </div>
            <Button onClick={() => openModal("Free Trial")} className="rounded-full bg-secondary hover:bg-secondary/90 text-white">
              Book Free Trial
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
