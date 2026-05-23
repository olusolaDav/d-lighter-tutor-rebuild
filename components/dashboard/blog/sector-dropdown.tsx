"use client"

import { useState, useRef, useEffect } from "react"
import { ChevronDown, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface CategoryDropdownProps {
  value: string[]
  onChange: (categories: string[]) => void
  maxSelections?: number
}

const ACADEMIC_CATEGORIES = [
  "Mathematics",
  "English & Literacy",
  "Science",
  "African Languages",
  "African Heritage & Culture",
  "Parenting Tips",
  "Study Skills",
  "Exam Preparation",
  "Primary Education",
  "Secondary Education",
  "GCSE & A-Level",
  "11+ Preparation",
  "Online Learning",
  "Homework Help",
  "Special Educational Needs",
]

export function CategoryDropdown({ value, onChange, maxSelections = 3 }: CategoryDropdownProps) {

  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleToggleCategory = (category: string) => {
    if (value.includes(category)) {
      onChange(value.filter((c) => c !== category))
    } else if (value.length < maxSelections) {
      onChange([...value, category])
    }
  }

  const handleRemoveCategory = (category: string) => {
    onChange(value.filter((c) => c !== category))
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full px-4 py-2 rounded-xl border border-border bg-background text-left flex items-center justify-between hover:border-primary/50 transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
        )}
      >
        <div className="flex flex-wrap gap-2 flex-1 min-w-0">
          {value.length === 0 ? (
            <span className="text-muted-foreground">Select categories (up to {maxSelections})</span>
          ) : (
            value.map((category) => (
              <span
                key={category}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium"
              >
                {category}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRemoveCategory(category)
                  }}
                  className="hover:text-primary/80"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))
          )}
        </div>
        <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-background border border-border rounded-xl shadow-lg overflow-hidden">
          <div className="max-h-64 overflow-y-auto p-2">
            {ACADEMIC_CATEGORIES.map((category) => (
              <label
                key={category}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={value.includes(category)}
                  onChange={() => handleToggleCategory(category)}
                  disabled={!value.includes(category) && value.length >= maxSelections}
                  className="w-4 h-4 rounded border-border accent-primary cursor-pointer"
                />
                <span className={cn("text-sm", !value.includes(category) && value.length >= maxSelections && "text-muted-foreground opacity-50")}>
                  {category}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Helper text */}
      {value.length > 0 && (
        <p className="mt-2 text-xs text-muted-foreground">
          {value.length}/{maxSelections} categories selected
        </p>
      )}
    </div>
  )
}
