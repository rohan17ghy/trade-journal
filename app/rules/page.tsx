import { getRulesAction } from "./actions";
import { RuleForm } from "./rule-form";
import { RulesList } from "./rules-list";
import type { Rule } from "@/lib/types";

export default async function RulesPage() {
    const { success, data = [], error } = await getRulesAction();

    // Type assertion to ensure data is treated as Rule[]
    const rules = (data || []) as Rule[];

    return (
        <div className="w-full max-w-4xl mx-auto py-8 px-4">
            <div className="flex flex-col gap-8">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        Trading Rules
                    </h1>
                    <p className="text-muted-foreground">
                        Manage your trading rules and strategies
                    </p>
                </div>

                <RuleForm />

                {!success && (
                    <div className="text-red-500">
                        {error || "Failed to load rules"}
                    </div>
                )}

                <RulesList initialRules={rules} />
            </div>
        </div>
    );
}
