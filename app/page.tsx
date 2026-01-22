import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { StatsSection } from "@/components/stats-section"
import { SubjectsSection } from "@/components/subjects-section"
import { HowItWorksSection } from "@/components/how-it-works-section"
import { WhyChooseSection } from "@/components/why-choose-section"
import { PricingSection } from "@/components/pricing-section"
import { TestimonialsSection } from "@/components/testimonials-section"
import { FAQSection } from "@/components/faq-section"
//import { BlogSection } from "@/components/blog-section"
import { TutorRecruitmentCTA } from "@/components/tutor-recruitment-cta"
import { CTASection } from "@/components/cta-section"
import { Footer } from "@/components/footer"
import { BookingFormProvider } from "@/components/booking-form-modal"

export default function Home() {
  return (
    <BookingFormProvider>
      <main className="min-h-screen">
        <Header />
        <HeroSection />
        <StatsSection />
        <SubjectsSection />
        <HowItWorksSection />
        <WhyChooseSection />
        <PricingSection />
        <TestimonialsSection />
        <FAQSection />
        {/* <BlogSection /> */}
        <TutorRecruitmentCTA />
        <CTASection />
        <Footer />
      </main>
    </BookingFormProvider>
  )
}
