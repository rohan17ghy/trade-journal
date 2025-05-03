"use client";

import { useRouter } from "next/navigation";
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
import { addRuleAction, updateRuleAction } from "./actions";
import { Controller, type SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { BlockEditor } from "@/components/block-editor";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Rule } from "@/lib/types";
import TailwindAdvancedEditor from "@/components/editor/advanced-editor";
import { RulesSchema, RuleCategoryEnum, RuleFormFields } from "../zod/schema";

interface RuleFormProps {
    rule?: Rule;
    onCancel?: () => void;
}

export function RuleForm({ rule, onCancel }: RuleFormProps) {
    const isEdit: boolean = !!rule?.id;
    const router = useRouter();

    const { name, category, description } =
        RulesSchema.safeParse(rule).data || {};

    const {
        register,
        handleSubmit,
        setError,
        reset,
        control,
        formState: { errors, isSubmitting },
    } = useForm<RuleFormFields>({
        resolver: zodResolver(RulesSchema),
        defaultValues: { name, category, description },
    });

    const onSubmit: SubmitHandler<RuleFormFields> = async (data) => {
        const result =
            isEdit && rule?.id
                ? await updateRuleAction(rule?.id, data)
                : await addRuleAction(data);
        if (result.success) {
            reset();
            if (onCancel) {
                onCancel(); // Hide the form after successful submission
            } else if (isEdit) {
                router.push("/rules"); // Navigate back to rules page after editing
            }
            router.refresh(); // Refresh the page to show the updated list
        } else {
            setError("root", { message: result.error });
        }
    };

    const handleCancel = () => {
        if (onCancel) {
            onCancel();
        } else {
            // If no onCancel provided (in edit mode), navigate back to rules page
            router.push("/rules");
        }
    };

    return (
        <div className="border rounded-lg p-4 border-border">
            <h2 className="text-lg font-medium mb-4">
                {isEdit ? "Edit Rule" : "Add Rule"}
            </h2>
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
                    <Controller
                        name="description"
                        control={control}
                        render={({ field }) => {
                            return (
                                <TailwindAdvancedEditor
                                    onChange={field.onChange}
                                />
                            );
                        }}
                    ></Controller>
                </div>
                {errors.description && (
                    <span className="text-red-500">
                        {(errors.description?.message as string) || ""}
                    </span>
                )}

                {errors.root && (
                    <div className="text-red-500 text-sm">
                        {errors.root.message}
                    </div>
                )}

                <div className="flex justify-end gap-4">
                    <Button
                        type="button"
                        variant="outline"
                        className="min-w-[100px]"
                        onClick={handleCancel}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="min-w-[100px]"
                    >
                        {isSubmitting
                            ? isEdit
                                ? "Updating..."
                                : "Adding..."
                            : isEdit
                            ? "Update Rule"
                            : "Add Rule"}
                    </Button>
                </div>
            </form>
        </div>
    );
}
