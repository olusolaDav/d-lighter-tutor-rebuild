"use client"

import { Card, CardContent } from "@/components/ui/card"
import { BookOpen, Globe2, Code, Music, Palette, Calculator, FlaskConical, Languages } from "lucide-react"
import { useEffect, useRef } from "react"

export function SubjectsSection() {
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

  const subjects = [
    {
      icon: Calculator,
      title: "Mathematics",
      description: "From basic arithmetic to advanced algebra, tailored to your child's curriculum",
      color: "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400",
    },
    {
      icon: BookOpen,
      title: "English Language",
      description: "Reading, writing, comprehension, and exam preparation",
      color: "bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400",
    },
    {
      icon: FlaskConical,
      title: "Sciences",
      description: "Biology, Chemistry, Physics - hands-on virtual experiments",
      color: "bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400",
    },
    {
      icon: Languages,
      title: "Nigerian Languages",
      description: "Keep cultural roots strong with Igbo and Yoruba lessons",
      color: "bg-orange-500/10 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400",
    },
    {
      icon: Globe2,
      title: "International Languages",
      description: "French and Spanish classes for global citizens",
      color: "bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400",
    },
    {
      icon: Code,
      title: "IT & Coding",
      description: "Graphics design, web development, and programming skills",
      color: "bg-cyan-500/10 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-400",
    },
    {
      icon: Music,
      title: "Music Lessons",
      description: "Learn various instruments with expert music tutors",
      color: "bg-pink-500/10 text-pink-600 dark:bg-pink-500/20 dark:text-pink-400",
    },
    {
      icon: Palette,
      title: "Exam Preparation",
      description: "SAT, Cambridge Checkpoint, IGCSE, and more",
      color: "bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400",
    },
  ]

  return (
    <section ref={sectionRef} id="subjects" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="scroll-animate text-3xl font-bold tracking-tight text-foreground md:text-4xl mb-4">
            Comprehensive Subject Coverage
          </h2>
          <p className="scroll-animate animate-delay-100 text-lg text-muted-foreground max-w-2xl mx-auto">
            {"From academic subjects to skill development—we cover everything your child needs to excel"}
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {subjects.map((subject, index) => (
            <Card
              key={index}
              className={`scroll-animate animate-delay-${Math.min(index * 100, 400)} border-2 hover:border-secondary transition-all hover:shadow-lg`}
            >
              <CardContent className="p-6">
                <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-lg ${subject.color}`}>
                  <subject.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{subject.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{subject.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
