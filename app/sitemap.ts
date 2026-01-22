import { MetadataRoute } from "next"

const BASE_URL = "https://d-lightertutor.com"

export default function sitemap(): MetadataRoute.Sitemap {
  const currentDate = new Date().toISOString()

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/sales`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/privacy-policy`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/terms-of-service`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ]

  // Subject pages (if you add them in the future)
  const subjects = [
    "mathematics",
    "english",
    "science",
    "yoruba",
    "igbo",
    "hausa",
    "french",
    "spanish",
    "coding",
    "music",
  ]

  // Uncomment when you have subject pages
  // const subjectPages: MetadataRoute.Sitemap = subjects.map((subject) => ({
  //   url: `${BASE_URL}/subjects/${subject}`,
  //   lastModified: currentDate,
  //   changeFrequency: "monthly" as const,
  //   priority: 0.7,
  // }))

  return [
    ...staticPages,
    // ...subjectPages, // Uncomment when subject pages exist
  ]
}
