import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Book Expert Online Tutoring for Your Child | Free Trial | D-lighter Tutor",
  description:
    "Give your child the academic edge with personalized 1-on-1 online tutoring. Expert Nigerian tutors for children ages 3-16 in UK, US, Canada, UAE & Africa. Maths, English, Science, Yoruba, Igbo, Hausa, Coding & Music. Flexible scheduling. Book your FREE trial class today!",
  keywords: [
    "online tutoring for African children",
    "Nigerian children online tutor",
    "best online tutor for my child UK",
    "online maths tutor for kids",
    "online English tutor for children",
    "Yoruba tutor for kids abroad",
    "Igbo language lessons online for children",
    "Hausa tutor online diaspora",
    "hire online tutor for my child",
    "book free trial tutoring session",
    "private tutor online for primary school",
    "GCSE tutoring online African students",
    "11+ exam preparation tutor online",
    "SAT prep tutor for African children",
    "Cambridge IGCSE tutor online",
    "personalised tutoring for kids UK",
    "affordable online tutoring Nigeria",
    "best online tutor for Nigerian kids in Canada",
    "homeschool tutor for African children",
    "online coding classes for kids Africa",
    "online science tutor for secondary school",
    "diaspora Nigerian education tutoring",
    "after school tutoring online",
    "online piano lessons for children",
    "learn Yoruba online for kids",
    "learn Igbo online for diaspora children",
    "flexible online tutoring for busy parents",
    "qualified Nigerian tutors online",
    "online tutor ages 3 to 16",
    "best tutoring service for African diaspora",
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
    title: "Book Expert Online Tutoring for Your Child | Free Trial | D-lighter Tutor",
    description:
      "Give your child personalized 1-on-1 online tutoring with expert Nigerian tutors. Ages 3-16 in UK, US, Canada & beyond. Maths, English, Science, African Languages, Coding. Book your FREE trial!",
    url: "https://d-lightertutor.com/sales",
    siteName: "D-lighter Tutor",
    images: [
      {
        url: "/images/og-sales.png",
        width: 1200,
        height: 630,
        alt: "D-lighter Tutor - Expert Tutors. Personalized Learning. Better Results for African Children Ages 3-16",
      },
    ],
    locale: "en_GB",
    alternateLocale: ["en_US", "en_CA", "en_AU"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@dlightertutor",
    title: "Book Expert Online Tutoring for Your Child | Free Trial",
    description:
      "Personalized 1-on-1 online tutoring for African children aged 3-16. Expert Nigerian tutors, Maths, English, Science, Yoruba, Igbo, Coding. Book your FREE trial!",
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
    "Expert personalized online tutoring for Nigerian and African children aged 3-16 in the diaspora. One-on-one lessons in Mathematics, English, Science, Yoruba, Igbo, Hausa, Coding, and Music with qualified Nigerian tutors.",
  url: "https://d-lightertutor.com",
  logo: "https://d-lightertutor.com/brand-logo.png",
  sameAs: [
    "https://wa.me/2348129517392",
    "https://web.facebook.com/dlightertutor",
    "https://www.instagram.com/dlightertutor/",
    "https://www.linkedin.com/company/dlightertutor",
    "https://www.youtube.com/@dlightertutor/",
    "https://www.tiktok.com/@dlightertutor/",
    "https://medium.com/@dlightertutor",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+234-812-951-7392",
    contactType: "customer service",
    areaServed: ["GB", "US", "CA", "IE", "DE", "FR", "NL", "AE", "SA", "AU", "NZ", "NG", "GH", "KE", "ZA"],
    availableLanguage: ["English", "Yoruba", "Igbo", "Hausa"],
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    bestRating: "5",
    worstRating: "1",
    ratingCount: "87",
    reviewCount: "52",
  },
  offers: {
    "@type": "Offer",
    name: "Free Trial Class",
    description: "Book a complimentary 30-minute trial tutoring session to experience our teaching quality",
    price: "0",
    priceCurrency: "GBP",
    availability: "https://schema.org/InStock",
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
fbq('init', '1213482960888906');
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
        src="https://www.facebook.com/tr?id=1213482960888906&ev=PageView&noscript=1"
        />
      </noscript>
      {/* End Meta Pixel Code */}

      {/* TikTok Pixel Code Start */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
!function (w, d, t) {
  w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};n=document.createElement("script");n.type="text/javascript",n.async=!0,n.src=r+"?sdkid="+e+"&lib="+t;e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};
  ttq.load('D6KLCCBC77U5VG9U2SN0');
  ttq.page();
}(window, document, 'ttq');
          `
        }}
      />
      {/* TikTok Pixel Code End */}

      {children}
    </>
  )
}
