"use client";

import { useEffect, useState } from "react";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/shadcn";
import "@blocknote/shadcn/style.css";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { z } from "zod";

// Zod schema for BlockNote Block type
type BlockSchema = {
    id: string;
    type: string;
    props: Record<string, any>;
    content?: any;
    children: BlockSchema[];
};

const blockSchema: z.ZodType<BlockSchema> = z.object({
    id: z.string(),
    type: z.string(),
    props: z.record(z.any()),
    content: z.any().optional(),
    children: z.array(z.lazy(() => blockSchema)),
});

const blocksSchema = z.array(blockSchema);

// Zod schema for BlockEditorProps
const blockEditorPropsSchema = z.object({
    value: z
        .string()
        .optional()
        .default(
            '[{"id":"default","type":"paragraph","props":{},"content":[],"children":[]}]'
        )
        .refine((val) => (val ? JSON.parse(val) && true : true), {
            message: "Invalid JSON string",
        })
        .refine(
            (val) =>
                val ? blocksSchema.safeParse(JSON.parse(val)).success : true,
            { message: "Invalid BlockNote blocks" }
        ),
    onChange: z.function().args(z.string()).returns(z.void()).optional(),
    className: z.string().optional(),
    placeholder: z.string().optional(),
});

type BlockEditorProps = z.infer<typeof blockEditorPropsSchema>;

export function BlockEditor({ value, onChange }: BlockEditorProps) {
    const [mounted, setMounted] = useState(false);

    // Parse initial content (if it exists)
    let initialContent;
    try {
        initialContent =
            value && value !== ""
                ? JSON.parse(value)
                : [{ type: "paragraph", content: [] }];
    } catch (e) {
        console.error("Error parsing initial content:", e);
        // If parsing fails, start with empty content (e.g., for plain text)
        initialContent = [
            {
                type: "paragraph",
                content: [{ type: "text", text: value || "" }],
            },
        ];
    }

    // Create editor with theme-aware styling
    const editor = useCreateBlockNote({
        initialContent,
    });

    const handleContentChange = () => {
        try {
            // Get the blocks from the editor using the document property
            const blocks = editor.document;
            // Check if blocks is valid before stringifying
            if (blocks) {
                const jsonString = JSON.stringify(blocks);
                onChange && onChange(jsonString);
            }
        } catch (error) {
            console.error("Error handling content change:", error);
        }
    };

    // Handle client-side rendering
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div
                className={cn(
                    "border rounded-md min-h-[200px] p-4 bg-background text-foreground"
                )}
            >
                Loading editor...
            </div>
        );
    }

    return <BlockNoteView editor={editor} onChange={handleContentChange} />;
}
