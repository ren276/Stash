"use client";

import { useState, useCallback } from "react";
import { Check, Copy } from "lucide-react";

interface CopyButtonProps {
    text: string;
    label?: string;
    variant?: "icon" | "button";
    className?: string;
}

export default function CopyButton({
    text,
    label,
    variant = "icon",
    className = "",
}: CopyButtonProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            console.error("Failed to copy");
        }
    }, [text]);

    if (variant === "button") {
        return (
            <button
                onClick={handleCopy}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150
          ${copied
                        ? "bg-accent/20 text-accent"
                        : "bg-surface border border-border text-text-secondary hover:text-accent hover:border-accent/50"
                    } ${className}`}
            >
                {copied ? (
                    <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Copied!</span>
                    </>
                ) : (
                    <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>{label || "Copy"}</span>
                    </>
                )}
            </button>
        );
    }

    return (
        <button
            onClick={handleCopy}
            className={`p-1.5 rounded-md transition-all duration-150
        ${copied
                    ? "text-accent bg-accent/20"
                    : "text-text-secondary hover:text-accent hover:bg-accent/10"
                } ${className}`}
            title={copied ? "Copied!" : label || "Copy"}
        >
            {copied ? (
                <Check className="w-4 h-4" />
            ) : (
                <Copy className="w-4 h-4" />
            )}
        </button>
    );
}
