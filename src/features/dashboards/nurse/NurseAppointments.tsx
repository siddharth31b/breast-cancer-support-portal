import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { NurseService, type NurseAppointment } from "../../../services/nurse.service";

export const NurseAppointments: React.FC = () => {
  const router = useRouter();
  const [appointments, setAppointments] = useState<NurseAppointment[]>(NurseService.getAppointments());
  const [activeTab, setActiveTab] = useState<"TODAY" | "UPCOMING">("TODAY");

  const handleArrival = (id: string, status: NurseAppointment["arrivalStatus"]) => {
    NurseService.updateAppointmentArrival(id, status);
    setAppointments(NurseService.getAppointments());
  };

  const filtered = appointments.filter((a) => {
    if (activeTab === "TODAY") return a.date === "2026-07-23";
    return a.date > "2026-07-23";
  });

  return (
    <div className="space-y-6 text-left max-w-6xl mx-auto pb-16">
      {/* Title */}
      <div className="border-b border-slate-200/60 pb-4">
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Appointments</h1>
        <p className="text-xs text-slate-400 mt-1 font-medium">Manage today's scheduled appointments and check-in preparation.</p>
      </div>

      {/* 2 Tabs Only */}
      <div className="flex border-b border-slate-200 gap-2">
        {[
          { id: "TODAY", label: "Today's Appointments" },
          { id: "UPCOMING", label: "Upcoming Appointments" },
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

      {/* Appointment Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((appt) => (
          <div key={appt.id} className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">{appt.patientName}</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Doctor: {appt.doctorName} • {appt.appointmentType}</p>
                </div>
                <span className="px-3 py-1 text-xs font-bold bg-primary/10 text-primary rounded-xl">
                  {appt.time}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
                <div className="p-2 bg-slate-50 rounded-xl">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Intake Readiness</span>
                  <span className={`font-bold ${appt.intakeStatus === "Complete" ? "text-emerald-700" : "text-amber-700"}`}>
                    {appt.intakeStatus === "Complete" ? "Intake Ready" : "Intake Incomplete"}
                  </span>
                </div>
                <div className="p-2 bg-slate-50 rounded-xl">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Reports Status</span>
                  <span className={`font-bold ${appt.prepStatus === "Ready" ? "text-emerald-700" : "text-amber-700"}`}>
                    {appt.prepStatus === "Ready" ? "Reports Available" : "Report Missing"}
                  </span>
                </div>
              </div>
            </div>

            {/* Preparation Checklist Summary */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1 text-xs">
              <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase">
                <span>Appointment Prep Checklist</span>
                <span>Arrival: {appt.arrivalStatus}</span>
              </div>
              <div className="grid grid-cols-2 gap-1 text-[11px]">
                <span>✓ Intake complete</span>
                <span>✓ Reports available</span>
                <span>✓ Patient informed</span>
                <span>✓ Doctor assigned</span>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap text-xs">
              <button
                onClick={() => handleArrival(appt.id, "Arrived")}
                className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-xl border border-emerald-200"
              >
                Mark Arrived
              </button>
              <button
                onClick={() => handleArrival(appt.id, "Scheduled")}
                className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl text-xs"
              >
                Reschedule
              </button>
              <button
                onClick={() => router.push(`/nurse/patients/${appt.patientId}`)}
                className="px-4 py-1.5 bg-primary text-white text-xs font-bold rounded-xl"
              >
                Open Patient
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
