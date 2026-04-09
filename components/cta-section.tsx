"use client"

import { Button } from "@/components/ui/button"
import { MessageCircle, ArrowRight, CheckCircle2, Gift } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { useBookingForm } from "@/components/booking-form-modal"
import { WHATSAPP_URL } from "@/lib/constants/form-data"

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
    <section ref={sectionRef} className="py-20 bg-gradient-to-b from-blue-50/60 to-white">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto bg-secondary rounded-3xl px-8 py-16 md:px-16 text-center">
          {/* Badge */}
          <div className={`transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"}`}>
            <span className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full mb-6">
              <Gift className="h-4 w-4 text-white" />
              <span className="text-sm font-semibold text-white">Limited Time: First Class FREE!</span>
            </span>
          </div>

          {/* Main heading */}
          <h2 className={`text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-6 text-balance transition-all duration-700 delay-100 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            Ready to Watch Your Child Shine?
          </h2>

          <p className={`text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed transition-all duration-700 delay-200 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            Join <span className="font-bold">500+</span> happy families across UK, US & Canada. 
            Book your <span className="font-bold">FREE trial class</span> today — no payment required!
          </p>

          {/* Trust indicators */}
          <div className={`flex flex-wrap justify-center gap-4 mb-10 transition-all duration-700 delay-300 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            {[
              { icon: CheckCircle2, text: "No credit card required" },
              { icon: CheckCircle2, text: "Cancel anytime" },
              { icon: CheckCircle2, text: "100% satisfaction guaranteed" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-white/90">
                <item.icon className="h-5 w-5 text-white" />
                <span className="text-sm font-medium">{item.text}</span>
              </div>
            ))}
          </div>

          {/* CTA buttons */}
          <div className={`flex flex-col sm:flex-row gap-4 justify-center items-center transition-all duration-700 delay-400 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <Button
              onClick={() => openModal()}
              size="lg"
              className="bg-amber-500 text-white hover:bg-amber-600 text-lg h-14 px-10 rounded-full shadow-md font-semibold"
            >
              Book FREE Trial Class
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-2 border-white/50 text-white hover:bg-white hover:text-secondary text-lg h-14 px-10 bg-transparent rounded-full"
            >
              <a
                href={WHATSAPP_URL}
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
          <p className={`mt-8 text-sm text-white/70 transition-all duration-700 delay-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            We respond within minutes! Available 24/7 on WhatsApp
          </p>
        </div>
      </div>
    </section>
  )
}
