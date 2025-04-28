"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/db";
import type {
    ActionResult,
    DailyJournalWithTrades,
    RulePerformance,
} from "@/lib/types";

export async function addDailyJournalAction(data: {
    date: string;
    marketOverview?: string | null;
    mood?: string | null;
    physicalCondition?: string | null;
    goals?: string | null;
    achievements?: string | null;
    challenges?: string | null;
    insights?: string | null;
    improvementAreas?: string | null;
    planForTomorrow?: string | null;
    gratitude?: string | null;
    screenshots?: string[];
    ruleModification?: string | null;
    rulePerformances?: RulePerformance[] | null;
}): Promise<ActionResult<DailyJournalWithTrades>> {
    try {
        // Check if a journal entry already exists for this date
        const existingJournal = await prisma.dailyJournal.findUnique({
            where: { date: data.date },
        });

        let journal;

        if (existingJournal) {
            // Update existing journal
            journal = await prisma.dailyJournal.update({
                where: { id: existingJournal.id },
                data: {
                    marketOverview: data.marketOverview ?? undefined,
                    mood: data.mood ?? undefined,
                    physicalCondition: data.physicalCondition ?? undefined,
                    goals: data.goals ?? undefined,
                    achievements: data.achievements ?? undefined,
                    challenges: data.challenges ?? undefined,
                    insights: data.insights ?? undefined,
                    improvementAreas: data.improvementAreas ?? undefined,
                    planForTomorrow: data.planForTomorrow ?? undefined,
                    gratitude: data.gratitude ?? undefined,
                    screenshots: data.screenshots || [],
                    ruleModification: data.ruleModification ?? undefined,
                },
                include: {
                    trades: {
                        include: {
                            rules: true,
                        },
                    },
                },
            });
        } else {
            // Create new journal
            journal = await prisma.dailyJournal.create({
                data: {
                    date: data.date,
                    marketOverview: data.marketOverview ?? null,
                    mood: data.mood ?? null,
                    physicalCondition: data.physicalCondition ?? null,
                    goals: data.goals ?? null,
                    achievements: data.achievements ?? null,
                    challenges: data.challenges ?? null,
                    insights: data.insights ?? null,
                    improvementAreas: data.improvementAreas ?? null,
                    planForTomorrow: data.planForTomorrow ?? null,
                    gratitude: data.gratitude ?? null,
                    screenshots: data.screenshots || [],
                    ruleModification: data.ruleModification ?? null,
                },
                include: {
                    trades: {
                        include: {
                            rules: true,
                        },
                    },
                },
            });
        }

        // Handle rule performances if provided
        if (data.rulePerformances && data.rulePerformances.length > 0) {
            // Create new rule performance entries
            for (const performance of data.rulePerformances) {
                await prisma.rulePerformanceEntry.create({
                    data: {
                        date: data.date,
                        ruleId: performance.ruleId,
                        status: performance.status,
                        notes: performance.notes || "",
                    },
                });
            }
        }

        revalidatePath("/daily-journal");
        revalidatePath(`/daily-journal/${data.date}`);
        revalidatePath("/rules-performance");
        return { success: true, data: journal };
    } catch (error) {
        console.error("Failed to add daily journal entry:", error);
        return { success: false, error: "Failed to add daily journal entry" };
    }
}

export async function getDailyJournalAction(
    date: string
): Promise<ActionResult<DailyJournalWithTrades | null>> {
    try {
        const journal = await prisma.dailyJournal.findUnique({
            where: { date },
            include: {
                trades: {
                    include: {
                        rules: true,
                    },
                    orderBy: {
                        createdAt: "desc",
                    },
                },
            },
        });
        return { success: true, data: journal };
    } catch (error) {
        console.error("Failed to get daily journal:", error);
        return { success: false, error: "Failed to get daily journal" };
    }
}

export async function getAllDailyJournalsAction(): Promise<
    ActionResult<DailyJournalWithTrades[]>
> {
    try {
        const journals = await prisma.dailyJournal.findMany({
            orderBy: { date: "desc" },
            include: {
                trades: {
                    include: {
                        rules: true,
                    },
                },
            },
        });
        return { success: true, data: journals };
    } catch (error) {
        console.error("Failed to get all daily journals:", error);
        return { success: false, error: "Failed to get all daily journals" };
    }
}

export async function deleteDailyJournalAction(
    id: string
): Promise<ActionResult<void>> {
    try {
        await prisma.dailyJournal.delete({
            where: { id },
        });

        revalidatePath("/daily-journal");
        return { success: true };
    } catch (error) {
        console.error("Failed to delete daily journal:", error);
        return { success: false, error: "Failed to delete daily journal" };
    }
}

export async function getAllJournalDatesAction(): Promise<
    ActionResult<string[]>
> {
    try {
        const journals = await prisma.dailyJournal.findMany({
            select: { date: true },
            orderBy: { date: "desc" },
        });

        return {
            success: true,
            data: journals.map((journal) => journal.date),
        };
    } catch (error) {
        console.error("Failed to get journal dates:", error);
        return { success: false, error: "Failed to get journal dates" };
    }
}

export async function getAllTradeDatesAction(): Promise<
    ActionResult<string[]>
> {
    try {
        // Get unique dates from trade journal entries
        const result = await prisma.$queryRaw<{ date: string }[]>`
      SELECT DISTINCT date FROM "TradeJournalEntry" 
      WHERE "dailyJournalId" IS NULL
      ORDER BY date DESC
    `;

        return {
            success: true,
            data: result.map((item) => item.date),
        };
    } catch (error) {
        console.error("Failed to get trade dates:", error);
        return { success: false, error: "Failed to get trade dates" };
    }
}
