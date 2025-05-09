import Link from "next/link";
import { getRulesAction } from "../rules/actions";
import { getAllRulePerformanceEntriesAction } from "../rules-performance/actions";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, ArrowRight, History, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Rule, RulePerformanceEntryWithRule } from "@/lib/types";

export default async function DashboardPage() {
    const rulesResult = await getRulesAction();
    const entriesResult = await getAllRulePerformanceEntriesAction();

    const rules = (rulesResult.success ? rulesResult.data : []) as Rule[];
    const entries = (
        entriesResult.success ? entriesResult.data : []
    ) as RulePerformanceEntryWithRule[];

    // Get unique dates
    const uniqueDates = [...new Set(entries.map((entry) => entry.date))].length;

    // Calculate success rate for each rule
    const ruleStats = rules.map((rule) => {
        const ruleEntries = entries.filter((entry) => entry.ruleId === rule.id);

        // Only count success and failure entries
        const totalEntries = ruleEntries.length;
        const successfulEntries = ruleEntries.filter(
            (e) => e.status === "success"
        ).length;
        const failedEntries = ruleEntries.filter(
            (e) => e.status === "failure"
        ).length;

        const successRate =
            totalEntries > 0
                ? Math.round((successfulEntries / totalEntries) * 100)
                : 0;

        return {
            rule,
            totalEntries,
            successfulEntries,
            failedEntries,
            successRate,
        };
    });

    // Calculate overall stats
    const totalEntries = entries.length;
    const successfulEntries = entries.filter(
        (e) => e.status === "success"
    ).length;
    const overallSuccessRate =
        totalEntries > 0
            ? Math.round((successfulEntries / totalEntries) * 100)
            : 0;

    // Count active rules
    const activeRules = rules.filter((rule) => rule.isActive).length;

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

                <div className="grid gap-4 md:grid-cols-4">
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
                                Active Rules
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {activeRules}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">
                                Days Evaluated
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
                                Success Rate
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {overallSuccessRate}%
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* New section for Rules History */}
                <div className="grid gap-4 md:grid-cols-2">
                    <Card className="hover:shadow-md transition-all">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <History className="h-5 w-5 text-blue-500" />
                                Rules Timeline
                            </CardTitle>
                            <CardDescription>
                                Track when rules were added, updated, or deleted
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <p className="text-sm text-muted-foreground mb-4">
                                View a chronological timeline of all changes to
                                your trading rules.
                            </p>
                            <Button asChild>
                                <Link href="/rules-history?tab=timeline">
                                    View Timeline
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-md transition-all">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="h-5 w-5 text-purple-500" />
                                Activity History
                            </CardTitle>
                            <CardDescription>
                                See which rules were active on any given day
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <p className="text-sm text-muted-foreground mb-4">
                                Check which trading rules were active or
                                inactive on specific dates in the past.
                            </p>
                            <Button asChild>
                                <Link href="/rules-history?tab=activity">
                                    View Activity
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                <div>
                    <h2 className="text-xl font-bold mb-4">
                        Rules Performance
                    </h2>

                    {ruleStats.length === 0 ? (
                        <div className="text-center p-8 border rounded-lg border-border">
                            <p className="text-muted-foreground">
                                No performance data available yet. Start
                                evaluating your rules.
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
                                    successRate,
                                }) => (
                                    <Link
                                        href={`/analytics/${rule.id}`}
                                        key={rule.id}
                                        className="block transition-transform hover:scale-[1.01]"
                                    >
                                        <Card className="hover:border-primary/50 transition-colors">
                                            <CardHeader className="pb-2">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <CardTitle className="text-base flex items-center">
                                                            {rule.name}
                                                            <ArrowRight className="ml-2 h-4 w-4 text-muted-foreground" />
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
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-muted-foreground">
                                                            Times Evaluated
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
                                                                    {
                                                                        failedEntries
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
                                    </Link>
                                )
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
