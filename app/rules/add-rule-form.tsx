"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { addRuleAction } from "./actions"

export function AddRuleForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(event.currentTarget)
    await addRuleAction(formData)

    // Reset form
    event.currentTarget.reset()
    setIsSubmitting(false)
    router.refresh()
  }

  return (
    <div className="border rounded-lg p-4">
      <h2 className="text-lg font-medium mb-4">Add New Rule</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="name">Rule Name</Label>
          <Input id="name" name="name" placeholder="Enter rule name" required />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="category">Category</Label>
          <Select name="category" required>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Entry">Entry</SelectItem>
              <SelectItem value="Exit">Exit</SelectItem>
              <SelectItem value="Risk Management">Risk Management</SelectItem>
              <SelectItem value="Psychology">Psychology</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" name="description" placeholder="Describe your trading rule" rows={3} />
        </div>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Adding..." : "Add Rule"}
        </Button>
      </form>
    </div>
  )
}
