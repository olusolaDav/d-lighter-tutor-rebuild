"use client"

import { useEffect, useState } from "react"
import { BookOpen } from "lucide-react"

export function BlogListingHero() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <section className="relative overflow-hidden bg-white pt-28 pb-16">
      {/* Doodle background */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "url('/doodle_blue.png')",
          backgroundSize: "800px",
          backgroundRepeat: "repeat",
        }}
      />

      {/* Accent circles */}
      <div className="absolute -top-20 -right-20 w-72 h-72 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-20 w-60 h-60 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-3xl mx-auto">
          {/* Badge */}
          <div
            className={`inline-flex items-center gap-2 bg-secondary/10 px-5 py-2.5 rounded-full mb-6 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"}`}
          >
            <BookOpen className="w-4 h-4 text-secondary" />
            <span className="text-sm font-semibold text-secondary uppercase tracking-wide">
              Insights & Resources
            </span>
          </div>

          {/* Title */}
          <h1
            className={`text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground mb-6 transition-all duration-700 delay-100 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          >
            Our <span className="text-secondary">Blog</span>
          </h1>

          {/* Subtitle */}
          <p
            className={`text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed transition-all duration-700 delay-200 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          >
            Expert insights, tutoring tips, and resources for parents raising successful learners across the diaspora.
          </p>
        </div>
      </div>
    </section>
  )
}

