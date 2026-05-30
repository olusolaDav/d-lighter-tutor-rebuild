import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import Script from "next/script"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { CookieConsent } from "@/components/cookie-consent"
import { ChatWidget } from "@/components/chat-widget"
import { BookingFormProvider } from "@/components/booking-form-modal"
import "./globals.css"

// Google Analytics Measurement ID
const GA_MEASUREMENT_ID = "G-3S9ZP6ZVGP"
// Google Tag Manager ID (same container typically)
const GTM_ID = "GTM-XXXXXXX" // Replace with your actual GTM ID if different

const inter = Inter({ subsets: ["latin"], display: "swap" })

// Site configuration
const siteConfig = {
  name: "D-lighter Tutor",
  url: "https://d-lightertutor.com",
  ogImage: "/opengraph-image.png",
  description:
    "D-lighter Tutor offers expert one-on-one online tutoring for Nigerian and African children aged 3-16 living in the UK, USA, Canada, Australia & beyond. Qualified tutors for Maths, English, Science, African languages (Igbo, Yoruba, Hausa), coding, music & exam preparation. Flexible scheduling, pay-as-you-go. Book your FREE trial class today!",
  links: {
    whatsapp: "https://wa.me/2348129517392",
  },
}

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "D-lighter Tutor | Expert Online Tutoring for African Children Ages 3-16",
    template: "%s | D-lighter Tutor",
  },
  description: siteConfig.description,
  keywords: [
    // Primary keywords
    "online tutoring for African children",
    "Nigerian tutor online",
    "African diaspora education",
    "one-on-one tutoring for kids",
    "personalized tutoring ages 3-16",
    // Language-specific long-tail
    "Igbo language lessons for kids",
    "Yoruba language classes online",
    "Hausa language lessons online",
    "learn Igbo for children UK",
    "learn Yoruba for children USA",
    "African language tutoring online",
    // Curriculum-specific
    "British curriculum tutor online",
    "American curriculum tutor online",
    "Nigerian curriculum tutor",
    "IGCSE tutor online",
    "GCSE preparation tutor",
    "11 plus exam preparation tutor",
    "SAT preparation tutor online",
    "SNSA preparation Scotland",
    "NQS exam tutor",
    // Subject-specific
    "online maths tutor for kids",
    "online English tutor for children",
    "online science tutor for kids",
    "coding classes for kids online",
    "piano lessons for kids online",
    "music lessons children online",
    "phonics tutor for kids",
    "reading tutor for children",
    // Location-specific
    "kids tutoring UK",
    "kids tutoring USA",
    "kids tutoring Canada",
    "kids tutoring Australia",
    "African children tutor London",
    "Nigerian children tutor Manchester",
    "diaspora tutor Birmingham",
    // Problem-specific intent
    "child struggling in school help",
    "tutor for child falling behind",
    "homework help for African children",
    "homeschool tutoring for African families",
    "private tutor for Nigerian kids abroad",
    // Brand + feature
    "D-lighter Tutor",
    "free trial tutoring class",
    "pay-as-you-go tutoring",
    "flexible online tutoring schedule",
    "affordable online tutoring",
    "early years tutoring online",
    "reception tutoring online",
    "primary school tutoring online",
    "secondary school tutoring online",
  ],
  authors: [{ name: "D-lighter Tutor", url: siteConfig.url }],
  creator: "D-lighter Tutor",
  publisher: "D-lighter Tutor",
  generator: "Next.js",
  other: {
    "developed-by": "Alot Digital Agency",
    "agency-url": "https://agency.alotacademy.com",
    "powered-by": "Alot Digital Agency",
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_GB",
    alternateLocale: ["en_US", "en_CA", "en_AU"],
    url: siteConfig.url,
    title: "D-lighter Tutor | Expert Online Tutoring for African Children Ages 3-16",
    description: "Personalized one-on-one online tutoring for Nigerian & African children aged 3-16 in UK, USA, Canada & Australia. Expert tutors, flexible scheduling, African languages. Book your FREE trial!",
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: "D-lighter Tutor — Expert Tutors. Personalized Learning. Better Results.",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "D-lighter Tutor | Expert Online Tutoring for African Children",
    description:
      "Personalized 1-on-1 online tutoring for Nigerian & African children aged 3-16 in UK, USA, Canada & Australia. Book your FREE trial today!",
    images: [siteConfig.ogImage],
    creator: "@dlightertutor",
    site: "@dlightertutor",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/brand-logo-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/brand-logo-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/brand-logo.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/brand-logo-32x32.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      { rel: "mask-icon", url: "/safari-pinned-tab.svg", color: "#2D5F8A" },
    ],
  },
  manifest: "/manifest.webmanifest",
  verification: {
    // Add your verification codes when available
    // google: "your-google-site-verification-code",
    // yandex: "your-yandex-verification-code",
    // bing: "your-bing-verification-code",
  },
  category: "education",
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
}

