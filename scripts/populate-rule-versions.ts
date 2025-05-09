// This script populates the RuleVersion table with initial versions for all rules
// Run with: npx ts-node scripts/populate-rule-versions.ts

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function populateRuleVersions() {
    try {
        console.log("🔍 Checking for rules without versions...");

        // Get all rules
        const rules = await prisma.rule.findMany();
        console.log(`Found ${rules.length} rules total`);

        if (rules.length === 0) {
            console.log("No rules found. Please create some rules first.");
            return;
        }

        // For each rule, check if it has versions and create if needed
        let versionsCreated = 0;

        for (const rule of rules) {
            // Check if rule already has versions
            const existingVersions = await prisma.ruleVersion.findMany({
                where: { ruleId: rule.id },
            });

            if (existingVersions.length === 0) {
                // Create version 1
                await prisma.ruleVersion.create({
                    data: {
                        ruleId: rule.id,
                        versionNumber: 1,
                        name: rule.name,
                        description: rule.description,
                        category: rule.category,
                        isActive: rule.isActive,
                        createdAt: rule.createdAt,
                    },
                });
                versionsCreated++;
                console.log(
                    `✅ Created version 1 for rule: ${rule.name} (${rule.id})`
                );
            } else {
                console.log(
                    `ℹ️ Rule "${rule.name}" already has ${existingVersions.length} versions`
                );
            }
        }

        console.log(
            `\n✅ Process complete. Created ${versionsCreated} new rule versions.`
        );
    } catch (error) {
        console.error("❌ Error populating rule versions:", error);
    } finally {
        await prisma.$disconnect();
    }
}

// Run the function
populateRuleVersions()
    .then(() => console.log("Done!"))
    .catch((e) => console.error(e));
