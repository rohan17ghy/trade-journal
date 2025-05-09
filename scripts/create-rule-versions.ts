// This script creates initial versions for all rules
// Run it with: npx ts-node scripts/create-rule-versions.ts

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function createRuleVersions() {
    try {
        console.log("🔍 Finding rules without versions...");

        // Get all rules
        const rules = await prisma.rule.findMany();

        if (rules.length === 0) {
            console.log("No rules found. Please create some rules first.");
            return;
        }

        console.log(`Found ${rules.length} rules. Checking for versions...`);

        // For each rule, check if it has a version 1
        let createdCount = 0;

        for (const rule of rules) {
            // Check if version 1 exists
            const existingVersion = await prisma.ruleVersion.findFirst({
                where: {
                    ruleId: rule.id,
                    versionNumber: 1,
                },
            });

            if (!existingVersion) {
                // Create version 1
                await prisma.ruleVersion.create({
                    data: {
                        ruleId: rule.id,
                        versionNumber: 1,
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

                console.log(`✅ Created version 1 for rule: ${rule.name}`);
                createdCount++;
            }
        }

        if (createdCount === 0) {
            console.log("All rules already have version 1.");
        } else {
            console.log(`✅ Created versions for ${createdCount} rules.`);
        }

        // Create version 2 for each rule (for comparison purposes)
        let version2Count = 0;

        for (const rule of rules) {
            // Check if version 2 exists
            const existingVersion = await prisma.ruleVersion.findFirst({
                where: {
                    ruleId: rule.id,
                    versionNumber: 2,
                },
            });

            if (!existingVersion) {
                // Create version 2 with slight modifications
                await prisma.ruleVersion.create({
                    data: {
                        ruleId: rule.id,
                        versionNumber: 2,
                        name: `${rule.name} (v2)`,
                        description: rule.description || {
                            type: "doc",
                            content: [],
                        },
                        category: rule.category,
                        isActive: !rule.isActive, // Toggle active status
                        createdAt: new Date(),
                    },
                });

                console.log(`✅ Created version 2 for rule: ${rule.name}`);
                version2Count++;
            }
        }

        if (version2Count === 0) {
            console.log("All rules already have version 2.");
        } else {
            console.log(`✅ Created version 2 for ${version2Count} rules.`);
        }

        console.log("✅ Rule versions creation complete!");
    } catch (error) {
        console.error("Error creating rule versions:", error);
    } finally {
        await prisma.$disconnect();
    }
}

// Run the function
createRuleVersions()
    .then(() => console.log("Done!"))
    .catch((e) => console.error(e));
