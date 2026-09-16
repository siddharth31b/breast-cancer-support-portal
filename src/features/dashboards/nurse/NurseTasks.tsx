import React, { useState } from "react";
import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";
import { NurseService, type NurseTask, type NurseAlert } from "../../../services/nurse.service";

export const NurseTasks: React.FC = () => {
  const [tasks, setTasks] = useState<NurseTask[]>(NurseService.getTasks());
  const [alerts, setAlerts] = useState<NurseAlert[]>(NurseService.getAlerts());
  const [activeTab, setActiveTab] = useState<"TASKS" | "ALERTS">("TASKS");

  const handleCompleteTask = (id: string) => {
    NurseService.completeTask(id);
    setTasks(NurseService.getTasks());
  };

  const handleAcknowledgeAlert = (id: string) => {
    NurseService.acknowledgeAlert(id);
    setAlerts(NurseService.getAlerts());
  };

  return (
    <div className="space-y-6 text-left max-w-7xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/60 pb-5">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">
            Tasks &amp; Alerts Hub
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track daily clinical nursing tasks and review system alerts requiring attention.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          onClick={() => setActiveTab("TASKS")}
          className={`px-5 py-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer ${
            activeTab === "TASKS" ? "border-primary text-primary" : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          My Tasks ({tasks.filter((t) => t.status !== "Completed").length})
        </button>
        <button
          onClick={() => setActiveTab("ALERTS")}
          className={`px-5 py-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer ${
            activeTab === "ALERTS" ? "border-primary text-primary" : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          Alerts ({alerts.filter((a) => !a.acknowledged).length})
        </button>
      </div>

      {/* TASKS PANEL */}
      {activeTab === "TASKS" && (
        <div className="space-y-3">
          {tasks.map((task) => (
            <div
              key={task.id}
              className={`p-4 bg-white border rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all ${
                task.status === "Completed" ? "opacity-60 border-slate-200" : "border-slate-200/80 shadow-xs"
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800 text-xs">{task.patientName}</span>
                  <span className="text-[10px] text-slate-400">({task.patientId})</span>
                  <span className={`px-2 py-0.5 text-[9px] font-bold rounded uppercase border ${
                    task.priority === "HIGH" ? "bg-amber-50 text-amber-800 border-amber-200" : "bg-slate-50 text-slate-600 border-slate-200"
                  }`}>
                    {task.category}
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-700">{task.title}</p>
                <p className="text-[10px] text-slate-400">Due: {task.dueDate} • Assigned by: {task.assignedBy}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {task.status !== "Completed" && (
                  <button
                    onClick={() => handleCompleteTask(task.id)}
                    className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold rounded-xl flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" /> Mark Complete
                  </button>
                )}
                <Link
                  href={`/nurse/patients/${task.patientId}`}
                  className="px-3.5 py-1.5 bg-primary hover:bg-[#004D46] text-white text-xs font-bold rounded-xl flex items-center gap-1"
                >
                  Open Patient <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ALERTS PANEL */}
      {activeTab === "ALERTS" && (
        <div className="space-y-3">
          {alerts.map((alert) => {
            const isUrgent = alert.severity === "URGENT";
            return (
              <div
                key={alert.id}
                className={`p-4 rounded-2xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all ${
                  isUrgent
                    ? "bg-red-50/60 border-red-200 text-red-900 shadow-xs"
                    : "bg-white border-slate-200/80 text-slate-800"
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs">{alert.patientName}</span>
                    <span className={`px-2 py-0.5 text-[9px] font-extrabold rounded uppercase border ${
                      isUrgent ? "bg-red-600 text-white border-red-600" : "bg-amber-100 text-amber-800 border-amber-200"
                    }`}>
                      {isUrgent ? "Requires Clinician Attention" : alert.type}
                    </span>
                  </div>
                  <p className="text-xs font-bold">{alert.title}</p>
                  {alert.notes && <p className="text-[11px] opacity-80">{alert.notes}</p>}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {!alert.acknowledged && (
                    <button
                      onClick={() => handleAcknowledgeAlert(alert.id)}
                      className="px-3.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl"
                    >
                      Acknowledge
                    </button>
                  )}
                  <Link
                    href={`/nurse/patients/${alert.patientId}`}
                    className="px-3.5 py-1.5 bg-primary hover:bg-[#004D46] text-white text-xs font-bold rounded-xl flex items-center gap-1"
                  >
                    Open Patient <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
