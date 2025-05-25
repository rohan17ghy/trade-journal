"use client";

import { useState, useEffect, useMemo } from "react";
import { Calendar } from "@/components/ui/calendar";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    ChevronLeft,
    ChevronRight,
    TrendingUp,
    TrendingDown,
    XCircle,
    Clock,
} from "lucide-react";
import { format, addMonths, subMonths } from "date-fns";
import { getTrendEventsAction } from "./actions";
import type { TrendEventWithRule } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import type { DayContentProps } from "react-day-picker";

const DEFAULT_INSTRUMENT = "EURUSD"; // Replace with your preferred default instrument

// Custom failed reversal icons with stop sign in bottom right
const FailedBullishIcon = ({ size = "small" }) => {
    const isSmall = size === "small";
    const arrowSize = isSmall ? 4 : 5;
    const stopSize = isSmall ? 2.5 : 3;

    return (
        <div className="relative inline-block">
            <TrendingUp
                className={`h-${arrowSize} w-${arrowSize} text-green-600`}
            />
            <XCircle
                className={`h-${stopSize} w-${stopSize} text-red-500 absolute -bottom-0.5 -right-0.5`}
                fill="white"
                strokeWidth={2.5}
            />
        </div>
    );
};

const FailedBearishIcon = ({ size = "small" }) => {
    const isSmall = size === "small";
    const arrowSize = isSmall ? 4 : 5;
    const stopSize = isSmall ? 2.5 : 3;

    return (
        <div className="relative inline-block">
            <TrendingDown
                className={`h-${arrowSize} w-${arrowSize} text-red-600`}
            />
            <XCircle
                className={`h-${stopSize} w-${stopSize} text-red-500 absolute -bottom-0.5 -right-0.5`}
                fill="white"
                strokeWidth={2.5}
            />
        </div>
    );
};

// Helper function to sort events chronologically
const sortEventsChronologically = (events: TrendEventWithRule[]) => {
    return [...events].sort((a, b) => {
        // First try to sort by date
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();

        if (dateA !== dateB) {
            return dateA - dateB;
        }

        // If dates are the same, sort by time if available
        if (a.time && b.time) {
            return a.time.localeCompare(b.time);
        }

        // If only one has time, put the one with time first
        if (a.time) return -1;
        if (b.time) return 1;

        // If neither has time, try createdAt
        if (a.createdAt && b.createdAt) {
            return (
                new Date(a.createdAt).getTime() -
                new Date(b.createdAt).getTime()
            );
        }

        // Fallback to ID comparison
        const idA = typeof a.id === "string" ? Number.parseInt(a.id, 10) : a.id;
        const idB = typeof b.id === "string" ? Number.parseInt(b.id, 10) : b.id;

        // If conversion was successful (not NaN), use numeric comparison
        if (!isNaN(idA) && !isNaN(idB)) {
            return idA - idB;
        }

        // Fallback to string comparison if ids are not numeric
        return String(a.id).localeCompare(String(b.id));
    });
};

