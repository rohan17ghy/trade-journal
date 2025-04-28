"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, TrendingUp, TrendingDown } from "lucide-react";
import { TradeFormCompact } from "./trade-form-compact";
import { getTradeJournalEntriesByDateAction } from "@/app/journal/actions";
import type { TradeJournalEntryWithRules } from "@/lib/types";

interface JournalTradesProps {
    date: string;
    dailyJournalId?: string;
}

export function JournalTrades({ date, dailyJournalId }: JournalTradesProps) {
    const [trades, setTrades] = useState<TradeJournalEntryWithRules[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadTrades = async () => {
        setIsLoading(true);
        try {
            const result = await getTradeJournalEntriesByDateAction(date);
            if (result.success && result.data) {
                setTrades(result.data);
            } else {
                setTrades([]);
                if (result.error) {
                    setError(result.error);
                }
            }
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to load trades"
            );
            setTrades([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadTrades();
    }, [date]);

    // Calculate total P/L
    const totalProfitLoss = trades.reduce((sum, trade) => {
        return sum + (trade.profitLoss || 0);
    }, 0);

    const handleTradeAdded = () => {
        loadTrades();
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Trades for {date}</h3>
                {totalProfitLoss !== 0 && trades.length > 0 && (
                    <div className="flex items-center">
                        {totalProfitLoss >= 0 ? (
                            <TrendingUp className="h-5 w-5 text-green-500 mr-2" />
                        ) : (
                            <TrendingDown className="h-5 w-5 text-red-500 mr-2" />
                        )}
                        <span
                            className={`font-medium ${
                                totalProfitLoss >= 0
                                    ? "text-green-500"
                                    : "text-red-500"
                            }`}
                        >
                            Total P/L: ${totalProfitLoss.toFixed(2)}
                        </span>
                    </div>
                )}
            </div>

            <TradeFormCompact
                date={date}
                onTradeAdded={handleTradeAdded}
                dailyJournalId={dailyJournalId}
                insideForm={true}
            />

            {isLoading ? (
                <div className="flex justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            ) : error ? (
                <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-md">
                    {error}
                </div>
            ) : trades.length === 0 ? (
                <div className="text-center p-8 border rounded-lg border-border">
                    <p className="text-muted-foreground">
                        No trades recorded for this date.
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {trades.map((trade) => (
                        <Card key={trade.id} className="overflow-hidden">
                            <CardHeader className="bg-muted/30 py-3">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <CardTitle className="text-base">
                                            {trade.symbol}
                                        </CardTitle>
                                        <Badge
                                            variant={
                                                trade.direction === "Long"
                                                    ? "default"
                                                    : "destructive"
                                            }
                                        >
                                            {trade.direction}
                                        </Badge>
                                        <Badge variant="outline">
                                            {trade.market}
                                        </Badge>
                                    </div>
                                    {trade.profitLoss !== null && (
                                        <div className="flex items-center">
                                            {trade.profitLoss >= 0 ? (
                                                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                                            ) : (
                                                <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                                            )}
                                            <span
                                                className={`text-sm font-medium ${
                                                    trade.profitLoss >= 0
                                                        ? "text-green-500"
                                                        : "text-red-500"
                                                }`}
                                            >
                                                ${trade.profitLoss.toFixed(2)} (
                                                {trade.profitLossPercentage?.toFixed(
                                                    2
                                                )}
                                                %)
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="py-3">
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div>
                                        <span className="text-muted-foreground">
                                            Entry:
                                        </span>{" "}
                                        ${trade.entryPrice}
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">
                                            Exit:
                                        </span>{" "}
                                        {trade.exitPrice
                                            ? `$${trade.exitPrice}`
                                            : "Open"}
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">
                                            Size:
                                        </span>{" "}
                                        {trade.positionSize}
                                    </div>
                                    {trade.setup && (
                                        <div>
                                            <span className="text-muted-foreground">
                                                Setup:
                                            </span>{" "}
                                            {trade.setup}
                                        </div>
                                    )}
                                </div>
                                {trade.notes && (
                                    <div className="mt-2 pt-2 border-t">
                                        <p className="text-sm">{trade.notes}</p>
                                    </div>
                                )}
                                <div className="mt-2 flex justify-end">
                                    <Button variant="ghost" size="sm" asChild>
                                        <a href={`/journal/${trade.id}`}>
                                            View Details
                                        </a>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
