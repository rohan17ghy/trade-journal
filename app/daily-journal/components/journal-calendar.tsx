"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    format,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    isSameMonth,
    isToday,
    isSameDay,
    parseISO,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DailyJournalWithTrades } from "@/lib/types";

interface JournalCalendarProps {
    journals?: DailyJournalWithTrades[];
    journalDates?: string[];
    tradeDates: string[];
    onSelectDate?: (date: string) => void;
    selectedDate?: string;
}

export function JournalCalendar({
    journals,
    journalDates: propJournalDates,
    tradeDates,
    onSelectDate,
    selectedDate,
}: JournalCalendarProps) {
    const router = useRouter();
    const [currentMonth, setCurrentMonth] = useState(new Date());

    // Extract journal dates - either from journals array or use the provided journalDates
    const journalDates = journals
        ? journals.map((journal) => journal.date)
        : propJournalDates || [];

    // Generate days for the current month view
    const firstDayOfMonth = startOfMonth(currentMonth);
    const lastDayOfMonth = endOfMonth(currentMonth);
    const daysInMonth = eachDayOfInterval({
        start: firstDayOfMonth,
        end: lastDayOfMonth,
    });

    // Get day names for the header
    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    // Navigate to previous month
    const previousMonth = () => {
        const prevMonth = new Date(currentMonth);
        prevMonth.setMonth(prevMonth.getMonth() - 1);
        setCurrentMonth(prevMonth);
    };

    // Navigate to next month
    const nextMonth = () => {
        const nextMonth = new Date(currentMonth);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        setCurrentMonth(nextMonth);
    };

    // Handle day click
    const handleDayClick = (day: Date) => {
        if (!isSameMonth(day, currentMonth)) return;

        const formattedDate = format(day, "yyyy-MM-dd");

        if (onSelectDate) {
            onSelectDate(formattedDate);
        } else {
            router.push(`/daily-journal/${formattedDate}`);
        }
    };

    // Parse the selected date if provided
    const parsedSelectedDate = selectedDate ? parseISO(selectedDate) : null;

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle>Journal Calendar</CardTitle>
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={previousMonth}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <div className="font-medium">
                            {format(currentMonth, "MMMM yyyy")}
                        </div>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={nextMonth}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-7 gap-1 text-center mb-2">
                    {weekDays.map((day) => (
                        <div
                            key={day}
                            className="text-xs font-medium text-muted-foreground py-1"
                        >
                            {day}
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                    {daysInMonth.map((day, index) => {
                        // Format the date to match the format in journalDates
                        const formattedDate = format(day, "yyyy-MM-dd");
                        const hasJournal = journalDates.includes(formattedDate);
                        const hasTrade = tradeDates.includes(formattedDate);
                        const isSelected =
                            parsedSelectedDate &&
                            isSameDay(day, parsedSelectedDate);

                        return (
                            <Button
                                key={day.toString()}
                                variant={isSelected ? "default" : "ghost"}
                                size="sm"
                                className={cn(
                                    "h-9 w-full rounded-md p-0 font-normal",
                                    !isSameMonth(day, currentMonth) &&
                                        "text-muted-foreground opacity-50",
                                    isToday(day) &&
                                        !isSelected &&
                                        "bg-accent text-accent-foreground",
                                    hasJournal &&
                                        !isSelected &&
                                        "border-2 border-primary",
                                    hasTrade &&
                                        !hasJournal &&
                                        !isSelected &&
                                        "border-2 border-blue-500"
                                )}
                                onClick={() => handleDayClick(day)}
                            >
                                <time dateTime={formattedDate}>
                                    {format(day, "d")}
                                </time>
                                {hasJournal && !isSelected && (
                                    <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
                                        <div className="h-1 w-1 rounded-full bg-primary"></div>
                                    </div>
                                )}
                                {hasTrade && !hasJournal && !isSelected && (
                                    <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
                                        <div className="h-1 w-1 rounded-full bg-blue-500"></div>
                                    </div>
                                )}
                            </Button>
                        );
                    })}
                </div>
                <div className="flex items-center justify-center mt-4 space-x-4 text-xs text-muted-foreground">
                    <div className="flex items-center">
                        <div className="h-2 w-2 rounded-full bg-primary mr-1"></div>
                        <span>Journal Entry</span>
                    </div>
                    <div className="flex items-center">
                        <div className="h-2 w-2 rounded-full bg-blue-500 mr-1"></div>
                        <span>Trade Only</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
