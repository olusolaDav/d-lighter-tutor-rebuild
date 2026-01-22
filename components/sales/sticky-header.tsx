"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { MessageCircle, ArrowRight } from "lucide-react"
import { WHATSAPP_URL } from "@/lib/constants/form-data"

interface StickyHeaderProps {
  onBookTrial: () => void
}

export function StickyHeader({ onBookTrial }: StickyHeaderProps) {
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrollY > 400 ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="bg-primary/95 backdrop-blur-md border-b border-primary-foreground/10 py-3 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <p className="text-primary-foreground font-medium hidden sm:block">
            Give your child the academic edge they deserve
          </p>
          <div className="flex items-center gap-2">
            <Button
              onClick={onBookTrial}
              className="bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded-full font-semibold"
            >
              Book Free Trial
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                variant="outline"
                className="border-white/50 bg-white/10 text-white hover:bg-white/20 rounded-full font-semibold"
              >
                <MessageCircle className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Chat on WhatsApp</span>
              </Button>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
