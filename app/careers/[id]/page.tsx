import type { Metadata } from "next"
import connectDB from "@/lib/mongodb"
import Position from "@/lib/models/Position"
import PositionDetailsClient from "./job-details-client"
import { generateJobPostMetadata } from "@/lib/seo.config"

interface Props {
  params: Promise<{ id: string }>
}

async function getPosition(id: string) {
  try {
    await connectDB()
    const position = await Position.findOne({ _id: id, isActive: true, isApproved: true }).lean()
    return position as any
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const position = await getPosition(id)
  if (!position) {
    return {
      title: "Position Not Found | D-lighter Tutor Careers",
      description: "This position is no longer available.",
    }
  }
  return generateJobPostMetadata({
    title: position.title,
    id,
    type: position.type,
    location: position.location,
    employmentType: position.employmentType,
    description: position.description,
    subjects: position.subjects,
  })
}

export async function generateStaticParams() {
  try {
    await connectDB()
    const positions = await Position.find({ isActive: true, isApproved: true })
      .select("_id")
      .lean() as Array<{ _id: { toString(): string } }>
    return positions.map((p) => ({ id: p._id.toString() }))
  } catch {
    return []
  }
}

export default async function PositionDetailsPage({ params }: Props) {
  const { id } = await params
  return <PositionDetailsClient positionId={id} />
}
