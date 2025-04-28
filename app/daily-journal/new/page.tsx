"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { DailyJournalForm } from "../components/daily-journal-form";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

export default function NewDailyJournalPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const dateParam = searchParams.get("date");
    const defaultDate = dateParam || formatDate(new Date());

    // Default values for a new journal entry
    const defaultValues = {
        date: defaultDate,
    };

    return (
        <div className="w-full max-w-4xl mx-auto py-8 px-4">
            <div className="flex flex-col gap-8">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        New Journal Entry
                    </h1>
                    <p className="text-muted-foreground">
                        Record your daily trading journey
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Daily Journal</CardTitle>
                        <CardDescription>
                            Reflect on your trading day
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <DailyJournalForm defaultValues={defaultValues} />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
