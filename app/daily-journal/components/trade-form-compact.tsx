"use client";

import type React from "react";

import { useState, useEffect } from "react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { addTradeJournalEntryAction } from "@/app/journal/actions";
import { getRulesAction } from "@/app/rules/actions";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Plus, TrendingUp, TrendingDown } from "lucide-react";
import type { Rule, MarketType, TradeDirection } from "@/lib/types";

interface TradeFormCompactProps {
    date: string;
    onTradeAdded: () => void;
    dailyJournalId?: string;
    insideForm?: boolean;
}

export function TradeFormCompact({
    date,
    onTradeAdded,
    dailyJournalId,
    insideForm = false,
}: TradeFormCompactProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [rules, setRules] = useState<Rule[]>([]);
    const [isLoadingRules, setIsLoadingRules] = useState(true);
    const [showForm, setShowForm] = useState(false);

    // Form state
    const [market, setMarket] = useState<MarketType | string>("Stocks");
    const [symbol, setSymbol] = useState("");
    const [setup, setSetup] = useState("");
    const [direction, setDirection] = useState<TradeDirection>("Long");
    const [entryPrice, setEntryPrice] = useState(0);
    const [exitPrice, setExitPrice] = useState<number | undefined>(undefined);
    const [positionSize, setPositionSize] = useState(1);
    const [notes, setNotes] = useState("");
    const [selectedRuleIds, setSelectedRuleIds] = useState<string[]>([]);

    // Load rules
    useEffect(() => {
        async function loadRules() {
            setIsLoadingRules(true);
            try {
                const rulesResult = await getRulesAction();
                if (rulesResult.success && rulesResult.data) {
                    setRules(rulesResult.data);
                }
            } catch (error) {
                console.error("Failed to load rules:", error);
            } finally {
                setIsLoadingRules(false);
            }
        }

        loadRules();
    }, []);

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

    // Reset form
    const resetForm = () => {
        setMarket("Stocks");
        setSymbol("");
        setSetup("");
        setDirection("Long");
        setEntryPrice(0);
        setExitPrice(undefined);
        setPositionSize(1);
        setNotes("");
        setSelectedRuleIds([]);
        setShowForm(false);
    };

    async function handleSubmit(e?: React.FormEvent) {
        if (e) e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            if (
                !symbol ||
                !market ||
                !direction ||
                entryPrice <= 0 ||
                positionSize <= 0
            ) {
                throw new Error("Please fill in all required fields");
            }

            const tradeData = {
                date,
                market,
                symbol,
                setup: setup || undefined,
                direction,
                entryPrice,
                exitPrice: exitPrice || undefined,
                positionSize,
                profitLoss: profitLoss || undefined,
                profitLossPercentage: profitLossPercentage || undefined,
                notes: notes || undefined,
                ruleIds:
                    selectedRuleIds.length > 0 ? selectedRuleIds : undefined,
            };

            const result = await addTradeJournalEntryAction(tradeData);

            if (!result.success) {
                throw new Error(result.error || "Failed to add trade");
            }

            // Reset form and notify parent
            resetForm();
            onTradeAdded();
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setIsSubmitting(false);
        }
    }

    if (!showForm) {
        return (
            <Button onClick={() => setShowForm(true)} className="w-full">
                <Plus className="mr-2 h-4 w-4" /> Add New Trade
            </Button>
        );
    }

    const formContent = (
        <>
            <div className="grid gap-4 md:grid-cols-2">
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
                    <Label htmlFor="setup">Setup/Pattern</Label>
                    <Input
                        id="setup"
                        placeholder="e.g., Breakout, Support/Resistance"
                        value={setup}
                        onChange={(e) => setSetup(e.target.value)}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="entryPrice">
                        Entry Price <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="entryPrice"
                        type="number"
                        step="any"
                        value={entryPrice || ""}
                        onChange={(e) =>
                            setEntryPrice(
                                Number.parseFloat(e.target.value) || 0
                            )
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
                                    : undefined
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
                        value={positionSize || ""}
                        onChange={(e) =>
                            setPositionSize(
                                Number.parseFloat(e.target.value) || 1
                            )
                        }
                        required
                    />
                </div>

                {profitLoss !== null && (
                    <div className="md:col-span-2 p-3 border rounded-md">
                        <div className="flex items-center">
                            {profitLoss >= 0 ? (
                                <TrendingUp className="h-5 w-5 text-green-500 mr-2" />
                            ) : (
                                <TrendingDown className="h-5 w-5 text-red-500 mr-2" />
                            )}
                            <span
                                className={`font-medium ${
                                    profitLoss >= 0
                                        ? "text-green-500"
                                        : "text-red-500"
                                }`}
                            >
                                P/L: ${profitLoss.toFixed(2)} (
                                {profitLossPercentage!.toFixed(2)}%)
                            </span>
                        </div>
                    </div>
                )}

                <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                        id="notes"
                        placeholder="Notes about this trade"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={2}
                    />
                </div>
            </div>

            {/* Applied Rules */}
            {!isLoadingRules && rules.length > 0 && (
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

            <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                </Button>
                <Button
                    type={insideForm ? "button" : "submit"}
                    onClick={insideForm ? handleSubmit : undefined}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                            Saving...
                        </>
                    ) : (
                        "Save Trade"
                    )}
                </Button>
            </div>
        </>
    );

    return (
        <Card className="mb-4">
            <CardHeader>
                <CardTitle className="text-base">
                    Add Trade for {date}
                </CardTitle>
            </CardHeader>
            <CardContent>
                {insideForm ? (
                    <div className="space-y-4">{formContent}</div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {formContent}
                    </form>
                )}
            </CardContent>
        </Card>
    );
}
