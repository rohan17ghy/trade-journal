"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { addTrackingEntryAction } from "./actions";
import { CheckCircle, XCircle, ArrowLeft, Check, Clock } from "lucide-react";
import type { Rule, StatusType, TrackingEntryWithRule } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";

interface StepByStepTrackingFormProps {
    rules: Rule[];
    entries: TrackingEntryWithRule[];
    date: string;
    onEntryAdded: () => void;
}

export function StepByStepTrackingForm({
    rules,
    entries,
    date,
    onEntryAdded,
}: StepByStepTrackingFormProps) {
    const router = useRouter();
    const [selectedRuleId, setSelectedRuleId] = useState<string | null>(null);
    const [ruleStatus, setRuleStatus] = useState<Record<string, StatusType>>(
        {}
    );
    const [notes, setNotes] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Find the selected rule
    const selectedRule = selectedRuleId
        ? rules.find((rule) => rule.id === selectedRuleId)
        : null;

    // Group entries by rule for display
    const entriesByRule = entries.reduce((acc, entry) => {
        if (!acc[entry.ruleId]) {
            acc[entry.ruleId] = [];
        }
        acc[entry.ruleId].push(entry);
        return acc;
    }, {} as Record<string, TrackingEntryWithRule[]>);

    // Format relative time - fixed to handle different date formats
    const getRelativeTime = (dateStr: Date | string) => {
        try {
            // If it's already a Date object, use it directly
            const date = dateStr instanceof Date ? dateStr : new Date(dateStr);

            // Check if the date is valid
            if (isNaN(date.getTime())) {
                return "recently";
            }

            return formatDistanceToNow(date, { addSuffix: true });
        } catch (e) {
            console.error("Error formatting date:", e);
            return "recently";
        }
    };

    async function handleSubmitRule() {
        if (!selectedRuleId || !ruleStatus[selectedRuleId]) return;

        setIsSubmitting(true);
        setError(null);

        try {
            const result = await addTrackingEntryAction({
                date,
                ruleId: selectedRuleId,
                status: ruleStatus[selectedRuleId],
                notes: notes[selectedRuleId] || "",
            });

            if (!result.success) {
                throw new Error(
                    result.error || "Failed to save tracking entry"
                );
            }

            // Clear form for next entry
            setRuleStatus({
                ...ruleStatus,
                [selectedRuleId]: undefined as any,
            });
            setNotes({
                ...notes,
                [selectedRuleId]: "",
            });

            // Call the callback to refresh data
            onEntryAdded();

            // Return to rule selection page after saving
            setSelectedRuleId(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setIsSubmitting(false);
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

    // Step 1: Select a rule
    if (!selectedRuleId) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Select a Rule to Track</CardTitle>
                    <CardDescription>
                        Choose a trading rule to evaluate for {date}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <Select
                            onValueChange={(value) => setSelectedRuleId(value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select a rule" />
                            </SelectTrigger>
                            <SelectContent>
                                {rules.map((rule) => (
                                    <SelectItem key={rule.id} value={rule.id}>
                                        {rule.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {entries.length > 0 && (
                            <div className="mt-6">
                                <h3 className="text-sm font-medium mb-3">
                                    Today's Entries ({entries.length})
                                </h3>
                                <div className="space-y-4">
                                    {Object.entries(entriesByRule).map(
                                        ([ruleId, ruleEntries]) => {
                                            const rule = rules.find(
                                                (r) => r.id === ruleId
                                            );
                                            if (!rule) return null;

                                            // Sort entries by createdAt in descending order (newest first)
                                            const sortedEntries = [
                                                ...ruleEntries,
                                            ].sort(
                                                (a, b) =>
                                                    new Date(
                                                        b.createdAt
                                                    ).getTime() -
                                                    new Date(
                                                        a.createdAt
                                                    ).getTime()
                                            );

                                            return (
                                                <div
                                                    key={ruleId}
                                                    className="border rounded-md p-3"
                                                >
                                                    <h4 className="font-medium mb-2 flex items-center">
                                                        {rule.name}
                                                        <Badge
                                                            variant="outline"
                                                            className="ml-2"
                                                        >
                                                            {ruleEntries.length}{" "}
                                                            {ruleEntries.length ===
                                                            1
                                                                ? "entry"
                                                                : "entries"}
                                                        </Badge>
                                                    </h4>
                                                    <div className="space-y-3">
                                                        {sortedEntries.map(
                                                            (entry) => (
                                                                <div
                                                                    key={
                                                                        entry.id
                                                                    }
                                                                    className="text-sm border-l-2 pl-2 py-1"
                                                                    style={{
                                                                        borderLeftColor:
                                                                            entry.status ===
                                                                            "success"
                                                                                ? "rgb(34, 197, 94)"
                                                                                : "rgb(239, 68, 68)",
                                                                    }}
                                                                >
                                                                    <div className="flex items-center">
                                                                        {entry.status ===
                                                                        "success" ? (
                                                                            <CheckCircle className="h-4 w-4 mr-1 text-green-500 flex-shrink-0" />
                                                                        ) : (
                                                                            <XCircle className="h-4 w-4 mr-1 text-red-500 flex-shrink-0" />
                                                                        )}
                                                                        <span className="ml-1 font-medium">
                                                                            {entry.status ===
                                                                            "success"
                                                                                ? "Worked Well"
                                                                                : "Didn't Work Well"}
                                                                        </span>
                                                                        <span className="ml-auto text-xs text-muted-foreground flex items-center">
                                                                            <Clock className="h-3 w-3 mr-1" />
                                                                            {getRelativeTime(
                                                                                entry.createdAt
                                                                            )}
                                                                        </span>
                                                                    </div>
                                                                    {entry.notes && (
                                                                        <p className="mt-1 text-muted-foreground text-xs pl-5">
                                                                            "
                                                                            {
                                                                                entry.notes
                                                                            }
                                                                            "
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            )
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        }
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Step 2: Evaluate the selected rule
    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>{selectedRule?.name}</CardTitle>
                        <CardDescription>
                            <Badge variant="outline" className="mt-1">
                                {selectedRule?.category}
                            </Badge>
                        </CardDescription>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedRuleId(null)}
                    >
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Back to rules
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {selectedRule?.description && (
                        <div className="bg-muted/50 p-3 rounded-md text-sm">
                            {selectedRule.description}
                        </div>
                    )}

                    <div>
                        <Label className="text-sm mb-2 block">
                            How did this rule perform?
                        </Label>
                        <RadioGroup
                            value={ruleStatus[selectedRuleId] || ""}
                            onValueChange={(value: StatusType) => {
                                setRuleStatus({
                                    ...ruleStatus,
                                    [selectedRuleId]: value,
                                });
                            }}
                            className="flex flex-col space-y-3"
                        >
                            <div className="flex items-center space-x-2 p-3 border rounded-md hover:bg-accent">
                                <RadioGroupItem
                                    value="success"
                                    id={`success-${selectedRuleId}`}
                                />
                                <Label
                                    htmlFor={`success-${selectedRuleId}`}
                                    className="flex items-center cursor-pointer w-full"
                                >
                                    <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                                    Worked Well
                                </Label>
                            </div>
                            <div className="flex items-center space-x-2 p-3 border rounded-md hover:bg-accent">
                                <RadioGroupItem
                                    value="failure"
                                    id={`failure-${selectedRuleId}`}
                                />
                                <Label
                                    htmlFor={`failure-${selectedRuleId}`}
                                    className="flex items-center cursor-pointer w-full"
                                >
                                    <XCircle className="h-5 w-5 mr-2 text-red-500" />
                                    Didn't Work Well
                                </Label>
                            </div>
                        </RadioGroup>
                    </div>

                    <div className="grid gap-2">
                        <Label
                            htmlFor={`notes-${selectedRuleId}`}
                            className="text-sm"
                        >
                            Notes
                        </Label>
                        <Textarea
                            id={`notes-${selectedRuleId}`}
                            placeholder="Add notes about this rule's performance"
                            value={notes[selectedRuleId] || ""}
                            onChange={(e) => {
                                setNotes({
                                    ...notes,
                                    [selectedRuleId]: e.target.value,
                                });
                            }}
                            rows={3}
                        />
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-md text-sm">
                            {error}
                        </div>
                    )}
                </div>
            </CardContent>
            <CardFooter className="flex justify-between">
                <Button
                    variant="outline"
                    onClick={() => setSelectedRuleId(null)}
                >
                    Cancel
                </Button>
                <Button
                    onClick={handleSubmitRule}
                    disabled={isSubmitting || !ruleStatus[selectedRuleId]}
                >
                    {isSubmitting ? "Saving..." : "Save Entry"}
                    {!isSubmitting && <Check className="ml-2 h-4 w-4" />}
                </Button>
            </CardFooter>
        </Card>
    );
}
