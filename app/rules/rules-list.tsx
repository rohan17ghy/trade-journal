"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2 } from "lucide-react";
import { deleteRuleAction } from "./actions";
import type { Rule } from "@/lib/types";

interface RulesListProps {
    initialRules: Rule[];
}

export function RulesList({ initialRules }: RulesListProps) {
    const [rules, setRules] = useState<Rule[]>(initialRules);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const router = useRouter();

    async function handleDelete(id: string) {
        if (confirm("Are you sure you want to delete this rule?")) {
            setIsDeleting(id);
            const result = await deleteRuleAction(id);

            if (result.success) {
                setRules(rules.filter((rule) => rule.id !== id));
            } else {
                alert("Failed to delete rule");
            }

            setIsDeleting(null);
            router.refresh();
        }
    }

    if (rules.length === 0) {
        return (
            <div className="text-center p-8 border rounded-lg border-border">
                <p className="text-muted-foreground">
                    No rules added yet. Add your first trading rule above.
                </p>
            </div>
        );
    }

    return (
        <div className="grid gap-4 md:grid-cols-2">
            {rules.map((rule) => (
                <Card key={rule.id}>
                    <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle>{rule.name}</CardTitle>
                                <CardDescription>
                                    <Badge variant="outline" className="mt-1">
                                        {rule.category}
                                    </Badge>
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            {rule.description || "No description provided"}
                        </p>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(rule.id)}
                            disabled={isDeleting === rule.id}
                        >
                            <Trash2 className="h-4 w-4 mr-1" />
                            {isDeleting === rule.id ? "Deleting..." : "Delete"}
                        </Button>
                    </CardFooter>
                </Card>
            ))}
        </div>
    );
}
