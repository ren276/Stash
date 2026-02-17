"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Search, FileText } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/Toast";
import Modal from "@/components/ui/Modal";
import ResumeCard from "@/components/resumes/ResumeCard";
import ResumeUpload from "@/components/resumes/ResumeUpload";
import { useAuth } from "@/components/AuthProvider";

interface Resume {
    id: string;
    label: string;
    role_type?: string;
    created_at: string;
}

export default function ResumesPage() {
    const [resumes, setResumes] = useState<Resume[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploadOpen, setUploadOpen] = useState(false);
    const [search, setSearch] = useState("");
    const { toast } = useToast();
    const supabase = createClient();
    const { session } = useAuth();

    const fetchResumes = useCallback(async () => {
        if (!session) return;

        const res = await fetch("/api/resumes", {
            headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (res.ok) {
            const data = await res.json();
            setResumes(data.data || []);
        }
        setLoading(false);
    }, [session]);

    useEffect(() => {
        if (session) fetchResumes();
    }, [fetchResumes, session]);

    const getSignedUrl = async (id: string): Promise<string | null> => {
        if (!session) return null;

        const res = await fetch(`/api/resumes/${id}/url`, {
            headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (res.ok) {
            const data = await res.json();
            return data.url;
        }
        return null;
    };

    const handlePreview = async (id: string) => {
        const url = await getSignedUrl(id);
        if (url) {
            window.open(url, "_blank");
        } else {
            toast("Failed to generate preview URL", "error");
        }
    };

    const handleDownload = async (id: string) => {
        const url = await getSignedUrl(id);
        if (url) {
            const a = document.createElement("a");
            a.href = url;
            a.download = "resume.pdf";
            a.click();
        } else {
            toast("Failed to generate download URL", "error");
        }
    };

    const handleUpload = async (formData: FormData) => {
        if (!session) return;

        const res = await fetch("/api/resumes", {
            method: "POST",
            headers: { Authorization: `Bearer ${session.access_token}` },
            body: formData,
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || "Upload failed");
        }

        toast("Resume uploaded!");
        setUploadOpen(false);
        fetchResumes();
    };

    const handleDelete = async (id: string) => {
        if (!session) return;

        const res = await fetch(`/api/resumes/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${session.access_token}` },
        });

        if (res.ok) {
            toast("Resume deleted");
            fetchResumes();
        } else {
            toast("Failed to delete resume", "error");
        }
    };

    const filtered = resumes.filter((r) =>
        r.label.toLowerCase().includes(search.toLowerCase()) ||
        (r.role_type && r.role_type.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div className="animate-fade-in space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold font-[family-name:var(--font-syne)] mb-1">
                        Resumes
                    </h1>
                    <p className="text-text-secondary">
                        Manage your resume files securely
                    </p>
                </div>
                <button
                    onClick={() => setUploadOpen(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-accent text-white font-semibold rounded-xl hover:bg-accent-hover transition-all shadow-lg shadow-accent/20"
                >
                    <Plus className="w-5 h-5" />
                    Upload Resume
                </button>
            </div>

            {/* Search */}
            <div className="bg-surface p-4 rounded-xl border border-border">
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                        type="text"
                        placeholder="Search resumes..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
                    />
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-48 skeleton" />
                    ))}
                </div>
            ) : filtered.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
                    {filtered.map((resume) => (
                        <ResumeCard
                            key={resume.id}
                            resume={resume}
                            onPreview={handlePreview}
                            onDownload={handleDownload}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 bg-surface/50 border border-dashed border-border rounded-xl">
                    <div className="w-16 h-16 rounded-2xl bg-surface border border-border flex items-center justify-center mb-4 shadow-sm">
                        <FileText className="w-8 h-8 text-text-muted/50" />
                    </div>
                    <h3 className="text-lg font-semibold font-[family-name:var(--font-syne)] mb-1">
                        No resumes found
                    </h3>
                    <p className="text-sm text-text-muted">
                        {search ? "Try a different search term" : "Upload your first resume to get started"}
                    </p>
                </div>
            )}

            <Modal
                isOpen={uploadOpen}
                onClose={() => setUploadOpen(false)}
                title="Upload Resume"
                maxWidth="max-w-lg"
            >
                <ResumeUpload
                    onSubmit={handleUpload}
                    onCancel={() => setUploadOpen(false)}
                />
            </Modal>
        </div>
    );
}
