"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/db";
import type { ActionResult, Rule } from "@/lib/types";
import { RulesSchema, type RuleFormFields } from "../zod/schema";

// Helper function to record rule history events with detailed changes
async function recordRuleHistoryEvent(
    rule: Rule,
    eventType: string,
    details?: any,
    customTimestamp?: Date //used to testing purpose only
) {
    try {
        await prisma.ruleHistoryEvent.create({
            data: {
                ruleId: rule.id,
                ruleName: rule.name,
                eventType,
                details: details || undefined,
                timestamp: customTimestamp || new Date(),
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

// Helper function to create a new version of a rule
async function createRuleVersion(rule: Rule) {
    try {
        // Get the latest version number for this rule
        const latestVersion = await prisma.ruleVersion.findFirst({
            where: { ruleId: rule.id },
            orderBy: { versionNumber: "desc" },
        });

        const versionNumber = latestVersion
            ? latestVersion.versionNumber + 1
            : 1;

        // Create a new version
        await prisma.ruleVersion.create({
            data: {
                ruleId: rule.id,
                versionNumber,
                name: rule.name,
                description: rule.description,
                category: rule.category,
                isActive: rule.isActive,
            },
        });

        return versionNumber;
    } catch (error) {
        console.error("Failed to create rule version:", error);
        return null;
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
        const { name, category, description, isActive } = result.data;

        //Adding to the db
        const rule = await prisma.rule.create({
            data: {
                name,
                description,
                category,
                isActive: isActive || false,
            },
        });

        // Create the initial version
        const versionNumber = await createRuleVersion(rule);

        // Record the creation event with initial values and version info
        await recordRuleHistoryEvent(rule, "created", {
            initialValues: {
                name,
                category,
                description,
                isActive: isActive || false,
            },
            versionNumber,
        });

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
        // Get the current rule to compare changes
        const currentRule = await prisma.rule.findUnique({
            where: { id },
        });

        if (!currentRule) {
            throw new Error("Rule not found");
        }

        //Validation of data in server side
        const result = RulesSchema.safeParse(data);
        if (result.error) {
            console.log(
                `Error validating data with zod schema`,
                result.error.message
            );
            throw new Error(`Zod validation failed`, result.error);
        }

        const validatedData = result.data;

        // Check if the active status is changing
        const isActiveChanging =
            currentRule.isActive !== validatedData.isActive &&
            validatedData.isActive !== undefined;

        // Update the rule
        const rule = await prisma.rule.update({
            where: { id },
            data: validatedData,
        });

        // Create a new version if there are changes
        let versionNumber = null;
        const hasChanges =
            currentRule.name !== rule.name ||
            currentRule.category !== rule.category ||
            JSON.stringify(currentRule.description) !==
                JSON.stringify(rule.description) ||
            isActiveChanging;

        if (hasChanges) {
            versionNumber = await createRuleVersion(rule);
        }

        // Record the update event with detailed changes
        const changes = {
            name: {
                changed: currentRule.name !== rule.name,
                from: currentRule.name,
                to: rule.name,
            },
            category: {
                changed: currentRule.category !== rule.category,
                from: currentRule.category,
                to: rule.category,
            },
            description: {
                changed:
                    JSON.stringify(currentRule.description) !==
                    JSON.stringify(rule.description),
                // For description, we'll store a simplified indicator since the full JSON might be too large
                // The detailed comparison can be done in the UI
                fromSummary: getDescriptionSummary(currentRule.description),
                toSummary: getDescriptionSummary(rule.description),
            },
            isActive: {
                changed: isActiveChanging,
                from: currentRule.isActive,
                to: rule.isActive,
            },
            versionInfo: versionNumber
                ? {
                      previousVersion: versionNumber - 1,
                      newVersion: versionNumber,
                  }
                : null,
        };

        // Only record if something actually changed
        if (hasChanges) {
            await recordRuleHistoryEvent(rule, "updated", changes);
        }

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

// Interfaces for Notion-like data (aligned with provided Block interface)
interface TextContent {
    type: string;
    text?: string;
    marks?: { type: string }[];
}

interface BlockAttrs {
    level?: number;
    [key: string]: any;
}

interface Block {
    type: string;
    content?: (TextContent | Block)[];
    attrs?: BlockAttrs;
}

interface Description {
    content?: Block[];
}

// Output interface for summary
interface DescriptionSummary {
    blockCount: number;
    textPreview: string;
}

// Helper function to get a summary of the description content
function getDescriptionSummary(description: unknown): DescriptionSummary {
    try {
        // Handle null/undefined/empty input
        if (!description) {
            return { blockCount: 0, textPreview: "Empty" };
        }

        // Parse string input to JSON, if necessary
        const parsedDescription: Description =
            typeof description === "string"
                ? JSON.parse(description)
                : description;

        // Validate content structure
        if (!parsedDescription || !Array.isArray(parsedDescription.content)) {
            return { blockCount: 0, textPreview: "Invalid format" };
        }

        // Count top-level blocks
        const blockCount = parsedDescription.content.length;

        // Recursively extract text from blocks
        const extractText = (items: (TextContent | Block)[]): string => {
            let text = "";
            for (const item of items) {
                if ("text" in item && item.text) {
                    // Handle text content
                    text += item.text + " ";
                } else if ("content" in item && Array.isArray(item.content)) {
                    // Handle nested blocks (e.g., list items, nested content)
                    text += extractText(item.content) + " ";
                }
            }
            return text.trim();
        };

        // Get text from all blocks, prioritizing headings and paragraphs
        let textPreview = "";
        const allBlocks = parsedDescription.content;
        for (const block of allBlocks) {
            if (
                block.content &&
                ["heading", "paragraph", "listItem"].includes(block.type)
            ) {
                const blockText = extractText(block.content);
                textPreview += blockText + " ";
                if (textPreview.length >= 50) break; // Stop once we have enough text
            }
        }

        // Trim and limit preview to 50 characters
        textPreview = textPreview.trim();
        if (textPreview.length === 0) {
            textPreview = blockCount > 0 ? "No text content" : "Empty";
        } else if (textPreview.length > 50) {
            textPreview = textPreview.substring(0, 50) + "...";
        }

        return { blockCount, textPreview };
    } catch (e) {
        console.warn("Failed to parse description:", e);
        return { blockCount: 0, textPreview: "Invalid format" };
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

        // Record the deletion event with the rule's final state
        await recordRuleHistoryEvent(rule, "deleted", {
            finalState: {
                name: rule.name,
                category: rule.category,
                isActive: rule.isActive,
            },
        });

        // Delete the rule
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

        // Create a new version
        const versionNumber = await createRuleVersion(updatedRule);

        // Record the activation/deactivation event with before/after values
        await recordRuleHistoryEvent(
            updatedRule,
            updatedRule.isActive ? "activated" : "deactivated",
            {
                from: currentRule.isActive,
                to: updatedRule.isActive,
                versionNumber,
            }
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
