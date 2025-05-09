"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

export function DevSeedButton() {
    const [isLoading, setIsLoading] = useState(false);

    const handleSeed = async () => {
        if (isLoading) return;

        setIsLoading(true);
        try {
            // The issue is here - we're using GET instead of POST
            const response = await fetch("/api/dev/seed-rule-history", {
                method: "POST", // Changed from GET to POST
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const data = await response.json();

            if (response.ok) {
                toast({
                    title: "Success",
                    description:
                        "Rule history seeded successfully. Refresh the page to see the changes.",
                });
                console.log("Seed response:", data);
            } else {
                toast({
                    title: "Error",
                    description: data.error || "Failed to seed rule history",
                    variant: "destructive",
                });
                console.error("Seed error:", data);
            }
        } catch (error) {
            console.error("Seed exception:", error);
            toast({
                title: "Error",
                description: "An unexpected error occurred",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button
            onClick={handleSeed}
            disabled={isLoading}
            variant="outline"
            size="sm"
        >
            {isLoading ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Seeding...
                </>
            ) : (
                "Seed Rule History"
            )}
        </Button>
    );
}
