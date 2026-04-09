"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MessageCircle, Search, Calendar, VideoIcon, BarChart, ArrowRight, CheckCircle2, Gift } from "lucide-react"
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
      color: "from-amber-400 to-amber-500",
      bgColor: "bg-amber-100 dark:bg-amber-900/30",
      iconColor: "text-amber-600",
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
      color: "from-slate-500 to-slate-700",
      bgColor: "bg-slate-100 dark:bg-slate-900/30",
      iconColor: "text-slate-600",
    },
    {
      icon: VideoIcon,
      step: "4",
      title: "Start Learning",
      description: "Begin fun, personalized one-on-one video lessons",
      color: "from-amber-300 to-amber-500",
      bgColor: "bg-amber-100 dark:bg-amber-900/30",
      iconColor: "text-amber-600",
    },
    {
      icon: BarChart,
      step: "5",
      title: "Watch Them Grow",
      description: "Get monthly reports showing your child's amazing progress!",
      color: "from-blue-300 to-blue-500",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
      iconColor: "text-blue-600",
    },
  ]

  return (
    <section ref={sectionRef} id="how-it-works" className="py-20 relative overflow-hidden">
      {/* Warm beige curved background */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-50/80 via-slate-50/60 to-white" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Section header */}
        <div className={`text-center mb-16 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
          <span className="text-muted-foreground text-sm mb-2 block">Get started in 5 simple steps</span>
          <h2 className="text-3xl md:text-4xl font-bold">
            How It <span className="text-secondary">Works</span>
          </h2>
        </div>

        {/* Steps - Desktop */}
        <div className="hidden lg:block max-w-6xl mx-auto mb-16">
          <div className="grid grid-cols-5 gap-4 items-start">
            {steps.map((item, index) => (
              <div
                key={index}
                className={`transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="relative">
                  {/* Step card */}
                  <div className={`bg-secondary text-white rounded-2xl p-6 border-2 border-amber-400/40 shadow-md transition-transform duration-300 ${activeStep === index ? "scale-105" : ""}`}>
                    <span className="text-4xl font-bold opacity-80">{item.step}.</span>
                    <h3 className="font-bold text-lg mt-2 mb-2">{item.title}</h3>
                    <p className="text-sm text-white/80 leading-relaxed">{item.description}</p>
                  </div>
                  
                  {/* Arrow connector */}
                  {index < steps.length - 1 && (
                    <div className="absolute top-1/2 -right-4 transform -translate-y-1/2 z-10 text-muted-foreground">
                      <ArrowRight className="h-5 w-5" />
                    </div>
                  )}
                </div>
              </div>
            ))}
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
              <div className="bg-secondary text-white rounded-2xl p-5 border-2 border-amber-400/40 shadow-md flex items-start gap-4">
                <span className="text-3xl font-bold opacity-80 shrink-0">{item.step}.</span>
                <div>
                  <h3 className="font-bold mb-1">{item.title}</h3>
                  <p className="text-sm text-white/80">{item.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className={`text-center transition-all duration-700 delay-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
          <Button
            onClick={() => openModal()}
            size="lg"
            className="bg-amber-500 hover:bg-amber-600 text-white rounded-full px-10 h-14 text-lg shadow-md"
          >
            Get Started
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  )
}
