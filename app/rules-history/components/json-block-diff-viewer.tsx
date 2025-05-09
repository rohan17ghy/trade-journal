import React, { ReactElement } from "react";
import ReactDiffViewer, { DiffMethod } from "react-diff-viewer-continued";
import Prism from "prismjs";
import "prismjs/themes/prism.css";
import "@/styles/diff-viewer.css"; // Custom CSS to fix overflow and enhance Vercel theme

// Interface for text content with optional marks (e.g., bold, italic)
interface TextContent {
    type?: string;
    text?: string;
    marks?: { type: string }[];
}

// Interface for a block's attributes
interface BlockAttrs {
    level?: number;
    [key: string]: any;
}

// Interface for a block in novel-editor JSON
interface Block {
    type: string;
    content?: (TextContent | Block)[];
    attrs?: BlockAttrs;
}

// Interface for a version of the content
interface Version {
    content?: Block[];
}

// Props for the JsonBlockDiffViewer component
interface JsonBlockDiffViewerProps {
    oldVersion: any;
    newVersion: any;
}

// Interface for react-diff-viewer-continued styles
interface DiffViewerStyles {
    variables?: {
        light?: Record<string, string>;
        dark?: Record<string, string>;
    };
    line?: React.CSSProperties;
    contentText?: React.CSSProperties;
    diffContainer?: React.CSSProperties;
    gutter?: React.CSSProperties;
    [key: string]: any;
}

// Function to convert novel-editor JSON blocks to a readable string
const convertBlocksToText = (blocks: Block[] | undefined): string => {
    if (!Array.isArray(blocks)) return "";

    const processContent = (
        content: (TextContent | Block)[] | undefined
    ): string => {
        if (!Array.isArray(content)) return "";

        return content
            .map((item) => {
                if ("text" in item && item.text) {
                    // Handle text content with optional marks
                    const marks = item.marks?.map((mark) => mark.type) || [];
                    let text = item.text;
                    if (marks.includes("bold")) text = `**${text}**`;
                    if (marks.includes("italic")) text = `*${text}*`;
                    return text;
                } else if ("type" in item && "content" in item) {
                    // Handle nested blocks (e.g., list items)
                    switch (item.type) {
                        case "listItem":
                            return processContent(item.content);
                        default:
                            return processContent(item.content);
                    }
                }
                return "";
            })
            .filter((text) => text.trim() !== "")
            .join(" ");
    };

    return blocks
        .map((block: Block) => {
            switch (block.type) {
                case "heading":
                    return `${"#".repeat(
                        block.attrs?.level || 1
                    )} ${processContent(block.content)}`;
                case "paragraph":
                    return processContent(block.content);
                case "bulletList":
                    return (
                        block.content
                            ?.map(
                                (item: Block) =>
                                    `- ${processContent(item.content)}`
                            )
                            .join("\n") || ""
                    );
                case "orderedList":
                    return (
                        block.content
                            ?.map(
                                (item: Block, index: number) =>
                                    `${index + 1}. ${processContent(
                                        item.content
                                    )}`
                            )
                            .join("\n") || ""
                    );
                default:
                    return processContent(block.content);
            }
        })
        .filter((text: string) => text.trim() !== "")
        .join("\n");
};

const JsonBlockDiffViewer: React.FC<JsonBlockDiffViewerProps> = ({
    oldVersion,
    newVersion,
}) => {
    // Convert JSON blocks to text for diff
    const oldText: string = convertBlocksToText(oldVersion.description.content);
    const newText: string = convertBlocksToText(newVersion.description.content);

    // Syntax highlighting function with error handling
    const highlightSyntax = (str: string): ReactElement => {
        const style = {
            display: "inline",
            fontFamily: "ui-monospace, Menlo, Monaco, Consolas, monospace",
            fontSize: "13px",
            color: "#ffffff",
        };

        // Check if Prism.languages.plaintext is available
        if (Prism.languages.plaintext) {
            try {
                return (
                    <pre
                        style={style}
                        dangerouslySetInnerHTML={{
                            __html: Prism.highlight(
                                str,
                                Prism.languages.plaintext,
                                "plaintext"
                            ),
                        }}
                    />
                );
            } catch (e) {
                console.warn("Prism highlighting failed:", e);
            }
        }

        // Fallback to raw text if highlighting fails
        return <pre style={style}>{str}</pre>;
    };

    // Custom styles to match Vercel theme
    const customStyles: DiffViewerStyles = {
        variables: {
            dark: {
                diffViewerBackground: "#111111",
                diffViewerColor: "#d4d4d4",
                addedBackground: "#2ea043",
                addedColor: "#ffffff",
                removedBackground: "#e53e3e",
                removedColor: "#ffffff",
                wordAddedBackground: "#22c55e",
                wordRemovedBackground: "#f87171",
                addedGutterBackground: "#1f2a44",
                removedGutterBackground: "#4b1f2a",
                gutterBackground: "#1a1a1a",
                gutterBackgroundDark: "#1a1a1a",
                highlightBackground: "#2a2a2a",
                highlightGutterBackground: "#2a2a2a",
                codeFoldBackground: "#1a1a1a",
                emptyLineBackground: "#111111",
            },
            light: {
                diffViewerBackground: "#ffffff",
                diffViewerColor: "#000000",
                addedBackground: "#2ea043",
                addedColor: "#000000",
                removedBackground: "#e53e3e",
                removedColor: "#000000",
                wordAddedBackground: "#22c55e",
                wordRemovedBackground: "#f87171",
                addedGutterBackground: "#e6ffed",
                removedGutterBackground: "#ffeef0",
                gutterBackground: "#f7f7f7",
                gutterBackgroundDark: "#e0e0e0",
                highlightBackground: "#f0f8ff",
                highlightGutterBackground: "#f0f8ff",
                codeFoldBackground: "#f7f7f7",
                emptyLineBackground: "#ffffff",
            },
        },
        diffContainer: {
            background: "#111111",
            border: "1px solid #333333",
            borderRadius: "8px",
            fontFamily: "ui-monospace, Menlo, Monaco, Consolas, monospace",
            fontSize: "13px",
            lineHeight: "1.5",
            maxWidth: "100%",
            overflow: "auto",
        },
        line: {
            padding: "4px 8px",
            borderBottom: "1px solid #333333",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
        },
        contentText: {
            fontFamily: "ui-monospace, Menlo, Monaco, Consolas, monospace",
            fontSize: "13px",
            color: "#d4d4d4",
        },
        gutter: {
            background: "#1a1a1a",
            color: "#a1a1aa",
            padding: "4px 8px",
            width: "40px",
            textAlign: "right",
        },
    };

    return (
        <div
            style={{
                padding: "16px",
                background: "#000000",
                borderRadius: "8px",
                border: "1px solid #333333",
                maxWidth: "100%",
                overflow: "auto",
            }}
        >
            <ReactDiffViewer
                oldValue={oldText}
                newValue={newText}
                splitView={true}
                renderContent={highlightSyntax}
                styles={customStyles}
                compareMethod={"diffLines" as DiffMethod}
            />
        </div>
    );
};

export default JsonBlockDiffViewer;
