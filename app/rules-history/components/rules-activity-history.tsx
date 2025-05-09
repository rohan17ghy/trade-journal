"use client";

import { useState } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { CalendarIcon, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { getActiveRulesForDateAction } from "../actions";
import type { Rule } from "@/lib/types";

export function RulesActivityHistory() {
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [activeRules, setActiveRules] = useState<Rule[]>([]);
    const [inactiveRules, setInactiveRules] = useState<Rule[]>([]);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    async function handleDateSelect(date: Date | undefined) {
        if (!date) return;

        setDate(date);
        setLoading(true);
        setHasSearched(true);

        try {
            const result = await getActiveRulesForDateAction(
                format(date, "yyyy-MM-dd")
            );
            if (result.success && result.data) {
                setActiveRules(result.data.activeRules);
                setInactiveRules(result.data.inactiveRules);
            }
        } catch (error) {
            console.error("Failed to load active rules:", error);
        } finally {
            setLoading(false);
        }
    }

    // Category configuration for styling
    const categoryConfig: Record<string, { color: string }> = {
        Entry: { color: "bg-emerald-100 text-emerald-800 border-emerald-200" },
        Exit: { color: "bg-rose-100 text-rose-800 border-rose-200" },
        "Risk Management": {
            color: "bg-amber-100 text-amber-800 border-amber-200",
        },
        Psychology: { color: "bg-blue-100 text-blue-800 border-blue-200" },
        Other: { color: "bg-slate-100 text-slate-800 border-slate-200" },
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Select a Date</CardTitle>
                    <CardDescription>
                        View which rules were active on a specific date
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row gap-4 items-start">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        "w-full sm:w-[240px] justify-start text-left font-normal",
                                        !date && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {date
                                        ? format(date, "PPP")
                                        : "Select a date"}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent
                                className="w-auto p-0"
                                align="start"
                            >
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={handleDateSelect}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>

                        <Button
                            onClick={() => date && handleDateSelect(date)}
                            disabled={!date || loading}
                        >
                            View Rules
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {loading ? (
                <Card>
                    <CardHeader>
                        <Skeleton className="h-5 w-[200px]" />
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[1, 2, 3, 4].map((i) => (
                                <div
                                    key={i}
                                    className="flex items-center gap-3"
                                >
                                    <Skeleton className="h-6 w-6 rounded-full" />
                                    <Skeleton className="h-4 flex-1" />
                                    <Skeleton className="h-6 w-20" />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            ) : hasSearched ? (
                <>
                    <Card>
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                                    Active Rules
                                </CardTitle>
                                <Badge
                                    variant="outline"
                                    className="bg-green-50 text-green-700"
                                >
                                    {activeRules.length} rule
                                    {activeRules.length !== 1 ? "s" : ""}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {activeRules.length === 0 ? (
                                <p className="text-muted-foreground text-sm py-2">
                                    No active rules on this date.
                                </p>
                            ) : (
                                <div className="space-y-3">
                                    {activeRules.map((rule) => {
                                        const categoryStyle =
                                            categoryConfig[rule.category] ||
                                            categoryConfig["Other"];

                                        return (
                                            <div
                                                key={rule.id}
                                                className="flex items-center justify-between p-2 rounded-md border bg-card hover:bg-accent/50 transition-colors"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                                                    <span>{rule.name}</span>
                                                </div>
                                                <Badge
                                                    variant="outline"
                                                    className={
                                                        categoryStyle.color
                                                    }
                                                >
                                                    {rule.category}
                                                </Badge>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <XCircle className="h-5 w-5 text-slate-500" />
                                    Inactive Rules
                                </CardTitle>
                                <Badge
                                    variant="outline"
                                    className="bg-slate-50 text-slate-700"
                                >
                                    {inactiveRules.length} rule
                                    {inactiveRules.length !== 1 ? "s" : ""}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {inactiveRules.length === 0 ? (
                                <p className="text-muted-foreground text-sm py-2">
                                    No inactive rules on this date.
                                </p>
                            ) : (
                                <div className="space-y-3">
                                    {inactiveRules.map((rule) => {
                                        const categoryStyle =
                                            categoryConfig[rule.category] ||
                                            categoryConfig["Other"];

                                        return (
                                            <div
                                                key={rule.id}
                                                className="flex items-center justify-between p-2 rounded-md border bg-card hover:bg-accent/50 transition-colors"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <div className="h-2 w-2 rounded-full bg-slate-400"></div>
                                                    <span className="text-muted-foreground">
                                                        {rule.name}
                                                    </span>
                                                </div>
                                                <Badge
                                                    variant="outline"
                                                    className={
                                                        categoryStyle.color
                                                    }
                                                >
                                                    {rule.category}
                                                </Badge>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </>
            ) : null}
        </div>
    );
}
