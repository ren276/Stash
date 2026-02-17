interface BadgeProps {
    children: React.ReactNode;
    variant?: "default" | "accent" | "danger";
    className?: string;
}

export default function Badge({
    children,
    variant = "default",
    className = "",
}: BadgeProps) {
    const variants = {
        default:
            "bg-border/50 text-text-secondary",
        accent:
            "bg-accent/15 text-accent",
        danger:
            "bg-danger-dim text-danger",
    };

    return (
        <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}
        >
            {children}
        </span>
    );
}
