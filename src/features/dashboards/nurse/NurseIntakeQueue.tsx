import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  ArrowRight,
  AlertTriangle,
  Eye,
  UserCheck,
  RefreshCw,
  Plus,
} from "lucide-react";
import { PatientService } from "../../../services/patient.service";
import type { PatientRecord } from "../../../types/questionnaire";

export const NurseIntakeQueue: React.FC = () => {
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & search
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"ALL" | "WAITING" | "IN_PROGRESS" | "INCOMPLETE" | "COMPLETED" | "URGENT">("ALL");

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

  const filteredPatients = patients.filter((p) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      p.name.toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q) ||
      (p.phone ?? "").includes(q);

    if (!matchesSearch) return false;

    switch (filterStatus) {
      case "WAITING":
        return p.status === "Awaiting Intake";
      case "IN_PROGRESS":
        return p.status === "Draft Intake";
      case "INCOMPLETE":
        return p.status === "Needs Clarification" || p.status === "Draft Intake";
      case "COMPLETED":
        return p.status === "Awaiting Review" || (p.clinicalJourney?.assessmentSubmitted ?? false);
      case "URGENT":
        return p.priority === "HIGH" || (p as any).urgentFlag === true;
      default:
        return true;
    }
  });

  const handleMarkArrived = async (patientId: string) => {
    const p = patients.find((x) => x.id === patientId);
    if (p) {
      p.status = "Awaiting Intake";
      await PatientService.updatePatientRecord(p);
      loadData();
    }
  };

  return (
    <div className="space-y-6 text-left max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/60 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">
              Intake Queue
            </h1>
            <span className="text-[10px] bg-rose-100 text-rose-700 font-extrabold px-2.5 py-0.5 rounded-full uppercase border border-rose-200">
              Registration &amp; Vitals
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            View patients waiting for registration or clinical intake.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => loadData()}
            className="p-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-xl transition-colors min-w-[42px] min-h-[42px] flex items-center justify-center"
            title="Refresh Queue"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
          <Link
            href="/nurse/intake/new"
            className="px-5 py-2.5 bg-primary hover:bg-[#004D46] text-white text-xs font-bold rounded-xl shadow-md shadow-primary/15 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> New Patient Intake
          </Link>
        </div>
      </div>

      {/* Toolbar: Search + Filter buttons */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl w-full md:w-80 shadow-xs focus-within:border-primary/50 transition-all">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search name, ID, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-xs w-full focus:outline-none text-slate-700 font-medium"
            aria-label="Search intake queue"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap overflow-x-auto w-full md:w-auto">
          {[
            { id: "ALL", label: "All" },
            { id: "WAITING", label: "Waiting" },
            { id: "IN_PROGRESS", label: "In Progress" },
            { id: "INCOMPLETE", label: "Incomplete" },
            { id: "COMPLETED", label: "Completed" },
            { id: "URGENT", label: "Requires Clinician Attention" },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilterStatus(f.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                filterStatus === f.id
                  ? f.id === "URGENT"
                    ? "bg-red-600 text-white border-red-600"
                    : "bg-primary text-white border-primary"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Urgent Flag Wording Disclaimer */}
      <div className="bg-amber-50/70 border border-amber-200 rounded-xl px-4 py-2.5 text-[11px] text-amber-800 flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
        <span>
          Patients flagged with high priority are marked as <strong>"Requires clinician attention"</strong>. Final clinical diagnosis is made by authorised doctors.
        </span>
      </div>

      {/* Queue Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider font-bold text-[9px] bg-slate-50/50">
                <th className="p-4">Patient</th>
                <th className="p-4">Age</th>
                <th className="p-4">Appointment</th>
                <th className="p-4">Assigned Doctor</th>
                <th className="p-4">Intake Source</th>
                <th className="p-4">Status</th>
                <th className="p-4">Reports</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 font-semibold">
                    No patients match the current search or queue filter.
                  </td>
                </tr>
              ) : (
                filteredPatients.map((patient) => {
                  const isUrgent = patient.priority === "HIGH";
                  const reportsOk = patient.reports && patient.reports.length > 0;
                  return (
                    <tr key={patient.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div>
                            <p className="font-bold text-slate-800 text-xs">{patient.name}</p>
                            <p className="text-[10px] text-slate-400">ID: {patient.id}</p>
                          </div>
                          {isUrgent && (
                            <span className="px-1.5 py-0.5 text-[8.5px] font-extrabold text-red-700 bg-red-50 border border-red-200 rounded uppercase">
                              Requires Attention
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 font-semibold text-slate-700">{patient.age}y</td>
                      <td className="p-4">
                        <span className="font-semibold text-slate-700">Today 10:30 AM</span>
                      </td>
                      <td className="p-4 font-semibold text-slate-700">Dr. Sarah Iyer</td>
                      <td className="p-4 text-[11px] text-slate-500 font-medium">Nurse Desk</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full border ${
                          patient.status === "Awaiting Review" ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : patient.status === "Awaiting Intake" ? "bg-amber-50 text-amber-700 border-amber-200"
                          : "bg-slate-100 text-slate-600 border-slate-200"
                        }`}>
                          {patient.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`text-[10px] font-semibold ${reportsOk ? "text-emerald-600" : "text-slate-400"}`}>
                          {reportsOk ? `${patient.reports!.length} Uploaded` : "None"}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleMarkArrived(patient.id)}
                            className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg text-[10px] font-bold border border-slate-200 transition-colors"
                            title="Mark Patient Arrived"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                          </button>
                          <Link
                            href={`/nurse/patients/${patient.id}/intake`}
                            className="px-3 py-1.5 bg-primary hover:bg-[#004D46] text-white text-[10.5px] font-bold rounded-lg transition-colors flex items-center gap-1"
                          >
                            {patient.status === "Draft Intake" ? "Continue" : "Start Intake"}
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                          <Link
                            href={`/nurse/patients/${patient.id}`}
                            className="p-1.5 bg-white border border-slate-200 hover:border-primary/30 text-slate-600 rounded-lg transition-colors"
                            title="View Patient Workspace"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
