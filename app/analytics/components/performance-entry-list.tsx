"use client";

import { useState } from "react";
import { format, parseISO } from "date-fns";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, ChevronDown, ChevronUp } from "lucide-react";
import type { RulePerformanceEntryWithRule } from "@/lib/types";

interface PerformanceEntryListProps {
    entries: RulePerformanceEntryWithRule[];
}

export function PerformanceEntryList({ entries }: PerformanceEntryListProps) {
    const [expandedEntry, setExpandedEntry] = useState<string | null>(null);
    const [sortField, setSortField] = useState<"date" | "status">("date");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

    const handleSort = (field: "date" | "status") => {
        if (sortField === field) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortDirection("desc");
        }
    };

    // Sort entries
    const sortedEntries = [...entries].sort((a, b) => {
        if (sortField === "date") {
            const dateA = new Date(a.date).getTime();
            const dateB = new Date(b.date).getTime();
            return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
        } else {
            // Sort by status (success first or failure first)
            const statusA = a.status === "success" ? 1 : 0;
            const statusB = b.status === "success" ? 1 : 0;
            return sortDirection === "asc"
                ? statusA - statusB
                : statusB - statusA;
        }
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
        <div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[100px]">Status</TableHead>
                        <TableHead>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="font-medium flex items-center p-0 h-auto"
                                onClick={() => handleSort("date")}
                            >
                                Date
                                {sortField === "date" &&
                                    (sortDirection === "asc" ? (
                                        <ChevronUp className="ml-1 h-4 w-4" />
                                    ) : (
                                        <ChevronDown className="ml-1 h-4 w-4" />
                                    ))}
                            </Button>
                        </TableHead>
                        <TableHead>Notes</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sortedEntries.map((entry) => (
                        <TableRow
                            key={entry.id}
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() =>
                                setExpandedEntry(
                                    expandedEntry === entry.id ? null : entry.id
                                )
                            }
                        >
                            <TableCell>
                                {entry.status === "success" ? (
                                    <div className="flex items-center">
                                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                                        <span>Worked Well</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center">
                                        <XCircle className="h-5 w-5 text-red-500 mr-2" />
                                        <span>Didn't Work Well</span>
                                    </div>
                                )}
                            </TableCell>
                            <TableCell>
                                {format(parseISO(entry.date), "MMM d, yyyy")}
                                <div className="text-xs text-muted-foreground">
                                    {format(
                                        new Date(entry.createdAt),
                                        "h:mm a"
                                    )}
                                </div>
                            </TableCell>
                            <TableCell>
                                {entry.notes ? (
                                    expandedEntry === entry.id ? (
                                        <div>{entry.notes}</div>
                                    ) : (
                                        <div className="truncate max-w-[300px]">
                                            {entry.notes}
                                        </div>
                                    )
                                ) : (
                                    <span className="text-muted-foreground">
                                        No notes
                                    </span>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
