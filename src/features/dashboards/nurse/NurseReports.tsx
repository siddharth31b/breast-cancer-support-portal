import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Eye, RefreshCw } from "lucide-react";
import { PatientService } from "../../../services/patient.service";
import type { PatientRecord } from "../../../types/questionnaire";

export const NurseReports: React.FC = () => {
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [activeTab, setActiveTab] = useState<"NEW" | "NEEDS_VERIFY" | "RE_UPLOAD" | "SUBMITTED" | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const all = await PatientService.getPatients();
      setPatients(all);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const allReportsList: any[] = [];
  patients.forEach((p) => {
    (p.reports ?? []).forEach((r) => {
      allReportsList.push({
        ...r,
        patientName: p.name,
        patientId: p.id,
      });
    });
  });

  const filteredReports = allReportsList.filter((r) => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      r.title.toLowerCase().includes(q) ||
      r.patientName.toLowerCase().includes(q) ||
      r.category.toLowerCase().includes(q);

    if (!matchSearch) return false;

    if (activeTab === "NEW") return r.status === "Uploaded" || r.status === "New";
    if (activeTab === "NEEDS_VERIFY") return r.status === "Needs Verification" || !r.validationStatus;
    if (activeTab === "RE_UPLOAD") return r.status === "Needs Re-upload" || r.status === "Needs Update";
    if (activeTab === "SUBMITTED") return r.status === "Validated" || r.status === "Submitted";
    return true;
  });

  const handleVerifyReadability = async (reportId: string, status: "Validated" | "Needs Update" | "Uploaded") => {
    for (const p of patients) {
      const rep = p.reports?.find((x) => x.id === reportId);
      if (rep) {
        rep.validationStatus = status;
        rep.status = status;
        await PatientService.updatePatientRecord(p);
        loadData();
        break;
      }
    }
  };

  return (
    <div className="space-y-6 text-left max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/60 pb-5">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">
            Patient Reports Verification
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Upload, organise and verify readability of patient-provided documents.
          </p>
        </div>
        <button
          onClick={() => loadData()}
          className="p-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-xl transition-colors shrink-0"
          title="Refresh Reports"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto">
        {[
          { id: "ALL", label: `All Reports (${allReportsList.length})` },
          { id: "NEW", label: "New Uploads" },
          { id: "NEEDS_VERIFY", label: "Needs Verification" },
          { id: "RE_UPLOAD", label: "Needs Re-upload" },
          { id: "SUBMITTED", label: "Submitted for Review" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer ${
              activeTab === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl w-full md:w-80 focus-within:border-primary/50 transition-all">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search report title, patient..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-xs w-full focus:outline-none text-slate-700 font-medium"
            aria-label="Search reports"
          />
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider font-bold text-[9px] bg-slate-50/50">
                <th className="p-4">Patient</th>
                <th className="p-4">Document Title</th>
                <th className="p-4">Type</th>
                <th className="p-4">Date</th>
                <th className="p-4">Uploaded By</th>
                <th className="p-4">Readability</th>
                <th className="p-4">Doctor Review Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 font-semibold">
                    No documents found matching the filter.
                  </td>
                </tr>
              ) : (
                filteredReports.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-4 font-bold text-slate-800">
                      {r.patientName} <span className="text-[10px] text-slate-400 font-normal">({r.patientId})</span>
                    </td>
                    <td className="p-4 font-semibold text-slate-800">{r.title}</td>
                    <td className="p-4 text-slate-600">{r.category}</td>
                    <td className="p-4 text-slate-500">{r.date || "Today"}</td>
                    <td className="p-4 text-slate-500">{r.source || "Patient / Nurse"}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full border ${
                        r.validationStatus === "Readable" || r.validationStatus === "Verified"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : r.validationStatus === "Blurry" || r.validationStatus === "Needs Re-upload"
                          ? "bg-rose-50 text-rose-700 border-rose-200"
                          : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}>
                        {r.validationStatus || "Pending Verification"}
                      </span>
                    </td>
                    <td className="p-4 text-slate-500 font-medium">Awaiting Doctor Review</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleVerifyReadability(r.id, "Validated")}
                          className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-[10px] font-bold rounded-lg transition-colors"
                        >
                          Verify Readable
                        </button>
                        <button
                          onClick={() => handleVerifyReadability(r.id, "Needs Update")}
                          className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[10px] font-bold rounded-lg transition-colors"
                        >
                          Request Re-upload
                        </button>
                        <Link
                          href={`/nurse/patients/${r.patientId}`}
                          className="p-1.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-lg text-slate-600"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
