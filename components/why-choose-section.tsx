"use client"

import { Card, CardContent } from "@/components/ui/card"
import { BadgeCheck, Calendar, FileText, CreditCard, Users, Clock } from "lucide-react"
import { useEffect, useRef } from "react"

export function WhyChooseSection() {
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

  const benefits = [
    {
      icon: BadgeCheck,
      title: "Qualified Expert Tutors",
      description:
        "All our tutors are vetted, experienced educators who understand the Nigerian and international curricula.",
    },
    {
      icon: Users,
      title: "One-on-One Personalized Attention",
      description:
        "Every lesson is tailored to your child's specific needs, pace, and learning style for maximum effectiveness.",
    },
    {
      icon: Calendar,
      title: "Flexible Scheduling",
      description:
        "Book classes at times that work for your family across different time zones. Reschedule easily if needed.",
    },
    {
      icon: CreditCard,
      title: "Pay in Naira",
      description:
        "Flexible payment options in Nigerian Naira—no need to worry about exchange rates or international fees.",
    },
    {
      icon: FileText,
      title: "Monthly Progress Reports",
      description:
        "Comprehensive reports every month so you can track improvement and celebrate your child's achievements.",
    },
    {
      icon: Clock,
      title: "Free Weekly Bonus Class",
      description: "Sign up for 3+ hours weekly and get an extra 30-minute class free every week!",
    },
  ]

  return (
    <section ref={sectionRef} className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="scroll-animate text-3xl font-bold tracking-tight text-foreground md:text-4xl mb-4">
            Why Parents Trust D-lighter Tutor
          </h2>
          <p className="scroll-animate animate-delay-100 text-lg text-muted-foreground max-w-2xl mx-auto">
            {
              "We understand the unique needs of Nigerian families in diaspora who want the best education for their children"
            }
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          {benefits.map((benefit, index) => (
            <Card
              key={index}
              className={`scroll-animate animate-delay-${Math.min(index * 100, 400)} border-2 hover:border-secondary transition-all hover:shadow-lg`}
            >
              <CardContent className="p-6">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-secondary/10">
                  <benefit.icon className="h-7 w-7 text-secondary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-3">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{benefit.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
