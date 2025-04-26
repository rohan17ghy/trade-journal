"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { addTrackingEntryAction } from "./actions";
import { CheckCircle, XCircle, MinusCircle } from "lucide-react";
import type { Rule, StatusType, TrackingEntryWithRule } from "@/lib/types";

interface DailyTrackingFormProps {
    rules: Rule[];
    entries: TrackingEntryWithRule[];
    date: string;
}

export function DailyTrackingForm({
    rules,
    entries,
    date,
}: DailyTrackingFormProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submittingRuleId, setSubmittingRuleId] = useState<string | null>(
        null
    );
    const [ruleStatus, setRuleStatus] = useState<Record<string, StatusType>>(
        {}
    );
    const [notes, setNotes] = useState<Record<string, string>>({});
    const [error, setError] = useState<string | null>(null);

    // Initialize form with existing entries
    useEffect(() => {
        const statusMap: Record<string, StatusType> = {};
        const notesMap: Record<string, string> = {};

        entries.forEach((entry) => {
            statusMap[entry.ruleId] = entry.status as StatusType;
            notesMap[entry.ruleId] = entry.notes || "";
        });

        setRuleStatus(statusMap);
        setNotes(notesMap);
    }, [entries]);

    async function handleSubmitRule(ruleId: string) {
        if (!ruleStatus[ruleId]) return;

        setSubmittingRuleId(ruleId);
        setIsSubmitting(true);
        setError(null);

        try {
            const result = await addTrackingEntryAction({
                date,
                ruleId,
                status: ruleStatus[ruleId],
                notes: notes[ruleId] || "",
            });

            if (!result.success) {
                throw new Error(
                    result.error || "Failed to save tracking entry"
                );
            }

            // Success feedback could be added here
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setIsSubmitting(false);
            setSubmittingRuleId(null);
            router.refresh();
        }
    }

    if (rules.length === 0) {
        return (
            <div className="text-center p-8 border rounded-lg border-border">
                <p className="text-muted-foreground">
                    No rules added yet. Add rules first to track their
                    performance.
                </p>
                <Button className="mt-4" onClick={() => router.push("/rules")}>
                    Add Rules
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="grid gap-4">
                <h2 className="text-lg font-medium">Performance for {date}</h2>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-md">
                        {error}
                    </div>
                )}

                {rules.map((rule) => {
                    const currentStatus =
                        ruleStatus[rule.id] || "not_applicable";
                    const isSubmittingThis = submittingRuleId === rule.id;

                    return (
                        <Card key={rule.id}>
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <CardTitle className="text-base">
                                            {rule.name}
                                        </CardTitle>
                                        <CardDescription>
                                            <Badge
                                                variant="outline"
                                                className="mt-1"
                                            >
                                                {rule.category}
                                            </Badge>
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4">
                                    <div>
                                        <Label className="text-sm mb-2 block">
                                            Rule Status
                                        </Label>
                                        <RadioGroup
                                            value={currentStatus}
                                            onValueChange={(
                                                value: StatusType
                                            ) => {
                                                setRuleStatus({
                                                    ...ruleStatus,
                                                    [rule.id]: value,
                                                });
                                            }}
                                            className="flex flex-col space-y-1"
                                        >
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem
                                                    value="success"
                                                    id={`success-${rule.id}`}
                                                />
                                                <Label
                                                    htmlFor={`success-${rule.id}`}
                                                    className="flex items-center cursor-pointer"
                                                >
                                                    <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                                                    Worked Well
                                                </Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem
                                                    value="failure"
                                                    id={`failure-${rule.id}`}
                                                />
                                                <Label
                                                    htmlFor={`failure-${rule.id}`}
                                                    className="flex items-center cursor-pointer"
                                                >
                                                    <XCircle className="h-4 w-4 mr-2 text-red-500" />
                                                    Didn't Work Well
                                                </Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem
                                                    value="not_applicable"
                                                    id={`not_applicable-${rule.id}`}
                                                />
                                                <Label
                                                    htmlFor={`not_applicable-${rule.id}`}
                                                    className="flex items-center cursor-pointer"
                                                >
                                                    <MinusCircle className="h-4 w-4 mr-2 text-muted-foreground" />
                                                    Not Applicable Today
                                                </Label>
                                            </div>
                                        </RadioGroup>
                                    </div>

                                    <div className="grid gap-2">
                                        <Label
                                            htmlFor={`notes-${rule.id}`}
                                            className="text-sm"
                                        >
                                            Notes
                                        </Label>
                                        <Textarea
                                            id={`notes-${rule.id}`}
                                            placeholder="Add notes about this rule's performance today"
                                            value={notes[rule.id] || ""}
                                            onChange={(e) => {
                                                setNotes({
                                                    ...notes,
                                                    [rule.id]: e.target.value,
                                                });
                                            }}
                                            rows={2}
                                        />
                                    </div>

                                    <Button
                                        onClick={() =>
                                            handleSubmitRule(rule.id)
                                        }
                                        disabled={isSubmitting}
                                        size="sm"
                                    >
                                        {isSubmittingThis
                                            ? "Saving..."
                                            : "Save"}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
