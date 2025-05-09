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

        // Clear existing history events and versions (optional - comment out if you want to keep existing data)
        await prisma.ruleHistoryEvent.deleteMany({});
        await prisma.ruleVersion.deleteMany({});
        console.log("Cleared existing history events and versions");

        // For each rule, create a series of history events over the past 30 days
        for (const rule of rules) {
            console.log(`Generating history for rule: ${rule.name}`);

            // Create date for rule creation (between 15-30 days ago)
            const creationDaysAgo = Math.floor(Math.random() * 15) + 15;
            const creationDate = subDays(new Date(), creationDaysAgo);

            // Create the initial version (version 1)
            const initialVersion = await prisma.ruleVersion.create({
                data: {
                    ruleId: rule.id,
                    versionNumber: 1,
                    name: rule.name,
                    description: rule.description,
                    category: rule.category,
                    isActive: false, // Initial version is inactive
                    createdAt: creationDate,
                },
            });

            // Create the initial "created" event
            await prisma.ruleHistoryEvent.create({
                data: {
                    ruleId: rule.id,
                    ruleName: rule.name,
                    eventType: "created",
                    timestamp: creationDate,
                    details: {
                        initialValues: {
                            name: rule.name,
                            category: rule.category,
                            isActive: false,
                        },
                        versionNumber: 1,
                    },
                },
            });

            let currentVersionNumber = 1;
            let isCurrentlyActive = false;
            let lastEventDate = creationDate;
            let currentName = rule.name;
            let currentCategory = rule.category;
            let currentDescription = rule.description;

            // Generate a series of events (updates, activations, deactivations)
            const totalEvents = Math.floor(Math.random() * 8) + 3; // 3-10 events

            for (let i = 0; i < totalEvents; i++) {
                // Calculate a random date after the last event but before now
                const daysAfterLastEvent =
                    Math.floor(
                        Math.random() *
                            (differenceInDays(new Date(), lastEventDate) - 1)
                    ) + 1;

                if (daysAfterLastEvent <= 0) continue;

                const eventDate = addDays(lastEventDate, daysAfterLastEvent);
                lastEventDate = eventDate;

                // Decide what type of event to create
                const eventType =
                    Math.random() < 0.6
                        ? "updated"
                        : isCurrentlyActive
                        ? "deactivated"
                        : "activated";

                if (eventType === "updated") {
                    // Create an update event with random changes
                    const nameChanged = Math.random() > 0.7;
                    const categoryChanged = Math.random() > 0.7;
                    const descriptionChanged = Math.random() > 0.5;
                    const isActiveChanged = Math.random() > 0.8;

                    // Only proceed if at least one field changed
                    if (
                        !(
                            nameChanged ||
                            categoryChanged ||
                            descriptionChanged ||
                            isActiveChanged
                        )
                    ) {
                        continue;
                    }

                    // Store previous values
                    const previousName = currentName;
                    const previousCategory = currentCategory;
                    const previousDescription = currentDescription;
                    const previousIsActive = isCurrentlyActive;

                    // Generate new values
                    if (nameChanged) {
                        currentName = `${rule.name} v${
                            currentVersionNumber + 1
                        }`;
                    }

                    if (categoryChanged) {
                        const categories = [
                            "Entry",
                            "Exit",
                            "Risk Management",
                            "Psychology",
                            "Setup",
                            "Analysis",
                        ];
                        currentCategory =
                            categories[
                                Math.floor(Math.random() * categories.length)
                            ];
                    }

                    if (descriptionChanged) {
                        // Modify the description to simulate changes
                        // This assumes description is a JSON object with a specific structure
                        try {
                            let descObj =
                                typeof currentDescription === "string"
                                    ? JSON.parse(currentDescription)
                                    : currentDescription;

                            // If it's an empty description, create a basic structure
                            if (
                                !descObj.content ||
                                !Array.isArray(descObj.content) ||
                                descObj.content.length === 0
                            ) {
                                descObj = {
                                    type: "doc",
                                    content: [
                                        {
                                            type: "paragraph",
                                            content: [
                                                {
                                                    type: "text",
                                                    text: "Initial description",
                                                },
                                            ],
                                        },
                                    ],
                                };
                            }

                            // Add a new paragraph or modify existing content
                            if (
                                Math.random() > 0.5 &&
                                descObj.content.length > 0
                            ) {
                                // Modify existing content
                                const paragraphIndex = Math.floor(
                                    Math.random() * descObj.content.length
                                );
                                if (descObj.content[paragraphIndex].content) {
                                    descObj.content[
                                        paragraphIndex
                                    ].content.push({
                                        type: "text",
                                        text: ` Updated in version ${
                                            currentVersionNumber + 1
                                        }`,
                                    });
                                }
                            } else {
                                // Add new paragraph
                                descObj.content.push({
                                    type: "paragraph",
                                    content: [
                                        {
                                            type: "text",
                                            text: `New paragraph added in version ${
                                                currentVersionNumber + 1
                                            }`,
                                        },
                                    ],
                                });
                            }

                            currentDescription = descObj;
                        } catch (e) {
                            console.log(
                                "Error modifying description, using default:",
                                e
                            );
                            currentDescription = {
                                type: "doc",
                                content: [
                                    {
                                        type: "paragraph",
                                        content: [
                                            {
                                                type: "text",
                                                text: `Updated description for version ${
                                                    currentVersionNumber + 1
                                                }`,
                                            },
                                        ],
                                    },
                                ],
                            };
                        }
                    }

                    if (isActiveChanged) {
                        isCurrentlyActive = !isCurrentlyActive;
                    }

                    // Create a new version
                    currentVersionNumber++;
                    await prisma.ruleVersion.create({
                        data: {
                            ruleId: rule.id,
                            versionNumber: currentVersionNumber,
                            name: currentName,
                            description: currentDescription,
                            category: currentCategory,
                            isActive: isCurrentlyActive,
                            createdAt: eventDate,
                        },
                    });

                    // Create the update event with detailed changes
                    await prisma.ruleHistoryEvent.create({
                        data: {
                            ruleId: rule.id,
                            ruleName: currentName,
                            eventType: "updated",
                            timestamp: eventDate,
                            details: {
                                name: nameChanged
                                    ? {
                                          changed: true,
                                          from: previousName,
                                          to: currentName,
                                      }
                                    : undefined,
                                category: categoryChanged
                                    ? {
                                          changed: true,
                                          from: previousCategory,
                                          to: currentCategory,
                                      }
                                    : undefined,
                                description: descriptionChanged
                                    ? {
                                          changed: true,
                                          fromSummary:
                                              getDescriptionSummary(
                                                  previousDescription
                                              ),
                                          toSummary:
                                              getDescriptionSummary(
                                                  currentDescription
                                              ),
                                      }
                                    : undefined,
                                isActive: isActiveChanged
                                    ? {
                                          changed: true,
                                          from: previousIsActive,
                                          to: isCurrentlyActive,
                                      }
                                    : undefined,
                                versionInfo: {
                                    previousVersion: currentVersionNumber - 1,
                                    newVersion: currentVersionNumber,
                                },
                            },
                        },
                    });
                } else {
                    // Create an activation/deactivation event
                    isCurrentlyActive = !isCurrentlyActive;

                    // Create a new version for the activation/deactivation
                    currentVersionNumber++;
                    await prisma.ruleVersion.create({
                        data: {
                            ruleId: rule.id,
                            versionNumber: currentVersionNumber,
                            name: currentName,
                            description: currentDescription,
                            category: currentCategory,
                            isActive: isCurrentlyActive,
                            createdAt: eventDate,
                        },
                    });

                    // Create the activation/deactivation event
                    await prisma.ruleHistoryEvent.create({
                        data: {
                            ruleId: rule.id,
                            ruleName: currentName,
                            eventType: isCurrentlyActive
                                ? "activated"
                                : "deactivated",
                            timestamp: eventDate,
                            details: {
                                from: !isCurrentlyActive,
                                to: isCurrentlyActive,
                                versionNumber: currentVersionNumber,
                            },
                        },
                    });
                }
            }

            // Make sure the final state matches the current state in the database
            if (
                rule.isActive !== isCurrentlyActive ||
                rule.name !== currentName ||
                rule.category !== currentCategory ||
                JSON.stringify(rule.description) !==
                    JSON.stringify(currentDescription)
            ) {
                // Update the rule to match the final state
                await prisma.rule.update({
                    where: { id: rule.id },
                    data: {
                        isActive: isCurrentlyActive,
                        name: currentName,
                        category: currentCategory,
                        description: currentDescription,
                    },
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

// Helper function to get a summary of the description content
function getDescriptionSummary(description: any) {
    try {
        if (!description) return "Empty";

        // If it's a string, try to parse it
        const content =
            typeof description === "string"
                ? JSON.parse(description)
                : description;

        // Count the number of blocks
        const blockCount = content.content?.length || 0;

        // Get the first few characters of text if available
        let textPreview = "";
        if (content.content && content.content.length > 0) {
            // Try to extract text from the first paragraph
            const firstBlock = content.content[0];
            if (firstBlock.content) {
                const textItems = firstBlock.content
                    .filter((item: any) => item.type === "text")
                    .map((item: any) => item.text);
                textPreview = textItems.join(" ").substring(0, 50);
                if (textItems.join(" ").length > 50) textPreview += "...";
            }
        }

        return {
            blockCount,
            textPreview,
        };
    } catch (e) {
        return "Invalid format";
    }
}

// Run the seeding function
seedRuleHistory()
    .then(() => console.log("Done!"))
    .catch((e) => console.error(e));
