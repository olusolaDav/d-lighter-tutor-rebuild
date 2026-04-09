"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MessageCircle, Menu, GraduationCap, Gift, ArrowRight } from "lucide-react"
import Image from "next/image"
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet"
import { useBookingForm } from "@/components/booking-form-modal"

export function Header() {
  const { openModal } = useBookingForm()
  
  const navLinks = [
    { href: "#subjects", label: "Subjects" },
    { href: "#how-it-works", label: "How It Works" },
    { href: "#pricing", label: "Pricing" },
    { href: "#testimonials", label: "Reviews" },
    { href: "#faq", label: "FAQ" },
    { href: "#become-tutor", label: "Become a Tutor" },
  ]

  return (
    <header className="sticky top-0 z-50 w-full bg-white shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 group cursor-pointer">
          <div className="flex items-center gap-2">
            <Image src="/images/brand-logo.svg" alt="D-lighter Tutor Logo" width={36} height={36} className="group-hover:scale-105 transition-transform" />
            <div className="flex flex-col">
              <span className="text-lg font-bold text-foreground leading-tight">D-lighter Tutor</span>
              <span className="text-[10px] text-muted-foreground hidden sm:block">Where Learning Shines</span>
            </div>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link) => (
            <Link 
              key={link.href}
              href={link.href} 
              className="px-3 py-2 text-sm font-medium text-foreground hover:text-secondary transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Mobile menu (hamburger) */}
        <div className="lg:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <button
                aria-label="Open menu"
                className="inline-flex items-center justify-center rounded-lg p-2 text-foreground hover:bg-muted border border-border"
              >
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-secondary" /> Menu
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-2 p-4">
                {navLinks.map((link) => (
                  <Link 
                    key={link.href}
                    href={link.href} 
                    className="flex items-center gap-3 text-base font-medium text-foreground hover:text-secondary px-4 py-3 rounded-lg transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
              <SheetFooter className="mt-4">
                <div className="flex flex-col gap-3 w-full">
                  <Button onClick={() => openModal()} size="lg" className="bg-secondary hover:bg-secondary/90 text-white rounded-full w-full">
                    <Gift className="h-5 w-5 mr-2" />
                    <span>Book Free Trial</span>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="rounded-full w-full">
                    <a
                      href="https://wa.me/2348129517392"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 justify-center"
                    >
                      <MessageCircle className="h-5 w-5" />
                      <span>Chat on WhatsApp</span>
                    </a>
                  </Button>
                </div>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>

        <div className="hidden lg:flex items-center gap-3">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="text-sm font-medium"
          >
            <a
              href="https://wa.me/2348129517392"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </a>
          </Button>
          <Button onClick={() => openModal()} size="sm" className="bg-secondary hover:bg-secondary/90 text-white rounded-full px-6">
            Get Started
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </header>
  )
}
