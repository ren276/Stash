"use client";

import { useState, useCallback, createContext, useContext } from "react";
import { CheckCircle, XCircle, Info, X } from "lucide-react";

interface Toast {
    id: string;
    message: string;
    type: "success" | "error" | "info";
}

interface ToastContextType {
    toast: (message: string, type?: Toast["type"]) => void;
}

const ToastContext = createContext<ToastContextType>({
    toast: () => { },
});

export function useToast() {
    return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = useCallback(
        (message: string, type: Toast["type"] = "success") => {
            const id = Math.random().toString(36).slice(2);
            setToasts((prev) => [...prev, { id, message, type }]);
            setTimeout(() => {
                setToasts((prev) => prev.filter((t) => t.id !== id));
            }, 3000);
        },
        []
    );

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const icons = {
        success: <CheckCircle className="w-4 h-4 text-accent" />,
        error: <XCircle className="w-4 h-4 text-danger" />,
        info: <Info className="w-4 h-4 text-blue-400" />,
    };

    return (
        <ToastContext.Provider value={{ toast: addToast }}>
            {children}
            <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
                {toasts.map((t) => (
                    <div
                        key={t.id}
                        className="flex items-center gap-3 px-4 py-3 bg-surface border border-border rounded-lg shadow-xl animate-slide-up min-w-[280px]"
                    >
                        {icons[t.type]}
                        <span className="text-sm text-text-primary flex-1">
                            {t.message}
                        </span>
                        <button
                            onClick={() => removeToast(t.id)}
                            className="text-text-muted hover:text-text-secondary transition-colors"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}
