import type { Rule, TrackingEntry } from "@prisma/client";

export type { Rule, TrackingEntry };

export type RuleWithEntries = Rule & {
    entries: TrackingEntry[];
};

export type TrackingEntryWithRule = TrackingEntry & {
    rule: Rule;
};

export type StatusType = "success" | "failure" | "not_applicable";

export interface ActionResult<T = any> {
    success: boolean;
    data?: T;
    error?: string;
}

export interface DailyTracking {
    id: string;
    date: string;
    entries: TrackingEntry[];
    notes: string;
    createdAt: string;
}
