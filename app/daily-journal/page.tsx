"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { getAllDailyJournalsAction, getAllTradeDatesAction } from "./actions";
import { getRulePerformanceEntriesForDateAction } from "@/app/rules-performance/actions";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    CalendarPlus,
    TrendingUp,
    TrendingDown,
    CalendarIcon,
    CheckCircle,
    XCircle,
} from "lucide-react";
import { JournalCalendar } from "./components/journal-calendar";
import { formatCurrency } from "@/lib/utils";
import type {
    DailyJournalWithTrades,
    RulePerformanceEntryWithRule,
} from "@/lib/types";

export default function DailyJournalPage() {
    const router = useRouter();
    const [journals, setJournals] = useState<DailyJournalWithTrades[]>([]);
    const [tradeDates, setTradeDates] = useState<string[]>([]);
    const [selectedDate, setSelectedDate] = useState<string>(
        format(new Date(), "yyyy-MM-dd")
    );
    const [rulePerformances, setRulePerformances] = useState<
        RulePerformanceEntryWithRule[]
    >([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingPerformances, setIsLoadingPerformances] = useState(false);

    // Load journals and trade dates
    useEffect(() => {
        async function loadData() {
            setIsLoading(true);
            try {
                const journalsResult = await getAllDailyJournalsAction();
                const tradeDatesResult = await getAllTradeDatesAction();

                if (journalsResult.success) {
                    setJournals(journalsResult.data || []);
                }

                if (tradeDatesResult.success) {
                    setTradeDates(tradeDatesResult.data || []);
                }
            } catch (error) {
                console.error("Failed to load journal data:", error);
            } finally {
                setIsLoading(false);
            }
        }

        loadData();
    }, []);

    // Load rule performances when selected date changes
    useEffect(() => {
        async function loadRulePerformances() {
            if (!selectedDate) return;

            setIsLoadingPerformances(true);
            try {
                const result = await getRulePerformanceEntriesForDateAction(
                    selectedDate
                );
                if (result.success) {
                    setRulePerformances(result.data || []);
                } else {
                    setRulePerformances([]);
                }
            } catch (error) {
                console.error("Failed to load rule performances:", error);
                setRulePerformances([]);
            } finally {
                setIsLoadingPerformances(false);
            }
        }

        loadRulePerformances();
    }, [selectedDate]);

    // Handle date selection
    const handleSelectDate = (date: string) => {
        setSelectedDate(date);
    };

    // Find selected journal
    const selectedJournal = journals.find(
        (journal) => journal.date === selectedDate
    );

    // Format the selected date for display
    const formattedSelectedDate = selectedDate
        ? format(parseISO(selectedDate), "EEEE, MMMM d, yyyy")
        : "";

    // Calculate total P/L for the selected date if there are trades
    const totalPL =
        selectedJournal?.trades.reduce(
            (sum, trade) => sum + (trade.profitLoss || 0),
            0
        ) || 0;
    const hasTrades =
        selectedJournal?.trades && selectedJournal.trades.length > 0;
    const hasRulePerformances = rulePerformances.length > 0;

    // Count successful and failed rules
    const successfulRules = rulePerformances.filter(
        (perf) => perf.status === "success"
    ).length;
    const failedRules = rulePerformances.filter(
        (perf) => perf.status === "failure"
    ).length;

    return (
        <div className="w-full max-w-5xl mx-auto py-8 px-4">
            <div className="flex flex-col gap-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Trading Journal
                        </h1>
                        <p className="text-muted-foreground">
                            Record and track your daily trading journey
                        </p>
                    </div>
                </div>

                <div className="grid gap-8 md:grid-cols-[1fr_1fr]">
                    <div>
                        <JournalCalendar
                            journals={journals}
                            tradeDates={tradeDates}
                            onSelectDate={handleSelectDate}
                            selectedDate={selectedDate}
                        />

                        <div className="mt-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">
                                        Journal Stats
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-muted-foreground">
                                                Total Entries
                                            </p>
                                            <p className="text-2xl font-bold">
                                                {journals.length}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">
                                                Trades without Journal
                                            </p>
                                            <p className="text-2xl font-bold">
                                                {tradeDates.length}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    <div>
                        <Card className="h-full flex flex-col">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="flex items-center">
                                            <CalendarIcon className="h-5 w-5 mr-2" />
                                            {formattedSelectedDate}
                                        </CardTitle>
                                        <CardDescription>
                                            {selectedJournal
                                                ? "Journal entry details"
                                                : "No journal entry for this date"}
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="flex-1">
                                {isLoading ? (
                                    <div className="text-center py-8">
                                        Loading journal entries...
                                    </div>
                                ) : selectedJournal ? (
                                    <div className="space-y-4">
                                        <div className="flex flex-wrap gap-2">
                                            {hasTrades && (
                                                <Badge variant="outline">
                                                    {
                                                        selectedJournal.trades
                                                            .length
                                                    }{" "}
                                                    {selectedJournal.trades
                                                        .length === 1
                                                        ? "trade"
                                                        : "trades"}
                                                </Badge>
                                            )}
                                            {hasRulePerformances && (
                                                <Badge variant="outline">
                                                    {rulePerformances.length}{" "}
                                                    rule{" "}
                                                    {rulePerformances.length ===
                                                    1
                                                        ? "evaluation"
                                                        : "evaluations"}
                                                </Badge>
                                            )}
                                        </div>

                                        {hasTrades && (
                                            <div className="flex items-center">
                                                <span className="text-sm font-medium mr-2">
                                                    Total P/L:
                                                </span>
                                                <span
                                                    className={`flex items-center font-medium ${
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
                                                    {formatCurrency(totalPL)}
                                                </span>
                                            </div>
                                        )}

                                        {hasRulePerformances && (
                                            <div className="flex items-center space-x-4">
                                                <div className="flex items-center">
                                                    <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
                                                    <span className="text-sm">
                                                        {successfulRules} rules
                                                        worked well
                                                    </span>
                                                </div>
                                                <div className="flex items-center">
                                                    <XCircle className="h-4 w-4 mr-1 text-red-500" />
                                                    <span className="text-sm">
                                                        {failedRules} rules
                                                        didn't work
                                                    </span>
                                                </div>
                                            </div>
                                        )}

                                        {selectedJournal.marketOverview && (
                                            <div>
                                                <h3 className="text-sm font-medium mb-1">
                                                    Market Overview
                                                </h3>
                                                <p className="text-sm text-muted-foreground line-clamp-3">
                                                    {
                                                        selectedJournal.marketOverview
                                                    }
                                                </p>
                                            </div>
                                        )}

                                        {selectedJournal.insights && (
                                            <div>
                                                <h3 className="text-sm font-medium mb-1">
                                                    Insights
                                                </h3>
                                                <p className="text-sm text-muted-foreground line-clamp-3">
                                                    {selectedJournal.insights}
                                                </p>
                                            </div>
                                        )}

                                        {selectedJournal.ruleModification && (
                                            <div>
                                                <h3 className="text-sm font-medium mb-1">
                                                    Rule Modification
                                                </h3>
                                                <p className="text-sm text-muted-foreground line-clamp-3">
                                                    {
                                                        selectedJournal.ruleModification
                                                    }
                                                </p>
                                            </div>
                                        )}

                                        <div className="pt-2">
                                            <Button asChild>
                                                <Link
                                                    href={`/daily-journal/${selectedDate}`}
                                                >
                                                    View Complete Journal
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full py-12">
                                        <p className="text-muted-foreground mb-6">
                                            No journal entry for this date.
                                        </p>
                                        <Button asChild>
                                            <Link
                                                href={`/daily-journal/new?date=${selectedDate}`}
                                            >
                                                <CalendarPlus className="mr-2 h-4 w-4" />
                                                Add Journal Entry
                                            </Link>
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
