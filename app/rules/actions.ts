"use server"

import { addRule, updateRule, deleteRule } from "@/lib/data"
import { revalidatePath } from "next/cache"

export async function addRuleAction(formData: FormData) {
  const name = formData.get("name") as string
  const description = formData.get("description") as string
  const category = formData.get("category") as string

  if (!name || !category) {
    throw new Error("Name and category are required")
  }

  const rule = addRule({
    name,
    description,
    category,
  })

  revalidatePath("/rules")
  return rule
}

export async function updateRuleAction(id: string, formData: FormData) {
  const name = formData.get("name") as string
  const description = formData.get("description") as string
  const category = formData.get("category") as string

  if (!name || !category) {
    throw new Error("Name and category are required")
  }

  const rule = updateRule(id, {
    name,
    description,
    category,
  })

  revalidatePath("/rules")
  return rule
}

export async function deleteRuleAction(id: string) {
  const success = deleteRule(id)
  revalidatePath("/rules")
  return success
}
