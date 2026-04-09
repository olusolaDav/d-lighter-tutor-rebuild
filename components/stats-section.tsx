"use client"

import { Users, BookOpen, Globe, Award, TrendingUp, Star } from "lucide-react"
import { useEffect, useRef, useState } from "react"

function AnimatedCounter({ end, duration = 2000, suffix = "" }: { end: number; duration?: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true)
        }
      },
      { threshold: 0.5 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [isVisible])

  useEffect(() => {
    if (!isVisible) return

    let startTime: number
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      setCount(Math.floor(easeOutQuart * end))

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [isVisible, end, duration])

  return <span ref={ref}>{count}{suffix}</span>
}

export function StatsSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.2 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  const stats = [
    {
      icon: Users,
      value: 50,
      suffix: "+",
      label: "Happy Learners",
      description: "Growing every week",
      color: "from-amber-400 to-amber-500",
      bgColor: "bg-amber-100 dark:bg-amber-900/30",
      iconColor: "text-amber-600 dark:text-amber-400",
    },
    {
      icon: BookOpen,
      value: 15,
      suffix: "+",
      label: "Fun Subjects",
      description: "From Maths to Music",
      color: "from-blue-400 to-indigo-500",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
      iconColor: "text-blue-600 dark:text-blue-400",
    },
    {
      icon: Globe,
      value: 5,
      suffix: "",
      label: "Countries",
      description: "UK, US, Canada & more",
      color: "from-slate-500 to-slate-700",
      bgColor: "bg-slate-100 dark:bg-slate-900/30",
      iconColor: "text-slate-600 dark:text-slate-400",
    },
    {
      icon: Award,
      value: 98,
      suffix: "%",
      label: "Success Rate",
      description: "Vetted expert tutors",
      color: "from-blue-400 to-indigo-500",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
      iconColor: "text-blue-600 dark:text-blue-400",
    },
  ]

  return (
    <section ref={sectionRef} className="py-20 bg-white relative overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className={`text-center mb-12 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
          <span className="text-secondary font-semibold text-sm uppercase tracking-wider mb-2 block">Our Growing Impact</span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Trusted by Families <span className="text-secondary">Across the Globe</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Join our community of happy learners and see why parents love D-lighter Tutor
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`relative group transition-all duration-700 delay-${index * 100} ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className="bg-white border border-border rounded-2xl p-6 text-center h-full hover:shadow-md transition-shadow">
                {/* Icon */}
                <div className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl ${stat.bgColor}`}>
                  <stat.icon className={`h-7 w-7 ${stat.iconColor}`} />
                </div>
                
                {/* Animated counter */}
                <div className="text-4xl font-bold text-foreground mb-1">
                  <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                </div>
                
                {/* Label */}
                <div className="text-sm font-medium text-muted-foreground">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust badge */}
        <div className={`mt-12 text-center transition-all duration-700 delay-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
          <div className="inline-flex items-center gap-4 bg-card border-2 border-secondary/20 rounded-full px-6 py-3">
            <div className="flex -space-x-2">
              {["bg-amber-500", "bg-blue-500", "bg-secondary"].map((color, i) => (
                <div key={i} className={`h-8 w-8 rounded-full ${color} flex items-center justify-center border-2 border-background text-white text-xs font-bold`}>
                  {String.fromCharCode(65 + i)}
                </div>
              ))}
            </div>
            <div className="text-sm">
              {/* <span className="font-semibold text-foreground">Loved by 500+ families</span> */}
              <div className="flex items-center gap-1 text-muted-foreground">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                ))}
                <span className="ml-1">5.0 rating</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
