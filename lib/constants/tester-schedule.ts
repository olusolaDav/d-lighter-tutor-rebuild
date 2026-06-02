export interface TesterTimeSlot {
  key: string
  label: string
}

export const TESTER_TIMEZONE_LABEL = "West Africa Time (WAT)"

export const TESTER_TIME_SLOTS: TesterTimeSlot[] = [
  { key: "06:00", label: "06:00 AM - 06:20 AM" },
  { key: "09:00", label: "09:00 AM - 09:20 AM" },
  { key: "12:00", label: "12:00 PM - 12:20 PM" },
  { key: "15:00", label: "03:00 PM - 03:20 PM" },
  { key: "18:00", label: "06:00 PM - 06:20 PM" },
  { key: "21:00", label: "09:00 PM - 09:20 PM" },
  { key: "23:00", label: "11:00 PM - 11:20 PM" },
]

// 0=Sunday ... 6=Saturday. Sundays unavailable by default.
export const TESTER_AVAILABLE_WEEKDAYS = [1, 2, 3, 4, 5, 6]

export const TESTER_BOOKING_WINDOW_DAYS = 90

export const TESTER_MINIMUM_LEAD_HOURS = 72

export function toDateKey(input: Date): string {
  const year = input.getFullYear()
  const month = String(input.getMonth() + 1).padStart(2, "0")
  const day = String(input.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export function isDateWithinBookingWindow(input: Date): boolean {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const maxDate = new Date(today)
  maxDate.setDate(maxDate.getDate() + TESTER_BOOKING_WINDOW_DAYS)

  const day = new Date(input)
  day.setHours(0, 0, 0, 0)

  return day >= today && day <= maxDate
}

export function isTesterWorkingDay(input: Date): boolean {
  return TESTER_AVAILABLE_WEEKDAYS.includes(input.getDay())
}

export function getSlotDateTimeUtc(dateKey: string, slotKey: string): Date {
  const [year, month, day] = dateKey.split("-").map(Number)
  const [hour, minute] = slotKey.split(":").map(Number)

  if (!year || !month || !day || Number.isNaN(hour) || Number.isNaN(minute)) {
    return new Date(0)
  }

  // Tester slots are defined in West Africa Time (UTC+1).
  return new Date(Date.UTC(year, month - 1, day, hour - 1, minute, 0, 0))
}

export function getMinimumBookableDateTimeUtc(now = new Date()): Date {
  return new Date(now.getTime() + TESTER_MINIMUM_LEAD_HOURS * 60 * 60 * 1000)
}

export function isSlotBookable(dateKey: string, slotKey: string, now = new Date()): boolean {
  return getSlotDateTimeUtc(dateKey, slotKey) >= getMinimumBookableDateTimeUtc(now)
}
