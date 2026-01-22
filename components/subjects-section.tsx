"use client"

import { Card, CardContent } from "@/components/ui/card"
import { BookOpen, Globe2, Code, Music, Calculator, FlaskConical, Languages, GraduationCap, Palette, Gamepad2 } from "lucide-react"
import { useEffect, useRef, useState } from "react"

export function SubjectsSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

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
      bgColor: "bg-blue-500/10",
      iconColor: "text-blue-500",
      ageRange: "Ages 3-16",
    },
    {
      icon: BookOpen,
      title: "English Language",
      description: "Reading, writing & speaking with confidence",
      color: "from-green-400 to-emerald-600",
      bgColor: "bg-green-500/10",
      iconColor: "text-green-500",
      ageRange: "Ages 3-16",
    },
    {
      icon: FlaskConical,
      title: "Sciences",
      description: "Biology, Chemistry & Physics adventures",
      color: "from-purple-400 to-violet-600",
      bgColor: "bg-purple-500/10",
      iconColor: "text-purple-500",
      ageRange: "Ages 8-16",
    },
    {
      icon: Languages,
      title: "African Languages",
      description: "Learn Yoruba, Igbo & Hausa — stay connected to roots!",
      color: "from-orange-400 to-amber-600",
      bgColor: "bg-orange-500/10",
      iconColor: "text-orange-500",
      ageRange: "Ages 3-16",
    },
    {
      icon: Globe2,
      title: "International Languages",
      description: "French, Spanish, German — become multilingual!",
      color: "from-red-400 to-rose-600",
      bgColor: "bg-red-500/10",
      iconColor: "text-red-500",
      ageRange: "Ages 5-16",
    },
    {
      icon: Code,
      title: "Tech & Digital Skills",
      description: "Coding, AI, Graphics, Animation & ICT for future innovators",
      color: "from-cyan-400 to-teal-600",
      bgColor: "bg-cyan-500/10",
      iconColor: "text-cyan-500",
      ageRange: "Ages 6-16",
    },
    {
      icon: Music,
      title: "Music Lessons",
      description: "Piano, guitar & more — discover musical talents",
      color: "from-pink-400 to-rose-600",
      bgColor: "bg-pink-500/10",
      iconColor: "text-pink-500",
      ageRange: "Ages 4-16",
    },
    {
      icon: GraduationCap,
      title: "Exam Preparation",
      description: "SAT, Cambridge, IGCSE, 11+, GCSE & more",
      color: "from-indigo-400 to-blue-600",
      bgColor: "bg-indigo-500/10",
      iconColor: "text-indigo-500",
      ageRange: "Ages 8-16",
    },
  ]

  return (
    <section ref={sectionRef} id="subjects" className="py-20 bg-background relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 confetti-bg opacity-50" />
      <div className="absolute top-20 left-10 h-24 w-24 rounded-full bg-blue-100 dark:bg-blue-900/20 opacity-20 animate-float" />
      <div className="absolute bottom-20 right-10 h-32 w-32 rounded-full bg-purple-100 dark:bg-purple-900/20 opacity-20 animate-float" style={{ animationDelay: "2s" }} />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section header */}
        <div className={`text-center mb-16 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
          <span className="inline-flex items-center gap-2 bg-secondary/10 text-secondary px-4 py-2 rounded-full mb-4">
            <Palette className="h-4 w-4" />
            <span className="font-semibold text-sm">Explore What We Teach</span>
          </span>
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
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <Card className={`child-card h-full border-2 ${hoveredIndex === index ? "border-secondary shadow-xl" : "border-border"} bg-card overflow-hidden group cursor-pointer`}>
                {/* Gradient top bar */}
                <div className={`h-2 bg-gradient-to-r ${subject.color}`} />
                
                <CardContent className="p-6 relative">

                  {/* Icon container */}
                  <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl ${subject.bgColor} transition-all duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                    <subject.icon className={`h-7 w-7 ${subject.iconColor}`} />
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-secondary transition-colors">
                    {subject.title}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    {subject.description}
                  </p>
                  
                  {/* Age badge */}
                  <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${subject.bgColor} ${subject.iconColor}`}>
                    <Gamepad2 className="h-3 w-3" />
                    {subject.ageRange}
                  </div>

                  {/* Hover arrow indicator */}
                  <div className={`absolute bottom-4 right-4 transition-all duration-300 ${hoveredIndex === index ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"}`}>
                    <div className={`h-8 w-8 rounded-full bg-gradient-to-r ${subject.color} flex items-center justify-center text-white`}>
                      →
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className={`mt-12 text-center transition-all duration-700 delay-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 bg-gradient-to-r from-secondary/10 via-primary/5 to-secondary/10 rounded-2xl px-8 py-6">
            <div className="h-12 w-12 rounded-full bg-secondary/20 flex items-center justify-center">
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
              className="bg-secondary hover:bg-secondary/90 text-secondary-foreground px-6 py-3 rounded-full font-semibold transition-all hover:scale-105 whitespace-nowrap"
            >
              Ask Us
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
