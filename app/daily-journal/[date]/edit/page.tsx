import { notFound } from "next/navigation";
import Link from "next/link";
import { getDailyJournalAction } from "../../actions";
import { DailyJournalForm } from "../../components/daily-journal-form";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

export default async function EditDailyJournalPage({
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

    const journal = journalResult.data;

    return (
        <div className="w-full max-w-4xl mx-auto py-8 px-4">
            <div className="flex flex-col gap-8">
                <div>
                    <Link
                        href={`/daily-journal/${date}`}
                        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2"
                    >
                        <ArrowLeft className="mr-1 h-4 w-4" />
                        Back to Journal
                    </Link>
                    <h1 className="text-2xl font-bold tracking-tight">
                        Edit Journal Entry
                    </h1>
                    <p className="text-muted-foreground">
                        Update your journal entry for {date}
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Daily Journal</CardTitle>
                        <CardDescription>
                            Edit your trading journal entry
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <DailyJournalForm
                            defaultValues={{
                                id: journal.id,
                                date: journal.date,
                                marketOverview: journal.marketOverview || "",
                                mood: journal.mood || "",
                                physicalCondition:
                                    journal.physicalCondition || "",
                                goals: journal.goals || "",
                                achievements: journal.achievements || "",
                                challenges: journal.challenges || "",
                                insights: journal.insights || "",
                                improvementAreas:
                                    journal.improvementAreas || "",
                                planForTomorrow: journal.planForTomorrow || "",
                                gratitude: journal.gratitude || "",
                                ruleModification:
                                    journal.ruleModification || "",
                            }}
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
