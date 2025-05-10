import { prisma } from "@/lib/db";
import type { RuleFormFields } from "@/app/zod/schema";
// Mock next/cache without Jest
import { createRequire } from "module";

// Sample rule data with Notion-like descriptions, including type field
const sampleRules: RuleFormFields[] = [
    {
        name: "Content Moderation Policy",
        category: "Entry",
        description: {
            type: "notion",
            content: [
                {
                    type: "heading",
                    attrs: { level: 1 },
                    content: [{ type: "text", text: "Content Moderation" }],
                },
                {
                    type: "paragraph",
                    content: [
                        {
                            type: "text",
                            text: "All user-generated content must comply with community guidelines.",
                        },
                    ],
                },
            ],
        },
        isActive: true,
    },
    {
        name: "Spam Detection Rule",
        category: "Exit",
        description: {
            type: "notion",
            content: [
                {
                    type: "heading",
                    attrs: { level: 2 },
                    content: [{ type: "text", text: "Spam Detection" }],
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
                                            text: "Block repetitive posts.",
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                },
            ],
        },
        isActive: false,
    },
    {
        name: "User Verification Policy",
        category: "Other",
        description: {
            type: "notion",
            content: [
                {
                    type: "heading",
                    attrs: { level: 1 },
                    content: [{ type: "text", text: "User Verification" }],
                },
                {
                    type: "paragraph",
                    content: [
                        {
                            type: "text",
                            text: "Users must verify their email before posting.",
                        },
                    ],
                },
            ],
        },
        isActive: true,
    },
    {
        name: "Advertising Guidelines",
        category: "Risk Management",
        description: {
            type: "notion",
            content: [
                {
                    type: "heading",
                    attrs: { level: 2 },
                    content: [{ type: "text", text: "Advertising Rules" }],
                },
                {
                    type: "paragraph",
                    content: [
                        {
                            type: "text",
                            text: "Ads must not promote misleading or harmful products.",
                        },
                    ],
                },
            ],
        },
        isActive: true,
    },
    {
        name: "Privacy Policy Enforcement",
        category: "Entry",
        description: {
            type: "notion",
            content: [
                {
                    type: "heading",
                    attrs: { level: 1 },
                    content: [{ type: "text", text: "Privacy Enforcement" }],
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
                                            text: "Protect user data from unauthorized access.",
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                },
            ],
        },
        isActive: false,
    },
];

// Interface for timeline actions
interface TimelineAction {
    type: "create" | "update" | "toggle" | "delete";
    rule?: RuleFormFields; // For create and update
    ruleIndex?: number; // Index in sampleRules for create, update, toggle, or delete
    id?: string; // For update, toggle, or delete (set after creation)
}

