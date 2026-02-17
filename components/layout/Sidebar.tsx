"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    LinkIcon,
    FileText,
    FileUp,
    Briefcase,
    ChevronsLeft,
    ChevronsRight,
} from "lucide-react";

const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/links", label: "Links", icon: LinkIcon },
    { href: "/snippets", label: "Snippets", icon: FileText },
    { href: "/resumes", label: "Resumes", icon: FileUp },
];

interface SidebarProps {
    collapsed: boolean;
    onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
    const pathname = usePathname();

    return (
        <>
            {/* Desktop Sidebar */}
            <aside
                className="hidden md:flex flex-col h-screen fixed left-0 top-0 bg-surface border-r border-border z-40 transition-all duration-300 ease-in-out overflow-hidden"
                style={{ width: collapsed ? 68 : 256 }}
            >
                {/* Logo */}
                <div className="flex items-center h-[60px] border-b border-border shrink-0" style={{ padding: collapsed ? '0 14px' : '0 20px' }}>
                    <div className="w-9 h-9 rounded-xl bg-accent/20 flex items-center justify-center shrink-0">
                        <Briefcase className="w-[18px] h-[18px] text-accent" />
                    </div>
                    {!collapsed && (
                        <span className="ml-3 text-lg font-bold font-[family-name:var(--font-syne)] tracking-tight whitespace-nowrap">
                            Stash
                        </span>
                    )}
                </div>

                {/* Nav Items */}
                <nav className="flex-1 py-4 space-y-1 overflow-y-auto overflow-x-hidden" style={{ padding: collapsed ? '16px 10px' : '16px 12px' }}>
                    {navItems.map((item) => {
                        const isActive =
                            pathname === item.href ||
                            (item.href !== "/dashboard" && pathname.startsWith(item.href));
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                title={item.label}
                                className={`flex items-center rounded-xl text-sm font-medium transition-all duration-200 group
                                    ${isActive
                                        ? "bg-accent/10 text-accent"
                                        : "text-text-secondary hover:text-text-primary hover:bg-surface-hover"
                                    }`}
                                style={{
                                    padding: collapsed ? '10px 0' : '10px 14px',
                                    justifyContent: collapsed ? 'center' : 'flex-start',
                                    gap: collapsed ? 0 : 12,
                                }}
                            >
                                <item.icon
                                    className={`shrink-0 transition-colors ${isActive
                                        ? "text-accent"
                                        : "text-text-muted group-hover:text-text-secondary"
                                        }`}
                                    style={{ width: 20, height: 20 }}
                                />
                                {!collapsed && (
                                    <span className="font-[family-name:var(--font-syne)] whitespace-nowrap text-[13px]">
                                        {item.label}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Collapse Toggle */}
                <div className="border-t border-border shrink-0" style={{ padding: collapsed ? '12px 10px' : '12px' }}>
                    <button
                        onClick={onToggle}
                        className="flex items-center w-full rounded-xl text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors"
                        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                        style={{
                            padding: collapsed ? '10px 0' : '10px 14px',
                            justifyContent: collapsed ? 'center' : 'flex-start',
                            gap: collapsed ? 0 : 10,
                        }}
                    >
                        {collapsed ? (
                            <ChevronsRight className="w-5 h-5" />
                        ) : (
                            <>
                                <ChevronsLeft className="w-5 h-5" />
                                <span className="text-xs font-medium whitespace-nowrap">Collapse</span>
                            </>
                        )}
                    </button>
                </div>
            </aside>

            {/* Mobile Bottom Nav */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface/95 backdrop-blur-md border-t border-border z-50">
                <div className="flex items-center justify-around px-1 py-1.5" style={{ paddingBottom: "max(8px, env(safe-area-inset-bottom))" }}>
                    {navItems.map((item) => {
                        const isActive =
                            pathname === item.href ||
                            (item.href !== "/dashboard" && pathname.startsWith(item.href));
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex flex-col items-center gap-0.5 min-w-[56px] px-2 py-1.5 rounded-lg text-[11px] transition-colors
                                    ${isActive
                                        ? "text-accent"
                                        : "text-text-muted active:text-text-secondary"
                                    }`}
                            >
                                <item.icon className={`w-5 h-5 ${isActive ? "text-accent" : ""}`} />
                                <span className="truncate">{item.label}</span>
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </>
    );
}
