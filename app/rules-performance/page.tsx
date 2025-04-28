"use client";

import { useState, useEffect } from "react";
import { getRulesAction } from "../rules/actions";
import { getRulePerformanceEntriesForDateAction } from "./actions";
import { RulePerformanceForm } from "./rule-performance-form";
import { formatDate } from "@/lib/utils";
import { DatePicker } from "@/components/ui/date-picker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Rule, RulePerformanceEntryWithRule } from "@/lib/types";

export default function RulesPerformancePage() {
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [formattedDate, setFormattedDate] = useState<string>(
        formatDate(new Date())
    );
    const [rules, setRules] = useState<Rule[]>([]);
    const [entries, setEntries] = useState<RulePerformanceEntryWithRule[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // Function to refresh data
    const refreshData = async () => {
        try {
            const entriesResult = await getRulePerformanceEntriesForDateAction(
                formattedDate
            );
            if (entriesResult.success) {
                setEntries(entriesResult.data || []);
            }
        } catch (err) {
            console.error("Error refreshing data:", err);
        }
    };

    // Load rules and performance entries
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

                // Load performance entries for the selected date
                if (formattedDate) {
                    const entriesResult =
                        await getRulePerformanceEntriesForDateAction(
                            formattedDate
                        );
                    if (!entriesResult.success) {
                        throw new Error(
                            entriesResult.error ||
                                "Failed to load rule performance data"
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
    }, [formattedDate, refreshTrigger]); // Add refreshTrigger to dependencies

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
                        Rules Performance
                    </h1>
                    <p className="text-muted-foreground">
                        Evaluate how your trading rules performed in the market
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
                    <RulePerformanceForm
                        rules={rules}
                        entries={entries}
                        date={formattedDate}
                        onEntryAdded={refreshData}
                    />
                )}
            </div>
        </div>
    );
}
