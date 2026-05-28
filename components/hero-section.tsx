"use client"

import { Button } from "@/components/ui/button"
import { MessageCircle, CheckCircle, ArrowRight } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { useBookingForm } from "@/components/booking-form-modal"
import Image from "next/image"

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const { openModal } = useBookingForm()

  const openChat = () => {
    window.dispatchEvent(new CustomEvent('dlighter-open-chat'))
  }

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-white py-16 md:py-24">
      {/* Doodle background pattern */}
      <div 
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: "url('/doodle_blue.png')",
          backgroundSize: "800px",
          backgroundRepeat: "repeat",
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Text content */}
          <div>
            {/* Badge */}
            <div 
              className={`inline-flex items-center gap-2 bg-amber-500/10 px-4 py-2 rounded-full mb-6 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"}`}
            >
              <span className="text-sm font-semibold text-amber-600 uppercase tracking-wide">D-Lighter Tutor</span>
            </div>

            <h1 
              className={`text-4xl font-extrabold tracking-tight text-foreground md:text-5xl lg:text-6xl transition-all duration-700 delay-100 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
            >
              Expert Tutors. Personalized Learning.{" "}
              <span className="text-secondary">Better Results.</span>
            </h1>
            
            <p 
              className={`mt-6 text-lg text-muted-foreground md:text-xl leading-relaxed max-w-xl transition-all duration-700 delay-200 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
            >
              Personalized one-on-one tutoring for children ages 3–16, supporting Nigerian and African families across the UK, USA, Canada, Australia, and across the diaspora.
            </p>

            <div 
              className={`mt-8 flex flex-col gap-4 sm:flex-row sm:gap-4 transition-all duration-700 delay-300 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
            >
              <Button
                onClick={() => openModal()}
                size="lg"
                className="bg-amber-500 hover:bg-amber-600 text-white text-lg h-14 px-8 rounded-full shadow-md"
              >
                Get Started
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-foreground/20 text-foreground hover:bg-muted text-lg h-14 px-8 rounded-full"
                onClick={openChat}
              >
                <span className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Live Chat
                </span>
              </Button>
            </div>

            {/* Trust indicators */}
            <div 
              className={`mt-8 flex flex-wrap gap-6 transition-all duration-700 delay-400 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
            >
              {[
                "No Credit Card Required",
                "Cancel Anytime",
                "Pay in Naira",
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-2 text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-amber-500" />
                  <span className="text-sm font-medium">{item}</span>
                </div>
              ))}
            </div>

            {/* Country pills */}
            <div 
              className={`mt-6 flex flex-wrap gap-3 transition-all duration-700 delay-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
            >
              {[
                { flag: "🇬🇧", name: "UK" },
                { flag: "🇺🇸", name: "US" },
                { flag: "🇨🇦", name: "Canada" },
                { flag: "🇦🇪", name: "UAE" },
                { flag: "🇸🇦", name: "KSA" },
              ].map((country, index) => (
                <span 
                  key={index}
                  className="inline-flex items-center gap-1.5 bg-white border border-border px-3 py-1.5 rounded-full text-sm text-foreground shadow-sm"
                >
                  <span>{country.flag}</span>
                  <span className="font-medium">{country.name}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Hero Illustration */}
          <div 
            className={`flex justify-center transition-all duration-700 delay-300 ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-12"}`}
          >
            <Image
              src="/hero_Illustrations.png"
              alt="Online tutoring illustration — tutor teaching a child through a computer"
              width={560}
              height={560}
              className="w-full max-w-lg md:max-w-none"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  )
}
