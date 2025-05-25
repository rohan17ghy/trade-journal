"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Controller, type SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, Clock, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { cn } from "@/lib/utils";
import TailwindAdvancedEditor from "@/components/editor/advanced-editor";

import { createTrendEventAction, getRulesAction } from "./actions";
import {
    TrendEventSchema,
    JSONContentSchema,
    type TrendEventFormFields,
} from "@/app/zod/schema";
import type { Rule } from "@prisma/client";

const DEFAULT_INSTRUMENT = "EURUSD"; // Replace with your preferred default instrument

interface TrendEventFormProps {
    onSuccess?: () => void;
}

export function TrendEventForm({ onSuccess }: TrendEventFormProps) {
    const router = useRouter();
    const [rules, setRules] = useState<Rule[]>([]);
    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        control,
        setValue,
        reset,
        setError,
        formState: { errors, isSubmitting },
    } = useForm<TrendEventFormFields>({
        resolver: zodResolver(TrendEventSchema),
        defaultValues: {
            title: "",
            date: new Date(),
            time: "",
            eventType: "successful_reversal",
            description: { type: "doc", content: [] },
            direction: "none",
            ruleId: "none",
        },
    });

    // Set default time to current time when component mounts
    useEffect(() => {
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, "0");
        const minutes = now.getMinutes().toString().padStart(2, "0");
        setValue("time", `${hours}:${minutes}`);
    }, [setValue]);

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

    const onSubmit: SubmitHandler<TrendEventFormFields> = async (data) => {
        try {
            const formData = new FormData();
            formData.append("date", data.date.toISOString());
            formData.append("title", data.title);
            formData.append("time", data.time);
            formData.append("eventType", data.eventType);
            formData.append("description", JSON.stringify(data.description));
            formData.append("symbol", DEFAULT_INSTRUMENT);
            if (data.direction && data.direction !== "none")
                formData.append("direction", data.direction);
            if (data.ruleId && data.ruleId !== "none")
                formData.append("ruleId", data.ruleId);

            const result = await createTrendEventAction(formData);
            if (result.success) {
                // Reset form
                reset({
                    title: "",
                    date: new Date(),
                    // Keep the current time
                    time: data.time,
                    eventType: "successful_reversal",
                    description: { type: "doc", content: [] },
                    direction: "none",
                    ruleId: "none",
                });

                if (onSuccess) {
                    onSuccess();
                }

                // Refresh the page
                router.refresh();
            } else {
                setError("root", {
                    message: result.error || "Failed to create trend event",
                });
            }
        } catch (error) {
            console.error("Failed to create trend event:", error);
            setError("root", { message: "An unexpected error occurred" });
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                            id="title"
                            {...register("title")}
                            placeholder="Enter a title for this trend event"
                        />
                        {errors.title && (
                            <p className="text-sm text-red-500">
                                {errors.title.message}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="date">Date</Label>
                        <Controller
                            name="date"
                            control={control}
                            render={({ field }) => (
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={cn(
                                                "w-full justify-start text-left font-normal",
                                                !field.value &&
                                                    "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {field.value ? (
                                                format(field.value, "PPP")
                                            ) : (
                                                <span>Pick a date</span>
                                            )}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={field.value}
                                            onSelect={field.onChange}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            )}
                        />
                        {errors.date && (
                            <p className="text-sm text-red-500">
                                {errors.date.message}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="time">Time</Label>
                        <div className="flex items-center">
                            <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="time"
                                type="time"
                                {...register("time")}
                                className="flex-1"
                            />
                        </div>
                        {errors.time && (
                            <p className="text-sm text-red-500">
                                {errors.time.message}
                            </p>
                        )}
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="rule">Related Rule (Optional)</Label>
                        <Controller
                            name="ruleId"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    value={field.value}
                                    onValueChange={field.onChange}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a rule" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">
                                            None
                                        </SelectItem>
                                        {rules.map((rule) => (
                                            <SelectItem
                                                key={rule.id}
                                                value={rule.id}
                                            >
                                                {rule.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.ruleId && (
                            <p className="text-sm text-red-500">
                                {errors.ruleId.message}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="direction">
                            Direction After Reversal (Optional)
                        </Label>
                        <Controller
                            name="direction"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    value={field.value}
                                    onValueChange={field.onChange}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select direction" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">
                                            None
                                        </SelectItem>
                                        <SelectItem value="uptrend">
                                            Uptrend
                                        </SelectItem>
                                        <SelectItem value="downtrend">
                                            Downtrend
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.direction && (
                            <p className="text-sm text-red-500">
                                {errors.direction.message}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="eventType">Event Type</Label>
                        <Controller
                            name="eventType"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    value={field.value}
                                    onValueChange={
                                        field.onChange as (
                                            value: string
                                        ) => void
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
                            )}
                        />
                        {errors.eventType && (
                            <p className="text-sm text-red-500">
                                {errors.eventType.message}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Controller
                    name="description"
                    control={control}
                    render={({ field }) => {
                        const parsedDesc = JSONContentSchema.safeParse(
                            field.value
                        );

                        return (
                            <TailwindAdvancedEditor
                                {...(parsedDesc.success && {
                                    initialContent: parsedDesc.data,
                                })}
                                onChange={field.onChange}
                            />
                        );
                    }}
                />
                {errors.description && (
                    <p className="text-sm text-red-500">
                        {(errors.description?.message as string) ||
                            "Description is required"}
                    </p>
                )}
            </div>

            {errors.root && (
                <p className="text-sm text-red-500">{errors.root.message}</p>
            )}

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
