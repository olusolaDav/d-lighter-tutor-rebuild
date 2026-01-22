"use client"

import { ChevronLeft, ChevronRight, MessageSquare } from "lucide-react"
import Image from "next/image"
import { useEffect, useRef, useState } from "react"

// Review images from real parents
const REVIEW_IMAGES = [
  "/images/review-r1.png",
  "/images/review-r2.png",
  "/images/review-r3.png",
  "/images/review-r4.png",
  "/images/review-r5.png",
  "/images/review-r6.png",
] as const

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

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % REVIEW_IMAGES.length)
  }

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + REVIEW_IMAGES.length) % REVIEW_IMAGES.length)
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
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 lg:-translate-x-12 z-10 h-12 w-12 rounded-full bg-card border-2 border-secondary/20 shadow-lg flex items-center justify-center hover:border-secondary hover:scale-110 transition-all cursor-pointer"
              aria-label="Previous review"
            >
              <ChevronLeft className="h-6 w-6 text-foreground" />
            </button>
            <button 
              onClick={nextTestimonial}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 lg:translate-x-12 z-10 h-12 w-12 rounded-full bg-card border-2 border-secondary/20 shadow-lg flex items-center justify-center hover:border-secondary hover:scale-110 transition-all cursor-pointer"
              aria-label="Next review"
            >
              <ChevronRight className="h-6 w-6 text-foreground" />
            </button>

            {/* Main review image */}
            <div className="relative overflow-hidden rounded-2xl border-2 border-secondary/20 shadow-xl bg-card">
              <Image
                src={REVIEW_IMAGES[currentIndex]}
                alt={`Parent review ${currentIndex + 1}`}
                width={800}
                height={600}
                className="w-full h-auto object-contain"
                priority={currentIndex === 0}
              />
            </div>

            {/* Carousel dots */}
            <div className="flex justify-center gap-2 mt-6">
              {REVIEW_IMAGES.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  aria-label={`Go to review ${index + 1}`}
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

        {/* Mini review image cards */}
        <div className="grid gap-4 grid-cols-2 md:grid-cols-3 max-w-5xl mx-auto">
          {REVIEW_IMAGES.map((src, index) => (
            <div
              key={index}
              className={`transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
              style={{ transitionDelay: `${(index + 3) * 100}ms` }}
            >
              <button
                onClick={() => setCurrentIndex(index)}
                className={`relative w-full overflow-hidden rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                  currentIndex === index 
                    ? "border-secondary ring-2 ring-secondary/30 scale-[1.02]" 
                    : "border-border hover:border-secondary/50 hover:scale-[1.02]"
                }`}
              >
                <Image
                  src={src}
                  alt={`Parent review thumbnail ${index + 1}`}
                  width={400}
                  height={300}
                  className="w-full h-auto object-cover"
                  loading="lazy"
                />
                {currentIndex === index && (
                  <div className="absolute inset-0 bg-secondary/10 pointer-events-none" />
                )}
              </button>
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
              Trusted by <span className="font-bold text-foreground">5  0+</span> families worldwide
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
