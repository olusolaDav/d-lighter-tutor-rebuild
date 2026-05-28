"use client"

import { useState } from "react"
import { ChevronDown, HelpCircle, MessageCircle, Search } from "lucide-react"
import { websiteContent } from "@/content/website-content"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)
  const [searchQuery, setSearchQuery] = useState("")
  const { ref, isVisible } = useScrollAnimation()

  const openChat = () => {
    window.dispatchEvent(new CustomEvent('dlighter-open-chat'))
  }

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  const filteredFaqs = websiteContent.faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <section id="faq" className="py-20 bg-white relative overflow-hidden" ref={ref}>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section header */}
        <div
          className={`text-center mb-12 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <p className="text-secondary font-semibold text-sm uppercase tracking-wider mb-4">Got Questions?</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Frequently Asked <span className="text-secondary">Questions</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Everything you need to know about D-lighter Tutor. Can't find what you're looking for?{" "}
            <button
              type="button"
              onClick={openChat}
              className="text-secondary hover:underline font-medium"
            >
              Start a live chat!
            </button>
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
              className="w-full pl-12 pr-4 py-4 rounded-2xl border border-border bg-white focus:border-secondary focus:outline-none transition-colors text-foreground"
            />
          </div>
        </div>

        {/* FAQ accordion */}
        <div className="max-w-3xl mx-auto space-y-4">
          {filteredFaqs.map((faq, index) => (
            <div
              key={index}
              className={`border rounded-2xl overflow-hidden transition-all duration-700 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
              } ${openIndex === index ? "border-secondary shadow-md" : "border-border"}`}
              style={{ transitionDelay: `${(index + 2) * 50}ms` }}
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full flex items-center gap-4 p-5 text-left bg-white hover:bg-blue-50/50 transition-colors cursor-pointer"
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
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 bg-blue-50 border border-secondary/20 rounded-2xl px-8 py-6 shadow-sm">
            <div className="h-12 w-12 rounded-xl bg-secondary/10 flex items-center justify-center">
              <HelpCircle className="h-6 w-6 text-secondary" />
            </div>
            <div className="text-center sm:text-left">
              <p className="font-bold text-foreground text-lg">Still have questions?</p>
              <p className="text-muted-foreground">We're here to help! Chat with us anytime.</p>
            </div>
            <button
              type="button"
              onClick={openChat}
              className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20bc5a] text-white px-6 py-3 rounded-full font-semibold transition-all cursor-pointer"
            >
              <MessageCircle className="h-5 w-5" />
              Start Live Chat
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
