"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/db";
import type { ActionResult, Rule } from "@/lib/types";
import { RulesSchema, type RuleFormFields } from "../zod/schema";

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

        const rule = await prisma.rule.update({
            where: { id },
            data: {
                name,
                description: description,
                category,
            },
        });

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
