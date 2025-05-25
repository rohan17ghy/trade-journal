export interface ActionResult<T = any> {
    success: boolean;
    data?: T;
    error?: string;
}

export interface RulePerformanceEntry {
    id: string;
    date: string;
    status: string;
    notes?: string | null;
    createdAt: Date;
    updatedAt: Date;
    ruleId: string;
}

export interface Rule {
    id: string;
    name: string;
    description: any; // JSON content
    category: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface RuleWithPerformance extends Rule {
    performances: RulePerformanceEntry[];
}

export interface RuleVersion {
    id: string;
    ruleId: string;
    versionNumber: number;
    name: string;
    description: any; // JSON content
    category: string;
    isActive: boolean;
    createdAt: Date;
}

export interface RuleHistoryEvent {
    id: string;
    ruleId: string;
    ruleName: string;
    eventType: string;
    timestamp: Date;
    details?: any; // JSON content
}

// Add the missing type definitions
export type TrendDirection = "uptrend" | "downtrend";
export type TrendEventType = "successful_reversal" | "failed_reversal";

export interface TrendEvent {
    id: string;
    date: Date;
    time?: string | null; // Time at which reversal or failed reversal happened
    title?: string | null; // Title for the trend event
    eventType: string;
    description: string;
    symbol: string;
    direction: string | null;
    ruleId: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface TrendEventWithRule extends TrendEvent {
    rule: Rule | null;
}

export interface DailyJournal {
    id: string;
    date: string;
    marketOverview?: string | null;
    mood?: string | null;
    physicalCondition?: string | null;
    goals?: string | null;
    achievements?: string | null;
    challenges?: string | null;
    insights?: string | null;
    improvementAreas?: string | null;
    planForTomorrow?: string | null;
    gratitude?: string | null;
    screenshots: string[];
    ruleModification?: string | null;
    createdAt: Date;
    updatedAt: Date;
    trades: TradeJournalEntry[];
}

export interface TradeJournalEntry {
    id: string;
    date: string;
    market: string;
    symbol: string;
    setup?: string | null;
    direction: string;
    entryPrice: number;
    exitPrice?: number | null;
    stopLoss?: number | null;
    takeProfit?: number | null;
    positionSize: number;
    profitLoss?: number | null;
    profitLossPercentage?: number | null;
    fees?: number | null;
    duration?: string | null;
    entryTime?: Date | null;
    exitTime?: Date | null;
    psychology?: string | null;
    notes?: string | null;
    lessonsLearned?: string | null;
    screenshots: string[];
    rating?: number | null;
    createdAt: Date;
    updatedAt: Date;
    rules: Rule[];
    dailyJournal?: DailyJournal | null;
    dailyJournalId?: string | null;
}
