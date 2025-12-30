"use client"

import { Button } from "@/components/ui/button"
import { MessageCircle, CheckCircle } from "lucide-react"
import { useEffect, useRef } from "react"

export function HeroSection() {
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
    <section ref={sectionRef} className="relative overflow-hidden bg-primary py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="text-center lg:text-left">
            <h1 className="scroll-animate text-balance text-4xl font-bold tracking-tight text-primary-foreground md:text-5xl lg:text-6xl">
             Trusted Online Tutoring for African Children in the Diaspora
            </h1>
            <p className="scroll-animate animate-delay-100 mt-6 text-pretty text-lg text-primary-foreground/90 md:text-xl leading-relaxed">
              {
                "Personalized online lessons delivered by expert tutors, helping African children worldwide excel academically, master languages, build IT skills, and develop musical talent, all from the comfort of home."
              }
            </p>

            <div className="scroll-animate animate-delay-200 mt-8 flex flex-col gap-4 sm:flex-row sm:gap-6 justify-center lg:justify-start">
              <Button
                asChild
                size="lg"
                className="bg-secondary hover:bg-secondary/90 text-secondary-foreground text-lg h-14 px-8"
              >
                <a
                  href="https://wa.me/2348129517392?text=Hi%2C%20I%27d%20like%20to%20book%20a%20free%20trial%20class%20for%20my%20child"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <MessageCircle className="h-5 w-5" />
                  Book Free Trial Class
                </a>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-2 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary text-lg h-14 px-8 bg-transparent"
              >
                <a href="#how-it-works">See How It Works</a>
              </Button>
            </div>

            <div className="scroll-animate animate-delay-300 mt-10 flex flex-col gap-3 sm:flex-row sm:gap-8">
              <div className="flex items-center gap-2 text-primary-foreground">
                <CheckCircle className="h-5 w-5 text-secondary" />
                <span className="text-sm font-medium">{"30-min Free Weekly Class"}</span>
              </div>
              <div className="flex items-center gap-2 text-primary-foreground">
                <CheckCircle className="h-5 w-5 text-secondary" />
                <span className="text-sm font-medium">Flexible Payment in Naira</span>
              </div>
              <div className="flex items-center gap-2 text-primary-foreground">
                <CheckCircle className="h-5 w-5 text-secondary" />
                <span className="text-sm font-medium">Monthly Progress Reports</span>
              </div>
            </div>
          </div>

          <div className="scroll-animate animate-delay-400 relative flex justify-center">
            <div className="relative h-[400px] w-[400px] rounded-full">
              <img
                src="/images/heroimg.svg"
                alt="Students learning together"
                className="h-full w-full object-contain"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
