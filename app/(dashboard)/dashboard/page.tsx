"use client";

import { useState, useEffect, useCallback } from "react";
import { LinkIcon, FileText, FileUp, ArrowRight, Clock, Sparkles, Plus } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import CopyButton from "@/components/ui/CopyButton";
import Badge from "@/components/ui/Badge";
import { useAuth } from "@/components/AuthProvider";

interface DashboardData {
    linksCount: number;
    snippetsCount: number;
    resumesCount: number;
    recentLinks: { id: string; label: string; url: string; category: string }[];
    recentSnippets: { id: string; title: string; body: string }[];
    recentResumes: { id: string; label: string; role_type?: string }[];
    displayName: string;
}

export default function DashboardPage() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();
    const { session, user } = useAuth();

    const fetchData = useCallback(async () => {
        if (!session || !user) return;

        // We can use the session directly for the token
        const headers = { Authorization: `Bearer ${session.access_token}` };

        const [linksRes, snippetsRes, resumesRes] = await Promise.allSettled([
            fetch("/api/links", { headers }),
            fetch("/api/snippets", { headers }),
            fetch("/api/resumes", { headers }),
        ]);

        const links =
            linksRes.status === "fulfilled" && linksRes.value.ok
                ? (await linksRes.value.json()).data || []
                : [];
        const snippets =
            snippetsRes.status === "fulfilled" && snippetsRes.value.ok
                ? (await snippetsRes.value.json()).data || []
                : [];
        const resumes =
            resumesRes.status === "fulfilled" && resumesRes.value.ok
                ? (await resumesRes.value.json()).data || []
                : [];

        const displayName =
            user.user_metadata?.display_name || user.email?.split("@")[0] || "there";

        setData({
            linksCount: links.length,
            snippetsCount: snippets.length,
            resumesCount: resumes.length,
            recentLinks: links.slice(0, 5),
            recentSnippets: snippets.slice(0, 3),
            recentResumes: resumes.slice(0, 3),
            displayName,
        });
        setLoading(false);
    }, [supabase, session, user]);

    useEffect(() => {
        if (session) {
            fetchData();
        }
    }, [fetchData, session]);



    if (loading) {
        return (
            <div className="animate-fade-in space-y-6 p-2">
                <div className="h-14 w-80 skeleton rounded-xl" />
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-36 skeleton rounded-xl" />
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="h-64 skeleton rounded-xl" />
                    <div className="h-64 skeleton rounded-xl" />
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in space-y-6">
            {/* ── Hero Welcome ── */}
            <div className="relative overflow-hidden bg-gradient-to-br from-surface via-surface to-accent/5 border border-border rounded-2xl p-6 sm:p-8">
                <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                <div className="relative">
                    <div className="flex items-center gap-2 text-accent text-sm font-medium mb-2">
                        <Sparkles className="w-4 h-4" />
                        <span>Welcome back</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-bold font-[family-name:var(--font-syne)] mb-2">
                        Hello, {data?.displayName} 👋
                    </h1>
                    <p className="text-base text-text-secondary max-w-lg">
                        You have <span className="text-text-primary font-semibold">
                            {[
                                (data?.linksCount || 0) > 0 && `${data?.linksCount} link${(data?.linksCount || 0) > 1 ? 's' : ''}`,
                                (data?.snippetsCount || 0) > 0 && `${data?.snippetsCount} snippet${(data?.snippetsCount || 0) > 1 ? 's' : ''}`,
                                (data?.resumesCount || 0) > 0 && `${data?.resumesCount} resume${(data?.resumesCount || 0) > 1 ? 's' : ''}`
                            ].filter(Boolean).join(", ").replace(/, ([^,]*)$/, ' and $1') || "0 items"}
                        </span> in your toolkit.
                        Everything ready for your next application.
                    </p>
                </div>
            </div>

            {/* ── Bento Stats Grid ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Links Card */}
                <Link
                    href="/links"
                    className="group relative overflow-hidden bg-surface border border-border rounded-2xl p-8 hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-300"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-11 h-11 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                                <LinkIcon className="w-5 h-5 text-emerald-400" />
                            </div>
                            <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
                        </div>
                        <p className="text-4xl font-bold font-[family-name:var(--font-syne)] mb-1">
                            {data?.linksCount || 0}
                        </p>
                        <p className="text-sm text-text-secondary font-medium">Links</p>
                    </div>
                </Link>

                {/* Snippets Card */}
                <Link
                    href="/snippets"
                    className="group relative overflow-hidden bg-surface border border-border rounded-2xl p-8 hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-11 h-11 rounded-xl bg-blue-500/15 flex items-center justify-center">
                                <FileText className="w-5 h-5 text-blue-400" />
                            </div>
                            <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" />
                        </div>
                        <p className="text-4xl font-bold font-[family-name:var(--font-syne)] mb-1">
                            {data?.snippetsCount || 0}
                        </p>
                        <p className="text-sm text-text-secondary font-medium">Snippets</p>
                    </div>
                </Link>

                {/* Resumes Card */}
                <Link
                    href="/resumes"
                    className="group relative overflow-hidden bg-surface border border-border rounded-2xl p-8 hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-11 h-11 rounded-xl bg-purple-500/15 flex items-center justify-center">
                                <FileUp className="w-5 h-5 text-purple-400" />
                            </div>
                            <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-purple-400 group-hover:translate-x-0.5 transition-all" />
                        </div>
                        <p className="text-4xl font-bold font-[family-name:var(--font-syne)] mb-1">
                            {data?.resumesCount || 0}
                        </p>
                        <p className="text-sm text-text-secondary font-medium">Resumes</p>
                    </div>
                </Link>

                {/* Quick Add Card */}
                <div className="bg-surface border border-dashed border-border rounded-2xl p-8 flex flex-col items-center justify-center gap-3 text-center">
                    <div className="w-11 h-11 rounded-xl bg-accent/10 flex items-center justify-center">
                        <Plus className="w-5 h-5 text-accent" />
                    </div>
                    <p className="text-sm text-text-secondary font-medium">Quick Add</p>
                    <div className="flex gap-2">
                        <Link href="/links" className="px-3 py-1.5 text-xs font-medium bg-surface-hover rounded-lg text-text-secondary hover:text-accent transition-colors">
                            Link
                        </Link>
                        <Link href="/snippets" className="px-3 py-1.5 text-xs font-medium bg-surface-hover rounded-lg text-text-secondary hover:text-accent transition-colors">
                            Snippet
                        </Link>
                    </div>
                </div>
            </div>

            {/* ── Bento Content Grid ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Recent Links Panel */}
                <div className="bg-surface border border-border rounded-2xl overflow-hidden">
                    <div className="flex items-center justify-between px-6 sm:px-7 py-5 border-b border-border">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                                <LinkIcon className="w-4 h-4 text-emerald-400" />
                            </div>
                            <h2 className="text-base font-semibold font-[family-name:var(--font-syne)]">
                                Recent Links
                            </h2>
                        </div>
                        <Link href="/links" className="text-xs text-accent hover:underline font-medium flex items-center gap-1">
                            View all <ArrowRight className="w-3 h-3" />
                        </Link>
                    </div>
                    <div className="divide-y divide-border">
                        {data?.recentLinks && data.recentLinks.length > 0 ? (
                            data.recentLinks.map((link) => (
                                <div
                                    key={link.id}
                                    className="flex items-center gap-3 px-6 sm:px-7 py-4 hover:bg-surface-hover/50 transition-colors"
                                >
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-text-primary truncate">{link.label}</p>
                                        <p className="text-xs text-text-muted font-[family-name:var(--font-jetbrains)] truncate mt-0.5">
                                            {link.url}
                                        </p>
                                    </div>
                                    <Badge>{link.category}</Badge>
                                    <CopyButton text={link.url} />
                                </div>
                            ))
                        ) : (
                            <div className="px-6 py-10 text-center">
                                <LinkIcon className="w-8 h-8 text-text-muted mx-auto mb-3 opacity-40" />
                                <p className="text-sm text-text-muted mb-3">No links yet</p>
                                <Link href="/links" className="inline-flex items-center gap-1.5 px-4 py-2 bg-accent/10 text-accent text-xs font-medium rounded-lg hover:bg-accent/20 transition-colors">
                                    <Plus className="w-3.5 h-3.5" /> Add your first link
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Activity Panel */}
                <div className="bg-surface border border-border rounded-2xl overflow-hidden">
                    <div className="flex items-center justify-between px-6 sm:px-7 py-5 border-b border-border">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-blue-500/15 flex items-center justify-center">
                                <Clock className="w-4 h-4 text-blue-400" />
                            </div>
                            <h2 className="text-base font-semibold font-[family-name:var(--font-syne)]">
                                Snippets & Resumes
                            </h2>
                        </div>
                    </div>
                    <div className="divide-y divide-border">
                        {data?.recentSnippets && data.recentSnippets.length > 0 ? (
                            data.recentSnippets.map((snippet) => (
                                <div
                                    key={`s-${snippet.id}`}
                                    className="flex items-center gap-3 px-6 sm:px-7 py-4 hover:bg-surface-hover/50 transition-colors"
                                >
                                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                                        <FileText className="w-4 h-4 text-blue-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-text-primary truncate">{snippet.title}</p>
                                        <p className="text-xs text-text-muted truncate mt-0.5">
                                            {snippet.body.substring(0, 60)}...
                                        </p>
                                    </div>
                                    <CopyButton text={snippet.body} />
                                </div>
                            ))
                        ) : null}

                        {data?.recentResumes && data.recentResumes.length > 0 ? (
                            data.recentResumes.map((resume) => (
                                <div
                                    key={`r-${resume.id}`}
                                    className="flex items-center gap-3 px-6 sm:px-7 py-4 hover:bg-surface-hover/50 transition-colors"
                                >
                                    <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
                                        <FileUp className="w-4 h-4 text-purple-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-text-primary truncate">{resume.label}</p>
                                    </div>
                                    {resume.role_type && (
                                        <Badge variant="accent">{resume.role_type}</Badge>
                                    )}
                                </div>
                            ))
                        ) : null}

                        {(!data?.recentSnippets?.length && !data?.recentResumes?.length) && (
                            <div className="px-6 py-10 text-center">
                                <FileText className="w-8 h-8 text-text-muted mx-auto mb-3 opacity-40" />
                                <p className="text-sm text-text-muted mb-3">No snippets or resumes yet</p>
                                <div className="flex items-center justify-center gap-2">
                                    <Link href="/snippets" className="inline-flex items-center gap-1.5 px-4 py-2 bg-accent/10 text-accent text-xs font-medium rounded-lg hover:bg-accent/20 transition-colors">
                                        <Plus className="w-3.5 h-3.5" /> Add snippet
                                    </Link>
                                    <Link href="/resumes" className="inline-flex items-center gap-1.5 px-4 py-2 bg-accent/10 text-accent text-xs font-medium rounded-lg hover:bg-accent/20 transition-colors">
                                        <Plus className="w-3.5 h-3.5" /> Add resume
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
