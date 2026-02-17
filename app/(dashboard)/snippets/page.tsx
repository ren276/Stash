"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Plus, Search, Filter, FileText } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/Toast";
import Modal from "@/components/ui/Modal";
import SnippetCard from "@/components/snippets/SnippetCard";
import SnippetForm from "@/components/snippets/SnippetForm";
import CopyButton from "@/components/ui/CopyButton";
import { useAuth } from "@/components/AuthProvider";

interface Snippet {
    id: string;
    title: string;
    body: string;
    tags: string[];
}

export default function SnippetsPage() {
    const [snippets, setSnippets] = useState<Snippet[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [activeTag, setActiveTag] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [editingSnippet, setEditingSnippet] = useState<Snippet | null>(null);
    const [expandedSnippet, setExpandedSnippet] = useState<Snippet | null>(null);
    const { toast } = useToast();
    const supabase = createClient();
    const { session } = useAuth();

    const fetchSnippets = useCallback(async () => {
        if (!session) return;

        const url = search
            ? `/api/snippets?search=${encodeURIComponent(search)}`
            : "/api/snippets";

        const res = await fetch(url, {
            headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (res.ok) {
            const data = await res.json();
            setSnippets(data.data || []);
        }
        setLoading(false);
    }, [search, session]);

    useEffect(() => {
        const timer = setTimeout(() => fetchSnippets(), 300);
        return () => clearTimeout(timer);
    }, [fetchSnippets]);

    const allTags = useMemo(() => {
        const tagSet = new Set<string>();
        snippets.forEach((s) => s.tags?.forEach((t) => tagSet.add(t)));
        return Array.from(tagSet).sort();
    }, [snippets]);

    const filtered = useMemo(() => {
        if (!activeTag) return snippets;
        return snippets.filter((s) => s.tags?.includes(activeTag));
    }, [snippets, activeTag]);

    const handleCreate = async (data: {
        title: string;
        body: string;
        tags: string[];
    }) => {
        if (!session) return;

        const res = await fetch("/api/snippets", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${session.access_token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || "Failed to create snippet");
        }

        toast("Snippet added!");
        setModalOpen(false);
        fetchSnippets();
    };

    const handleUpdate = async (data: {
        title: string;
        body: string;
        tags: string[];
    }) => {
        if (!editingSnippet || !session) return;

        const res = await fetch(`/api/snippets/${editingSnippet.id}`, {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${session.access_token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || "Failed to update snippet");
        }

        toast("Snippet updated!");
        setEditingSnippet(null);
        fetchSnippets();
    };

    const handleDelete = async (id: string) => {
        if (!session) return;

        const res = await fetch(`/api/snippets/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${session.access_token}` },
        });

        if (res.ok) {
            toast("Snippet deleted");
            fetchSnippets();
        } else {
            toast("Failed to delete snippet", "error");
        }
    };

    return (
        <div className="animate-fade-in space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold font-[family-name:var(--font-syne)] mb-1">
                        Snippets
                    </h1>
                    <p className="text-text-secondary">
                        Save and search your text snippets
                    </p>
                </div>
                <button
                    onClick={() => setModalOpen(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-accent text-white font-semibold rounded-xl hover:bg-accent-hover transition-all shadow-lg shadow-accent/20"
                >
                    <Plus className="w-5 h-5" />
                    Add Snippet
                </button>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4 bg-surface p-4 rounded-xl border border-border">
                {/* Search */}
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                        type="text"
                        placeholder="Search title, content or tags..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
                    />
                </div>

                {/* Tags Filter */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide max-w-full sm:max-w-md">
                    <button
                        onClick={() => setActiveTag("")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap
                        ${activeTag === ""
                                ? "bg-accent/15 text-accent"
                                : "bg-background border border-border text-text-secondary hover:text-text-primary"
                            }`}
                    >
                        All Tags
                    </button>
                    {allTags.map(tag => (
                        <button
                            key={tag}
                            onClick={() => setActiveTag(tag)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap
                            ${activeTag === tag
                                    ? "bg-accent/15 text-accent"
                                    : "bg-background border border-border text-text-secondary hover:text-text-primary"
                                }`}
                        >
                            #{tag}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="h-48 skeleton break-inside-avoid" />
                    ))}
                </div>
            ) : filtered.length > 0 ? (
                <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6 stagger-children">
                    {filtered.map((snippet) => (
                        <div key={snippet.id} className="break-inside-avoid">
                            <SnippetCard
                                snippet={snippet}
                                onEdit={setEditingSnippet}
                                onDelete={handleDelete}
                                onExpand={setExpandedSnippet}
                            />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 bg-surface/50 border border-dashed border-border rounded-xl">
                    <div className="w-16 h-16 rounded-2xl bg-surface border border-border flex items-center justify-center mb-4 shadow-sm">
                        <FileText className="w-8 h-8 text-text-muted/50" />
                    </div>
                    <h3 className="text-lg font-semibold font-[family-name:var(--font-syne)] mb-1">
                        No snippets found
                    </h3>
                    <p className="text-sm text-text-muted">
                        {search ? "Try a different search term" : "Create your first snippet to get started"}
                    </p>
                </div>
            )}

            {/* Modals remain the same... */}
            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title="Add Snippet"
                maxWidth="max-w-xl"
            >
                <SnippetForm
                    onSubmit={handleCreate}
                    onCancel={() => setModalOpen(false)}
                />
            </Modal>

            <Modal
                isOpen={!!editingSnippet}
                onClose={() => setEditingSnippet(null)}
                title="Edit Snippet"
                maxWidth="max-w-xl"
            >
                {editingSnippet && (
                    <SnippetForm
                        initial={editingSnippet}
                        onSubmit={handleUpdate}
                        onCancel={() => setEditingSnippet(null)}
                    />
                )}
            </Modal>

            <Modal
                isOpen={!!expandedSnippet}
                onClose={() => setExpandedSnippet(null)}
                title={expandedSnippet?.title || ""}
                maxWidth="max-w-2xl"
            >
                {expandedSnippet && (
                    <div>
                        <pre className="text-sm text-text-secondary whitespace-pre-wrap font-[family-name:var(--font-jetbrains)] bg-background border border-border rounded-lg p-4 max-h-[60vh] overflow-y-auto mb-4 scrollbar-thin">
                            {expandedSnippet.body}
                        </pre>
                        <div className="flex items-center gap-3 justify-end">
                            {expandedSnippet.tags?.length > 0 && (
                                <div className="flex flex-wrap gap-1 mr-auto">
                                    {expandedSnippet.tags.map((tag) => (
                                        <span
                                            key={tag}
                                            className="px-2 py-0.5 bg-accent/10 text-accent rounded-full text-xs font-medium"
                                        >
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                            <CopyButton
                                text={expandedSnippet.body}
                                label="Copy Snippet"
                                variant="button"
                                className="bg-accent text-white hover:bg-accent-hover border-transparent"
                            />
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
