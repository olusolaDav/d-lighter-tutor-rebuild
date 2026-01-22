"use client"

import { Briefcase, GraduationCap, TrendingUp, Users, ArrowRight, Globe, Clock, Heart, CheckCircle } from "lucide-react"
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
      description: "Earn great rates with flexible payment options",
      color: "from-green-400 to-emerald-500",
    },
    {
      icon: Globe,
      title: "Work Anywhere",
      description: "Teach from the comfort of your home",
      color: "from-blue-400 to-indigo-500",
    },
    {
      icon: Users,
      title: "Amazing Community",
      description: "Join passionate educators worldwide",
      color: "from-purple-400 to-violet-500",
    },
    {
      icon: GraduationCap,
      title: "Grow Your Skills",
      description: "Access training & development",
      color: "from-orange-400 to-amber-500",
    },
  ]

  return (
    <section id="become-tutor" className="py-20 bg-gradient-to-b from-muted/30 to-background relative overflow-hidden" ref={ref}>
      {/* Decorative elements */}
      <div className="absolute top-10 right-10 h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900/20 opacity-20 animate-float" />
      <div className="absolute bottom-20 left-10 h-20 w-20 rounded-full bg-purple-100 dark:bg-purple-900/20 opacity-20 animate-float" style={{ animationDelay: "1.5s" }} />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Section header */}
          <div
            className={`text-center mb-12 transition-all duration-700 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          >
            <span className="inline-flex items-center gap-2 bg-secondary/10 text-secondary px-4 py-2 rounded-full mb-4">
              <Briefcase className="h-4 w-4" />
              <span className="font-semibold text-sm">Join Our Team</span>
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Become a <span className="text-secondary">D-lighter Tutor</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              {websiteContent.tutorRecruitment.subtitle}
            </p>
          </div>

          {/* Benefits grid */}
          <div
            className={`grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-12 transition-all duration-700 delay-200 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          >
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon
              return (
                <Card
                  key={index}
                  className="child-card p-6 border-2 border-border hover:border-secondary/50 group"
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  {/* Top gradient */}
                  <div className={`h-1 bg-gradient-to-r ${benefit.color} -mt-6 -mx-6 mb-6 rounded-t-xl`} />
                  
                  <div className="flex items-start gap-4">
                    <div className={`bg-gradient-to-br ${benefit.color} w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-foreground mb-1">{benefit.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{benefit.description}</p>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>

          {/* Main CTA card */}
          <div
            className={`transition-all duration-700 delay-400 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          >
            <Card className="child-card p-8 md:p-10 bg-gradient-to-br from-card to-muted/50 border-2 border-secondary/20 overflow-hidden">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <CheckCircle className="h-6 w-6 text-secondary" /> What We're Looking For
                  </h3>
                  <ul className="space-y-4">
                    {[
                      "Passionate about teaching children ages 3-16",
                      "Experience in early childhood or primary education",
                      "Comfortable with online teaching technology",
                      "Patient, engaging, and culturally aware",
                      "Flexible schedule availability",
                      "Degree or certification in relevant subject",
                    ].map((item, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="h-6 w-6 rounded-full bg-secondary/10 flex items-center justify-center shrink-0 mt-0.5">
                          <CheckCircle className="h-4 w-4 text-secondary" />
                        </div>
                        <span className="text-muted-foreground leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="text-center">
                  <div className="bg-gradient-to-br from-secondary/10 via-primary/5 to-accent/10 rounded-3xl p-8 mb-6 border border-secondary/20">
                    <div className="h-14 w-14 mx-auto mb-4 rounded-full bg-secondary/20 flex items-center justify-center">
                      <Briefcase className="h-7 w-7 text-secondary" />
                    </div>
                    <p className="text-xl font-bold mb-2 text-foreground">Ready to Inspire Young Minds?</p>
                    <p className="text-muted-foreground mb-6 leading-relaxed">
                      Join our growing team and help African children in diaspora achieve academic excellence
                    </p>
                    <Button
                      size="lg"
                      onClick={handleApply}
                      className="bg-secondary text-secondary-foreground hover:bg-secondary/90 w-full btn-playful rounded-full shadow-lg shadow-secondary/30 group"
                    >
                      Apply to Become a Tutor
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      48hr response
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="h-4 w-4 text-red-400" />
                      Join 50+ tutors
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
