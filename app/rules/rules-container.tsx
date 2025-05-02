"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { RuleForm } from "./rule-form";
import { RulesList } from "./rules-list";
import type { Rule } from "@/lib/types";

interface RulesContainerProps {
    initialRules: Rule[];
}

export function RulesContainer({ initialRules }: RulesContainerProps) {
    const [showForm, setShowForm] = useState(false);

    return (
        <div className="flex flex-col gap-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        Trading Rules
                    </h1>
                    <p className="text-muted-foreground">
                        Manage your trading rules and strategies
                    </p>
                </div>
                {!showForm && (
                    <Button onClick={() => setShowForm(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Rule
                    </Button>
                )}
            </div>

            {showForm && <RuleForm onCancel={() => setShowForm(false)} />}

            <RulesList initialRules={initialRules} />
        </div>
    );
}
