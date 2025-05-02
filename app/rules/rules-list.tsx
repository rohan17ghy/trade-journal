"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2 } from "lucide-react";
import { deleteRuleAction } from "./actions";
import { RuleDetail } from "./rule-detail";
import type { Rule } from "@/lib/types";
import Link from "next/link";

interface RulesListProps {
    initialRules: Rule[];
}

export function RulesList({ initialRules }: RulesListProps) {
    const [rules, setRules] = useState<Rule[]>(initialRules);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [selectedRule, setSelectedRule] = useState<Rule | null>(null);
    const [detailOpen, setDetailOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const router = useRouter();

    async function handleDelete(id: string, e?: React.MouseEvent) {
        // Prevent the card click event from triggering
        if (e) {
            e.stopPropagation();
        }

        if (confirm("Are you sure you want to delete this rule?")) {
            setIsDeleting(id);
            const result = await deleteRuleAction(id);

            if (result.success) {
                setRules(rules.filter((rule) => rule.id !== id));

                // If the deleted rule is currently selected, close the detail view
                if (selectedRule?.id === id) {
                    setSelectedRule(null);
                    setDetailOpen(false);
                }
            } else {
                alert("Failed to delete rule");
            }

            setIsDeleting(null);
            router.refresh();
        }
    }

    const handleViewRule = (rule: Rule) => {
        setSelectedRule(rule);
        setIsEditing(false);
        setDetailOpen(true);
    };

    const handleEditRule = (rule: Rule, e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent the card click event from triggering
        setSelectedRule(rule);
        setIsEditing(true);
        setDetailOpen(true);
    };

    const handleRuleUpdated = (updatedRule: Rule) => {
        setRules(
            rules.map((rule) =>
                rule.id === updatedRule.id ? updatedRule : rule
            )
        );
        setSelectedRule(updatedRule);
        router.refresh();
    };

    // Function to render rich text content
    const renderDescription = (content: string) => {
        try {
            // Try to parse as JSON (BlockNote format)
            const blocks = JSON.parse(content);

            // Simple text rendering for card view
            return (
                <div className="prose prose-sm max-w-none">
                    {blocks.map((block: any, index: number) => {
                        if (block.type === "paragraph") {
                            return (
                                <p key={index} className="mb-2">
                                    {block.content
                                        ?.map((item: any, i: number) =>
                                            item.type === "text"
                                                ? item.text
                                                : ""
                                        )
                                        .join("")}
                                </p>
                            );
                        }
                        return null;
                    })}
                </div>
            );
        } catch (e) {
            // If parsing fails, treat as plain text (for backwards compatibility)
            return <p className="whitespace-pre-wrap">{content}</p>;
        }
    };

    if (rules.length === 0) {
        return (
            <div className="text-center p-8 border rounded-lg border-border">
                <p className="text-muted-foreground">
                    No rules added yet. Add your first trading rule above.
                </p>
            </div>
        );
    }

    return (
        <>
            <div className="grid gap-4 md:grid-cols-2">
                {rules.map((rule) => (
                    <Card
                        key={rule.id}
                        className="hover:shadow-md transition-shadow cursor-pointer flex flex-col h-full"
                        onClick={() => handleViewRule(rule)}
                    >
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle>{rule.name}</CardTitle>
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
                        <CardContent className="flex-grow">
                            <div className="text-sm text-muted-foreground max-h-24 overflow-hidden relative">
                                {rule.description ? (
                                    <>
                                        {renderDescription(rule.description)}
                                        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-background to-transparent"></div>
                                    </>
                                ) : (
                                    "No description provided"
                                )}
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-end gap-2 mt-auto pt-4">
                            <Button variant="outline" size="sm" asChild>
                                <Link href={`/rules/${rule.id}/edit`}>
                                    Edit
                                </Link>
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => handleDelete(rule.id, e)}
                                disabled={isDeleting === rule.id}
                            >
                                <Trash2 className="h-4 w-4 mr-1" />
                                {isDeleting === rule.id
                                    ? "Deleting..."
                                    : "Delete"}
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            <RuleDetail
                rule={selectedRule}
                open={detailOpen}
                onOpenChange={setDetailOpen}
                onRuleUpdated={handleRuleUpdated}
                isEditing={isEditing}
                setIsEditing={setIsEditing}
            />
        </>
    );
}
