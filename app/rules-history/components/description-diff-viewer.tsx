"use client";

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { compareRuleVersionsAction } from "../actions";
import { diffJson } from "diff";
import { AlertCircle } from "lucide-react";

interface DescriptionDiffViewerProps {
    ruleId: string;
    versionA: number;
    versionB: number;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    ruleName: string;
}

export function DescriptionDiffViewer({
    ruleId,
    versionA,
    versionB,
    open,
    onOpenChange,
    ruleName,
}: DescriptionDiffViewerProps) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [versionAData, setVersionAData] = useState<any>(null);
    const [versionBData, setVersionBData] = useState<any>(null);
    const [diffResult, setDiffResult] = useState<any[]>([]);

    useEffect(() => {
        if (open) {
            loadVersions();
        }
    }, [open, ruleId, versionA, versionB]);

    async function loadVersions() {
        setLoading(true);
        setError(null);

        try {
            console.log("Loading versions:", { ruleId, versionA, versionB });

            // Add fallback content if versions can't be loaded
            if (!ruleId || versionA <= 0 || versionB <= 0) {
                console.log(
                    "Invalid version parameters, using fallback content"
                );
                setVersionAData({
                    name: "Example Rule (Old Version)",
                    category: "Example Category",
                    description: {
                        type: "doc",
                        content: [
                            {
                                type: "paragraph",
                                content: [
                                    {
                                        type: "text",
                                        text: "This is example content for version A.",
                                    },
                                ],
                            },
                        ],
                    },
                    isActive: true,
                    createdAt: new Date().toISOString(),
                });

                setVersionBData({
                    name: "Example Rule (New Version)",
                    category: "Example Category",
                    description: {
                        type: "doc",
                        content: [
                            {
                                type: "paragraph",
                                content: [
                                    {
                                        type: "text",
                                        text: "This is example content for version B with some changes.",
                                    },
                                ],
                            },
                        ],
                    },
                    isActive: false,
                    createdAt: new Date().toISOString(),
                });

                // Generate diff
                const diff = diffJson(
                    {
                        type: "doc",
                        content: [
                            {
                                type: "paragraph",
                                content: [
                                    {
                                        type: "text",
                                        text: "This is example content for version A.",
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        type: "doc",
                        content: [
                            {
                                type: "paragraph",
                                content: [
                                    {
                                        type: "text",
                                        text: "This is example content for version B with some changes.",
                                    },
                                ],
                            },
                        ],
                    }
                );
                setDiffResult(diff);
                setLoading(false);
                return;
            }

            const result = await compareRuleVersionsAction(
                ruleId,
                versionA,
                versionB
            );
            if (result.success && result.data) {
                setVersionAData(result.data.versionA);
                setVersionBData(result.data.versionB);

                // Generate diff
                const diff = diffJson(
                    result.data.versionA.description,
                    result.data.versionB.description
                );
                setDiffResult(diff);
            } else {
                console.error("Failed to load versions:", result.error);
                setError(result.error || "Failed to load versions");
            }
        } catch (err) {
            console.error("Error loading versions:", err);
            setError("An error occurred while loading versions");
        } finally {
            setLoading(false);
        }
    }

    // Function to render the JSON diff in the style of version 156
    const renderJsonDiff = () => {
        return (
            <div className="space-y-4">
                <div className="flex gap-4 text-xs">
                    <div className="flex items-center">
                        <div className="w-3 h-3 bg-red-100 border border-red-300 rounded mr-1"></div>
                        <span>Removed in Version {versionB}</span>
                    </div>
                    <div className="flex items-center">
                        <div className="w-3 h-3 bg-green-100 border border-green-300 rounded mr-1"></div>
                        <span>Added in Version {versionB}</span>
                    </div>
                </div>

                <div className="border rounded-md overflow-hidden">
                    <div className="bg-slate-50 p-2 text-xs font-medium border-b">
                        JSON Diff
                    </div>
                    <pre className="text-xs font-mono p-4 overflow-auto max-h-[400px] bg-white">
                        {diffResult.map((part, index) => {
                            const color = part.added
                                ? "text-green-600"
                                : part.removed
                                ? "text-red-600"
                                : "text-slate-800";
                            const bgColor = part.added
                                ? "bg-green-50"
                                : part.removed
                                ? "bg-red-50"
                                : "";
                            const prefix = part.added
                                ? "+ "
                                : part.removed
                                ? "- "
                                : "  ";

                            return (
                                <div
                                    key={index}
                                    className={`${color} ${bgColor} py-0.5`}
                                >
                                    {prefix}
                                    {typeof part.value === "string"
                                        ? part.value
                                        : JSON.stringify(part.value, null, 2)
                                              .split("\n")
                                              .map((line, i) => (
                                                  <span key={i}>
                                                      {line}
                                                      {i <
                                                          JSON.stringify(
                                                              part.value,
                                                              null,
                                                              2
                                                          ).split("\n").length -
                                                              1 && <br />}
                                                  </span>
                                              ))}
                                </div>
                            );
                        })}
                    </pre>
                </div>
            </div>
        );
    };

    // Render error state with recovery option
    const renderErrorState = () => (
        <div className="p-6 flex flex-col items-center justify-center text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-medium mb-2">Error Loading Versions</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <p className="text-sm text-muted-foreground mb-6">
                This might be because the rule versions don't exist in the
                database yet.
            </p>
            <Button onClick={loadVersions}>Try Again</Button>
        </div>
    );

    console.log(versionAData);
    console.log(versionBData);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle>
                        Compare Versions for &quot;{ruleName}&quot; (v{versionA}{" "}
                        → v{versionB})
                    </DialogTitle>
                </DialogHeader>

                {loading ? (
                    <div className="space-y-4 p-4">
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-64 w-full" />
                    </div>
                ) : error ? (
                    renderErrorState()
                ) : (
                    <div className="flex-1 overflow-auto p-4">
                        <div className="space-y-6">
                            {/* Field changes summary */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h3 className="text-sm font-medium text-muted-foreground mb-2">
                                        Other Changes
                                    </h3>
                                    <div className="space-y-2 text-sm">
                                        {versionAData.name !==
                                            versionBData.name && (
                                            <div>
                                                <div className="font-medium">
                                                    Name:
                                                </div>
                                                <div className="grid grid-cols-2 gap-2 mt-1">
                                                    <div className="bg-red-50 p-1.5 rounded border border-red-100 text-red-800">
                                                        <div className="text-xs text-red-500 mb-0.5">
                                                            Version {versionA}
                                                        </div>
                                                        {versionAData.name}
                                                    </div>
                                                    <div className="bg-green-50 p-1.5 rounded border border-green-100 text-green-800">
                                                        <div className="text-xs text-green-500 mb-0.5">
                                                            Version {versionB}
                                                        </div>
                                                        {versionBData.name}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {versionAData.category !==
                                            versionBData.category && (
                                            <div>
                                                <div className="font-medium">
                                                    Category:
                                                </div>
                                                <div className="grid grid-cols-2 gap-2 mt-1">
                                                    <div className="bg-red-50 p-1.5 rounded border border-red-100 text-red-800">
                                                        <div className="text-xs text-red-500 mb-0.5">
                                                            Version {versionA}
                                                        </div>
                                                        {versionAData.category}
                                                    </div>
                                                    <div className="bg-green-50 p-1.5 rounded border border-green-100 text-green-800">
                                                        <div className="text-xs text-green-500 mb-0.5">
                                                            Version {versionB}
                                                        </div>
                                                        {versionBData.category}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {versionAData.isActive !==
                                            versionBData.isActive && (
                                            <div>
                                                <div className="font-medium">
                                                    Active Status:
                                                </div>
                                                <div className="grid grid-cols-2 gap-2 mt-1">
                                                    <div className="bg-red-50 p-1.5 rounded border border-red-100 text-red-800">
                                                        <div className="text-xs text-red-500 mb-0.5">
                                                            Version {versionA}
                                                        </div>
                                                        {versionAData.isActive
                                                            ? "Active"
                                                            : "Inactive"}
                                                    </div>
                                                    <div className="bg-green-50 p-1.5 rounded border border-green-100 text-green-800">
                                                        <div className="text-xs text-green-500 mb-0.5">
                                                            Version {versionB}
                                                        </div>
                                                        {versionBData.isActive
                                                            ? "Active"
                                                            : "Inactive"}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {versionAData.name ===
                                            versionBData.name &&
                                            versionAData.category ===
                                                versionBData.category &&
                                            versionAData.isActive ===
                                                versionBData.isActive && (
                                                <div className="text-muted-foreground italic">
                                                    No changes to name,
                                                    category, or active status.
                                                </div>
                                            )}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-sm font-medium text-muted-foreground mb-2">
                                        Version Information
                                    </h3>
                                    <div className="space-y-2 text-sm">
                                        <div>
                                            <span className="font-medium">
                                                Version {versionA} created:
                                            </span>{" "}
                                            {new Date(
                                                versionAData.createdAt
                                            ).toLocaleString()}
                                        </div>
                                        <div>
                                            <span className="font-medium">
                                                Version {versionB} created:
                                            </span>{" "}
                                            {new Date(
                                                versionBData.createdAt
                                            ).toLocaleString()}
                                        </div>
                                        <div>
                                            <span className="font-medium">
                                                Time between versions:
                                            </span>{" "}
                                            {Math.round(
                                                (new Date(
                                                    versionBData.createdAt
                                                ).getTime() -
                                                    new Date(
                                                        versionAData.createdAt
                                                    ).getTime()) /
                                                    (1000 * 60)
                                            )}{" "}
                                            minutes
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* JSON Diff */}
                            <div className="mt-6">
                                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                                    Description Changes
                                </h3>
                                {renderJsonDiff()}
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex justify-end pt-2">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
