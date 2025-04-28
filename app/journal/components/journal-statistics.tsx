"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Percent, Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

type StatisticsData = {
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
};

export function JournalStatistics() {
    const [stats, setStats] = useState<StatisticsData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchStatistics() {
            try {
                const response = await fetch("/api/statistics");

                if (!response.ok) {
                    throw new Error("Failed to fetch statistics");
                }

                const data = await response.json();
                setStats(data);
            } catch (err) {
                console.error("Error fetching statistics:", err);
                setError(
                    err instanceof Error ? err.message : "An error occurred"
                );
            } finally {
                setIsLoading(false);
            }
        }

        fetchStatistics();
    }, []);

    if (isLoading) {
        return (
            <div className="grid gap-4 md:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                    <Card key={i}>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">
                                Loading...
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex justify-center">
                                <Loader2 className="h-5 w-5 animate-spin" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-md">
                Failed to load statistics: {error}
            </div>
        );
    }

    // Use default values if stats is null
    const data = stats || {
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
    };

    return (
        <div className="grid gap-4 md:grid-cols-4">
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                        Total Trades
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{data.totalTrades}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                        {data.profitableTrades} profitable /{" "}
                        {data.unprofitableTrades} unprofitable
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
                            {data.winRate.toFixed(1)}%
                        </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        Profit factor: {data.profitFactor.toFixed(2)}
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
                        {data.totalProfit >= 0 ? (
                            <TrendingUp className="h-5 w-5 text-green-500 mr-2" />
                        ) : (
                            <TrendingDown className="h-5 w-5 text-red-500 mr-2" />
                        )}
                        <span
                            className={`text-2xl font-bold ${
                                data.totalProfit >= 0
                                    ? "text-green-500"
                                    : "text-red-500"
                            }`}
                        >
                            {formatCurrency(data.totalProfit)}
                        </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        Avg win: {formatCurrency(data.averageProfit)} / Avg
                        loss: {formatCurrency(data.averageLoss)}
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
                                {formatCurrency(data.largestProfit)}
                            </span>
                        </div>
                        <div className="flex items-center mt-1">
                            <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                            <span className="text-sm font-medium text-red-500">
                                {formatCurrency(data.largestLoss)}
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
