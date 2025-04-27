"use client";

import {
    Line,
    LineChart,
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

interface SuccessRateOverTimeProps {
    data: {
        month: string;
        successRate: number;
        totalEntries: number;
    }[];
}

export function SuccessRateOverTime({ data }: SuccessRateOverTimeProps) {
    if (data.length === 0) {
        return (
            <div className="text-center p-8 border rounded-lg border-border">
                <p className="text-muted-foreground">
                    No performance data available yet.
                </p>
            </div>
        );
    }

    // Format data for chart
    const chartData = data.map((item) => ({
        name: item.month,
        "Success Rate": item.successRate,
        Entries: item.totalEntries,
    }));

    // Calculate trend
    let trend = "stable";
    if (data.length >= 2) {
        const firstRate = data[0].successRate;
        const lastRate = data[data.length - 1].successRate;

        if (lastRate - firstRate >= 10) {
            trend = "improving";
        } else if (firstRate - lastRate >= 10) {
            trend = "declining";
        }
    }

    return (
        <div className="space-y-6">
            <ChartContainer
                config={{
                    "Success Rate": {
                        label: "Success Rate (%)",
                        color: "hsl(215, 100%, 60%)", // Bright blue
                    },
                }}
                className="h-[300px]"
            >
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis domain={[0, 100]} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Legend />
                        <Line
                            type="monotone"
                            dataKey="Success Rate"
                            stroke="hsl(215, 100%, 60%)"
                            strokeWidth={2}
                            activeDot={{ r: 8 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </ChartContainer>

            <div className="space-y-4">
                <h3 className="text-lg font-medium">
                    Performance Trend Analysis
                </h3>
                <div className="border rounded-md p-4">
                    <h4 className="font-medium mb-2">Overall Trend</h4>
                    <p className="text-muted-foreground">
                        {trend === "improving" &&
                            "This rule's performance is improving over time. Keep using it and refining your approach."}
                        {trend === "declining" &&
                            "This rule's performance is declining over time. Consider reviewing and adjusting your approach."}
                        {trend === "stable" &&
                            "This rule's performance has been relatively stable over time."}
                        {data.length < 2 &&
                            "Not enough data to determine a trend yet. Continue tracking this rule's performance."}
                    </p>

                    {data.length >= 2 && (
                        <div className="mt-4">
                            <h4 className="font-medium mb-2">
                                Month-by-Month Comparison
                            </h4>
                            <div className="space-y-2">
                                {data.map((month, index) => (
                                    <div
                                        key={month.month}
                                        className="flex items-center justify-between"
                                    >
                                        <span>{month.month}</span>
                                        <div className="flex items-center">
                                            <span className="font-medium mr-2">
                                                {month.successRate}%
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                ({month.totalEntries} entries)
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
