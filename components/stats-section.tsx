"use client"

import { Users, BookOpen, Globe, Award } from "lucide-react"
import { useEffect, useRef } from "react"

export function StatsSection() {
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

  const stats = [
    {
      icon: Users,
      value: "25+",
      label: "Active Students",
      description: "And growing every week",
    },
    {
      icon: BookOpen,
      value: "15+",
      label: "Subjects Offered",
      description: "From Maths to Music",
    },
    {
      icon: Globe,
      value: "5",
      label: "Countries Served",
      description: "UK, US, Canada, UAE, KSA",
    },
    {
      icon: Award,
      value: "100%",
      label: "Qualified Tutors",
      description: "Vetted & experienced",
    },
  ]

  return (
    <section ref={sectionRef} className="py-16 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`scroll-animate animate-delay-${index * 100} flex flex-col items-center text-center`}
            >
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary/10">
                <stat.icon className="h-8 w-8 text-secondary" />
              </div>
              <div className="text-4xl font-bold text-foreground">{stat.value}</div>
              <div className="mt-2 text-lg font-semibold text-foreground">{stat.label}</div>
              <div className="mt-1 text-sm text-muted-foreground">{stat.description}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
