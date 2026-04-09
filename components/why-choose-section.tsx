"use client"

import { Card, CardContent } from "@/components/ui/card"
import { BadgeCheck, Calendar, FileText, CreditCard, Users, Clock, Shield } from "lucide-react"
import { useEffect, useRef, useState } from "react"

export function WhyChooseSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const [isVisible, setIsVisible] = useState(false)

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

  const benefits = [
    {
      icon: BadgeCheck,
      title: "Expert Nigerian Tutors",
      description: "All tutors are experienced Nigerian educators, trained in early childhood education and skilled at making online learning engaging",
      bgColor: "bg-blue-50",
      iconColor: "text-secondary",
    },
    {
      icon: Users,
      title: "True One-on-One Attention",
      description: "Every lesson is personalized to your child's pace, style, and curriculum — no group classes, just focused learning",
      bgColor: "bg-blue-50",
      iconColor: "text-secondary",
    },
    {
      icon: Calendar,
      title: "Fits Your Busy Life",
      description: "Flexible scheduling across UK, US, Canada time zones. 24-hour cancellation policy with easy rescheduling!",
      bgColor: "bg-blue-50",
      iconColor: "text-secondary",
    },
    {
      icon: CreditCard,
      title: "Flexible Payment Options",
      description: "Pay in Naira, GBP, or USD. Only pay for hours completed — no upfront packages or hidden fees",
      bgColor: "bg-blue-50",
      iconColor: "text-secondary",
    },
    {
      icon: FileText,
      title: "Monthly Progress Reports",
      description: "Know exactly how your child is doing with detailed monthly reports, mock tests, and achievement tracking",
      bgColor: "bg-blue-50",
      iconColor: "text-secondary",
    },
    {
      icon: Clock,
      title: "FREE Weekly Bonus Class",
      description: "Book 3+ hours weekly and get a FREE 30-minute bonus class every week — that's extra learning at no cost!",
      bgColor: "bg-blue-50",
      iconColor: "text-secondary",
    },
  ]

  return (
    <section ref={sectionRef} className="py-20 bg-white relative overflow-hidden">

      <div className="container mx-auto px-4 relative z-10">
        {/* Section header */}
        <div className={`text-center mb-16 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
          <p className="text-secondary font-semibold text-sm uppercase tracking-wider mb-4">Why Parents Love Us</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            What Makes <span className="text-secondary">D-lighter Tutor</span> Special?
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            We understand diaspora families — busy schedules, multiple time zones, and the desire to keep kids connected to their roots
          </p>
        </div>

        {/* Benefits grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className={`transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <Card className="h-full border border-border hover:border-secondary/50 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all group">
                <CardContent className="p-6">
                  <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${benefit.bgColor}`}>
                    <benefit.icon className={`h-6 w-6 ${benefit.iconColor}`} />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {benefit.description}
                  </p>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* Trust badges */}
        <div className={`mt-16 text-center transition-all duration-700 delay-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
          <div className="inline-flex flex-wrap justify-center gap-4">
            {[
              { icon: Shield, text: "Safe & Secure", color: "text-secondary" },
              { icon: BadgeCheck, text: "Vetted Tutors", color: "text-secondary" },
              { icon: BadgeCheck, text: "Age-Appropriate", color: "text-secondary" },
            ].map((badge, i) => (
              <div key={i} className="flex items-center gap-2 bg-card border border-border rounded-full px-4 py-2">
                <badge.icon className={`h-4 w-4 ${badge.color}`} />
                <span className="text-sm font-medium text-foreground">{badge.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
