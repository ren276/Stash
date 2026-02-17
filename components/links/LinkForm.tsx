"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

const categories = ["general", "professional", "portfolio", "social", "other"];

const quickTemplates = [
    { label: "GitHub", url: "https://github.com/", icon: "🐙", category: "professional" },
    { label: "LinkedIn", url: "https://linkedin.com/in/", icon: "💼", category: "professional" },
    { label: "Portfolio", url: "https://", icon: "🌐", category: "portfolio" },
    { label: "Twitter / X", url: "https://x.com/", icon: "𝕏", category: "social" },
    { label: "LeetCode", url: "https://leetcode.com/u/", icon: "🧩", category: "professional" },
    { label: "Personal Site", url: "https://", icon: "🏠", category: "portfolio" },
];

interface LinkFormData {
    label: string;
    url: string;
    category: string;
    icon?: string;
}

interface LinkFormProps {
    initial?: LinkFormData & { id: string };
    onSubmit: (data: LinkFormData) => Promise<void>;
    onCancel: () => void;
}

export default function LinkForm({ initial, onSubmit, onCancel }: LinkFormProps) {
    const [form, setForm] = useState<LinkFormData>({
        label: "",
        url: "",
        category: "general",
        icon: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (initial) {
            setForm({
                label: initial.label,
                url: initial.url,
                category: initial.category || "general",
                icon: initial.icon || "",
            });
        }
    }, [initial]);

    const handleQuickTemplate = (template: typeof quickTemplates[0]) => {
        setForm({
            label: template.label,
            url: template.url,
            category: template.category,
            icon: template.icon,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            await onSubmit(form);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong");
        }
        setLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {!initial && (
                <div>
                    <label className="block text-xs text-text-muted mb-2">Quick Add</label>
                    <div className="flex flex-wrap gap-1.5">
                        {quickTemplates.map((t) => (
                            <button
                                key={t.label}
                                type="button"
                                onClick={() => handleQuickTemplate(t)}
                                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-background border border-border text-xs text-text-secondary hover:border-accent/50 hover:text-accent transition-colors"
                            >
                                <span>{t.icon}</span>
                                {t.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">
                    Label *
                </label>
                <input
                    type="text"
                    value={form.label}
                    onChange={(e) => setForm({ ...form, label: e.target.value })}
                    placeholder="e.g. My GitHub Profile"
                    required
                    className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 transition-all"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">
                    URL *
                </label>
                <input
                    type="url"
                    value={form.url}
                    onChange={(e) => setForm({ ...form, url: e.target.value })}
                    placeholder="https://..."
                    required
                    className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm text-text-primary font-[family-name:var(--font-jetbrains)] placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 transition-all"
                />
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1.5">
                        Category
                    </label>
                    <select
                        value={form.category}
                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                        className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 transition-all appearance-none"
                    >
                        {categories.map((c) => (
                            <option key={c} value={c}>
                                {c.charAt(0).toUpperCase() + c.slice(1)}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1.5">
                        Icon (emoji)
                    </label>
                    <input
                        type="text"
                        value={form.icon}
                        onChange={(e) => setForm({ ...form, icon: e.target.value })}
                        placeholder="🔗"
                        maxLength={4}
                        className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 transition-all"
                    />
                </div>
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
                    {initial ? "Save Changes" : "Add Link"}
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
