"use client";

import { useState } from "react";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, ArrowUpRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { TradeJournalEntryWithRules, Rule } from "@/lib/types";

interface TradesListProps {
    entries: TradeJournalEntryWithRules[];
    rules: Rule[];
}

export function TradesList({ entries, rules }: TradesListProps) {
    const [filter, setFilter] = useState<"all" | "profitable" | "unprofitable">(
        "all"
    );

    // Group entries by date
    const entriesByDate = entries.reduce((acc, entry) => {
        if (!acc[entry.date]) {
            acc[entry.date] = [];
        }
        acc[entry.date].push(entry);
        return acc;
    }, {} as Record<string, TradeJournalEntryWithRules[]>);

    // Sort dates in descending order
    const sortedDates = Object.keys(entriesByDate).sort((a, b) => {
        return new Date(b).getTime() - new Date(a).getTime();
    });

    // Filter entries based on selected filter
    const filteredDates = sortedDates.filter((date) => {
        if (filter === "all") return true;

        const dateEntries = entriesByDate[date];
        if (filter === "profitable") {
            return dateEntries.some((entry) => (entry.profitLoss || 0) > 0);
        } else {
            return dateEntries.some((entry) => (entry.profitLoss || 0) < 0);
        }
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2">
                <Badge
                    variant={filter === "all" ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setFilter("all")}
                >
                    All Trades
                </Badge>
                <Badge
                    variant={filter === "profitable" ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setFilter("profitable")}
                >
                    Profitable
                </Badge>
                <Badge
                    variant={filter === "unprofitable" ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setFilter("unprofitable")}
                >
                    Unprofitable
                </Badge>
            </div>

            {filteredDates.length === 0 ? (
                <div className="text-center p-8 border rounded-lg border-border">
                    <p className="text-muted-foreground">
                        No trades match the selected filter.
                    </p>
                </div>
            ) : (
                filteredDates.map((date) => {
                    const dateEntries = entriesByDate[date];
                    const formattedDate = format(
                        parseISO(date),
                        "EEEE, MMMM d, yyyy"
                    );

                    // Filter entries for this date based on selected filter
                    const filteredEntries = dateEntries.filter((entry) => {
                        if (filter === "all") return true;
                        if (filter === "profitable")
                            return (entry.profitLoss || 0) > 0;
                        return (entry.profitLoss || 0) < 0;
                    });

                    if (filteredEntries.length === 0) return null;

                    return (
                        <div key={date} className="space-y-3">
                            <h3 className="font-medium text-sm text-muted-foreground">
                                {formattedDate}
                            </h3>
                            <div className="grid gap-3">
                                {filteredEntries.map((entry) => (
                                    <Link
                                        href={`/journal/${entry.id}`}
                                        key={entry.id}
                                        className="block"
                                    >
                                        <Card className="hover:border-primary/50 transition-colors">
                                            <CardHeader className="pb-2">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <CardTitle className="text-base flex items-center">
                                                            {entry.symbol}
                                                            <ArrowUpRight className="ml-2 h-4 w-4 text-muted-foreground" />
                                                        </CardTitle>
                                                        <CardDescription>
                                                            <Badge
                                                                variant="outline"
                                                                className="mr-1"
                                                            >
                                                                {entry.market}
                                                            </Badge>
                                                            <Badge
                                                                variant={
                                                                    entry.direction ===
                                                                    "Long"
                                                                        ? "default"
                                                                        : "destructive"
                                                                }
                                                                className="mr-1"
                                                            >
                                                                {
                                                                    entry.direction
                                                                }
                                                            </Badge>
                                                            {entry.setup && (
                                                                <Badge
                                                                    variant="secondary"
                                                                    className="mr-1"
                                                                >
                                                                    {
                                                                        entry.setup
                                                                    }
                                                                </Badge>
                                                            )}
                                                        </CardDescription>
                                                    </div>
                                                    {entry.profitLoss !==
                                                        null && (
                                                        <div
                                                            className={`flex items-center ${
                                                                (entry.profitLoss ||
                                                                    0) >= 0
                                                                    ? "text-green-500"
                                                                    : "text-red-500"
                                                            }`}
                                                        >
                                                            {(entry.profitLoss ||
                                                                0) >= 0 ? (
                                                                <TrendingUp className="h-4 w-4 mr-1" />
                                                            ) : (
                                                                <TrendingDown className="h-4 w-4 mr-1" />
                                                            )}
                                                            <span className="font-medium">
                                                                {formatCurrency(
                                                                    entry.profitLoss ||
                                                                        0
                                                                )}
                                                            </span>
                                                            {entry.profitLossPercentage && (
                                                                <span className="text-xs ml-1">
                                                                    (
                                                                    {entry.profitLossPercentage.toFixed(
                                                                        2
                                                                    )}
                                                                    %)
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="grid grid-cols-2 gap-2 text-sm">
                                                    <div>
                                                        <span className="text-muted-foreground">
                                                            Entry:
                                                        </span>{" "}
                                                        {entry.entryPrice.toFixed(
                                                            2
                                                        )}
                                                    </div>
                                                    <div>
                                                        <span className="text-muted-foreground">
                                                            Exit:
                                                        </span>{" "}
                                                        {entry.exitPrice
                                                            ? entry.exitPrice.toFixed(
                                                                  2
                                                              )
                                                            : "Open"}
                                                    </div>
                                                    <div>
                                                        <span className="text-muted-foreground">
                                                            Size:
                                                        </span>{" "}
                                                        {entry.positionSize}
                                                    </div>
                                                    <div>
                                                        <span className="text-muted-foreground">
                                                            Duration:
                                                        </span>{" "}
                                                        {entry.duration ||
                                                            "N/A"}
                                                    </div>
                                                </div>

                                                {entry.rules.length > 0 && (
                                                    <div className="mt-3 flex flex-wrap gap-1">
                                                        {entry.rules.map(
                                                            (rule) => (
                                                                <Badge
                                                                    key={
                                                                        rule.id
                                                                    }
                                                                    variant="outline"
                                                                    className="text-xs"
                                                                >
                                                                    {rule.name}
                                                                </Badge>
                                                            )
                                                        )}
                                                    </div>
                                                )}

                                                {entry.notes && (
                                                    <div className="mt-3 text-sm text-muted-foreground line-clamp-2">
                                                        {entry.notes}
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    );
                })
            )}
        </div>
    );
}
