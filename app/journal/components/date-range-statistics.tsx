"use client";

import { useMemo } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Percent } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { TradeJournalEntryWithRules } from "@/lib/types";

interface DateRangeStatisticsProps {
    trades: TradeJournalEntryWithRules[];
    startDate?: Date;
    endDate?: Date;
}

export function DateRangeStatistics({
    trades,
    startDate,
    endDate,
}: DateRangeStatisticsProps) {
    // Calculate statistics for the date range
    const stats = useMemo(() => {
        // Filter out trades without profit/loss data
        const tradesWithPL = trades.filter(
            (trade) => trade.profitLoss !== null
        );

        // Count trades
        const totalTrades = tradesWithPL.length;
        const profitableTrades = tradesWithPL.filter(
            (trade) => (trade.profitLoss || 0) > 0
        ).length;
        const unprofitableTrades = tradesWithPL.filter(
            (trade) => (trade.profitLoss || 0) < 0
        ).length;

        // Calculate win rate
        const winRate =
            totalTrades > 0 ? (profitableTrades / totalTrades) * 100 : 0;

        // Calculate profit/loss
        const totalProfit = tradesWithPL.reduce(
            (sum, trade) => sum + (trade.profitLoss || 0),
            0
        );

        // Calculate average profit and loss
        const profits = tradesWithPL
            .filter((trade) => (trade.profitLoss || 0) > 0)
            .map((trade) => trade.profitLoss || 0);
        const losses = tradesWithPL
            .filter((trade) => (trade.profitLoss || 0) < 0)
            .map((trade) => trade.profitLoss || 0);

        const averageProfit =
            profits.length > 0
                ? profits.reduce((sum, profit) => sum + profit, 0) /
                  profits.length
                : 0;
        const averageLoss =
            losses.length > 0
                ? losses.reduce((sum, loss) => sum + loss, 0) / losses.length
                : 0;

        // Calculate profit factor
        const grossProfit = profits.reduce((sum, profit) => sum + profit, 0);
        const grossLoss = Math.abs(losses.reduce((sum, loss) => sum + loss, 0));
        const profitFactor =
            grossLoss > 0
                ? grossProfit / grossLoss
                : grossProfit > 0
                ? Number.POSITIVE_INFINITY
                : 0;

        // Find largest profit and loss
        const largestProfit = profits.length > 0 ? Math.max(...profits) : 0;
        const largestLoss =
            losses.length > 0 ? Math.abs(Math.min(...losses)) : 0;

        return {
            totalTrades,
            profitableTrades,
            unprofitableTrades,
            winRate,
            totalProfit,
            averageProfit,
            averageLoss,
            profitFactor: typeof profitFactor === "number" ? profitFactor : 0,
            largestProfit,
            largestLoss,
        };
    }, [trades]);

    // Format date range for display
    const dateRangeText =
        startDate && endDate
            ? `${format(startDate, "MMM d, yyyy")} - ${format(
                  endDate,
                  "MMM d, yyyy"
              )}`
            : "Selected period";

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-semibold">
                Performance Summary: {dateRangeText}
            </h2>

            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Trades
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {stats.totalTrades}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {stats.profitableTrades} profitable /{" "}
                            {stats.unprofitableTrades} unprofitable
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">
                            Win Rate
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center">
                            <Percent className="h-5 w-5 text-muted-foreground mr-2" />
                            <span className="text-2xl font-bold">
                                {stats.winRate.toFixed(1)}%
                            </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Profit factor: {stats.profitFactor.toFixed(2)}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total P/L
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center">
                            {stats.totalProfit >= 0 ? (
                                <TrendingUp className="h-5 w-5 text-green-500 mr-2" />
                            ) : (
                                <TrendingDown className="h-5 w-5 text-red-500 mr-2" />
                            )}
                            <span
                                className={`text-2xl font-bold ${
                                    stats.totalProfit >= 0
                                        ? "text-green-500"
                                        : "text-red-500"
                                }`}
                            >
                                {formatCurrency(stats.totalProfit)}
                            </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Avg win: {formatCurrency(stats.averageProfit)} / Avg
                            loss: {formatCurrency(stats.averageLoss)}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">
                            Largest Trade
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col">
                            <div className="flex items-center">
                                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                                <span className="text-sm font-medium text-green-500">
                                    {formatCurrency(stats.largestProfit)}
                                </span>
                            </div>
                            <div className="flex items-center mt-1">
                                <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                                <span className="text-sm font-medium text-red-500">
                                    {formatCurrency(stats.largestLoss)}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
