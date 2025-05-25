"use client";

import { useState, useEffect } from "react";
import { getTrendEventsAction, deleteTrendEventAction } from "./actions";
import type { TrendEventWithRule } from "@/lib/types";
import {
    format,
    startOfWeek,
    endOfWeek,
    startOfMonth,
    endOfMonth,
    isWithinInterval,
} from "date-fns";
import {
    TrendingUp,
    TrendingDown,
    Trash2,
    ChevronDown,
    ChevronRight,
    Calendar,
    Clock,
    CheckCircle,
    XCircle,
    CalendarIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";

const DEFAULT_INSTRUMENT = "EURUSD"; // Replace with your preferred default instrument

type DateRangeType = "all" | "this-week" | "this-month" | "custom";

interface DateRange {
    from: Date | undefined;
    to: Date | undefined;
}

export function TrendTimeline() {
    const router = useRouter();
    const [events, setEvents] = useState<TrendEventWithRule[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedEvents, setExpandedEvents] = useState<Set<string>>(
        new Set()
    );
    const [filter, setFilter] = useState<string>("all");
    const [ruleFilter, setRuleFilter] = useState<string>("all");
    const [dateRangeType, setDateRangeType] = useState<DateRangeType>("all");
    const [dateRange, setDateRange] = useState<DateRange>({
        from: undefined,
        to: undefined,
    });
    const [deleting, setDeleting] = useState<string | null>(null);

    useEffect(() => {
        async function loadTrendEvents() {
            setLoading(true);
            try {
                const result = await getTrendEventsAction();
                if (result.success && result.data) {
                    setEvents(result.data);
                }
            } catch (error) {
                console.error("Failed to load trend events:", error);
            } finally {
                setLoading(false);
            }
        }

        loadTrendEvents();
    }, []);

    // Update date range when date range type changes
    useEffect(() => {
        const today = new Date();

        if (dateRangeType === "this-week") {
            setDateRange({
                from: startOfWeek(today, { weekStartsOn: 1 }), // Week starts on Monday
                to: endOfWeek(today, { weekStartsOn: 1 }),
            });
        } else if (dateRangeType === "this-month") {
            setDateRange({
                from: startOfMonth(today),
                to: endOfMonth(today),
            });
        } else if (dateRangeType === "all") {
            setDateRange({ from: undefined, to: undefined });
        }
        // Don't reset custom date range when dateRangeType is "custom"
    }, [dateRangeType]);

    const toggleEventExpanded = (eventId: string) => {
        setExpandedEvents((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(eventId)) {
                newSet.delete(eventId);
            } else {
                newSet.add(eventId);
            }
            return newSet;
        });
    };

    const handleDelete = async (id: string) => {
        setDeleting(id);
        try {
            const result = await deleteTrendEventAction(id);
            if (result.success) {
                setEvents((prev) => prev.filter((event) => event.id !== id));
            }
        } catch (error) {
            console.error("Failed to delete trend event:", error);
        } finally {
            setDeleting(null);
        }
    };

    // Filter events based on selected filters
    const filteredEvents = events.filter((event) => {
        // Filter by event type
        if (filter !== "all") {
            if (
                filter === "successful" &&
                event.eventType !== "successful_reversal"
            )
                return false;
            if (filter === "failed" && event.eventType !== "failed_reversal")
                return false;
        }

        // Filter by rule
        if (ruleFilter !== "all") {
            if (event.ruleId !== ruleFilter) return false;
        }

        // Filter by date range
        if (dateRangeType !== "all" && dateRange.from && dateRange.to) {
            try {
                const eventDate = new Date(event.date);
                if (
                    !isWithinInterval(eventDate, {
                        start: dateRange.from,
                        end: dateRange.to,
                    })
                ) {
                    return false;
                }
            } catch (e) {
                // Skip events with invalid dates
                return false;
            }
        }

        return true;
    });

    // Group events by date
    const groupedEvents: Record<string, TrendEventWithRule[]> = {};
    filteredEvents.forEach((event) => {
        try {
            const date = new Date(event.date).toISOString().split("T")[0];
            if (!groupedEvents[date]) {
                groupedEvents[date] = [];
            }
            groupedEvents[date].push(event);
        } catch (e) {
            // Skip events with invalid dates
            console.error("Invalid date in event:", event);
        }
    });

    // Sort dates in descending order
    const sortedDates = Object.keys(groupedEvents).sort((a, b) => {
        try {
            return new Date(b).getTime() - new Date(a).getTime();
        } catch (e) {
            return 0;
        }
    });

    // Get unique rules for filter
    const uniqueRules = events
        .filter((e) => e.rule)
        .map((e) => e.rule)
        .filter(
            (rule, index, self) =>
                rule && self.findIndex((r) => r && r.id === rule.id) === index
        );

    if (loading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <Card key={i}>
                        <CardHeader>
                            <Skeleton className="h-4 w-[200px]" />
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {[1, 2, 3].map((j) => (
                                    <div
                                        key={j}
                                        className="flex items-start gap-3"
                                    >
                                        <Skeleton className="h-8 w-8 rounded-full" />
                                        <div className="space-y-2 flex-1">
                                            <Skeleton className="h-4 w-full" />
                                            <Skeleton className="h-3 w-[70%]" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Filters */}
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-base">
                        Filter Trend Events
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="text-sm font-medium mb-1 block">
                                Event Type
                            </label>
                            <Select value={filter} onValueChange={setFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Filter by type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All Events
                                    </SelectItem>
                                    <SelectItem value="successful">
                                        Successful Reversals
                                    </SelectItem>
                                    <SelectItem value="failed">
                                        Failed Reversals
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-1 block">
                                Rule
                            </label>
                            <Select
                                value={ruleFilter}
                                onValueChange={setRuleFilter}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Filter by rule" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All Rules
                                    </SelectItem>
                                    {uniqueRules.map(
                                        (rule) =>
                                            rule && (
                                                <SelectItem
                                                    key={rule.id}
                                                    value={rule.id}
                                                >
                                                    {rule.name}
                                                </SelectItem>
                                            )
                                    )}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-1 block">
                                Date Range
                            </label>
                            <div className="flex gap-2">
                                <Select
                                    value={dateRangeType}
                                    onValueChange={(value) =>
                                        setDateRangeType(value as DateRangeType)
                                    }
                                >
                                    <SelectTrigger className="flex-1">
                                        <SelectValue placeholder="Select date range" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            All Time
                                        </SelectItem>
                                        <SelectItem value="this-week">
                                            This Week
                                        </SelectItem>
                                        <SelectItem value="this-month">
                                            This Month
                                        </SelectItem>
                                        <SelectItem value="custom">
                                            Custom Range
                                        </SelectItem>
                                    </SelectContent>
                                </Select>

                                {dateRangeType === "custom" && (
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className="flex-1"
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {dateRange.from ? (
                                                    dateRange.to ? (
                                                        <>
                                                            {format(
                                                                dateRange.from,
                                                                "LLL dd"
                                                            )}{" "}
                                                            -{" "}
                                                            {format(
                                                                dateRange.to,
                                                                "LLL dd"
                                                            )}
                                                        </>
                                                    ) : (
                                                        format(
                                                            dateRange.from,
                                                            "LLL dd, y"
                                                        )
                                                    )
                                                ) : (
                                                    <span>Pick a date</span>
                                                )}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent
                                            className="w-auto p-0"
                                            align="start"
                                        >
                                            <CalendarComponent
                                                initialFocus
                                                mode="range"
                                                defaultMonth={dateRange.from}
                                                selected={{
                                                    from: dateRange.from,
                                                    to: dateRange.to,
                                                }}
                                                onSelect={(range) => {
                                                    if (
                                                        range?.from &&
                                                        range?.to
                                                    ) {
                                                        setDateRange({
                                                            from: range.from,
                                                            to: range.to,
                                                        });
                                                    }
                                                }}
                                                numberOfMonths={2}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                )}
                            </div>
                            {dateRangeType !== "all" &&
                                dateRangeType !== "custom" &&
                                dateRange.from &&
                                dateRange.to && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {format(dateRange.from, "MMM d, yyyy")}{" "}
                                        - {format(dateRange.to, "MMM d, yyyy")}
                                    </p>
                                )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Timeline */}
            {filteredEvents.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-10">
                        <TrendingUp className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground text-center">
                            No trend events found with the current filters.
                        </p>
                        {filter !== "all" ||
                        ruleFilter !== "all" ||
                        dateRangeType !== "all" ? (
                            <Button
                                variant="outline"
                                className="mt-4"
                                onClick={() => {
                                    setFilter("all");
                                    setRuleFilter("all");
                                    setDateRangeType("all");
                                }}
                            >
                                Clear Filters
                            </Button>
                        ) : (
                            <p className="text-sm text-muted-foreground mt-2">
                                Add your first trend event using the form above.
                            </p>
                        )}
                    </CardContent>
                </Card>
            ) : (
                sortedDates.map((date) => (
                    <Card key={date}>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">
                                {DEFAULT_INSTRUMENT} -{" "}
                                {new Date(date).toLocaleDateString("en-US", {
                                    weekday: "long",
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                })}
                            </CardTitle>
                            <CardDescription>
                                {groupedEvents[date].length} event
                                {groupedEvents[date].length !== 1 ? "s" : ""}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="relative pl-6 border-l-2 border-border space-y-6">
                                {groupedEvents[date].map((event) => (
                                    <div key={event.id} className="relative">
                                        {/* Timeline dot */}
                                        <div className="absolute -left-[25px] mt-1.5 h-4 w-4 rounded-full border-2 border-background bg-border"></div>

                                        <Collapsible
                                            open={expandedEvents.has(event.id)}
                                            onOpenChange={() =>
                                                toggleEventExpanded(event.id)
                                            }
                                        >
                                            <div className="flex flex-col space-y-2">
                                                <div className="flex items-center gap-2">
                                                    {event.eventType ===
                                                    "successful_reversal" ? (
                                                        <CheckCircle className="h-5 w-5 text-green-500" />
                                                    ) : (
                                                        <XCircle className="h-5 w-5 text-red-500" />
                                                    )}
                                                    <span className="font-medium">
                                                        Trend Reversal
                                                    </span>
                                                    <Badge
                                                        variant="outline"
                                                        className={`ml-2 ${
                                                            event.eventType ===
                                                            "successful_reversal"
                                                                ? "bg-green-100 text-green-800 border-green-200"
                                                                : "bg-red-100 text-red-800 border-red-200"
                                                        }`}
                                                    >
                                                        {event.eventType ===
                                                        "successful_reversal"
                                                            ? "Successful"
                                                            : "Failed"}
                                                    </Badge>
                                                    <CollapsibleTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-6 w-6 p-0 ml-1"
                                                        >
                                                            {expandedEvents.has(
                                                                event.id
                                                            ) ? (
                                                                <ChevronDown className="h-4 w-4" />
                                                            ) : (
                                                                <ChevronRight className="h-4 w-4" />
                                                            )}
                                                        </Button>
                                                    </CollapsibleTrigger>
                                                </div>
                                                <div className="text-xs text-muted-foreground flex items-center gap-2">
                                                    <Calendar className="h-3 w-3" />
                                                    {(() => {
                                                        try {
                                                            return format(
                                                                new Date(
                                                                    event.date
                                                                ),
                                                                "PPP"
                                                            );
                                                        } catch (e) {
                                                            return "Invalid date";
                                                        }
                                                    })()}
                                                    <Clock className="h-3 w-3 ml-2" />
                                                    {(() => {
                                                        try {
                                                            return format(
                                                                new Date(
                                                                    event.date
                                                                ),
                                                                "p"
                                                            );
                                                        } catch (e) {
                                                            return "Invalid time";
                                                        }
                                                    })()}
                                                </div>

                                                <CollapsibleContent>
                                                    <div className="mt-2 space-y-3 pl-2">
                                                        <div className="text-sm">
                                                            <p>
                                                                {
                                                                    event.description
                                                                }
                                                            </p>
                                                        </div>

                                                        {event.direction && (
                                                            <div className="flex items-center text-sm">
                                                                <span className="font-medium mr-2">
                                                                    Direction:
                                                                </span>
                                                                {event.direction ===
                                                                "uptrend" ? (
                                                                    <span className="text-green-600 flex items-center">
                                                                        <TrendingUp className="h-4 w-4 mr-1" />{" "}
                                                                        Uptrend
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-red-600 flex items-center">
                                                                        <TrendingDown className="h-4 w-4 mr-1" />{" "}
                                                                        Downtrend
                                                                    </span>
                                                                )}
                                                            </div>
                                                        )}

                                                        {event.rule && (
                                                            <div className="text-sm">
                                                                <span className="font-medium">
                                                                    Related
                                                                    Rule:
                                                                </span>
                                                                <Badge
                                                                    variant="outline"
                                                                    className="ml-2"
                                                                >
                                                                    {event.rule
                                                                        .name ||
                                                                        "Unnamed Rule"}
                                                                </Badge>
                                                                <span className="ml-2 text-xs text-muted-foreground">
                                                                    (
                                                                    {event.rule
                                                                        .category ||
                                                                        "No Category"}
                                                                    )
                                                                </span>
                                                            </div>
                                                        )}

                                                        <div className="flex justify-end pt-2">
                                                            <AlertDialog>
                                                                <AlertDialogTrigger
                                                                    asChild
                                                                >
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        className="text-red-600 hover:text-red-700"
                                                                        disabled={
                                                                            deleting ===
                                                                            event.id
                                                                        }
                                                                    >
                                                                        <Trash2 className="h-4 w-4 mr-1" />
                                                                        Delete
                                                                    </Button>
                                                                </AlertDialogTrigger>
                                                                <AlertDialogContent>
                                                                    <AlertDialogHeader>
                                                                        <AlertDialogTitle>
                                                                            Delete
                                                                            Trend
                                                                            Event
                                                                        </AlertDialogTitle>
                                                                        <AlertDialogDescription>
                                                                            Are
                                                                            you
                                                                            sure
                                                                            you
                                                                            want
                                                                            to
                                                                            delete
                                                                            this
                                                                            trend
                                                                            event?
                                                                            This
                                                                            action
                                                                            cannot
                                                                            be
                                                                            undone.
                                                                        </AlertDialogDescription>
                                                                    </AlertDialogHeader>
                                                                    <AlertDialogFooter>
                                                                        <AlertDialogCancel>
                                                                            Cancel
                                                                        </AlertDialogCancel>
                                                                        <AlertDialogAction
                                                                            onClick={() =>
                                                                                handleDelete(
                                                                                    event.id
                                                                                )
                                                                            }
                                                                            className="bg-red-600 hover:bg-red-700"
                                                                        >
                                                                            Delete
                                                                        </AlertDialogAction>
                                                                    </AlertDialogFooter>
                                                                </AlertDialogContent>
                                                            </AlertDialog>
                                                        </div>
                                                    </div>
                                                </CollapsibleContent>
                                            </div>
                                        </Collapsible>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ))
            )}
        </div>
    );
}
