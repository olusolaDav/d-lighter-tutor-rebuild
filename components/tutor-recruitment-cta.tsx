"use client"

import { ArrowRight, TrendingUp, Globe, Clock, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const BECOME_TUTOR_URL = "/careers/6a16f7e798abdbb392cc216b"

export function TutorRecruitmentCTA() {
  const perks = [
    { icon: TrendingUp, label: "Competitive Pay" },
    { icon: Globe, label: "Work Remotely" },
    { icon: Clock, label: "Flexible Hours" },
    { icon: Users, label: "50+ Tutors Team" },
  ]

  return (
    <section id="become-tutor" className="py-16 bg-blue-50/60 border-t border-blue-100">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Main row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-8 text-center sm:text-left">
            <div>
              <p className="text-xs font-semibold text-secondary uppercase tracking-wider mb-1">Join Our Team</p>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                Become a <span className="text-secondary">D-lighter Tutor</span>
              </h2>
              <p className="text-sm text-muted-foreground mt-1.5 max-w-md">
                Help African children in diaspora thrive academically — on your schedule, from anywhere.
              </p>
            </div>
            <Link href={BECOME_TUTOR_URL} className="flex-shrink-0">
              <Button
                size="lg"
                className="bg-secondary text-white hover:bg-secondary/90 rounded-full shadow-sm gap-2 whitespace-nowrap cursor-pointer"
              >
                Apply Now
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          {/* Perk chips */}
          <div className="flex flex-wrap justify-center sm:justify-start gap-3">
            {perks.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-2 bg-white border border-blue-100 rounded-full px-4 py-2 text-sm text-foreground shadow-sm"
              >
                <Icon className="h-4 w-4 text-secondary" />
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
