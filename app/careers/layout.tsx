import type { Metadata } from "next"
import Script from "next/script"
import { SITE_URL, SITE_NAME } from "@/lib/seo.config"
import { Header } from "@/components/header"

export const metadata: Metadata = {
  title: `Join Our Team | Careers at ${SITE_NAME}`,
  description: `Become a D-lighter Tutor or explore other open positions. Help African children in the diaspora thrive academically — on your schedule, from anywhere.`,
  openGraph: {
    title: `Careers at ${SITE_NAME} — Become a Tutor`,
    description: `We are looking for passionate tutors and talent to join the ${SITE_NAME} family. Apply today!`,
    url: `${SITE_URL}/careers`,
    siteName: SITE_NAME,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `Careers at ${SITE_NAME} — Become a Tutor`,
    description: `Join the ${SITE_NAME} team. Flexible hours, competitive pay, work from anywhere.`,
  },
}

const careersPageSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: `Careers at ${SITE_NAME}`,
  description: "Explore open positions at D-lighter Tutor. Become a tutor and help students excel.",
  url: `${SITE_URL}/careers`,
  isPartOf: { "@type": "WebSite", url: SITE_URL, name: SITE_NAME },
  breadcrumb: {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Careers", item: `${SITE_URL}/careers` },
    ],
  },
}

export default function CareersLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Header />
      <Script
        id="careers-page-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(careersPageSchema) }}
      />
      {children}
    </>
  )
}
