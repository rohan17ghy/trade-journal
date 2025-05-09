"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/db";
import type { ActionResult, Rule } from "@/lib/types";
import { RulesSchema, type RuleFormFields } from "../zod/schema";

// Helper function to record rule history events
async function recordRuleHistoryEvent(
    rule: Rule,
    eventType: string,
    details?: any
) {
    try {
        await prisma.ruleHistoryEvent.create({
            data: {
                ruleId: rule.id,
                ruleName: rule.name,
                eventType,
                details: details || undefined,
                timestamp: new Date(),
            },
        });
    } catch (error) {
        console.error(
            `Failed to record rule history event (${eventType}):`,
            error
        );
        // We don't want to fail the main operation if history recording fails
    }
}

export async function addRuleAction(
    data: RuleFormFields
): Promise<ActionResult<Rule>> {
    try {
        //Validation of data in server side
        const result = RulesSchema.safeParse(data);
        if (result.error) {
            console.log(
                `Error validating data with zod schema`,
                result.error.message
            );
            throw new Error(`Zod validation failed`, result.error);
        }

        //destructuring the data after validaiton
        const { name, category, description } = result.data;

        //Adding to the db
        const rule = await prisma.rule.create({
            data: {
                name,
                description,
                category,
            },
        });

        // Record the creation event
        await recordRuleHistoryEvent(rule, "created");

        // If the rule is created as active, record an activation event
        if (rule.isActive) {
            await recordRuleHistoryEvent(rule, "activated");
        }

        revalidatePath("/rules");
        return { success: true, data: rule };
    } catch (error) {
        console.error("Failed to add rule:", error);
        return {
            success: false,
            error:
                error instanceof Error ? error.message : "Failed to add rule",
        };
    }
}

export async function updateRuleAction(
    id: string,
    data: RuleFormFields | Rule
): Promise<ActionResult<Rule>> {
    try {
        //Validation of data in server side
        const result = RulesSchema.safeParse(data);
        if (result.error) {
            console.log(
                `Error validating data with zod schema`,
                result.error.message
            );
            throw new Error(`Zod validation failed`, result.error);
        }

        //destructuring the data after validaiton
        //const { name, category, description } = result.data;

        // Get the current rule to compare changes
        const currentRule = await prisma.rule.findUnique({
            where: { id },
        });

        if (!currentRule) {
            throw new Error("Rule not found");
        }

        const validatedData = result.data;

        // Check if the active status is changing
        const isActiveChanging =
            currentRule.isActive !== validatedData.isActive &&
            validatedData.isActive !== undefined;

        const rule = await prisma.rule.update({
            where: { id },
            data: validatedData,
        });

        // Record the update event with details of what changed
        const changes = {
            nameChanged: currentRule.name !== rule.name,
            categoryChanged: currentRule.category !== rule.category,
            descriptionChanged:
                JSON.stringify(currentRule.description) !==
                JSON.stringify(rule.description),
            isActiveChanged: isActiveChanging,
        };

        await recordRuleHistoryEvent(rule, "updated", changes);

        // If the active status changed, record an activation/deactivation event
        if (isActiveChanging) {
            await recordRuleHistoryEvent(
                rule,
                rule.isActive ? "activated" : "deactivated"
            );
        }

        revalidatePath("/rules");
        return { success: true, data: rule };
    } catch (error) {
        console.error("Failed to update rule:", error);
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Failed to update rule",
        };
    }
}

export async function deleteRuleAction(
    id: string
): Promise<ActionResult<void>> {
    try {
        // Get the rule before deleting it
        const rule = await prisma.rule.findUnique({
            where: { id },
        });

        if (!rule) {
            throw new Error("Rule not found");
        }

        // Record the deletion event before actually deleting
        await recordRuleHistoryEvent(rule, "deleted");

        //Delete the rule
        await prisma.rule.delete({
            where: { id },
        });

        revalidatePath("/rules");
        return { success: true };
    } catch (error) {
        console.error("Failed to delete rule:", error);
        return { success: false, error: "Failed to delete rule" };
    }
}

export async function getRulesAction(): Promise<ActionResult<Rule[]>> {
    try {
        const rules = await prisma.rule.findMany({
            orderBy: { createdAt: "desc" },
        });
        return { success: true, data: rules };
    } catch (error) {
        console.error("Failed to get rules:", error);
        return { success: false, error: "Failed to get rules" };
    }
}

export async function getRuleAction(
    id: string
): Promise<ActionResult<Rule | null>> {
    try {
        const rule = await prisma.rule.findUnique({
            where: { id },
        });
        return { success: true, data: rule };
    } catch (error) {
        console.error("Failed to get rule:", error);
        return { success: false, error: "Failed to get rule" };
    }
}

// New action to toggle rule active status
export async function toggleRuleActiveStatusAction(
    id: string
): Promise<ActionResult<Rule>> {
    try {
        // Get the current rule
        const currentRule = await prisma.rule.findUnique({
            where: { id },
        });

        if (!currentRule) {
            throw new Error("Rule not found");
        }

        // Toggle the active status
        const updatedRule = await prisma.rule.update({
            where: { id },
            data: {
                isActive: !currentRule.isActive,
            },
        });

        // Record the activation/deactivation event
        await recordRuleHistoryEvent(
            updatedRule,
            updatedRule.isActive ? "activated" : "deactivated"
        );

        revalidatePath("/rules");
        return { success: true, data: updatedRule };
    } catch (error) {
        console.error("Failed to toggle rule active status:", error);
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Failed to toggle rule active status",
        };
    }
}
