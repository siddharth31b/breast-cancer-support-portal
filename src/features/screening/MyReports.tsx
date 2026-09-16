"use client";

import Link from "next/link";
import React, { useState } from "react";
import { 
  Search, 
  Eye, 
  Trash2, 
  FileText, 
  Plus, 
  Grid, 
  List,
  ChevronRight,
  X
} from "lucide-react";
import { mockReports } from "../../mocks/patient-portal.mock";
import type { PatientReport } from "../../types/patient-portal";
import { StatusBadge } from "../../components/patient/StatusBadge";


export const MyReports: React.FC = () => {
  const [reports, setReports] = useState<PatientReport[]>(mockReports);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [selectedReport, setSelectedReport] = useState<PatientReport | null>(null);

  const filteredReports = reports.filter((r) => {
    const matchesSearch = r.title.toLowerCase().includes(search.toLowerCase()) || r.fileName.toLowerCase().includes(search.toLowerCase());
    const matchesCat = categoryFilter === "All" || r.category === categoryFilter;
    const matchesStatus = statusFilter === "All" || r.status === statusFilter;
    return matchesSearch && matchesCat && matchesStatus;
  });

  const handleDelete = (id: string) => {
    setReports(prev => prev.filter(r => r.id !== id));
    if (selectedReport?.id === id) setSelectedReport(null);
  };

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-xs flex flex-wrap gap-3 items-center justify-between">
        {/* Search */}
        <div className="relative min-w-[200px] flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search reports..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Category Filter */}
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white text-slate-700 font-medium focus:outline-hidden"
        >
          <option value="All">All Categories</option>
          <option value="Breast Imaging">Breast Imaging</option>
          <option value="General Imaging">General Imaging</option>
          <option value="Pathology & Laboratory">Pathology & Lab</option>
          <option value="Clinical Documents">Clinical Documents</option>
          <option value="Other">Other</option>
        </select>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white text-slate-700 font-medium focus:outline-hidden"
        >
          <option value="All">All Statuses</option>
          <option value="Uploaded">Uploaded</option>
          <option value="Processing">Processing</option>
          <option value="AI Reviewed">AI Reviewed</option>
          <option value="Doctor Reviewed">Doctor Reviewed</option>
        </select>

        {/* View mode toggle */}
        <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
          <button
            onClick={() => setViewMode("list")}
            className={`p-1.5 rounded-lg text-xs font-semibold ${viewMode === "list" ? "bg-white text-primary shadow-xs" : "text-slate-500"}`}
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={`p-1.5 rounded-lg text-xs font-semibold ${viewMode === "grid" ? "bg-white text-primary shadow-xs" : "text-slate-500"}`}
          >
            <Grid className="w-4 h-4" />
          </button>
        </div>

        <Link href="/patient/screening/upload"
          className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl shadow-xs hover:bg-primary-hover transition-colors flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          Upload New
        </Link>
      </div>

      {/* Reports View */}
      {filteredReports.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center text-slate-500 text-xs">
          No reports match your filters. Try clearing search or filters.
        </div>
      ) : viewMode === "list" ? (
        <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-extrabold uppercase tracking-wider text-[10px]">
                  <th className="p-4">Report Title</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Uploaded</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Source</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReports.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 font-bold text-slate-800 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-primary shrink-0" />
                      <span className="truncate max-w-xs">{r.title}</span>
                    </td>
                    <td className="p-4 text-slate-600 font-medium">{r.category}</td>
                    <td className="p-4 text-slate-500">{new Date(r.uploadedAt).toLocaleDateString()}</td>
                    <td className="p-4"><StatusBadge status={r.status} /></td>
                    <td className="p-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        r.source === "Patient Uploaded" ? "bg-slate-100 text-slate-600" :
                        r.source === "AI Generated" ? "bg-violet-50 text-violet-700" :
                        "bg-teal-50 text-teal-700"
                      }`}>
                        {r.source}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-1 whitespace-nowrap">
                      <button
                        onClick={() => setSelectedReport(r)}
                        className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-primary transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {r.source === "Patient Uploaded" && (
                        <button
                          onClick={() => handleDelete(r.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                          title="Delete File"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filteredReports.map((r) => (
            <div key={r.id} className="bg-white border border-slate-100 rounded-2xl p-4 shadow-xs flex flex-col justify-between space-y-3">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{r.category}</span>
                  <StatusBadge status={r.status} />
                </div>
                <h4 className="text-sm font-black text-slate-800 leading-snug">{r.title}</h4>
                <p className="text-[11px] text-slate-500 mt-1">{r.fileName} • {r.fileSizeMb} MB</p>
              </div>
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] text-slate-400">{new Date(r.uploadedAt).toLocaleDateString()}</span>
                <button
                  onClick={() => setSelectedReport(r)}
                  className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                >
                  View Details <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Report Detail Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4 relative">
            <button
              onClick={() => setSelectedReport(null)}
              className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              <h3 className="text-base font-black text-slate-800">{selectedReport.title}</h3>
            </div>
            <div className="space-y-2 text-xs text-slate-600 bg-slate-50 p-4 rounded-xl">
              <div className="flex justify-between"><span className="text-slate-400">Category:</span><span className="font-bold">{selectedReport.category}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Type:</span><span className="font-bold">{selectedReport.reportType}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">File Name:</span><span className="font-bold">{selectedReport.fileName}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Uploaded:</span><span className="font-bold">{new Date(selectedReport.uploadedAt).toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Source:</span><span className="font-bold">{selectedReport.source}</span></div>
              {selectedReport.reviewedBy && (
                <div className="flex justify-between"><span className="text-slate-400">Reviewed By:</span><span className="font-bold text-emerald-700">{selectedReport.reviewedBy}</span></div>
              )}
            </div>

            {selectedReport.source !== "Patient Uploaded" && (
              <p className="text-[11px] text-slate-400 italic">
                Hospital and doctor-authored reports are read-only and cannot be modified by patients.
              </p>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedReport(null)}
                className="px-4 py-2 border border-slate-200 text-slate-600 font-bold text-xs rounded-xl hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