// JSON-LD Structured Data for Organization
const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  "@id": `${siteConfig.url}/#organization`,
  name: siteConfig.name,
  url: siteConfig.url,
  logo: {
    "@type": "ImageObject",
    url: `${siteConfig.url}/brand-logo.png`,
    width: 512,
    height: 512,
  },
  description: siteConfig.description,
  sameAs: [siteConfig.links.whatsapp],
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+234-812-951-7392",
    contactType: "customer service",
    areaServed: ["GB", "US", "CA", "IE", "DE", "FR", "NL", "BE", "AE", "AU", "NZ", "NG", "GH", "KE"],
    availableLanguage: ["English", "Yoruba", "Igbo", "Hausa", "French"],
  },
  address: {
    "@type": "PostalAddress",
    addressCountry: "NG",
  },
}

// JSON-LD for Website with SearchAction
const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${siteConfig.url}/#website`,
  url: siteConfig.url,
  name: siteConfig.name,
  description: siteConfig.description,
  publisher: {
    "@id": `${siteConfig.url}/#organization`,
  },
  inLanguage: "en-GB",
}

// JSON-LD for Service with AggregateRating
const serviceJsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  "@id": `${siteConfig.url}/#service`,
  name: "D-lighter Tutor - Online Tutoring Services",
  description:
    "Expert personalized one-on-one online tutoring for Nigerian and African children aged 3-16. Subjects include Mathematics, English, Sciences, African Languages (Yoruba, Igbo, Hausa), Coding, Music, and exam preparation (11+, GCSE, SAT, IGCSE).",
  provider: {
    "@id": `${siteConfig.url}/#organization`,
  },
  serviceType: "Online Tutoring",
  audience: {
    "@type": "EducationalAudience",
    educationalRole: "student",
    audienceType: "Children aged 3-16",
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    bestRating: "5",
    worstRating: "1",
    ratingCount: "87",
    reviewCount: "52",
  },
  areaServed: [
    { "@type": "Country", name: "United Kingdom" },
    { "@type": "Country", name: "United States" },
    { "@type": "Country", name: "Canada" },
    { "@type": "Country", name: "Ireland" },
    { "@type": "Country", name: "Germany" },
    { "@type": "Country", name: "France" },
    { "@type": "Country", name: "Netherlands" },
    { "@type": "Country", name: "United Arab Emirates" },
    { "@type": "Country", name: "Saudi Arabia" },
    { "@type": "Country", name: "Australia" },
    { "@type": "Country", name: "New Zealand" },
    { "@type": "Country", name: "Nigeria" },
    { "@type": "Country", name: "Ghana" },
    { "@type": "Country", name: "Kenya" },
    { "@type": "Country", name: "South Africa" },
  ],
  offers: {
    "@type": "Offer",
    name: "Free Trial Class",
    description: "Book a complimentary 30-minute trial tutoring session to experience our teaching quality",
    price: "0",
    priceCurrency: "GBP",
    availability: "https://schema.org/InStock",
  },
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Tutoring Subjects",
    itemListElement: [
      { "@type": "OfferCatalog", name: "Mathematics" },
      { "@type": "OfferCatalog", name: "English Language" },
      { "@type": "OfferCatalog", name: "Sciences (Biology, Chemistry, Physics)" },
      { "@type": "OfferCatalog", name: "Yoruba Language" },
      { "@type": "OfferCatalog", name: "Igbo Language" },
      { "@type": "OfferCatalog", name: "Hausa Language" },
      { "@type": "OfferCatalog", name: "French" },
      { "@type": "OfferCatalog", name: "Spanish" },
      { "@type": "OfferCatalog", name: "Coding & Tech Skills" },
      { "@type": "OfferCatalog", name: "Music (Piano, Guitar)" },
      { "@type": "OfferCatalog", name: "Exam Preparation (11+, SAT, GCSE)" },
    ],
  },
}

