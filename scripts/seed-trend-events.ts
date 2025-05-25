import { PrismaClient } from "@prisma/client";
import { addDays, subDays } from "date-fns";

const prisma = new PrismaClient();

const DEFAULT_INSTRUMENT = "EURUSD";

async function main() {
    console.log(
        `Starting seed for trend events with instrument: ${DEFAULT_INSTRUMENT}`
    );

    // Get all rules to reference
    const rules = await prisma.rule.findMany();
    if (rules.length === 0) {
        console.log("No rules found. Please create some rules first.");
        return;
    }

    // Delete existing trend events for this instrument
    const deletedCount = await prisma.trendEvent.deleteMany({
        where: {
            symbol: DEFAULT_INSTRUMENT,
        },
    });
    console.log(
        `Deleted ${deletedCount.count} existing trend events for ${DEFAULT_INSTRUMENT}`
    );

    // Create a base date (30 days ago)
    const baseDate = subDays(new Date(), 30);

    // Start with a downtrend
    let currentTrend = "downtrend";

    // Create a series of trend events
    const events = [];

    // Day 1: Initial failed reversal
    events.push({
        date: addDays(baseDate, 0),
        eventType: "failed_reversal",
        description:
            "Price attempted to reverse but failed to break resistance",
        symbol: DEFAULT_INSTRUMENT,
        direction: "downtrend", // Still in downtrend after failed reversal
        ruleId: rules[0].id,
    });

    // Day 3: Successful reversal to uptrend
    events.push({
        date: addDays(baseDate, 3),
        eventType: "successful_reversal",
        description: "Price broke through resistance with strong momentum",
        symbol: DEFAULT_INSTRUMENT,
        direction: "uptrend", // Changed to uptrend
        ruleId: rules[1].id,
    });
    currentTrend = "uptrend";

    // Day 7: Failed reversal attempt
    events.push({
        date: addDays(baseDate, 7),
        eventType: "failed_reversal",
        description: "Price tested support but bounced back up",
        symbol: DEFAULT_INSTRUMENT,
        direction: "uptrend", // Still in uptrend
        ruleId: rules[2].id,
    });

    // Day 10: Successful reversal to downtrend
    events.push({
        date: addDays(baseDate, 10),
        eventType: "successful_reversal",
        description: "Price broke through support with high volume",
        symbol: DEFAULT_INSTRUMENT,
        direction: "downtrend", // Changed to downtrend
        ruleId: rules[0].id,
    });
    currentTrend = "downtrend";

    // Day 15: Multiple events on same day
    // First a failed reversal
    events.push({
        date: addDays(baseDate, 15),
        eventType: "failed_reversal",
        description: "Morning: Price attempted to reverse but failed",
        symbol: DEFAULT_INSTRUMENT,
        direction: "downtrend", // Still in downtrend
        ruleId: rules[1].id,
    });

    // Then a successful reversal later the same day
    events.push({
        date: addDays(baseDate, 15),
        eventType: "successful_reversal",
        description:
            "Afternoon: Price successfully reversed with strong momentum",
        symbol: DEFAULT_INSTRUMENT,
        direction: "uptrend", // Changed to uptrend
        ruleId: rules[2].id,
    });
    currentTrend = "uptrend";

    // Day 17: Multiple reversals in one day
    // First successful reversal to downtrend
    events.push({
        date: addDays(baseDate, 17),
        eventType: "successful_reversal",
        description: "Morning: Price broke support",
        symbol: DEFAULT_INSTRUMENT,
        direction: "downtrend", // Changed to downtrend
        ruleId: rules[0].id,
    });
    currentTrend = "downtrend";

    // Then successful reversal back to uptrend
    events.push({
        date: addDays(baseDate, 17),
        eventType: "successful_reversal",
        description: "Afternoon: Price quickly reversed back up",
        symbol: DEFAULT_INSTRUMENT,
        direction: "uptrend", // Changed to uptrend
        ruleId: rules[1].id,
    });
    currentTrend = "uptrend";

    // Day 20: Failed reversal
    events.push({
        date: addDays(baseDate, 20),
        eventType: "failed_reversal",
        description: "Price tested resistance but failed to break through",
        symbol: DEFAULT_INSTRUMENT,
        direction: "uptrend", // Still in uptrend
        ruleId: rules[2].id,
    });

    // Day 23: Successful reversal to downtrend
    events.push({
        date: addDays(baseDate, 23),
        eventType: "successful_reversal",
        description: "Price broke through support with increasing volume",
        symbol: DEFAULT_INSTRUMENT,
        direction: "downtrend", // Changed to downtrend
        ruleId: rules[0].id,
    });
    currentTrend = "downtrend";

    // Day 25: Multiple events - complex day with 3 reversals
    // First successful reversal to uptrend
    events.push({
        date: addDays(baseDate, 25),
        eventType: "successful_reversal",
        description: "Morning: Price broke resistance",
        symbol: DEFAULT_INSTRUMENT,
        direction: "uptrend", // Changed to uptrend
        ruleId: rules[1].id,
    });
    currentTrend = "uptrend";

    // Then successful reversal back to downtrend
    events.push({
        date: addDays(baseDate, 25),
        eventType: "successful_reversal",
        description: "Midday: Price reversed back down",
        symbol: DEFAULT_INSTRUMENT,
        direction: "downtrend", // Changed to downtrend
        ruleId: rules[2].id,
    });
    currentTrend = "downtrend";

    // Then successful reversal back to uptrend again
    events.push({
        date: addDays(baseDate, 25),
        eventType: "successful_reversal",
        description: "Afternoon: Price reversed again to close higher",
        symbol: DEFAULT_INSTRUMENT,
        direction: "uptrend", // Changed to uptrend
        ruleId: rules[0].id,
    });
    currentTrend = "uptrend";

    // Day 28: Failed reversal
    events.push({
        date: addDays(baseDate, 28),
        eventType: "failed_reversal",
        description: "Price tested support but bounced back up strongly",
        symbol: DEFAULT_INSTRUMENT,
        direction: "uptrend", // Still in uptrend
        ruleId: rules[1].id,
    });

    // Create all events
    for (const event of events) {
        await prisma.trendEvent.create({
            data: event,
        });
    }

    console.log(
        `Created ${events.length} trend events for ${DEFAULT_INSTRUMENT}`
    );
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
