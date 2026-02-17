"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Search, LinkIcon, FileText, FileUp, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface SearchResult {
    type: "link" | "snippet" | "resume";
    id: string;
    title: string;
    subtitle: string;
    copyText?: string;
}

interface CommandPaletteProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function CommandPalette({
    isOpen,
    onClose,
}: CommandPaletteProps) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchResult[]>([]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [loading, setLoading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const supabase = createClient();

    // Open on Cmd+K / Ctrl+K
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault();
                if (isOpen) {
                    onClose();
                }
            }
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose]);

    // Focus input when opened
    useEffect(() => {
        if (isOpen) {
            setQuery("");
            setResults([]);
            setSelectedIndex(0);
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    // Search
    const search = useCallback(
        async (q: string) => {
            if (!q.trim()) {
                setResults([]);
                return;
            }

            setLoading(true);

            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                setLoading(false);
                return;
            }

            const token = session.access_token;
            const headers = {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            };

            try {
                const [linksRes, snippetsRes, resumesRes] = await Promise.allSettled([
                    fetch(`/api/links`, { headers }),
                    fetch(`/api/snippets?search=${encodeURIComponent(q)}`, { headers }),
                    fetch(`/api/resumes`, { headers }),
                ]);

                const allResults: SearchResult[] = [];

                if (linksRes.status === "fulfilled" && linksRes.value.ok) {
                    const links = await linksRes.value.json();
                    (links.data || [])
                        .filter(
                            (l: { label: string; url: string }) =>
                                l.label.toLowerCase().includes(q.toLowerCase()) ||
                                l.url.toLowerCase().includes(q.toLowerCase())
                        )
                        .slice(0, 5)
                        .forEach((l: { id: string; label: string; url: string }) => {
                            allResults.push({
                                type: "link",
                                id: l.id,
                                title: l.label,
                                subtitle: l.url,
                                copyText: l.url,
                            });
                        });
                }

                if (snippetsRes.status === "fulfilled" && snippetsRes.value.ok) {
                    const snippets = await snippetsRes.value.json();
                    (snippets.data || []).slice(0, 5).forEach(
                        (s: { id: string; title: string; body: string }) => {
                            allResults.push({
                                type: "snippet",
                                id: s.id,
                                title: s.title,
                                subtitle: s.body.substring(0, 80) + "...",
                                copyText: s.body,
                            });
                        }
                    );
                }

                if (resumesRes.status === "fulfilled" && resumesRes.value.ok) {
                    const resumes = await resumesRes.value.json();
                    (resumes.data || [])
                        .filter(
                            (r: { label: string; role_type?: string }) =>
                                r.label.toLowerCase().includes(q.toLowerCase()) ||
                                (r.role_type &&
                                    r.role_type.toLowerCase().includes(q.toLowerCase()))
                        )
                        .slice(0, 5)
                        .forEach(
                            (r: {
                                id: string;
                                label: string;
                                role_type?: string;
                            }) => {
                                allResults.push({
                                    type: "resume",
                                    id: r.id,
                                    title: r.label,
                                    subtitle: r.role_type || "Resume",
                                });
                            }
                        );
                }

                setResults(allResults);
                setSelectedIndex(0);
            } catch {
                // ignore
            }

            setLoading(false);
        },
        [supabase]
    );

    useEffect(() => {
        const timer = setTimeout(() => search(query), 300);
        return () => clearTimeout(timer);
    }, [query, search]);

    // Keyboard navigation
    const handleKeyDown = async (e: React.KeyboardEvent) => {
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setSelectedIndex((prev) => Math.max(prev - 1, 0));
        } else if (e.key === "Enter" && results[selectedIndex]) {
            e.preventDefault();
            const result = results[selectedIndex];
            if (result.type === "resume") {
                // Open resume preview
                const { data: { session } } = await supabase.auth.getSession();
                if (session) {
                    const res = await fetch(`/api/resumes/${result.id}/url`, {
                        headers: { Authorization: `Bearer ${session.access_token}` },
                    });
                    if (res.ok) {
                        const data = await res.json();
                        window.open(data.url, "_blank");
                    }
                }
            } else if (result.copyText) {
                await navigator.clipboard.writeText(result.copyText);
            }
            onClose();
        } else if (e.key === "Escape") {
            onClose();
        }
    };

    const typeIcons = {
        link: LinkIcon,
        snippet: FileText,
        resume: FileUp,
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[60] flex items-start justify-center pt-[20vh]"
            onClick={onClose}
        >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <div
                className="relative w-full max-w-xl bg-surface border border-border rounded-xl shadow-2xl animate-scale-in overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
                    <Search className="w-5 h-5 text-text-muted" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Search links, snippets, resumes..."
                        className="flex-1 bg-transparent text-text-primary text-sm placeholder:text-text-muted focus:outline-none"
                    />
                    <button
                        onClick={onClose}
                        className="p-1 rounded text-text-muted hover:text-text-secondary"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="max-h-[300px] overflow-y-auto">
                    {loading && (
                        <div className="px-4 py-6 text-center text-text-muted text-sm">
                            Searching...
                        </div>
                    )}

                    {!loading && query && results.length === 0 && (
                        <div className="px-4 py-6 text-center text-text-muted text-sm">
                            No results found
                        </div>
                    )}

                    {!loading && results.length > 0 && (
                        <div className="py-2">
                            {results.map((result, index) => {
                                const Icon = typeIcons[result.type];
                                return (
                                    <button
                                        key={`${result.type}-${result.id}`}
                                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors
                      ${index === selectedIndex
                                                ? "bg-accent/10"
                                                : "hover:bg-surface-hover"
                                            }`}
                                        onMouseEnter={() => setSelectedIndex(index)}
                                        onClick={async () => {
                                            if (result.type === "resume") {
                                                const { data: { session } } = await supabase.auth.getSession();
                                                if (session) {
                                                    const res = await fetch(`/api/resumes/${result.id}/url`, {
                                                        headers: { Authorization: `Bearer ${session.access_token}` },
                                                    });
                                                    if (res.ok) {
                                                        const data = await res.json();
                                                        window.open(data.url, "_blank");
                                                    }
                                                }
                                            } else if (result.copyText) {
                                                await navigator.clipboard.writeText(result.copyText);
                                            }
                                            onClose();
                                        }}
                                    >
                                        <Icon className="w-4 h-4 text-text-muted shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm text-text-primary truncate">
                                                {result.title}
                                            </div>
                                            <div className="text-xs text-text-muted truncate font-[family-name:var(--font-jetbrains)]">
                                                {result.subtitle}
                                            </div>
                                        </div>
                                        <span className="text-[10px] text-text-muted uppercase tracking-wider px-1.5 py-0.5 bg-border/50 rounded">
                                            {result.type}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {!query && (
                        <div className="px-4 py-6 text-center text-text-muted text-sm">
                            Start typing to search across all your items
                        </div>
                    )}
                </div>

                <div className="px-4 py-2 border-t border-border flex items-center justify-between text-[10px] text-text-muted">
                    <span>↑↓ Navigate</span>
                    <span>↵ Copy / Open</span>
                    <span>Esc Close</span>
                </div>
            </div>
        </div>
    );
}
