"use client";

import { useEffect, useState } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
    PlusCircle,
    Edit,
    Trash2,
    Clock,
    ToggleLeft,
    ToggleRight,
    Filter,
    X,
    ChevronDown,
    ChevronUp,
} from "lucide-react";
import { getRuleHistoryAction } from "../actions";
import { getRulesAction } from "@/app/rules/actions";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import type { Rule } from "@prisma/client";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";

type RuleEvent = {
    id: string;
    ruleId: string;
    ruleName: string;
    eventType: "created" | "updated" | "deleted" | "activated" | "deactivated";
    timestamp: Date;
    category?: string;
    details?: any;
};

export function RulesTimeline() {
    const [events, setEvents] = useState<RuleEvent[]>([]);
    const [rules, setRules] = useState<Rule[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRuleId, setSelectedRuleId] = useState<string | null>(null);
    const [expandedEvents, setExpandedEvents] = useState<Set<string>>(
        new Set()
    );

    useEffect(() => {
        async function loadRuleHistory() {
            setLoading(true);
            try {
                const [historyResult, rulesResult] = await Promise.all([
                    getRuleHistoryAction(),
                    getRulesAction(),
                ]);

                if (historyResult.success && historyResult.data) {
                    setEvents(historyResult.data);
                }

                if (rulesResult.success && rulesResult.data) {
                    setRules(rulesResult.data);
                }
            } catch (error) {
                console.error("Failed to load rule history:", error);
            } finally {
                setLoading(false);
            }
        }

        loadRuleHistory();
    }, []);

    // Filter events by selected rule
    const filteredEvents = selectedRuleId
        ? events.filter((event) => event.ruleId === selectedRuleId)
        : events;

    // Group events by date (year-month-day)
    const groupedEvents: Record<string, RuleEvent[]> = {};
    filteredEvents.forEach((event) => {
        const date = new Date(event.timestamp).toISOString().split("T")[0];
        if (!groupedEvents[date]) {
            groupedEvents[date] = [];
        }
        groupedEvents[date].push(event);
    });

    // Sort dates in descending order
    const sortedDates = Object.keys(groupedEvents).sort(
        (a, b) => new Date(b).getTime() - new Date(a).getTime()
    );

    const getEventIcon = (eventType: string) => {
        switch (eventType) {
            case "created":
                return <PlusCircle className="h-5 w-5 text-green-500" />;
            case "updated":
                return <Edit className="h-5 w-5 text-blue-500" />;
            case "deleted":
                return <Trash2 className="h-5 w-5 text-red-500" />;
            case "activated":
                return <ToggleRight className="h-5 w-5 text-emerald-500" />;
            case "deactivated":
                return <ToggleLeft className="h-5 w-5 text-slate-500" />;
            default:
                return <Clock className="h-5 w-5 text-gray-500" />;
        }
    };

    const getEventColor = (eventType: string) => {
        switch (eventType) {
            case "created":
                return "bg-green-100 text-green-800 border-green-200";
            case "updated":
                return "bg-blue-100 text-blue-800 border-blue-200";
            case "deleted":
                return "bg-red-100 text-red-800 border-red-200";
            case "activated":
                return "bg-emerald-100 text-emerald-800 border-emerald-200";
            case "deactivated":
                return "bg-slate-100 text-slate-800 border-slate-200";
            default:
                return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    const clearFilter = () => {
        setSelectedRuleId(null);
    };

    const handleRuleSelect = (value: string) => {
        setSelectedRuleId(value);
    };

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

    const renderDiffContent = (event: RuleEvent) => {
        if (!event.details) return null;

        const {
            nameChanged,
            categoryChanged,
            descriptionChanged,
            isActiveChanged,
        } = event.details;

        if (
            !nameChanged &&
            !categoryChanged &&
            !descriptionChanged &&
            !isActiveChanged
        ) {
            return (
                <p className="text-sm text-muted-foreground">
                    No significant changes detected.
                </p>
            );
        }

        return (
            <div className="space-y-3 pt-2">
                {nameChanged && (
                    <div className="space-y-1">
                        <h4 className="text-xs font-medium text-muted-foreground">
                            Name Changed
                        </h4>
                        <div className="bg-muted/50 p-2 rounded text-sm">
                            <span className="font-medium">
                                Updated rule name
                            </span>
                        </div>
                    </div>
                )}

                {categoryChanged && (
                    <div className="space-y-1">
                        <h4 className="text-xs font-medium text-muted-foreground">
                            Category Changed
                        </h4>
                        <div className="bg-muted/50 p-2 rounded text-sm">
                            <span className="font-medium">
                                Updated rule category
                            </span>
                        </div>
                    </div>
                )}

                {isActiveChanged && (
                    <div className="space-y-1">
                        <h4 className="text-xs font-medium text-muted-foreground">
                            Active Status Changed
                        </h4>
                        <div className="bg-muted/50 p-2 rounded text-sm">
                            <span className="font-medium">
                                Rule was{" "}
                                {event.eventType === "activated"
                                    ? "activated"
                                    : "deactivated"}
                            </span>
                        </div>
                    </div>
                )}

                {descriptionChanged && (
                    <div className="space-y-1">
                        <h4 className="text-xs font-medium text-muted-foreground">
                            Description Changed
                        </h4>
                        <div className="bg-muted/50 p-2 rounded text-sm">
                            <span className="font-medium">
                                Rule description was updated
                            </span>
                        </div>
                    </div>
                )}
            </div>
        );
    };

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
            {/* Filter UI */}
            <Card>
                <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-base">
                            Filter Timeline
                        </CardTitle>
                        {selectedRuleId && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={clearFilter}
                                className="h-8 px-2"
                            >
                                <X className="h-4 w-4 mr-1" />
                                Clear Filter
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-muted-foreground" />
                        <Select
                            value={selectedRuleId || ""}
                            onValueChange={handleRuleSelect}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select a rule to filter" />
                            </SelectTrigger>
                            <SelectContent>
                                {rules.map((rule) => (
                                    <SelectItem key={rule.id} value={rule.id}>
                                        {rule.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    {selectedRuleId && (
                        <div className="mt-2 text-sm text-muted-foreground">
                            Showing timeline for:{" "}
                            {rules.find((r) => r.id === selectedRuleId)?.name}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Timeline */}
            {events.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-10">
                        <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground text-center">
                            No rule history available yet. Changes to your rules
                            will appear here.
                        </p>
                    </CardContent>
                </Card>
            ) : filteredEvents.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-10">
                        <Filter className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground text-center">
                            No history events found for the selected rule.
                        </p>
                        <Button
                            variant="outline"
                            className="mt-4"
                            onClick={clearFilter}
                        >
                            Clear Filter
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                sortedDates.map((date) => (
                    <Card key={date}>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">
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
                                                event.eventType === "updated" &&
                                                toggleEventExpanded(event.id)
                                            }
                                        >
                                            <div className="flex flex-col space-y-2">
                                                <div className="flex items-center gap-2">
                                                    {getEventIcon(
                                                        event.eventType
                                                    )}
                                                    <span className="font-medium">
                                                        {event.ruleName}
                                                    </span>
                                                    <Badge
                                                        variant="outline"
                                                        className={`${getEventColor(
                                                            event.eventType
                                                        )} ml-2`}
                                                    >
                                                        {event.eventType
                                                            .charAt(0)
                                                            .toUpperCase() +
                                                            event.eventType.slice(
                                                                1
                                                            )}
                                                    </Badge>

                                                    {event.eventType ===
                                                        "updated" &&
                                                        event.details && (
                                                            <CollapsibleTrigger
                                                                asChild
                                                            >
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="ml-auto h-6 w-6 p-0"
                                                                >
                                                                    {expandedEvents.has(
                                                                        event.id
                                                                    ) ? (
                                                                        <ChevronUp className="h-4 w-4" />
                                                                    ) : (
                                                                        <ChevronDown className="h-4 w-4" />
                                                                    )}
                                                                </Button>
                                                            </CollapsibleTrigger>
                                                        )}

                                                    {event.category &&
                                                        event.eventType !==
                                                            "updated" && (
                                                            <Badge
                                                                variant="outline"
                                                                className="ml-auto"
                                                            >
                                                                {event.category}
                                                            </Badge>
                                                        )}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {formatDistanceToNow(
                                                        new Date(
                                                            event.timestamp
                                                        ),
                                                        { addSuffix: true }
                                                    )}
                                                </div>

                                                <CollapsibleContent>
                                                    {event.eventType ===
                                                        "updated" && (
                                                        <div className="mt-2 border-t pt-2 border-dashed border-muted">
                                                            <div className="text-xs font-medium text-muted-foreground mb-1">
                                                                Changes:
                                                            </div>
                                                            {renderDiffContent(
                                                                event
                                                            )}
                                                        </div>
                                                    )}
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
