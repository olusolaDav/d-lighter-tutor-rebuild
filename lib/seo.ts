// Re-export from seo.config for backward compatibility
export { SITE_URL, SITE_NAME, generateBlogPostMetadata, generateBlogPostSchema, generateBreadcrumbSchema } from "./seo.config"

export const seoConfig = {
  url: process.env.APP_URL || "https://d-lightertutor.com",
  name: "D-lighter Tutor",
  description: "Expert 1-on-1 online tutoring for African children aged 3-16 in diaspora.",
}

export function generateBreadcrumbJsonLd(items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}
