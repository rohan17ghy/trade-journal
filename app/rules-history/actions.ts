"use server";

import prisma from "@/lib/db";
import type { ActionResult } from "@/lib/types";

export async function getRuleHistoryAction(): Promise<ActionResult> {
    try {
        // Query the actual RuleHistoryEvent table
        const events = await prisma.ruleHistoryEvent.findMany({
            orderBy: { timestamp: "desc" },
            include: {
                rule: {
                    select: {
                        category: true,
                    },
                },
            },
        });

        // Map the events to include the category
        const mappedEvents = events.map((event) => ({
            id: event.id,
            ruleId: event.ruleId,
            ruleName: event.ruleName,
            eventType: event.eventType,
            timestamp: event.timestamp,
            category: event.rule?.category || "Unknown",
            details: event.details,
        }));

        return {
            success: true,
            data: mappedEvents,
        };
    } catch (error) {
        console.error("Failed to get rule history:", error);
        return {
            success: false,
            error: "Failed to get rule history",
        };
    }
}

export async function getActiveRulesForDateAction(
    date: string
): Promise<ActionResult> {
    try {
        // Get the date range for the query (start of day to end of day)
        const targetDate = new Date(date);
        const nextDay = new Date(date);
        nextDay.setDate(nextDay.getDate() + 1);

        // Get all rules
        const allRules = await prisma.rule.findMany({
            orderBy: { name: "asc" },
        });

        // Get activation/deactivation events before or on the target date
        const activationEvents = await prisma.ruleHistoryEvent.findMany({
            where: {
                eventType: { in: ["activated", "deactivated"] },
                timestamp: { lte: nextDay },
            },
            orderBy: { timestamp: "desc" },
        });

        // Group events by rule ID and get the most recent event for each rule
        const latestEventsByRule = new Map();
        for (const event of activationEvents) {
            if (
                !latestEventsByRule.has(event.ruleId) ||
                new Date(latestEventsByRule.get(event.ruleId).timestamp) <
                    new Date(event.timestamp)
            ) {
                latestEventsByRule.set(event.ruleId, event);
            }
        }

        // Determine which rules were active on the target date
        const activeRuleIds = new Set();
        for (const [ruleId, event] of latestEventsByRule.entries()) {
            if (
                event.eventType === "activated" &&
                new Date(event.timestamp) <= nextDay
            ) {
                activeRuleIds.add(ruleId);
            }
        }

        // Filter rules into active and inactive
        const activeRules = allRules.filter((rule) =>
            activeRuleIds.has(rule.id)
        );
        const inactiveRules = allRules.filter(
            (rule) => !activeRuleIds.has(rule.id)
        );

        return {
            success: true,
            data: {
                activeRules,
                inactiveRules,
                date: date,
            },
        };
    } catch (error) {
        console.error("Failed to get active rules for date:", error);
        return {
            success: false,
            error: "Failed to get active rules for date",
        };
    }
}

// Add a new action to get rule history for a specific rule
export async function getRuleHistoryForRuleAction(
    ruleId: string
): Promise<ActionResult> {
    try {
        const events = await prisma.ruleHistoryEvent.findMany({
            where: {
                ruleId: ruleId,
            },
            orderBy: { timestamp: "desc" },
        });

        return {
            success: true,
            data: events,
        };
    } catch (error) {
        console.error("Failed to get rule history for rule:", error);
        return {
            success: false,
            error: "Failed to get rule history for rule",
        };
    }
}

export async function getRuleVersionsAction(
    ruleId: string
): Promise<ActionResult<any[]>> {
    try {
        const versions = await prisma.ruleVersion.findMany({
            where: { ruleId },
            orderBy: { versionNumber: "desc" },
        });
        return { success: true, data: versions };
    } catch (error) {
        console.error("Failed to get rule versions:", error);
        return { success: false, error: "Failed to get rule versions" };
    }
}

export async function getRuleVersionAction(
    ruleId: string,
    versionNumber: number
): Promise<ActionResult<any>> {
    try {
        // Try to find the version
        let version = await prisma.ruleVersion.findFirst({
            where: {
                ruleId,
                versionNumber,
            },
        });

        // If version doesn't exist, create it on-the-fly
        if (!version) {
            console.log(
                `Version ${versionNumber} not found for rule ${ruleId}, creating it...`
            );

            // Get the rule
            const rule = await prisma.rule.findUnique({
                where: { id: ruleId },
            });

            if (!rule) {
                return { success: false, error: `Rule ${ruleId} not found` };
            }

            // Create the version
            try {
                version = await prisma.ruleVersion.create({
                    data: {
                        ruleId,
                        versionNumber,
                        name: rule.name,
                        description: rule.description || {
                            type: "doc",
                            content: [],
                        },
                        category: rule.category,
                        isActive: rule.isActive,
                        createdAt: new Date(),
                    },
                });
                console.log(
                    `Created version ${versionNumber} for rule ${ruleId}`
                );
            } catch (createError) {
                console.error("Error creating version:", createError);
                return {
                    success: false,
                    error: `Failed to create version: ${createError.message}`,
                };
            }
        }

        return { success: true, data: version };
    } catch (error) {
        console.error("Failed to get rule version:", error);
        return { success: false, error: "Failed to get rule version" };
    }
}

export async function compareRuleVersionsAction(
    ruleId: string,
    versionA: number,
    versionB: number
): Promise<ActionResult<any>> {
    try {
        // First, ensure both versions exist by creating them if needed
        await ensureVersionExists(ruleId, versionA);
        await ensureVersionExists(ruleId, versionB);

        // Now get both versions
        const [versionAResult, versionBResult] = await Promise.all([
            getRuleVersionAction(ruleId, versionA),
            getRuleVersionAction(ruleId, versionB),
        ]);

        if (!versionAResult.success || !versionAResult.data) {
            return { success: false, error: `Version ${versionA} not found` };
        }

        if (!versionBResult.success || !versionBResult.data) {
            return { success: false, error: `Version ${versionB} not found` };
        }

        const versionAData = versionAResult.data;
        const versionBData = versionBResult.data;

        // Return the versions for comparison
        return {
            success: true,
            data: {
                versionA: versionAData,
                versionB: versionBData,
            },
        };
    } catch (error) {
        console.error("Failed to compare rule versions:", error);
        return { success: false, error: "Failed to compare rule versions" };
    }
}

// Helper function to ensure a version exists
async function ensureVersionExists(
    ruleId: string,
    versionNumber: number
): Promise<boolean> {
    try {
        // Check if version exists
        const existingVersion = await prisma.ruleVersion.findFirst({
            where: {
                ruleId,
                versionNumber,
            },
        });

        if (existingVersion) {
            return true;
        }

        // Get the rule
        const rule = await prisma.rule.findUnique({
            where: { id: ruleId },
        });

        if (!rule) {
            console.error(`Rule ${ruleId} not found`);
            return false;
        }

        // Create the version
        await prisma.ruleVersion.create({
            data: {
                ruleId,
                versionNumber,
                name: rule.name,
                description: rule.description || { type: "doc", content: [] },
                category: rule.category,
                isActive: rule.isActive,
                createdAt: new Date(),
            },
        });

        console.log(`Created version ${versionNumber} for rule ${ruleId}`);
        return true;
    } catch (error) {
        console.error(
            `Failed to ensure version ${versionNumber} exists for rule ${ruleId}:`,
            error
        );
        return false;
    }
}
