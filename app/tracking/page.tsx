"use client";

import { useState, useEffect } from "react";
import { getRules, getDailyTracking } from "@/lib/data";
import { DailyTrackingForm } from "./daily-tracking-form";
import { formatDate } from "@/lib/utils";
import { DatePicker } from "@/components/ui/date-picker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TrackingPage() {
    const [date, setDate] = useState<Date>(new Date());
    const [formattedDate, setFormattedDate] = useState<string>(
        formatDate(new Date())
    );
    const [rules, setRules] = useState(getRules());
    const [todayTracking, setTodayTracking] = useState(
        getDailyTracking(formattedDate)
    );

    // Update the formatted date when the date changes
    useEffect(() => {
        if (date) {
            const newFormattedDate = formatDate(date);
            setFormattedDate(newFormattedDate);
            setTodayTracking(getDailyTracking(newFormattedDate));
        }
    }, [date]);

    return (
        <div className="w-full max-w-4xl mx-auto py-8 px-4">
            <div className="flex flex-col gap-8">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        Daily Tracking
                    </h1>
                    <p className="text-muted-foreground">
                        Track how your trading rules performed
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Select Date</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {/* <DatePicker
                            date={date}
                            setDate={(newDate) => newDate && setDate(newDate)}
                        /> */}
                        <DatePicker />
                    </CardContent>
                </Card>

                <DailyTrackingForm
                    rules={rules}
                    existingTracking={todayTracking}
                    date={formattedDate}
                />
            </div>
        </div>
    );
}
