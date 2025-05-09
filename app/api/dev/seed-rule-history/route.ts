import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { addDays, subDays } from "date-fns";

// Only allow this in development
const isDevelopment = process.env.NODE_ENV === "development";

// Sample description content for seeding
const sampleDescriptions = [
    {
        type: "doc",
        content: [
            {
                type: "paragraph",
                content: [
                    {
                        type: "text",
                        text: "Enter the market only when price breaks out of a key level.",
                    },
                ],
            },
        ],
    },
    {
        type: "doc",
        content: [
            {
                type: "paragraph",
                content: [
                    {
                        type: "text",
                        text: "Wait for confirmation before entering a trade.",
                    },
                ],
            },
            {
                type: "paragraph",
                content: [
                    {
                        type: "text",
                        text: "Look for at least two confirming signals.",
                    },
                ],
            },
        ],
    },
    {
        type: "doc",
        content: [
            {
                type: "heading",
                props: { level: 2 },
                content: [{ type: "text", text: "Risk Management Rule" }],
            },
            {
                type: "paragraph",
                content: [
                    {
                        type: "text",
                        text: "Never risk more than 2% of your account on a single trade.",
                    },
                ],
            },
        ],
    },
    {
        type: "doc",
        content: [
            {
                type: "paragraph",
                content: [
                    {
                        type: "text",
                        text: "Always use a stop loss to protect your capital.",
                    },
                ],
            },
            {
                type: "bulletList",
                content: [
                    {
                        type: "listItem",
                        content: [
                            {
                                type: "paragraph",
                                content: [
                                    {
                                        type: "text",
                                        text: "Place stop loss at logical level",
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        type: "listItem",
                        content: [
                            {
                                type: "paragraph",
                                content: [
                                    {
                                        type: "text",
                                        text: "Never move stop loss to increase risk",
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        type: "doc",
        content: [
            {
                type: "paragraph",
                content: [
                    {
                        type: "text",
                        text: "Only trade during your designated trading hours.",
                    },
                ],
            },
            {
                type: "paragraph",
                content: [
                    {
                        type: "text",
                        text: "Avoid trading during major news events.",
                    },
                ],
            },
            {
                type: "paragraph",
                content: [
                    {
                        type: "text",
                        text: "Take breaks between trading sessions.",
                    },
                ],
            },
        ],
    },
];

// Enhanced descriptions with more content
const enhancedDescriptions = [
    {
        type: "doc",
        content: [
            {
                type: "heading",
                props: { level: 1 },
                content: [{ type: "text", text: "Market Entry Rule" }],
            },
            {
                type: "paragraph",
                content: [
                    {
                        type: "text",
                        text: "Enter the market only when price breaks out of a key level with increased volume.",
                    },
                ],
            },
            {
                type: "paragraph",
                content: [
                    {
                        type: "text",
                        text: "Wait for candle close above/below the level for confirmation.",
                    },
                ],
            },
            {
                type: "bulletList",
                content: [
                    {
                        type: "listItem",
                        content: [
                            {
                                type: "paragraph",
                                content: [
                                    {
                                        type: "text",
                                        text: "Look for volume increase of at least 50% above average",
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        type: "listItem",
                        content: [
                            {
                                type: "paragraph",
                                content: [
                                    {
                                        type: "text",
                                        text: "Ensure the breakout candle has a strong close",
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        type: "doc",
        content: [
            {
                type: "heading",
                props: { level: 1 },
                content: [{ type: "text", text: "Risk Management Strategy" }],
            },
            {
                type: "paragraph",
                content: [
                    {
                        type: "text",
                        text: "Never risk more than 1% of your account on a single trade.",
                    },
                ],
            },
            {
                type: "paragraph",
                content: [
                    {
                        type: "text",
                        text: "Calculate position size based on stop loss placement.",
                    },
                ],
            },
            {
                type: "bulletList",
                content: [
                    {
                        type: "listItem",
                        content: [
                            {
                                type: "paragraph",
                                content: [
                                    {
                                        type: "text",
                                        text: "Use the formula: Position Size = Risk Amount / Stop Loss Distance",
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        type: "listItem",
                        content: [
                            {
                                type: "paragraph",
                                content: [
                                    {
                                        type: "text",
                                        text: "Always round down to be conservative",
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
            {
                type: "paragraph",
                content: [
                    {
                        type: "text",
                        text: "Adjust risk percentage down during drawdown periods.",
                    },
                ],
            },
        ],
    },
    {
        type: "doc",
        content: [
            {
                type: "heading",
                props: { level: 1 },
                content: [
                    { type: "text", text: "Trading Psychology Guidelines" },
                ],
            },
            {
                type: "paragraph",
                content: [
                    {
                        type: "text",
                        text: "Take a break after three consecutive losing trades.",
                    },
                ],
            },
            {
                type: "paragraph",
                content: [
                    {
                        type: "text",
                        text: "Journal your emotional state before and after each trade.",
                    },
                ],
            },
            {
                type: "bulletList",
                content: [
                    {
                        type: "listItem",
                        content: [
                            {
                                type: "paragraph",
                                content: [
                                    {
                                        type: "text",
                                        text: "Rate your emotional state on a scale of 1-10",
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        type: "listItem",
                        content: [
                            {
                                type: "paragraph",
                                content: [
                                    {
                                        type: "text",
                                        text: "Note any external factors affecting your mindset",
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
            {
                type: "paragraph",
                content: [
                    {
                        type: "text",
                        text: "Review your emotional journal weekly to identify patterns.",
                    },
                ],
            },
        ],
    },
];

// Helper function to get description summary
function getDescriptionSummary(description: any) {
    try {
        // If it's a string, parse it
        const content =
            typeof description === "string"
                ? JSON.parse(description)
                : description;

        // Count blocks
        const blockCount = content.content?.length || 0;

        // Get text preview from first paragraph or heading
        let textPreview = "";
        if (content.content && content.content.length > 0) {
            // Find first block with text
            for (const block of content.content) {
                if (block.content) {
                    for (const item of block.content) {
                        if (item.text) {
                            textPreview = item.text;
                            break;
                        }
                    }
                }
                if (textPreview) break;
            }
        }

        // Limit preview length
        if (textPreview.length > 50) {
            textPreview = textPreview.substring(0, 50) + "...";
        }

        return {
            blockCount,
            textPreview,
        };
    } catch (e) {
        return {
            blockCount: 0,
            textPreview: "Unable to parse description",
        };
    }
}

// Helper function to create rule versions with distinct content
async function createRuleVersions() {
    console.log("Creating rule versions...");

    // Get all rules
    const rules = await prisma.rule.findMany();

    if (rules.length === 0) {
        console.log("No rules found. Please create some rules first.");
        return { success: false, message: "No rules found" };
    }

    console.log(`Found ${rules.length} rules. Creating versions...`);

    // Clear existing versions
    await prisma.ruleVersion.deleteMany({});
    console.log("Cleared existing rule versions");

    let createdVersions = 0;
    const versionsCreated = [];

    // For each rule, create multiple versions with DISTINCT content
    for (const rule of rules) {
        console.log(`Creating versions for rule: ${rule.name} (${rule.id})`);

        // Create version 1 (initial version - simplified)
        const version1Description = {
            type: "doc",
            content: [
                {
                    type: "paragraph",
                    content: [
                        {
                            type: "text",
                            text: `Initial version of ${rule.name}: Basic rule definition.`,
                        },
                    ],
                },
            ],
        };

        const version1 = await prisma.ruleVersion.create({
            data: {
                ruleId: rule.id,
                versionNumber: 1,
                name: `${rule.name} - Initial`,
                description: version1Description,
                category: rule.category,
                isActive: false, // Start inactive
                createdAt: subDays(new Date(), 30), // 30 days ago
            },
        });
        createdVersions++;
        versionsCreated.push({
            ruleId: rule.id,
            versionNumber: 1,
            name: version1.name,
            descriptionPreview:
                getDescriptionSummary(version1Description).textPreview,
        });

        // Create version 2 (with some changes)
        // Use a specific sample description based on rule index to ensure it's different
        const sampleIndex = rules.indexOf(rule) % sampleDescriptions.length;
        const version2Description = {
            ...sampleDescriptions[sampleIndex],
            content: [
                ...(sampleDescriptions[sampleIndex].content || []),
                {
                    type: "paragraph",
                    content: [
                        {
                            type: "text",
                            text: `Version 2 addition to ${rule.name}.`,
                        },
                    ],
                },
            ],
        };

        const version2 = await prisma.ruleVersion.create({
            data: {
                ruleId: rule.id,
                versionNumber: 2,
                name: `${rule.name} - Updated`,
                description: version2Description,
                category: rule.category,
                isActive: true, // Activated
                createdAt: subDays(new Date(), 20), // 20 days ago
            },
        });
        createdVersions++;
        versionsCreated.push({
            ruleId: rule.id,
            versionNumber: 2,
            name: version2.name,
            descriptionPreview:
                getDescriptionSummary(version2Description).textPreview,
        });

        // Create version 3 (with more changes)
        // Use a specific enhanced description based on rule index to ensure it's different
        const enhancedIndex = rules.indexOf(rule) % enhancedDescriptions.length;
        const version3Description = {
            ...enhancedDescriptions[enhancedIndex],
            content: [
                ...(enhancedDescriptions[enhancedIndex].content || []),
                {
                    type: "paragraph",
                    content: [
                        {
                            type: "text",
                            text: `Version 3 enhancement to ${rule.name}.`,
                        },
                    ],
                },
            ],
        };

        const version3 = await prisma.ruleVersion.create({
            data: {
                ruleId: rule.id,
                versionNumber: 3,
                name: `${rule.name} - Enhanced`,
                description: version3Description,
                category: rule.category,
                isActive: true,
                createdAt: subDays(new Date(), 10), // 10 days ago
            },
        });
        createdVersions++;
        versionsCreated.push({
            ruleId: rule.id,
            versionNumber: 3,
            name: version3.name,
            descriptionPreview:
                getDescriptionSummary(version3Description).textPreview,
        });

        // Create version 4 (current version - with completely new content)
        const version4Description = {
            type: "doc",
            content: [
                {
                    type: "heading",
                    props: { level: 1 },
                    content: [{ type: "text", text: rule.name }],
                },
                {
                    type: "paragraph",
                    content: [
                        {
                            type: "text",
                            text: `Current version of ${rule.name} with latest updates.`,
                        },
                    ],
                },
                {
                    type: "paragraph",
                    content: [
                        {
                            type: "text",
                            text: "This is the latest version with all current information.",
                        },
                    ],
                },
                {
                    type: "bulletList",
                    content: [
                        {
                            type: "listItem",
                            content: [
                                {
                                    type: "paragraph",
                                    content: [
                                        {
                                            type: "text",
                                            text: "Final version point 1",
                                        },
                                    ],
                                },
                            ],
                        },
                        {
                            type: "listItem",
                            content: [
                                {
                                    type: "paragraph",
                                    content: [
                                        {
                                            type: "text",
                                            text: "Final version point 2",
                                        },
                                    ],
                                },
                            ],
                        },
                        {
                            type: "listItem",
                            content: [
                                {
                                    type: "paragraph",
                                    content: [
                                        {
                                            type: "text",
                                            text: `Specific to ${rule.name}`,
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                },
            ],
        };

        const version4 = await prisma.ruleVersion.create({
            data: {
                ruleId: rule.id,
                versionNumber: 4,
                name: rule.name,
                description: version4Description,
                category: rule.category,
                isActive: rule.isActive,
                createdAt: new Date(), // Now
            },
        });
        createdVersions++;
        versionsCreated.push({
            ruleId: rule.id,
            versionNumber: 4,
            name: version4.name,
            descriptionPreview:
                getDescriptionSummary(version4Description).textPreview,
        });

        console.log(`Created 4 versions for rule: ${rule.name}`);
    }

    console.log(`Created ${createdVersions} rule versions`);
    return {
        success: true,
        message: `Created ${createdVersions} rule versions`,
        details: versionsCreated,
    };
}

// Main seeding function
async function seedRuleHistory() {
    try {
        // Get all rules
        const rules = await prisma.rule.findMany();

        if (rules.length === 0) {
            return {
                success: false,
                error: "No rules found. Please create some rules first.",
            };
        }

        // Clear existing history events
        await prisma.ruleHistoryEvent.deleteMany({});
        console.log("Cleared existing history events");

        // Create rule versions first
        const versionResult = await createRuleVersions();
        if (!versionResult.success) {
            return { success: false, error: versionResult.message };
        }

        // For each rule, create a series of history events over the past 30 days
        for (const rule of rules) {
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
                    details: {
                        initialValues: {
                            name: rule.name,
                            category: rule.category,
                            isActive: false,
                            description: getDescriptionSummary(
                                rule.description
                            ),
                        },
                        versionInfo: {
                            newVersion: 1,
                        },
                    },
                },
            });

            // Generate a series of update events (3-6 updates)
            const numUpdates = Math.floor(Math.random() * 4) + 3;
            let currentName = rule.name;
            let currentCategory = rule.category;
            let currentIsActive = false;
            let currentDescription = rule.description;
            let lastEventDate = creationDate;
            let currentVersion = 1;

            for (let i = 0; i < numUpdates; i++) {
                // Calculate a random date after the last event but before now
                const daysAfterLastEvent =
                    Math.floor(
                        Math.random() *
                            (differenceInDays(new Date(), lastEventDate) - 1)
                    ) + 1;
                if (daysAfterLastEvent <= 0) continue;

                const eventDate = addDays(lastEventDate, daysAfterLastEvent);
                lastEventDate = eventDate;

                // Randomly decide which fields to update
                const updateName = Math.random() > 0.7;
                const updateCategory = Math.random() > 0.8;
                const updateIsActive = Math.random() > 0.6;
                const updateDescription = Math.random() > 0.4;

                // Skip if nothing to update
                if (
                    !updateName &&
                    !updateCategory &&
                    !updateIsActive &&
                    !updateDescription
                )
                    continue;

                // Prepare update details
                const details: any = {};
                let newName = currentName;
                let newCategory = currentCategory;
                let newIsActive = currentIsActive;
                let newDescription = currentDescription;

                // Increment version number
                const previousVersion = currentVersion;
                currentVersion++;

                // Add version info to details
                details.versionInfo = {
                    previousVersion,
                    newVersion: currentVersion,
                };

                // Update name
                if (updateName) {
                    newName = `${currentName} ${i + 1}`;
                    details.name = {
                        changed: true,
                        from: currentName,
                        to: newName,
                    };
                    currentName = newName;
                }

                // Update category
                if (updateCategory) {
                    const categories = [
                        "Entry",
                        "Exit",
                        "Risk Management",
                        "Psychology",
                        "Other",
                    ];
                    const newCategoryIndex =
                        (categories.indexOf(currentCategory) + 1) %
                        categories.length;
                    newCategory = categories[newCategoryIndex];
                    details.category = {
                        changed: true,
                        from: currentCategory,
                        to: newCategory,
                    };
                    currentCategory = newCategory;
                }

                // Update isActive
                if (updateIsActive) {
                    newIsActive = !currentIsActive;
                    details.isActive = {
                        changed: true,
                        from: currentIsActive,
                        to: newIsActive,
                    };
                    currentIsActive = newIsActive;
                }

                // Update description - focus on this for more detailed changes
                if (updateDescription) {
                    // Choose a new description
                    const oldDescription = currentDescription;

                    // Alternate between simple and enhanced descriptions
                    if (i % 2 === 0) {
                        newDescription =
                            sampleDescriptions[
                                Math.floor(
                                    Math.random() * sampleDescriptions.length
                                )
                            ];
                    } else {
                        newDescription =
                            enhancedDescriptions[
                                Math.floor(
                                    Math.random() * enhancedDescriptions.length
                                )
                            ];
                    }

                    details.description = {
                        changed: true,
                        fromSummary: getDescriptionSummary(oldDescription),
                        toSummary: getDescriptionSummary(newDescription),
                    };
                    currentDescription = newDescription;
                }

                // Create the update event
                await prisma.ruleHistoryEvent.create({
                    data: {
                        ruleId: rule.id,
                        ruleName: currentName,
                        eventType: "updated",
                        timestamp: eventDate,
                        details,
                    },
                });

                // If isActive changed, also create a specific activation/deactivation event
                if (updateIsActive) {
                    await prisma.ruleHistoryEvent.create({
                        data: {
                            ruleId: rule.id,
                            ruleName: currentName,
                            eventType: newIsActive
                                ? "activated"
                                : "deactivated",
                            timestamp: addMinutes(eventDate, 1), // 1 minute after the update
                            details: {
                                from: !newIsActive,
                                to: newIsActive,
                                versionInfo: {
                                    version: currentVersion,
                                },
                            },
                        },
                    });
                }
            }

            // Make sure the final state matches the current state in the database
            if (
                currentName !== rule.name ||
                currentCategory !== rule.category ||
                currentIsActive !== rule.isActive
            ) {
                const finalUpdateDetails: any = {};

                // Increment version for final update
                const previousVersion = currentVersion;
                currentVersion++;

                // Add version info
                finalUpdateDetails.versionInfo = {
                    previousVersion,
                    newVersion: currentVersion,
                };

                if (currentName !== rule.name) {
                    finalUpdateDetails.name = {
                        changed: true,
                        from: currentName,
                        to: rule.name,
                    };
                }

                if (currentCategory !== rule.category) {
                    finalUpdateDetails.category = {
                        changed: true,
                        from: currentCategory,
                        to: rule.category,
                    };
                }

                if (currentIsActive !== rule.isActive) {
                    finalUpdateDetails.isActive = {
                        changed: true,
                        from: currentIsActive,
                        to: rule.isActive,
                    };
                }

                // Only create the event if there are changes
                if (Object.keys(finalUpdateDetails).length > 1) {
                    // > 1 because versionInfo is always there
                    await prisma.ruleHistoryEvent.create({
                        data: {
                            ruleId: rule.id,
                            ruleName: rule.name,
                            eventType: "updated",
                            timestamp: new Date(),
                            details: finalUpdateDetails,
                        },
                    });

                    // If isActive changed, also create a specific activation/deactivation event
                    if (currentIsActive !== rule.isActive) {
                        await prisma.ruleHistoryEvent.create({
                            data: {
                                ruleId: rule.id,
                                ruleName: rule.name,
                                eventType: rule.isActive
                                    ? "activated"
                                    : "deactivated",
                                timestamp: addMinutes(new Date(), 1), // 1 minute after the update
                                details: {
                                    from: currentIsActive,
                                    to: rule.isActive,
                                    versionInfo: {
                                        version: currentVersion,
                                    },
                                },
                            },
                        });
                    }
                }
            }

            // Randomly decide if this rule has been deleted and restored
            if (Math.random() > 0.7) {
                // Calculate a random date for deletion
                const deletionDaysAgo = Math.floor(Math.random() * 10) + 1;
                const deletionDate = subDays(new Date(), deletionDaysAgo);

                // Create deletion event
                await prisma.ruleHistoryEvent.create({
                    data: {
                        ruleId: rule.id,
                        ruleName: rule.name,
                        eventType: "deleted",
                        timestamp: deletionDate,
                        details: {
                            finalState: {
                                name: rule.name,
                                category: rule.category,
                                isActive: rule.isActive,
                                description: getDescriptionSummary(
                                    rule.description
                                ),
                            },
                            versionInfo: {
                                version: currentVersion,
                            },
                        },
                    },
                });

                // Increment version for restoration
                currentVersion++;

                // Create restoration event (recreated)
                await prisma.ruleHistoryEvent.create({
                    data: {
                        ruleId: rule.id,
                        ruleName: rule.name,
                        eventType: "created",
                        timestamp: addDays(deletionDate, 1), // 1 day after deletion
                        details: {
                            initialValues: {
                                name: rule.name,
                                category: rule.category,
                                isActive: rule.isActive,
                                description: getDescriptionSummary(
                                    rule.description
                                ),
                            },
                            restored: true,
                            versionInfo: {
                                newVersion: currentVersion,
                            },
                        },
                    },
                });
            }
        }

        return {
            success: true,
            message: "Rule history and versions seeded successfully",
            versions: versionResult,
        };
    } catch (error) {
        console.error("Error seeding rule history:", error);
        return { success: false, error: "Failed to seed rule history" };
    }
}

// Support both GET and POST methods
export async function GET(request: Request) {
    if (!isDevelopment) {
        return NextResponse.json(
            { error: "This endpoint is only available in development mode" },
            { status: 403 }
        );
    }

    const result = await seedRuleHistory();

    if (result.success) {
        return NextResponse.json(result);
    } else {
        return NextResponse.json({ error: result.error }, { status: 400 });
    }
}

export async function POST(request: Request) {
    if (!isDevelopment) {
        return NextResponse.json(
            { error: "This endpoint is only available in development mode" },
            { status: 403 }
        );
    }

    const result = await seedRuleHistory();

    if (result.success) {
        return NextResponse.json(result);
    } else {
        return NextResponse.json({ error: result.error }, { status: 400 });
    }
}

// Helper function to calculate days between dates
function differenceInDays(dateA: Date, dateB: Date): number {
    return Math.floor(
        (dateA.getTime() - dateB.getTime()) / (1000 * 60 * 60 * 24)
    );
}

// Helper function to add minutes to a date
function addMinutes(date: Date, minutes: number): Date {
    return new Date(date.getTime() + minutes * 60000);
}
