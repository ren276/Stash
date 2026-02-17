"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/Toast";
import Modal from "@/components/ui/Modal";
import LinkGrid from "@/components/links/LinkGrid";
import LinkForm from "@/components/links/LinkForm";
import { useAuth } from "@/components/AuthProvider";

interface Link {
    id: string;
    label: string;
    url: string;
    icon?: string;
    category: string;
}

export default function LinksPage() {
    const [links, setLinks] = useState<Link[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingLink, setEditingLink] = useState<Link | null>(null);
    const { toast } = useToast();
    const supabase = createClient();
    const { session } = useAuth();

    const fetchLinks = useCallback(async () => {
        if (!session) return;

        const res = await fetch("/api/links", {
            headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (res.ok) {
            const data = await res.json();
            setLinks(data.data || []);
        }
        setLoading(false);
    }, [session]);

    useEffect(() => {
        if (session) fetchLinks();
    }, [fetchLinks, session]);

    const handleCreate = async (formData: {
        label: string;
        url: string;
        category: string;
        icon?: string;
    }) => {
        if (!session) return;

        const res = await fetch("/api/links", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${session.access_token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || "Failed to create link");
        }

        toast("Link added!");
        setModalOpen(false);
        fetchLinks();
    };

    const handleUpdate = async (formData: {
        label: string;
        url: string;
        category: string;
        icon?: string;
    }) => {
        if (!editingLink || !session) return;

        const res = await fetch(`/api/links/${editingLink.id}`, {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${session.access_token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || "Failed to update link");
        }

        toast("Link updated!");
        setEditingLink(null);
        fetchLinks();
    };

    const handleDelete = async (id: string) => {
        if (!session) return;

        const res = await fetch(`/api/links/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${session.access_token}` },
        });

        if (res.ok) {
            toast("Link deleted");
            fetchLinks();
        } else {
            toast("Failed to delete link", "error");
        }
    };

    return (
        <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold font-[family-name:var(--font-syne)]">
                        Links
                    </h1>
                    <p className="text-sm text-text-secondary mt-1">
                        Store and organize your important URLs
                    </p>
                </div>
                <button
                    onClick={() => setModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-accent text-background font-semibold text-sm rounded-lg hover:bg-accent-hover transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Add Link
                </button>
            </div>

            {loading ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="h-36 skeleton" />
                    ))}
                </div>
            ) : (
                <LinkGrid
                    links={links}
                    onEdit={(link) => setEditingLink(link)}
                    onDelete={handleDelete}
                />
            )}

            {/* Add Modal */}
            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title="Add Link"
            >
                <LinkForm onSubmit={handleCreate} onCancel={() => setModalOpen(false)} />
            </Modal>

            {/* Edit Modal */}
            <Modal
                isOpen={!!editingLink}
                onClose={() => setEditingLink(null)}
                title="Edit Link"
            >
                {editingLink && (
                    <LinkForm
                        initial={editingLink}
                        onSubmit={handleUpdate}
                        onCancel={() => setEditingLink(null)}
                    />
                )}
            </Modal>
        </div>
    );
}
