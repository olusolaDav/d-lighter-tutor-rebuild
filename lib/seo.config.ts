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
