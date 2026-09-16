import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Download, Eye, Check, Send, X } from "lucide-react";
import { RadiologistService, type RadiologyReportItem } from "../../../services/radiologist.service";

export const RadiologistReports: React.FC = () => {
  const router = useRouter();
  const [reports, setReports] = useState<RadiologyReportItem[]>(() => RadiologistService.getReports());
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "Draft" | "Submitted" | "Returned">("ALL");
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Selected Report Modal View
  const [selectedReport, setSelectedReport] = useState<RadiologyReportItem | null>(null);

  const reloadReports = () => {
    setReports(RadiologistService.getReports());
  };

  useEffect(() => {
    window.addEventListener("radiologist-studies-updated", reloadReports);
    return () => {
      window.removeEventListener("radiologist-studies-updated", reloadReports);
    };
  }, []);

  const filtered = reports.filter((r) => {
    const q = searchQuery.toLowerCase();
    const match =
      r.patientName.toLowerCase().includes(q) ||
      r.patientId.toLowerCase().includes(q) ||
      r.studyId.toLowerCase().includes(q);
    if (!match) return false;

    if (statusFilter === "Draft") return r.status === "Draft";
    if (statusFilter === "Submitted") return r.status === "Submitted";
    if (statusFilter === "Returned") return r.status === "Returned";
    return true;
  });

  const handleExportPdf = (studyId: string, patientName: string) => {
    setFeedbackMsg(`PDF Radiology Report for ${patientName} (${studyId}) exported successfully.`);
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  const handleSendAgain = (patientName: string, doctor: string) => {
    setFeedbackMsg(`Report re-transmitted successfully to ${doctor} for patient ${patientName}.`);
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  return (
    <div className="space-y-6 text-left max-w-7xl mx-auto pb-16">
      {/* Title */}
      <div className="border-b border-slate-200/60 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Radiology Reports Library</h1>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            Archived diagnostic radiology reports &amp; clinical handoff record.
          </p>
        </div>

        <button
          onClick={() => {
            setFeedbackMsg("Exported complete Radiology Library log (CSV format).");
            setTimeout(() => setFeedbackMsg(null), 3500);
          }}
          className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-all cursor-pointer flex items-center justify-center gap-2 self-start sm:self-auto shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>Export All Reports (CSV)</span>
        </button>
      </div>

      {feedbackMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl flex items-center gap-2.5 animate-fade-in shadow-xs">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Controls & Search */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search by Patient name, ID or Study ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-xs w-full focus:outline-none text-slate-700 font-medium"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          {[
            { id: "ALL", label: "All Reports" },
            { id: "Submitted", label: "Submitted" },
            { id: "Draft", label: "Drafts" },
            { id: "Returned", label: "Returned (Repeat)" },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setStatusFilter(f.id as any)}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === f.id ? "bg-primary text-white border-primary" : "bg-slate-50 text-slate-500 border-slate-200 hover:border-slate-300"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Reports Grid Cards / Table View */}
      <div className="bg-white border border-slate-200/80 rounded-3xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Report Records ({filtered.length})</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider font-bold text-[9px] bg-slate-50/80">
                <th className="p-4">Thumbnail</th>
                <th className="p-4">Patient Info</th>
                <th className="p-4">Study Type</th>
                <th className="p-4">Study Date</th>
                <th className="p-4">BI-RADS</th>
                <th className="p-4">AI Confidence</th>
                <th className="p-4">Radiologist</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400 font-semibold">
                    No reports found matching the selected query or filter.
                  </td>
                </tr>
              ) : (
                filtered.map((rep) => (
                  <tr key={rep.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Realistic DICOM Thumbnail Preview */}
                    <td className="p-4">
                      <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden relative shadow-xs">
                        <svg className="w-10 h-10 text-slate-400 opacity-80" viewBox="0 0 100 100" fill="none">
                          <circle cx="50" cy="50" r="35" fill="#475569" opacity="0.4" />
                          <circle cx="58" cy="42" r="12" fill="#e2e8f0" opacity="0.8" />
                          <circle cx="58" cy="42" r="16" stroke="#f43f5e" strokeWidth="2" strokeDasharray="3 2" fill="none" />
                        </svg>
                        <span className="absolute bottom-0.5 right-1 text-[7px] font-mono text-emerald-400 font-bold">DICOM</span>
                      </div>
                    </td>
                    <td className="p-4 font-bold text-slate-800">
                      {rep.patientName}
                      <span className="block text-[10px] text-slate-400 font-mono font-normal">{rep.patientId}</span>
                    </td>
                    <td className="p-4 text-slate-700 font-semibold">{rep.imagingType}</td>
                    <td className="p-4 text-slate-500 font-medium">{rep.studyDate}</td>
                    <td className="p-4 font-black text-primary text-sm">BI-RADS {rep.birads}</td>
                    <td className="p-4 font-bold text-slate-700">{rep.confidence}%</td>
                    <td className="p-4 text-slate-600 font-medium">{rep.radiologistName}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 text-[9.5px] font-bold rounded-full border ${
                        rep.status === "Submitted" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : rep.status === "Draft" ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-rose-50 text-rose-700 border-rose-200"
                      }`}>
                        {rep.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedReport(rep)}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer"
                          title="Open Report Preview"
                        >
                          <Eye className="w-3.5 h-3.5" /> Open
                        </button>
                        <button
                          onClick={() => handleExportPdf(rep.studyId, rep.patientName)}
                          className="px-2.5 py-1.5 bg-primary text-white font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer"
                          title="Download PDF Report"
                        >
                          <Download className="w-3.5 h-3.5" /> PDF
                        </button>
                        <button
                          onClick={() => handleSendAgain(rep.patientName, rep.assignedDoctor)}
                          className="px-2.5 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer"
                          title="Send Again to Doctor"
                        >
                          <Send className="w-3.5 h-3.5" /> Resend
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* OPEN REPORT MODAL PREVIEW */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 border border-slate-100 space-y-5 animate-scale-in max-h-[90vh] overflow-y-auto text-left">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-800">Radiology Report Summary</h3>
                <p className="text-[11px] text-slate-400">Signed diagnostic report record for {selectedReport.patientName}</p>
              </div>
              <button
                onClick={() => setSelectedReport(null)}
                className="w-8 h-8 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-150 text-xs">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Patient Name</p>
                  <p className="font-bold text-slate-800 text-sm mt-0.5">{selectedReport.patientName}</p>
                  <p className="text-[10px] text-slate-500 font-mono">ID: {selectedReport.patientId}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Imaging Study</p>
                  <p className="font-bold text-slate-800 mt-0.5">{selectedReport.imagingType}</p>
                  <p className="text-[10px] text-slate-500 font-mono">Study ID: {selectedReport.studyId}</p>
                </div>
              </div>

              <div className="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-900">BI-RADS CATEGORY</span>
                  <span className="text-base font-black text-emerald-700 bg-white px-3 py-0.5 rounded-full border border-emerald-300">
                    BI-RADS {selectedReport.birads}
                  </span>
                </div>
                <p className="text-xs text-emerald-800 font-medium leading-relaxed">
                  Radiological findings evaluated using AI-assisted deep learning CAD overlay. High-confidence annotations cross-referenced against historical patient intake data.
                </p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-150 rounded-2xl space-y-2 text-xs">
                <p className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">Clinical Summary &amp; Handoff</p>
                <p className="text-slate-700 leading-relaxed font-medium">
                  Signed by <strong className="text-slate-900">{selectedReport.radiologistName}</strong> and routed to assigned oncologist <strong className="text-slate-900">{selectedReport.assignedDoctor}</strong>.
                </p>
                <p className="text-[10px] text-slate-400">Timestamp: {selectedReport.submittedAt}</p>
              </div>
            </div>

            <div className="flex gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedReport(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Close Preview
              </button>
              <button
                onClick={() => {
                  setSelectedReport(null);
                  router.push(`/radiologist/workspace/${selectedReport.studyId}`);
                }}
                className="flex-1 py-2.5 bg-primary hover:bg-[#004D46] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Open Full Workspace
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
