"use client";

import { useState } from "react";
import { format, parseISO } from "date-fns";
import { Card } from "@/components/ui/card";
import { CheckCircle, XCircle } from "lucide-react";
import type { RulePerformanceEntryWithRule } from "@/lib/types";

interface PerformanceTimelineProps {
    entries: RulePerformanceEntryWithRule[];
}

export function PerformanceTimeline({ entries }: PerformanceTimelineProps) {
    const [expandedEntry, setExpandedEntry] = useState<string | null>(null);

    // Group entries by date
    const entriesByDate = entries.reduce((acc, entry) => {
        if (!acc[entry.date]) {
            acc[entry.date] = [];
        }
        acc[entry.date].push(entry);
        return acc;
    }, {} as Record<string, RulePerformanceEntryWithRule[]>);

    // Sort dates in descending order
    const sortedDates = Object.keys(entriesByDate).sort((a, b) => {
        return new Date(b).getTime() - new Date(a).getTime();
    });

    if (entries.length === 0) {
        return (
            <div className="text-center p-8 border rounded-lg border-border">
                <p className="text-muted-foreground">
                    No performance data available yet.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {sortedDates.map((date) => {
                const dateEntries = entriesByDate[date];
                const formattedDate = format(
                    parseISO(date),
                    "EEEE, MMMM d, yyyy"
                );

                return (
                    <div
                        key={date}
                        className="border-b pb-4 last:border-b-0 last:pb-0"
                    >
                        <h3 className="font-medium mb-2">{formattedDate}</h3>
                        <div className="space-y-2">
                            {dateEntries.map((entry) => {
                                const isExpanded = expandedEntry === entry.id;

                                return (
                                    <Card
                                        key={entry.id}
                                        className="p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                                        onClick={() =>
                                            setExpandedEntry(
                                                isExpanded ? null : entry.id
                                            )
                                        }
                                    >
                                        <div className="flex items-center">
                                            {entry.status === "success" ? (
                                                <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                                            ) : (
                                                <XCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
                                            )}
                                            <div>
                                                <div className="font-medium">
                                                    {entry.status === "success"
                                                        ? "Worked Well"
                                                        : "Didn't Work Well"}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {format(
                                                        new Date(
                                                            entry.createdAt
                                                        ),
                                                        "h:mm a"
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {entry.notes && (
                                            <div
                                                className={`mt-2 text-sm ${
                                                    isExpanded
                                                        ? "block"
                                                        : "hidden"
                                                }`}
                                            >
                                                <p className="text-muted-foreground">
                                                    {entry.notes}
                                                </p>
                                            </div>
                                        )}

                                        {entry.notes && !isExpanded && (
                                            <div className="mt-1 text-xs text-muted-foreground">
                                                Click to view notes
                                            </div>
                                        )}
                                    </Card>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
