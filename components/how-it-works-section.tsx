"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MessageCircle, Search, Calendar, VideoIcon, BarChart, Gift, ArrowRight, CheckCircle2, Sparkles } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { useBookingForm } from "@/components/booking-form-modal"

export function HowItWorksSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [activeStep, setActiveStep] = useState(0)
  const { openModal } = useBookingForm()

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

  // Auto-advance active step
  useEffect(() => {
    if (!isVisible) return
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 5)
    }, 3000)
    return () => clearInterval(interval)
  }, [isVisible])

  const steps = [
    {
      icon: Gift,
      step: "1",
      title: "Book Your Trial",
      description: "Fill out a quick form with your child's age, subjects & goals",
      color: "from-green-400 to-emerald-500",
      bgColor: "bg-green-100 dark:bg-green-900/30",
      iconColor: "text-green-600",
    },
    {
      icon: Search,
      step: "2",
      title: "Perfect Tutor Match",
      description: "We find a tutor who specializes in your child's needs",
      color: "from-blue-400 to-indigo-500",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
      iconColor: "text-blue-600",
    },
    {
      icon: Calendar,
      step: "3",
      title: "Free Trial Class",
      description: "Book a FREE 30-minute trial at your convenience",
      color: "from-purple-400 to-violet-500",
      bgColor: "bg-purple-100 dark:bg-purple-900/30",
      iconColor: "text-purple-600",
    },
    {
      icon: VideoIcon,
      step: "4",
      title: "Start Learning",
      description: "Begin fun, personalized one-on-one video lessons",
      color: "from-orange-400 to-amber-500",
      bgColor: "bg-orange-100 dark:bg-orange-900/30",
      iconColor: "text-orange-600",
    },
    {
      icon: BarChart,
      step: "5",
      title: "Watch Them Grow",
      description: "Get monthly reports showing your child's amazing progress!",
      color: "from-pink-400 to-rose-500",
      bgColor: "bg-pink-100 dark:bg-pink-900/30",
      iconColor: "text-pink-600",
    },
  ]

  return (
    <section ref={sectionRef} id="how-it-works" className="py-20 bg-gradient-to-b from-muted/30 to-background relative overflow-hidden">
      {/* Playful background decorations */}
      <div className="absolute top-10 right-10 h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/20 opacity-30 animate-float" />
      <div className="absolute bottom-20 left-10 h-20 w-20 rounded-full bg-purple-100 dark:bg-purple-900/20 opacity-30 animate-float" style={{ animationDelay: "1.5s" }} />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Section header */}
        <div className={`text-center mb-16 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
          <span className="inline-flex items-center gap-2 bg-secondary/10 text-secondary px-4 py-2 rounded-full mb-4">
            <Sparkles className="h-4 w-4" />
            <span className="font-semibold text-sm">Getting Started is Easy!</span>
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="text-secondary">5 Simple Steps</span> to Academic Success
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            From your first message to monthly progress reports — we make it super easy for busy parents!
          </p>
        </div>

        {/* Steps - Desktop Timeline */}
        <div className="hidden lg:block max-w-6xl mx-auto mb-16">
          <div className="relative">
            {/* Connection line */}
            <div className="absolute top-24 left-0 right-0 h-2 bg-gradient-to-r from-green-400 via-purple-400 to-pink-400 rounded-full opacity-20" />
            <div 
              className="absolute top-24 left-0 h-2 bg-gradient-to-r from-green-400 via-purple-400 to-pink-400 rounded-full transition-all duration-500"
              style={{ width: `${(activeStep / 4) * 100}%` }}
            />

            <div className="grid grid-cols-5 gap-4">
              {steps.map((item, index) => (
                <div
                  key={index}
                  className={`transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                  onMouseEnter={() => setActiveStep(index)}
                >
                  {/* Step card */}
                  <div className={`relative ${activeStep === index ? "scale-105" : "scale-100"} transition-transform duration-300`}>
                    {/* Step number circle */}
                    <div className="flex justify-center mb-4">
                      <div className={`relative h-20 w-20 rounded-full flex items-center justify-center bg-gradient-to-br ${item.color} shadow-lg ${activeStep === index ? "animate-pulse-glow" : ""}`}>
                        <span className="text-3xl font-bold text-white">{item.step}</span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className={`text-center p-4 rounded-2xl transition-all duration-300 ${activeStep === index ? "bg-card shadow-lg border-2 border-secondary" : "bg-transparent"}`}>
                      <div className={`mb-3 flex justify-center`}>
                        <div className={`h-12 w-12 rounded-xl ${item.bgColor} flex items-center justify-center`}>
                          <item.icon className={`h-6 w-6 ${item.iconColor}`} />
                        </div>
                      </div>
                      <h3 className="font-bold text-foreground mb-2">{item.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Steps - Mobile Cards */}
        <div className="lg:hidden grid gap-4 max-w-md mx-auto mb-12">
          {steps.map((item, index) => (
            <div
              key={index}
              className={`transition-all duration-700 ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"}`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <Card className="child-card border-2 border-border hover:border-secondary overflow-hidden">
                <div className={`h-1 bg-gradient-to-r ${item.color}`} />
                <CardContent className="p-4 flex items-start gap-4">
                  {/* Step number */}
                  <div className={`shrink-0 h-14 w-14 rounded-2xl flex items-center justify-center bg-gradient-to-br ${item.color} shadow-lg`}>
                    <span className="text-xl font-bold text-white">{item.step}</span>
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1">
                    <h3 className="font-bold text-foreground mb-1">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>

                  {/* Arrow for connection */}
                  {index < steps.length - 1 && (
                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 text-secondary">
                      <ArrowRight className="h-5 w-5 rotate-90" />
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className={`text-center transition-all duration-700 delay-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
          <div className="inline-flex flex-col sm:flex-row items-center gap-6 bg-card border-2 border-secondary/20 rounded-3xl px-8 py-6 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-secondary/20 flex items-center justify-center">
                <Gift className="h-7 w-7 text-secondary" />
              </div>
              <div className="text-left">
                <p className="font-bold text-lg text-foreground">Ready to get started?</p>
                <p className="text-muted-foreground">Your child&apos;s first lesson is FREE!</p>
              </div>
            </div>
            <Button
              onClick={() => openModal()}
              size="lg"
              className="bg-secondary hover:bg-secondary/90 text-secondary-foreground btn-playful rounded-full shadow-lg shadow-secondary/30 group"
            >
              <Gift className="h-5 w-5 group-hover:animate-wiggle" />
              Book Free Trial Now
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
