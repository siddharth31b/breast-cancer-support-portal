import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, RefreshCw } from "lucide-react";
import { PatientService } from "../../../services/patient.service";
import type { PatientRecord } from "../../../types/questionnaire";

export const NursePatients: React.FC = () => {
  const router = useRouter();
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const loadPatients = async () => {
    setIsLoading(true);
    try {
      const data = await PatientService.getPatients();
      setPatients(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, []);

  const filtered = patients.filter((p) => {
    const q = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q) ||
      (p.phone && p.phone.includes(q))
    );
  });

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto py-12 text-center text-slate-400 space-y-3">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-primary" />
        <p className="text-xs font-bold">Loading Patient Directory...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left max-w-6xl mx-auto pb-16">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Patients</h1>
          <p className="text-xs text-slate-400 mt-1 font-medium">Search and access nurse patient records.</p>
        </div>
        <Link
          href="/nurse/intake?tab=new"
          className="px-4 py-2.5 bg-primary text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-primary/15 self-start sm:self-auto"
        >
          + Start New Intake
        </Link>
      </div>

      {/* Search Bar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl w-full sm:w-96 focus-within:border-primary/50 transition-all">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search by patient name, ID or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-xs w-full focus:outline-none text-slate-700 font-medium"
          />
        </div>
      </div>

      {/* Recently Viewed Patients */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">Recently Viewed Patients</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {patients.slice(0, 3).map((p) => (
            <div
              key={p.id}
              onClick={() => router.push(`/nurse/patients/${p.id}`)}
              className="p-3.5 bg-slate-50 border border-slate-100 hover:border-primary/30 rounded-2xl cursor-pointer transition-all space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 text-xs">{p.name}</span>
                <span className="text-[10px] text-slate-400">({p.age}y)</span>
              </div>
              <p className="text-[11px] text-slate-500">ID: {p.id}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Patients List */}
      <div className="bg-white border border-slate-200/80 rounded-3xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">All Patients ({filtered.length})</h2>
        </div>

        <div className="divide-y divide-slate-100">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs font-semibold">No patients found matching your search.</div>
          ) : (
            filtered.map((p) => {
              const isCompleted = p.clinicalJourney?.assessmentSubmitted;
              return (
                <div key={p.id} className="p-4 hover:bg-slate-50/60 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800 text-sm">{p.name}</span>
                      <span className="text-slate-400">({p.age}y)</span>
                      <span className={`px-2.5 py-0.5 text-[9.5px] font-bold rounded-full border ${
                        isCompleted ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}>
                        {isCompleted ? "Intake Completed" : "Intake Incomplete"}
                      </span>
                    </div>
                    <p className="text-slate-500 text-[11px]">
                      Phone: <strong>{p.phone || "+91 98765-43210"}</strong> • Assigned Doctor: <strong>Dr. Sarah Iyer</strong> • Next Appt: <strong>Today 10:30 AM</strong>
                    </p>
                  </div>

                  <button
                    onClick={() => router.push(`/nurse/patients/${p.id}`)}
                    className="px-4 py-2 bg-primary hover:bg-[#004D46] text-white font-bold rounded-xl text-xs shrink-0 self-start sm:self-auto"
                  >
                    Open Patient Workspace
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
