import { getRulesAction } from "../rules/actions";
import { getAllTrackingEntriesAction } from "../tracking/actions";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, MinusCircle } from "lucide-react";
import type { Rule, TrackingEntryWithRule } from "@/lib/types";

export default async function DashboardPage() {
    const rulesResult = await getRulesAction();
    const entriesResult = await getAllTrackingEntriesAction();

    const rules = (rulesResult.success ? rulesResult.data : []) as Rule[];
    const entries = (
        entriesResult.success ? entriesResult.data : []
    ) as TrackingEntryWithRule[];

    // Get unique dates
    const uniqueDates = [...new Set(entries.map((entry) => entry.date))].length;

    // Calculate success rate for each rule
    const ruleStats = rules.map((rule) => {
        const ruleEntries = entries.filter((entry) => entry.ruleId === rule.id);

        // Filter out not_applicable entries for rate calculations
        const applicableEntries = ruleEntries.filter(
            (e) => e.status !== "not_applicable"
        );
        const totalApplicable = applicableEntries.length;
        const successfulEntries = applicableEntries.filter(
            (e) => e.status === "success"
        ).length;
        const failedEntries = applicableEntries.filter(
            (e) => e.status === "failure"
        ).length;
        const notApplicableCount = ruleEntries.filter(
            (e) => e.status === "not_applicable"
        ).length;

        const successRate =
            totalApplicable > 0
                ? Math.round((successfulEntries / totalApplicable) * 100)
                : 0;

        return {
            rule,
            totalEntries: ruleEntries.length,
            applicableEntries: totalApplicable,
            successfulEntries,
            failedEntries,
            notApplicableCount,
            successRate,
        };
    });

    // Calculate overall stats
    const applicableEntries = entries.filter(
        (e) => e.status !== "not_applicable"
    );
    const successfulEntries = applicableEntries.filter(
        (e) => e.status === "success"
    ).length;
    const overallSuccessRate =
        applicableEntries.length > 0
            ? Math.round((successfulEntries / applicableEntries.length) * 100)
            : 0;

    return (
        <div className="w-full max-w-4xl mx-auto py-8 px-4">
            <div className="flex flex-col gap-8">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        Dashboard
                    </h1>
                    <p className="text-muted-foreground">
                        Overview of your trading rules performance
                    </p>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Rules
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {rules.length}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">
                                Days Tracked
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {uniqueDates}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">
                                Overall Success Rate
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {overallSuccessRate}%
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                (excluding N/A entries)
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div>
                    <h2 className="text-xl font-bold mb-4">Rule Performance</h2>

                    {ruleStats.length === 0 ? (
                        <div className="text-center p-8 border rounded-lg border-border">
                            <p className="text-muted-foreground">
                                No data available yet. Start tracking your
                                rules.
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {ruleStats.map(
                                ({
                                    rule,
                                    totalEntries,
                                    successfulEntries,
                                    failedEntries,
                                    notApplicableCount,
                                    successRate,
                                }) => (
                                    <Card key={rule.id}>
                                        <CardHeader className="pb-2">
                                            <div className="flex justify-between items-start">
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
                                            <div className="grid grid-cols-3 gap-4">
                                                <div>
                                                    <p className="text-sm text-muted-foreground">
                                                        Success Rate
                                                    </p>
                                                    <p className="text-xl font-bold">
                                                        {successRate}%
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        (excluding N/A)
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-muted-foreground">
                                                        Times Tracked
                                                    </p>
                                                    <p className="text-xl font-bold">
                                                        {totalEntries}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-muted-foreground">
                                                        Breakdown
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <div className="flex items-center">
                                                            <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                                                            <span className="text-sm">
                                                                {
                                                                    successfulEntries
                                                                }
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center">
                                                            <XCircle className="h-4 w-4 text-red-500 mr-1" />
                                                            <span className="text-sm">
                                                                {failedEntries}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center">
                                                            <MinusCircle className="h-4 w-4 text-muted-foreground mr-1" />
                                                            <span className="text-sm">
                                                                {
                                                                    notApplicableCount
                                                                }
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-4 w-full bg-secondary rounded-full h-2.5">
                                                <div
                                                    className="bg-green-600 h-2.5 rounded-full"
                                                    style={{
                                                        width: `${successRate}%`,
                                                    }}
                                                ></div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
