import { notFound } from "next/navigation";
import Link from "next/link";
import { getTradeJournalEntryAction } from "../../actions";
import { getRulesAction } from "@/app/rules/actions";
import { TradeJournalForm } from "../../components/trade-journal-form";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import type { Rule } from "@/lib/types";

export default async function EditTradeJournalEntryPage({
    params,
}: {
    params: { id: string };
}) {
    const { id } = params;

    // Fetch trade details
    const tradeResult = await getTradeJournalEntryAction(id);
    if (!tradeResult.success || !tradeResult.data) {
        notFound();
    }

    // Fetch rules
    const rulesResult = await getRulesAction();
    const rules: Rule[] =
        rulesResult.success && rulesResult.data ? rulesResult.data : [];

    const trade = tradeResult.data;

    // Prepare default values for the form
    const defaultValues = {
        id: trade.id,
        date: trade.date,
        market: trade.market,
        symbol: trade.symbol,
        setup: trade.setup || "",
        direction: trade.direction,
        entryPrice: trade.entryPrice,
        exitPrice: trade.exitPrice || 0,
        stopLoss: trade.stopLoss || 0,
        takeProfit: trade.takeProfit || 0,
        positionSize: trade.positionSize,
        fees: trade.fees || 0,
        duration: trade.duration || "",
        psychology: trade.psychology || "",
        notes: trade.notes || "",
        lessonsLearned: trade.lessonsLearned || "",
        rating: trade.rating || 3,
        ruleIds: trade.rules.map((rule) => rule.id),
    };

    return (
        <div className="w-full max-w-4xl mx-auto py-8 px-4">
            <div className="flex flex-col gap-8">
                <div>
                    <Link
                        href={`/journal/${id}`}
                        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2"
                    >
                        <ArrowLeft className="mr-1 h-4 w-4" />
                        Back to Trade
                    </Link>
                    <h1 className="text-2xl font-bold tracking-tight">
                        Edit Trade
                    </h1>
                    <p className="text-muted-foreground">
                        Update the details of your trade
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Trade Details</CardTitle>
                        <CardDescription>
                            Edit the details of your {trade.symbol} trade
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <TradeJournalForm
                            rules={rules}
                            defaultValues={defaultValues}
                            isEditing={true}
                            tradeId={id}
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
