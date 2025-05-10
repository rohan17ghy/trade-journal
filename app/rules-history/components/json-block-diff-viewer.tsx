import React, { ReactElement } from "react";
import ReactDiffViewer, { DiffMethod } from "react-diff-viewer-continued";
import Prism from "prismjs";
import "prismjs/themes/prism.css";
import "@/styles/diff-viewer.css"; // Updated CSS for enhanced styling

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
                    const marks = item.marks?.map((mark) => mark.type) || [];
                    let text = item.text;
                    if (marks.includes("bold")) text = `**${text}**`;
                    if (marks.includes("italic")) text = `*${text}*`;
                    return text;
                } else if ("type" in item && "content" in item) {
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

    // Syntax highlighting function with tag cleanup
    const highlightSyntax = (str: string): ReactElement => {
        const style = {
            display: "inline",
            fontFamily: "ui-monospace, Menlo, Monaco, Consolas, monospace",
            fontSize: "14px",
        };

        if (Prism.languages.plaintext) {
            try {
                // Highlight text and clean up unnecessary tags
                let highlighted = Prism.highlight(
                    str,
                    Prism.languages.plaintext,
                    "plaintext"
                );
                // Remove <pre> and <span> tags but preserve content
                highlighted = highlighted.replace(/<\/?(pre|span)[^>]*>/g, "");
                return (
                    <div
                        style={style}
                        dangerouslySetInnerHTML={{ __html: highlighted }}
                    />
                );
            } catch (e) {
                console.warn("Prism highlighting failed:", e);
            }
        }

        // Fallback to raw text if highlighting fails
        return <div style={style}>{str}</div>;
    };

    // Minimal inline styles, relying on diff-viewer.css
    const customStyles: DiffViewerStyles = {
        diffContainer: {
            borderRadius: "12px",
            maxWidth: "100%",
            overflowX: "auto",
        },
    };

    return (
        <div className="diff-viewer-container">
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
