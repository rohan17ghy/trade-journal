"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { addDailyJournalAction } from "../actions";
import { getRulesAction } from "@/app/rules/actions";
import { formatDate } from "@/lib/utils";
// Import the RulePerformanceForm component instead of RulePerformanceSelector
import { RulePerformanceForm } from "@/app/rules-performance/rule-performance-form";
import type { Rule, RulePerformance } from "@/lib/types";
import type { StatusType } from "@/lib/types";
import { getRulePerformanceEntriesForDateAction } from "@/app/rules-performance/actions";
import type { RulePerformanceEntryWithRule } from "@/lib/types";

interface DailyJournalFormProps {
    defaultValues?: {
        date?: string;
        marketOverview?: string;
        goals?: string;
        challenges?: string;
        insights?: string;
        improvementAreas?: string;
        planForTomorrow?: string;
        ruleModification?: string;
        rulePerformances?: RulePerformance[];
    };
}

export function DailyJournalForm({
    defaultValues = {},
}: DailyJournalFormProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [rules, setRules] = useState<Rule[]>([]);
    const [isLoadingRules, setIsLoadingRules] = useState(true);
    const [rulePerformanceEntries, setRulePerformanceEntries] = useState<
        RulePerformanceEntryWithRule[]
    >([]);
    const [isLoadingEntries, setIsLoadingEntries] = useState(false);

    // Form state
    const [date, setDate] = useState<Date | undefined>(
        defaultValues.date ? new Date(defaultValues.date) : new Date()
    );
    const [marketOverview, setMarketOverview] = useState(
        defaultValues.marketOverview || ""
    );
    const [goals, setGoals] = useState(defaultValues.goals || "");
    const [challenges, setChallenges] = useState(
        defaultValues.challenges || ""
    );
    const [insights, setInsights] = useState(defaultValues.insights || "");
    const [improvementAreas, setImprovementAreas] = useState(
        defaultValues.improvementAreas || ""
    );
    const [planForTomorrow, setPlanForTomorrow] = useState(
        defaultValues.planForTomorrow || ""
    );
    const [ruleModification, setRuleModification] = useState(
        defaultValues.ruleModification || ""
    );
    const [rulePerformances, setRulePerformances] = useState<RulePerformance[]>(
        defaultValues.rulePerformances || []
    );

    // Load rules
    useEffect(() => {
        async function loadRules() {
            setIsLoadingRules(true);
            try {
                const rulesResult = await getRulesAction();
                if (rulesResult.success && rulesResult.data) {
                    setRules(rulesResult.data);

                    // Only initialize rule performances if they weren't provided in defaultValues
                    // and we haven't already initialized them
                    if (
                        !defaultValues.rulePerformances &&
                        rulePerformances.length === 0
                    ) {
                        const initialRulePerformances = rulesResult.data.map(
                            (rule) => ({
                                ruleId: rule.id,
                                ruleName: rule.name,
                                status: "not_applicable" as StatusType,
                                notes: "",
                            })
                        );
                        setRulePerformances(initialRulePerformances);
                    }
                }
            } catch (error) {
                console.error("Failed to load rules:", error);
            } finally {
                setIsLoadingRules(false);
            }
        }

        loadRules();
    }, [defaultValues.rulePerformances, rulePerformances.length]);

    // Load rule performance entries for the selected date
    useEffect(() => {
        async function loadRulePerformanceEntries() {
            if (!date) return;

            setIsLoadingEntries(true);
            try {
                const formattedDate = formatDate(date);
                const entriesResult =
                    await getRulePerformanceEntriesForDateAction(formattedDate);
                if (entriesResult.success && entriesResult.data) {
                    setRulePerformanceEntries(entriesResult.data);
                } else {
                    setRulePerformanceEntries([]);
                }
            } catch (error) {
                console.error(
                    "Failed to load rule performance entries:",
                    error
                );
                setRulePerformanceEntries([]);
            } finally {
                setIsLoadingEntries(false);
            }
        }

        loadRulePerformanceEntries();
    }, [date]);

    // Handle rule performance update
    const handleRulePerformanceUpdate = (
        updatedPerformance: RulePerformance
    ) => {
        setRulePerformances((prev) =>
            prev.map((perf) =>
                perf.ruleId === updatedPerformance.ruleId
                    ? updatedPerformance
                    : perf
            )
        );
    };

    // Refresh rule performance entries
    const refreshRulePerformanceEntries = async () => {
        if (!date) return;

        try {
            const formattedDate = formatDate(date);
            const entriesResult = await getRulePerformanceEntriesForDateAction(
                formattedDate
            );
            if (entriesResult.success && entriesResult.data) {
                setRulePerformanceEntries(entriesResult.data);
            }
        } catch (error) {
            console.error("Failed to refresh rule performance entries:", error);
        }
    };

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            if (!date) {
                throw new Error("Please select a date");
            }

            const formattedDate = formatDate(date);

            // Filter out rules with "not_applicable" status
            const activeRulePerformances = rulePerformances.filter(
                (perf) => perf.status !== "not_applicable"
            );

            const result = await addDailyJournalAction({
                date: formattedDate,
                marketOverview: marketOverview || null,
                goals: goals || null,
                challenges: challenges || null,
                insights: insights || null,
                improvementAreas: improvementAreas || null,
                planForTomorrow: planForTomorrow || null,
                ruleModification: ruleModification || null,
                rulePerformances:
                    activeRulePerformances.length > 0
                        ? activeRulePerformances
                        : null,
            });

            if (!result.success) {
                throw new Error(result.error || "Failed to save journal entry");
            }

            // Navigate to the daily journal page
            router.push("/daily-journal");
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="date">
                    Date <span className="text-red-500">*</span>
                </Label>
                <div className="p-2 border rounded-md bg-muted/30">
                    {date ? formatDate(date) : formatDate(new Date())}
                </div>
            </div>

            <Tabs defaultValue="market" className="w-full">
                <TabsList className="grid grid-cols-4">
                    <TabsTrigger value="market">Market</TabsTrigger>
                    <TabsTrigger value="reflection">Reflection</TabsTrigger>
                    <TabsTrigger value="planning">Planning</TabsTrigger>
                    <TabsTrigger value="rules">Rules Performance</TabsTrigger>
                </TabsList>

                <TabsContent value="market" className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <Label htmlFor="marketOverview">Market Overview</Label>
                        <Textarea
                            id="marketOverview"
                            placeholder="Describe the overall market conditions today"
                            value={marketOverview}
                            onChange={(e) => setMarketOverview(e.target.value)}
                            rows={3}
                        />
                    </div>
                </TabsContent>

                <TabsContent value="reflection" className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <Label htmlFor="mistakes">Mistakes</Label>
                        <Textarea
                            id="mistakes"
                            placeholder="What mistakes did you make today?"
                            value={challenges}
                            onChange={(e) => setChallenges(e.target.value)}
                            rows={3}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="insights">Insights</Label>
                        <Textarea
                            id="insights"
                            placeholder="What insights or realizations did you have today?"
                            value={insights}
                            onChange={(e) => setInsights(e.target.value)}
                            rows={3}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="ruleModification">
                            Rule Modification
                        </Label>
                        <Textarea
                            id="ruleModification"
                            placeholder="What changes to your trading rules should you consider?"
                            value={ruleModification}
                            onChange={(e) =>
                                setRuleModification(e.target.value)
                            }
                            rows={3}
                        />
                    </div>
                </TabsContent>

                <TabsContent value="planning" className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <Label htmlFor="goals">Today's Goals</Label>
                        <Textarea
                            id="goals"
                            placeholder="What were your goals for today?"
                            value={goals}
                            onChange={(e) => setGoals(e.target.value)}
                            rows={3}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="improvementAreas">
                            Areas for Improvement
                        </Label>
                        <Textarea
                            id="improvementAreas"
                            placeholder="What areas would you like to improve?"
                            value={improvementAreas}
                            onChange={(e) =>
                                setImprovementAreas(e.target.value)
                            }
                            rows={3}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="planForTomorrow">
                            Plan for Tomorrow
                        </Label>
                        <Textarea
                            id="planForTomorrow"
                            placeholder="What's your plan for tomorrow?"
                            value={planForTomorrow}
                            onChange={(e) => setPlanForTomorrow(e.target.value)}
                            rows={3}
                        />
                    </div>
                </TabsContent>

                <TabsContent value="rules" className="space-y-4 pt-4">
                    {isLoadingRules ? (
                        <div className="text-center p-8">Loading rules...</div>
                    ) : rules.length === 0 ? (
                        <div className="text-center p-8 border rounded-lg border-border">
                            <p className="text-muted-foreground">
                                No rules added yet. Add rules first to track
                                their performance.
                            </p>
                            <Button className="mt-4" asChild>
                                <a href="/rules">Add Rules</a>
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                                Evaluate how your trading rules performed today.
                                Select which rules worked well and which didn't.
                            </p>

                            <RulePerformanceForm
                                rules={rules}
                                entries={rulePerformanceEntries}
                                date={formatDate(date || new Date())}
                                onEntryAdded={refreshRulePerformanceEntries}
                                inJournalForm={true}
                            />
                        </div>
                    )}
                </TabsContent>
            </Tabs>

            {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-md">
                    {error}
                </div>
            )}

            <div className="flex justify-between">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/daily-journal")}
                >
                    Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : "Save Journal Entry"}
                </Button>
            </div>
        </form>
    );
}
