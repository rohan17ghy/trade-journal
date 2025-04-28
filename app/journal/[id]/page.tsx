import Link from "next/link";
import { notFound } from "next/navigation";
import { format, parseISO } from "date-fns";
import { getTradeJournalEntryAction } from "../actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, TrendingUp, TrendingDown, Pencil } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default async function TradeJournalEntryPage({
    params,
}: {
    params: { id: string };
}) {
    const { id } = params;

    const entryResult = await getTradeJournalEntryAction(id);
    if (!entryResult.success || !entryResult.data) {
        notFound();
    }

    const entry = entryResult.data;
    const formattedDate = format(parseISO(entry.date), "EEEE, MMMM d, yyyy");

    return (
        <div className="w-full max-w-4xl mx-auto py-8 px-4">
            <div className="flex flex-col gap-8">
                <div className="flex items-center justify-between">
                    <div>
                        <Link
                            href="/journal"
                            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2"
                        >
                            <ArrowLeft className="mr-1 h-4 w-4" />
                            Back to Journal
                        </Link>
                        <h1 className="text-2xl font-bold tracking-tight">
                            {entry.symbol}
                        </h1>
                        <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline">{entry.market}</Badge>
                            <Badge
                                variant={
                                    entry.direction === "Long"
                                        ? "default"
                                        : "destructive"
                                }
                            >
                                {entry.direction}
                            </Badge>
                            {entry.setup && (
                                <Badge variant="secondary">{entry.setup}</Badge>
                            )}
                            <span className="text-muted-foreground text-sm">
                                {formattedDate}
                            </span>
                        </div>
                    </div>
                    <Button asChild variant="outline" size="sm">
                        <Link href={`/journal/${id}/edit`}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit Trade
                        </Link>
                    </Button>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Trade Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <dl className="space-y-4">
                                <div className="grid grid-cols-2 gap-1">
                                    <dt className="text-muted-foreground">
                                        Entry Price:
                                    </dt>
                                    <dd>{entry.entryPrice.toFixed(2)}</dd>

                                    <dt className="text-muted-foreground">
                                        Exit Price:
                                    </dt>
                                    <dd>
                                        {entry.exitPrice
                                            ? entry.exitPrice.toFixed(2)
                                            : "Open"}
                                    </dd>

                                    <dt className="text-muted-foreground">
                                        Position Size:
                                    </dt>
                                    <dd>{entry.positionSize}</dd>

                                    <dt className="text-muted-foreground">
                                        Stop Loss:
                                    </dt>
                                    <dd>
                                        {entry.stopLoss
                                            ? entry.stopLoss.toFixed(2)
                                            : "N/A"}
                                    </dd>

                                    <dt className="text-muted-foreground">
                                        Take Profit:
                                    </dt>
                                    <dd>
                                        {entry.takeProfit
                                            ? entry.takeProfit.toFixed(2)
                                            : "N/A"}
                                    </dd>

                                    <dt className="text-muted-foreground">
                                        Duration:
                                    </dt>
                                    <dd>{entry.duration || "N/A"}</dd>

                                    <dt className="text-muted-foreground">
                                        Fees:
                                    </dt>
                                    <dd>
                                        {entry.fees
                                            ? formatCurrency(entry.fees)
                                            : "N/A"}
                                    </dd>

                                    <dt className="text-muted-foreground">
                                        Rating:
                                    </dt>
                                    <dd>
                                        {entry.rating
                                            ? `${entry.rating}/5`
                                            : "N/A"}
                                    </dd>
                                </div>
                            </dl>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Performance</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {entry.profitLoss !== null ? (
                                <div className="space-y-4">
                                    <div className="flex items-center">
                                        <div
                                            className={`text-2xl font-bold ${
                                                (entry.profitLoss || 0) >= 0
                                                    ? "text-green-500"
                                                    : "text-red-500"
                                            }`}
                                        >
                                            {(entry.profitLoss || 0) >= 0 ? (
                                                <TrendingUp className="h-6 w-6 inline mr-2" />
                                            ) : (
                                                <TrendingDown className="h-6 w-6 inline mr-2" />
                                            )}
                                            {formatCurrency(
                                                entry.profitLoss || 0
                                            )}
                                        </div>
                                    </div>

                                    {entry.profitLossPercentage && (
                                        <div>
                                            <span className="text-muted-foreground">
                                                Return:
                                            </span>{" "}
                                            <span
                                                className={`font-medium ${
                                                    entry.profitLossPercentage >=
                                                    0
                                                        ? "text-green-500"
                                                        : "text-red-500"
                                                }`}
                                            >
                                                {entry.profitLossPercentage.toFixed(
                                                    2
                                                )}
                                                %
                                            </span>
                                        </div>
                                    )}

                                    {entry.rules.length > 0 && (
                                        <div>
                                            <h3 className="text-sm font-medium mb-2">
                                                Applied Rules:
                                            </h3>
                                            <div className="flex flex-wrap gap-1">
                                                {entry.rules.map((rule) => (
                                                    <Badge
                                                        key={rule.id}
                                                        variant="outline"
                                                    >
                                                        {rule.name}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-muted-foreground">
                                    This trade is still open or missing exit
                                    information.
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {entry.psychology && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Psychology</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="whitespace-pre-line">
                                    {entry.psychology}
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    {entry.notes && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Notes</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="whitespace-pre-line">
                                    {entry.notes}
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {entry.lessonsLearned && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Lessons Learned</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="whitespace-pre-line">
                                {entry.lessonsLearned}
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
