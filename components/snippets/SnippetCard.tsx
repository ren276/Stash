"use client";

import { Pencil, Trash2, Maximize2, Copy } from "lucide-react";
import CopyButton from "@/components/ui/CopyButton";
import Badge from "@/components/ui/Badge";
import { useState } from "react";

interface Snippet {
    id: string;
    title: string;
    body: string;
    tags: string[];
}

interface SnippetCardProps {
    snippet: Snippet;
    onEdit: (snippet: Snippet) => void;
    onDelete: (id: string) => void;
    onExpand: (snippet: Snippet) => void;
}

export default function SnippetCard({
    snippet,
    onEdit,
    onDelete,
    onExpand,
}: SnippetCardProps) {
    const [showActions, setShowActions] = useState(false);

    // Better truncation logic
    const lines = snippet.body.split('\n');
    const preview = lines.slice(0, 3).join('\n') + (lines.length > 3 || snippet.body.length > 150 ? '...' : '');

    return (
        <div
            className="group relative bg-surface border border-border rounded-xl p-8 hover:border-accent/30 hover:shadow-lg hover:shadow-accent/5 transition-all duration-300 flex flex-col h-full"
            onMouseEnter={() => setShowActions(true)}
            onMouseLeave={() => setShowActions(false)}
        >
            <div className="flex items-start justify-between gap-3 mb-3">
                <h3
                    className="flex-1 font-semibold font-[family-name:var(--font-syne)] text-lg text-text-primary cursor-pointer hover:text-accent transition-colors truncate"
                    onClick={() => onExpand(snippet)}
                >
                    {snippet.title}
                </h3>
                <button
                    onClick={() => onExpand(snippet)}
                    className="p-1.5 rounded-lg text-text-muted hover:text-accent hover:bg-accent/10 transition-colors opacity-0 group-hover:opacity-100"
                    title="Expand"
                >
                    <Maximize2 className="w-4 h-4" />
                </button>
            </div>

            <div
                className="flex-1 bg-background border border-border/50 rounded-lg p-3 mb-4 cursor-pointer hover:border-accent/30 transition-colors relative overflow-hidden"
                onClick={() => onExpand(snippet)}
            >
                <p className="text-sm text-text-secondary font-[family-name:var(--font-jetbrains)] whitespace-pre-wrap leading-relaxed opacity-80">
                    {preview}
                </p>
                <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-background to-transparent" />
            </div>

            <div className="mt-auto">
                {snippet.tags && snippet.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                        {snippet.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="accent" className="bg-accent/10 text-accent/90 border border-accent/20">
                                {tag}
                            </Badge>
                        ))}
                        {snippet.tags.length > 3 && (
                            <span className="text-xs text-text-muted px-1.5 py-0.5">+ {snippet.tags.length - 3}</span>
                        )}
                    </div>
                )}

                <div className="flex items-center gap-2 pt-3 border-t border-border/50">
                    <CopyButton text={snippet.body} label="Copy Snippet" variant="button" className="flex-1 justify-center bg-surface-hover hover:bg-accent hover:text-white border-transparent" />

                    <div className="flex items-center gap-1 border-l border-border/50 pl-2">
                        <button
                            onClick={() => onEdit(snippet)}
                            className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors"
                            title="Edit"
                        >
                            <Pencil className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => onDelete(snippet.id)}
                            className="p-2 rounded-lg text-text-muted hover:text-danger hover:bg-danger-dim transition-colors"
                            title="Delete"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
