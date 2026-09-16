import React, { useState } from "react";
import { NurseService, type NurseFollowUp } from "../../../services/nurse.service";

export const NurseFollowUps: React.FC = () => {
  const [followUps, setFollowUps] = useState<NurseFollowUp[]>(NurseService.getFollowUps());
  const [activeTab, setActiveTab] = useState<"DUE_TODAY" | "UPCOMING" | "COMPLETED">("DUE_TODAY");
  const [askDocModalItem, setAskDocModalItem] = useState<NurseFollowUp | null>(null);
  const [docQuestion, setDocQuestion] = useState("");

  const filtered = followUps.filter((f) => {
    if (activeTab === "DUE_TODAY") return f.contactStatus === "Due Today" || f.contactStatus === "Overdue";
    if (activeTab === "UPCOMING") return f.contactStatus === "Upcoming";
    if (activeTab === "COMPLETED") return f.contactStatus === "Completed";
    return true;
  });

  const handleMarkComplete = (id: string) => {
    NurseService.recordFollowUpCall(id, true, "Call recorded and completed", "None");
    setFollowUps(NurseService.getFollowUps());
  };

  return (
    <div className="space-y-6 text-left max-w-6xl mx-auto pb-16">
      {/* Title */}
      <div className="border-b border-slate-200/60 pb-4">
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Follow-Ups</h1>
        <p className="text-xs text-slate-400 mt-1 font-medium">Record patient calls, reminders and post-intake check-ins.</p>
      </div>

      {/* 3 Tabs */}
      <div className="flex border-b border-slate-200 gap-2">
        {[
          { id: "DUE_TODAY", label: "Due Today" },
          { id: "UPCOMING", label: "Upcoming" },
          { id: "COMPLETED", label: "Completed" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-5 py-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer ${
              activeTab === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Follow-Up Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-2 text-center py-12 bg-white border border-slate-200 rounded-3xl text-slate-400 text-xs font-semibold">
            No follow-up records in this view.
          </div>
        ) : (
          filtered.map((fu) => (
            <div key={fu.id} className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">{fu.patientName}</h3>
                    <p className="text-[11px] text-slate-400">Doctor: {fu.assignedDoctor} • Due: {fu.dueDate}</p>
                  </div>
                  <span className={`px-2.5 py-0.5 text-[9.5px] font-bold rounded-full border ${
                    fu.contactStatus === "Completed" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"
                  }`}>
                    {fu.contactStatus}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs space-y-1">
                  <p className="font-bold text-slate-700">Reason: {fu.reason}</p>
                  <p className="text-slate-500">Method: {fu.contactMethod}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-1.5 flex-wrap text-xs">
                <button
                  onClick={() => handleMarkComplete(fu.id)}
                  className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-xl border border-emerald-200"
                >
                  Call Recorded
                </button>
                <button
                  onClick={() => handleMarkComplete(fu.id)}
                  className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl"
                >
                  Send Reminder
                </button>
                <button
                  onClick={() => setAskDocModalItem(fu)}
                  className="px-3 py-1.5 bg-white border border-slate-200 text-primary text-xs font-bold rounded-xl"
                >
                  Ask Doctor
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ASK DOCTOR MODAL */}
      {askDocModalItem && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 border border-slate-200 text-left shadow-2xl">
            <h3 className="font-bold text-slate-800 text-sm">Ask Doctor Clarification</h3>
            <p className="text-xs text-slate-500">Send factual question for {askDocModalItem.patientName} to {askDocModalItem.assignedDoctor}.</p>
            <textarea
              rows={3}
              value={docQuestion}
              onChange={(e) => setDocQuestion(e.target.value)}
              placeholder="Type factual question for doctor..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-xs resize-none"
            />
            <div className="flex gap-2">
              <button onClick={() => setAskDocModalItem(null)} className="flex-1 py-2.5 border rounded-xl font-bold text-xs">
                Cancel
              </button>
              <button onClick={() => setAskDocModalItem(null)} className="flex-1 py-2.5 bg-primary text-white font-bold rounded-xl text-xs">
                Send Question
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
