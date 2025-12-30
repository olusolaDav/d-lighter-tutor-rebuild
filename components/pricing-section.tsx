"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, MessageCircle } from "lucide-react"
import { useEffect, useRef } from "react"

export function PricingSection() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-on-scroll")
          }
        })
      },
      { threshold: 0.1 },
    )

    const elements = sectionRef.current?.querySelectorAll(".scroll-animate")
    elements?.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  const plans = [
    {
      name: "Starter Package",
      hours: "2 hours/week",
      price: "Contact for pricing",
      features: [
        "One-on-one personalized lessons",
        "Flexible scheduling",
        "Monthly progress report",
        "Pay in Naira",
        "Access to learning resources",
      ],
      popular: false,
    },
    {
      name: "Premium Package",
      hours: "3+ hours/week",
      price: "Contact for pricing",
      features: [
        "Everything in Starter",
        "30-min FREE bonus class weekly",
        "Priority tutor matching",
        "Detailed assessments",
        "Direct WhatsApp support",
        "Exam preparation materials",
      ],
      popular: true,
    },
    {
      name: "Intensive Package",
      hours: "5+ hours/week",
      price: "Contact for pricing",
      features: [
        "Everything in Premium",
        "Multiple subjects coverage",
        "Bi-weekly progress reports",
        "Parent-tutor consultations",
        "Custom learning plan",
        "Best value for money",
      ],
      popular: false,
    },
  ]

  return (
    <section ref={sectionRef} id="pricing" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="scroll-animate text-3xl font-bold tracking-tight text-foreground md:text-4xl mb-4">
            Flexible Pricing for Every Family
          </h2>
          <p className="scroll-animate animate-delay-100 text-lg text-muted-foreground max-w-2xl mx-auto">
            {"Choose a plan that fits your child's learning needs. All payments in Naira with flexible scheduling."}
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`scroll-animate animate-delay-${index * 100} relative border-2 ${plan.popular ? "border-secondary shadow-xl scale-105" : "border-border"}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-secondary text-secondary-foreground px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}
              <CardHeader className="text-center pb-8 pt-8">
                <CardTitle className="text-2xl font-bold text-foreground mb-2">{plan.name}</CardTitle>
                <div className="text-sm text-muted-foreground mb-4">{plan.hours}</div>
                <div className="text-3xl font-bold text-foreground">{plan.price}</div>
              </CardHeader>
              <CardContent className="space-y-4 pb-8">
                <ul className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-secondary shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  asChild
                  size="lg"
                  className={`w-full ${plan.popular ? "bg-secondary hover:bg-secondary/90 text-secondary-foreground" : "bg-primary hover:bg-primary/90 text-primary-foreground"}`}
                >
                  <a
                    href={`https://wa.me/2348129517392?text=Hi%2C%20I%27m%20interested%20in%20the%20${plan.name}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Get Started
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center scroll-animate animate-delay-300">
          <p className="text-sm text-muted-foreground">
            {"All packages include your first trial class free. Contact us for custom packages or group discounts."}
          </p>
        </div>
      </div>
    </section>
  )
}
