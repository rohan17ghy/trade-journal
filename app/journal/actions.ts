"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/db";
import type { ActionResult, TradeJournalEntryWithRules } from "@/lib/types";

export async function addTradeJournalEntryAction(data: {
    date: string;
    market: string;
    symbol: string;
    setup?: string;
    direction: string;
    entryPrice: number;
    exitPrice?: number | null;
    stopLoss?: number | null;
    takeProfit?: number | null;
    positionSize: number;
    profitLoss?: number | null;
    profitLossPercentage?: number | null;
    fees?: number | null;
    duration?: string | null;
    entryTime?: Date | null;
    exitTime?: Date | null;
    psychology?: string | null;
    notes?: string | null;
    lessonsLearned?: string | null;
    screenshots?: string[];
    rating?: number | null;
    ruleIds?: string[];
}): Promise<ActionResult<TradeJournalEntryWithRules>> {
    try {
        // Calculate profit/loss if not provided but entry and exit prices are available
        let profitLoss = data.profitLoss ?? null;
        let profitLossPercentage = data.profitLossPercentage ?? null;

        if (
            profitLoss === null &&
            data.exitPrice !== undefined &&
            data.exitPrice !== null
        ) {
            if (data.direction === "Long") {
                profitLoss =
                    (data.exitPrice - data.entryPrice) * data.positionSize;
            } else {
                profitLoss =
                    (data.entryPrice - data.exitPrice) * data.positionSize;
            }
        }

        if (profitLossPercentage === null && profitLoss !== null) {
            profitLossPercentage =
                (profitLoss / (data.entryPrice * data.positionSize)) * 100;
        }

        // First, try to find an existing daily journal for this date
        let dailyJournal = await prisma.dailyJournal.findUnique({
            where: { date: data.date },
        });

        // If no journal exists for this date, create one
        if (!dailyJournal) {
            dailyJournal = await prisma.dailyJournal.create({
                data: {
                    date: data.date,
                },
            });
        }

        // Now create the trade entry connected to the journal
        const entry = await prisma.tradeJournalEntry.create({
            data: {
                date: data.date,
                market: data.market,
                symbol: data.symbol,
                setup: data.setup ?? null,
                direction: data.direction,
                entryPrice: data.entryPrice,
                exitPrice: data.exitPrice ?? null,
                stopLoss: data.stopLoss ?? null,
                takeProfit: data.takeProfit ?? null,
                positionSize: data.positionSize,
                profitLoss: profitLoss,
                profitLossPercentage: profitLossPercentage,
                fees: data.fees ?? null,
                duration: data.duration ?? null,
                entryTime: data.entryTime ?? null,
                exitTime: data.exitTime ?? null,
                psychology: data.psychology ?? null,
                notes: data.notes ?? null,
                lessonsLearned: data.lessonsLearned ?? null,
                screenshots: data.screenshots || [],
                rating: data.rating ?? null,
                rules: {
                    connect: data.ruleIds?.map((id) => ({ id })) || [],
                },
                dailyJournal: {
                    connect: { id: dailyJournal.id },
                },
            },
            include: {
                rules: true,
            },
        });

        revalidatePath("/journal");
        revalidatePath("/dashboard");
        return { success: true, data: entry };
    } catch (error) {
        console.error("Failed to add trade journal entry:", error);
        return { success: false, error: "Failed to add trade journal entry" };
    }
}

