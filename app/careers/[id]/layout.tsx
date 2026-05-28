import type { Metadata } from "next"
import type React from "react"
import connectDB from "@/lib/mongodb"
import Position from "@/lib/models/Position"
import { generateJobPostMetadata, generateBreadcrumbSchema } from "@/lib/seo.config"
import Script from "next/script"

interface LayoutProps {
  children: React.ReactNode
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  try {
    const { id } = await params
    await connectDB()

    const position = await Position.findById(id).lean() as any

    if (!position) {
      return {
        title: "Position Not Found | D-lighter Tutor Careers",
        description: "The position you're looking for doesn't exist or has been removed.",
      }
    }

    return generateJobPostMetadata({
      title: position.title,
      id: position._id.toString(),
      type: position.type,
      location: position.location,
      employmentType: position.employmentType,
      description: position.description?.substring(0, 200),
      subjects: position.subjects,
    })
  } catch (error) {
    console.error("Error generating job metadata:", error)
    return {
      title: "Job Opening",
      description: "View position details and apply at D-lighter Tutor.",
    }
  }
}

export async function generateStaticParams() {
  try {
    await connectDB()
    const positions = await Position.find({ isActive: true, isApproved: true })
      .select("_id")
      .lean() as Array<{ _id: any }>
    return positions.map((p) => ({ id: p._id.toString() }))
  } catch {
    return []
  }
}

export default async function PositionDetailLayout({ children, params }: LayoutProps) {
  let breadcrumbSchema = null

  try {
    const { id } = await params
    await connectDB()
    const position = await Position.findById(id).lean() as any

    if (position) {
      breadcrumbSchema = generateBreadcrumbSchema([
        { name: 'Home', path: '/' },
        { name: 'Careers', path: '/careers' },
        { name: position.title, path: `/careers/${id}` },
      ])
    }
  } catch (error) {
    console.error("Error generating position schema:", error)
  }

  return (
    <>
      {breadcrumbSchema && (
        <Script
          id="position-breadcrumb-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
      )}
      {children}
    </>
  )
}
