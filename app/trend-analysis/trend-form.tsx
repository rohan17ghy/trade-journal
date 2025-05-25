"use client";

import { Input } from "@/components/ui/input";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createTrendEventAction, getRulesAction } from "./actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Rule } from "@prisma/client";
import type {
    TimeframeType,
    TrendDirection,
    TrendEventType,
} from "@/lib/types";

const INSTRUMENT = process.env.INSTRUMENT || "NIFTY50"; // Replace with your preferred default instrument

export function TrendEventForm() {
    const router = useRouter();
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [eventType, setEventType] = useState<TrendEventType>(
        "successful_reversal"
    );
    const [description, setDescription] = useState("");
    const [direction, setDirection] = useState<TrendDirection | "">("");
    const [timeframe, setTimeframe] = useState<TimeframeType | "">("");
    const [screenshot, setScreenshot] = useState("");
    const [ruleId, setRuleId] = useState("");
    const [rules, setRules] = useState<Rule[]>([]);
    const [loading, setLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        async function loadRules() {
            setLoading(true);
            try {
                const result = await getRulesAction();
                if (result.success && result.data) {
                    setRules(result.data);
                }
            } catch (error) {
                console.error("Failed to load rules:", error);
            } finally {
                setLoading(false);
            }
        }

        loadRules();
    }, []);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!date || !eventType || !description) {
            return;
        }

        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append("date", date.toISOString());
            formData.append("eventType", eventType);
            formData.append("description", description);
            formData.append("symbol", INSTRUMENT);
            if (direction) formData.append("direction", direction);
            if (timeframe) formData.append("timeframe", timeframe);
            if (screenshot) formData.append("screenshot", screenshot);
            if (ruleId) formData.append("ruleId", ruleId);

            const result = await createTrendEventAction(formData);
            if (result.success) {
                // Reset form
                setDate(new Date());
                setEventType("successful_reversal");
                setDescription("");
                setDirection("");
                setTimeframe("");
                setScreenshot("");
                setRuleId("");

                // Refresh the page
                router.refresh();
            }
        } catch (error) {
            console.error("Failed to create trend event:", error);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="date">Date</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !date && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {date ? (
                                        format(date, "PPP")
                                    ) : (
                                        <span>Pick a date</span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={setDate}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="eventType">Event Type</Label>
                        <Select
                            value={eventType}
                            onValueChange={(value) =>
                                setEventType(value as TrendEventType)
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select event type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="successful_reversal">
                                    Successful Reversal
                                </SelectItem>
                                <SelectItem value="failed_reversal">
                                    Failed Reversal
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="direction">
                            Direction After Reversal (Optional)
                        </Label>
                        <Select
                            value={direction}
                            onValueChange={(value) =>
                                setDirection(value as TrendDirection)
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select direction" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">None</SelectItem>
                                <SelectItem value="uptrend">Uptrend</SelectItem>
                                <SelectItem value="downtrend">
                                    Downtrend
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="timeframe">Timeframe (Optional)</Label>
                        <Select
                            value={timeframe}
                            onValueChange={(value) =>
                                setTimeframe(value as TimeframeType)
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select timeframe" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">None</SelectItem>
                                <SelectItem value="1m">1 Minute</SelectItem>
                                <SelectItem value="5m">5 Minutes</SelectItem>
                                <SelectItem value="15m">15 Minutes</SelectItem>
                                <SelectItem value="30m">30 Minutes</SelectItem>
                                <SelectItem value="1h">1 Hour</SelectItem>
                                <SelectItem value="4h">4 Hours</SelectItem>
                                <SelectItem value="Daily">Daily</SelectItem>
                                <SelectItem value="Weekly">Weekly</SelectItem>
                                <SelectItem value="Monthly">Monthly</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="screenshot">
                            Screenshot URL (Optional)
                        </Label>
                        <Input
                            id="screenshot"
                            value={screenshot}
                            onChange={(e) => setScreenshot(e.target.value)}
                            placeholder="URL to chart screenshot"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="rule">Related Rule (Optional)</Label>
                        <Select value={ruleId} onValueChange={setRuleId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a rule" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">None</SelectItem>
                                {rules.map((rule) => (
                                    <SelectItem key={rule.id} value={rule.id}>
                                        {rule.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the trend event, what happened, and why it's significant..."
                    rows={4}
                    required
                />
            </div>

            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                    </>
                ) : (
                    "Add Trend Event"
                )}
            </Button>
        </form>
    );
}
