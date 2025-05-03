"use client";

import { useEffect, useState } from "react";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
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
import { Badge } from "@/components/ui/badge";
import { BlockNoteView } from "@blocknote/shadcn";
import { useCreateBlockNote } from "@blocknote/react";
import "@blocknote/shadcn/style.css";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { updateRuleAction } from "./actions";
import type { Rule } from "@/lib/types";
import TailwindAdvancedEditor from "@/components/editor/advanced-editor";
import { JSONContent } from "novel";
import { JSONContentSchema } from "../zod/schema";

interface RuleDetailProps {
    rule: Rule | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onRuleUpdated: (updatedRule: Rule) => void;
    isEditing: boolean;
    setIsEditing: (isEditing: boolean) => void;
}

export function RuleDetail({ rule, open, onOpenChange }: RuleDetailProps) {
    const parsedDesc = JSONContentSchema.safeParse(rule?.description);

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-md md:max-w-lg overflow-y-auto">
                <SheetHeader className="mb-4">
                    <SheetTitle>Trading Rule</SheetTitle>
                    <SheetDescription>
                        View your trading rule details
                    </SheetDescription>
                </SheetHeader>

                {rule ? (
                    <>
                        {
                            // View Mode
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-medium">
                                        {rule.name}
                                    </h3>
                                    <Badge className="mt-1">
                                        {rule.category}
                                    </Badge>
                                </div>

                                <div className="space-y-2">
                                    <h4 className="text-sm font-medium text-muted-foreground">
                                        Description
                                    </h4>
                                    <div className="bg-muted/50 p-4 rounded-md">
                                        <TailwindAdvancedEditor
                                            {...(parsedDesc.success
                                                ? {
                                                      initialContent:
                                                          parsedDesc.data,
                                                  }
                                                : {})}
                                        />
                                    </div>
                                </div>
                            </div>
                        }
                    </>
                ) : (
                    <div className="flex items-center justify-center h-40">
                        <p className="text-muted-foreground">
                            No rule selected
                        </p>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
}
