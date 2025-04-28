import Link from "next/link";
import { notFound } from "next/navigation";
import { format, parseISO } from "date-fns";
import { getDailyJournalAction } from "../actions";
import { getRulePerformanceEntriesForDateAction } from "@/app/rules-performance/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    ArrowLeft,
    Calendar,
    Pencil,
    TrendingUp,
    TrendingDown,
    CheckCircle,
    XCircle,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { TradesList } from "@/app/journal/components/trades-list";
import type { RulePerformanceEntryWithRule } from "@/lib/types";

export default async function DailyJournalPage({
    params,
}: {
    params: { date: string };
}) {
    const { date } = params;

    // Fetch journal details
    const journalResult = await getDailyJournalAction(date);
    if (!journalResult.success || !journalResult.data) {
        notFound();
    }

    // Fetch rule performances for this date
    const rulePerformancesResult = await getRulePerformanceEntriesForDateAction(
        date
    );
    const rulePerformances: RulePerformanceEntryWithRule[] =
        rulePerformancesResult.success && rulePerformancesResult.data
            ? rulePerformancesResult.data
            : [];

    const journal = journalResult.data;
    const formattedDate = format(parseISO(journal.date), "EEEE, MMMM d, yyyy");

    // Calculate total P/L for the day
    const totalPL = journal.trades.reduce(
        (sum, trade) => sum + (trade.profitLoss || 0),
        0
    );
    const hasTrades = journal.trades && journal.trades.length > 0;
    const hasRulePerformances = rulePerformances.length > 0;

    return (
        <div className="w-full max-w-4xl mx-auto py-8 px-4">
            <div className="flex flex-col gap-8">
                <div className="flex items-center justify-between">
                    <div>
                        <Link
                            href="/daily-journal"
                            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2"
                        >
                            <ArrowLeft className="mr-1 h-4 w-4" />
                            Back to Journal
                        </Link>
                        <h1 className="text-2xl font-bold tracking-tight flex items-center">
                            <Calendar className="h-5 w-5 mr-2" />
                            {formattedDate}
                        </h1>
                        <div className="flex items-center gap-2 mt-1"></div>
                    </div>
                    <Button asChild variant="outline" size="sm">
                        <Link href={`/daily-journal/${date}/edit`}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit Journal
                        </Link>
                    </Button>
                </div>

                <Tabs defaultValue="journal" className="w-full">
                    <TabsList>
                        <TabsTrigger value="journal">Journal</TabsTrigger>
                        <TabsTrigger value="trades">
                            Trades ({journal.trades.length})
                        </TabsTrigger>
                        <TabsTrigger value="rules">
                            Rules Performance ({rulePerformances.length})
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="journal" className="space-y-6 pt-4">
                        {journal.marketOverview && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Market Overview</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="whitespace-pre-line">
                                        {journal.marketOverview}
                                    </p>
                                </CardContent>
                            </Card>
                        )}

                        <div className="grid gap-6 md:grid-cols-2">
                            {journal.insights && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Insights</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="whitespace-pre-line">
                                            {journal.insights}
                                        </p>
                                    </CardContent>
                                </Card>
                            )}

                            {journal.challenges && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Mistakes</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="whitespace-pre-line">
                                            {journal.challenges}
                                        </p>
                                    </CardContent>
                                </Card>
                            )}

                            {journal.ruleModification && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Rule Modification</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="whitespace-pre-line">
                                            {journal.ruleModification}
                                        </p>
                                    </CardContent>
                                </Card>
                            )}
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                            {journal.goals && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Goals</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="whitespace-pre-line">
                                            {journal.goals}
                                        </p>
                                    </CardContent>
                                </Card>
                            )}

                            {journal.improvementAreas && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>
                                            Areas for Improvement
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="whitespace-pre-line">
                                            {journal.improvementAreas}
                                        </p>
                                    </CardContent>
                                </Card>
                            )}

                            {journal.planForTomorrow && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Plan for Tomorrow</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="whitespace-pre-line">
                                            {journal.planForTomorrow}
                                        </p>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="trades" className="pt-4">
                        {hasTrades ? (
                            <div className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Trading Summary</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center">
                                            <div className="text-lg font-medium mr-4">
                                                Total P/L:
                                            </div>
                                            <div
                                                className={`flex items-center text-lg font-bold ${
                                                    totalPL >= 0
                                                        ? "text-green-500"
                                                        : "text-red-500"
                                                }`}
                                            >
                                                {totalPL >= 0 ? (
                                                    <TrendingUp className="h-5 w-5 mr-1" />
                                                ) : (
                                                    <TrendingDown className="h-5 w-5 mr-1" />
                                                )}
                                                {formatCurrency(totalPL)}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <TradesList
                                    entries={journal.trades}
                                    rules={[]}
                                />
                            </div>
                        ) : (
                            <div className="text-center p-8 border rounded-lg border-border">
                                <p className="text-muted-foreground">
                                    No trades recorded for this day.
                                </p>
                                <Button className="mt-4" asChild>
                                    <Link href={`/journal/new?date=${date}`}>
                                        Add Trade
                                    </Link>
                                </Button>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="rules" className="pt-4">
                        {hasRulePerformances ? (
                            <div className="space-y-6">
                                {/* Group performances by rule */}
                                {(() => {
                                    // Group performances by ruleId
                                    const performancesByRule =
                                        rulePerformances.reduce(
                                            (acc, performance) => {
                                                if (!acc[performance.ruleId]) {
                                                    acc[performance.ruleId] =
                                                        [];
                                                }
                                                acc[performance.ruleId].push(
                                                    performance
                                                );
                                                return acc;
                                            },
                                            {} as Record<
                                                string,
                                                RulePerformanceEntryWithRule[]
                                            >
                                        );

                                    return Object.entries(
                                        performancesByRule
                                    ).map(([ruleId, performances]) => {
                                        const rule = performances[0].rule; // All performances for this rule have the same rule object

                                        // Sort performances by createdAt in descending order (newest first)
                                        const sortedPerformances = [
                                            ...performances,
                                        ].sort(
                                            (a, b) =>
                                                new Date(
                                                    b.createdAt
                                                ).getTime() -
                                                new Date(a.createdAt).getTime()
                                        );

                                        return (
                                            <Card key={ruleId}>
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
                                                            <Badge
                                                                variant="secondary"
                                                                className="mt-1 ml-2"
                                                            >
                                                                {
                                                                    performances.length
                                                                }{" "}
                                                                {performances.length ===
                                                                1
                                                                    ? "entry"
                                                                    : "entries"}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="space-y-4">
                                                        {sortedPerformances.map(
                                                            (performance) => (
                                                                <div
                                                                    key={
                                                                        performance.id
                                                                    }
                                                                    className="border-l-2 pl-3 py-2"
                                                                    style={{
                                                                        borderLeftColor:
                                                                            performance.status ===
                                                                            "success"
                                                                                ? "rgb(34, 197, 94)"
                                                                                : "rgb(239, 68, 68)",
                                                                    }}
                                                                >
                                                                    <div className="flex items-center">
                                                                        {performance.status ===
                                                                        "success" ? (
                                                                            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                                                                        ) : (
                                                                            <XCircle className="h-5 w-5 text-red-500 mr-2" />
                                                                        )}
                                                                        <span className="font-medium">
                                                                            {performance.status ===
                                                                            "success"
                                                                                ? "Worked Well"
                                                                                : "Didn't Work Well"}
                                                                        </span>
                                                                        <span className="ml-auto text-xs text-muted-foreground">
                                                                            {format(
                                                                                new Date(
                                                                                    performance.createdAt
                                                                                ),
                                                                                "h:mm a"
                                                                            )}
                                                                        </span>
                                                                    </div>
                                                                    {performance.notes && (
                                                                        <p className="text-sm text-muted-foreground mt-1">
                                                                            {
                                                                                performance.notes
                                                                            }
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            )
                                                        )}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        );
                                    });
                                })()}
                            </div>
                        ) : (
                            <div className="text-center p-8 border rounded-lg border-border">
                                <p className="text-muted-foreground">
                                    No rule performance data recorded for this
                                    day.
                                </p>
                                <Button className="mt-4" asChild>
                                    <Link href={`/daily-journal/${date}/edit`}>
                                        Add Rule Performance
                                    </Link>
                                </Button>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
