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
    isActive: z.boolean().default(false),
});

export const TrendDirectionEnum = z.enum(["uptrend", "downtrend", "none"]);
export const TrendEventTypeEnum = z.enum([
    "successful_reversal",
    "failed_reversal",
]);

// JSON Content schema for the editor
// export const JSONContentSchema = z
//   .object({
//     type: z.string().optional(),
//     content: z.array(z.any()).optional(),
//   })
//   .passthrough()

export const TrendEventSchema = z.object({
    title: z
        .string()
        .min(1, "Title is required")
        .max(100, "Title must be less than 100 characters"),
    date: z.date({
        required_error: "Date is required",
        invalid_type_error: "Date is required",
    }),
    time: z.string().min(1, "Time is required"),
    eventType: TrendEventTypeEnum,
    description: JSONContentSchema,
    direction: TrendDirectionEnum.optional(),
    ruleId: z.string().optional(),
});

export type TrendEventFormFields = z.infer<typeof TrendEventSchema>;
