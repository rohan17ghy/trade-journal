"use server";

import { prisma } from "@/lib/db";
import type { ActionResult, TrendEventWithRule } from "@/lib/types";
import { revalidatePath } from "next/cache";

export async function getTrendEventsAction(): Promise<
    ActionResult<TrendEventWithRule[]>
> {
    try {
        const trendEvents = await prisma.trendEvent.findMany({
            orderBy: [
                {
                    date: "desc",
                },
                {
                    time: "desc",
                },
            ],
            include: {
                rule: true,
            },
        });

        // Parse the JSON content for each trend event
        const parsedTrendEvents = trendEvents.map((event) => ({
            ...event,
            description:
                typeof event.description === "string"
                    ? JSON.parse(event.description)
                    : event.description,
        }));

        return {
            success: true,
            data: parsedTrendEvents,
        };
    } catch (error) {
        console.error("Failed to get trend events:", error);
        return {
            success: false,
            error: "Failed to get trend events",
        };
    }
}

export async function getTrendEventsByMonthAction(
    year: number,
    month: number
): Promise<ActionResult<TrendEventWithRule[]>> {
    try {
        // Create date range for the month
        const startDate = new Date(year, month - 1, 1); // Month is 0-indexed in JS Date
        const endDate = new Date(year, month, 0); // Last day of the month

        const trendEvents = await prisma.trendEvent.findMany({
            where: {
                date: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            orderBy: [
                {
                    date: "asc",
                },
                {
                    time: "asc",
                },
            ],
            include: {
                rule: true,
            },
        });

        // Parse the JSON content for each trend event
        const parsedTrendEvents = trendEvents.map((event) => ({
            ...event,
            description:
                typeof event.description === "string"
                    ? JSON.parse(event.description)
                    : event.description,
        }));

        return {
            success: true,
            data: parsedTrendEvents,
        };
    } catch (error) {
        console.error("Failed to get trend events by month:", error);
        return {
            success: false,
            error: "Failed to get trend events by month",
        };
    }
}

export async function createTrendEventAction(
    formData: FormData
): Promise<ActionResult> {
    try {
        const date = new Date(formData.get("date") as string);
        const title = formData.get("title") as string;
        const time = formData.get("time") as string;
        const eventType = formData.get("eventType") as string;
        const description = formData.get("description") as string;
        const symbol = formData.get("symbol") as string;
        const direction = (formData.get("direction") as string) || null;
        const ruleId = (formData.get("ruleId") as string) || null;

        // Validate required fields
        if (!date || !eventType || !description || !symbol) {
            return {
                success: false,
                error: "Missing required fields",
            };
        }

        // Create the trend event
        await prisma.trendEvent.create({
            data: {
                date,
                title,
                time,
                eventType,
                description,
                symbol,
                direction,
                ruleId: ruleId === "none" ? null : ruleId,
            },
        });

        revalidatePath("/trend-analysis");
        return {
            success: true,
        };
    } catch (error) {
        console.error("Failed to create trend event:", error);
        return {
            success: false,
            error: "Failed to create trend event",
        };
    }
}

export async function deleteTrendEventAction(
    id: string
): Promise<ActionResult> {
    try {
        await prisma.trendEvent.delete({
            where: {
                id,
            },
        });

        revalidatePath("/trend-analysis");
        return {
            success: true,
        };
    } catch (error) {
        console.error("Failed to delete trend event:", error);
        return {
            success: false,
            error: "Failed to delete trend event",
        };
    }
}

export async function getRulesAction(): Promise<ActionResult> {
    try {
        const rules = await prisma.rule.findMany({
            orderBy: {
                name: "asc",
            },
        });

        return {
            success: true,
            data: rules,
        };
    } catch (error) {
        console.error("Failed to get rules:", error);
        return {
            success: false,
            error: "Failed to get rules",
        };
    }
}