// JSON-LD for FAQ Page
const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What age groups do you teach?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "We provide online tutoring for children aged 3-16, covering early years education through to GCSE/O-Level preparation. Our tutors tailor lessons to match each child's developmental stage and learning needs.",
      },
    },
    {
      "@type": "Question",
      name: "How do I book a free trial lesson?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Simply click on any 'Book a Free Trial' button on our website, and you'll be redirected to WhatsApp where our team will help you schedule a complimentary trial lesson with a tutor that matches your needs.",
      },
    },
    {
      "@type": "Question",
      name: "Can I schedule classes in my time zone?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "We work with families across UK, US, Canada, UAE, and Saudi Arabia. Our tutors are flexible and can accommodate your preferred time zone for all lessons.",
      },
    },
    {
      "@type": "Question",
      name: "What subjects do you offer?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "We offer Mathematics, English, Sciences (Biology, Chemistry, Physics), Nigerian Languages (Igbo, Yoruba), Foreign Languages (French, Spanish), Tech & Digital Skills (Coding, AI, Graphics, Animation, ICT), Music, and comprehensive exam preparation for Cambridge, SAT, WAEC, JAMB, and more.",
      },
    },
    {
      "@type": "Question",
      name: "How are tutors matched to my child?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "We carefully match tutors based on your child's learning style, subject needs, personality, and goals. You can also browse our tutor profiles and request specific tutors that align with your preferences.",
      },
    },
    {
      "@type": "Question",
      name: "Can I pay in my local currency?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes! While our prices are displayed in Naira, we accept payments in various currencies including GBP, USD, CAD, and more. Contact us via WhatsApp to discuss payment options that work best for you.",
      },
    },
    {
      "@type": "Question",
      name: "How do I track my child's progress?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "You'll receive detailed monthly progress reports that include assessment results, areas of strength, areas for improvement, and personalized recommendations. Plus, you can access lesson recordings to see your child's learning journey firsthand.",
      },
    },
    {
      "@type": "Question",
      name: "Are the tutors qualified?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes! All our tutors are highly qualified, experienced educators with relevant certifications and teaching credentials. Many are Nigerian teachers who understand both international curricula and the unique needs of diaspora children.",
      },
    },
    {
      "@type": "Question",
      name: "What platform do you use for lessons?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "We primarily use Zoom for our interactive one-on-one lessons, which provides excellent video quality, screen sharing, and recording capabilities. We'll guide you through the setup process to ensure a smooth learning experience.",
      },
    },
  ],
}

// JSON-LD for Course offerings
const courseJsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  itemListElement: [
    {
      "@type": "Course",
      position: 1,
      name: "Mathematics Tutoring for Children",
      description: "One-on-one online mathematics tutoring for children aged 3-16, covering primary and secondary school curricula including 11+, GCSE, SAT, and Cambridge preparation.",
      provider: { "@id": `${siteConfig.url}/#organization` },
      educationalLevel: "Primary and Secondary",
      inLanguage: "en",
      courseMode: "online",
    },
    {
      "@type": "Course",
      position: 2,
      name: "English Language & Literature Tutoring",
      description: "Personalized English tutoring including reading, writing, grammar, and literature for African children in the diaspora. Covers UK, US, and Cambridge curricula.",
      provider: { "@id": `${siteConfig.url}/#organization` },
      educationalLevel: "Primary and Secondary",
      inLanguage: "en",
      courseMode: "online",
    },
    {
      "@type": "Course",
      position: 3,
      name: "Yoruba Language Lessons for Diaspora Children",
      description: "Online Yoruba language tutoring to help diaspora children connect with their Nigerian heritage. Native-speaking tutors with cultural expertise.",
      provider: { "@id": `${siteConfig.url}/#organization` },
      educationalLevel: "Beginner to Advanced",
      inLanguage: "yo",
      courseMode: "online",
    },
    {
      "@type": "Course",
      position: 4,
      name: "Igbo Language Lessons for Diaspora Children",
      description: "Online Igbo language tutoring for children of Nigerian heritage living abroad. Learn to speak, read, and write Igbo with qualified native tutors.",
      provider: { "@id": `${siteConfig.url}/#organization` },
      educationalLevel: "Beginner to Advanced",
      inLanguage: "ig",
      courseMode: "online",
    },
    {
      "@type": "Course",
      position: 5,
      name: "Coding & Technology Classes for Kids",
      description: "Fun, engaging coding and digital skills tutoring for children aged 6-16. Learn Python, Scratch, web development, AI basics, and more.",
      provider: { "@id": `${siteConfig.url}/#organization` },
      educationalLevel: "Beginner to Intermediate",
      inLanguage: "en",
      courseMode: "online",
    },
    {
      "@type": "Course",
      position: 6,
      name: "Science Tutoring (Biology, Chemistry, Physics)",
      description: "Expert one-on-one science tutoring covering Biology, Chemistry, and Physics for students aged 8-16. Aligned with GCSE, IGCSE, Cambridge, and SAT curricula.",
      provider: { "@id": `${siteConfig.url}/#organization` },
      educationalLevel: "Primary and Secondary",
      inLanguage: "en",
      courseMode: "online",
    },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        {/* Google Tag Manager */}
        <Script id="gtm-script" strategy="afterInteractive">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${GTM_ID}');
          `}
        </Script>
        
        {/* Google Consent Mode v2 - Default to denied */}
        <Script id="consent-mode" strategy="beforeInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('consent', 'default', {
              'analytics_storage': 'denied',
              'ad_storage': 'denied',
              'ad_user_data': 'denied',
              'ad_personalization': 'denied',
              'functionality_storage': 'granted',
              'security_storage': 'granted',
            });
          `}
        </Script>
        
        {/* Google Analytics */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}');
          `}
        </Script>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteJsonLd),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(serviceJsonLd),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(faqJsonLd),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(courseJsonLd),
          }}
        />
      </head>
      <body className={`${inter.className} antialiased`}>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
          <BookingFormProvider>
            {children}
            <CookieConsent />
            <ChatWidget />
            <Toaster richColors position="top-center" closeButton />
            <Analytics />
          </BookingFormProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
