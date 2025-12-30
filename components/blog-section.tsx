"use client"

import Image from "next/image"
import { Calendar, User, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { websiteContent } from "@/content/website-content"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"

export function BlogSection() {
  const { ref, isVisible } = useScrollAnimation()

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text
    return text.slice(0, maxLength) + "..."
  }

  return (
    <section id="blog" className="py-20 bg-muted/30" ref={ref}>
      <div className="container mx-auto px-4">
        <div
          className={`text-center mb-12 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <h2 className="text-4xl font-bold mb-4 text-balance">Latest from Our Blog</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
            Expert insights, tips, and resources for parents raising successful learners
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {websiteContent.blogs.map((post, index) => (
            <article
              key={post.id}
              className={`bg-card rounded-lg overflow-hidden border border-border hover:shadow-lg transition-all duration-700 delay-${
                index * 100
              } ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
            >
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={post.thumbnail || "/placeholder.svg"}
                  alt={post.title}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>

              <div className="p-6">
                <h3 className="text-xl font-bold mb-3 line-clamp-2 text-balance">{post.title}</h3>

                <p className="text-muted-foreground mb-4 line-clamp-3 leading-relaxed">
                  {truncateText(post.description, 120)}
                </p>

                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    <span>{post.author}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{post.date}</span>
                  </div>
                </div>

                <Button asChild variant="outline" className="w-full group bg-transparent">
                  <a href={post.mediumLink} target="_blank" rel="noopener noreferrer">
                    Read Article
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </a>
                </Button>
              </div>
            </article>
          ))}
        </div>

        <div
          className={`text-center mt-12 transition-all duration-700 delay-300 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <Button asChild size="lg" variant="outline">
            <a href="https://medium.com/@dlightertutor" target="_blank" rel="noopener noreferrer">
              View All Articles
            </a>
          </Button>
        </div>
      </div>
    </section>
  )
}
