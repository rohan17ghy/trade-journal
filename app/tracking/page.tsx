"use client";

import { useState, useEffect } from "react";
import { getRulesAction } from "../rules/actions";
import { getTrackingEntriesForDateAction } from "./actions";
import { DailyTrackingForm } from "./daily-tracking-form";
import { formatDate } from "@/lib/utils";
import { DatePicker } from "@/components/ui/date-picker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Rule, TrackingEntryWithRule } from "@/lib/types";

export default function TrackingPage() {
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [formattedDate, setFormattedDate] = useState<string>(
        formatDate(new Date())
    );
    const [rules, setRules] = useState<Rule[]>([]);
    const [entries, setEntries] = useState<TrackingEntryWithRule[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Load rules and tracking entries
    useEffect(() => {
        async function loadData() {
            setIsLoading(true);
            setError(null);

            try {
                // Load rules
                const rulesResult = await getRulesAction();
                if (!rulesResult.success) {
                    throw new Error(
                        rulesResult.error || "Failed to load rules"
                    );
                }
                setRules(rulesResult.data || []);

                // Load tracking entries for the selected date
                if (formattedDate) {
                    const entriesResult = await getTrackingEntriesForDateAction(
                        formattedDate
                    );
                    if (!entriesResult.success) {
                        throw new Error(
                            entriesResult.error ||
                                "Failed to load tracking entries"
                        );
                    }
                    setEntries(entriesResult.data || []);
                }
            } catch (err) {
                setError(
                    err instanceof Error ? err.message : "An error occurred"
                );
            } finally {
                setIsLoading(false);
            }
        }

        loadData();
    }, [formattedDate]);

    // Update the formatted date when the date changes
    useEffect(() => {
        if (date) {
            const newFormattedDate = formatDate(date);
            setFormattedDate(newFormattedDate);
        }
    }, [date]);

    return (
        <div className="w-full max-w-4xl mx-auto py-8 px-4">
            <div className="flex flex-col gap-8">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        Daily Tracking
                    </h1>
                    <p className="text-muted-foreground">
                        Track how your trading rules performed
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Select Date</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <DatePicker date={date} setDate={setDate} />
                    </CardContent>
                </Card>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-md">
                        {error}
                    </div>
                )}

                {isLoading ? (
                    <div className="text-center p-8">Loading...</div>
                ) : (
                    <DailyTrackingForm
                        rules={rules}
                        entries={entries}
                        date={formattedDate}
                    />
                )}
            </div>
        </div>
    );
}
