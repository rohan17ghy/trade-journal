"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import type { Rule, DailyTracking } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { addTrackingEntryAction } from "./actions"
import { CheckCircle, XCircle, MinusCircle } from "lucide-react"

interface DailyTrackingFormProps {
  rules: Rule[]
  existingTracking?: DailyTracking
  date: string
}

export function DailyTrackingForm({ rules, existingTracking, date }: DailyTrackingFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [ruleStatus, setRuleStatus] = useState<Record<string, "success" | "failure" | "not_applicable">>(
    // Initialize with existing tracking data if available
    existingTracking?.entries.reduce(
      (acc, entry) => {
        acc[entry.ruleId] = entry.status
        return acc
      },
      {} as Record<string, "success" | "failure" | "not_applicable">,
    ) || {},
  )
  const [notes, setNotes] = useState<Record<string, string>>(
    existingTracking?.entries.reduce(
      (acc, entry) => {
        acc[entry.ruleId] = entry.notes
        return acc
      },
      {} as Record<string, string>,
    ) || {},
  )

  // Reset form when date changes
  useEffect(() => {
    if (existingTracking) {
      setRuleStatus(
        existingTracking.entries.reduce(
          (acc, entry) => {
            acc[entry.ruleId] = entry.status
            return acc
          },
          {} as Record<string, "success" | "failure" | "not_applicable">,
        ),
      )
      setNotes(
        existingTracking.entries.reduce(
          (acc, entry) => {
            acc[entry.ruleId] = entry.notes
            return acc
          },
          {} as Record<string, string>,
        ),
      )
    } else {
      setRuleStatus({})
      setNotes({})
    }
  }, [existingTracking, date])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)

    // Create tracking entries for each rule
    for (const rule of rules) {
      if (ruleStatus[rule.id]) {
        await addTrackingEntryAction({
          date,
          ruleId: rule.id,
          status: ruleStatus[rule.id],
          notes: notes[rule.id] || "",
        })
      }
    }

    setIsSubmitting(false)
    router.refresh()
  }

  if (rules.length === 0) {
    return (
      <div className="text-center p-8 border rounded-lg">
        <p className="text-gray-500">No rules added yet. Add rules first to track their performance.</p>
        <Button className="mt-4" onClick={() => router.push("/rules")}>
          Add Rules
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4">
        <h2 className="text-lg font-medium">Performance for {date}</h2>

        {rules.map((rule) => {
          // Check if we already have tracking for this rule today
          const existingEntry = existingTracking?.entries.find((e) => e.ruleId === rule.id)
          const currentStatus = ruleStatus[rule.id] || "not_applicable"

          return (
            <Card key={rule.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-base">{rule.name}</CardTitle>
                    <CardDescription>
                      <Badge variant="outline" className="mt-1">
                        {rule.category}
                      </Badge>
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div>
                    <Label className="text-sm mb-2 block">Rule Status</Label>
                    <RadioGroup
                      value={currentStatus}
                      onValueChange={(value: "success" | "failure" | "not_applicable") => {
                        setRuleStatus({
                          ...ruleStatus,
                          [rule.id]: value,
                        })
                      }}
                      className="flex flex-col space-y-1"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="success" id={`success-${rule.id}`} />
                        <Label htmlFor={`success-${rule.id}`} className="flex items-center cursor-pointer">
                          <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                          Worked Well
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="failure" id={`failure-${rule.id}`} />
                        <Label htmlFor={`failure-${rule.id}`} className="flex items-center cursor-pointer">
                          <XCircle className="h-4 w-4 mr-2 text-red-500" />
                          Didn't Work Well
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="not_applicable" id={`not_applicable-${rule.id}`} />
                        <Label htmlFor={`not_applicable-${rule.id}`} className="flex items-center cursor-pointer">
                          <MinusCircle className="h-4 w-4 mr-2 text-gray-500" />
                          Not Applicable Today
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor={`notes-${rule.id}`} className="text-sm">
                      Notes
                    </Label>
                    <Textarea
                      id={`notes-${rule.id}`}
                      placeholder="Add notes about this rule's performance today"
                      value={notes[rule.id] || ""}
                      onChange={(e) => {
                        setNotes({
                          ...notes,
                          [rule.id]: e.target.value,
                        })
                      }}
                      rows={2}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : "Save Tracking"}
      </Button>
    </form>
  )
}
