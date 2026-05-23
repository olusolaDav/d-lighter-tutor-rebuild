import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { BlogListingHero } from "@/components/blog/blog-listing-hero"
import { BlogListingContent } from "@/components/blog/blog-listing-content"
import type { Metadata } from "next"
import Script from "next/script"
import { generateBreadcrumbJsonLd, seoConfig } from "@/lib/seo"

const siteUrl = process.env.APP_URL || "https://d-lightertutor.com"

export const metadata: Metadata = {
  title: "Blog | Tutoring Tips, Parenting Advice & African Heritage | D-lighter Tutor",
  description:
    "Expert insights on online tutoring, parenting African children in the diaspora, African language learning, and academic success strategies from D-lighter Tutor.",
  keywords: [
    "tutoring blog",
    "African children education",
    "diaspora parenting",
    "online tutoring tips",
    "Yoruba lessons",
    "Igbo for kids",
    "UK tutoring",
    "African heritage",
  ],
  authors: [{ name: "D-lighter Tutor" }],
  creator: "D-lighter Tutor",
  publisher: "D-lighter Tutor",
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
  openGraph: {
    type: "website",
    locale: "en_GB",
    alternateLocale: ["en_US", "en_NG"],
    url: `${siteUrl}/blog`,
    siteName: "D-lighter Tutor",
    title: "Blog | Tutoring Tips & Parenting Advice for African Families",
    description:
      "Stay updated with expert insights on online tutoring, parenting, African language learning, and academic success from D-lighter Tutor.",
    images: [
      {
        url: `${siteUrl}/images/blog-og-image.jpg`,
        width: 1200,
        height: 630,
        alt: "D-lighter Tutor Blog",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog | Tutoring Tips & Parenting Advice for African Families",
    description:
      "Expert insights on online tutoring, parenting African children in the diaspora, and academic success.",
    images: [`${siteUrl}/images/blog-og-image.jpg`],
    creator: "@dlightertutor",
    site: "@dlightertutor",
  },
  alternates: {
    canonical: `${siteUrl}/blog`,
  },
}

export default function BlogPage() {
  const breadcrumbData = generateBreadcrumbJsonLd([
    { name: "Home", url: seoConfig.url },
    { name: "Blog", url: `${seoConfig.url}/blog` },
  ])

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <BlogListingHero />
      <BlogListingContent />
      <Footer />
      <Script
        id="blog-breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
      />
    </main>
  )
}
