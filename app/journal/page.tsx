import Link from "next/link";
import { getTradeJournalEntriesAction } from "./actions";
import { getRulesAction } from "../rules/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarPlus } from "lucide-react";
import { JournalStatistics } from "./components/journal-statistics";
import { TradesList } from "./components/trades-list";
import type { TradeJournalEntryWithRules, Rule } from "@/lib/types";

export default async function JournalPage() {
    const entriesResult = await getTradeJournalEntriesAction();
    const rulesResult = await getRulesAction();

    // Ensure we have proper typing and default to empty arrays if data is undefined
    const entries: TradeJournalEntryWithRules[] =
        entriesResult.success && entriesResult.data ? entriesResult.data : [];
    const rules: Rule[] =
        rulesResult.success && rulesResult.data ? rulesResult.data : [];

    // Group entries by date
    const entriesByDate = entries.reduce((acc, entry) => {
        if (!acc[entry.date]) {
            acc[entry.date] = [];
        }
        acc[entry.date].push(entry);
        return acc;
    }, {} as Record<string, TradeJournalEntryWithRules[]>);

    // Sort dates in descending order
    const sortedDates = Object.keys(entriesByDate).sort((a, b) => {
        return new Date(b).getTime() - new Date(a).getTime();
    });

    return (
        <div className="w-full max-w-5xl mx-auto py-8 px-4">
            <div className="flex flex-col gap-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Trade Journal
                        </h1>
                        <p className="text-muted-foreground">
                            Record and analyze your daily trades
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/journal/new">
                            <CalendarPlus className="mr-2 h-4 w-4" />
                            New Trade Entry
                        </Link>
                    </Button>
                </div>

                <JournalStatistics />

                <div className="space-y-6">
                    <h2 className="text-xl font-semibold">Recent Trades</h2>

                    {entries.length === 0 ? (
                        <Card>
                            <CardContent className="pt-6 pb-6 text-center">
                                <p className="text-muted-foreground">
                                    No trade journal entries yet. Start by
                                    adding your first trade.
                                </p>
                                <Button className="mt-4" asChild>
                                    <Link href="/journal/new">
                                        <CalendarPlus className="mr-2 h-4 w-4" />
                                        Add First Trade
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <TradesList entries={entries} rules={rules} />
                    )}
                </div>
            </div>
        </div>
    );
}
