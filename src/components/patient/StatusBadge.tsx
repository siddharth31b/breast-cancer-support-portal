import React from "react";
import type { ReportStatus } from "../../types/patient-portal";

type BadgeVariant = ReportStatus | "Low" | "Moderate" | "High" | "Inconclusive" | "Completed" | "Pending" | "Active" | "Cancelled" | "Confirmed" | "Requested" | "Missed" | "Unread" | "Important" | string;

const VARIANT_STYLES: Record<string, string> = {
  "Uploaded":                   "bg-slate-50 text-slate-600 border-slate-200",
  "Processing":                 "bg-blue-50 text-blue-700 border-blue-200",
  "AI Reviewed":                "bg-violet-50 text-violet-700 border-violet-200",
  "Awaiting Doctor Review":     "bg-amber-50 text-amber-700 border-amber-200",
  "Doctor Reviewed":            "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Additional Information Required": "bg-red-50 text-red-700 border-red-200",
  "Low":                        "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Moderate":                   "bg-amber-50 text-amber-700 border-amber-200",
  "High":                       "bg-red-50 text-red-700 border-red-200",
  "Inconclusive":               "bg-slate-50 text-slate-600 border-slate-200",
  "Completed":                  "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Pending":                    "bg-amber-50 text-amber-700 border-amber-200",
  "Active":                     "bg-blue-50 text-blue-700 border-blue-200",
  "Cancelled":                  "bg-red-50 text-red-600 border-red-200",
  "Confirmed":                  "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Requested":                  "bg-slate-50 text-slate-600 border-slate-200",
  "Missed":                     "bg-red-50 text-red-600 border-red-200",
  "Unread":                     "bg-blue-50 text-blue-700 border-blue-200",
  "Important":                  "bg-red-50 text-red-700 border-red-200",
  "In Progress":                "bg-blue-50 text-blue-700 border-blue-200",
  "Rescheduled":                "bg-amber-50 text-amber-700 border-amber-200",
  "Delayed":                    "bg-orange-50 text-orange-700 border-orange-200",
};

const DOT_STYLES: Record<string, string> = {
  "Uploaded": "bg-slate-400",
  "Processing": "bg-blue-500 animate-pulse",
  "AI Reviewed": "bg-violet-500",
  "Awaiting Doctor Review": "bg-amber-500 animate-pulse",
  "Doctor Reviewed": "bg-emerald-500",
  "Additional Information Required": "bg-red-500",
  "Low": "bg-emerald-500",
  "Moderate": "bg-amber-500",
  "High": "bg-red-500",
  "Confirmed": "bg-emerald-500",
  "Active": "bg-blue-500 animate-pulse",
  "Missed": "bg-red-500",
  "In Progress": "bg-blue-500 animate-pulse",
};

interface StatusBadgeProps {
  status: BadgeVariant;
  showDot?: boolean;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, showDot = true, className = "" }) => {
  const style = VARIANT_STYLES[status] ?? "bg-slate-50 text-slate-600 border-slate-200";
  const dot = DOT_STYLES[status] ?? "bg-slate-400";

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${style} ${className}`}>
      {showDot && <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />}
      {status}
    </span>
  );
};
