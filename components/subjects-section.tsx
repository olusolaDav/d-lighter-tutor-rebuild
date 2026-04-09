"use client"

import { Card, CardContent } from "@/components/ui/card"
import { BookOpen, Globe2, Code, Music, Calculator, FlaskConical, Languages, GraduationCap, Gamepad2 } from "lucide-react"
import { useEffect, useRef, useState } from "react"

export function SubjectsSection() {
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

  const subjects = [
    {
      icon: Calculator,
      title: "Mathematics",
      description: "From counting to algebra — made fun and easy!",
      color: "from-blue-400 to-blue-600",
      bgColor: "bg-blue-50",
      iconColor: "text-secondary",
      ageRange: "Ages 3-16",
    },
    {
      icon: BookOpen,
      title: "English Language",
      description: "Reading, writing & speaking with confidence",
      bgColor: "bg-blue-50",
      iconColor: "text-secondary",
      ageRange: "Ages 3-16",
    },
    {
      icon: FlaskConical,
      title: "Sciences",
      description: "Biology, Chemistry & Physics adventures",
      bgColor: "bg-blue-50",
      iconColor: "text-secondary",
      ageRange: "Ages 8-16",
    },
    {
      icon: Languages,
      title: "African Languages",
      description: "Learn Yoruba, Igbo & Hausa — stay connected to roots!",
      bgColor: "bg-blue-50",
      iconColor: "text-secondary",
      ageRange: "Ages 3-16",
    },
    {
      icon: Globe2,
      title: "International Languages",
      description: "French, Spanish, German — become multilingual!",
      bgColor: "bg-blue-50",
      iconColor: "text-secondary",
      ageRange: "Ages 5-16",
    },
    {
      icon: Code,
      title: "Tech & Digital Skills",
      description: "Coding, AI, Graphics, Animation & ICT for future innovators",
      bgColor: "bg-blue-50",
      iconColor: "text-secondary",
      ageRange: "Ages 6-16",
    },
    {
      icon: Music,
      title: "Music Lessons",
      description: "Piano, guitar & more — discover musical talents",
      bgColor: "bg-blue-50",
      iconColor: "text-secondary",
      ageRange: "Ages 4-16",
    },
    {
      icon: GraduationCap,
      title: "Exam Preparation",
      description: "SAT, Cambridge, IGCSE, 11+, GCSE & more",
      bgColor: "bg-blue-50",
      iconColor: "text-secondary",
      ageRange: "Ages 8-16",
    },
  ]

  return (
    <section ref={sectionRef} id="subjects" className="py-20 bg-gradient-to-b from-blue-50/60 to-white relative overflow-hidden">

      <div className="container mx-auto px-4 relative z-10">
        {/* Section header */}
        <div className={`text-center mb-16 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
          <p className="text-secondary font-semibold text-sm uppercase tracking-wider mb-4">Explore What We Teach</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            A World of <span className="text-secondary">Learning Adventures</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            From academics to creative arts, tech skills to languages — we've got everything your child needs to{" "}
            <span className="font-semibold text-foreground">learn, grow & shine!</span>
          </p>
        </div>

        {/* Subject cards grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {subjects.map((subject, index) => (
            <div
              key={index}
              className={`transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
              style={{ transitionDelay: `${index * 75}ms` }}
            >
              <Card className="h-full border border-border hover:border-secondary/50 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all group">
                <CardContent className="p-6">
                  <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${subject.bgColor}`}>
                    <subject.icon className={`h-6 w-6 ${subject.iconColor}`} />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">
                    {subject.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                    {subject.description}
                  </p>
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-secondary/10 text-secondary">
                    <Gamepad2 className="h-3 w-3" />
                    {subject.ageRange}
                  </span>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className={`mt-12 text-center transition-all duration-700 delay-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 bg-white border border-border rounded-2xl px-8 py-6 shadow-sm">
            <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-secondary" />
            </div>
            <div className="text-center sm:text-left">
              <p className="font-bold text-foreground text-lg">Can't find your subject?</p>
              <p className="text-muted-foreground">We offer many more! Chat with us to learn about all our courses.</p>
            </div>
            <a
              href="https://wa.me/2348129517392?text=Hi%2C%20I%27d%20like%20to%20know%20about%20the%20subjects%20you%20offer"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-secondary hover:bg-secondary/90 text-white px-6 py-3 rounded-full font-semibold transition-all whitespace-nowrap"
            >
              Ask Us
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
