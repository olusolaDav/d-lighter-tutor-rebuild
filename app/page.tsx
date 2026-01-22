import type { Metadata } from "next"
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

// Page-specific metadata that overrides/extends the root layout metadata
export const metadata: Metadata = {
  title: "D-lighter Tutor - Best Online Tutoring for Nigerian & African Children | UK, US, Canada",
  description:
    "Expert 1-on-1 online tutoring for African children aged 3-16 in diaspora. Qualified tutors for Maths, English, Science, Yoruba, Igbo, Hausa, Coding & Music. Book your FREE trial class today!",
  alternates: {
    canonical: "https://d-lightertutor.com",
  },
}

// JSON-LD structured data for the homepage (FAQPage schema)
const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How does online tutoring with D-lighter Tutor work?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Our online tutoring uses interactive video sessions where your child works one-on-one with an expert tutor. Sessions are conducted via secure video platforms with screen sharing and digital whiteboards. Simply book a session, connect at the scheduled time, and watch your child learn!",
      },
    },
    {
      "@type": "Question",
      name: "What subjects do you offer for African diaspora children?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "We offer Mathematics, English Language, Sciences (Biology, Chemistry, Physics), African Languages (Yoruba, Igbo, Hausa), French, Spanish, Coding & Tech Skills, Music (Piano, Guitar), and Exam Preparation (11+, SAT, GCSE, Nigerian exams).",
      },
    },
    {
      "@type": "Question",
      name: "What age groups do your tutors teach?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Our tutors specialize in teaching children aged 3-16, from early years foundation stage through primary and secondary school levels. We customize our approach based on each child's age and learning style.",
      },
    },
    {
      "@type": "Question",
      name: "Can my child learn African languages like Yoruba or Igbo online?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes! We specialize in teaching African languages including Yoruba, Igbo, and Hausa to children in the diaspora. Our native-speaking tutors help children connect with their cultural heritage while building fluency.",
      },
    },
    {
      "@type": "Question",
      name: "Do you offer a free trial class?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes! We offer a complimentary trial tutoring session so you can experience our teaching quality before committing. Book your free trial today and see the D-lighter difference!",
      },
    },
  ],
}

// Breadcrumb structured data for homepage
const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: "https://d-lightertutor.com",
    },
  ],
}

export default function Home() {
  return (
    <>
      {/* Page-specific JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqJsonLd),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd),
        }}
      />
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
    </>
  )
}
