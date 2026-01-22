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
      color: "from-green-400 to-emerald-500",
      bgColor: "bg-green-100 dark:bg-green-900/30",
      iconColor: "text-green-600 dark:text-green-400",
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
      color: "from-purple-400 to-violet-500",
      bgColor: "bg-purple-100 dark:bg-purple-900/30",
      iconColor: "text-purple-600 dark:text-purple-400",
    },
    {
      icon: Award,
      value: 98,
      suffix: "%",
      label: "Success Rate",
      description: "Vetted expert tutors",
      color: "from-orange-400 to-amber-500",
      bgColor: "bg-orange-100 dark:bg-orange-900/30",
      iconColor: "text-orange-600 dark:text-orange-400",
    },
  ]

  return (
    <section ref={sectionRef} className="py-20 bg-gradient-to-b from-background to-muted/30 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-10 left-10 h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900/20 opacity-30 animate-float" />
      <div className="absolute bottom-10 right-10 h-20 w-20 rounded-full bg-purple-100 dark:bg-purple-900/20 opacity-30 animate-float" style={{ animationDelay: "1s" }} />
      <div className="absolute top-1/2 left-1/4 h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/20 opacity-30 animate-float" style={{ animationDelay: "2s" }} />

      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className={`text-center mb-12 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
          <span className="inline-flex items-center gap-2 bg-secondary/10 text-secondary px-4 py-2 rounded-full mb-4">
            <TrendingUp className="h-4 w-4" />
            <span className="font-semibold text-sm">Our Growing Impact</span>
          </span>
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
              <div className="child-card bg-card border-2 border-border hover:border-secondary/50 p-6 text-center h-full">
                {/* Icon */}
                <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl ${stat.bgColor} group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className={`h-8 w-8 ${stat.iconColor}`} />
                </div>
                
                {/* Animated counter */}
                <div className="text-4xl md:text-5xl font-bold text-foreground mb-2">
                  <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                </div>
                
                {/* Label */}
                <div className="text-lg font-semibold text-foreground mb-1">{stat.label}</div>
                
                {/* Description */}
                <div className="text-sm text-muted-foreground">{stat.description}</div>

                {/* Gradient bar at bottom */}
                <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.color} rounded-b-2xl opacity-0 group-hover:opacity-100 transition-opacity`} />
              </div>
            </div>
          ))}
        </div>

        {/* Trust badge */}
        <div className={`mt-12 text-center transition-all duration-700 delay-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
          <div className="inline-flex items-center gap-4 bg-card border-2 border-secondary/20 rounded-full px-6 py-3">
            <div className="flex -space-x-2">
              {["bg-green-500", "bg-blue-500", "bg-purple-500"].map((color, i) => (
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
