"use client"

import { useCallback } from "react"
import { useBookingForm } from "@/components/booking-form-modal"
import {
  StickyHeader,
  HeroSection,
  SolutionSection,
  HowItWorksSection,
  TestimonialsSection,
  VideoSection,
  GuaranteeSection,

  FinalCTASection,
  SalesFooter,
} from "@/components/sales"

export default function SalesPage() {
  const { openModal } = useBookingForm()

  const openModalCb = useCallback(() => {
    openModal()
  }, [openModal])

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Sticky CTA Header */}
      <StickyHeader onBookTrial={openModalCb} />

      {/* Hero Section */}
      <HeroSection onBookTrial={openModalCb} />

      {/* Solution Section */}
      <SolutionSection onBookTrial={openModalCb} />

      {/* How It Works Section */}
      <HowItWorksSection onBookTrial={openModalCb} />

      {/* Testimonials Section */}
      <TestimonialsSection onBookTrial={openModalCb} />

      {/* Video Section */}
      <VideoSection onBookTrial={openModalCb} />

      {/* Guarantee Section */}
      <GuaranteeSection onBookTrial={openModalCb} />

      {/* Final CTA Section */}
      <FinalCTASection onBookTrial={openModalCb} />

      {/* Footer */}
      <SalesFooter />
    </div>
  )
}
