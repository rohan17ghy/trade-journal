"use client";

import {
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    ResponsiveContainer,
    XAxis,
    YAxis,
} from "recharts";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";

interface PerformanceByDayOfWeekProps {
    data: {
        day: string;
        successCount: number;
        failureCount: number;
        successRate: number;
    }[];
}

export function PerformanceByDayOfWeek({ data }: PerformanceByDayOfWeekProps) {
    // Sort days of week in correct order
    const daysOrder = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
    ];
    const sortedData = [...data].sort(
        (a, b) => daysOrder.indexOf(a.day) - daysOrder.indexOf(b.day)
    );

    // Format data for chart
    const chartData = sortedData.map((day) => ({
        name: day.day.substring(0, 3), // Abbreviate day names
        Success: day.successCount,
        Failure: day.failureCount,
        "Success Rate": day.successRate,
    }));

    if (chartData.every((day) => day.Success === 0 && day.Failure === 0)) {
        return (
            <div className="text-center p-8 border rounded-lg border-border">
                <p className="text-muted-foreground">
                    No performance data available yet.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <ChartContainer
                config={{
                    Success: {
                        label: "Worked Well",
                        color: "hsl(142, 76%, 36%)", // Brighter green
                    },
                    Failure: {
                        label: "Didn't Work Well",
                        color: "hsl(346, 87%, 43%)", // Brighter red
                    },
                }}
                className="h-[300px]"
            >
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Legend />
                        <Bar
                            dataKey="Success"
                            fill="hsl(142, 76%, 36%)"
                            radius={[4, 4, 0, 0]}
                        />
                        <Bar
                            dataKey="Failure"
                            fill="hsl(346, 87%, 43%)"
                            radius={[4, 4, 0, 0]}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </ChartContainer>

            <div className="space-y-4">
                <h3 className="text-lg font-medium">Day of Week Analysis</h3>
                <div className="grid gap-4 md:grid-cols-2">
                    {sortedData.map((day) => {
                        const total = day.successCount + day.failureCount;
                        if (total === 0) return null;

                        return (
                            <div
                                key={day.day}
                                className="border rounded-md p-3"
                            >
                                <div className="flex justify-between items-center">
                                    <h4 className="font-medium">{day.day}</h4>
                                    <span className="text-sm font-medium">
                                        {day.successRate}% Success
                                    </span>
                                </div>
                                <div className="mt-2 flex items-center text-sm">
                                    <div className="flex items-center mr-4">
                                        <div className="w-3 h-3 bg-emerald-500 rounded-full mr-1"></div>
                                        <span>
                                            {day.successCount} successes
                                        </span>
                                    </div>
                                    <div className="flex items-center">
                                        <div className="w-3 h-3 bg-rose-500 rounded-full mr-1"></div>
                                        <span>{day.failureCount} failures</span>
                                    </div>
                                </div>
                                <div className="mt-2 w-full bg-secondary rounded-full h-2">
                                    <div
                                        className="bg-emerald-500 h-2 rounded-full"
                                        style={{ width: `${day.successRate}%` }}
                                    ></div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
