import type {
    Rule,
    RulePerformanceEntry,
    TradeJournalEntry,
    DailyJournal,
} from "@prisma/client";

export type { Rule, RulePerformanceEntry, TradeJournalEntry, DailyJournal };

export type RuleWithPerformances = Rule & {
    performances: RulePerformanceEntry[];
};

export type RulePerformanceEntryWithRule = RulePerformanceEntry & {
    rule: Rule;
};

export type TradeJournalEntryWithRules = TradeJournalEntry & {
    rules: Rule[];
};

export type DailyJournalWithTrades = DailyJournal & {
    trades: TradeJournalEntryWithRules[];
};

// Updated to only include success and failure
export type StatusType = "success" | "failure" | "not_applicable";

export interface ActionResult<T = any> {
    success: boolean;
    data?: T;
    error?: string;
}

export interface DailyPerformance {
    id: string;
    date: string;
    entries: RulePerformanceEntry[];
    notes: string;
    createdAt: string;
}

export type TradeDirection = "Long" | "Short";

export type MarketType =
    | "Forex"
    | "Stocks"
    | "Crypto"
    | "Futures"
    | "Options"
    | "Other";

export type TrackingEntryWithRule = RulePerformanceEntryWithRule;

// New type for rule performance in daily journal
export interface RulePerformance {
    ruleId: string;
    ruleName: string;
    status: StatusType;
    notes: string;
}
