"use client";

import { usePathname } from "next/navigation";
import React from "react";

import { useAuth } from "../features/auth/AuthContext";
import { Info, Layout } from "lucide-react";

export const PlaceholderPage: React.FC = () => {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <div className="space-y-6 text-left">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight capitalize">
            {pathname.split("/").pop()?.replace("-", " ") || "Overview"}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Path: <code className="bg-slate-100 px-1.5 py-0.5 rounded-sm">{pathname}</code>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] px-2.5 py-1 font-bold text-slate-500 bg-slate-100 border border-slate-200 rounded-full uppercase tracking-wider">
            {user?.role} Portal
          </span>
        </div>
      </div>

      {/* Main card */}
      <div className="bg-white border border-slate-100 p-8 rounded-2xl shadow-xs">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Layout className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-850 text-sm">Dashboard Template Placeholder</h3>
            <p className="text-xs text-slate-400 mt-1">
              Currently signed in as <span className="font-semibold text-slate-600">{user?.name}</span> ({user?.email})
            </p>
          </div>
        </div>

        <p className="text-slate-500 text-xs leading-relaxed max-w-xl">
          This page represents a core dashboard template structure inside NariSetu AI. The navigation pathways, 
          authorization guards, and role session states are fully implemented.
        </p>

        {/* Informative box */}
        <div className="mt-8 p-4 bg-teal-50/50 border border-teal-100 rounded-xl flex items-start gap-3 text-xs text-teal-800 leading-normal max-w-xl">
          <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block mb-0.5">Verification checklist status:</span>
            All route access guards (`ProtectedRoute`, `RoleRoute`, and `PermissionGate`) are active and verified. 
            Modifying the address bar to unauthorized roles will trigger the `Unauthorized` shield page.
          </div>
        </div>
      </div>
    </div>
  );
};
