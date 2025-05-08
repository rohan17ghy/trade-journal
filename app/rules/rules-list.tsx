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
import { Switch } from "@/components/ui/switch";
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
    EyeOff,
} from "lucide-react";
import { deleteRuleAction, updateRuleAction } from "./actions";
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
    const [isToggling, setIsToggling] = useState<string | null>(null);
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

    async function handleToggleActive(rule: Rule, e: React.MouseEvent) {
        e.stopPropagation(); // Prevent the card click event from triggering

        console.log(`Handle toggle active triggered`);

        setIsToggling(rule.id);

        try {
            const updatedRule = {
                ...rule,
                isActive: !rule.isActive,
            };

            const result = await updateRuleAction(rule.id, updatedRule);

            if (result.success) {
                // Update the rules state with the updated rule
                setRules(
                    rules.map((r) =>
                        r.id === rule.id ? { ...r, isActive: !r.isActive } : r
                    )
                );

                // If this rule is currently selected, update the selected rule too
                if (selectedRule?.id === rule.id) {
                    setSelectedRule({
                        ...selectedRule,
                        isActive: !selectedRule.isActive,
                    });
                }
            } else {
                alert("Failed to update rule status");
            }
        } catch (error) {
            console.error("Error toggling rule status:", error);
            alert("An error occurred while updating the rule");
        } finally {
            setIsToggling(null);
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

                    // Check if rule is inactive
                    const isInactive = rule.isActive === false;

                    return (
                        <Card
                            key={rule.id}
                            className={`group relative overflow-hidden rounded-lg transition-all duration-300 cursor-pointer flex flex-col h-full border-l-4 hover:scale-[1.01] ${
                                isInactive
                                    ? "bg-gray-950/80 border-gray-950 shadow-none"
                                    : "bg-black border-gray-700 shadow-md hover:shadow-xl"
                            }`}
                            style={{ borderLeftColor: borderColor }}
                            onClick={() => handleViewRule(rule)}
                        >
                            {/* Subtle background gradient on hover for active state */}
                            <div
                                className={`absolute inset-0 transition-opacity duration-300 ${
                                    isInactive
                                        ? "bg-gray-950/90"
                                        : "group-hover:bg-gradient-to-br from-gray-900 to-black opacity-0 group-hover:opacity-100"
                                }`}
                            ></div>

                            <CardHeader className="relative pb-1 pt-4 px-5">
                                <div className="flex items-start gap-3">
                                    <div className="flex items-center gap-2 min-w-0 flex-1">
                                        {isInactive ? (
                                            <EyeOff className="h-5 w-5 text-gray-600 flex-shrink-0" />
                                        ) : (
                                            <BookOpen className="h-5 w-5 text-white flex-shrink-0" />
                                        )}
                                        <CardTitle
                                            className={`text-lg font-semibold truncate ${
                                                isInactive
                                                    ? "text-gray-600"
                                                    : "text-white"
                                            }`}
                                        >
                                            {rule.name}
                                        </CardTitle>
                                    </div>

                                    {/* Active toggle switch */}
                                    <div
                                        className="flex items-center gap-2 ml-auto"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <span
                                            className={`text-xs font-medium ${
                                                isInactive
                                                    ? "text-gray-600"
                                                    : "text-gray-300"
                                            }`}
                                        >
                                            {rule.isActive
                                                ? "Active"
                                                : "Inactive"}
                                        </span>
                                        <Switch
                                            checked={rule.isActive === true}
                                            disabled={isToggling === rule.id}
                                            onCheckedChange={(checked) => {
                                                handleToggleActive(rule, {
                                                    stopPropagation: () => {},
                                                } as React.MouseEvent);
                                            }}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                                                isInactive
                                                    ? "bg-gray-950"
                                                    : "bg-gray-700 data-[state=checked]:bg-white"
                                            }`}
                                        >
                                            <span
                                                className={`inline-block h-4 w-4 transform rounded-full bg-gray-400 transition-transform duration-200 ${
                                                    rule.isActive
                                                        ? "translate-x-6"
                                                        : "translate-x-1"
                                                }`}
                                            />
                                        </Switch>
                                    </div>
                                </div>

                                {/* Category badge */}
                                <div className="flex mt-3">
                                    <Badge
                                        className={`${
                                            isInactive
                                                ? "bg-gray-950/50 text-gray-600 border-gray-950"
                                                : `${categoryStyle.color} border-gray-600`
                                        } flex items-center gap-1 px-2.5 py-0.5 font-medium text-xs rounded-full whitespace-nowrap overflow-hidden transition-colors`}
                                        variant="outline"
                                        title={rule.category}
                                    >
                                        {categoryStyle.icon}
                                        <span className="truncate">
                                            {displayCategory}
                                        </span>
                                    </Badge>
                                </div>
                            </CardHeader>

                            <CardContent className="relative flex-grow pt-3 px-5">
                                <div
                                    className={`text-sm leading-relaxed ${
                                        isInactive
                                            ? "text-gray-600"
                                            : "text-gray-300"
                                    } max-h-40 overflow-hidden relative`}
                                >
                                    {rule.description ? (
                                        <>
                                            {/* {renderDescription(rule.description)} */}
                                            <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-black to-transparent"></div>
                                        </>
                                    ) : (
                                        <div className="flex items-center text-amber-400 gap-2">
                                            <AlertTriangle className="h-4 w-4" />
                                            No description provided
                                        </div>
                                    )}
                                </div>
                            </CardContent>

                            <CardFooter className="relative flex justify-end gap-2 mt-auto pt-3 pb-4 px-5">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className={`rounded-md border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white hover:border-gray-500 transition-all duration-200 ${
                                        isInactive
                                            ? "border-gray-950 text-gray-600 hover:bg-gray-950"
                                            : ""
                                    }`}
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
                                    className={`rounded-md border-gray-600 text-gray-300 hover:bg-red-950 hover:text-red-400 hover:border-red-700 transition-all duration-200 ${
                                        isInactive
                                            ? "border-gray-950 text-gray-600 hover:bg-gray-950"
                                            : ""
                                    }`}
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
