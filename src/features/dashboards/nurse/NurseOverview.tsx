import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Clock,
  AlertCircle,
  Calendar,
  FileText,
  CheckCircle,
  UserPlus,
  ArrowRight,
  Inbox,
  Activity,
  ChevronRight,
  RefreshCw,
  Bell,
} from "lucide-react";
import { PatientService } from "../../../services/patient.service";
import { NurseService } from "../../../services/nurse.service";
import type { PatientRecord } from "../../../types/questionnaire";

export const NurseOverview: React.FC = () => {
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

  const awaitingIntake = patients.filter((p) => p.status === "Awaiting Intake" || p.status === "Draft Intake");
  const incompleteIntakes = patients.filter((p) => p.status === "Needs Clarification" || p.status === "Draft Intake");
  const missingReports = patients.filter((p) => !p.reports || p.reports.length === 0);
  const appointments = NurseService.getAppointments();
  const followUps = NurseService.getFollowUps().filter((f) => f.contactStatus === "Due Today" || f.contactStatus === "Overdue");
  const tasks = NurseService.getTasks().filter((t) => t.status !== "Completed");

  const recentTimeline = [
    { text: "Identity verified & intake completed for Meera Sharma", time: "10:15 AM", type: "intake" },
    { text: "Uploaded mammography report PDF for Kiran Rao", time: "09:40 AM", type: "report" },
    { text: "Appointment prep checklist marked Ready for Sunita Patel", time: "09:10 AM", type: "appt" },
    { text: "Completed follow-up check call for Pooja Verma", time: "Yesterday 4:30 PM", type: "followup" },
    { text: "Sent Doctor Handoff summary to Dr. Sarah Iyer for Suman Deshmukh", time: "Yesterday 3:15 PM", type: "handoff" },
  ];

  return (
    <div className="space-y-6 text-left max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-rose-100 text-rose-700 font-extrabold px-2.5 py-0.5 rounded-full uppercase border border-rose-200">
              Nurse Portal
            </span>
            <span className="text-xs text-slate-400 font-medium">IIT Indore Main Campus Hospital</span>
          </div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight mt-1">
            Nurse Care Hub
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage patient intake, appointment preparation and care coordination.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => loadData()}
            className="p-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-xl transition-colors min-w-[42px] min-h-[42px] flex items-center justify-center"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
          <Link
            href="/nurse/intake/new"
            className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-[#004D46] text-white text-xs font-bold rounded-xl shadow-md shadow-primary/15 transition-colors cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            New Patient Intake
          </Link>
        </div>
      </div>

      {/* Top Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {[
          { label: "Waiting for Intake", val: awaitingIntake.length, icon: Clock, color: "text-amber-700 bg-amber-50 border-amber-200", path: "/nurse/intake-queue" },
          { label: "Incomplete Intakes", val: incompleteIntakes.length, icon: AlertCircle, color: "text-rose-700 bg-rose-50 border-rose-200", path: "/nurse/intake-queue" },
          { label: "Appointments Today", val: appointments.length, icon: Calendar, color: "text-blue-700 bg-blue-50 border-blue-200", path: "/nurse/appointments" },
          { label: "Missing Reports", val: missingReports.length, icon: FileText, color: "text-violet-700 bg-violet-50 border-violet-200", path: "/nurse/reports" },
          { label: "Follow-Ups Due", val: followUps.length, icon: CheckCircle, color: "text-emerald-700 bg-emerald-50 border-emerald-200", path: "/nurse/follow-ups" },
          { label: "Open Tasks", val: tasks.length, icon: Bell, color: "text-teal-700 bg-teal-50 border-teal-200", path: "/nurse/tasks" },
        ].map((st, i) => {
          const Icon = st.icon;
          return (
            <Link
              key={i}
              href={st.path}
              className={`p-4 bg-white border border-slate-200/80 rounded-2xl flex flex-col justify-between hover:shadow-md transition-all cursor-pointer group`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">{st.label}</span>
                <div className={`w-7 h-7 rounded-lg border flex items-center justify-center ${st.color}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
              </div>
              <h3 className="text-xl font-black text-slate-800 mt-2">{st.val}</h3>
            </Link>
          );
        })}
      </div>

      {/* Main Grid: Left 2 cols (Next Patients & Appointments), Right 1 col (Tasks & Timeline) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* A. NEXT PATIENTS */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                Next Patients Waiting for Intake ({awaitingIntake.length})
              </h2>
              <Link href="/nurse/intake-queue" className="text-[11px] font-bold text-primary hover:underline flex items-center gap-0.5">
                View Queue <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {awaitingIntake.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 space-y-2">
                <Inbox className="w-8 h-8 mx-auto text-slate-300" />
                <p className="font-semibold text-slate-600">No patients currently waiting for intake.</p>
                <p className="text-[11px]">Register a new arriving patient to begin intake.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {awaitingIntake.slice(0, 5).map((patient) => (
                  <div
                    key={patient.id}
                    className="p-3.5 bg-slate-50/70 hover:bg-white border border-slate-100 hover:border-primary/20 rounded-2xl flex items-center justify-between gap-3 transition-all"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-800 text-xs">{patient.name}</span>
                        <span className="text-[10px] text-slate-400 font-medium">#{patient.id}</span>
                        <span className="text-[10px] text-slate-500 font-medium">• {patient.age}y</span>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-1 font-medium flex-wrap">
                        <span>Status: <strong className="text-amber-700">{patient.status}</strong></span>
                        <span>Waiting: <strong className="text-slate-600">{patient.timeInQueue || "15 mins"}</strong></span>
                      </div>
                    </div>
                    <Link
                      href={`/nurse/patients/${patient.id}/intake`}
                      className="shrink-0 px-3.5 py-1.5 bg-primary hover:bg-[#004D46] text-white text-[11px] font-bold rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1"
                    >
                      Start Intake <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* B. TODAY'S APPOINTMENTS */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                Today's Appointments ({appointments.length})
              </h2>
              <Link href="/nurse/appointments" className="text-[11px] font-bold text-primary hover:underline flex items-center gap-0.5">
                View All <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-2">
              {appointments.map((appt) => (
                <div
                  key={appt.id}
                  className="p-3.5 bg-slate-50/70 hover:bg-white border border-slate-100 rounded-2xl flex items-center justify-between gap-3 text-xs transition-all"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800">{appt.patientName}</span>
                      <span className="text-[9px] font-bold bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full">
                        {appt.time}
                      </span>
                    </div>
                    <p className="text-[10.5px] text-slate-500 mt-0.5">
                      {appt.appointmentType} • {appt.mode} • Assigned: <strong>{appt.doctorName}</strong>
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`px-2 py-0.5 text-[9.5px] font-bold rounded-full border ${
                      appt.prepStatus === "Ready" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"
                    }`}>
                      {appt.prepStatus}
                    </span>
                    <Link
                      href={`/nurse/patients/${appt.patientId}`}
                      className="px-3 py-1 bg-white border border-slate-200 hover:border-primary/30 text-slate-700 text-[10.5px] font-bold rounded-lg transition-colors"
                    >
                      Open
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: C. Tasks & D. Recent Activity */}
        <div className="space-y-6">
          {/* C. TASKS REQUIRING ATTENTION */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <Bell className="w-4 h-4 text-teal-600" />
                Tasks Requiring Attention
              </h2>
              <Link href="/nurse/tasks" className="text-[11px] font-bold text-primary hover:underline">View All</Link>
            </div>
            <div className="space-y-2.5">
              {tasks.slice(0, 4).map((task) => (
                <div key={task.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">{task.patientName}</span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase border ${
                      task.priority === "HIGH" ? "bg-red-50 text-red-700 border-red-200" : "bg-slate-100 text-slate-600 border-slate-200"
                    }`}>
                      {task.priority}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-snug">{task.title}</p>
                  <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400">
                    <span>Due: {task.dueDate}</span>
                    <Link href={`/nurse/patients/${task.patientId}`} className="font-bold text-primary hover:underline">
                      Open Patient
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* D. RECENT ACTIVITY TIMELINE */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4">
            <h2 className="font-bold text-slate-800 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
              <Activity className="w-4 h-4 text-slate-400" />
              Recent Activity Audit
            </h2>
            <div className="space-y-3">
              {recentTimeline.map((act, i) => (
                <div key={i} className="flex items-start gap-3 text-xs border-b border-slate-100 last:border-0 pb-2.5">
                  <span className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-slate-700 leading-tight">{act.text}</p>
                    <span className="text-[10px] text-slate-400">{act.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
