"use client";

import Link from "next/link";
import React, { useState } from "react";
import { 
  Check, 
  Trash2, 
  ChevronRight 
} from "lucide-react";
import { mockNotifications } from "../../mocks/patient-portal.mock";
import type { PortalNotification } from "../../types/patient-portal";


export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<PortalNotification[]>(mockNotifications);
  const [filter, setFilter] = useState<string>("All");

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const filtered = notifications.filter(n => {
    if (filter === "Unread") return !n.isRead;
    if (filter === "Important") return n.isImportant;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-xs flex justify-between items-center flex-wrap gap-4">
        <div className="flex gap-2">
          {(["All", "Unread", "Important"] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filter === f ? "bg-primary text-white" : "text-slate-500 hover:bg-slate-100"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <button
          onClick={markAllRead}
          className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
        >
          <Check className="w-3.5 h-3.5" /> Mark all as read
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filtered.map((n) => (
          <div
            key={n.id}
            className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
              !n.isRead
                ? "bg-teal-50/40 border-teal-200/80 shadow-2xs"
                : "bg-white border-slate-100 opacity-80"
            }`}
          >
            <div className="flex items-start gap-3 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                🔔
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-xs font-black text-slate-800">{n.title}</h4>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                    {n.category}
                  </span>
                  {n.isImportant && (
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-red-50 text-red-600">
                      Important
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed font-medium">{n.body}</p>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  {new Date(n.createdAt).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {n.actionUrl && (
                <Link href={n.actionUrl}
                  className="px-3 py-1.5 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-hover transition-colors flex items-center gap-1"
                >
                  {n.actionLabel || "View"} <ChevronRight className="w-3 h-3" />
                </Link>
              )}
              <button
                onClick={() => deleteNotification(n.id)}
                className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
