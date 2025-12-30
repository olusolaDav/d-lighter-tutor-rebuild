"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MessageCircle, Search, Calendar, VideoIcon, BarChart, MessageSquare } from "lucide-react"
import { useEffect, useRef } from "react"

export function HowItWorksSection() {
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

  const steps = [
    {
      icon: MessageSquare,
      step: "1",
      title: "Chat With Us on WhatsApp",
      description:
        "Tell us about your child's age, subjects, learning needs, and preferred schedule. We respond instantly.",
    },
    {
      icon: Search,
      step: "2",
      title: "We Match You With the Perfect Tutor",
      description: "Our team selects a qualified tutor who specializes in your child's curriculum and learning style.",
    },
    {
      icon: Calendar,
      step: "3",
      title: "Book Your Free Trial Class",
      description: "Schedule a 30-minute trial lesson at your convenience. No payment required upfront.",
    },
    {
      icon: VideoIcon,
      step: "4",
      title: "Start One-on-One Learning",
      description: "Your child begins personalized lessons via video call. Flexible scheduling that fits your family.",
    },
    {
      icon: BarChart,
      step: "5",
      title: "Track Progress Monthly",
      description: "Receive comprehensive monthly reports showing your child's improvement and achievements.",
    },
  ]

  return (
    <section ref={sectionRef} id="how-it-works" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="scroll-animate text-3xl font-bold tracking-tight text-foreground md:text-4xl mb-4">
            {"Simple Steps to Academic Success"}
          </h2>
          <p className="scroll-animate animate-delay-100 text-lg text-muted-foreground max-w-2xl mx-auto">
            {"Getting started is easy. We handle everything so you can focus on your child's progress."}
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto mb-12">
          {steps.map((item, index) => (
            <Card
              key={index}
              className={`scroll-animate animate-delay-${Math.min(index * 100, 400)} relative border-2 hover:border-secondary transition-all`}
            >
              <CardContent className="p-6">
                <div className="absolute -top-4 -left-4 flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-secondary-foreground text-xl font-bold shadow-lg">
                  {item.step}
                </div>
                <div className="mb-4 mt-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center scroll-animate animate-delay-400">
          <Button
            asChild
            size="lg"
            className="bg-secondary hover:bg-secondary/90 text-secondary-foreground text-lg h-14 px-8"
          >
            <a
              href="https://wa.me/2348129517392?text=Hi%2C%20I%27d%20like%20to%20learn%20more%20about%20D-lighter%20Tutor"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              <MessageCircle className="h-5 w-5" />
              Start Your Free Trial Now
            </a>
          </Button>
        </div>
      </div>
    </section>
  )
}
