"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import {
    addTradeJournalEntryAction,
    updateTradeJournalEntryAction,
} from "../actions";
import { formatDate } from "@/lib/utils";
import type { Rule, MarketType, TradeDirection } from "@/lib/types";

interface TradeJournalFormProps {
    rules: Rule[];
    defaultValues?: {
        id?: string;
        date?: string;
        market?: string;
        symbol?: string;
        setup?: string;
        direction?: string;
        entryPrice?: number;
        exitPrice?: number;
        stopLoss?: number;
        takeProfit?: number;
        positionSize?: number;
        fees?: number;
        duration?: string;
        psychology?: string;
        notes?: string;
        lessonsLearned?: string;
        rating?: number;
        ruleIds?: string[];
    };
    isEditing?: boolean;
    tradeId?: string;
}

export function TradeJournalForm({
    rules,
    defaultValues = {},
    isEditing = false,
    tradeId = "",
}: TradeJournalFormProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [date, setDate] = useState<Date | undefined>(
        defaultValues.date ? new Date(defaultValues.date) : new Date()
    );
    const [market, setMarket] = useState<MarketType | string>(
        defaultValues.market || "Stocks"
    );
    const [symbol, setSymbol] = useState(defaultValues.symbol || "");
    const [setup, setSetup] = useState(defaultValues.setup || "");
    const [direction, setDirection] = useState<TradeDirection>(
        (defaultValues.direction as TradeDirection) || "Long"
    );
    const [entryPrice, setEntryPrice] = useState(defaultValues.entryPrice || 0);
    const [exitPrice, setExitPrice] = useState(defaultValues.exitPrice || 0);
    const [stopLoss, setStopLoss] = useState(defaultValues.stopLoss || 0);
    const [takeProfit, setTakeProfit] = useState(defaultValues.takeProfit || 0);
    const [positionSize, setPositionSize] = useState(
        defaultValues.positionSize || 1
    );
    const [fees, setFees] = useState(defaultValues.fees || 0);
    const [duration, setDuration] = useState(defaultValues.duration || "");
    const [psychology, setPsychology] = useState(
        defaultValues.psychology || ""
    );
    const [notes, setNotes] = useState(defaultValues.notes || "");
    const [lessonsLearned, setLessonsLearned] = useState(
        defaultValues.lessonsLearned || ""
    );
    const [rating, setRating] = useState(defaultValues.rating || 3);
    const [selectedRuleIds, setSelectedRuleIds] = useState<string[]>(
        defaultValues.ruleIds || []
    );

    // Calculate P/L
    const calculateProfitLoss = () => {
        if (!exitPrice) return null;

        if (direction === "Long") {
            return (exitPrice - entryPrice) * positionSize;
        } else {
            return (entryPrice - exitPrice) * positionSize;
        }
    };

    const calculateProfitLossPercentage = () => {
        const pl = calculateProfitLoss();
        if (pl === null) return null;

        return (pl / (entryPrice * positionSize)) * 100;
    };

    const profitLoss = calculateProfitLoss();
    const profitLossPercentage = calculateProfitLossPercentage();

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            if (
                !date ||
                !symbol ||
                !market ||
                !direction ||
                entryPrice <= 0 ||
                positionSize <= 0
            ) {
                throw new Error("Please fill in all required fields");
            }

            const formattedDate = formatDate(date);

            const tradeData = {
                date: formattedDate,
                market,
                symbol,
                setup: setup || undefined,
                direction,
                entryPrice,
                exitPrice: exitPrice || undefined,
                stopLoss: stopLoss || undefined,
                takeProfit: takeProfit || undefined,
                positionSize,
                profitLoss: profitLoss || undefined,
                profitLossPercentage: profitLossPercentage || undefined,
                fees: fees || undefined,
                duration: duration || undefined,
                psychology: psychology || undefined,
                notes: notes || undefined,
                lessonsLearned: lessonsLearned || undefined,
                rating: rating || undefined,
                ruleIds:
                    selectedRuleIds.length > 0 ? selectedRuleIds : undefined,
            };

            let result;

            if (isEditing && tradeId) {
                // Update existing trade
                result = await updateTradeJournalEntryAction(
                    tradeId,
                    tradeData
                );
            } else {
                // Create new trade
                result = await addTradeJournalEntryAction(tradeData);
            }

            if (!result.success) {
                throw new Error(
                    result.error ||
                        `Failed to ${
                            isEditing ? "update" : "add"
                        } trade journal entry`
                );
            }

            // Navigate to the journal page or the specific trade page if editing
            if (isEditing) {
                router.push(`/journal/${tradeId}`);
            } else {
                router.push("/journal");
            }
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Essential Fields */}
            <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="date">
                        Date <span className="text-red-500">*</span>
                    </Label>
                    <DatePicker date={date} setDate={setDate} />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="market">
                        Market <span className="text-red-500">*</span>
                    </Label>
                    <Select value={market} onValueChange={setMarket}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select market" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Forex">Forex</SelectItem>
                            <SelectItem value="Stocks">Stocks</SelectItem>
                            <SelectItem value="Crypto">Crypto</SelectItem>
                            <SelectItem value="Futures">Futures</SelectItem>
                            <SelectItem value="Options">Options</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="symbol">
                        Symbol <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="symbol"
                        placeholder="e.g., AAPL, EURUSD, BTC/USD"
                        value={symbol}
                        onChange={(e) => setSymbol(e.target.value)}
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="direction">
                        Direction <span className="text-red-500">*</span>
                    </Label>
                    <Select
                        value={direction}
                        onValueChange={(value) =>
                            setDirection(value as TradeDirection)
                        }
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select direction" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Long">Long</SelectItem>
                            <SelectItem value="Short">Short</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="entryPrice">
                        Entry Price <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="entryPrice"
                        type="number"
                        step="any"
                        value={entryPrice}
                        onChange={(e) =>
                            setEntryPrice(Number.parseFloat(e.target.value))
                        }
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="exitPrice">
                        Exit Price (leave empty if trade is still open)
                    </Label>
                    <Input
                        id="exitPrice"
                        type="number"
                        step="any"
                        value={exitPrice || ""}
                        onChange={(e) =>
                            setExitPrice(
                                e.target.value
                                    ? Number.parseFloat(e.target.value)
                                    : 0
                            )
                        }
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="positionSize">
                        Position Size <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="positionSize"
                        type="number"
                        step="any"
                        value={positionSize}
                        onChange={(e) =>
                            setPositionSize(Number.parseFloat(e.target.value))
                        }
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="setup">Setup/Pattern</Label>
                    <Input
                        id="setup"
                        placeholder="e.g., Breakout, Support/Resistance"
                        value={setup}
                        onChange={(e) => setSetup(e.target.value)}
                    />
                </div>
            </div>

            {profitLoss !== null && (
                <div className="p-4 border rounded-md">
                    <h3 className="font-medium mb-2">
                        Profit/Loss Calculation
                    </h3>
                    <div className="grid gap-2 md:grid-cols-2">
                        <div>
                            <span className="text-muted-foreground">P/L:</span>{" "}
                            <span
                                className={
                                    profitLoss >= 0
                                        ? "text-green-500"
                                        : "text-red-500"
                                }
                            >
                                ${profitLoss.toFixed(2)}
                            </span>
                        </div>
                        <div>
                            <span className="text-muted-foreground">
                                P/L %:
                            </span>{" "}
                            <span
                                className={
                                    profitLossPercentage! >= 0
                                        ? "text-green-500"
                                        : "text-red-500"
                                }
                            >
                                {profitLossPercentage!.toFixed(2)}%
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Advanced Options */}
            <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="advanced-options">
                    <AccordionTrigger className="text-base font-medium">
                        Advanced Options
                    </AccordionTrigger>
                    <AccordionContent>
                        <div className="space-y-6 pt-4">
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="stopLoss">Stop Loss</Label>
                                    <Input
                                        id="stopLoss"
                                        type="number"
                                        step="any"
                                        value={stopLoss || ""}
                                        onChange={(e) =>
                                            setStopLoss(
                                                e.target.value
                                                    ? Number.parseFloat(
                                                          e.target.value
                                                      )
                                                    : 0
                                            )
                                        }
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="takeProfit">
                                        Take Profit
                                    </Label>
                                    <Input
                                        id="takeProfit"
                                        type="number"
                                        step="any"
                                        value={takeProfit || ""}
                                        onChange={(e) =>
                                            setTakeProfit(
                                                e.target.value
                                                    ? Number.parseFloat(
                                                          e.target.value
                                                      )
                                                    : 0
                                            )
                                        }
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="fees">
                                        Fees/Commissions
                                    </Label>
                                    <Input
                                        id="fees"
                                        type="number"
                                        step="any"
                                        value={fees || ""}
                                        onChange={(e) =>
                                            setFees(
                                                e.target.value
                                                    ? Number.parseFloat(
                                                          e.target.value
                                                      )
                                                    : 0
                                            )
                                        }
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="duration">Duration</Label>
                                    <Input
                                        id="duration"
                                        placeholder="e.g., 2h 15m, 3 days"
                                        value={duration}
                                        onChange={(e) =>
                                            setDuration(e.target.value)
                                        }
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="rating">
                                        Trade Rating (1-5)
                                    </Label>
                                    <Select
                                        value={rating.toString()}
                                        onValueChange={(value) =>
                                            setRating(Number.parseInt(value))
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Rate this trade" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="1">
                                                1 - Poor execution
                                            </SelectItem>
                                            <SelectItem value="2">
                                                2 - Below average
                                            </SelectItem>
                                            <SelectItem value="3">
                                                3 - Average
                                            </SelectItem>
                                            <SelectItem value="4">
                                                4 - Good execution
                                            </SelectItem>
                                            <SelectItem value="5">
                                                5 - Perfect execution
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>

            {/* Notes and Analysis */}
            <div className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                        id="notes"
                        placeholder="General notes about the trade"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={3}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="psychology">Psychology</Label>
                    <Textarea
                        id="psychology"
                        placeholder="How were you feeling during this trade? What was your mindset?"
                        value={psychology}
                        onChange={(e) => setPsychology(e.target.value)}
                        rows={3}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="lessonsLearned">Lessons Learned</Label>
                    <Textarea
                        id="lessonsLearned"
                        placeholder="What did you learn from this trade?"
                        value={lessonsLearned}
                        onChange={(e) => setLessonsLearned(e.target.value)}
                        rows={3}
                    />
                </div>
            </div>

            {/* Applied Rules */}
            {rules.length > 0 && (
                <div className="space-y-3">
                    <Label>Applied Trading Rules</Label>
                    <div className="grid gap-2 md:grid-cols-2">
                        {rules.map((rule) => (
                            <div
                                key={rule.id}
                                className="flex items-center space-x-2"
                            >
                                <Checkbox
                                    id={`rule-${rule.id}`}
                                    checked={selectedRuleIds.includes(rule.id)}
                                    onCheckedChange={(checked) => {
                                        if (checked) {
                                            setSelectedRuleIds([
                                                ...selectedRuleIds,
                                                rule.id,
                                            ]);
                                        } else {
                                            setSelectedRuleIds(
                                                selectedRuleIds.filter(
                                                    (id) => id !== rule.id
                                                )
                                            );
                                        }
                                    }}
                                />
                                <Label
                                    htmlFor={`rule-${rule.id}`}
                                    className="cursor-pointer"
                                >
                                    {rule.name}
                                </Label>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-md">
                    {error}
                </div>
            )}

            <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting
                        ? "Saving..."
                        : isEditing
                        ? "Update Trade"
                        : "Save Trade"}
                </Button>
            </div>
        </form>
    );
}
