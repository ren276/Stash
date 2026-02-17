"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

interface SnippetFormData {
    title: string;
    body: string;
    tags: string[];
}

interface SnippetFormProps {
    initial?: SnippetFormData & { id: string };
    onSubmit: (data: SnippetFormData) => Promise<void>;
    onCancel: () => void;
}

export default function SnippetForm({
    initial,
    onSubmit,
    onCancel,
}: SnippetFormProps) {
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [tagsInput, setTagsInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (initial) {
            setTitle(initial.title);
            setBody(initial.body);
            setTagsInput((initial.tags || []).join(", "));
        }
    }, [initial]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        const tags = tagsInput
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean);

        try {
            await onSubmit({ title, body, tags });
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong");
        }
        setLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">
                    Title *
                </label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Cover Letter Opening"
                    required
                    className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 transition-all"
                />
            </div>

            <div>
                <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-sm font-medium text-text-secondary">
                        Body *
                    </label>
                    <span className="text-xs text-text-muted">
                        {body.length} / 10,000
                    </span>
                </div>
                <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Paste or type your text snippet here..."
                    required
                    rows={8}
                    maxLength={10000}
                    className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm text-text-primary font-[family-name:var(--font-jetbrains)] placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 transition-all resize-y"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">
                    Tags (comma-separated)
                </label>
                <input
                    type="text"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    placeholder="e.g. cover-letter, intro, engineering"
                    className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 transition-all"
                />
                {tagsInput && (
                    <div className="flex flex-wrap gap-1 mt-2">
                        {tagsInput
                            .split(",")
                            .map((t) => t.trim())
                            .filter(Boolean)
                            .map((tag) => (
                                <span
                                    key={tag}
                                    className="px-2 py-0.5 bg-accent/15 text-accent rounded-full text-xs"
                                >
                                    {tag}
                                </span>
                            ))}
                    </div>
                )}
            </div>

            {error && (
                <div className="px-3 py-2 bg-danger-dim border border-danger/20 rounded-lg text-sm text-danger">
                    {error}
                </div>
            )}

            <div className="flex items-center gap-3 pt-2">
                <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-accent text-background font-semibold text-sm rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-50"
                >
                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                    {initial ? "Save Changes" : "Add Snippet"}
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
                >
                    Cancel
                </button>
            </div>
        </form>
    );
}
