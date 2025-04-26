"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/db";
import type {
    ActionResult,
    StatusType,
    TrackingEntryWithRule,
} from "@/lib/types";

export async function addTrackingEntryAction(data: {
    date: string;
    ruleId: string;
    status: StatusType;
    notes: string;
}): Promise<ActionResult<TrackingEntryWithRule>> {
    try {
        // Check if an entry already exists for this rule and date
        const existingEntry = await prisma.trackingEntry.findFirst({
            where: {
                date: data.date,
                ruleId: data.ruleId,
            },
        });

        let entry;

        if (existingEntry) {
            // Update existing entry
            entry = await prisma.trackingEntry.update({
                where: { id: existingEntry.id },
                data: {
                    status: data.status,
                    notes: data.notes,
                },
                include: { rule: true },
            });
        } else {
            // Create new entry
            entry = await prisma.trackingEntry.create({
                data: {
                    date: data.date,
                    ruleId: data.ruleId,
                    status: data.status,
                    notes: data.notes,
                },
                include: { rule: true },
            });
        }

        revalidatePath("/tracking");
        revalidatePath("/dashboard");
        return { success: true, data: entry };
    } catch (error) {
        console.error("Failed to add tracking entry:", error);
        return { success: false, error: "Failed to add tracking entry" };
    }
}

export async function getTrackingEntriesForDateAction(
    date: string
): Promise<ActionResult<TrackingEntryWithRule[]>> {
    try {
        const entries = await prisma.trackingEntry.findMany({
            where: { date },
            include: { rule: true },
        });
        return { success: true, data: entries };
    } catch (error) {
        console.error("Failed to get tracking entries:", error);
        return { success: false, error: "Failed to get tracking entries" };
    }
}

export async function getAllTrackingEntriesAction(): Promise<
    ActionResult<TrackingEntryWithRule[]>
> {
    try {
        const entries = await prisma.trackingEntry.findMany({
            include: { rule: true },
            orderBy: { date: "desc" },
        });
        return { success: true, data: entries };
    } catch (error) {
        console.error("Failed to get all tracking entries:", error);
        return { success: false, error: "Failed to get all tracking entries" };
    }
}

export async function getUniqueTrackingDatesAction(): Promise<
    ActionResult<{ date: string }[]>
> {
    try {
        const result = await prisma.$queryRaw<{ date: string }[]>`
      SELECT DISTINCT date FROM "TrackingEntry" ORDER BY date DESC
    `;
        return { success: true, data: result };
    } catch (error) {
        console.error("Failed to get unique tracking dates:", error);
        return { success: false, error: "Failed to get unique tracking dates" };
    }
}
