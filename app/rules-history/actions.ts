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
                latestEventsByRule.get(event.ruleId).timestamp < event.timestamp
            ) {
                latestEventsByRule.set(event.ruleId, event);
            }
        }

        // Determine which rules were active on the target date
        const activeRuleIds = new Set();
        for (const [ruleId, event] of latestEventsByRule.entries()) {
            if (event.eventType === "activated" && event.timestamp <= nextDay) {
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