export function TrendCalendar() {
    const [date, setDate] = useState<Date>(new Date());
    const [events, setEvents] = useState<TrendEventWithRule[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadEvents() {
            setLoading(true);
            try {
                const result = await getTrendEventsAction();
                if (result.success && result.data) {
                    // Sort events by date (oldest first) to properly track trend progression
                    const sortedEvents = [...result.data].sort(
                        (a, b) =>
                            new Date(a.date).getTime() -
                            new Date(b.date).getTime()
                    );
                    setEvents(sortedEvents);
                }
            } catch (error) {
                console.error("Failed to load trend events:", error);
            } finally {
                setLoading(false);
            }
        }

        loadEvents();
    }, []);

    const handlePreviousMonth = () => {
        setDate(subMonths(date, 1));
    };

    const handleNextMonth = () => {
        setDate(addMonths(date, 1));
    };

    // Calculate the trend state for each day and track all trend transitions
    const { trendByDate, eventsByDate, dailyTrendTransitions } = useMemo(() => {
        const trendByDate: Record<string, "bullish" | "bearish"> = {};
        const eventsByDate: Record<string, TrendEventWithRule[]> = {};
        const dailyTrendTransitions: Record<
            string,
            Array<{ trend: "bullish" | "bearish"; isStart?: boolean }>
        > = {};

        // Start with bearish trend (default state)
        let currentTrend: "bearish" | "bullish" = "bearish";

        // Group events by date first
        events.forEach((event) => {
            const dateStr = new Date(event.date).toISOString().split("T")[0];

            if (!eventsByDate[dateStr]) {
                eventsByDate[dateStr] = [];
            }
            eventsByDate[dateStr].push(event);
        });

        // Get all dates in chronological order
        const allDates = Object.keys(eventsByDate).sort();

        // Process each date in chronological order
        allDates.forEach((dateStr, index) => {
            const dayEvents = eventsByDate[dateStr];
            const sortedEvents = sortEventsChronologically(dayEvents);

            // Initialize transitions array with the starting trend
            dailyTrendTransitions[dateStr] = [
                { trend: currentTrend, isStart: true },
            ];

            // Process all events for this day
            sortedEvents.forEach((event) => {
                if (event.eventType === "successful_reversal") {
                    // Flip the trend
                    currentTrend =
                        event.direction === "uptrend" ? "bullish" : "bearish";

                    // Add this transition to the array
                    dailyTrendTransitions[dateStr].push({
                        trend: currentTrend,
                    });
                }
            });

            // Set the final trend for this day
            trendByDate[dateStr] = currentTrend;
        });

        // Now fill in the gaps for dates without events
        // to ensure continuity of trend colors
        const allDatesSet = new Set(allDates);

        // Get min and max dates from the events
        if (allDates.length > 0) {
            const minDate = new Date(allDates[0]);
            const maxDate = new Date(allDates[allDates.length - 1]);

            // Iterate through all dates in the range
            const currentDate = new Date(minDate);
            while (currentDate <= maxDate) {
                const dateStr = currentDate.toISOString().split("T")[0];

                // If this date doesn't have events, set its trend based on the previous date
                if (!allDatesSet.has(dateStr)) {
                    // Find the most recent date with a trend
                    let mostRecentTrend: "bullish" | "bearish" | null = null;
                    let mostRecentDateStr: string | null = null;

                    for (const d of allDates) {
                        if (d < dateStr && trendByDate[d]) {
                            mostRecentTrend = trendByDate[d];
                            mostRecentDateStr = d;
                        }
                    }

                    if (mostRecentTrend) {
                        trendByDate[dateStr] = mostRecentTrend;
                        dailyTrendTransitions[dateStr] = [
                            { trend: mostRecentTrend, isStart: true },
                        ];
                    }
                }

                // Move to next day
                currentDate.setDate(currentDate.getDate() + 1);
            }
        }

        return { trendByDate, eventsByDate, dailyTrendTransitions };
    }, [events]);

    // Get the appropriate icon based on event type and direction
    const getEventIcon = (
        event: TrendEventWithRule,
        size: "small" | "large" = "small"
    ) => {
        const direction = event.direction || "uptrend"; // Default to uptrend if not specified
        const isSmall = size === "small";

        if (event.eventType === "successful_reversal") {
            if (direction === "uptrend") {
                return (
                    <TrendingUp
                        className={`${
                            isSmall ? "h-4 w-4" : "h-5 w-5"
                        } text-green-600`}
                    />
                );
            } else {
                return (
                    <TrendingDown
                        className={`${
                            isSmall ? "h-4 w-4" : "h-5 w-5"
                        } text-red-600`}
                    />
                );
            }
        } else {
            // failed_reversal
            if (direction === "uptrend") {
                return <FailedBullishIcon size={size} />;
            } else {
                return <FailedBearishIcon size={size} />;
            }
        }
    };

    // Determine the background style for a day based on its trend transitions
    const getDayBackgroundStyle = (day: Date) => {
        // Check if the date is in the future
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset time to start of day for accurate comparison

        // If the date is in the future, don't apply any background color
        if (day > today) {
            return {}; // Return empty style for future dates
        }

        const dateStr = day.toISOString().split("T")[0];
        const transitions = dailyTrendTransitions[dateStr];

        // If no trend data for this day, find the most recent trend before this day
        if (!transitions || transitions.length === 0) {
            // Find the most recent date with trend data
            const trendDates = Object.keys(trendByDate).sort();
            let mostRecentTrend: "bullish" | "bearish" | null = null;

            for (const trendDate of trendDates) {
                if (trendDate <= dateStr) {
                    mostRecentTrend = trendByDate[trendDate];
                } else {
                    break;
                }
            }

            // If we found a trend, use it
            if (mostRecentTrend) {
                return mostRecentTrend === "bullish"
                    ? { backgroundColor: "rgba(34, 197, 94, 0.2)" } // Light green
                    : { backgroundColor: "rgba(239, 68, 68, 0.2)" }; // Light red
            }

            // No trend data at all
            return {};
        }

        // If there's only one trend for the day (no transitions), use a solid color
        if (transitions.length === 1) {
            return transitions[0].trend === "bullish"
                ? { backgroundColor: "rgba(34, 197, 94, 0.2)" } // Light green
                : { backgroundColor: "rgba(239, 68, 68, 0.2)" }; // Light red
        }

        // For days with multiple transitions, create a gradient
        // that shows all the transitions
        if (transitions.length === 2) {
            // Simple case: just one transition (e.g., bearish to bullish)
            const startTrend = transitions[0].trend;
            const endTrend = transitions[1].trend;

            if (startTrend === "bearish" && endTrend === "bullish") {
                // Bearish to bullish (red to green)
                return {
                    background:
                        "linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(34, 197, 94, 0.2) 100%)",
                };
            } else if (startTrend === "bullish" && endTrend === "bearish") {
                // Bullish to bearish (green to red)
                return {
                    background:
                        "linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(239, 68, 68, 0.2) 100%)",
                };
            }
        } else if (transitions.length === 3) {
            // Two transitions (e.g., bearish to bullish to bearish)
            const startTrend = transitions[0].trend;
            const middleTrend = transitions[1].trend;
            const endTrend = transitions[2].trend;

            if (
                startTrend === "bearish" &&
                middleTrend === "bullish" &&
                endTrend === "bearish"
            ) {
                // Bearish to bullish to bearish (red to green to red)
                return {
                    background:
                        "linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(34, 197, 94, 0.2) 50%, rgba(239, 68, 68, 0.2) 100%)",
                };
            } else if (
                startTrend === "bullish" &&
                middleTrend === "bearish" &&
                endTrend === "bullish"
            ) {
                // Bullish to bearish to bullish (green to red to green)
                return {
                    background:
                        "linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(239, 68, 68, 0.2) 50%, rgba(34, 197, 94, 0.2) 100%)",
                };
            }
        } else if (transitions.length >= 4) {
            // More than two transitions - use a more complex gradient
            // For simplicity, we'll just show the start and end trends
            const startTrend = transitions[0].trend;
            const endTrend = transitions[transitions.length - 1].trend;

            // If start and end are the same, use a more complex pattern
            if (startTrend === endTrend) {
                if (startTrend === "bullish") {
                    // Started and ended bullish with transitions in between
                    return {
                        background:
                            "linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(239, 68, 68, 0.2) 50%, rgba(34, 197, 94, 0.2) 100%)",
                    };
                } else {
                    // Started and ended bearish with transitions in between
                    return {
                        background:
                            "linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(34, 197, 94, 0.2) 50%, rgba(239, 68, 68, 0.2) 100%)",
                    };
                }
            } else {
                // Different start and end trends
                if (startTrend === "bearish" && endTrend === "bullish") {
                    // Bearish to bullish with multiple transitions
                    return {
                        background:
                            "linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(34, 197, 94, 0.2) 100%)",
                    };
                } else {
                    // Bullish to bearish with multiple transitions
                    return {
                        background:
                            "linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(239, 68, 68, 0.2) 100%)",
                    };
                }
            }
        }

        // Fallback to solid color based on the final trend
        const finalTrend = transitions[transitions.length - 1].trend;
        return finalTrend === "bullish"
            ? { backgroundColor: "rgba(34, 197, 94, 0.2)" } // Light green
            : { backgroundColor: "rgba(239, 68, 68, 0.2)" }; // Light red
    };

    // Custom day content renderer
    function CustomDayContent(props: DayContentProps) {
        const dateStr = props.date.toISOString().split("T")[0];
        const dayEvents = eventsByDate[dateStr] || [];
        const backgroundStyle = getDayBackgroundStyle(props.date);

        // Sort events chronologically for display
        const sortedEvents = sortEventsChronologically(dayEvents);

        return (
            <div
                className="relative w-full h-full min-h-[70px] p-1 flex flex-col items-center rounded-md transition-colors"
                style={backgroundStyle}
            >
                <div className="text-sm mb-2">{format(props.date, "d")}</div>

                {/* Visual indicators - centered in the cell */}
                {sortedEvents.length > 0 && (
                    <div className="flex flex-wrap justify-center gap-3 mt-2">
                        {sortedEvents.map((event, index) => (
                            <div key={index} className="flex items-center">
                                {getEventIcon(event)}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    if (loading) {
        return (
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <Skeleton className="h-8 w-[150px]" />
                    <div className="flex gap-2">
                        <Skeleton className="h-8 w-8" />
                        <Skeleton className="h-8 w-8" />
                    </div>
                </div>
                <Skeleton className="h-[600px] w-full" />
            </div>
        );
    }

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                    <CardTitle className="text-xl font-bold">
                        {DEFAULT_INSTRUMENT} - {format(date, "MMMM yyyy")}
                    </CardTitle>
                    <div className="flex gap-1">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={handlePreviousMonth}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={handleNextMonth}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
                <CardDescription>
                    View trend reversals by month. Background colors indicate
                    current trend and reversals.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border p-4">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={(newDate) => newDate && setDate(newDate)}
                        month={date}
                        className="w-full"
                        classNames={{
                            months: "w-full",
                            month: "w-full",
                            table: "w-full border-collapse",
                            head_row: "flex w-full",
                            head_cell:
                                "text-muted-foreground rounded-md w-full font-normal text-[0.8rem] flex-1",
                            row: "flex w-full mt-2",
                            cell: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 flex-1",
                            day: "h-20 w-full p-0 font-normal aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground",
                            day_selected:
                                "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                            day_today: "bg-accent text-accent-foreground",
                            day_outside: "text-muted-foreground opacity-50",
                            day_disabled: "text-muted-foreground opacity-50",
                            nav: "space-x-1 flex items-center",
                        }}
                        components={{
                            DayContent: CustomDayContent,
                        }}
                    />
                </div>

                {/* Event details for selected date */}
                {date && (
                    <div className="mt-4">
                        <h3 className="text-sm font-medium mb-2">
                            Events on {format(date, "MMMM d, yyyy")}
                        </h3>
                        {(() => {
                            const dateStr = date.toISOString().split("T")[0];
                            const dayEvents = eventsByDate[dateStr] || [];
                            const trend = trendByDate[dateStr];

                            if (dayEvents.length === 0) {
                                // Find the current trend for this day
                                const currentTrend = (() => {
                                    // Find the most recent date with trend data
                                    const trendDates =
                                        Object.keys(trendByDate).sort();
                                    let mostRecentTrend:
                                        | "bullish"
                                        | "bearish"
                                        | null = null;

                                    for (const trendDate of trendDates) {
                                        if (trendDate <= dateStr) {
                                            mostRecentTrend =
                                                trendByDate[trendDate];
                                        } else {
                                            break;
                                        }
                                    }

                                    return mostRecentTrend;
                                })();

                                return (
                                    <div>
                                        <p className="text-sm text-muted-foreground">
                                            No events on this day
                                        </p>
                                        {currentTrend && (
                                            <p className="text-sm mt-1">
                                                Current trend:{" "}
                                                <span
                                                    className={
                                                        currentTrend ===
                                                        "bullish"
                                                            ? "text-green-600 font-medium"
                                                            : "text-red-600 font-medium"
                                                    }
                                                >
                                                    {currentTrend.toUpperCase()}
                                                </span>
                                            </p>
                                        )}
                                    </div>
                                );
                            }

                            // Sort events chronologically for display in details panel
                            const sortedEvents =
                                sortEventsChronologically(dayEvents);

                            return (
                                <div className="space-y-2">
                                    {trend && (
                                        <p className="text-sm mb-2">
                                            Trend:{" "}
                                            <span
                                                className={
                                                    trend === "bullish"
                                                        ? "text-green-600 font-medium"
                                                        : "text-red-600 font-medium"
                                                }
                                            >
                                                {trend.toUpperCase()}
                                            </span>
                                        </p>
                                    )}
                                    {sortedEvents.map((event) => (
                                        <div
                                            key={event.id}
                                            className="flex items-start gap-2 p-2 rounded-md border"
                                        >
                                            {getEventIcon(event, "large")}
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-sm">
                                                        {event.title ||
                                                            DEFAULT_INSTRUMENT}
                                                    </span>
                                                    <Badge
                                                        variant={
                                                            event.eventType ===
                                                            "successful_reversal"
                                                                ? "default"
                                                                : "secondary"
                                                        }
                                                        className="text-xs"
                                                    >
                                                        {event.eventType ===
                                                        "successful_reversal"
                                                            ? "Successful"
                                                            : "Failed"}
                                                    </Badge>
                                                    {event.rule && (
                                                        <Badge
                                                            variant="outline"
                                                            className="text-xs"
                                                        >
                                                            {event.rule.name}
                                                        </Badge>
                                                    )}
                                                </div>
                                                {event.time && (
                                                    <div className="flex items-center text-xs text-muted-foreground mt-1">
                                                        <Clock className="h-3 w-3 mr-1" />
                                                        <span>
                                                            {event.time}
                                                        </span>
                                                    </div>
                                                )}
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {event.description}
                                                </p>
                                                {event.direction && (
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        Direction:{" "}
                                                        {event.direction ===
                                                        "uptrend"
                                                            ? "Bullish"
                                                            : "Bearish"}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            );
                        })()}
                    </div>
                )}

                <div className="mt-6">
                    <Link href="/trend-analysis?tab=add">
                        <Button className="w-full">
                            <TrendingUp className="mr-2 h-4 w-4" />
                            Add New Trend Event
                        </Button>
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}