export async function updateTradeJournalEntryAction(
    id: string,
    data: Partial<
        Omit<TradeJournalEntryWithRules, "id" | "createdAt" | "updatedAt">
    > & { ruleIds?: string[] }
): Promise<ActionResult<TradeJournalEntryWithRules>> {
    try {
        // Handle rule connections separately
        const { ruleIds, ...updateData } = data;

        // Process the data to ensure null values are handled correctly
        const processedData = Object.entries(updateData).reduce(
            (acc, [key, value]) => {
                // If the value is undefined, don't include it in the update
                if (value !== undefined) {
                    acc[key] = value;
                }
                return acc;
            },
            {} as Record<string, any>
        );

        // First, check if date is being updated
        const currentEntry = await prisma.tradeJournalEntry.findUnique({
            where: { id },
            select: { date: true, dailyJournalId: true },
        });

        // If date is being changed or there's no dailyJournalId, ensure connection to the right journal
        if (
            (processedData.date && processedData.date !== currentEntry?.date) ||
            !currentEntry?.dailyJournalId
        ) {
            const dateToUse = processedData.date || currentEntry?.date;
            if (dateToUse) {
                // Find or create a daily journal for this date
                let dailyJournal = await prisma.dailyJournal.findUnique({
                    where: { date: dateToUse },
                });

                if (!dailyJournal) {
                    dailyJournal = await prisma.dailyJournal.create({
                        data: { date: dateToUse },
                    });
                }

                // Add the journal connection to the update data
                processedData.dailyJournal = {
                    connect: { id: dailyJournal.id },
                };
            }
        }

        // Update the trade entry
        const entry = await prisma.tradeJournalEntry.update({
            where: { id },
            data: {
                ...processedData,
                ...(ruleIds && {
                    rules: {
                        set: ruleIds.map((id) => ({ id })),
                    },
                }),
            },
            include: {
                rules: true,
            },
        });

        revalidatePath("/journal");
        revalidatePath(`/journal/${id}`);
        revalidatePath("/dashboard");
        return { success: true, data: entry };
    } catch (error) {
        console.error("Failed to update trade journal entry:", error);
        return {
            success: false,
            error: "Failed to update trade journal entry",
        };
    }
}

export async function deleteTradeJournalEntryAction(
    id: string
): Promise<ActionResult<void>> {
    try {
        await prisma.tradeJournalEntry.delete({
            where: { id },
        });

        revalidatePath("/journal");
        revalidatePath("/dashboard");
        return { success: true };
    } catch (error) {
        console.error("Failed to delete trade journal entry:", error);
        return {
            success: false,
            error: "Failed to delete trade journal entry",
        };
    }
}

export async function getTradeJournalEntriesAction(): Promise<
    ActionResult<TradeJournalEntryWithRules[]>
> {
    try {
        const entries = await prisma.tradeJournalEntry.findMany({
            orderBy: { date: "desc" },
            include: {
                rules: true,
            },
        });
        return { success: true, data: entries };
    } catch (error) {
        console.error("Failed to get trade journal entries:", error);
        return { success: false, error: "Failed to get trade journal entries" };
    }
}

export async function getTradeJournalEntryAction(
    id: string
): Promise<ActionResult<TradeJournalEntryWithRules | null>> {
    try {
        const entry = await prisma.tradeJournalEntry.findUnique({
            where: { id },
            include: {
                rules: true,
            },
        });
        return { success: true, data: entry };
    } catch (error) {
        console.error("Failed to get trade journal entry:", error);
        return { success: false, error: "Failed to get trade journal entry" };
    }
}

export async function getTradeJournalEntriesByDateAction(
    date: string
): Promise<ActionResult<TradeJournalEntryWithRules[]>> {
    try {
        const entries = await prisma.tradeJournalEntry.findMany({
            where: { date },
            orderBy: { createdAt: "desc" },
            include: {
                rules: true,
            },
        });
        return { success: true, data: entries };
    } catch (error) {
        console.error("Failed to get trade journal entries for date:", error);
        return {
            success: false,
            error: "Failed to get trade journal entries for date",
        };
    }
}

export async function getTradeJournalStatisticsAction(): Promise<
    ActionResult<{
        totalTrades: number;
        profitableTrades: number;
        unprofitableTrades: number;
        winRate: number;
        totalProfit: number;
        averageProfit: number;
        averageLoss: number;
        profitFactor: number;
        largestProfit: number;
        largestLoss: number;
    }>
