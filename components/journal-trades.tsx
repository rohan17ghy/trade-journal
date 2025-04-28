"use client";

import { useState, useEffect } from "react";
import { getTradeJournalEntriesByDateAction } from "@/app/journal/actions";
import { TradeFormCompact } from "@/app/daily-journal/components/trade-form-compact";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { TradeJournalEntryWithRules } from "@/lib/types";

interface JournalTradesProps {
    date: string;
    onTradesChanged?: () => void;
    dailyJournalId?: string;
}

export function JournalTrades({
    date,
    onTradesChanged,
    dailyJournalId,
}: JournalTradesProps) {
    const [trades, setTrades] = useState<TradeJournalEntryWithRules[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Load trades for the selected date
    const loadTrades = async () => {
        setIsLoading(true);
        try {
            const result = await getTradeJournalEntriesByDateAction(date);
            if (result.success) {
                setTrades(result.data || []);
            } else {
                throw new Error(result.error || "Failed to load trades");
            }
        } catch (err) {
            console.error("Error loading trades:", err);
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    // Load trades on mount and when date changes
    useEffect(() => {
        loadTrades();
    }, [date]);

    useEffect(() => {
        onTradesChanged?.();
    }, [trades, onTradesChanged]);

    // Calculate total P/L
    const totalPL = trades.reduce(
        (sum, trade) => sum + (trade.profitLoss || 0),
        0
    );

    if (isLoading) {
        return (
            <div className="flex justify-center items-center p-8">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <TradeFormCompact
                date={date}
                onTradeAdded={loadTrades}
                dailyJournalId={dailyJournalId}
            />

            {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-md">
                    {error}
                </div>
            )}

            {trades.length > 0 ? (
                <>
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium">
                            Trades for {date}
                        </h3>
                        <div
                            className={`flex items-center ${
                                totalPL >= 0 ? "text-green-500" : "text-red-500"
                            }`}
                        >
                            {totalPL >= 0 ? (
                                <TrendingUp className="h-4 w-4 mr-1" />
                            ) : (
                                <TrendingDown className="h-4 w-4 mr-1" />
                            )}
                            <span className="font-medium">
                                {formatCurrency(totalPL)}
                            </span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {trades.map((trade) => (
                            <Card key={trade.id}>
                                <CardHeader className="py-3">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className="text-base">
                                                {trade.symbol}
                                            </CardTitle>
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                <Badge variant="outline">
                                                    {trade.market}
                                                </Badge>
                                                <Badge
                                                    variant={
                                                        trade.direction ===
                                                        "Long"
                                                            ? "default"
                                                            : "destructive"
                                                    }
                                                >
                                                    {trade.direction}
                                                </Badge>
                                                {trade.setup && (
                                                    <Badge variant="secondary">
                                                        {trade.setup}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                        {trade.profitLoss !== null && (
                                            <div
                                                className={`flex items-center ${
                                                    trade.profitLoss >= 0
                                                        ? "text-green-500"
                                                        : "text-red-500"
                                                }`}
                                            >
                                                {trade.profitLoss >= 0 ? (
                                                    <TrendingUp className="h-4 w-4 mr-1" />
                                                ) : (
                                                    <TrendingDown className="h-4 w-4 mr-1" />
                                                )}
                                                <span className="font-medium">
                                                    {formatCurrency(
                                                        trade.profitLoss
                                                    )}
                                                </span>
                                                {trade.profitLossPercentage && (
                                                    <span className="text-xs ml-1">
                                                        (
                                                        {trade.profitLossPercentage.toFixed(
                                                            2
                                                        )}
                                                        %)
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent className="py-0 pb-3">
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div>
                                            <span className="text-muted-foreground">
                                                Entry:
                                            </span>{" "}
                                            {trade.entryPrice.toFixed(2)}
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground">
                                                Exit:
                                            </span>{" "}
                                            {trade.exitPrice
                                                ? trade.exitPrice.toFixed(2)
                                                : "Open"}
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground">
                                                Size:
                                            </span>{" "}
                                            {trade.positionSize}
                                        </div>
                                    </div>

                                    {trade.notes && (
                                        <p className="mt-2 text-sm text-muted-foreground">
                                            {trade.notes}
                                        </p>
                                    )}

                                    {trade.rules.length > 0 && (
                                        <div className="mt-2 flex flex-wrap gap-1">
                                            {trade.rules.map((rule) => (
                                                <Badge
                                                    key={rule.id}
                                                    variant="outline"
                                                    className="text-xs"
                                                >
                                                    {rule.name}
                                                </Badge>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </>
            ) : (
                <div className="text-center p-6 border rounded-md border-border">
                    <p className="text-muted-foreground">
                        No trades recorded for this date yet.
                    </p>
                </div>
            )}
        </div>
    );
}
