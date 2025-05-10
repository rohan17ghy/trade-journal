import { PrismaClient } from "@prisma/client";
import readline from "readline";

const prisma = new PrismaClient();

function askConfirmation(): Promise<boolean> {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise((resolve) => {
        rl.question(
            "⚠️  Are you sure you want to clear all data? This cannot be undone. (yes/no): ",
            (answer) => {
                rl.close();
                resolve(answer.trim().toLowerCase() === "yes");
            }
        );
    });
}

async function clearDatabase() {
    if (process.env.NODE_ENV !== "development") {
        throw new Error("❌ This script should be run only in development.");
    }

    const confirmed = await askConfirmation();
    if (!confirmed) {
        console.log("Aborted.");
        process.exit(0);
    }

    // Delete in correct order to avoid FK violations
    await prisma.rulePerformanceEntry.deleteMany();
    await prisma.tradeJournalEntry.deleteMany();
    await prisma.ruleHistoryEvent.deleteMany();
    await prisma.ruleVersion.deleteMany();
    await prisma.dailyJournal.deleteMany();
    await prisma.rule.deleteMany();

    console.log("✅ All data cleared successfully.");
}

clearDatabase()
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
