import type { Rule, TrackingEntry, DailyTracking } from "./types"

// In a real app, this would be a database
let rules: Rule[] = [
  {
    id: "1",
    name: "Only trade with trend",
    description: "Only take trades in the direction of the overall market trend",
    category: "Entry",
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    name: "2:1 Risk-Reward ratio minimum",
    description: "Only take trades with at least 2:1 reward to risk ratio",
    category: "Risk Management",
    createdAt: new Date().toISOString(),
  },
]

const trackingEntries: TrackingEntry[] = []
const dailyTrackings: DailyTracking[] = []

// Rules CRUD operations
export function getRules(): Rule[] {
  return [...rules]
}

export function getRule(id: string): Rule | undefined {
  return rules.find((rule) => rule.id === id)
}

export function addRule(rule: Omit<Rule, "id" | "createdAt">): Rule {
  const newRule = {
    ...rule,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  }
  rules.push(newRule)
  return newRule
}

export function updateRule(id: string, rule: Partial<Rule>): Rule | null {
  const index = rules.findIndex((r) => r.id === id)
  if (index === -1) return null

  rules[index] = { ...rules[index], ...rule }
  return rules[index]
}

export function deleteRule(id: string): boolean {
  const initialLength = rules.length
  rules = rules.filter((rule) => rule.id !== id)
  return rules.length !== initialLength
}

// Tracking CRUD operations
export function getDailyTrackings(): DailyTracking[] {
  return [...dailyTrackings]
}

export function getDailyTracking(date: string): DailyTracking | undefined {
  return dailyTrackings.find((tracking) => tracking.date === date)
}

export function addDailyTracking(tracking: Omit<DailyTracking, "id" | "createdAt">): DailyTracking {
  const existingTracking = dailyTrackings.find((t) => t.date === tracking.date)

  if (existingTracking) {
    existingTracking.entries = [...existingTracking.entries, ...tracking.entries]
    existingTracking.notes = tracking.notes || existingTracking.notes
    return existingTracking
  }

  const newTracking = {
    ...tracking,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  }

  dailyTrackings.push(newTracking)
  return newTracking
}

export function addTrackingEntry(entry: Omit<TrackingEntry, "id" | "createdAt">): TrackingEntry {
  const newEntry = {
    ...entry,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  }

  trackingEntries.push(newEntry)

  // Add to daily tracking
  const existingTracking = dailyTrackings.find((t) => t.date === entry.date)

  if (existingTracking) {
    // Check if we already have an entry for this rule on this date
    const existingEntryIndex = existingTracking.entries.findIndex((e) => e.ruleId === entry.ruleId)

    if (existingEntryIndex >= 0) {
      // Update existing entry
      existingTracking.entries[existingEntryIndex] = newEntry
    } else {
      // Add new entry
      existingTracking.entries.push(newEntry)
    }
  } else {
    addDailyTracking({
      date: entry.date,
      entries: [newEntry],
      notes: "",
    })
  }

  return newEntry
}
