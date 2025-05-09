"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Beaker } from "lucide-react";
import { toast } from "sonner";

export function DevSeedButton() {
    const [isSeeding, setIsSeeding] = useState(false);

    // Only show in development
    if (process.env.NODE_ENV !== "development") {
        return null;
    }

    const handleSeed = async () => {
        if (isSeeding) return;

        if (
            !confirm(
                "This will clear existing rule history and generate new test data. Continue?"
            )
        ) {
            return;
        }

        setIsSeeding(true);

        try {
            const response = await fetch("/api/dev/seed-rule-history", {
                method: "POST",
            });

            const data = await response.json();

            if (response.ok) {
                toast.success("Rule history seeded successfully");
            } else {
                toast.error(`Failed to seed rule history: ${data.error}`);
            }
        } catch (error) {
            toast.error("An error occurred while seeding rule history");
            console.error(error);
        } finally {
            setIsSeeding(false);
        }
    };

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={handleSeed}
            disabled={isSeeding}
            className="gap-1 bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
        >
            <Beaker className="h-4 w-4" />
            {isSeeding ? "Seeding..." : "Seed Test Data"}
        </Button>
    );
}
