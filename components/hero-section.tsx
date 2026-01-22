"use client"

import { Button } from "@/components/ui/button"
import { MessageCircle, CheckCircle, Star, Sparkles, BookOpen, Pencil, Music, Code, Users, Globe, Gift, ArrowRight } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { useBookingForm } from "@/components/booking-form-modal"

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const { openModal } = useBookingForm()

  useEffect(() => {
    setIsVisible(true)
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

  const floatingIcons = [
    { Icon: Star, color: "text-yellow-400", size: "h-8 w-8", position: "top-20 left-[10%]", delay: "0s" },
    { Icon: BookOpen, color: "text-blue-400", size: "h-10 w-10", position: "top-32 right-[15%]", delay: "1s" },
    { Icon: Pencil, color: "text-green-400", size: "h-6 w-6", position: "bottom-40 left-[5%]", delay: "2s" },
    { Icon: Music, color: "text-pink-400", size: "h-7 w-7", position: "top-40 left-[20%]", delay: "1.5s" },
    { Icon: Code, color: "text-cyan-400", size: "h-9 w-9", position: "bottom-32 right-[10%]", delay: "0.5s" },
    { Icon: Sparkles, color: "text-yellow-300", size: "h-6 w-6", position: "top-16 right-[25%]", delay: "2.5s" },
  ]

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-gradient-to-br from-primary via-primary to-primary/95 py-20 md:py-32">
      {/* Animated floating icons */}
      {floatingIcons.map((item, index) => (
        <div
          key={index}
          className={`absolute ${item.position} opacity-20 animate-float hidden lg:block`}
          style={{ animationDelay: item.delay }}
        >
          <item.Icon className={`${item.size} ${item.color}`} />
        </div>
      ))}

      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-blob" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-blob" style={{ animationDelay: "2s" }} />
      
      {/* Confetti-like dots */}
      <div className="absolute inset-0 confetti-bg" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="text-center lg:text-left">
            {/* Badge */}
            <div 
              className={`inline-flex items-center gap-2 bg-secondary/20 backdrop-blur-sm text-secondary-foreground px-4 py-2 rounded-full mb-6 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"}`}
            >
              <Gift className="h-4 w-4 text-secondary" />
              <span className="text-sm font-semibold text-primary-foreground">First Trial Class is FREE!</span>
            </div>

            <h1 
              className={`text-balance text-4xl font-bold tracking-tight text-primary-foreground md:text-5xl lg:text-6xl transition-all duration-700 delay-100 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
            >
              Expert Tutoring for{" "}
              <span className="text-secondary">African Kids</span>{" "}
              in Diaspora
            </h1>
            
            <p 
              className={`mt-6 text-pretty text-lg text-primary-foreground/90 md:text-xl leading-relaxed transition-all duration-700 delay-200 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
            >
              One-on-one online lessons in academics, African languages, tech skills & music.
            </p>

            {/* Feature pills */}
            <div 
              className={`mt-6 flex flex-wrap gap-2 justify-center lg:justify-start transition-all duration-700 delay-300 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
            >
              {["UK", "US", "Canada", "UAE"].map((item, index) => (
                <span 
                  key={index}
                  className="bg-white/10 backdrop-blur-sm text-primary-foreground px-3 py-1 rounded-full text-sm font-medium"
                >
                  {item}
                </span>
              ))}
            </div>

            <div 
              className={`mt-8 flex flex-col gap-4 sm:flex-row sm:gap-4 justify-center lg:justify-start transition-all duration-700 delay-400 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
            >
              <Button
                onClick={() => openModal()}
                size="lg"
                className="bg-secondary hover:bg-secondary/90 text-secondary-foreground text-lg h-14 px-8 btn-playful group rounded-full shadow-lg shadow-secondary/30"
              >
                <Gift className="h-5 w-5" />
                Book Free Trial Class
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-2 border-primary-foreground/50 text-primary-foreground hover:bg-primary-foreground hover:text-primary text-lg h-14 px-8 bg-transparent rounded-full"
              >
                <a
                  href="https://wa.me/2348129517392?text=Hi%2C%20I%27d%20like%20to%20know%20more%20about%20D-lighter%20Tutor"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <MessageCircle className="h-5 w-5" />
                  Chat on WhatsApp
                </a>
              </Button>
            </div>

            {/* Trust indicators */}
            <div 
              className={`mt-8 flex flex-wrap gap-4 justify-center lg:justify-start transition-all duration-700 delay-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
            >
              {[
                "No Credit Card Required",
                "Cancel Anytime",
                "Pay in Naira",
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-2 text-primary-foreground">
                  <CheckCircle className="h-4 w-4 text-secondary" />
                  <span className="text-sm font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Hero image with floating elements */}
          <div className={`relative flex justify-center transition-all duration-1000 delay-300 ${isVisible ? "opacity-100 scale-100" : "opacity-0 scale-90"}`}>
            {/* Floating stat cards */}
            <div className="absolute -top-4 -left-4 md:left-0 bg-white dark:bg-card rounded-2xl shadow-xl p-4 animate-float z-20" style={{ animationDelay: "0s" }}>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  {/* <div className="text-2xl font-bold text-foreground">500+</div> */}
                  <div className="text-xs text-muted-foreground">Happy Learners</div>
                </div>
              </div>
            </div>

            <div className="absolute -top-4 -right-4 md:right-0 bg-white dark:bg-card rounded-2xl shadow-xl p-4 animate-float z-20" style={{ animationDelay: "1s" }}>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Globe className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">5+</div>
                  <div className="text-xs text-muted-foreground">Countries</div>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-secondary text-secondary-foreground rounded-2xl shadow-xl px-6 py-3 animate-bounce-slow z-20">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                <span className="font-semibold text-sm">98% Success Rate</span>
              </div>
            </div>

            {/* Main hero image */}
            <div className="relative h-[350px] w-[350px] md:h-[450px] md:w-[450px]">
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/30 to-accent/30 rounded-full animate-blob" />
              <img
                src="/images/heroimg.svg"
                alt="Happy children learning online"
                className="relative h-full w-full object-contain z-10 drop-shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Wave divider */}
      <div className="wave-divider">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="fill-background">
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C57.1,118.92,156.63,69.08,321.39,56.44Z" />
        </svg>
      </div>
    </section>
  )
}
