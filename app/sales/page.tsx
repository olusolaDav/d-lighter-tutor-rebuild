"use client"

import { useState, useCallback } from "react"
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
  SalesBookingModal,
} from "@/components/sales"

export default function SalesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const openModal = useCallback(() => {
    setIsModalOpen(true)
  }, [])

  const closeModal = useCallback(() => {
    setIsModalOpen(false)
  }, [])

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Sticky CTA Header */}
      <StickyHeader onBookTrial={openModal} />

      {/* Hero Section */}
      <HeroSection onBookTrial={openModal} />

      {/* Solution Section */}
      <SolutionSection onBookTrial={openModal} />

      {/* How It Works Section */}
      <HowItWorksSection onBookTrial={openModal} />

      {/* Testimonials Section */}
      <TestimonialsSection onBookTrial={openModal} />

      {/* Video Section */}
      <VideoSection onBookTrial={openModal} />

      {/* Guarantee Section */}
      <GuaranteeSection onBookTrial={openModal} />

    

      {/* Final CTA Section */}
      <FinalCTASection onBookTrial={openModal} />

      {/* Footer */}
      <SalesFooter />

      {/* Lead Capture Modal */}
      <SalesBookingModal isOpen={isModalOpen} onClose={closeModal} />
    </div>
  )
}
