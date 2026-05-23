"use client"

import { cn } from "@/lib/utils"

interface PageLoaderProps {
  /** Optional loading message to display below the spinner */
  message?: string
  /** Size of the spinner: 'sm' | 'md' | 'lg' - default is 'lg' */
  size?: "sm" | "md" | "lg"
  /** Whether to show the full page loader (min-h-screen) or inline */
  fullPage?: boolean
  /** Additional className for customization */
  className?: string
}

const sizeClasses = {
  sm: "h-8 w-8 border-2",
  md: "h-16 w-16 border-2",
  lg: "h-24 w-24 border-[3px]",
}

/**
 * PageLoader - A consistent loading spinner component
 * 
 * Usage:
 * - For page-level loading: <PageLoader message="Loading dashboard..." />
 * - For inline/section loading: <PageLoader size="sm" fullPage={false} />
 * - For fallback (no message): <PageLoader />
 */
export function PageLoader({ 
  message, 
  size = "lg", 
  fullPage = true,
  className 
}: PageLoaderProps) {
  return (
    <div 
      className={cn(
        "flex items-center justify-center",
        fullPage && "min-h-[calc(100vh-4rem)] bg-gray-50/50",
        !fullPage && "py-12",
        className
      )}
    >
      <div className="text-center">
        <div 
          className={cn(
            "animate-spin rounded-full border-blue-600 border-t-transparent mx-auto",
            sizeClasses[size]
          )}
          role="status"
          aria-label={message || "Loading"}
        />
        {message && (
          <p className="mt-4 text-gray-600 text-sm font-medium animate-pulse">
            {message}
          </p>
        )}
      </div>
    </div>
  )
}

/**
 * InlineLoader - A smaller loader for buttons, cards, or inline contexts
 */
export function InlineLoader({ 
  message,
  className 
}: { 
  message?: string
  className?: string 
}) {
  return (
    <div className={cn("flex items-center justify-center gap-2", className)}>
      <div 
        className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"
        role="status"
        aria-label={message || "Loading"}
      />
      {message && (
        <span className="text-sm text-gray-600">{message}</span>
      )}
    </div>
  )
}

export default PageLoader
