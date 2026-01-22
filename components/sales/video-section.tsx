import { Play } from "lucide-react"
import { YOUTUBE_EMBED_URL } from "@/lib/constants/sales-content"
import { CTAButtons } from "./cta-buttons"

interface VideoSectionProps {
  onBookTrial: () => void
}

export function VideoSection({ onBookTrial }: VideoSectionProps) {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-secondary/10 px-4 py-2 rounded-full mb-4">
              <Play className="h-4 w-4 text-secondary" aria-hidden="true" />
              <span className="text-sm font-semibold text-secondary">See Us In Action</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Watch a <span className="text-secondary">Live Class</span> in Action
            </h2>
            <p className="text-lg text-muted-foreground">
              Experience how our tutors engage and inspire students
            </p>
          </div>

          {/* Video Embed */}
          <div className="relative aspect-video rounded-2xl overflow-hidden bg-card border shadow-2xl">
            <iframe
              src={YOUTUBE_EMBED_URL}
              title="D-lighter Tutor Class Session - Watch how our expert tutors engage students in interactive online lessons"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
              loading="lazy"
            />
          </div>

          <CTAButtons onBookTrial={onBookTrial} className="mt-12" />
        </div>
      </div>
    </section>
  )
}
