"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/db";
import type {
    ActionResult,
    StatusType,
    RulePerformanceEntryWithRule,
} from "@/lib/types";

export async function addRulePerformanceEntryAction(data: {
    date: string;
    ruleId: string;
    status: StatusType;
    notes: string;
}): Promise<ActionResult<RulePerformanceEntryWithRule>> {
    try {
        // Always create a new entry instead of updating existing ones
        const entry = await prisma.rulePerformanceEntry.create({
            data: {
                date: data.date,
                ruleId: data.ruleId,
                status: data.status,
                notes: data.notes,
            },
            include: { rule: true },
        });

        revalidatePath("/rules-performance");
        revalidatePath("/dashboard");
        return { success: true, data: entry };
    } catch (error) {
        console.error("Failed to add rule performance entry:", error);
        return {
            success: false,
            error: "Failed to add rule performance entry",
        };
    }
}

export async function getRulePerformanceEntriesForDateAction(
    date: string
): Promise<ActionResult<RulePerformanceEntryWithRule[]>> {
    try {
        const entries = await prisma.rulePerformanceEntry.findMany({
            where: { date },
            include: { rule: true },
            orderBy: { createdAt: "desc" }, // Show newest entries first
        });
        return { success: true, data: entries };
    } catch (error) {
        console.error("Failed to get rule performance entries:", error);
        return {
            success: false,
            error: "Failed to get rule performance entries",
        };
    }
}

export async function getAllRulePerformanceEntriesAction(): Promise<
    ActionResult<RulePerformanceEntryWithRule[]>
> {
    try {
        const entries = await prisma.rulePerformanceEntry.findMany({
            include: { rule: true },
            orderBy: { date: "desc" },
        });
        return { success: true, data: entries };
    } catch (error) {
        console.error("Failed to get all rule performance entries:", error);
        return {
            success: false,
            error: "Failed to get all rule performance entries",
        };
    }
}

export async function getUniquePerformanceDatesAction(): Promise<
    ActionResult<{ date: string }[]>
> {
    try {
        const result = await prisma.$queryRaw<{ date: string }[]>`
      SELECT DISTINCT date FROM "RulePerformanceEntry" ORDER BY date DESC
    `;
        return { success: true, data: result };
    } catch (error) {
        console.error("Failed to get unique performance dates:", error);
        return {
            success: false,
            error: "Failed to get unique performance dates",
        };
    }
}
