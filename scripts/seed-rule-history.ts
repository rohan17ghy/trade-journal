// This script is for development/testing only
// It generates backdated rule history events to simulate activity over time

import { PrismaClient } from "@prisma/client";
import { addDays, subDays } from "date-fns";

const prisma = new PrismaClient();

async function seedRuleHistory() {
    try {
        console.log("🌱 Seeding rule history data...");

        // Get all rules
        const rules = await prisma.rule.findMany();

        if (rules.length === 0) {
            console.log("No rules found. Please create some rules first.");
            return;
        }

        console.log(`Found ${rules.length} rules. Generating history...`);

        // Clear existing history events (optional - comment out if you want to keep existing events)
        await prisma.ruleHistoryEvent.deleteMany({});
        console.log("Cleared existing history events");

        // For each rule, create a series of history events over the past 30 days
        for (const rule of rules) {
            console.log(`Generating history for rule: ${rule.name}`);

            // Create date for rule creation (between 15-30 days ago)
            const creationDaysAgo = Math.floor(Math.random() * 15) + 15;
            const creationDate = subDays(new Date(), creationDaysAgo);

            // Create the initial "created" event
            await prisma.ruleHistoryEvent.create({
                data: {
                    ruleId: rule.id,
                    ruleName: rule.name,
                    eventType: "created",
                    timestamp: creationDate,
                },
            });

            // Randomly decide if this rule has been updated
            if (Math.random() > 0.3) {
                const updateDaysAgo = Math.floor(
                    Math.random() * creationDaysAgo
                );
                const updateDate = subDays(new Date(), updateDaysAgo);

                await prisma.ruleHistoryEvent.create({
                    data: {
                        ruleId: rule.id,
                        ruleName: rule.name,
                        eventType: "updated",
                        timestamp: updateDate,
                        details: {
                            nameChanged: Math.random() > 0.5,
                            categoryChanged: Math.random() > 0.7,
                            descriptionChanged: Math.random() > 0.4,
                            isActiveChanged: Math.random() > 0.6,
                        },
                    },
                });
            }

            // Generate a series of activation/deactivation events
            let isCurrentlyActive = false;
            let lastEventDate = creationDate;

            // Generate between 2-8 activation/deactivation events
            const numEvents = Math.floor(Math.random() * 6) + 2;

            for (let i = 0; i < numEvents; i++) {
                // Toggle the active state
                isCurrentlyActive = !isCurrentlyActive;

                // Calculate a random date after the last event but before now
                const daysAfterLastEvent =
                    Math.floor(
                        Math.random() *
                            (differenceInDays(new Date(), lastEventDate) - 1)
                    ) + 1;

                if (daysAfterLastEvent <= 0) continue;

                const eventDate = addDays(lastEventDate, daysAfterLastEvent);
                lastEventDate = eventDate;

                await prisma.ruleHistoryEvent.create({
                    data: {
                        ruleId: rule.id,
                        ruleName: rule.name,
                        eventType: isCurrentlyActive
                            ? "activated"
                            : "deactivated",
                        timestamp: eventDate,
                    },
                });
            }

            // Make sure the final state matches the current state in the database
            const finalEvent = isCurrentlyActive ? "activated" : "deactivated";
            if (rule.isActive !== isCurrentlyActive) {
                await prisma.ruleHistoryEvent.create({
                    data: {
                        ruleId: rule.id,
                        ruleName: rule.name,
                        eventType: rule.isActive ? "activated" : "deactivated",
                        timestamp: new Date(),
                    },
                });

                // Update the rule to match
                await prisma.rule.update({
                    where: { id: rule.id },
                    data: { isActive: rule.isActive },
                });
            }
        }

        console.log("✅ Rule history seeding complete!");
    } catch (error) {
        console.error("Error seeding rule history:", error);
    } finally {
        await prisma.$disconnect();
    }
}

// Helper function to calculate days between dates
function differenceInDays(dateA: Date, dateB: Date): number {
    return Math.floor(
        (dateA.getTime() - dateB.getTime()) / (1000 * 60 * 60 * 24)
    );
}

// Run the seeding function
seedRuleHistory()
    .then(() => console.log("Done!"))
    .catch((e) => console.error(e));
