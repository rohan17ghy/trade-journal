"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { addRuleAction } from "./actions";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { Description } from "@radix-ui/react-toast";
import { Resolver } from "dns";
import { zodResolver } from "@hookform/resolvers/zod";
import { Rule } from "postcss";
import { ActionResult } from "@/lib/types";

const RuleCategoryEnum = z.enum([
    "Entry",
    "Exit",
    "Risk Management",
    "Psychology",
    "Other",
]);

const RulesSchema = z.object({
    name: z.string().min(1, "Rule Name cannot be empty"),
    category: RuleCategoryEnum,
    description: z.string().min(1, "Description cannot be empty"),
});

export type RuleFormFields = z.infer<typeof RulesSchema>;

export function AddRuleForm() {
    const router = useRouter();

    const {
        register,
        handleSubmit,
        setError,
        reset,
        control,
        formState: { errors, isSubmitting },
    } = useForm<RuleFormFields>({ resolver: zodResolver(RulesSchema) });

    const onSubmit: SubmitHandler<RuleFormFields> = async (data) => {
        const result = await addRuleAction(data);
        if (result.success) {
            reset();
            //TODO: Here need to navigate to some other page
        } else {
            setError("root", { message: result.error });
        }
    };

    return (
        <div className="border rounded-lg p-4 border-border">
            <h2 className="text-lg font-medium mb-4">Add New Rule</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid gap-2">
                    <Label htmlFor="name">Rule Name</Label>
                    <Input
                        {...register("name")}
                        placeholder="Enter rule name"
                    />
                </div>
                {errors.name && (
                    <span className="text-red-500">{errors.name.message}</span>
                )}

                <div className="grid gap-2">
                    <Label htmlFor="category">Category</Label>
                    <Controller
                        name="category"
                        control={control}
                        render={({ field }) => (
                            <Select
                                value={field.value}
                                onValueChange={field.onChange}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {RuleCategoryEnum.options.map(
                                        (value, key) => (
                                            <SelectItem value={value} key={key}>
                                                {value}
                                            </SelectItem>
                                        )
                                    )}
                                </SelectContent>
                            </Select>
                        )}
                    ></Controller>
                </div>
                {errors.category && (
                    <span className="text-red-500">
                        {errors.category.message}
                    </span>
                )}

                <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea {...register("description")} rows={3} />
                </div>
                {errors.description && (
                    <span className="text-red-500">
                        {errors.description.message}
                    </span>
                )}

                {/* Root error messages which are set for generic error messages which are not tied to any field
                 Usefull mostly when there are error from the API*/}
                {errors.root && (
                    <div className="text-red-500 text-sm">
                        {errors.root.message}
                    </div>
                )}

                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Adding..." : "Add Rule"}
                </Button>
            </form>
        </div>
    );
}
