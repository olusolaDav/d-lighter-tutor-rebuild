import type { Metadata } from "next"

export const SITE_URL = process.env.APP_URL || "https://d-lightertutor.com"
export const SITE_NAME = "D-lighter Tutor"

interface BlogPostMetaOptions {
  title: string
  slug: string
  excerpt?: string
  description?: string
  thumbnail?: string
  authorName?: string
  tags?: string[]
  category?: string
  publishedAt?: string
  updatedAt?: string
}

export function generateBlogPostMetadata(opts: BlogPostMetaOptions): Metadata {
  const {
    title,
    slug,
    excerpt,
    description,
    thumbnail,
    authorName = SITE_NAME,
    tags = [],
    publishedAt,
    updatedAt,
  } = opts

  const metaDescription = excerpt || description || `Read "${title}" on the ${SITE_NAME} blog.`
  const imageUrl = thumbnail || `${SITE_URL}/images/blog-og-image.jpg`
  const postUrl = `${SITE_URL}/blog/${slug}`

  return {
    title: `${title} | ${SITE_NAME} Blog`,
    description: metaDescription,
    keywords: tags,
    authors: [{ name: authorName }],
    creator: authorName,
    publisher: SITE_NAME,
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
      type: "article",
      locale: "en_NG",
      alternateLocale: ["en_US", "en_GB"],
      url: postUrl,
      siteName: SITE_NAME,
      title,
      description: metaDescription,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      ...(publishedAt && { publishedTime: publishedAt }),
      ...(updatedAt && { modifiedTime: updatedAt }),
      authors: [authorName],
      tags,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: metaDescription,
      images: [imageUrl],
      creator: "@dlightertutor",
      site: "@dlightertutor",
    },
    alternates: {
      canonical: postUrl,
    },
  }
}

export function generateBlogPostSchema(opts: BlogPostMetaOptions) {
  const {
    title,
    slug,
    excerpt,
    description,
    thumbnail,
    authorName = SITE_NAME,
    tags = [],
    publishedAt,
    updatedAt,
  } = opts

  const metaDescription = excerpt || description || ""
  const imageUrl = thumbnail || `${SITE_URL}/images/blog-og-image.jpg`
  const postUrl = `${SITE_URL}/blog/${slug}`

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description: metaDescription,
    image: imageUrl,
    url: postUrl,
    datePublished: publishedAt,
    dateModified: updatedAt || publishedAt,
    author: {
      "@type": "Person",
      name: authorName,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/alot-blue.svg`,
      },
    },
    keywords: tags.join(", "),
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": postUrl,
    },
  }
}

export function generateBreadcrumbSchema(items: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  }
}

// ─── Careers / Positions ────────────────────────────────────────────────────

export const pageMetadata = {
  careers: {
    title: `Open Positions | Join the ${SITE_NAME} Team`,
    description: `Explore opportunities to join ${SITE_NAME}. We are looking for passionate tutors and other talent to help African children in diaspora thrive academically.`,
    openGraph: {
      title: `Careers at ${SITE_NAME} — Open Positions`,
      description: `Become a tutor or join our team at ${SITE_NAME}. Apply today!`,
      url: `${SITE_URL}/careers`,
    },
  },
}

interface PositionMetaOptions {
  title: string
  id: string
  type?: string
  location?: { type?: string; city?: string; country?: string }
  employmentType?: string
  description?: string
  subjects?: string[]
}

export function generateJobPostMetadata(opts: PositionMetaOptions): import("next").Metadata {
  const { title, id, type, location, employmentType, description, subjects } = opts
  const locationStr =
    location?.type === 'remote'
      ? 'Remote'
      : [location?.city, location?.country].filter(Boolean).join(', ') || 'Nigeria'
  const metaDescription =
    description?.substring(0, 160) ||
    `Apply for the ${title} position at ${SITE_NAME}. ${subjects?.length ? `Subjects: ${subjects.slice(0, 3).join(', ')}.` : ''}`
  const positionUrl = `${SITE_URL}/careers/${id}`

  return {
    title: `${title} | Careers at ${SITE_NAME}`,
    description: metaDescription,
    openGraph: {
      type: "article",
      url: positionUrl,
      siteName: SITE_NAME,
      title: `${title} — ${SITE_NAME}`,
      description: metaDescription,
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} — ${SITE_NAME}`,
      description: metaDescription,
    },
  }
}

export function generateJobPostSchema(opts: {
  title: string
  id: string
  location?: { type?: string; city?: string; country?: string }
  compensation?: { min?: number; max?: number; currency?: string; type?: string }
  employmentType?: string
  description?: string
  applicationDeadline?: string
  createdAt?: string
  subjects?: string[]
}) {
  const {
    title,
    id,
    location,
    compensation,
    employmentType,
    description,
    applicationDeadline,
    createdAt,
  } = opts

  const employmentTypeMap: Record<string, string> = {
    'full-time': 'FULL_TIME',
    'part-time': 'PART_TIME',
    'contract': 'CONTRACTOR',
    'freelance': 'CONTRACTOR',
  }

  const schema: Record<string, any> = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title,
    description,
    identifier: {
      "@type": "PropertyValue",
      name: SITE_NAME,
      value: id,
    },
    hiringOrganization: {
      "@type": "Organization",
      name: SITE_NAME,
      sameAs: SITE_URL,
    },
    jobLocation:
      location?.type === 'remote'
        ? { "@type": "Place", address: { "@type": "PostalAddress", addressCountry: "NG" } }
        : {
            "@type": "Place",
            address: {
              "@type": "PostalAddress",
              addressLocality: location?.city,
              addressCountry: location?.country || "NG",
            },
          },
    jobLocationType: location?.type === 'remote' ? "TELECOMMUTE" : undefined,
    employmentType: employmentType ? employmentTypeMap[employmentType] || employmentType.toUpperCase() : undefined,
    datePosted: createdAt,
    validThrough: applicationDeadline,
    url: `${SITE_URL}/careers/${id}`,
  }

  if (compensation?.min && compensation?.max) {
    schema.baseSalary = {
      "@type": "MonetaryAmount",
      currency: compensation.currency || "NGN",
      value: {
        "@type": "QuantitativeValue",
        minValue: compensation.min,
        maxValue: compensation.max,
        unitText: compensation.type?.toUpperCase() || "MONTH",
      },
    }
  }

  return schema
}
