import { getRuleAction } from "../../actions";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { RuleForm } from "../../rule-form";

interface EditRulePageProps {
    params: {
        id: string;
    };
}

export default async function EditRulePage({ params }: EditRulePageProps) {
    const { id } = params;
    const { success, data: rule, error } = await getRuleAction(id);

    if (!success || !rule) {
        notFound();
    }

    return (
        <div className="w-full max-w-4xl mx-auto py-8 px-4">
            <div className="flex flex-col gap-8">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        Edit Trading Rule
                    </h1>
                    <p className="text-muted-foreground">
                        Update your trading rule details
                    </p>
                </div>

                <Suspense fallback={<Skeleton className="h-[400px]" />}>
                    <RuleForm rule={rule} />
                </Suspense>
            </div>
        </div>
    );
}
