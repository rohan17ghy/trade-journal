import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
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
            return NextResponse.json({
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
            });
        }

        // Filter out entries with null profitLoss
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

        return NextResponse.json({
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
            profitFactor:
                typeof profitFactor === "number" && isFinite(profitFactor)
                    ? profitFactor
                    : 0,
            largestProfit,
            largestLoss,
        });
    } catch (error) {
        console.error("Failed to get trade journal statistics:", error);
        return NextResponse.json(
            { error: "Failed to get trade journal statistics" },
            { status: 500 }
        );
    }
}
