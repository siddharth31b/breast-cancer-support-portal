import React from "react";
import { FileX, AlertTriangle, WifiOff, SearchX, Loader2 } from "lucide-react";

type EmptyStateVariant = "empty" | "error" | "no-results" | "offline" | "loading";

interface EmptyStateProps {
  variant?: EmptyStateVariant;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
}

const DEFAULTS: Record<EmptyStateVariant, { title: string; description: string; Icon: React.ComponentType<{ className?: string }> }> = {
  empty: {
    title: "Nothing here yet",
    description: "There's no data to display right now.",
    Icon: FileX,
  },
  error: {
    title: "Something went wrong",
    description: "We couldn't load this information. Please try again.",
    Icon: AlertTriangle,
  },
  "no-results": {
    title: "No results found",
    description: "Try adjusting your search or filter criteria.",
    Icon: SearchX,
  },
  offline: {
    title: "You appear to be offline",
    description: "Check your internet connection and try again.",
    Icon: WifiOff,
  },
  loading: {
    title: "Loading...",
    description: "Please wait while we fetch your data.",
    Icon: Loader2,
  },
};

export const EmptyState: React.FC<EmptyStateProps> = ({
  variant = "empty",
  title,
  description,
  action,
  icon: CustomIcon,
}) => {
  const defaults = DEFAULTS[variant];
  const Icon = CustomIcon ?? defaults.Icon;
  const displayTitle = title ?? defaults.title;
  const displayDescription = description ?? defaults.description;

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${
        variant === "error" ? "bg-red-50 text-red-400" :
        variant === "offline" ? "bg-amber-50 text-amber-400" :
        variant === "loading" ? "bg-primary/10 text-primary" :
        "bg-slate-100 text-slate-400"
      }`}>
        <Icon className={`w-7 h-7 ${variant === "loading" ? "animate-spin" : ""}`} />
      </div>
      <h3 className="text-sm font-bold text-slate-700 mb-1">{displayTitle}</h3>
      <p className="text-xs text-slate-400 max-w-xs leading-relaxed">{displayDescription}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
};

// ─── Skeleton loader ──────────────────────────────────────────────────────────

export const SkeletonCard: React.FC<{ lines?: number }> = ({ lines = 3 }) => (
  <div className="card-base p-5 animate-pulse">
    <div className="h-4 bg-slate-100 rounded w-1/3 mb-4" />
    {Array.from({ length: lines }).map((_, i) => (
      <div key={i} className={`h-3 bg-slate-100 rounded mb-2 ${i === lines - 1 ? "w-2/3" : "w-full"}`} />
    ))}
  </div>
);

export const SkeletonTable: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
  <div className="animate-pulse">
    <div className="h-4 bg-slate-100 rounded w-full mb-3" />
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="h-12 bg-slate-50 rounded mb-2" />
    ))}
  </div>
);
