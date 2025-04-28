import Link from "next/link";
import { getAllDailyJournalsAction } from "../actions";
import { ArrowLeft } from "lucide-react";
import { DailyJournalList } from "../components/daily-journal-list";
import type { DailyJournalWithTrades } from "@/lib/types";

export default async function AllJournalEntriesPage() {
    const journalsResult = await getAllDailyJournalsAction();

    // Ensure we have proper typing and default to empty array if data is undefined
    const journals: DailyJournalWithTrades[] =
        journalsResult.success && journalsResult.data
            ? journalsResult.data
            : [];

    return (
        <div className="w-full max-w-4xl mx-auto py-8 px-4">
            <div className="flex flex-col gap-8">
                <div>
                    <Link
                        href="/daily-journal"
                        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2"
                    >
                        <ArrowLeft className="mr-1 h-4 w-4" />
                        Back to Journal
                    </Link>
                    <h1 className="text-2xl font-bold tracking-tight">
                        All Journal Entries
                    </h1>
                    <p className="text-muted-foreground">
                        View your complete journal history
                    </p>
                </div>

                {journals.length === 0 ? (
                    <div className="text-center p-8 border rounded-lg border-border">
                        <p className="text-muted-foreground">
                            No journal entries yet.
                        </p>
                    </div>
                ) : (
                    <DailyJournalList journals={journals} />
                )}
            </div>
        </div>
    );
}
