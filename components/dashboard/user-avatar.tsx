"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface UserAvatarProps {
  name?: string
  image?: string
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
}

const sizeMap = {
  sm: "h-6 w-6 text-xs",
  md: "h-8 w-8 text-sm",
  lg: "h-10 w-10 text-base",
  xl: "h-16 w-16 text-xl",
}

export function UserAvatar({ name, image, size = "md", className }: UserAvatarProps) {
  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?"

  return (
    <Avatar className={cn(sizeMap[size], className)}>
      <AvatarImage src={image} alt={name || "User"} />
      <AvatarFallback className="bg-primary/10 text-primary font-semibold">{initials}</AvatarFallback>
    </Avatar>
  )
}
