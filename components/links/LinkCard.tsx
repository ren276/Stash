"use client";

import { ExternalLink, Pencil, Trash2, MoreHorizontal, Copy } from "lucide-react";
import CopyButton from "@/components/ui/CopyButton";
import Badge from "@/components/ui/Badge";
import { useState } from "react";

interface Link {
    id: string;
    label: string;
    url: string;
    icon?: string;
    category: string;
}

interface LinkCardProps {
    link: Link;
    onEdit: (link: Link) => void;
    onDelete: (id: string) => void;
}

export default function LinkCard({ link, onEdit, onDelete }: LinkCardProps) {
    const [showActions, setShowActions] = useState(false);

    return (
        <div
            className="group relative bg-surface border border-border rounded-xl p-8 hover:border-accent/30 hover:shadow-lg hover:shadow-accent/5 transition-all duration-300 flex flex-col h-full"
            onMouseEnter={() => setShowActions(true)}
            onMouseLeave={() => setShowActions(false)}
        >
            <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-surface-hover flex items-center justify-center shrink-0 border border-border/50 text-xl">
                        {link.icon || "🔗"}
                    </div>
                    <div className="min-w-0 flex-1">
                        <h3 className="font-semibold font-[family-name:var(--font-syne)] text-base text-text-primary line-clamp-2 leading-snug mb-1" title={link.label}>
                            {link.label}
                        </h3>
                        <p className="text-xs text-text-muted font-[family-name:var(--font-jetbrains)] truncate max-w-[200px] opacity-70">
                            {new URL(link.url).hostname}
                        </p>
                    </div>
                    <Badge variant={link.category === 'professional' ? 'accent' : 'default'} className="shrink-0 capitalize">
                        {link.category}
                    </Badge>
                </div>
            </div>

            <div className="mt-auto pt-4 flex items-center justify-between gap-3 border-t border-border/50">
                <CopyButton text={link.url} label="Copy" variant="button" className="flex-1 justify-center bg-surface-hover hover:bg-accent hover:text-white border-transparent" />

                <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg text-text-secondary hover:text-accent hover:bg-accent/10 transition-colors"
                    title="Open in new tab"
                >
                    <ExternalLink className="w-4 h-4" />
                </a>

                <div className="flex items-center gap-1 border-l border-border/50 pl-2">
                    <button
                        onClick={() => onEdit(link)}
                        className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors"
                        title="Edit"
                    >
                        <Pencil className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onDelete(link.id)}
                        className="p-2 rounded-lg text-text-muted hover:text-danger hover:bg-danger-dim transition-colors"
                        title="Delete"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
