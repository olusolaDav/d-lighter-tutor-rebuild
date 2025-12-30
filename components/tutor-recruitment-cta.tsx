"use client"

import { Briefcase, GraduationCap, TrendingUp, Users, ArrowRight, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { websiteContent } from "@/content/website-content"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"

export function TutorRecruitmentCTA() {
  const { ref, isVisible } = useScrollAnimation()

  const handleApply = () => {
    window.open(
      `https://wa.me/2348030461904?text=${encodeURIComponent(
        "Hi! I'm interested in becoming a tutor at D-lighter Tutor. I'd like to learn more about the opportunity.",
      )}`,
      "_blank",
    )
  }

  const benefits = [
    {
      icon: TrendingUp,
      title: "Competitive Pay",
      description: "Earn competitive rates with flexible payment options",
    },
    {
      icon: Globe,
      title: "Work From Anywhere",
      description: "Teach students globally from the comfort of your home",
    },
    {
      icon: Users,
      title: "Growing Community",
      description: "Join a supportive network of passionate educators",
    },
    {
      icon: GraduationCap,
      title: "Professional Growth",
      description: "Access training and development opportunities",
    },
  ]

  return (
    <section id="become-tutor" className="py-20 bg-muted/30 border-y-2 border-secondary/20" ref={ref}>
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div
            className={`text-center mb-12 transition-all duration-700 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          >
            <div className="inline-flex items-center gap-2 bg-secondary/10 text-secondary px-4 py-2 rounded-full mb-4">
              <Briefcase className="h-5 w-5" />
              <span className="font-semibold">Join Our Team</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-balance">
              {websiteContent.tutorRecruitment.title}
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-balance">
              {websiteContent.tutorRecruitment.subtitle}
            </p>
          </div>

          <div
            className={`grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-10 transition-all duration-700 delay-200 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          >
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon
              return (
                <Card
                  key={index}
                  className="p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-2 hover:border-secondary/50"
                >
                  <div className="bg-secondary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-secondary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{benefit.description}</p>
                </Card>
              )
            })}
          </div>

          <div
            className={`transition-all duration-700 delay-400 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          >
            <Card className="p-8 md:p-10 bg-background border-2 border-secondary/20">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-2xl font-bold mb-4">What We're Looking For</h3>
                  <ul className="space-y-3">
                    {websiteContent.tutorRecruitment.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="bg-secondary/10 rounded-full p-1 mt-0.5">
                          <div className="bg-secondary rounded-full h-2 w-2" />
                        </div>
                        <span className="text-muted-foreground leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="text-center md:text-left">
                  <div className="bg-gradient-to-br from-secondary/10 to-primary/5 rounded-2xl p-8 mb-6">
                    <p className="text-lg font-semibold mb-2">Ready to Make a Difference?</p>
                    <p className="text-muted-foreground mb-6 leading-relaxed">
                      {websiteContent.tutorRecruitment.description}
                    </p>
                    <Button
                      size="lg"
                      onClick={handleApply}
                      className="bg-secondary text-secondary-foreground hover:bg-secondary/90 w-full group"
                    >
                      {websiteContent.tutorRecruitment.cta}
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    We'll review your application and get back to you within 48 hours
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
