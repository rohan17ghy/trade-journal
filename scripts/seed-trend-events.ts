import { PrismaClient } from "@prisma/client";
import { addDays, subMonths, format, differenceInDays } from "date-fns";

const prisma = new PrismaClient();

const DEFAULT_INSTRUMENT = "EURUSD";

// Helper function to get a random time during trading hours
function getRandomTime(): string {
    const hours = Math.floor(Math.random() * 7) + 9; // 9 AM to 4 PM
    const minutes = Math.floor(Math.random() * 60);
    return `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}`;
}

// Helper function to get a specific time
function getSpecificTime(hour: number, minute: number): string {
    return `${hour.toString().padStart(2, "0")}:${minute
        .toString()
        .padStart(2, "0")}`;
}

// Helper function to get a title based on event type and direction
function getEventTitle(
    eventType: string,
    direction: string,
    currentTrend: string
): string {
    if (eventType === "successful_reversal") {
        if (direction === "uptrend") {
            return "Bullish Reversal";
        } else {
            return "Bearish Reversal";
        }
    } else {
        // failed_reversal
        if (currentTrend === "bearish") {
            return "Failed Bullish Attempt";
        } else {
            return "Failed Bearish Attempt";
        }
    }
}

interface TrendEvent {
    date: Date;
    time: string;
    title: string;
    eventType: string;
    description: string;
    symbol: string;
    direction: string;
    ruleId: string;
}

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

    // Create a base date (3 months ago)
    const today = new Date();
    const startDate = subMonths(today, 3);
    const totalDays = differenceInDays(today, startDate);

    console.log(
        `Generating events for ${totalDays} days from ${format(
            startDate,
            "yyyy-MM-dd"
        )} to ${format(today, "yyyy-MM-dd")}`
    );

    // Start with a bearish trend
    let currentTrend: "bearish" | "bullish" = "bearish";
    console.log(`Starting with ${currentTrend} trend`);

    // Create a series of trend events
    const events: TrendEvent[] = [];

    // Add some specific days with exactly 2 reversals (whipsaw days)
    const whipsawDays = [
        addDays(startDate, 15), // Day 15: bearish → bullish → bearish
        addDays(startDate, 35), // Day 35: depends on current trend
        addDays(startDate, 60), // Day 60: depends on current trend
        addDays(startDate, 80), // Day 80: depends on current trend
    ];

    // Track the last event date to avoid too many events close together
    let lastEventDate = new Date(startDate);
    let dayCounter = 0;

    // Create events throughout the 3-month period
    while (dayCounter < totalDays) {
        dayCounter += Math.floor(Math.random() * 5) + 1; // Skip 1-5 days between events
        const currentDate = addDays(startDate, dayCounter);

        // Stop if we've reached today
        if (currentDate > today) break;

        // Skip weekends (Saturday = 6, Sunday = 0)
        const dayOfWeek = currentDate.getDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) {
            continue;
        }

        // Check if this is a designated whipsaw day
        const isWhipsawDay = whipsawDays.some(
            (whipsawDate) =>
                format(whipsawDate, "yyyy-MM-dd") ===
                format(currentDate, "yyyy-MM-dd")
        );

        if (isWhipsawDay) {
            // Create exactly 2 successful reversals on this day
            console.log(
                `Creating whipsaw pattern on ${format(
                    currentDate,
                    "yyyy-MM-dd"
                )}`
            );

            // First reversal (morning)
            const firstDirection =
                currentTrend === "bearish" ? "uptrend" : "downtrend";
            const firstTime = getSpecificTime(10, 30);
            const firstTitle = `Morning ${
                firstDirection === "uptrend" ? "Bullish" : "Bearish"
            } Reversal`;
            const firstDescription =
                firstDirection === "uptrend"
                    ? "Morning session: Strong buying pressure broke through resistance"
                    : "Morning session: Selling pressure broke through support";

            events.push({
                date: currentDate,
                time: firstTime,
                title: firstTitle,
                eventType: "successful_reversal",
                description: firstDescription,
                symbol: DEFAULT_INSTRUMENT,
                direction: firstDirection,
                ruleId: rules[0].id,
            });

            // Update trend after first reversal
            currentTrend = currentTrend === "bearish" ? "bullish" : "bearish";
            console.log(`  First reversal: Trend changed to ${currentTrend}`);

            // Second reversal (afternoon) - reverses back
            const secondDirection =
                currentTrend === "bearish" ? "uptrend" : "downtrend";
            const secondTime = getSpecificTime(14, 45);
            const secondTitle = `Afternoon ${
                secondDirection === "uptrend" ? "Bullish" : "Bearish"
            } Reversal`;
            const secondDescription =
                secondDirection === "uptrend"
                    ? "Afternoon session: Market reversed again, breaking back above resistance"
                    : "Afternoon session: Market reversed again, breaking back below support";

            events.push({
                date: currentDate,
                time: secondTime,
                title: secondTitle,
                eventType: "successful_reversal",
                description: secondDescription,
                symbol: DEFAULT_INSTRUMENT,
                direction: secondDirection,
                ruleId: rules[1].id,
            });

            // Update trend after second reversal
            currentTrend = currentTrend === "bearish" ? "bullish" : "bearish";
            console.log(
                `  Second reversal: Trend changed back to ${currentTrend}`
            );
        } else {
            // Regular event logic
            const eventType =
                Math.random() < 0.6 ? "successful_reversal" : "failed_reversal";
            const direction =
                currentTrend === "bearish" ? "uptrend" : "downtrend";
            const time = getRandomTime();
            const title = getEventTitle(eventType, direction, currentTrend);

            let description: string;
            if (eventType === "successful_reversal") {
                if (direction === "uptrend") {
                    description =
                        "Price broke through resistance with strong momentum and volume";
                } else {
                    description =
                        "Price broke through support with increasing selling pressure";
                }
            } else {
                if (currentTrend === "bearish") {
                    description =
                        "Price attempted to break resistance but failed and continued downward";
                } else {
                    description =
                        "Price tested support but failed to break through and bounced back up";
                }
            }

            const ruleIndex = Math.floor(Math.random() * rules.length);
            const ruleId = rules[ruleIndex].id;

            events.push({
                date: currentDate,
                time,
                title,
                eventType,
                description,
                symbol: DEFAULT_INSTRUMENT,
                direction,
                ruleId,
            });

            if (eventType === "successful_reversal") {
                currentTrend =
                    currentTrend === "bearish" ? "bullish" : "bearish";
                console.log(
                    `Day ${dayCounter}: Trend changed to ${currentTrend}`
                );
            } else {
                console.log(
                    `Day ${dayCounter}: Failed reversal, trend remains ${currentTrend}`
                );
            }

            // 25% chance to add a second event on regular days
            if (Math.random() < 0.25 && !isWhipsawDay) {
                const secondEventType =
                    Math.random() < 0.5
                        ? "successful_reversal"
                        : "failed_reversal";
                const secondDirection =
                    currentTrend === "bearish" ? "uptrend" : "downtrend";

                const hoursPart = Number.parseInt(time.split(":")[0]);
                const laterHour = Math.min(
                    hoursPart + Math.floor(Math.random() * 3) + 1,
                    16
                );
                const laterTime = getSpecificTime(
                    laterHour,
                    Math.floor(Math.random() * 60)
                );

                const secondTitle = getEventTitle(
                    secondEventType,
                    secondDirection,
                    currentTrend
                );

                let secondDescription: string;
                if (secondEventType === "successful_reversal") {
                    if (secondDirection === "uptrend") {
                        secondDescription =
                            "Later in the day: Price reversed and broke through resistance";
                    } else {
                        secondDescription =
                            "Later in the day: Price reversed and broke through support";
                    }
                } else {
                    if (currentTrend === "bearish") {
                        secondDescription =
                            "Later in the day: Second attempt to break resistance failed";
                    } else {
                        secondDescription =
                            "Later in the day: Second attempt to break support failed";
                    }
                }

                const secondRuleIndex = (ruleIndex + 1) % rules.length;
                const secondRuleId = rules[secondRuleIndex].id;

                events.push({
                    date: currentDate,
                    time: laterTime,
                    title: secondTitle,
                    eventType: secondEventType,
                    description: secondDescription,
                    symbol: DEFAULT_INSTRUMENT,
                    direction: secondDirection,
                    ruleId: secondRuleId,
                });

                if (secondEventType === "successful_reversal") {
                    currentTrend =
                        currentTrend === "bearish" ? "bullish" : "bearish";
                    console.log(
                        `Day ${dayCounter} (second event): Trend changed to ${currentTrend}`
                    );
                }
            }
        }

        lastEventDate = currentDate;
    }

    // Sort events by date and time
    events.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);

        if (dateA.getTime() !== dateB.getTime()) {
            return dateA.getTime() - dateB.getTime();
        }

        // If dates are the same, sort by time
        const [hoursA, minutesA] = a.time.split(":").map(Number);
        const [hoursB, minutesB] = b.time.split(":").map(Number);

        if (hoursA !== hoursB) {
            return hoursA - hoursB;
        }

        return minutesA - minutesB;
    });

    // Create all events
    for (const event of events) {
        await prisma.trendEvent.create({
            data: event,
        });
    }

    console.log(
        `\nCreated ${events.length} trend events for ${DEFAULT_INSTRUMENT}`
    );

    // Log trend changes
    let lastTrend: "bearish" | "bullish" = "bearish"; // Starting trend
    let trendStartDate = new Date(startDate);
    const trendChanges: Array<{
        from: string;
        to: string;
        date: string;
        time: string;
        duration: number;
    }> = [];

    for (const event of events) {
        if (event.eventType === "successful_reversal") {
            const newTrend = lastTrend === "bearish" ? "bullish" : "bearish";
            const trendDuration = differenceInDays(
                new Date(event.date),
                trendStartDate
            );

            trendChanges.push({
                from: lastTrend,
                to: newTrend,
                date: format(new Date(event.date), "yyyy-MM-dd"),
                time: event.time,
                duration: trendDuration,
            });

            lastTrend = newTrend;
            trendStartDate = new Date(event.date);
        }
    }

    console.log("\nTrend Changes:");
    trendChanges.forEach((change, index) => {
        console.log(
            `${
                index + 1
            }. ${change.from.toUpperCase()} → ${change.to.toUpperCase()} on ${
                change.date
            } at ${change.time} (lasted ${change.duration} days)`
        );
    });

    // Calculate statistics
    const totalSuccessfulReversals = events.filter(
        (e) => e.eventType === "successful_reversal"
    ).length;
    const totalFailedReversals = events.filter(
        (e) => e.eventType === "failed_reversal"
    ).length;
    const bullishReversals = events.filter(
        (e) =>
            e.eventType === "successful_reversal" && e.direction === "uptrend"
    ).length;
    const bearishReversals = events.filter(
        (e) =>
            e.eventType === "successful_reversal" && e.direction === "downtrend"
    ).length;

    console.log("\nStatistics:");
    console.log(`Total Events: ${events.length}`);
    console.log(
        `Successful Reversals: ${totalSuccessfulReversals} (${Math.round(
            (totalSuccessfulReversals / events.length) * 100
        )}%)`
    );
    console.log(
        `Failed Reversals: ${totalFailedReversals} (${Math.round(
            (totalFailedReversals / events.length) * 100
        )}%)`
    );
    console.log(`Bullish Reversals: ${bullishReversals}`);
    console.log(`Bearish Reversals: ${bearishReversals}`);

    // Count days with multiple events
    const eventsByDate = events.reduce((acc, event) => {
        const dateKey = format(new Date(event.date), "yyyy-MM-dd");
        if (!acc[dateKey]) {
            acc[dateKey] = [];
        }
        acc[dateKey].push(event);
        return acc;
    }, {} as Record<string, TrendEvent[]>);

    const daysWithMultipleEvents = Object.entries(eventsByDate).filter(
        ([_, events]) => events.length > 1
    );
    console.log(
        `\nDays with multiple events: ${daysWithMultipleEvents.length}`
    );

    // Show days with exactly 2 reversals
    const daysWithTwoReversals = daysWithMultipleEvents.filter(
        ([_, events]) =>
            events.length === 2 &&
            events.every((e) => e.eventType === "successful_reversal")
    );

    console.log(
        `\nDays with exactly 2 reversals (whipsaw days): ${daysWithTwoReversals.length}`
    );
    daysWithTwoReversals.forEach(([date, events]) => {
        console.log(`  ${date}:`);
        events.forEach((event) => {
            console.log(`    - ${event.time}: ${event.title}`);
        });
    });

    const avgTrendDuration =
        trendChanges.length > 0
            ? trendChanges.reduce((sum, change) => sum + change.duration, 0) /
              trendChanges.length
            : 0;
    console.log(
        `\nAverage Trend Duration: ${avgTrendDuration.toFixed(1)} days`
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
