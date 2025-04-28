import { getRulesAction } from "@/app/rules/actions";
import { TradeJournalForm } from "../components/trade-journal-form";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import type { Rule } from "@/lib/types";

export default async function NewTradeJournalEntryPage() {
    const rulesResult = await getRulesAction();

    // Ensure we have proper typing and default to empty array if data is undefined
    const rules: Rule[] =
        rulesResult.success && rulesResult.data ? rulesResult.data : [];

    // Default values for a new trade entry with proper typing
    const defaultValues = {
        date: formatDate(new Date()),
        market: "Stocks" as const,
        direction: "Long" as const,
        entryPrice: 0,
        positionSize: 1,
    };

    return (
        <div className="w-full max-w-4xl mx-auto py-8 px-4">
            <div className="flex flex-col gap-8">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        New Trade Entry
                    </h1>
                    <p className="text-muted-foreground">
                        Record the details of your trade
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Trade Details</CardTitle>
                        <CardDescription>
                            Enter the details of your trade
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <TradeJournalForm
                            rules={rules}
                            defaultValues={defaultValues}
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
