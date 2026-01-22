"use client"

import { useState } from "react"
import { ChevronDown, HelpCircle, MessageCircle, Search } from "lucide-react"
import { websiteContent } from "@/content/website-content"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)
  const [searchQuery, setSearchQuery] = useState("")
  const { ref, isVisible } = useScrollAnimation()

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  const filteredFaqs = websiteContent.faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <section id="faq" className="py-20 bg-gradient-to-b from-background to-muted/30 relative overflow-hidden" ref={ref}>
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 h-16 w-16 rounded-full bg-purple-100 dark:bg-purple-900/20 opacity-20 animate-float" />
      <div className="absolute bottom-20 right-10 h-20 w-20 rounded-full bg-yellow-100 dark:bg-yellow-900/20 opacity-20 animate-float" style={{ animationDelay: "1.5s" }} />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section header */}
        <div
          className={`text-center mb-12 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <span className="inline-flex items-center gap-2 bg-secondary/10 text-secondary px-4 py-2 rounded-full mb-4">
            <HelpCircle className="h-4 w-4" />
            <span className="font-semibold text-sm">Got Questions?</span>
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Frequently Asked <span className="text-secondary">Questions</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Everything you need to know about D-lighter Tutor. Can't find what you're looking for?{" "}
            <a 
              href="https://wa.me/2348129517392" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-secondary hover:underline font-medium"
            >
              Chat with us!
            </a>
          </p>
        </div>

        {/* Search box */}
        <div className={`max-w-xl mx-auto mb-10 transition-all duration-700 delay-100 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search for answers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-border bg-card focus:border-secondary focus:outline-none transition-colors text-foreground"
            />
          </div>
        </div>

        {/* FAQ accordion */}
        <div className="max-w-3xl mx-auto space-y-4">
          {filteredFaqs.map((faq, index) => (
            <div
              key={index}
              className={`child-card border-2 rounded-2xl overflow-hidden transition-all duration-700 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
              } ${openIndex === index ? "border-secondary shadow-lg" : "border-border"}`}
              style={{ transitionDelay: `${(index + 2) * 50}ms` }}
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full flex items-center gap-4 p-5 text-left bg-card hover:bg-accent/30 transition-colors cursor-pointer"
              >
                <span className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${openIndex === index ? "bg-secondary text-secondary-foreground scale-110" : "bg-muted text-muted-foreground"}`}>
                  {index + 1}
                </span>
                <span className="flex-1 font-semibold text-foreground pr-4">{faq.question}</span>
                <div className={`h-8 w-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                  openIndex === index ? "bg-secondary text-secondary-foreground rotate-180" : "bg-muted text-muted-foreground"
                }`}>
                  <ChevronDown className="h-5 w-5" />
                </div>
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === index ? "max-h-96" : "max-h-0"
                }`}
              >
                <div className="p-5 pt-0 text-muted-foreground leading-relaxed border-t border-border/50">
                  <div className="pt-4">{faq.answer}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Still have questions CTA */}
        <div className={`mt-12 text-center transition-all duration-700 delay-500 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}>
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 bg-card border-2 border-secondary/20 rounded-2xl px-8 py-6 shadow-lg">
            <div className="h-12 w-12 rounded-full bg-secondary/20 flex items-center justify-center">
              <HelpCircle className="h-6 w-6 text-secondary" />
            </div>
            <div className="text-center sm:text-left">
              <p className="font-bold text-foreground text-lg">Still have questions?</p>
              <p className="text-muted-foreground">We're here to help! Chat with us anytime.</p>
            </div>
            <a
              href="https://wa.me/2348129517392?text=Hi%2C%20I%20have%20a%20question%20about%20D-lighter%20Tutor"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-secondary hover:bg-secondary/90 text-secondary-foreground px-6 py-3 rounded-full font-semibold transition-all hover:scale-105"
            >
              <MessageCircle className="h-5 w-5" />
              Ask Us on WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
