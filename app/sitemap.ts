import { MetadataRoute } from "next"
import connectDB from "@/lib/mongodb"
import Position from "@/lib/models/Position"
import { listPublishedBlogs } from "@/lib/blog"

const BASE_URL = "https://d-lightertutor.com"

export const revalidate = 3600

const DYNAMIC_FETCH_TIMEOUT_MS = 8000

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Timeout after ${timeoutMs}ms`))
    }, timeoutMs)

    promise
      .then((value) => {
        clearTimeout(timer)
        resolve(value)
      })
      .catch((error) => {
        clearTimeout(timer)
        reject(error)
      })
  })
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/careers`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/careers/job-posting-guidelines`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/sales`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/privacy-policy`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/terms-of-service`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ]

  let blogPages: MetadataRoute.Sitemap = []
  let careerPages: MetadataRoute.Sitemap = []

  try {
    const [blogsResult, positionsResult] = await Promise.allSettled([
      withTimeout(listPublishedBlogs(5000, 0), DYNAMIC_FETCH_TIMEOUT_MS),
      withTimeout(
        (async () => {
          await connectDB()
          return Position.find({ isActive: true, isApproved: true })
            .select("_id updatedAt createdAt")
            .lean() as Promise<Array<{ _id: { toString(): string }; updatedAt?: Date; createdAt?: Date }>>
        })(),
        DYNAMIC_FETCH_TIMEOUT_MS
      ),
    ])

    const posts = blogsResult.status === "fulfilled" ? blogsResult.value.posts || [] : []
    const positions = positionsResult.status === "fulfilled" ? positionsResult.value || [] : []

    blogPages = posts.map((post: any) => {
      const updatedAt = post.updatedAt ? new Date(post.updatedAt) : now
      return {
        url: `${BASE_URL}/blog/${post.slug}`,
        lastModified: updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      }
    })

    careerPages = positions.map((position) => ({
      url: `${BASE_URL}/careers/${position._id.toString()}`,
      lastModified: position.updatedAt || position.createdAt || now,
      changeFrequency: "weekly" as const,
      priority: 0.75,
    }))
  } catch (error) {
    console.error("sitemap generation warning:", error)
  }

  return [...staticPages, ...blogPages, ...careerPages]
}
