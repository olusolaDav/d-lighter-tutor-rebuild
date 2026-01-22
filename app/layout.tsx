import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import Script from "next/script"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { CookieConsent } from "@/components/cookie-consent"
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
  ogImage: "/og-image.png", // Generated dynamically or use static image
  description:
    "Quality online tutoring for Nigerian and African children (ages 3-16) in UK, US, Canada & beyond. Expert tutors for Maths, English, Science, Nigerian languages (Igbo, Yoruba, Hausa), and more. Flexible payment options.",
  links: {
    whatsapp: "https://wa.me/2348129517392",
  },
}

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "D-lighter Tutor - Best Online Tutoring for Nigerian & African Children in Diaspora",
    template: "%s | D-lighter Tutor",
  },
  description: siteConfig.description,
  keywords: [
    "online tutoring",
    "Nigerian tutors",
    "African diaspora education",
    "Igbo lessons online",
    "Yoruba lessons online",
    "Hausa lessons online",
    "British curriculum tutoring",
    "American curriculum tutoring",
    "Nigerian curriculum tutoring",
    "one-on-one tutoring",
    "kids tutoring UK",
    "kids tutoring USA",
    "kids tutoring Canada",
    "African language classes",
    "GCSE preparation",
    "11+ exam prep",
    "SAT preparation",
    "online math tutor",
    "online English tutor",
    "online science tutor",
    "coding classes for kids",
    "music lessons online",
    "piano lessons kids",
    "homeschool tutoring",
    "private tutor online",
    "early childhood education",
    "reception tutoring",
    "primary school tutoring",
    "secondary school tutoring",
  ],
  authors: [{ name: "D-lighter Tutor", url: siteConfig.url }],
  creator: "D-lighter Tutor",
  publisher: "D-lighter Tutor",
  generator: "Powered by Alot Digital Agency",
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
    alternateLocale: ["en_US"],
    url: siteConfig.url,
    title: "D-lighter Tutor - Expert Online Tutoring for African Children in Diaspora",
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: "D-lighter Tutor - Quality Online Tutoring for Nigerian & African Children",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "D-lighter Tutor - Expert Online Tutoring for African Children",
    description:
      "Quality 1-on-1 online tutoring for Nigerian & African children aged 3-16 in UK, US, Canada. Expert tutors, flexible scheduling. Book your FREE trial!",
    images: [siteConfig.ogImage],
    creator: "@dlightertutor",
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
      { rel: "mask-icon", url: "/safari-pinned-tab.svg", color: "#7c3aed" },
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

// JSON-LD for Service
const serviceJsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  "@id": `${siteConfig.url}/#service`,
  name: "Online Tutoring Services",
  description:
    "Expert 1-on-1 online tutoring for Nigerian and African children aged 3-16. Subjects include Mathematics, English, Sciences, African Languages (Yoruba, Igbo, Hausa), Coding, and Music.",
  provider: {
    "@id": `${siteConfig.url}/#organization`,
  },
  serviceType: "Online Tutoring",
  areaServed: [
    { "@type": "Country", name: "United Kingdom" },
    { "@type": "Country", name: "United States" },
    { "@type": "Country", name: "Canada" },
    { "@type": "Country", name: "Ireland" },
    { "@type": "Country", name: "Germany" },
    { "@type": "Country", name: "France" },
    { "@type": "Country", name: "Netherlands" },
    { "@type": "Country", name: "United Arab Emirates" },
    { "@type": "Country", name: "Australia" },
    { "@type": "Country", name: "New Zealand" },
    { "@type": "Country", name: "Nigeria" },
    { "@type": "Country", name: "Ghana" },
    { "@type": "Country", name: "Kenya" },
  ],
  offers: {
    "@type": "Offer",
    name: "Free Trial Class",
    description: "Book a complimentary trial tutoring session to experience our teaching quality",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
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
        
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
          <CookieConsent />
          <Toaster richColors position="top-center" closeButton />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  )
}
