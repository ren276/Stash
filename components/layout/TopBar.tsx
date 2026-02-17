"use client";

import { useState, useEffect } from "react";
import { Search, LogOut, Sun, Moon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/components/ThemeProvider";
import { useAuth } from "@/components/AuthProvider";

interface TopBarProps {
    onSearchOpen: () => void;
    onToggleSidebar: () => void;
}

export default function TopBar({ onSearchOpen, onToggleSidebar }: TopBarProps) {
    const { user, signOut } = useAuth();
    const router = useRouter();
    const { theme, toggleTheme } = useTheme();

    const userEmail = user?.email || "";

    const handleLogout = async () => {
        await signOut();
    };

    return (
        <header className="sticky top-0 z-30 bg-surface/80 backdrop-blur-xl border-b border-border" style={{ height: 60 }}>
            <div className="flex items-center gap-3 px-4 sm:px-6 h-full">
                {/* Hamburger */}
                <button
                    onClick={onToggleSidebar}
                    className="hidden md:flex items-center justify-center w-9 h-9 rounded-lg hover:bg-surface-hover transition-colors shrink-0"
                    title="Toggle sidebar"
                >
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                        <line x1="3" y1="4.5" x2="15" y2="4.5" />
                        <line x1="3" y1="9" x2="15" y2="9" />
                        <line x1="3" y1="13.5" x2="15" y2="13.5" />
                    </svg>
                </button>

                {/* Search */}
                <button
                    onClick={onSearchOpen}
                    className="flex items-center gap-2 flex-1 max-w-md px-3.5 py-2 rounded-xl bg-background border border-border text-text-muted text-sm hover:border-border-hover transition-colors"
                >
                    <Search className="w-4 h-4 shrink-0" />
                    <span className="hidden sm:inline">Search...</span>
                    <kbd className="hidden sm:inline-flex ml-auto text-[10px] px-1.5 py-0.5 border border-border rounded bg-surface text-text-muted">
                        ⌘K
                    </kbd>
                </button>

                <div className="flex-1" />

                {/* Theme Toggle */}
                <button
                    onClick={toggleTheme}
                    className="flex items-center justify-center w-9 h-9 rounded-xl bg-background border border-border text-text-secondary hover:text-text-primary hover:border-border-hover transition-all shrink-0"
                    title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
                >
                    {theme === "dark" ? (
                        <Sun className="w-4 h-4" />
                    ) : (
                        <Moon className="w-4 h-4" />
                    )}
                </button>

                {/* User */}
                {userEmail && (
                    <span className="hidden sm:block text-xs text-text-secondary truncate max-w-[180px]">
                        {userEmail}
                    </span>
                )}

                <button
                    onClick={handleLogout}
                    className="flex items-center justify-center w-9 h-9 rounded-xl text-text-secondary hover:text-danger hover:bg-danger-dim transition-colors shrink-0"
                    title="Sign out"
                >
                    <LogOut className="w-4 h-4" />
                </button>
            </div>
        </header>
    );
}
