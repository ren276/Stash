"use client";

import { useState } from "react";
import LinkCard from "./LinkCard";
import { Search, Filter } from "lucide-react";

const categories = ["all", "general", "professional", "portfolio", "social", "other"];

interface Link {
    id: string;
    label: string;
    url: string;
    icon?: string;
    category: string;
}

interface LinkGridProps {
    links: Link[];
    onEdit: (link: Link) => void;
    onDelete: (id: string) => void;
}

export default function LinkGrid({ links, onEdit, onDelete }: LinkGridProps) {
    const [activeCategory, setActiveCategory] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");

    const filtered = links.filter((link) => {
        const matchesCategory = activeCategory === "all" || link.category === activeCategory;
        const matchesSearch = link.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
            link.url.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="space-y-6">
            {/* Filters & Search */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-surface p-4 rounded-xl border border-border">
                {/* Categories */}
                <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 scrollbar-hide">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap
                            ${activeCategory === cat
                                    ? "bg-accent text-white shadow-lg shadow-accent/20"
                                    : "bg-background border border-border text-text-secondary hover:text-text-primary hover:border-border-hover"
                                }`}
                        >
                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Search */}
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                        type="text"
                        placeholder="Search links..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
                    />
                </div>
            </div>

            {/* Grid */}
            {filtered.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 stagger-children">
                    {filtered.map((link) => (
                        <div key={link.id} className="h-full">
                            <LinkCard
                                link={link}
                                onEdit={onEdit}
                                onDelete={onDelete}
                            />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 bg-surface/50 border border-dashed border-border rounded-xl">
                    <div className="w-16 h-16 rounded-2xl bg-surface border border-border flex items-center justify-center mb-4 shadow-sm">
                        <Filter className="w-8 h-8 text-text-muted/50" />
                    </div>
                    <h3 className="text-lg font-semibold font-[family-name:var(--font-syne)] mb-1">
                        No links found
                    </h3>
                    <p className="text-sm text-text-muted">
                        try adjusting your search or filters
                    </p>
                </div>
            )}
        </div>
    );
}
