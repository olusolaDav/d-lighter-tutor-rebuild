"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, Sparkles, Star, Gift, Zap, Crown, Clock } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { useBookingForm } from "@/components/booking-form-modal"

export function PricingSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [hoveredPlan, setHoveredPlan] = useState<number | null>(null)
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

  const pricing = {
    NGN: { starter: "₦80,000", premium: "₦120,000", intensive: "₦240,000", hourly: "₦10,000" },
    GBP: { starter: "£48", premium: "£72", intensive: "£144", hourly: "£6" },
    USD: { starter: "$60", premium: "$90", intensive: "$180", hourly: "$7.50" },
  }

  const plans = [
    {
      name: "Starter",
      hours: "2 hours/week",
      price: pricing[currency].starter,
      hourlyRate: pricing[currency].hourly,
      tagline: "Perfect to begin",
      icon: Star,
      color: "from-blue-400 to-indigo-500",
      features: [
        "One-on-one personalized lessons",
        "Flexible scheduling",
        "Monthly progress report",
        "Monthly mock tests included",
        "Pay only for hours completed",
        "24-hour cancellation policy",
      ],
      popular: false,
    },
    {
      name: "Standard",
      hours: "3 hours/week",
      price: pricing[currency].premium,
      hourlyRate: pricing[currency].hourly,
      tagline: "Most Popular Choice",
      icon: Crown,
      color: "from-secondary to-orange-500",
      features: [
        "Everything in Starter",
        "FREE 30-min bonus class weekly",
        "Priority tutor matching",
        "Detailed assessments",
        "Direct WhatsApp support",
        "5% sibling discount available",
      ],
      popular: true,
    },
    {
      name: "Intensive",
      hours: "6 hours/week",
      price: pricing[currency].intensive,
      hourlyRate: pricing[currency].hourly,
      tagline: "For serious learners",
      icon: Zap,
      color: "from-purple-400 to-violet-500",
      features: [
        "Everything in Standard",
        "Multiple subjects coverage",
        "Bi-weekly progress reports",
        "Parent-tutor consultations",
        "Custom learning plan",
        "Best value for families",
      ],
      popular: false,
    },
  ]

  return (
    <section ref={sectionRef} id="pricing" className="py-20 bg-gradient-to-b from-background to-muted/30 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 h-20 w-20 rounded-full bg-green-100 dark:bg-green-900/20 opacity-20 animate-float" />
      <div className="absolute bottom-20 right-10 h-24 w-24 rounded-full bg-purple-100 dark:bg-purple-900/20 opacity-20 animate-float" style={{ animationDelay: "1.5s" }} />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section header */}
        <div className={`text-center mb-12 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
          <span className="inline-flex items-center gap-2 bg-secondary/10 text-secondary px-4 py-2 rounded-full mb-4">
            <Gift className="h-4 w-4" />
            <span className="font-semibold text-sm">Transparent Pricing</span>
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Plans That <span className="text-secondary">Fit Your Family</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Pay only for hours completed — no upfront packages. Monthly payment at month end.
          </p>

          {/* Currency toggle */}
          <div className="mt-6 inline-flex items-center gap-2 bg-muted rounded-full p-1">
            {[
              { code: "NGN" as const, label: "NGN (₦)" },
              { code: "GBP" as const, label: "GBP (£)" },
              { code: "USD" as const, label: "USD ($)" },
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
        </div>

        {/* Pricing cards */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
              style={{ transitionDelay: `${index * 150}ms` }}
              onMouseEnter={() => setHoveredPlan(index)}
              onMouseLeave={() => setHoveredPlan(null)}
            >
              <Card 
                className={`child-card relative h-full border-2 overflow-hidden transition-all duration-300 ${
                  plan.popular 
                    ? "border-secondary shadow-xl scale-105 lg:scale-110" 
                    : hoveredPlan === index 
                      ? "border-secondary/50 shadow-lg" 
                      : "border-border"
                }`}
              >
                {/* Popular badge */}
                {plan.popular && (
                  <div className="absolute -top-0 -right-0">
                    <div className="bg-secondary text-secondary-foreground px-6 py-1 text-sm font-bold transform rotate-0 rounded-bl-xl">
                      MOST POPULAR
                    </div>
                  </div>
                )}

                {/* Top gradient bar */}
                <div className={`h-2 bg-gradient-to-r ${plan.color}`} />

                <CardHeader className="text-center pb-4 pt-8">
                  {/* Plan icon */}
                  <div className="mx-auto mb-4 relative">
                    <div className={`h-16 w-16 rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center shadow-lg ${hoveredPlan === index || plan.popular ? "animate-bounce-slow" : ""}`}>
                      <plan.icon className="h-8 w-8 text-white" />
                    </div>
                  </div>

                  <CardTitle className="text-2xl font-bold text-foreground mb-1">{plan.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{plan.tagline}</p>
                  
                  {/* Hours badge */}
                  <div className="mt-4 inline-flex items-center gap-2 bg-muted rounded-full px-4 py-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold text-foreground">{plan.hours}</span>
                  </div>
                  
                  {/* Price */}
                  <div className="mt-4">
                    <span className={`text-3xl font-bold bg-gradient-to-r ${plan.color} bg-clip-text text-transparent`}>
                      {plan.price}
                    </span>
                    <span className="text-muted-foreground text-sm">/month</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    ({plan.hourlyRate}/hour)
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 pb-8 px-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <div className={`shrink-0 h-5 w-5 rounded-full bg-gradient-to-r ${plan.color} flex items-center justify-center mt-0.5`}>
                          <Check className="h-3 w-3 text-white" />
                        </div>
                        <span className={`text-sm ${feature.includes("FREE") ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button
                    onClick={() => openModal(plan.name)}
                    size="lg"
                    className={`w-full btn-playful rounded-full transition-all ${
                      plan.popular 
                        ? "bg-secondary hover:bg-secondary/90 text-secondary-foreground shadow-lg shadow-secondary/30" 
                        : "bg-primary hover:bg-primary/90 text-primary-foreground"
                    }`}
                  >
                    Get Started
                    {plan.popular && <Sparkles className="h-4 w-4 ml-2" />}
                  </Button>
                </CardContent>

                {/* Bottom gradient on hover */}
                <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${plan.color} opacity-0 group-hover:opacity-100 transition-opacity`} />
              </Card>
            </div>
          ))}
        </div>

        {/* Bottom info */}
        <div className={`mt-16 text-center space-y-6 transition-all duration-700 delay-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
          {/* Free trial banner */}
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 bg-secondary/10 border-2 border-secondary/20 rounded-2xl px-8 py-4">
            <div className="h-12 w-12 rounded-full bg-secondary/20 flex items-center justify-center">
              <Gift className="h-6 w-6 text-secondary" />
            </div>
            <div className="text-center sm:text-left">
              <p className="font-bold text-foreground text-lg">First Trial Lesson is FREE!</p>
              <p className="text-muted-foreground">Try us risk-free before committing</p>
            </div>
          </div>

          {/* Additional info */}
          <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
            {[
              { icon: Check, text: "Pay only for completed hours" },
              { icon: Check, text: "5% sibling discount" },
              { icon: Check, text: "24-hour cancellation policy" },
              { icon: Check, text: "All Nigerian tutors" },
            ].map((item, i) => (
              <span key={i} className="flex items-center gap-2 bg-muted/50 rounded-full px-4 py-2">
                <item.icon className="h-4 w-4 text-green-500" />
                {item.text}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
