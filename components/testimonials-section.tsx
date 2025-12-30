"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Star, Quote } from "lucide-react"
import { useEffect, useRef } from "react"

export function TestimonialsSection() {
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

  const testimonials = [
    {
      text: "In maths, he can now do double-digit addition and subtraction with little or no assistance — what he could not do before. In English, he can confidently read simple words and write 2-word phrases. He has also improved in comprehension.",
    },
    {
      text: "The teachers are competent and skilled in dealing with children. They make sure to test my son's understanding of what has been taught.",
    },
    {
      text: "It's been quite a journey as a mum with a very energetic, playful son. D-Light Tutors has been amazing. My son, who had delayed speech, has improved significantly and even his nursery teachers have noticed remarkable progress.",
    },
    {
      text: "Improved speech, mastery in numbers, phonics, and attentiveness.",
    },
    {
      text: "Tamara's interest in subjects has soared. In maths and English she shows more confidence in her schoolwork and remembers tips from her tutors. Regarding Igbo, she wants to learn more and is more interested in conversing in the language.",
    },
  ]

  return (
    <section ref={sectionRef} id="testimonials" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="scroll-animate text-3xl font-bold tracking-tight text-foreground md:text-4xl mb-4">
            {"What Parents Are Saying"}
          </h2>
          <p className="scroll-animate animate-delay-100 text-lg text-muted-foreground max-w-2xl mx-auto">
            {"Join hundreds of satisfied Nigerian families across UK, US, and Canada"}
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              className={`scroll-animate animate-delay-${index * 100} border-2 hover:border-secondary transition-all relative`}
            >
              <CardContent className="p-6">
                <Quote className="h-8 w-8 text-secondary/20 mb-4" />
                <p className="text-sm text-foreground leading-relaxed mb-0 italic">{`"${testimonial.text}"`}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
