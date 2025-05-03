import { z } from "zod";

export const RuleCategoryEnum = z.enum([
    "Entry",
    "Exit",
    "Risk Management",
    "Psychology",
    "Other",
]);

//zod schema created for the type `JSONContent` from 'novel'
export const JSONContentSchema = z.object({
    type: z.string(),
    content: z.array(z.lazy(() => JSONContentSchema)).optional(),
    marks: z.array(z.object({ type: z.string() })).optional(),
    attrs: z.record(z.any()).optional(),
    text: z.string().optional(),
});

export const RulesSchema = z.object({
    name: z.string().min(1, "Rule Name cannot be empty").default(""),
    category: RuleCategoryEnum.default(RuleCategoryEnum.Enum.Other),
    description: JSONContentSchema.default({ type: "doc", content: [] }),
});

export type RuleFormFields = z.infer<typeof RulesSchema>;
