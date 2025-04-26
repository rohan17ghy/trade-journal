"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/db";
import type { ActionResult, Rule } from "@/lib/types";

export async function addRuleAction(
    formData: FormData
): Promise<ActionResult<Rule>> {
    try {
        const name = formData.get("name") as string;
        const description = formData.get("description") as string;
        const category = formData.get("category") as string;

        if (!name || !category) {
            throw new Error("Name and category are required");
        }

        const rule = await prisma.rule.create({
            data: {
                name,
                description: description || "",
                category,
            },
        });

        revalidatePath("/rules");
        return { success: true, data: rule };
    } catch (error) {
        console.error("Failed to add rule:", error);
        return { success: false, error: "Failed to add rule" };
    }
}

export async function updateRuleAction(
    id: string,
    formData: FormData
): Promise<ActionResult<Rule>> {
    try {
        const name = formData.get("name") as string;
        const description = formData.get("description") as string;
        const category = formData.get("category") as string;

        if (!name || !category) {
            throw new Error("Name and category are required");
        }

        const rule = await prisma.rule.update({
            where: { id },
            data: {
                name,
                description: description || "",
                category,
            },
        });

        revalidatePath("/rules");
        return { success: true, data: rule };
    } catch (error) {
        console.error("Failed to update rule:", error);
        return { success: false, error: "Failed to update rule" };
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
