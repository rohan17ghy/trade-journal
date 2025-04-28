import Link from "next/link";
import { getAllJournalDatesAction, getAllTradeDatesAction } from "../actions";
import { ArrowLeft } from "lucide-react";
import { JournalCalendar } from "../components/journal-calendar";

export default async function JournalCalendarPage() {
    const journalDatesResult = await getAllJournalDatesAction();
    const tradeDatesResult = await getAllTradeDatesAction();

    const journalDates: string[] =
        journalDatesResult.success && journalDatesResult.data
            ? journalDatesResult.data
            : [];
    const tradeDates: string[] =
        tradeDatesResult.success && tradeDatesResult.data
            ? tradeDatesResult.data
            : [];

    return (
        <div className="w-full max-w-5xl mx-auto py-8 px-4">
            <div className="flex flex-col gap-8">
                <div>
                    <Link
                        href="/daily-journal"
                        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2"
                    >
                        <ArrowLeft className="mr-1 h-4 w-4" />
                        Back to Journal List
                    </Link>
                    <h1 className="text-2xl font-bold tracking-tight">
                        Journal Calendar
                    </h1>
                    <p className="text-muted-foreground">
                        View and navigate your journal entries by date
                    </p>
                </div>

                <div className="grid gap-8 md:grid-cols-2">
                    <JournalCalendar
                        journalDates={journalDates}
                        tradeDates={tradeDates}
                    />

                    <div className="space-y-6">
                        <div className="bg-muted p-6 rounded-lg">
                            <h2 className="text-lg font-medium mb-4">
                                Calendar Guide
                            </h2>
                            <ul className="space-y-2 text-sm">
                                <li className="flex items-center">
                                    <div className="h-3 w-3 rounded-full bg-primary mr-2"></div>
                                    <span>Days with journal entries</span>
                                </li>
                                <li className="flex items-center">
                                    <div className="h-3 w-3 rounded-full bg-blue-500 mr-2"></div>
                                    <span>Days with trades but no journal</span>
                                </li>
                                <li className="flex items-center">
                                    <div className="h-3 w-3 rounded-full bg-accent mr-2"></div>
                                    <span>Today</span>
                                </li>
                            </ul>
                            <div className="mt-6">
                                <p className="text-muted-foreground">
                                    Click on any date to view or create a
                                    journal entry for that day.
                                </p>
                            </div>
                        </div>

                        <div className="bg-muted p-6 rounded-lg">
                            <h2 className="text-lg font-medium mb-4">
                                Journal Stats
                            </h2>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Total Journal Entries
                                    </p>
                                    <p className="text-2xl font-bold">
                                        {journalDates.length}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Trades without Journal
                                    </p>
                                    <p className="text-2xl font-bold">
                                        {tradeDates.length}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
