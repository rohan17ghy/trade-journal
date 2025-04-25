import { getRules } from "@/lib/data";
import { AddRuleForm } from "./add-rule-form";
import { RulesList } from "./rules-list";

export default function RulesPage() {
    const rules = getRules();

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

                <AddRuleForm />

                <RulesList initialRules={rules} />
            </div>
        </div>
    );
}
