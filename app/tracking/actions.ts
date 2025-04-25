"use server"

import { addTrackingEntry, addDailyTracking } from "@/lib/data"
import { revalidatePath } from "next/cache"

export async function addTrackingEntryAction(data: {
  date: string
  ruleId: string
  status: "success" | "failure" | "not_applicable"
  notes: string
}) {
  const entry = addTrackingEntry(data)
  revalidatePath("/tracking")
  revalidatePath("/dashboard")
  return entry
}

export async function addDailyTrackingAction(data: {
  date: string
  notes: string
  entries: Array<{
    ruleId: string
    status: "success" | "failure" | "not_applicable"
    notes: string
  }>
}) {
  const tracking = addDailyTracking({
    date: data.date,
    notes: data.notes,
    entries: data.entries.map((entry) => ({
      ...entry,
      date: data.date,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    })),
  })

  revalidatePath("/tracking")
  revalidatePath("/dashboard")
  return tracking
}
