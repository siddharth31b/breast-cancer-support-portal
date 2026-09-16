import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Users, ClipboardList, Calendar, Clock, ArrowRight, RefreshCw } from "lucide-react";
import { PatientService } from "../../../services/patient.service";
import { NurseService } from "../../../services/nurse.service";
import type { PatientRecord } from "../../../types/questionnaire";

export const NurseHome: React.FC = () => {
  const router = useRouter();
  const [patients, setPatients] = useState<PatientRecord[]>([]);
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

  const waitingCount = patients.filter((p) => p.status === "Awaiting Review" || !p.clinicalJourney?.assessmentSubmitted).length;
  const incompleteCount = patients.filter((p) => p.status === "In Progress" || p.status === "Needs Clarification").length;
  const appointmentsCount = NurseService.getAppointments().filter((a) => a.date === "2026-07-23").length;
  const followUpsCount = NurseService.getFollowUps().filter((f) => f.contactStatus === "Due Today" || f.contactStatus === "Overdue").length;

  const todayWorkTasks = [
    { id: "w-1", text: "Complete intake for Suman Deshmukh", patientId: "BC-9041", action: "Continue", status: "Pending" },
    { id: "w-2", text: "Upload missing report for Kiran Rao", patientId: "BC-7812", action: "Upload", status: "Pending" },
    { id: "w-3", text: "Confirm Meera Sharma's appointment readiness", patientId: "demo-patient", action: "Confirm", status: "Pending" },
    { id: "w-4", text: "Call Sunita Reddy for follow-up check-in", patientId: "BC-4109", action: "Call", status: "Pending" },
  ];

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto py-12 text-center text-slate-400 space-y-3">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-primary" />
        <p className="text-xs font-bold">Loading Nurse Home...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left max-w-6xl mx-auto pb-12">
      {/* Title */}
      <div className="border-b border-slate-200/60 pb-4">
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Nurse Home</h1>
        <p className="text-xs text-slate-400 mt-1 font-medium">Quick overview of waiting patients and daily nursing tasks.</p>
      </div>

      {/* 4 Large Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          href="/nurse/intake?tab=waiting"
          className="bg-white border border-slate-200/80 hover:border-primary/40 rounded-3xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Patients Waiting</span>
            <div className="w-9 h-9 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-800">{waitingCount}</p>
          <span className="text-[11px] font-bold text-primary mt-2 flex items-center gap-1">
            Open Waiting Queue <ArrowRight className="w-3 h-3" />
          </span>
        </Link>

        <Link
          href="/nurse/intake?tab=waiting"
          className="bg-white border border-slate-200/80 hover:border-primary/40 rounded-3xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Incomplete Intake</span>
            <div className="w-9 h-9 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <ClipboardList className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-800">{incompleteCount}</p>
          <span className="text-[11px] font-bold text-primary mt-2 flex items-center gap-1">
            Continue Incomplete <ArrowRight className="w-3 h-3" />
          </span>
        </Link>

        <Link
          href="/nurse/appointments"
          className="bg-white border border-slate-200/80 hover:border-primary/40 rounded-3xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Today's Appointments</span>
            <div className="w-9 h-9 rounded-2xl bg-teal-50 text-primary flex items-center justify-center font-bold">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-800">{appointmentsCount}</p>
          <span className="text-[11px] font-bold text-primary mt-2 flex items-center gap-1">
            View Schedule <ArrowRight className="w-3 h-3" />
          </span>
        </Link>

        <Link
          href="/nurse/follow-ups"
          className="bg-white border border-slate-200/80 hover:border-primary/40 rounded-3xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Follow-Ups Due</span>
            <div className="w-9 h-9 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-800">{followUpsCount}</p>
          <span className="text-[11px] font-bold text-primary mt-2 flex items-center gap-1">
            View Follow-Ups <ArrowRight className="w-3 h-3" />
          </span>
        </Link>
      </div>

      {/* NEXT PATIENTS SECTION */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Next Patients</h2>
          <Link href="/nurse/intake" className="text-xs font-bold text-primary hover:underline">
            View All Waiting Patients
          </Link>
        </div>

        <div className="divide-y divide-slate-100">
          {patients.slice(0, 4).map((p) => {
            const isCompleted = p.clinicalJourney?.assessmentSubmitted;
            const isInProgress = p.status === "In Progress";
            const actionLabel = isCompleted ? "View" : isInProgress ? "Continue" : "Start";
            const time = "10:30 AM";

            return (
              <div key={p.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800 text-sm">{p.name}</span>
                    <span className="text-slate-400">({p.age}y)</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Appt Time: <strong>{time}</strong> • ID: {p.id}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full border ${
                    isCompleted ? "bg-emerald-50 text-emerald-700 border-emerald-200" : isInProgress ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-slate-50 text-slate-600 border-slate-200"
                  }`}>
                    {isCompleted ? "Completed" : isInProgress ? "Incomplete Intake" : "Waiting Intake"}
                  </span>

                  <button
                    onClick={() => router.push(isCompleted ? `/nurse/patients/${p.id}` : `/nurse/intake?patientId=${p.id}`)}
                    className="px-4 py-2 bg-primary hover:bg-[#004D46] text-white font-bold rounded-xl text-xs"
                  >
                    {actionLabel}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* TODAY'S WORK SECTION */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-3">Today's Work</h2>
        <div className="space-y-2">
          {todayWorkTasks.map((t) => (
            <div key={t.id} className="p-3.5 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between gap-4 text-xs">
              <span className="font-semibold text-slate-700">{t.text}</span>
              <button
                onClick={() => router.push(`/nurse/patients/${t.patientId}`)}
                className="px-3.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl shrink-0"
              >
                {t.action}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
