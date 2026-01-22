"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Star, Quote, ChevronLeft, ChevronRight, MapPin, MessageSquare } from "lucide-react"
import { useEffect, useRef, useState } from "react"

export function TestimonialsSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)

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

  const testimonials = [
    {
      text: "In maths, he can now do double-digit addition and subtraction with little or no assistance — what he could not do before. In English, he can confidently read simple words and write 2-word phrases!",
      name: "Happy Mum",
      location: "UK",
      flag: "🇬🇧",
      initials: "HM",
      highlight: "Maths & English progress",
    },
    {
      text: "The teachers are competent and skilled in dealing with children. They make sure to test my son's understanding of what has been taught. Very impressed!",
      name: "Satisfied Parent",
      location: "Canada",
      flag: "🇨🇦",
      initials: "SP",
      highlight: "Skilled teachers",
    },
    {
      text: "It's been quite a journey as a mum with a very energetic, playful son. D-Light Tutors has been amazing. My son, who had delayed speech, has improved significantly and even his nursery teachers have noticed remarkable progress.",
      name: "Grateful Mum",
      location: "USA",
      flag: "🇺🇸",
      initials: "GM",
      highlight: "Speech improvement",
    },
    {
      text: "Improved speech, mastery in numbers, phonics, and attentiveness. The tutors are patient and know how to engage young children effectively!",
      name: "Proud Parent",
      location: "UK",
      flag: "🇬🇧",
      initials: "PP",
      highlight: "Early childhood success",
    },
    {
      text: "Tamara's interest in subjects has soared. In maths and English she shows more confidence in her schoolwork. Regarding Igbo, she wants to learn more and is more interested in conversing in the language!",
      name: "Delighted Mum",
      location: "USA",
      flag: "🇺🇸",
      initials: "DM",
      highlight: "Cultural connection",
    },
  ]

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
  }

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  // Auto-advance carousel
  useEffect(() => {
    if (!isVisible) return
    const interval = setInterval(nextTestimonial, 5000)
    return () => clearInterval(interval)
  }, [isVisible])

  return (
    <section ref={sectionRef} id="testimonials" className="py-20 bg-gradient-to-b from-muted/20 to-background relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-10 left-10 h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900/20 opacity-20 animate-float" />
      <div className="absolute bottom-10 right-10 h-20 w-20 rounded-full bg-pink-100 dark:bg-pink-900/20 opacity-20 animate-float" style={{ animationDelay: "1.5s" }} />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section header */}
        <div className={`text-center mb-16 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
          <span className="inline-flex items-center gap-2 bg-secondary/10 text-secondary px-4 py-2 rounded-full mb-4">
            <MessageSquare className="h-4 w-4" />
            <span className="font-semibold text-sm">Real Stories from Real Parents</span>
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Parents <span className="text-secondary">Love</span> What We Do
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Don't just take our word for it — hear what families across the UK, US & Canada say about their experience
          </p>
        </div>

        {/* Featured testimonial carousel */}
        <div className={`max-w-4xl mx-auto mb-12 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
          <div className="relative">
            {/* Navigation buttons */}
            <button 
              onClick={prevTestimonial}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 lg:-translate-x-12 z-10 h-12 w-12 rounded-full bg-card border-2 border-secondary/20 shadow-lg flex items-center justify-center hover:border-secondary hover:scale-110 transition-all"
            >
              <ChevronLeft className="h-6 w-6 text-foreground" />
            </button>
            <button 
              onClick={nextTestimonial}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 lg:translate-x-12 z-10 h-12 w-12 rounded-full bg-card border-2 border-secondary/20 shadow-lg flex items-center justify-center hover:border-secondary hover:scale-110 transition-all"
            >
              <ChevronRight className="h-6 w-6 text-foreground" />
            </button>

            {/* Main testimonial card */}
            <Card className="child-card border-2 border-secondary/20 bg-card overflow-hidden shadow-xl">
              <CardContent className="p-8 md:p-12 relative">
                {/* Big quote decoration */}
                <Quote className="absolute top-4 left-4 h-16 w-16 text-secondary/10" />
                
                {/* Stars */}
                <div className="flex justify-center gap-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-6 w-6 fill-yellow-400 text-yellow-400 animate-sparkle" style={{ animationDelay: `${i * 0.1}s` }} />
                  ))}
                </div>

                {/* Highlight badge */}
                <div className="flex justify-center mb-6">
                  <span className="bg-secondary/10 text-secondary px-4 py-1 rounded-full text-sm font-medium">
                    {testimonials[currentIndex].highlight}
                  </span>
                </div>

                {/* Quote text */}
                <blockquote className="text-lg md:text-xl text-foreground text-center leading-relaxed mb-8 italic">
                  "{testimonials[currentIndex].text}"
                </blockquote>

                {/* Author info */}
                <div className="flex items-center justify-center gap-4">
                  <div className="h-14 w-14 rounded-full bg-gradient-to-br from-secondary to-accent flex items-center justify-center">
                    <span className="font-bold text-white text-lg">{testimonials[currentIndex].initials}</span>
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-foreground">{testimonials[currentIndex].name}</p>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <span>{testimonials[currentIndex].flag}</span>
                      {testimonials[currentIndex].location}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Carousel dots */}
            <div className="flex justify-center gap-2 mt-6">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`h-3 rounded-full transition-all duration-300 ${
                    index === currentIndex 
                      ? "w-8 bg-secondary" 
                      : "w-3 bg-secondary/30 hover:bg-secondary/50"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Mini testimonial cards */}
        <div className="grid gap-4 md:grid-cols-3 max-w-5xl mx-auto">
          {testimonials.slice(0, 3).map((testimonial, index) => (
            <div
              key={index}
              className={`transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
              style={{ transitionDelay: `${(index + 3) * 100}ms` }}
            >
              <Card 
                className={`h-full border-2 cursor-pointer transition-all duration-300 ${
                  currentIndex === index 
                    ? "border-secondary bg-secondary/5" 
                    : "border-border hover:border-secondary/50"
                }`}
                onClick={() => setCurrentIndex(index)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-3 italic">
                    "{testimonial.text.slice(0, 100)}..."
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{testimonial.flag}</span>
                    <span className="text-xs font-medium text-foreground">{testimonial.location}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* Trust indicator */}
        <div className={`mt-12 text-center transition-all duration-700 delay-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
          <div className="inline-flex items-center gap-4 bg-card border border-border rounded-full px-6 py-3">
            <div className="flex -space-x-2">
              {["🇬🇧", "🇺🇸", "🇨🇦"].map((flag, i) => (
                <div key={i} className="h-8 w-8 rounded-full bg-muted flex items-center justify-center border-2 border-background text-lg">
                  {flag}
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              Trusted by <span className="font-bold text-foreground">500+</span> families worldwide
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
