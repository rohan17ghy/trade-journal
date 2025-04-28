"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    format,
    startOfWeek,
    endOfWeek,
    startOfMonth,
    endOfMonth,
} from "date-fns";
import { getTradesByDateRangeAction } from "./actions";
import { getRulesAction } from "../rules/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarPlus, Loader2 } from "lucide-react";
import { JournalStatistics } from "./components/journal-statistics";
import { TradesList } from "./components/trades-list";
import { DateRangeStatistics } from "./components/date-range-statistics";
import { formatDate } from "@/lib/utils";
import type { TradeJournalEntryWithRules, Rule } from "@/lib/types";
import { DatePicker } from "@/components/ui/date-picker";

type TimeRange = "week" | "month" | "all" | "custom";

export default function JournalPage() {
    const [selectedRange, setSelectedRange] = useState<TimeRange>("week");
    const [trades, setTrades] = useState<TradeJournalEntryWithRules[]>([]);
    const [rules, setRules] = useState<Rule[]>([]);
    const [startDate, setStartDate] = useState<Date | undefined>(undefined);
    const [endDate, setEndDate] = useState<Date | undefined>(undefined);
    const [isLoading, setIsLoading] = useState(true);
    const [isChangingRange, setIsChangingRange] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Load rules once on component mount
    useEffect(() => {
        async function loadRules() {
            try {
                const rulesResult = await getRulesAction();
                if (rulesResult.success) {
                    setRules(rulesResult.data || []);
                } else {
                    console.error("Failed to load rules:", rulesResult.error);
                }
            } catch (err) {
                console.error("Error loading rules:", err);
            }
        }

        loadRules();
    }, []);

    // Calculate and set date range when selected range changes
    useEffect(() => {
        const today = new Date();

        switch (selectedRange) {
            case "week": {
                // Use weekStartsOn: 1 to start week on Monday
                const start = startOfWeek(today, { weekStartsOn: 1 });
                const end = endOfWeek(today, { weekStartsOn: 1 });
                setStartDate(start);
                setEndDate(end);
                break;
            }
            case "month": {
                const start = startOfMonth(today);
                const end = endOfMonth(today);
                setStartDate(start);
                setEndDate(end);
                break;
            }
            case "all": {
                // For "all", we set both dates to undefined
                setStartDate(undefined);
                setEndDate(undefined);
                break;
            }
            case "custom": {
                // For custom, we don't automatically set dates or trigger a load
                // The user will select dates and click Apply
                if (!startDate) setStartDate(today);
                if (!endDate) setEndDate(today);
                return; // Don't trigger a load yet
            }
        }
    }, [selectedRange]);

    // Load trades when date range or selected range changes
    useEffect(() => {
        async function loadTrades() {
            setIsLoading(true);
            setError(null);

            try {
                // Set a timeout to prevent infinite loading
                const timeoutId = setTimeout(() => {
                    setIsLoading(false);
                    setError("Request timed out. Please try again.");
                }, 10000); // 10 second timeout

                let formattedStartDate = "";
                let formattedEndDate = "";

                // Only format dates if they exist and we're not in "all" mode
                if (selectedRange !== "all" && startDate && endDate) {
                    formattedStartDate = formatDate(startDate);
                    formattedEndDate = formatDate(endDate);
                }

                console.log(`Loading trades for range: ${selectedRange}`);
                console.log(
                    `Start date: ${formattedStartDate}, End date: ${formattedEndDate}`
                );

                const tradesResult = await getTradesByDateRangeAction(
                    formattedStartDate,
                    formattedEndDate
                );

                // Clear the timeout since we got a response
                clearTimeout(timeoutId);

                if (tradesResult.success) {
                    console.log(
                        `Loaded ${tradesResult.data?.length || 0} trades`
                    );
                    setTrades(tradesResult.data || []);
                } else {
                    throw new Error(
                        tradesResult.error || "Failed to load trades"
                    );
                }
            } catch (err) {
                console.error("Error loading trades:", err);
                setError(
                    err instanceof Error ? err.message : "An error occurred"
                );
                setTrades([]);
            } finally {
                setIsLoading(false);
                setIsChangingRange(false);
            }
        }

        loadTrades();
    }, [startDate, endDate, selectedRange]);

    // Handle tab change
    const handleRangeChange = (value: string) => {
        setIsChangingRange(true);
        setSelectedRange(value as TimeRange);
    };

    // Format date range for display
    const dateRangeText =
        selectedRange === "all"
            ? "All Trades"
            : startDate && endDate
            ? `${format(startDate, "MMM d")} - ${format(
                  endDate,
                  "MMM d, yyyy"
              )}`
            : "";

    return (
        <div className="w-full max-w-5xl mx-auto py-8 px-4">
            <div className="flex flex-col gap-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Trade Journal
                        </h1>
                        <p className="text-muted-foreground">
                            Record and analyze your daily trades
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button asChild>
                            <Link href="/journal/new">
                                <CalendarPlus className="mr-2 h-4 w-4" />
                                New Trade
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <Tabs
                        value={selectedRange}
                        onValueChange={handleRangeChange}
                    >
                        <TabsList>
                            <TabsTrigger
                                value="week"
                                disabled={isChangingRange}
                            >
                                This Week
                            </TabsTrigger>
                            <TabsTrigger
                                value="month"
                                disabled={isChangingRange}
                            >
                                This Month
                            </TabsTrigger>
                            <TabsTrigger value="all" disabled={isChangingRange}>
                                All Trades
                            </TabsTrigger>
                            <TabsTrigger
                                value="custom"
                                disabled={isChangingRange}
                            >
                                Custom Range
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                    <div className="flex items-center gap-2">
                        {isChangingRange && (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        )}
                        {dateRangeText && (
                            <div className="text-sm font-medium">
                                {dateRangeText}
                            </div>
                        )}
                    </div>
                </div>

                {selectedRange === "custom" && (
                    <div className="flex flex-col sm:flex-row gap-4 mt-4">
                        <div className="flex-1">
                            <p className="text-sm text-muted-foreground mb-2">
                                Start Date
                            </p>
                            <DatePicker
                                date={startDate}
                                setDate={setStartDate}
                            />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm text-muted-foreground mb-2">
                                End Date
                            </p>
                            <DatePicker date={endDate} setDate={setEndDate} />
                        </div>
                        <div className="flex items-end">
                            <Button
                                onClick={() => {
                                    if (startDate && endDate) {
                                        setIsChangingRange(true);
                                    }
                                }}
                                disabled={
                                    !startDate || !endDate || isChangingRange
                                }
                            >
                                Apply
                            </Button>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-md">
                        {error}
                    </div>
                )}

                {isLoading ? (
                    <div className="text-center p-8">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                        <p>Loading trades...</p>
                    </div>
                ) : (
                    <>
                        {selectedRange !== "all" && startDate && endDate ? (
                            <DateRangeStatistics
                                trades={trades}
                                startDate={startDate}
                                endDate={endDate}
                            />
                        ) : (
                            <JournalStatistics />
                        )}

                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold">
                                Trades ({trades.length})
                            </h2>

                            {trades.length === 0 ? (
                                <Card>
                                    <CardContent className="pt-6 pb-6 text-center">
                                        <p className="text-muted-foreground">
                                            {selectedRange === "all"
                                                ? "No trade journal entries yet. Start by adding your first trade."
                                                : `No trades found for ${
                                                      selectedRange === "week"
                                                          ? "this week"
                                                          : "this month"
                                                  }.`}
                                        </p>
                                        <Button className="mt-4" asChild>
                                            <Link href="/journal/new">
                                                <CalendarPlus className="mr-2 h-4 w-4" />
                                                Add Trade
                                            </Link>
                                        </Button>
                                    </CardContent>
                                </Card>
                            ) : (
                                <TradesList entries={trades} rules={rules} />
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
