"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, XCircle, MinusCircle } from "lucide-react";
import type { Rule, RulePerformance, StatusType } from "@/lib/types";

interface RulePerformanceSelectorProps {
    rules: Rule[];
    rulePerformances: RulePerformance[];
    onUpdate: (performance: RulePerformance) => void;
}

export function RulePerformanceSelector({
    rules,
    rulePerformances,
    onUpdate,
}: RulePerformanceSelectorProps) {
    // Group rules by category for better organization
    const rulesByCategory = rules.reduce((acc, rule) => {
        if (!acc[rule.category]) {
            acc[rule.category] = [];
        }
        acc[rule.category].push(rule);
        return acc;
    }, {} as Record<string, Rule[]>);

    // Get performance for a specific rule
    const getPerformance = (ruleId: string) => {
        return (
            rulePerformances.find((perf) => perf.ruleId === ruleId) || {
                ruleId,
                ruleName: rules.find((r) => r.id === ruleId)?.name || "",
                status: "not_applicable" as StatusType,
                notes: "",
            }
        );
    };

    // Handle status change
    const handleStatusChange = (ruleId: string, status: StatusType) => {
        const currentPerf = getPerformance(ruleId);
        onUpdate({
            ...currentPerf,
            status,
        });
    };

    // Handle notes change
    const handleNotesChange = (ruleId: string, notes: string) => {
        const currentPerf = getPerformance(ruleId);
        onUpdate({
            ...currentPerf,
            notes,
        });
    };

    return (
        <div className="space-y-6">
            {Object.entries(rulesByCategory).map(
                ([category, categoryRules]) => (
                    <div key={category} className="space-y-4">
                        <h3 className="text-lg font-medium">
                            {category} Rules
                        </h3>

                        <div className="grid gap-4">
                            {categoryRules.map((rule) => {
                                const performance = getPerformance(rule.id);

                                return (
                                    <Card key={rule.id}>
                                        <CardHeader className="pb-2">
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <CardTitle className="text-base">
                                                        {rule.name}
                                                    </CardTitle>
                                                    <Badge
                                                        variant="outline"
                                                        className="mt-1"
                                                    >
                                                        {rule.category}
                                                    </Badge>
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
                                                        value={
                                                            performance.status
                                                        }
                                                        onValueChange={(
                                                            value: StatusType
                                                        ) =>
                                                            handleStatusChange(
                                                                rule.id,
                                                                value
                                                            )
                                                        }
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
                                                                Not Applicable
                                                                Today
                                                            </Label>
                                                        </div>
                                                    </RadioGroup>
                                                </div>

                                                {performance.status !==
                                                    "not_applicable" && (
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
                                                            value={
                                                                performance.notes
                                                            }
                                                            onChange={(e) =>
                                                                handleNotesChange(
                                                                    rule.id,
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                            rows={2}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    </div>
                )
            )}
        </div>
    );
}
