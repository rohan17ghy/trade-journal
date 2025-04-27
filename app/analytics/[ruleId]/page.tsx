import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { getRuleAction } from "@/app/rules/actions";
import { getRuleAnalyticsAction } from "../actions";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Calendar, CheckCircle, XCircle } from "lucide-react";
import { PerformanceTimeline } from "../components/performance-timeline";
import { PerformanceByDayOfWeek } from "../components/performance-by-day-of-week";
import { SuccessRateOverTime } from "../components/success-rate-over-time";
import { PerformanceEntryList } from "../components/performance-entry-list";

export default async function RuleAnalyticsPage({
    params,
}: {
    params: { ruleId: string };
}) {
    const { ruleId } = params;

    // Fetch rule details
    const ruleResult = await getRuleAction(ruleId);
    if (!ruleResult.success || !ruleResult.data) {
        notFound();
    }
    const rule = ruleResult.data;

    // Fetch rule analytics data
    const analyticsResult = await getRuleAnalyticsAction(ruleId);
    if (!analyticsResult.success || !analyticsResult.data) {
        throw new Error(
            analyticsResult.error || "Failed to load analytics data"
        );
    }

    // Now we can safely destructure since we've verified data exists
    const {
        entries,
        successRate,
        totalEntries,
        successfulEntries,
        failedEntries,
        performanceByDayOfWeek,
        performanceByMonth,
        recentTrend,
    } = analyticsResult.data;

    // Calculate streak (consecutive successes or failures)
    const sortedEntries = [...entries].sort(
        (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const currentStreak =
        sortedEntries.length > 0
            ? sortedEntries.reduce((streak, entry, index) => {
                  if (index === 0) return 1;
                  if (entry.status === sortedEntries[0].status)
                      return streak + 1;
                  return streak;
              }, 0)
            : 0;

    const streakType =
        sortedEntries.length > 0 ? sortedEntries[0].status : null;

    return (
        <div className="w-full max-w-5xl mx-auto py-8 px-4">
            <div className="flex flex-col gap-8">
                <div className="flex items-center justify-between">
                    <div>
                        <Link
                            href="/dashboard"
                            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2"
                        >
                            <ArrowLeft className="mr-1 h-4 w-4" />
                            Back to Dashboard
                        </Link>
                        <h1 className="text-2xl font-bold tracking-tight">
                            {rule.name}
                        </h1>
                        <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline">{rule.category}</Badge>
                            <span className="text-muted-foreground text-sm">
                                Created{" "}
                                {format(
                                    new Date(rule.createdAt),
                                    "MMM d, yyyy"
                                )}
                            </span>
                        </div>
                    </div>
                    <Button asChild variant="outline" size="sm">
                        <Link href={`/rules-performance?ruleId=${rule.id}`}>
                            <Calendar className="mr-2 h-4 w-4" />
                            Add Performance Data
                        </Link>
                    </Button>
                </div>

                {rule.description && (
                    <Card>
                        <CardContent className="pt-6">
                            <p className="text-muted-foreground">
                                {rule.description}
                            </p>
                        </CardContent>
                    </Card>
                )}

                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">
                                Success Rate
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {successRate}%
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Based on {totalEntries} evaluations
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">
                                Worked Well
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center">
                                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                                <span className="text-2xl font-bold">
                                    {successfulEntries}
                                </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {(
                                    (successfulEntries / totalEntries) *
                                    100
                                ).toFixed(1)}
                                % of the time
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">
                                Didn't Work Well
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center">
                                <XCircle className="h-5 w-5 text-red-500 mr-2" />
                                <span className="text-2xl font-bold">
                                    {failedEntries}
                                </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {((failedEntries / totalEntries) * 100).toFixed(
                                    1
                                )}
                                % of the time
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">
                                Current Streak
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {streakType ? (
                                <div className="flex items-center">
                                    {streakType === "success" ? (
                                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                                    ) : (
                                        <XCircle className="h-5 w-5 text-red-500 mr-2" />
                                    )}
                                    <span className="text-2xl font-bold">
                                        {currentStreak}
                                    </span>
                                </div>
                            ) : (
                                <div className="text-2xl font-bold">0</div>
                            )}
                            <p className="text-xs text-muted-foreground mt-1">
                                {streakType === "success"
                                    ? "Consecutive successes"
                                    : streakType === "failure"
                                    ? "Consecutive failures"
                                    : "No data yet"}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <Tabs defaultValue="timeline" className="w-full">
                    <TabsList>
                        <TabsTrigger value="timeline">Timeline</TabsTrigger>
                        <TabsTrigger value="patterns">Patterns</TabsTrigger>
                        <TabsTrigger value="trend">Success Trend</TabsTrigger>
                        <TabsTrigger value="entries">All Entries</TabsTrigger>
                    </TabsList>

                    <TabsContent value="timeline" className="pt-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Performance Timeline</CardTitle>
                                <CardDescription>
                                    Visualize when this rule worked well vs.
                                    when it didn't
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <PerformanceTimeline entries={entries} />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="patterns" className="pt-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Performance Patterns</CardTitle>
                                <CardDescription>
                                    Analyze how this rule performs on different
                                    days of the week
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <PerformanceByDayOfWeek
                                    data={performanceByDayOfWeek}
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="trend" className="pt-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Success Rate Over Time</CardTitle>
                                <CardDescription>
                                    Track how this rule's performance has
                                    changed over time
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <SuccessRateOverTime
                                    data={performanceByMonth}
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="entries" className="pt-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>All Performance Entries</CardTitle>
                                <CardDescription>
                                    Detailed list of all evaluations for this
                                    rule
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <PerformanceEntryList entries={entries} />
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
