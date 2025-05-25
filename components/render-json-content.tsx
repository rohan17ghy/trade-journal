"use client";

import type React from "react";
import type { JSONContent } from "@tiptap/react";

interface RenderJsonContentProps {
    content: JSONContent;
    className?: string;
}

export default function RenderJsonContent({
    content,
    className = "",
}: RenderJsonContentProps) {
    if (!content) {
        return null;
    }

    const renderContent = (node: any, index = 0) => {
        if (!node) return null;

        if (node.type === "doc" && node.content) {
            return (
                <div key={`doc-${index}`} className={className}>
                    {node.content.map((child: any, i: number) =>
                        renderContent(child, i)
                    )}
                </div>
            );
        }

        if (node.type === "paragraph") {
            return (
                <p key={`p-${index}`} className="mb-2">
                    {node.content?.map((child: any, i: number) =>
                        renderContent(child, i)
                    )}
                </p>
            );
        }

        if (node.type === "text") {
            const textContent = node.text || "";

            if (node.marks && node.marks.length > 0) {
                return node.marks.reduce((acc: React.ReactNode, mark: any) => {
                    if (mark.type === "bold") {
                        return <strong key={`bold-${index}`}>{acc}</strong>;
                    } else if (mark.type === "italic") {
                        return <em key={`italic-${index}`}>{acc}</em>;
                    } else if (mark.type === "underline") {
                        return <u key={`underline-${index}`}>{acc}</u>;
                    } else if (mark.type === "strike") {
                        return <s key={`strike-${index}`}>{acc}</s>;
                    } else {
                        return acc;
                    }
                }, textContent);
            }

            return textContent;
        }

        if (node.type === "bulletList") {
            return (
                <ul key={`ul-${index}`} className="list-disc pl-5 mb-2">
                    {node.content?.map((child: any, i: number) =>
                        renderContent(child, i)
                    )}
                </ul>
            );
        }

        if (node.type === "orderedList") {
            return (
                <ol key={`ol-${index}`} className="list-decimal pl-5 mb-2">
                    {node.content?.map((child: any, i: number) =>
                        renderContent(child, i)
                    )}
                </ol>
            );
        }

        if (node.type === "listItem") {
            return (
                <li key={`li-${index}`}>
                    {node.content?.map((child: any, i: number) =>
                        renderContent(child, i)
                    )}
                </li>
            );
        }

        if (node.type === "heading") {
            const level = node.attrs?.level || 1;

            switch (level) {
                case 1:
                    return (
                        <h1
                            key={`h1-${index}`}
                            className="text-2xl font-bold mb-2"
                        >
                            {node.content?.map((child: any, i: number) =>
                                renderContent(child, i)
                            )}
                        </h1>
                    );
                case 2:
                    return (
                        <h2
                            key={`h2-${index}`}
                            className="text-xl font-bold mb-2"
                        >
                            {node.content?.map((child: any, i: number) =>
                                renderContent(child, i)
                            )}
                        </h2>
                    );
                case 3:
                    return (
                        <h3
                            key={`h3-${index}`}
                            className="text-lg font-bold mb-2"
                        >
                            {node.content?.map((child: any, i: number) =>
                                renderContent(child, i)
                            )}
                        </h3>
                    );
                case 4:
                    return (
                        <h4
                            key={`h4-${index}`}
                            className="text-base font-bold mb-2"
                        >
                            {node.content?.map((child: any, i: number) =>
                                renderContent(child, i)
                            )}
                        </h4>
                    );
                case 5:
                    return (
                        <h5
                            key={`h5-${index}`}
                            className="text-sm font-bold mb-2"
                        >
                            {node.content?.map((child: any, i: number) =>
                                renderContent(child, i)
                            )}
                        </h5>
                    );
                case 6:
                    return (
                        <h6
                            key={`h6-${index}`}
                            className="text-xs font-bold mb-2"
                        >
                            {node.content?.map((child: any, i: number) =>
                                renderContent(child, i)
                            )}
                        </h6>
                    );
                default:
                    return (
                        <h1
                            key={`h1-${index}`}
                            className="text-2xl font-bold mb-2"
                        >
                            {node.content?.map((child: any, i: number) =>
                                renderContent(child, i)
                            )}
                        </h1>
                    );
            }
        }

        if (node.type === "blockquote") {
            return (
                <blockquote
                    key={`blockquote-${index}`}
                    className="border-l-4 border-gray-300 pl-4 italic mb-2"
                >
                    {node.content?.map((child: any, i: number) =>
                        renderContent(child, i)
                    )}
                </blockquote>
            );
        }

        if (node.type === "horizontalRule") {
            return <hr key={`hr-${index}`} className="my-4" />;
        }

        if (node.type === "hardBreak") {
            return <br key={`br-${index}`} />;
        }

        return null;
    };

    return renderContent(content);
}
