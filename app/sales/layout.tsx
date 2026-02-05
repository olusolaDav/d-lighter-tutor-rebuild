import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Expert Online Tutoring for African Children in Diaspora | D-lighter Tutor",
  description:
    "Get personalized 1-on-1 online tutoring for Nigerian and African children aged 3-16 in UK, US, Canada & beyond. Expert tutors, flexible scheduling, African languages & culture. Book your FREE trial class today!",
  keywords: [
    "online tutoring",
    "African children tutoring",
    "Nigerian tutors",
    "diaspora education",
    "UK tutoring",
    "US tutoring",
    "Canada tutoring",
    "Yoruba lessons",
    "Igbo lessons",
    "Hausa lessons",
    "African language tutoring",
    "GCSE preparation",
    "11+ exam prep",
    "SAT preparation",
    "online math tutor",
    "online English tutor",
    "homeschool tutoring",
    "private tutor online",
  ],
  authors: [{ name: "D-lighter Tutor" }],
  creator: "D-lighter Tutor",
  publisher: "D-lighter Tutor",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://d-lightertutor.com"),
  alternates: {
    canonical: "/sales",
  },
  openGraph: {
    title: "Expert Online Tutoring for African Children in Diaspora | D-lighter Tutor",
    description:
      "Get personalized 1-on-1 online tutoring for Nigerian and African children aged 3-16. Expert tutors, flexible scheduling, African languages. Book your FREE trial!",
    url: "https://d-lightertutor.com/sales",
    siteName: "D-lighter Tutor",
    images: [
      {
        url: "/images/og-sales.png",
        width: 1200,
        height: 630,
        alt: "D-lighter Tutor - Expert Online Tutoring for African Children",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Expert Online Tutoring for African Children in Diaspora",
    description:
      "Personalized 1-on-1 online tutoring for children aged 3-16. Expert Nigerian tutors, flexible scheduling. Book your FREE trial!",
    images: ["/images/og-sales.png"],
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
  verification: {
    // Add these when you have the verification codes
    // google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
  },
}

// JSON-LD structured data for SEO
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  name: "D-lighter Tutor",
  description:
    "Expert online tutoring service for Nigerian and African children in the diaspora. We provide personalized 1-on-1 tutoring for ages 3-16.",
  url: "https://d-lightertutor.com",
  logo: "https://d-lightertutor.com/brand-logo.png",
  sameAs: [
    "https://wa.me/2348129517392",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+234-812-951-7392",
    contactType: "customer service",
    areaServed: ["GB", "US", "CA", "IE", "DE", "FR", "AE", "AU", "NZ", "NG"],
    availableLanguage: ["English", "Yoruba", "Igbo", "Hausa"],
  },
  offers: {
    "@type": "Offer",
    name: "Free Trial Class",
    description: "Book a free trial tutoring session",
    price: "0",
    priceCurrency: "GBP",
  },
  areaServed: [
    { "@type": "Country", name: "United Kingdom" },
    { "@type": "Country", name: "United States" },
    { "@type": "Country", name: "Canada" },
    { "@type": "Country", name: "Ireland" },
    { "@type": "Country", name: "Germany" },
    { "@type": "Country", name: "United Arab Emirates" },
    { "@type": "Country", name: "Australia" },
    { "@type": "Country", name: "Nigeria" },
  ],
}

export default function SalesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Meta Pixel Code */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '2353780038384290');
fbq('init', '1288454889108517');
fbq('track', 'PageView');
          `
        }}
      />
      <noscript>
        <img height="1" width="1" style={{ display: 'none' }}
        src="https://www.facebook.com/tr?id=2353780038384290&ev=PageView&noscript=1"
        />
      </noscript>
      <noscript>
        <img height="1" width="1" style={{ display: 'none' }}
        src="https://www.facebook.com/tr?id=1288454889108517&ev=PageView&noscript=1"
        />
      </noscript>
      {/* End Meta Pixel Code */}
      {children}
    </>
  )
}
