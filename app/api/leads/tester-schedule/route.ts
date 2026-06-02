import { NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import TesterBooking from "@/lib/models/testerBooking"
import {
  TESTER_BOOKING_WINDOW_DAYS,
  TESTER_TIME_SLOTS,
  TESTER_TIMEZONE_LABEL,
  isDateWithinBookingWindow,
  isTesterWorkingDay,
  isSlotBookable,
  toDateKey,
} from "@/lib/constants/tester-schedule"

const BOOKING_CACHE_TTL_MS = 60 * 1000

type BookedRow = { dateKey: string; slotKey: string }

const monthlyBookingCache = new Map<
  string,
  {
    expiresAt: number
    data?: BookedRow[]
    promise?: Promise<BookedRow[]>
  }
>()

async function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(message)), ms)
  })

  try {
    return await Promise.race([promise, timeoutPromise])
  } finally {
    if (timeoutId) clearTimeout(timeoutId)
  }
}

function parseMonth(input: string): { year: number; month: number } | null {
  const match = /^(\d{4})-(\d{2})$/.exec(input)
  if (!match) return null

  const year = Number(match[1])
  const month = Number(match[2])
  if (!year || month < 1 || month > 12) return null

  return { year, month }
}

function isTimeoutError(error: unknown): boolean {
  return error instanceof Error && /timeout/i.test(error.message)
}

async function loadMonthlyBookings(monthStart: Date, monthEnd: Date): Promise<BookedRow[]> {
  const cacheKey = `${toDateKey(monthStart)}:${toDateKey(monthEnd)}`
  const now = Date.now()
  const cached = monthlyBookingCache.get(cacheKey)

  if (cached?.data && cached.expiresAt > now) {
    return cached.data
  }

  if (cached?.promise) {
    return cached.promise
  }

  const promise = (async () => {
    await withTimeout(dbConnect(), 5000, "Database connection timeout")
    return withTimeout(
      TesterBooking.find({
        dateKey: {
          $gte: toDateKey(monthStart),
          $lte: toDateKey(monthEnd),
        },
      })
        .select("dateKey slotKey")
        .maxTimeMS(4000)
        .lean() as Promise<BookedRow[]>,
      5000,
      "Booking availability query timeout"
    )
  })()

  monthlyBookingCache.set(cacheKey, {
    expiresAt: now + BOOKING_CACHE_TTL_MS,
    promise,
  })

  try {
    const data = await promise
    monthlyBookingCache.set(cacheKey, {
      expiresAt: Date.now() + BOOKING_CACHE_TTL_MS,
      data,
    })
    return data
  } catch (error) {
    monthlyBookingCache.delete(cacheKey)
    throw error
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const monthParam = searchParams.get("month")
    const selectedDate = searchParams.get("date") || undefined

    const now = new Date()
    const fallbackMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
    const monthValue = monthParam || fallbackMonth

    const parsedMonth = parseMonth(monthValue)
    if (!parsedMonth) {
      return NextResponse.json(
        { success: false, error: "Invalid month format. Use YYYY-MM" },
        { status: 400 }
      )
    }

    const monthStart = new Date(parsedMonth.year, parsedMonth.month - 1, 1)
    const monthEnd = new Date(parsedMonth.year, parsedMonth.month, 0)

    let booked: BookedRow[] = []
    try {
      booked = await loadMonthlyBookings(monthStart, monthEnd)
    } catch (dbError) {
      // Degrade gracefully so users can still pick slots based on the 72-hour rule.
      if (!isTimeoutError(dbError)) {
        console.warn("Tester schedule DB lookup failed, using fallback availability:", dbError)
      }
    }

    const bookedMap = new Map<string, Set<string>>()
    for (const row of booked) {
      const dateKey = String(row.dateKey)
      const slotKey = String(row.slotKey)
      if (!bookedMap.has(dateKey)) bookedMap.set(dateKey, new Set())
      bookedMap.get(dateKey)!.add(slotKey)
    }

    const availableDates: string[] = []
    const unavailableDates: string[] = []

    const cursor = new Date(monthStart)
    while (cursor <= monthEnd) {
      const dateKey = toDateKey(cursor)
      const bookedSlots = bookedMap.get(dateKey) || new Set<string>()

      const availableSlotsCount = TESTER_TIME_SLOTS.filter((slot) => {
        return !bookedSlots.has(slot.key) && isSlotBookable(dateKey, slot.key, now)
      }).length

      const dayAvailable =
        isTesterWorkingDay(cursor) &&
        isDateWithinBookingWindow(cursor) &&
        availableSlotsCount > 0

      if (dayAvailable) availableDates.push(dateKey)
      else unavailableDates.push(dateKey)

      cursor.setDate(cursor.getDate() + 1)
    }

    let slots = TESTER_TIME_SLOTS.map((slot) => ({
      ...slot,
      available: false,
    }))

    if (selectedDate) {
      const dateObj = new Date(`${selectedDate}T00:00:00`)
      const canSelectDate =
        !Number.isNaN(dateObj.getTime()) &&
        isTesterWorkingDay(dateObj) &&
        isDateWithinBookingWindow(dateObj)

      if (canSelectDate) {
        const dateBooked = bookedMap.get(selectedDate) || new Set<string>()
        slots = TESTER_TIME_SLOTS.map((slot) => ({
          ...slot,
          available: !dateBooked.has(slot.key) && isSlotBookable(selectedDate, slot.key, now),
        }))
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        timezone: TESTER_TIMEZONE_LABEL,
        bookingWindowDays: TESTER_BOOKING_WINDOW_DAYS,
        month: monthValue,
        availableDates,
        unavailableDates,
        slots,
      },
    })
  } catch (error) {
    console.error("Tester schedule availability error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to load tester schedule" },
      { status: 500 }
    )
  }
}
