"use server";

import { format, parseISO, getDay } from "date-fns";
import prisma from "@/lib/db";
import type { ActionResult, RulePerformanceEntryWithRule } from "@/lib/types";

interface RuleAnalyticsData {
    entries: RulePerformanceEntryWithRule[];
    successRate: number;
    totalEntries: number;
    successfulEntries: number;
    failedEntries: number;
    performanceByDayOfWeek: {
        day: string;
        successCount: number;
        failureCount: number;
        successRate: number;
    }[];
    performanceByMonth: {
        month: string;
        successRate: number;
        totalEntries: number;
    }[];
    recentTrend: "improving" | "declining" | "stable" | "insufficient_data";
}

export async function getRuleAnalyticsAction(
    ruleId: string
): Promise<ActionResult<RuleAnalyticsData>> {
    try {
        // Get all performance entries for this rule
        const entries = await prisma.rulePerformanceEntry.findMany({
            where: { ruleId },
            include: { rule: true },
            orderBy: { date: "asc" },
        });

        // Calculate basic stats
        const totalEntries = entries.length;
        const successfulEntries = entries.filter(
            (e) => e.status === "success"
        ).length;
        const failedEntries = entries.filter(
            (e) => e.status === "failure"
        ).length;
        const successRate =
            totalEntries > 0
                ? Math.round((successfulEntries / totalEntries) * 100)
                : 0;

        // Calculate performance by day of week
        const dayNames = [
            "Sunday",
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
        ];
        const dayStats = dayNames.map((day) => ({
            day,
            successCount: 0,
            failureCount: 0,
            successRate: 0,
        }));

        entries.forEach((entry) => {
            const date = parseISO(entry.date);
            const dayOfWeek = getDay(date);

            if (entry.status === "success") {
                dayStats[dayOfWeek].successCount++;
            } else if (entry.status === "failure") {
                dayStats[dayOfWeek].failureCount++;
            }
        });

        // Calculate success rate for each day
        dayStats.forEach((day) => {
            const total = day.successCount + day.failureCount;
            day.successRate =
                total > 0 ? Math.round((day.successCount / total) * 100) : 0;
        });

        // Calculate performance by month
        const monthData: Record<string, { success: number; failure: number }> =
            {};

        entries.forEach((entry) => {
            const date = parseISO(entry.date);
            const monthKey = format(date, "yyyy-MM");
            const monthDisplay = format(date, "MMM yyyy");

            if (!monthData[monthKey]) {
                monthData[monthKey] = { success: 0, failure: 0 };
            }

            if (entry.status === "success") {
                monthData[monthKey].success++;
            } else if (entry.status === "failure") {
                monthData[monthKey].failure++;
            }
        });

        const performanceByMonth = Object.entries(monthData)
            .map(([monthKey, data]) => {
                const total = data.success + data.failure;
                const successRate =
                    total > 0 ? Math.round((data.success / total) * 100) : 0;
                return {
                    month: format(parseISO(`${monthKey}-01`), "MMM yyyy"),
                    successRate,
                    totalEntries: total,
                };
            })
            .sort((a, b) => {
                // Sort by date (assuming month is in format "MMM yyyy")
                const dateA = new Date(a.month);
                const dateB = new Date(b.month);
                return dateA.getTime() - dateB.getTime();
            });

        // Determine recent trend
        let recentTrend:
            | "improving"
            | "declining"
            | "stable"
            | "insufficient_data" = "insufficient_data";

        if (performanceByMonth.length >= 3) {
            const lastThreeMonths = performanceByMonth.slice(-3);
            const firstMonth = lastThreeMonths[0].successRate;
            const lastMonth = lastThreeMonths[2].successRate;

            if (lastMonth - firstMonth >= 10) {
                recentTrend = "improving";
            } else if (firstMonth - lastMonth >= 10) {
                recentTrend = "declining";
            } else {
                recentTrend = "stable";
            }
        }

        return {
            success: true,
            data: {
                entries,
                successRate,
                totalEntries,
                successfulEntries,
                failedEntries,
                performanceByDayOfWeek: dayStats,
                performanceByMonth,
                recentTrend,
            },
        };
    } catch (error) {
        console.error("Failed to get rule analytics:", error);
        return { success: false, error: "Failed to get rule analytics" };
    }
}
