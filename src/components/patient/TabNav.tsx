"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";


export interface TabItem {
  label: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface TabNavProps {
  tabs: TabItem[];
}

export const TabNav: React.FC<TabNavProps> = ({ tabs }) => {
  const pathname = usePathname();

  return (
    <div className="flex gap-1 bg-slate-100/80 rounded-2xl p-1 mb-6 overflow-x-auto flex-nowrap scrollbar-hide">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive =
          pathname === tab.href ||
          (tab.href !== "/" && pathname.startsWith(tab.href));

        return (
          <Link key={tab.href}
            href={tab.href}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap flex-shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary
              ${isActive
                ? "bg-white text-primary shadow-sm"
                : "text-slate-500 hover:text-slate-700 hover:bg-white/60"
              }`}
          >
            {Icon && <Icon className={`w-4 h-4 ${isActive ? "text-primary" : "text-slate-400"}`} />}
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
};
