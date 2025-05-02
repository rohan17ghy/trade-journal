import { getRulesAction } from "./actions";
import { RulesContainer } from "./rules-container";
import type { Rule } from "@/lib/types";

export default async function RulesPage() {
    const { success, data = [], error } = await getRulesAction();

    // Type assertion to ensure data is treated as Rule[]
    const rules = (data || []) as Rule[];

    return (
        <div className="w-full max-w-4xl mx-auto py-8 px-4">
            {!success && (
                <div className="text-red-500">
                    {error || "Failed to load rules"}
                </div>
            )}

            <RulesContainer initialRules={rules} />
        </div>
    );
}
