export interface Rule {
  id: string
  name: string
  description: string
  category: string
  createdAt: string
}

export interface TrackingEntry {
  id: string
  date: string
  ruleId: string
  status: "success" | "failure" | "not_applicable"
  notes: string
  createdAt: string
}

export interface DailyTracking {
  id: string
  date: string
  entries: TrackingEntry[]
  notes: string
  createdAt: string
}