// Seed function to create rules and simulate actions over days
async function seedRules() {
    console.log("Starting seed process...");

    const require = createRequire(import.meta.url);

    // Store original module
    const originalModule = require.cache[require.resolve("next/cache")];

    // Mock next/cache
    require.cache[require.resolve("next/cache")] = {
        exports: {
            revalidatePath: () => {
                console.log("Mocked revalidatePath called");
            },
        },
    } as any;

    // Dynamically import actions after setting up mock
    const {
        addRuleAction,
        updateRuleAction,
        toggleRuleActiveStatusAction,
        deleteRuleAction,
    } = await import("@/app/rules/actions");

    // Track created rules and their IDs
    const createdRules: { index: number; id: string; name: string }[] = [];

    // Simulate actions over 12 days (May 1–May 12, 2025)
    const timeline: { date: Date; actions: TimelineAction[] }[] = [
        {
            date: new Date("2025-05-01T10:00:00Z"),
            actions: [
                // Day 1: Create all five rules
                { type: "create", rule: sampleRules[0], ruleIndex: 0 }, // Content Moderation Policy
                { type: "create", rule: sampleRules[1], ruleIndex: 1 }, // Spam Detection Rule
                { type: "create", rule: sampleRules[2], ruleIndex: 2 }, // User Verification Policy
                { type: "create", rule: sampleRules[3], ruleIndex: 3 }, // Advertising Guidelines
                { type: "create", rule: sampleRules[4], ruleIndex: 4 }, // Privacy Policy Enforcement
            ],
        },
        {
            date: new Date("2025-05-03T14:00:00Z"),
            actions: [
                // Day 3: Update name of first rule
                {
                    type: "update",
                    ruleIndex: 0,
                    rule: {
                        ...sampleRules[0],
                        name: "Content Moderation Guidelines",
                    },
                },
                // Update description of second rule
                {
                    type: "update",
                    ruleIndex: 1,
                    rule: {
                        ...sampleRules[1],
                        description: {
                            type: "notion",
                            content: [
                                {
                                    type: "heading",
                                    attrs: { level: 2 },
                                    content: [
                                        {
                                            type: "text",
                                            text: "Enhanced Spam Detection",
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
                                                            text: "Block repetitive posts and automated bots.",
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
                                                            text: "Implement rate limiting for suspicious accounts.",
                                                        },
                                                    ],
                                                },
                                            ],
                                        },
                                    ],
                                },
                            ],
                        },
                    },
                },
            ],
        },
        {
            date: new Date("2025-05-04T09:00:00Z"),
            actions: [
                // Day 4: Update category of first rule
                {
                    type: "update",
                    ruleIndex: 0,
                    rule: {
                        ...sampleRules[0],
                        category: "Entry",
                    },
                },
                // Update name of third rule
                {
                    type: "update",
                    ruleIndex: 2,
                    rule: {
                        ...sampleRules[2],
                        name: "User Authentication Policy",
                    },
                },
            ],
        },
        {
            date: new Date("2025-05-05T12:00:00Z"),
            actions: [
                // Day 5: Update isActive of first rule
                {
                    type: "update",
                    ruleIndex: 0,
                    rule: {
                        ...sampleRules[0],
                        isActive: false,
                    },
                },
                // Update isActive of second rule
                {
                    type: "update",
                    ruleIndex: 1,
                    rule: {
                        ...sampleRules[1],
                        isActive: true,
                    },
                },
            ],
        },
        {
            date: new Date("2025-05-06T15:00:00Z"),
            actions: [
                // Day 6: Update description of first rule (first update)
                {
                    type: "update",
                    ruleIndex: 0,
                    rule: {
                        ...sampleRules[0],
                        description: {
                            type: "notion",
                            content: [
                                {
                                    type: "heading",
                                    attrs: { level: 1 },
                                    content: [
                                        {
                                            type: "text",
                                            text: "Revised Content Moderation",
                                        },
                                    ],
                                },
                                {
                                    type: "paragraph",
                                    content: [
                                        {
                                            type: "text",
                                            text: "Updated guidelines to ensure compliance with platform standards.",
                                        },
                                    ],
                                },
                                {
                                    type: "paragraph",
                                    content: [
                                        {
                                            type: "text",
                                            text: "Added monitoring for inappropriate content.",
                                        },
                                    ],
                                },
                            ],
                        },
                    },
                },
                // Update category of third rule
                {
                    type: "update",
                    ruleIndex: 2,
                    rule: {
                        ...sampleRules[2],
                        category: "Exit",
                    },
                },
            ],
        },
        {
            date: new Date("2025-05-07T10:00:00Z"),
            actions: [
                // Day 7: Update description of first rule (second update)
                {
                    type: "update",
                    ruleIndex: 0,
                    rule: {
                        ...sampleRules[0],
                        description: {
                            type: "notion",
                            content: [
                                {
                                    type: "heading",
                                    attrs: { level: 1 },
                                    content: [
                                        {
                                            type: "text",
                                            text: "Revised Content Moderation",
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
                                                            text: "Monitor for hate speech and misinformation.",
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
                                                            text: "Flag repetitive content for review.",
                                                        },
                                                    ],
                                                },
                                            ],
                                        },
                                    ],
                                },
                            ],
                        },
                    },
                },
            ],
        },
        {
            date: new Date("2025-05-08T14:00:00Z"),
            actions: [
                // Day 8: Update description of first rule (third update)
                {
                    type: "update",
                    ruleIndex: 0,
                    rule: {
                        ...sampleRules[0],
                        description: {
                            type: "notion",
                            content: [
                                {
                                    type: "heading",
                                    attrs: { level: 1 },
                                    content: [
                                        {
                                            type: "text",
                                            text: "Content Moderation Standards",
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
                                                            text: "Enforce strict policies on harmful content.",
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
                                                                            text: "Ban accounts posting hate speech.",
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
                                                                            text: "Warn users for misinformation.",
                                                                        },
                                                                    ],
                                                                },
                                                            ],
                                                        },
                                                    ],
                                                },
                                            ],
                                        },
                                    ],
                                },
                            ],
                        },
                    },
                },
                // Update description of fourth rule
                {
                    type: "update",
                    ruleIndex: 3,
                    rule: {
                        ...sampleRules[3],
                        description: {
                            type: "notion",
                            content: [
                                {
                                    type: "heading",
                                    attrs: { level: 2 },
                                    content: [
                                        {
                                            type: "text",
                                            text: "Updated Advertising Rules",
                                        },
                                    ],
                                },
                                {
                                    type: "paragraph",
                                    content: [
                                        {
                                            type: "text",
                                            text: "Ads must comply with new transparency regulations.",
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
                                                            text: "Disclose sponsored content clearly.",
                                                        },
                                                    ],
                                                },
                                            ],
                                        },
                                    ],
                                },
                            ],
                        },
                    },
                },
            ],
        },
        {
            date: new Date("2025-05-12T09:00:00Z"),
            actions: [
                // Day 12: Delete fifth rule
                { type: "delete", ruleIndex: 4 }, // Privacy Policy Enforcement
            ],
        },
    ];

    // Execute actions in timeline order
    for (const { date, actions } of timeline) {
        console.log(`Processing actions for ${date.toISOString()}`);

        for (const action of actions) {
            try {
                if (
                    action.type === "create" &&
                    action.rule &&
                    action.ruleIndex !== undefined
                ) {
                    const result = await addRuleAction(action.rule);
                    if (result.success && result.data) {
                        console.log(`Created rule: ${result.data.name}`);
                        createdRules.push({
                            index: action.ruleIndex,
                            id: result.data.id,
                            name: result.data.name,
                        });
                        // Override timestamp for history events
                        await prisma.ruleHistoryEvent.updateMany({
                            where: { ruleId: result.data.id },
                            data: { timestamp: date },
                        });
                    } else {
                        console.error(
                            `Failed to create rule '${action.rule.name}': ${result.error}`
                        );
                    }
                } else if (
                    action.type === "update" &&
                    action.ruleIndex !== undefined &&
                    action.rule
                ) {
                    const rule = createdRules.find(
                        (r) => r.index === action.ruleIndex
                    );
                    if (!rule) {
                        console.error(
                            `Rule with index ${action.ruleIndex} not found for update`
                        );
                        continue;
                    }
                    const result = await updateRuleAction(rule.id, action.rule);
                    if (result.success && result.data) {
                        console.log(`Updated rule: ${result.data.name}`);
                        // Override timestamp for history events
                        await prisma.ruleHistoryEvent.updateMany({
                            where: { ruleId: rule.id, eventType: "updated" },
                            data: { timestamp: date },
                        });
                    } else {
                        console.error(
                            `Failed to update rule '${rule.name}': ${result.error}`
                        );
                    }
                } else if (
                    action.type === "toggle" &&
                    action.ruleIndex !== undefined
                ) {
                    const rule = createdRules.find(
                        (r) => r.index === action.ruleIndex
                    );
                    if (!rule) {
                        console.error(
                            `Rule with index ${action.ruleIndex} not found for toggle`
                        );
                        continue;
                    }
                    const result = await toggleRuleActiveStatusAction(rule.id);
                    if (result.success && result.data) {
                        console.log(
                            `Toggled rule: ${result.data.name} to ${result.data.isActive}`
                        );
                        // Override timestamp for history events
                        await prisma.ruleHistoryEvent.updateMany({
                            where: {
                                ruleId: rule.id,
                                eventType: { in: ["activated", "deactivated"] },
                            },
                            data: { timestamp: date },
                        });
                    } else {
                        console.error(
                            `Failed to toggle rule '${rule.name}': ${result.error}`
                        );
                    }
                } else if (
                    action.type === "delete" &&
                    action.ruleIndex !== undefined
                ) {
                    const rule = createdRules.find(
                        (r) => r.index === action.ruleIndex
                    );
                    if (!rule) {
                        console.error(
                            `Rule with index ${action.ruleIndex} not found for delete`
                        );
                        continue;
                    }
                    const result = await deleteRuleAction(rule.id);
                    if (result.success) {
                        console.log(`Deleted rule: ${rule.name}`);
                        // Override timestamp for history events
                        await prisma.ruleHistoryEvent.updateMany({
                            where: { ruleId: rule.id, eventType: "deleted" },
                            data: { timestamp: date },
                        });
                    } else {
                        console.error(
                            `Failed to delete rule '${rule.name}': ${result.error}`
                        );
                    }
                } else {
                    console.error(
                        `Invalid action configuration: ${JSON.stringify(
                            action
                        )}`
                    );
                }
            } catch (error) {
                console.error(
                    `Error processing action '${action.type}':`,
                    error
                );
            }
        }
    }

    // Restore original module (cleanup)
    if (originalModule) {
        require.cache[require.resolve("next/cache")] = originalModule;
    } else {
        delete require.cache[require.resolve("next/cache")];
    }

    console.log("Seed process completed.");
    console.log(
        "Created rules:",
        createdRules.map((r) => ({ id: r.id, name: r.name }))
    );
}

// Run the seed script
seedRules().catch((error) => {
    console.error("Seed script failed:", error);
    process.exit(1);
});
