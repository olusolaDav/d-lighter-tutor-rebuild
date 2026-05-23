"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

interface ScrollAnimationProps {
  children: React.ReactNode
  className?: string
  delay?: number
  direction?: "up" | "down" | "left" | "right" | "none"
  duration?: number
  threshold?: number
}

export function ScrollAnimation({
  children,
  className,
  delay = 0,
  direction = "up",
  duration = 0.6,
  threshold = 0.1,
}: ScrollAnimationProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.unobserve(element)
        }
      },
      { threshold },
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [threshold])

  const getTransform = () => {
    if (isVisible) return "translate-x-0 translate-y-0"
    switch (direction) {
      case "up":
        return "translate-y-8"
      case "down":
        return "-translate-y-8"
      case "left":
        return "translate-x-8"
      case "right":
        return "-translate-x-8"
      case "none":
        return ""
      default:
        return "translate-y-8"
    }
  }

  return (
    <div
      ref={ref}
      className={cn("transition-all", className)}
      style={{
        transitionDuration: `${duration}s`,
        transitionDelay: `${delay}s`,
        opacity: isVisible ? 1 : 0,
        transform: isVisible
          ? "none"
          : direction === "up"
          ? "translateY(2rem)"
          : direction === "down"
          ? "translateY(-2rem)"
          : direction === "left"
          ? "translateX(2rem)"
          : direction === "right"
          ? "translateX(-2rem)"
          : "none",
      }}
    >
      {children}
    </div>
  )
}
