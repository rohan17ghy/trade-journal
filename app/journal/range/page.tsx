"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
    format,
    startOfWeek,
    endOfWeek,
    startOfMonth,
    endOfMonth,
    startOfYear,
    endOfYear,
    subDays,
} from "date-fns";
import { getTradesByDateRangeAction } from "../actions";
import { getRulesAction } from "@/app/rules/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { TradesList } from "../components/trades-list";
import { DateRangeStatistics } from "../components/date-range-statistics";
import { formatDate } from "@/lib/utils";
import type { TradeJournalEntryWithRules, Rule } from "@/lib/types";

type DateRange =
    | "week"
    | "month"
    | "year"
    | "custom"
    | "last7"
    | "last30"
    | "last90";

export default function TradesByRangePage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Get initial range from URL params or default to "month"
    const initialRange = (searchParams.get("range") as DateRange) || "month";

    const [selectedRange, setSelectedRange] = useState<DateRange>(initialRange);
    const [startDate, setStartDate] = useState<Date | undefined>(undefined);
    const [endDate, setEndDate] = useState<Date | undefined>(undefined);
    const [trades, setTrades] = useState<TradeJournalEntryWithRules[]>([]);
    const [rules, setRules] = useState<Rule[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Set date range based on selected range type
    useEffect(() => {
        const today = new Date();

        switch (selectedRange) {
            case "week":
                setStartDate(startOfWeek(today, { weekStartsOn: 1 })); // Week starts on Monday
                setEndDate(endOfWeek(today, { weekStartsOn: 1 }));
                break;
            case "month":
                setStartDate(startOfMonth(today));
                setEndDate(endOfMonth(today));
                break;
            case "year":
                setStartDate(startOfYear(today));
                setEndDate(endOfYear(today));
                break;
            case "last7":
                setStartDate(subDays(today, 7));
                setEndDate(today);
                break;
            case "last30":
                setStartDate(subDays(today, 30));
                setEndDate(today);
                break;
            case "last90":
                setStartDate(subDays(today, 90));
                setEndDate(today);
                break;
            case "custom":
                // Keep current dates for custom range
                if (!startDate) setStartDate(subDays(today, 30));
                if (!endDate) setEndDate(today);
                break;
        }

        // Update URL with the selected range
        const params = new URLSearchParams(searchParams);
        params.set("range", selectedRange);
        router.push(`/journal/range?${params.toString()}`, { scroll: false });
    }, [selectedRange, router, searchParams]);

    // Load trades when date range changes
    useEffect(() => {
        async function loadData() {
            if (!startDate || !endDate) return;

            setIsLoading(true);
            setError(null);

            try {
                // Format dates for API
                const formattedStartDate = formatDate(startDate);
                const formattedEndDate = formatDate(endDate);

                // Load trades for date range
                const tradesResult = await getTradesByDateRangeAction(
                    formattedStartDate,
                    formattedEndDate
                );
                if (!tradesResult.success) {
                    throw new Error(
                        tradesResult.error || "Failed to load trades"
                    );
                }
                setTrades(tradesResult.data || []);

                // Load rules
                const rulesResult = await getRulesAction();
                if (!rulesResult.success) {
                    throw new Error(
                        rulesResult.error || "Failed to load rules"
                    );
                }
                setRules(rulesResult.data || []);
            } catch (err) {
                setError(
                    err instanceof Error ? err.message : "An error occurred"
                );
            } finally {
                setIsLoading(false);
            }
        }

        loadData();
    }, [startDate, endDate]);

    // Format date range for display
    const dateRangeText =
        startDate && endDate
            ? `${format(startDate, "MMM d, yyyy")} - ${format(
                  endDate,
                  "MMM d, yyyy"
              )}`
            : "Select date range";

    return (
        <div className="w-full max-w-5xl mx-auto py-8 px-4">
            <div className="flex flex-col gap-8">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        Trades by Date Range
                    </h1>
                    <p className="text-muted-foreground">
                        View and analyze your trades for specific time periods
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Select Date Range</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <Select
                                    value={selectedRange}
                                    onValueChange={(value) =>
                                        setSelectedRange(value as DateRange)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select range" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="week">
                                            This Week
                                        </SelectItem>
                                        <SelectItem value="month">
                                            This Month
                                        </SelectItem>
                                        <SelectItem value="year">
                                            This Year
                                        </SelectItem>
                                        <SelectItem value="last7">
                                            Last 7 Days
                                        </SelectItem>
                                        <SelectItem value="last30">
                                            Last 30 Days
                                        </SelectItem>
                                        <SelectItem value="last90">
                                            Last 90 Days
                                        </SelectItem>
                                        <SelectItem value="custom">
                                            Custom Range
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {selectedRange === "custom" && (
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-2">
                                            Start Date
                                        </p>
                                        <DatePicker
                                            date={startDate}
                                            setDate={setStartDate}
                                        />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-2">
                                            End Date
                                        </p>
                                        <DatePicker
                                            date={endDate}
                                            setDate={setEndDate}
                                        />
                                    </div>
                                </div>
                            )}

                            {selectedRange !== "custom" && (
                                <div className="flex items-center">
                                    <p className="text-sm font-medium">
                                        {dateRangeText}
                                    </p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-md">
                        {error}
                    </div>
                )}

                {isLoading ? (
                    <div className="text-center p-8">Loading trades...</div>
                ) : (
                    <>
                        <DateRangeStatistics
                            trades={trades}
                            startDate={startDate}
                            endDate={endDate}
                        />

                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold">
                                Trades ({trades.length})
                            </h2>

                            {trades.length === 0 ? (
                                <Card>
                                    <CardContent className="pt-6 pb-6 text-center">
                                        <p className="text-muted-foreground">
                                            No trades found for the selected
                                            date range.
                                        </p>
                                        <Button className="mt-4" asChild>
                                            <a href="/journal/new">
                                                Add New Trade
                                            </a>
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
