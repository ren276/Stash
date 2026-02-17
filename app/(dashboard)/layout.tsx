"use client";

import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import CommandPalette from "@/components/layout/CommandPalette";
import { ToastProvider } from "@/components/ui/Toast";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    return (
        <ToastProvider>
            <div className="min-h-screen bg-background">
                <Sidebar
                    collapsed={sidebarCollapsed}
                    onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
                />

                {/* Main content area — offset by sidebar width */}
                <div
                    className="min-h-screen flex flex-col transition-[margin] duration-300 ease-in-out md:ml-64"
                    style={{
                        marginLeft: undefined,
                    }}
                    data-sidebar-collapsed={sidebarCollapsed}
                >
                    <TopBar
                        onSearchOpen={() => setCommandPaletteOpen(true)}
                        onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
                    />
                    <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-8 md:py-10 pb-24">
                        <div className="w-full max-w-6xl mx-auto space-y-8">{children}</div>
                    </main>
                </div>

                <CommandPalette
                    isOpen={commandPaletteOpen}
                    onClose={() => setCommandPaletteOpen(false)}
                />
            </div>

            {/* Dynamic sidebar offset style */}
            <style jsx global>{`
                @media (min-width: 768px) {
                    [data-sidebar-collapsed="false"] {
                        margin-left: 256px !important;
                    }
                    [data-sidebar-collapsed="true"] {
                        margin-left: 68px !important;
                    }
                }
            `}</style>
        </ToastProvider>
    );
}
