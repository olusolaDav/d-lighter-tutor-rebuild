"use client"

import { Card, CardContent } from "@/components/ui/card"
import { BadgeCheck, Calendar, FileText, CreditCard, Users, Clock, Heart, Shield, Sparkles } from "lucide-react"
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
      color: "from-green-400 to-emerald-500",
      bgColor: "bg-green-100 dark:bg-green-900/30",
      iconColor: "text-green-600 dark:text-green-400",
    },
    {
      icon: Users,
      title: "True One-on-One Attention",
      description: "Every lesson is personalized to your child's pace, style, and curriculum — no group classes, just focused learning",
      color: "from-blue-400 to-indigo-500",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
      iconColor: "text-blue-600 dark:text-blue-400",
    },
    {
      icon: Calendar,
      title: "Fits Your Busy Life",
      description: "Flexible scheduling across UK, US, Canada time zones. 24-hour cancellation policy with easy rescheduling!",
      color: "from-purple-400 to-violet-500",
      bgColor: "bg-purple-100 dark:bg-purple-900/30",
      iconColor: "text-purple-600 dark:text-purple-400",
    },
    {
      icon: CreditCard,
      title: "Flexible Payment Options",
      description: "Pay in Naira, GBP, or USD. Only pay for hours completed — no upfront packages or hidden fees",
      color: "from-orange-400 to-amber-500",
      bgColor: "bg-orange-100 dark:bg-orange-900/30",
      iconColor: "text-orange-600 dark:text-orange-400",
    },
    {
      icon: FileText,
      title: "Monthly Progress Reports",
      description: "Know exactly how your child is doing with detailed monthly reports, mock tests, and achievement tracking",
      color: "from-pink-400 to-rose-500",
      bgColor: "bg-pink-100 dark:bg-pink-900/30",
      iconColor: "text-pink-600 dark:text-pink-400",
    },
    {
      icon: Clock,
      title: "FREE Weekly Bonus Class",
      description: "Book 3+ hours weekly and get a FREE 30-minute bonus class every week — that's extra learning at no cost!",
      color: "from-cyan-400 to-teal-500",
      bgColor: "bg-cyan-100 dark:bg-cyan-900/30",
      iconColor: "text-cyan-600 dark:text-cyan-400",
    },
  ]

  return (
    <section ref={sectionRef} className="py-20 bg-gradient-to-b from-background to-muted/20 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-20 left-5 h-20 w-20 rounded-full bg-yellow-100 dark:bg-yellow-900/20 opacity-20 animate-float" />
      <div className="absolute bottom-20 right-5 h-24 w-24 rounded-full bg-purple-100 dark:bg-purple-900/20 opacity-20 animate-float" style={{ animationDelay: "2s" }} />
      <div className="absolute top-1/2 right-1/4 h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/20 opacity-10 animate-float" style={{ animationDelay: "1s" }} />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section header */}
        <div className={`text-center mb-16 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
          <span className="inline-flex items-center gap-2 bg-secondary/10 text-secondary px-4 py-2 rounded-full mb-4">
            <Heart className="h-4 w-4" />
            <span className="font-semibold text-sm">Why Parents Love Us</span>
          </span>
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
              <Card className="child-card h-full border-2 border-border hover:border-secondary group bg-card overflow-hidden">
                {/* Top gradient bar */}
                <div className={`h-1.5 bg-gradient-to-r ${benefit.color}`} />
                
                <CardContent className="p-6 relative">

                  {/* Icon */}
                  <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl ${benefit.bgColor} group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                    <benefit.icon className={`h-7 w-7 ${benefit.iconColor}`} />
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-lg font-bold text-foreground mb-3 group-hover:text-secondary transition-colors">
                    {benefit.title}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {benefit.description}
                  </p>

                  {/* Bottom gradient on hover */}
                  <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${benefit.color} opacity-0 group-hover:opacity-100 transition-opacity`} />
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* Trust badges */}
        <div className={`mt-16 text-center transition-all duration-700 delay-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
          <div className="inline-flex flex-wrap justify-center gap-4">
            {[
              { icon: Shield, text: "Safe & Secure", color: "text-green-500" },
              { icon: BadgeCheck, text: "Vetted Tutors", color: "text-blue-500" },
              { icon: Sparkles, text: "Age-Appropriate", color: "text-purple-500" },
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
