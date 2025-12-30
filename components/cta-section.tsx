"use client"

import { Button } from "@/components/ui/button"
import { MessageCircle, Phone } from "lucide-react"
import { useEffect, useRef } from "react"

export function CTASection() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
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

  return (
    <section ref={sectionRef} className="py-20 bg-primary">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="scroll-animate text-3xl font-bold tracking-tight text-primary-foreground md:text-4xl mb-6 text-balance">
            {"Ready to Give Your Child the Academic Excellence They Deserve?"}
          </h2>
          <p className="scroll-animate animate-delay-100 text-lg text-primary-foreground/90 mb-10 max-w-2xl mx-auto leading-relaxed">
            {
              "Join 25+ families who trust D-lighter Tutor for quality education. Book your free 30-minute trial class today—no payment required!"
            }
          </p>

          <div className="scroll-animate animate-delay-200 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              asChild
              size="lg"
              className="bg-secondary hover:bg-secondary/90 text-secondary-foreground text-lg h-14 px-8"
            >
              <a
                href="https://wa.me/2348129517392?text=Hi%2C%20I%27d%20like%20to%20book%20a%20free%20trial%20class"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <MessageCircle className="h-5 w-5" />
                Book Free Trial on WhatsApp
              </a>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-2 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary text-lg h-14 px-8 bg-transparent"
            >
              <a href="tel:+2348129517392" className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Call: +234812 951 7392
              </a>
            </Button>
          </div>

          <p className="scroll-animate animate-delay-300 mt-8 text-sm text-primary-foreground/80">
            {"Available on WhatsApp 24/7 • Serving UK, US, Canada, UAE, and Saudi Arabia"}
          </p>
        </div>
      </div>
    </section>
  )
}
