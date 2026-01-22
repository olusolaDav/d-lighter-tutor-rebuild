"use client"

import { Button } from "@/components/ui/button"
import { Gift, MessageCircle, CheckCircle } from "lucide-react"
import { TRUST_INDICATORS } from "@/lib/constants/sales-content"
import { WHATSAPP_URL } from "@/lib/constants/form-data"

interface CTAButtonsProps {
  onBookTrial: () => void
  variant?: "default" | "hero" | "final"
  showTrustIndicators?: boolean
  className?: string
}

export function CTAButtons({
  onBookTrial,
  variant = "default",
  showTrustIndicators = true,
  className = "",
}: CTAButtonsProps) {
  const isHero = variant === "hero"
  const isFinal = variant === "final"
  
  return (
    <div className={className}>
      <div className={`flex ${isHero ? "flex-col sm:flex-row" : "flex-row"} gap-${isHero ? "4" : "3"} justify-center`}>
        <Button
          onClick={onBookTrial}
          size="lg"
          className={`bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded-full font-bold shadow-lg shadow-secondary/30 hover:shadow-xl transition-all hover:-translate-y-1 ${
            isHero || isFinal
              ? "text-lg h-16 px-10"
              : "h-12 sm:h-14 px-4 sm:px-8"
          }`}
        >
          <Gift className={`mr-2 ${isHero || isFinal ? "h-6 w-6" : "h-4 w-4 sm:h-5 sm:w-5"}`} />
          {isHero ? (
            "Get Your Free Trial Class"
          ) : isFinal ? (
            "Book Your Free Trial Now"
          ) : (
            <>
              <span className="hidden sm:inline">Book Free Trial</span>
              <span className="sm:hidden">Book Free Trial</span>
            </>
          )}
        </Button>
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button
            size="lg"
            variant="outline"
            className={`rounded-full font-semibold transition-all hover:-translate-y-0.5 w-full sm:w-auto ${
              isHero
                ? "bg-transparent border-2 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 text-lg h-16 px-8"
                : isFinal
                ? "border-2 border-primary-foreground/30 bg-white/10 text-white hover:bg-white/20 text-lg h-16 px-10"
                : "border-2 h-12 sm:h-14 px-4 sm:px-8"
            }`}
          >
            <MessageCircle className={`${isHero || isFinal ? "mr-2 h-5 w-5 sm:h-6 sm:w-6" : "mr-2 h-4 w-4 sm:h-5 sm:w-5"}`} />
            {isHero || isFinal ? (
              "Chat on WhatsApp"
            ) : (
              <>
                <span className="hidden sm:inline">Chat on WhatsApp</span>
                <span className="sm:hidden">WhatsApp</span>
              </>
            )}
          </Button>
        </a>
      </div>

      {showTrustIndicators && (
        <div className={`flex flex-wrap justify-center gap-4 sm:gap-6 mt-6 text-sm ${
          isHero || isFinal ? "text-primary-foreground/80" : "text-muted-foreground"
        }`}>
          {TRUST_INDICATORS.map((indicator, i) => (
            <div key={i} className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-secondary" />
              <span>{indicator}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
