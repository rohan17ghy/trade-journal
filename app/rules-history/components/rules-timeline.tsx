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
    ChevronRight,
    Check,
    Diff,
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
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { DescriptionDiffViewer } from "./description-diff-viewer";
import type { Rule } from "@prisma/client";

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
    const [diffModalOpen, setDiffModalOpen] = useState(false);
    const [diffVersions, setDiffVersions] = useState<{
        ruleId: string;
        versionA: number;
        versionB: number;
        ruleName: string;
    } | null>(null);

    useEffect(() => {
        async function loadRuleHistory() {
            setLoading(true);
            try {
                const [historyResult, rulesResult] = await Promise.all([
                    getRuleHistoryAction(),
                    getRulesAction(),
                ]);

                if (historyResult.success && historyResult.data) {
                    // Transform the data to ensure timestamps are Date objects
                    const transformedEvents = historyResult.data.map(
                        (event) => ({
                            ...event,
                            // Convert timestamp string to Date object if it's not already
                            timestamp:
                                event.timestamp instanceof Date
                                    ? event.timestamp
                                    : new Date(event.timestamp),
                        })
                    );
                    setEvents(transformedEvents);
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

    // Update the handleViewVersionDiff function to handle missing version info
    const handleViewVersionDiff = (event: RuleEvent) => {
        // Default to version 1 if no previous version
        const versionA = event.details?.versionInfo?.previousVersion || 1;
        // Default to version 1 if no new version
        const versionB = event.details?.versionInfo?.newVersion || versionA + 1;

        console.log("Opening diff viewer for:", {
            ruleId: event.ruleId,
            versionA,
            versionB,
            ruleName: event.ruleName,
        });

        // Set the diffVersions state
        setDiffVersions({
            ruleId: event.ruleId,
            versionA,
            versionB,
            ruleName: event.ruleName,
        });

        // Open the modal
        setDiffModalOpen(true);
    };

    const renderChangeDetails = (event: RuleEvent) => {
        if (!event.details) return null;

        switch (event.eventType) {
            case "created":
                return (
                    <div className="mt-2 text-sm">
                        <h4 className="font-medium text-muted-foreground mb-1">
                            Initial Values:
                        </h4>
                        <div className="space-y-1 pl-2">
                            <div>
                                <span className="font-medium">Name:</span>{" "}
                                {event.details.initialValues?.name}
                            </div>
                            <div>
                                <span className="font-medium">Category:</span>{" "}
                                {event.details.initialValues?.category}
                            </div>
                            <div>
                                <span className="font-medium">Active:</span>
                                {event.details.initialValues?.isActive ? (
                                    <span className="text-emerald-600 ml-1 inline-flex items-center">
                                        <Check className="h-3 w-3 mr-1" /> Yes
                                    </span>
                                ) : (
                                    <span className="text-slate-600 ml-1 inline-flex items-center">
                                        <X className="h-3 w-3 mr-1" /> No
                                    </span>
                                )}
                            </div>
                            {event.details.versionNumber && (
                                <div>
                                    <span className="font-medium">
                                        Version:
                                    </span>{" "}
                                    {event.details.versionNumber}
                                </div>
                            )}
                        </div>
                    </div>
                );

            case "updated":
                return (
                    <div className="mt-2 text-sm space-y-3">
                        <h4 className="font-medium text-muted-foreground">
                            Changes:
                        </h4>

                        {event.details.name?.changed && (
                            <div className="pl-2">
                                <div className="font-medium">Name:</div>
                                <div className="grid grid-cols-2 gap-2 mt-1">
                                    <div className="bg-red-50 p-1.5 rounded border border-red-100 text-red-800">
                                        <div className="text-xs text-red-500 mb-0.5">
                                            Previous
                                        </div>
                                        {event.details.name.from}
                                    </div>
                                    <div className="bg-green-50 p-1.5 rounded border border-green-100 text-green-800">
                                        <div className="text-xs text-green-500 mb-0.5">
                                            New
                                        </div>
                                        {event.details.name.to}
                                    </div>
                                </div>
                            </div>
                        )}

                        {event.details.category?.changed && (
                            <div className="pl-2">
                                <div className="font-medium">Category:</div>
                                <div className="grid grid-cols-2 gap-2 mt-1">
                                    <div className="bg-red-50 p-1.5 rounded border border-red-100 text-red-800">
                                        <div className="text-xs text-red-500 mb-0.5">
                                            Previous
                                        </div>
                                        {event.details.category.from}
                                    </div>
                                    <div className="bg-green-50 p-1.5 rounded border border-green-100 text-green-800">
                                        <div className="text-xs text-green-500 mb-0.5">
                                            New
                                        </div>
                                        {event.details.category.to}
                                    </div>
                                </div>
                            </div>
                        )}

                        {event.details.isActive?.changed && (
                            <div className="pl-2">
                                <div className="font-medium">
                                    Active Status:
                                </div>
                                <div className="grid grid-cols-2 gap-2 mt-1">
                                    <div className="bg-red-50 p-1.5 rounded border border-red-100 text-red-800">
                                        <div className="text-xs text-red-500 mb-0.5">
                                            Previous
                                        </div>
                                        {event.details.isActive.from ? (
                                            <span className="inline-flex items-center">
                                                <Check className="h-3 w-3 mr-1" />{" "}
                                                Active
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center">
                                                <X className="h-3 w-3 mr-1" />{" "}
                                                Inactive
                                            </span>
                                        )}
                                    </div>
                                    <div className="bg-green-50 p-1.5 rounded border border-green-100 text-green-800">
                                        <div className="text-xs text-green-500 mb-0.5">
                                            New
                                        </div>
                                        {event.details.isActive.to ? (
                                            <span className="inline-flex items-center">
                                                <Check className="h-3 w-3 mr-1" />{" "}
                                                Active
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center">
                                                <X className="h-3 w-3 mr-1" />{" "}
                                                Inactive
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {event.details.description?.changed && (
                            <div className="pl-2">
                                <div className="flex items-center justify-between">
                                    <div className="font-medium">
                                        Description:
                                    </div>
                                    {event.details.versionInfo && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-7 text-xs"
                                            onClick={() =>
                                                handleViewVersionDiff(event)
                                            }
                                        >
                                            <Diff className="h-3.5 w-3.5 mr-1" />
                                            View Detailed Changes
                                        </Button>
                                    )}
                                </div>
                                <div className="grid grid-cols-2 gap-2 mt-1">
                                    <div className="bg-red-50 p-1.5 rounded border border-red-100 text-red-800">
                                        <div className="text-xs text-red-500 mb-0.5">
                                            Previous
                                        </div>
                                        <div>
                                            {
                                                event.details.description
                                                    .fromSummary?.blockCount
                                            }{" "}
                                            blocks
                                            {event.details.description
                                                .fromSummary?.textPreview && (
                                                <div className="mt-1 text-xs italic">
                                                    "
                                                    {
                                                        event.details
                                                            .description
                                                            .fromSummary
                                                            .textPreview
                                                    }
                                                    "
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="bg-green-50 p-1.5 rounded border border-green-100 text-green-800">
                                        <div className="text-xs text-green-500 mb-0.5">
                                            New
                                        </div>
                                        <div>
                                            {
                                                event.details.description
                                                    .toSummary?.blockCount
                                            }{" "}
                                            blocks
                                            {event.details.description.toSummary
                                                ?.textPreview && (
                                                <div className="mt-1 text-xs italic">
                                                    "
                                                    {
                                                        event.details
                                                            .description
                                                            .toSummary
                                                            .textPreview
                                                    }
                                                    "
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {event.details.versionInfo && (
                            <div className="pl-2 text-xs text-muted-foreground">
                                Version changed from v
                                {event.details.versionInfo.previousVersion} to v
                                {event.details.versionInfo.newVersion}
                            </div>
                        )}

                        {!event.details.name?.changed &&
                            !event.details.category?.changed &&
                            !event.details.description?.changed &&
                            !event.details.isActive?.changed && (
                                <div className="pl-2 text-muted-foreground italic">
                                    No detailed change information available.
                                </div>
                            )}
                    </div>
                );

            case "deleted":
                return (
                    <div className="mt-2 text-sm">
                        <h4 className="font-medium text-muted-foreground mb-1">
                            Final State:
                        </h4>
                        <div className="space-y-1 pl-2">
                            <div>
                                <span className="font-medium">Name:</span>{" "}
                                {event.details.finalState?.name}
                            </div>
                            <div>
                                <span className="font-medium">Category:</span>{" "}
                                {event.details.finalState?.category}
                            </div>
                            <div>
                                <span className="font-medium">Active:</span>
                                {event.details.finalState?.isActive ? (
                                    <span className="text-emerald-600 ml-1 inline-flex items-center">
                                        <Check className="h-3 w-3 mr-1" /> Yes
                                    </span>
                                ) : (
                                    <span className="text-slate-600 ml-1 inline-flex items-center">
                                        <X className="h-3 w-3 mr-1" /> No
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                );

            case "activated":
            case "deactivated":
                if (
                    typeof event.details?.from !== "undefined" &&
                    typeof event.details?.to !== "undefined"
                ) {
                    return (
                        <div className="mt-2 text-sm">
                            <div className="grid grid-cols-2 gap-2">
                                <div className="bg-red-50 p-1.5 rounded border border-red-100 text-red-800">
                                    <div className="text-xs text-red-500 mb-0.5">
                                        Previous
                                    </div>
                                    {event.details.from ? (
                                        <span className="inline-flex items-center">
                                            <Check className="h-3 w-3 mr-1" />{" "}
                                            Active
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center">
                                            <X className="h-3 w-3 mr-1" />{" "}
                                            Inactive
                                        </span>
                                    )}
                                </div>
                                <div className="bg-green-50 p-1.5 rounded border border-green-100 text-green-800">
                                    <div className="text-xs text-green-500 mb-0.5">
                                        New
                                    </div>
                                    {event.details.to ? (
                                        <span className="inline-flex items-center">
                                            <Check className="h-3 w-3 mr-1" />{" "}
                                            Active
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center">
                                            <X className="h-3 w-3 mr-1" />{" "}
                                            Inactive
                                        </span>
                                    )}
                                </div>
                            </div>
                            {event.details.versionNumber && (
                                <div className="text-xs text-muted-foreground mt-1">
                                    Version: v{event.details.versionNumber}
                                </div>
                            )}
                        </div>
                    );
                }
                return null;

            default:
                return null;
        }
    };

    const hasDetails = (event: RuleEvent) => {
        return (
            event.details &&
            (event.eventType === "created" ||
                event.eventType === "updated" ||
                event.eventType === "deleted" ||
                (["activated", "deactivated"].includes(event.eventType) &&
                    typeof event.details.from !== "undefined" &&
                    typeof event.details.to !== "undefined"))
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
                                                hasDetails(event) &&
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
                                                    {event.category && (
                                                        <Badge
                                                            variant="outline"
                                                            className="ml-auto"
                                                        >
                                                            {event.category}
                                                        </Badge>
                                                    )}

                                                    {hasDetails(event) && (
                                                        <CollapsibleTrigger
                                                            asChild
                                                        >
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
                                                    {renderChangeDetails(event)}
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

            {/* Diff Viewer Modal */}
            <DescriptionDiffViewer
                ruleId={diffVersions?.ruleId || ""}
                versionA={diffVersions?.versionA || 0}
                versionB={diffVersions?.versionB || 0}
                open={diffModalOpen && diffVersions !== null}
                onOpenChange={setDiffModalOpen}
                ruleName={diffVersions?.ruleName || ""}
            />
        </div>
    );
}
