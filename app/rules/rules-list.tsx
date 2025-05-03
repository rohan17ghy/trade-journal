"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    BookOpen,
    Edit,
    Trash2,
    AlertTriangle,
    ArrowRight,
    BookMarked,
    LineChart,
    ShieldAlert,
    Brain,
    CheckCircle2,
    ListOrdered,
    ListChecks,
} from "lucide-react";
import { deleteRuleAction } from "./actions";
import { RuleDetail } from "./rule-detail";
import type { Rule } from "@/lib/types";
import Link from "next/link";

interface RulesListProps {
    initialRules: Rule[];
}

// Define category colors, icons, and abbreviations
const categoryConfig: Record<
    string,
    { color: string; icon: React.ReactNode; abbr?: string }
> = {
    Entry: {
        color: "bg-emerald-100 text-emerald-800 border-emerald-200",
        icon: <ArrowRight className="h-4 w-4" />,
    },
    Exit: {
        color: "bg-rose-100 text-rose-800 border-rose-200",
        icon: <LineChart className="h-4 w-4" />,
    },
    "Risk Management": {
        color: "bg-amber-100 text-amber-800 border-amber-200",
        icon: <ShieldAlert className="h-4 w-4" />,
        abbr: "Risk Mgmt",
    },
    Psychology: {
        color: "bg-blue-100 text-blue-800 border-blue-200",
        icon: <Brain className="h-4 w-4" />,
    },
    Other: {
        color: "bg-slate-100 text-slate-800 border-slate-200",
        icon: <BookMarked className="h-4 w-4" />,
    },
};

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

            // Enhanced rendering for card view
            return (
                <div className="prose prose-sm max-w-none">
                    {blocks.slice(0, 4).map((block: any, index: number) => {
                        // Handle different block types
                        switch (block.type) {
                            case "paragraph":
                                return (
                                    <p
                                        key={index}
                                        className="mb-1.5 leading-relaxed"
                                    >
                                        {block.content?.map(
                                            (item: any, i: number) => {
                                                if (item.type === "text") {
                                                    const textContent =
                                                        item.text;

                                                    // Apply styling based on marks
                                                    if (item.marks) {
                                                        let className = "";

                                                        if (
                                                            item.marks.includes(
                                                                "bold"
                                                            )
                                                        ) {
                                                            className +=
                                                                " font-bold";
                                                        }
                                                        if (
                                                            item.marks.includes(
                                                                "italic"
                                                            )
                                                        ) {
                                                            className +=
                                                                " italic";
                                                        }
                                                        if (
                                                            item.marks.includes(
                                                                "underline"
                                                            )
                                                        ) {
                                                            className +=
                                                                " underline";
                                                        }
                                                        if (
                                                            item.marks.includes(
                                                                "code"
                                                            )
                                                        ) {
                                                            className +=
                                                                " font-mono bg-gray-100 px-1 rounded";
                                                        }

                                                        return (
                                                            <span
                                                                key={i}
                                                                className={className.trim()}
                                                            >
                                                                {textContent}
                                                            </span>
                                                        );
                                                    }

                                                    return textContent;
                                                }
                                                return null;
                                            }
                                        )}
                                    </p>
                                );

                            case "heading":
                                // Handle heading levels explicitly
                                const headingText = block.content
                                    ?.map((item: any) =>
                                        item.type === "text" ? item.text : ""
                                    )
                                    .join("");

                                const headingLevel = block.props?.level || 3;

                                // Render different heading levels with appropriate styling
                                if (headingLevel === 1) {
                                    return (
                                        <h3
                                            key={index}
                                            className="font-bold mb-1 text-base"
                                        >
                                            {headingText}
                                        </h3>
                                    );
                                } else if (headingLevel === 2) {
                                    return (
                                        <h3
                                            key={index}
                                            className="font-semibold mb-1 text-base"
                                        >
                                            {headingText}
                                        </h3>
                                    );
                                } else {
                                    return (
                                        <h3
                                            key={index}
                                            className="font-medium mb-1 text-sm"
                                        >
                                            {headingText}
                                        </h3>
                                    );
                                }

                            case "bulletList":
                                return (
                                    <div
                                        key={index}
                                        className="flex items-start gap-1 mb-1.5"
                                    >
                                        <ListChecks className="h-4 w-4 mt-0.5 text-slate-500 flex-shrink-0" />
                                        <div>
                                            {block.content
                                                ?.map((item: any, i: number) =>
                                                    item.type === "text"
                                                        ? item.text
                                                        : ""
                                                )
                                                .join("")}
                                        </div>
                                    </div>
                                );

                            case "numberedList":
                                return (
                                    <div
                                        key={index}
                                        className="flex items-start gap-1 mb-1.5"
                                    >
                                        <ListOrdered className="h-4 w-4 mt-0.5 text-slate-500 flex-shrink-0" />
                                        <div>
                                            {block.content
                                                ?.map((item: any, i: number) =>
                                                    item.type === "text"
                                                        ? item.text
                                                        : ""
                                                )
                                                .join("")}
                                        </div>
                                    </div>
                                );

                            case "checkList":
                                return (
                                    <div
                                        key={index}
                                        className="flex items-start gap-1 mb-1.5"
                                    >
                                        <CheckCircle2 className="h-4 w-4 mt-0.5 text-emerald-500 flex-shrink-0" />
                                        <div>
                                            {block.content
                                                ?.map((item: any, i: number) =>
                                                    item.type === "text"
                                                        ? item.text
                                                        : ""
                                                )
                                                .join("")}
                                        </div>
                                    </div>
                                );

                            default:
                                return null;
                        }
                    })}

                    {blocks.length > 4 && (
                        <p className="text-xs text-slate-500 mt-1">
                            {blocks.length - 4} more{" "}
                            {blocks.length - 4 === 1 ? "block" : "blocks"}...
                        </p>
                    )}
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
                {rules.map((rule) => {
                    const categoryStyle =
                        categoryConfig[rule.category] ||
                        categoryConfig["Other"];
                    const borderColor = categoryStyle.color
                        .split(" ")[1]
                        .replace("bg-", "#")
                        .replace("-100", "-500");

                    // Use abbreviated category name if available
                    const displayCategory = categoryStyle.abbr || rule.category;

                    return (
                        <Card
                            key={rule.id}
                            className="hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col h-full border-l-4 hover:scale-[1.01]"
                            style={{ borderLeftColor: borderColor }}
                            onClick={() => handleViewRule(rule)}
                        >
                            <CardHeader className="pb-1 pt-3 px-4">
                                <div className="flex items-start gap-8">
                                    <div className="flex items-center gap-2 min-w-0 flex-1">
                                        <BookOpen className="h-5 w-5 text-slate-600 flex-shrink-0" />
                                        <CardTitle className="text-lg truncate">
                                            {rule.name}
                                        </CardTitle>
                                    </div>
                                    <Badge
                                        className={`${categoryStyle.color} flex items-center gap-1 px-2 py-0.5 font-medium whitespace-nowrap max-w-[100px] overflow-hidden flex-shrink-0 ml-auto`}
                                        variant="outline"
                                        title={rule.category} // Add title for tooltip on hover
                                    >
                                        {categoryStyle.icon}
                                        <span className="truncate">
                                            {displayCategory}
                                        </span>
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="flex-grow pt-2 px-4">
                                <div className="text-sm text-muted-foreground max-h-40 overflow-hidden relative">
                                    {rule.description ? (
                                        <>
                                            {renderDescription(
                                                rule.description
                                            )}
                                            <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-background to-transparent"></div>
                                        </>
                                    ) : (
                                        <div className="flex items-center text-amber-600 gap-2">
                                            <AlertTriangle className="h-4 w-4" />
                                            No description provided
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-end gap-2 mt-auto pt-2 pb-3 px-4">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors"
                                    asChild
                                >
                                    <Link
                                        href={`/rules/${rule.id}/edit`}
                                        className="flex items-center gap-1"
                                    >
                                        <Edit className="h-4 w-4" />
                                        Edit
                                    </Link>
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
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
                    );
                })}
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
