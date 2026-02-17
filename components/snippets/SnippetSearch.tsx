"use client";

import { Search } from "lucide-react";

interface SnippetSearchProps {
    search: string;
    onSearchChange: (value: string) => void;
    tags: string[];
    activeTag: string;
    onTagChange: (tag: string) => void;
}

export default function SnippetSearch({
    search,
    onSearchChange,
    tags,
    activeTag,
    onTagChange,
}: SnippetSearchProps) {
    return (
        <div className="space-y-3 mb-6">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                    type="text"
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Search snippets..."
                    className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 transition-all"
                />
            </div>

            {tags.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                        onClick={() => onTagChange("")}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors
              ${activeTag === ""
                                ? "bg-accent/15 text-accent"
                                : "bg-surface border border-border text-text-secondary hover:text-text-primary"
                            }`}
                    >
                        All
                    </button>
                    {tags.map((tag) => (
                        <button
                            key={tag}
                            onClick={() => onTagChange(tag)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors
                ${activeTag === tag
                                    ? "bg-accent/15 text-accent"
                                    : "bg-surface border border-border text-text-secondary hover:text-text-primary"
                                }`}
                        >
                            {tag}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
