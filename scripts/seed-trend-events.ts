import { prisma } from "@/lib/db";
import { createRequire } from "module";
import { addDays, addHours } from "date-fns";

// Define types
type TrendType = "bullish" | "bearish";

// Seed function to create trend events for a single instrument
async function seedTrendEvents() {
    console.log("Starting trend events seed process for single instrument...");

    const require = createRequire(import.meta.url);

    // Store original module
    const originalModule = require.cache[require.resolve("next/cache")];

    // Mock next/cache
    require.cache[require.resolve("next/cache")] = {
        exports: {
            revalidatePath: () => {
                console.log("Mocked revalidatePath called");
            },
        },
    } as any;

    // Define the single instrument to use
    const INSTRUMENT = "NIFTY50";

    try {
        // Get existing rules to link to trend events
        const rules = await prisma.rule.findMany({
            where: {
                category: {
                    in: ["Entry", "Exit"],
                },
            },
        });

        if (rules.length === 0) {
            console.log(
                "No rules found. Please seed rules first using: npx ts-node scripts/seed-rules.ts"
            );
            return;
        }

        console.log(`Found ${rules.length} rules to link with trend events.`);

        // Clear existing trend events
        await prisma.trendEvent.deleteMany({});
        console.log("Cleared existing trend events.");

        // Get entry and exit rules
        const entryRules = rules.filter((r) => r.category === "Entry");
        const exitRules = rules.filter((r) => r.category === "Exit");
        const allRules = [...entryRules, ...exitRules];

        // Timeframes to use
        const timeframes = ["1h", "4h", "Daily"];

        // Start date (2 months ago)
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 2);

        // Track the current trend
        let currentTrend: TrendType = "bearish"; // Start with bearish trend
        let lastEventType = "none"; // No events yet

        // Create events
        const events = [];
        let currentDate = new Date(startDate);

        // Create 30 primary events with logical trend progression
        for (let i = 0; i < 30; i++) {
            // Advance date by 1-5 days
            currentDate = addDays(
                currentDate,
                Math.floor(Math.random() * 5) + 1
            );

            // If we've gone past today, stop
            if (currentDate > new Date()) break;

            // Determine if this is a successful or failed reversal
            // Higher chance of success if we haven't had a successful reversal recently
            const successChance =
                lastEventType === "successful_reversal" ? 0.3 : 0.7;
            const isSuccessful = Math.random() < successChance;

            // The direction is the opposite of the current trend for a reversal attempt
            const direction =
                currentTrend === "bearish" ? "uptrend" : "downtrend";
            const eventType = isSuccessful
                ? "successful_reversal"
                : "failed_reversal";

            // If successful, flip the trend
            if (isSuccessful) {
                currentTrend =
                    currentTrend === "bearish" ? "bullish" : "bearish";
                lastEventType = "successful_reversal";
            } else {
                lastEventType = "failed_reversal";
            }

            // Select a timeframe
            const timeframe =
                timeframes[Math.floor(Math.random() * timeframes.length)];

            // Select an appropriate rule
            let ruleId;
            if (
                eventType === "successful_reversal" &&
                direction === "uptrend"
            ) {
                // Successful bullish reversal - use Entry rule
                ruleId =
                    entryRules[Math.floor(Math.random() * entryRules.length)]
                        ?.id || allRules[0].id;
            } else if (
                eventType === "successful_reversal" &&
                direction === "downtrend"
            ) {
                // Successful bearish reversal - use Exit rule
                ruleId =
                    exitRules[Math.floor(Math.random() * exitRules.length)]
                        ?.id || allRules[0].id;
            } else if (
                eventType === "failed_reversal" &&
                direction === "uptrend"
            ) {
                // Failed bullish reversal - use Exit rule
                ruleId =
                    exitRules[Math.floor(Math.random() * exitRules.length)]
                        ?.id || allRules[0].id;
            } else {
                // Failed bearish reversal - use Entry rule
                ruleId =
                    entryRules[Math.floor(Math.random() * entryRules.length)]
                        ?.id || allRules[0].id;
            }

            // Create description based on event type and direction
            let description;
            if (
                eventType === "successful_reversal" &&
                direction === "uptrend"
            ) {
                description = `Successfully reversed from bearish to bullish trend at key support level`;
            } else if (
                eventType === "successful_reversal" &&
                direction === "downtrend"
            ) {
                description = `Successfully reversed from bullish to bearish trend at key resistance level`;
            } else if (
                eventType === "failed_reversal" &&
                direction === "uptrend"
            ) {
                description = `Attempted to reverse from bearish to bullish but failed at resistance`;
            } else {
                description = `Attempted to reverse from bullish to bearish but failed at support`;
            }

            // Add event to array
            events.push({
                date: new Date(currentDate),
                eventType,
                description,
                symbol: INSTRUMENT,
                direction,
                timeframe,
                ruleId,
            });

            // 50% chance to add multiple events on the same day (increased from 30%)
            if (Math.random() < 0.5) {
                // Add 1-3 additional events on the same day
                const additionalEventCount = Math.floor(Math.random() * 3) + 1;

                for (let j = 0; j < additionalEventCount; j++) {
                    // For additional events, we'll have both successful and failed reversals
                    // Higher chance of failure for additional events on the same day
                    const additionalIsSuccessful = Math.random() < 0.3; // Lower success chance for additional events

                    const additionalDirection =
                        currentTrend === "bearish" ? "uptrend" : "downtrend";
                    const additionalEventType = additionalIsSuccessful
                        ? "successful_reversal"
                        : "failed_reversal";

                    // If successful, flip the trend
                    if (additionalIsSuccessful) {
                        currentTrend =
                            currentTrend === "bearish" ? "bullish" : "bearish";
                        lastEventType = "successful_reversal";
                    } else {
                        lastEventType = "failed_reversal";
                    }

                    // Select a different timeframe
                    const availableTimeframes = timeframes.filter(
                        (t) => t !== timeframe
                    );
                    const additionalTimeframe =
                        availableTimeframes[
                            Math.floor(
                                Math.random() * availableTimeframes.length
                            )
                        ];

                    // Select an appropriate rule
                    let additionalRuleId;
                    if (
                        additionalEventType === "successful_reversal" &&
                        additionalDirection === "uptrend"
                    ) {
                        additionalRuleId =
                            entryRules[
                                Math.floor(Math.random() * entryRules.length)
                            ]?.id || allRules[0].id;
                    } else if (
                        additionalEventType === "successful_reversal" &&
                        additionalDirection === "downtrend"
                    ) {
                        additionalRuleId =
                            exitRules[
                                Math.floor(Math.random() * exitRules.length)
                            ]?.id || allRules[0].id;
                    } else if (
                        additionalEventType === "failed_reversal" &&
                        additionalDirection === "uptrend"
                    ) {
                        additionalRuleId =
                            exitRules[
                                Math.floor(Math.random() * exitRules.length)
                            ]?.id || allRules[0].id;
                    } else {
                        additionalRuleId =
                            entryRules[
                                Math.floor(Math.random() * entryRules.length)
                            ]?.id || allRules[0].id;
                    }

                    // Create description
                    let additionalDescription;
                    if (
                        additionalEventType === "successful_reversal" &&
                        additionalDirection === "uptrend"
                    ) {
                        additionalDescription = `Successfully reversed from bearish to bullish trend at key support level (second attempt)`;
                    } else if (
                        additionalEventType === "successful_reversal" &&
                        additionalDirection === "downtrend"
                    ) {
                        additionalDescription = `Successfully reversed from bullish to bearish trend at key resistance level (second attempt)`;
                    } else if (
                        additionalEventType === "failed_reversal" &&
                        additionalDirection === "uptrend"
                    ) {
                        additionalDescription = `Attempted to reverse from bearish to bullish but failed at resistance (additional attempt)`;
                    } else {
                        additionalDescription = `Attempted to reverse from bullish to bearish but failed at support (additional attempt)`;
                    }

                    // Add additional event with the same date but a few hours later
                    const additionalDate = new Date(currentDate);
                    additionalDate.setHours(additionalDate.getHours() + j + 1);

                    events.push({
                        date: additionalDate,
                        eventType: additionalEventType,
                        description: additionalDescription,
                        symbol: INSTRUMENT,
                        direction: additionalDirection,
                        timeframe: additionalTimeframe,
                        ruleId: additionalRuleId,
                    });
                }
            }
        }

        // Add special multi-event days
        // 1. A day with multiple failed reversals
        const multiFailedDate = addDays(startDate, 15); // 15 days after start

        // First failed reversal
        events.push({
            date: multiFailedDate,
            eventType: "failed_reversal",
            description: `Attempted to reverse from ${currentTrend} trend but failed at key level (first attempt)`,
            symbol: INSTRUMENT,
            direction: currentTrend === "bearish" ? "uptrend" : "downtrend",
            timeframe: "1h",
            ruleId: exitRules[0]?.id || allRules[0].id,
        });

        // Update last event type
        lastEventType = "failed_reversal";

        // Second failed reversal on same day, a few hours later
        const secondFailedDate = addHours(new Date(multiFailedDate), 3);
        events.push({
            date: secondFailedDate,
            eventType: "failed_reversal",
            description: `Attempted to reverse from ${currentTrend} trend but failed at key level (second attempt)`,
            symbol: INSTRUMENT,
            direction: currentTrend === "bearish" ? "uptrend" : "downtrend",
            timeframe: "4h",
            ruleId: exitRules[1]?.id || allRules[0].id,
        });

        // Update last event type
        lastEventType = "failed_reversal";

        // 2. A day with a failed reversal followed by a successful reversal
        const mixedReversalDate = addDays(startDate, 22); // 22 days after start

        // Failed reversal first
        events.push({
            date: mixedReversalDate,
            eventType: "failed_reversal",
            description: `Attempted to reverse from ${currentTrend} trend but failed at first attempt`,
            symbol: INSTRUMENT,
            direction: currentTrend === "bearish" ? "uptrend" : "downtrend",
            timeframe: "1h",
            ruleId: exitRules[0]?.id || allRules[0].id,
        });

        // Update last event type
        lastEventType = "failed_reversal";

        // Successful reversal later the same day
        const successfulReversalDate = addHours(new Date(mixedReversalDate), 4);
        events.push({
            date: successfulReversalDate,
            eventType: "successful_reversal",
            description: `Successfully reversed from ${currentTrend} trend on second attempt with strong momentum`,
            symbol: INSTRUMENT,
            direction: currentTrend === "bearish" ? "uptrend" : "downtrend",
            timeframe: "4h",
            ruleId: entryRules[0]?.id || allRules[0].id,
        });

        // Update the trend
        currentTrend = currentTrend === "bearish" ? "bullish" : "bearish";
        lastEventType = "successful_reversal";

        // Add today's events - multiple events of different types
        const today = new Date();

        // First event - successful reversal
        events.push({
            date: today,
            eventType: "successful_reversal",
            description: `Successfully reversed from ${currentTrend} to ${
                currentTrend === "bearish" ? "bullish" : "bearish"
            } trend with strong momentum`,
            symbol: INSTRUMENT,
            direction: currentTrend === "bearish" ? "uptrend" : "downtrend",
            timeframe: "4h",
            ruleId:
                currentTrend === "bearish"
                    ? entryRules[0]?.id || allRules[0].id
                    : exitRules[0]?.id || allRules[0].id,
        });

        // Update trend
        currentTrend = currentTrend === "bearish" ? "bullish" : "bearish";
        lastEventType = "successful_reversal";

        // Second event - failed reversal
        const todayDate2 = new Date(today);
        todayDate2.setHours(todayDate2.getHours() - 2);

        events.push({
            date: todayDate2,
            eventType: "failed_reversal",
            description: `Attempted to reverse from ${currentTrend} trend but failed at key level`,
            symbol: INSTRUMENT,
            direction: currentTrend === "bearish" ? "uptrend" : "downtrend",
            timeframe: "1h",
            ruleId:
                currentTrend === "bearish"
                    ? exitRules[0]?.id || allRules[0].id
                    : entryRules[0]?.id || allRules[0].id,
        });

        // Update last event type
        lastEventType = "failed_reversal";

        // Sort events by date
        events.sort((a, b) => a.date.getTime() - b.date.getTime());

        // Validate event sequence
        const validatedEvents = [];
        let validationTrend: TrendType = "bearish"; // Start with bearish trend

        // Process events in chronological order
        for (let i = 0; i < events.length; i++) {
            const event = events[i];
            const expectedDirection =
                validationTrend === "bearish" ? "uptrend" : "downtrend";

            // Ensure direction matches current trend
            if (event.direction !== expectedDirection) {
                console.log(
                    `Fixing direction for event on ${event.date.toISOString()}`
                );
                event.direction = expectedDirection;

                // Update description to match direction
                if (
                    event.eventType === "successful_reversal" &&
                    expectedDirection === "uptrend"
                ) {
                    event.description = `Successfully reversed from bearish to bullish trend at key support level`;
                } else if (
                    event.eventType === "successful_reversal" &&
                    expectedDirection === "downtrend"
                ) {
                    event.description = `Successfully reversed from bullish to bearish trend at key resistance level`;
                } else if (
                    event.eventType === "failed_reversal" &&
                    expectedDirection === "uptrend"
                ) {
                    event.description = `Attempted to reverse from bearish to bullish but failed at resistance`;
                } else {
                    event.description = `Attempted to reverse from bullish to bearish but failed at support`;
                }
            }

            // If successful reversal, update the trend
            if (event.eventType === "successful_reversal") {
                validationTrend =
                    validationTrend === "bearish" ? "bullish" : "bearish";
            }

            validatedEvents.push(event);
        }

        // Create all events in the database
        console.log(`Creating ${validatedEvents.length} trend events...`);

        const createdEvents = await Promise.all(
            validatedEvents.map(async (event) => {
                try {
                    const createdEvent = await prisma.trendEvent.create({
                        data: {
                            date: event.date,
                            eventType: event.eventType,
                            description: event.description,
                            symbol: event.symbol,
                            direction: event.direction,
                            timeframe: event.timeframe,
                            ruleId: event.ruleId,
                        },
                        include: {
                            rule: true,
                        },
                    });
                    return createdEvent;
                } catch (error) {
                    console.error(`Error creating trend event:`, error);
                    return null;
                }
            })
        );

        const successfulEvents = createdEvents.filter(Boolean);
        console.log(`Created ${successfulEvents.length} trend events.`);

        // Group events by date to show multiple events on the same day
        const eventsByDate = successfulEvents.reduce((acc, event) => {
            if (!event) return acc;

            const dateStr = event.date.toISOString().split("T")[0];
            if (!acc[dateStr]) {
                acc[dateStr] = [];
            }
            acc[dateStr].push(event);
            return acc;
        }, {} as Record<string, any[]>);

        // Log days with multiple events
        console.log("\nDays with multiple events:");
        Object.entries(eventsByDate)
            .filter(([_, events]) => events.length > 1)
            .sort(
                ([dateA], [dateB]) =>
                    new Date(dateB).getTime() - new Date(dateA).getTime()
            )
            .forEach(([date, events]) => {
                console.log(`\n${date} (${events.length} events):`);
                events.forEach((event) => {
                    console.log(
                        `- ${event.eventType} ${event.direction} - Rule: ${event.rule?.name}`
                    );
                });
            });

        // Summary statistics
        const totalEvents = await prisma.trendEvent.count();
        const successfulReversals = await prisma.trendEvent.count({
            where: { eventType: "successful_reversal" },
        });
        const failedReversals = await prisma.trendEvent.count({
            where: { eventType: "failed_reversal" },
        });
        const uptrends = await prisma.trendEvent.count({
            where: { direction: "uptrend" },
        });
        const downtrends = await prisma.trendEvent.count({
            where: { direction: "downtrend" },
        });

        console.log("\nSummary:");
        console.log(`Total trend events: ${totalEvents}`);
        console.log(`Successful reversals: ${successfulReversals}`);
        console.log(`Failed reversals: ${failedReversals}`);
        console.log(`Uptrend direction: ${uptrends}`);
        console.log(`Downtrend direction: ${downtrends}`);

        // Log trend progression
        console.log("\nTrend progression:");
        const trendEvents = validatedEvents.filter(
            (e) => e.eventType === "successful_reversal"
        );
        if (trendEvents.length === 0) {
            console.log(`No trend changes`);
        } else {
            let trend: TrendType = "bearish";
            console.log(`Trend changes:`);
            trendEvents.forEach((event) => {
                const oldTrend = trend;
                trend = oldTrend === "bearish" ? "bullish" : "bearish";
                console.log(
                    `  ${
                        event.date.toISOString().split("T")[0]
                    }: ${oldTrend.toUpperCase()} → ${trend.toUpperCase()}`
                );
            });
        }
    } catch (error) {
        console.error("Error in seed process:", error);
    } finally {
        // Restore original module (cleanup)
        if (originalModule) {
            require.cache[require.resolve("next/cache")] = originalModule;
        } else {
            delete require.cache[require.resolve("next/cache")];
        }
    }

    console.log("\nTrend events seed process completed.");
}

// Run the seed script
seedTrendEvents().catch((error) => {
    console.error("Seed script failed:", error);
    process.exit(1);
});
