import type { Rule, RulePerformanceEntry, DailyPerformance } from "./types";

// In a real app, this would be a database

/*

THIS IS A DUMMY DATA WHICH CAN BE USED WHEN NOT CONNECTED TO A DB

*/
// let rules: Rule[] = [
//     {
//         id: "1",
//         name: "Only trade with trend",
//         description:
//             "Only take trades in the direction of the overall market trend",
//         category: "Entry",
//         createdAt: new Date().toISOString(),
//     },
//     {
//         id: "2",
//         name: "2:1 Risk-Reward ratio minimum",
//         description: "Only take trades with at least 2:1 reward to risk ratio",
//         category: "Risk Management",
//         createdAt: new Date().toISOString(),
//     },
// ];

// const rulePerformanceEntries: RulePerformanceEntry[] = [];
// const dailyPerformances: DailyPerformance[] = [];

// // Rules CRUD operations
// export function getRules(): Rule[] {
//     return [...rules];
// }

// export function getRule(id: string): Rule | undefined {
//     return rules.find((rule) => rule.id === id);
// }

// export function addRule(rule: Omit<Rule, "id" | "createdAt">): Rule {
//     const newRule = {
//         ...rule,
//         id: Date.now().toString(),
//         createdAt: new Date().toISOString(),
//     };
//     rules.push(newRule);
//     return newRule;
// }

// export function updateRule(id: string, rule: Partial<Rule>): Rule | null {
//     const index = rules.findIndex((r) => r.id === id);
//     if (index === -1) return null;

//     rules[index] = { ...rules[index], ...rule };
//     return rules[index];
// }

// export function deleteRule(id: string): boolean {
//     const initialLength = rules.length;
//     rules = rules.filter((rule) => rule.id !== id);
//     return rules.length !== initialLength;
// }

// // Performance CRUD operations
// export function getDailyPerformances(): DailyPerformance[] {
//     return [...dailyPerformances];
// }

// export function getDailyPerformance(
//     date: string
// ): DailyPerformance | undefined {
//     return dailyPerformances.find((performance) => performance.date === date);
// }

// export function addDailyPerformance(
//     performance: Omit<DailyPerformance, "id" | "createdAt">
// ): DailyPerformance {
//     const existingPerformance = dailyPerformances.find(
//         (p) => p.date === performance.date
//     );

//     if (existingPerformance) {
//         existingPerformance.entries = [
//             ...existingPerformance.entries,
//             ...performance.entries,
//         ];
//         existingPerformance.notes =
//             performance.notes || existingPerformance.notes;
//         return existingPerformance;
//     }

//     const newPerformance = {
//         ...performance,
//         id: Date.now().toString(),
//         createdAt: new Date().toISOString(),
//     };

//     dailyPerformances.push(newPerformance);
//     return newPerformance;
// }

// export function addRulePerformanceEntry(
//     entry: Omit<RulePerformanceEntry, "id" | "createdAt">
// ): RulePerformanceEntry {
//     const newEntry = {
//         ...entry,
//         id: Date.now().toString(),
//         createdAt: new Date().toISOString(),
//     };

//     rulePerformanceEntries.push(newEntry);

//     // Add to daily performance
//     const existingPerformance = dailyPerformances.find(
//         (p) => p.date === entry.date
//     );

//     if (existingPerformance) {
//         // Always add as a new entry
//         existingPerformance.entries.push(newEntry);
//     } else {
//         addDailyPerformance({
//             date: entry.date,
//             entries: [newEntry],
//             notes: "",
//         });
//     }

//     return newEntry;
// }
