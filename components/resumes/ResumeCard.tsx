"use client";

import { Eye, Download, Trash2, FileText, Calendar } from "lucide-react";
import Badge from "@/components/ui/Badge";
import { useState } from "react";

interface Resume {
    id: string;
    label: string;
    role_type?: string;
    created_at: string;
}

interface ResumeCardProps {
    resume: Resume;
    onPreview: (id: string) => void;
    onDownload: (id: string) => void;
    onDelete: (id: string) => void;
}

export default function ResumeCard({
    resume,
    onPreview,
    onDownload,
    onDelete,
}: ResumeCardProps) {
    const [showActions, setShowActions] = useState(false);

    const date = new Date(resume.created_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });

    return (
        <div
            className="group relative bg-surface border border-border rounded-xl p-8 hover:border-accent/30 hover:shadow-lg hover:shadow-accent/5 transition-all duration-300 flex flex-col h-full"
            onMouseEnter={() => setShowActions(true)}
            onMouseLeave={() => setShowActions(false)}
        >
            <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center shrink-0 border border-accent/20">
                    <FileText className="w-6 h-6 text-accent" />
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2 mb-1">
                        <h3 className="font-semibold font-[family-name:var(--font-syne)] text-lg text-text-primary truncate">
                            {resume.label}
                        </h3>
                        {resume.role_type && (
                            <Badge variant="accent" className="capitalize text-[10px] px-2 py-0.5">
                                {resume.role_type}
                            </Badge>
                        )}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-text-muted">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Uploaded on {date}</span>
                    </div>
                </div>
            </div>

            <div className="mt-auto pt-4 flex items-center gap-2 border-t border-border/50">
                <button
                    onClick={() => onPreview(resume.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-accent/10 text-accent hover:bg-accent hover:text-white transition-colors"
                >
                    <Eye className="w-4 h-4" />
                    Preview
                </button>
                <button
                    onClick={() => onDownload(resume.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-surface border border-border text-text-secondary hover:text-text-primary hover:border-border-hover transition-colors"
                >
                    <Download className="w-4 h-4" />
                    Download
                </button>
                <button
                    onClick={() => onDelete(resume.id)}
                    className="p-2 rounded-lg text-text-muted hover:text-danger hover:bg-danger-dim transition-colors ml-1"
                    title="Delete"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
