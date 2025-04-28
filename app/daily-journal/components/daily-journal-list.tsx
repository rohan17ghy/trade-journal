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
import { ArrowUpRight, Calendar, TrendingUp, TrendingDown } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { DailyJournalWithTrades } from "@/lib/types";

interface DailyJournalListProps {
    journals: DailyJournalWithTrades[];
}

export function DailyJournalList({ journals }: DailyJournalListProps) {
    const [filter, setFilter] = useState<
        "all" | "with-trades" | "without-trades"
    >("all");

    // Filter journals based on selected filter
    const filteredJournals = journals.filter((journal) => {
        if (filter === "all") return true;
        if (filter === "with-trades") return journal.trades.length > 0;
        return journal.trades.length === 0;
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2">
                <Badge
                    variant={filter === "all" ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setFilter("all")}
                >
                    All Entries
                </Badge>
                <Badge
                    variant={filter === "with-trades" ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setFilter("with-trades")}
                >
                    With Trades
                </Badge>
                <Badge
                    variant={
                        filter === "without-trades" ? "default" : "outline"
                    }
                    className="cursor-pointer"
                    onClick={() => setFilter("without-trades")}
                >
                    Without Trades
                </Badge>
            </div>

            {filteredJournals.length === 0 ? (
                <div className="text-center p-8 border rounded-lg border-border">
                    <p className="text-muted-foreground">
                        No journal entries match the selected filter.
                    </p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {filteredJournals.map((journal) => {
                        const formattedDate = format(
                            parseISO(journal.date),
                            "EEEE, MMMM d, yyyy"
                        );

                        // Calculate total P/L for the day
                        const totalPL = journal.trades.reduce(
                            (sum, trade) => sum + (trade.profitLoss || 0),
                            0
                        );
                        const hasTrades = journal.trades.length > 0;

                        return (
                            <Link
                                href={`/daily-journal/${journal.date}`}
                                key={journal.id}
                                className="block"
                            >
                                <Card className="hover:border-primary/50 transition-colors">
                                    <CardHeader className="pb-2">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <CardTitle className="text-base flex items-center">
                                                    <Calendar className="h-4 w-4 mr-2" />
                                                    {formattedDate}
                                                    <ArrowUpRight className="ml-2 h-4 w-4 text-muted-foreground" />
                                                </CardTitle>
                                                <CardDescription>
                                                    {journal.mood && (
                                                        <Badge
                                                            variant="outline"
                                                            className="mr-1"
                                                        >
                                                            Mood: {journal.mood}
                                                        </Badge>
                                                    )}
                                                    {journal.physicalCondition && (
                                                        <Badge
                                                            variant="outline"
                                                            className="mr-1"
                                                        >
                                                            Condition:{" "}
                                                            {
                                                                journal.physicalCondition
                                                            }
                                                        </Badge>
                                                    )}
                                                </CardDescription>
                                            </div>
                                            {hasTrades && (
                                                <div
                                                    className={`flex items-center ${
                                                        totalPL >= 0
                                                            ? "text-green-500"
                                                            : "text-red-500"
                                                    }`}
                                                >
                                                    {totalPL >= 0 ? (
                                                        <TrendingUp className="h-4 w-4 mr-1" />
                                                    ) : (
                                                        <TrendingDown className="h-4 w-4 mr-1" />
                                                    )}
                                                    <span className="font-medium">
                                                        {formatCurrency(
                                                            totalPL
                                                        )}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            {journal.marketOverview && (
                                                <div className="col-span-2">
                                                    <span className="text-muted-foreground">
                                                        Market:
                                                    </span>{" "}
                                                    <span className="line-clamp-1">
                                                        {journal.marketOverview}
                                                    </span>
                                                </div>
                                            )}

                                            {journal.insights && (
                                                <div className="col-span-2">
                                                    <span className="text-muted-foreground">
                                                        Insights:
                                                    </span>{" "}
                                                    <span className="line-clamp-1">
                                                        {journal.insights}
                                                    </span>
                                                </div>
                                            )}

                                            {hasTrades && (
                                                <div>
                                                    <span className="text-muted-foreground">
                                                        Trades:
                                                    </span>{" "}
                                                    {journal.trades.length}
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