> {
    try {
        const entries = await prisma.tradeJournalEntry.findMany({
            where: {
                profitLoss: { not: null },
            },
            select: {
                profitLoss: true,
            },
        });

        if (entries.length === 0) {
            return {
                success: true,
                data: {
                    totalTrades: 0,
                    profitableTrades: 0,
                    unprofitableTrades: 0,
                    winRate: 0,
                    totalProfit: 0,
                    averageProfit: 0,
                    averageLoss: 0,
                    profitFactor: 0,
                    largestProfit: 0,
                    largestLoss: 0,
                },
            };
        }

        // Filter out entries with null profitLoss (should not happen due to the where clause, but just to be safe)
        const validEntries = entries.filter((e) => e.profitLoss !== null);
        const profitableTrades = validEntries.filter(
            (e) => (e.profitLoss || 0) > 0
        );
        const unprofitableTrades = validEntries.filter(
            (e) => (e.profitLoss || 0) < 0
        );

        const totalProfit = validEntries.reduce(
            (sum, entry) => sum + (entry.profitLoss || 0),
            0
        );
        const totalProfits = profitableTrades.reduce(
            (sum, entry) => sum + (entry.profitLoss || 0),
            0
        );
        const totalLosses = Math.abs(
            unprofitableTrades.reduce(
                (sum, entry) => sum + (entry.profitLoss || 0),
                0
            )
        );

        const averageProfit =
            profitableTrades.length > 0
                ? totalProfits / profitableTrades.length
                : 0;
        const averageLoss =
            unprofitableTrades.length > 0
                ? totalLosses / unprofitableTrades.length
                : 0;

        const profitFactor =
            totalLosses > 0
                ? totalProfits / totalLosses
                : totalProfits > 0
                ? Number.POSITIVE_INFINITY
                : 0;

        const largestProfit =
            profitableTrades.length > 0
                ? Math.max(...profitableTrades.map((e) => e.profitLoss || 0))
                : 0;

        const largestLoss =
            unprofitableTrades.length > 0
                ? Math.abs(
                      Math.min(
                          ...unprofitableTrades.map((e) => e.profitLoss || 0)
                      )
                  )
                : 0;

        return {
            success: true,
            data: {
                totalTrades: validEntries.length,
                profitableTrades: profitableTrades.length,
                unprofitableTrades: unprofitableTrades.length,
                winRate:
                    validEntries.length > 0
                        ? (profitableTrades.length / validEntries.length) * 100
                        : 0,
                totalProfit,
                averageProfit,
                averageLoss,
                profitFactor,
                largestProfit,
                largestLoss,
            },
        };
    } catch (error) {
        console.error("Failed to get trade journal statistics:", error);
        return {
            success: false,
            error: "Failed to get trade journal statistics",
        };
    }
}

export async function getTradesByDateRangeAction(
    startDate: string,
    endDate: string
): Promise<ActionResult<TradeJournalEntryWithRules[]>> {
    try {
        console.log(
            `Server action called with startDate: ${startDate}, endDate: ${endDate}`
        );

        // If both dates are empty strings or undefined, return all trades
        if (!startDate || !endDate) {
            console.log("Fetching all trades (no date filter)");
            const entries = await prisma.tradeJournalEntry.findMany({
                orderBy: { date: "desc" },
                include: {
                    rules: true,
                },
            });
            console.log(`Found ${entries.length} trades (all)`);
            return { success: true, data: entries };
        }

        // Fetch trades within the date range
        console.log(`Fetching trades between ${startDate} and ${endDate}`);
        const entries = await prisma.tradeJournalEntry.findMany({
            where: {
                date: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            orderBy: { date: "desc" },
            include: {
                rules: true,
            },
        });

        console.log(`Found ${entries.length} trades in date range`);
        return { success: true, data: entries };
    } catch (error) {
        console.error("Failed to get trades by date range:", error);
        return { success: false, error: "Failed to get trades by date range" };
    }
}
