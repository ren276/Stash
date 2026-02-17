"use client";

import { useState, useRef } from "react";
import { Upload, FileText, X, Loader2 } from "lucide-react";

interface ResumeUploadProps {
    onSubmit: (formData: FormData) => Promise<void>;
    onCancel: () => void;
}

export default function ResumeUpload({ onSubmit, onCancel }: ResumeUploadProps) {
    const [file, setFile] = useState<File | null>(null);
    const [label, setLabel] = useState("");
    const [roleType, setRoleType] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [dragOver, setDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFile = (f: File) => {
        if (f.type !== "application/pdf") {
            setError("Only PDF files are allowed");
            return;
        }
        if (f.size > 5 * 1024 * 1024) {
            setError("File must be under 5MB");
            return;
        }
        setError("");
        setFile(f);
        if (!label) {
            setLabel(f.name.replace(".pdf", ""));
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const f = e.dataTransfer.files[0];
        if (f) handleFile(f);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) {
            setError("Please select a file");
            return;
        }
        setError("");
        setLoading(true);

        const formData = new FormData();
        formData.append("file", file);
        formData.append("label", label);
        formData.append("role_type", roleType);

        try {
            await onSubmit(formData);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Upload failed");
        }
        setLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Dropzone */}
            <div
                onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors
          ${dragOver
                        ? "border-accent bg-accent/5"
                        : file
                            ? "border-accent/50 bg-accent/5"
                            : "border-border hover:border-border-hover"
                    }`}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleFile(f);
                    }}
                    className="hidden"
                />

                {file ? (
                    <div className="flex items-center justify-center gap-3">
                        <FileText className="w-8 h-8 text-accent" />
                        <div className="text-left">
                            <p className="text-sm font-medium text-text-primary">
                                {file.name}
                            </p>
                            <p className="text-xs text-text-muted">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                setFile(null);
                            }}
                            className="p-1 rounded text-text-muted hover:text-danger"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ) : (
                    <div>
                        <Upload className="w-8 h-8 text-text-muted mx-auto mb-2" />
                        <p className="text-sm text-text-secondary">
                            Drop your PDF here or{" "}
                            <span className="text-accent font-medium">browse</span>
                        </p>
                        <p className="text-xs text-text-muted mt-1">PDF only, max 5MB</p>
                    </div>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">
                    Label *
                </label>
                <input
                    type="text"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    placeholder="e.g. SWE Resume 2025"
                    required
                    className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 transition-all"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">
                    Role Type
                </label>
                <input
                    type="text"
                    value={roleType}
                    onChange={(e) => setRoleType(e.target.value)}
                    placeholder="e.g. Software Engineer, Product Manager"
                    className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 transition-all"
                />
            </div>

            {error && (
                <div className="px-3 py-2 bg-danger-dim border border-danger/20 rounded-lg text-sm text-danger">
                    {error}
                </div>
            )}

            <div className="flex items-center gap-3 pt-2">
                <button
                    type="submit"
                    disabled={loading || !file}
                    className="flex items-center gap-2 px-4 py-2 bg-accent text-background font-semibold text-sm rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-50"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Uploading...
                        </>
                    ) : (
                        <>
                            <Upload className="w-4 h-4" />
                            Upload Resume
                        </>
                    )}
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
