"use client"

import { useEffect } from "react"

interface PositionViewTrackerProps {
  positionId: string
}

export function PositionViewTracker({ positionId }: PositionViewTrackerProps) {
  useEffect(() => {
    const viewedKey = `position_viewed_${positionId}`
    const hasViewed = localStorage.getItem(viewedKey)

    if (!hasViewed) {
      localStorage.setItem(viewedKey, Date.now().toString())

      fetch(`/api/positions/${positionId}/view`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      }).catch((err) => {
        console.error("Error tracking position view:", err)
      })
    }
  }, [positionId])

  return null
}