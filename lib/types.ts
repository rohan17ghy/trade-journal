import type { Rule, RulePerformanceEntry } from "@prisma/client";

export type { Rule, RulePerformanceEntry };

export type RuleWithPerformances = Rule & {
    performances: RulePerformanceEntry[];
};

export type RulePerformanceEntryWithRule = RulePerformanceEntry & {
    rule: Rule;
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

// Removed TrackingEntry, DailyTracking, and TrackingEntryWithRule
