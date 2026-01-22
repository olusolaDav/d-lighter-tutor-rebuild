"use client"

import { Button } from "@/components/ui/button"
import { MessageCircle, Sparkles, ArrowRight, CheckCircle2, Gift } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { useBookingForm } from "@/components/booking-form-modal"

export function CTASection() {
  const sectionRef = useRef<HTMLElement>(null)
  const [isVisible, setIsVisible] = useState(false)
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

  return (
    <section ref={sectionRef} className="py-20 bg-gradient-to-br from-primary via-primary to-primary/95 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 h-16 w-16 rounded-full bg-secondary/10 animate-float" />
        <div className="absolute top-20 right-20 h-12 w-12 rounded-full bg-primary-foreground/10 animate-float" style={{ animationDelay: "1s" }} />
        <div className="absolute bottom-10 left-1/4 h-14 w-14 rounded-full bg-accent/10 animate-float" style={{ animationDelay: "2s" }} />
        <div className="absolute bottom-20 right-1/4 h-10 w-10 rounded-full bg-secondary/10 animate-float" style={{ animationDelay: "1.5s" }} />
      </div>

      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-blob" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-blob" style={{ animationDelay: "3s" }} />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className={`transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"}`}>
            <span className="inline-flex items-center gap-2 bg-secondary/20 backdrop-blur-sm text-secondary-foreground px-4 py-2 rounded-full mb-6">
              <Gift className="h-4 w-4 text-secondary animate-bounce-slow" />
              <span className="text-sm font-semibold text-primary-foreground">Limited Time: First Class FREE!</span>
              <Sparkles className="h-4 w-4 text-secondary animate-sparkle" />
            </span>
          </div>

          {/* Main heading */}
          <h2 className={`text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-primary-foreground mb-6 text-balance transition-all duration-700 delay-100 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            Ready to Watch Your Child{" "}
            <span className="text-secondary">Shine</span>?
          </h2>

          <p className={`text-lg md:text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto leading-relaxed transition-all duration-700 delay-200 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            Join <span className="font-bold text-secondary">500+</span> happy families across UK, US & Canada. 
            Book your <span className="font-bold">FREE trial class</span> today — no payment required!
          </p>

          {/* Trust indicators */}
          <div className={`flex flex-wrap justify-center gap-4 mb-10 transition-all duration-700 delay-300 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            {[
              { icon: CheckCircle2, text: "No credit card required" },
              { icon: CheckCircle2, text: "Cancel anytime" },
              { icon: CheckCircle2, text: "100% satisfaction guaranteed" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-primary-foreground">
                <item.icon className="h-5 w-5 text-secondary" />
                <span className="text-sm font-medium">{item.text}</span>
              </div>
            ))}
          </div>

          {/* CTA buttons */}
          <div className={`flex flex-col sm:flex-row gap-4 justify-center items-center transition-all duration-700 delay-400 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <Button
              onClick={() => openModal()}
              size="lg"
              className="bg-secondary hover:bg-secondary/90 text-secondary-foreground text-lg h-16 px-10 btn-playful rounded-full shadow-xl shadow-secondary/30 group"
            >
              <Gift className="h-6 w-6 group-hover:animate-wiggle" />
              Book FREE Trial Class
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-2 border-primary-foreground/50 text-primary-foreground hover:bg-primary-foreground hover:text-primary text-lg h-16 px-10 bg-transparent rounded-full"
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

          {/* Bottom info */}
          <p className={`mt-10 text-sm text-primary-foreground/70 transition-all duration-700 delay-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            We respond within minutes! Available 24/7 on WhatsApp
          </p>

          {/* Countries served */}
          <div className={`mt-6 flex justify-center gap-3 text-sm text-primary-foreground/60 transition-all duration-700 delay-600 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <span>Serving families in UK, USA, Canada, UAE & KSA</span>
          </div>
        </div>
      </div>

      {/* Wave divider at top */}
      <div className="absolute top-0 left-0 right-0 overflow-hidden leading-none rotate-180">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="fill-background w-full h-12">
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C57.1,118.92,156.63,69.08,321.39,56.44Z" />
        </svg>
      </div>
    </section>
  )
}
