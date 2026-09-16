import React, { useState, useEffect } from "react";
import { 
  CheckSquare, 
  Square, 
  Plus, 
  Lock, 
  ShieldCheck, 
  Heart
} from "lucide-react";
import { mockCarePlan } from "../../mocks/patient-portal.mock";
import type { CarePlanTask } from "../../types/patient-portal";

import { useAuth } from "../auth/AuthContext";
import { PatientService } from "../../services/patient.service";
import type { PatientRecord } from "../../types/questionnaire";

export const CarePlanPage: React.FC = () => {
  const { user } = useAuth();
  const [patientRecord, setPatientRecord] = useState<PatientRecord | null>(null);
  const [carePlan, setCarePlan] = useState(mockCarePlan);
  const [personalTaskTitle, setPersonalTaskTitle] = useState("");
  const [personalTaskCategory, setPersonalTaskCategory] = useState<any>("Exercise");

  useEffect(() => {
    const loadData = async () => {
      if (user?.id) {
        const p = await PatientService.getPatient(user.id);
        setPatientRecord(p);
      }
    };
    loadData();

    const handleUpdate = () => {
      loadData();
      setCarePlan(prev => ({ ...prev }));
    };
    window.addEventListener("patient-updated", handleUpdate);
    return () => window.removeEventListener("patient-updated", handleUpdate);
  }, [user?.id]);

  const toggleTask = (taskId: string) => {
    setCarePlan(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => {
        if (t.id === taskId) {
          const nextStatus = t.status === "Completed" ? "Pending" : "Completed";
          return {
            ...t,
            status: nextStatus,
            completedAt: nextStatus === "Completed" ? new Date().toISOString() : undefined
          };
        }
        return t;
      })
    }));
  };

  const handleAddPersonalTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!personalTaskTitle.trim()) return;

    const newTask: CarePlanTask = {
      id: `t-personal-${Date.now()}`,
      title: personalTaskTitle.trim(),
      category: personalTaskCategory,
      source: "Patient",
      status: "Pending",
      dueDate: new Date().toISOString().slice(0, 10),
    };

    setCarePlan(prev => ({
      ...prev,
      tasks: [newTask, ...prev.tasks]
    }));

    setPersonalTaskTitle("");
  };

  const isCarePlanIssued = !!(patientRecord?.carePlanIssued && patientRecord?.carePlanNotes?.trim());

  if (!isCarePlanIssued) {
    return (
      <div className="bg-white border border-slate-200/80 rounded-2xl p-8 shadow-xs space-y-4 text-center my-6">
        <div className="w-16 h-16 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto text-slate-400">
          <Heart className="w-8 h-8 text-slate-400" />
        </div>
        <div>
          <h2 className="text-lg font-black text-slate-800">No Care Plan Issued Yet</h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 leading-relaxed font-medium">
            Your lead oncologist (Dr. Sarah Iyer) has not issued a clinical care plan for your profile yet. Care plans are created and published individually by clinicians after evaluating your clinical assessment and diagnostic reports.
          </p>
        </div>
      </div>
    );
  }

  const activeTasks = (patientRecord?.carePlanTasks && patientRecord.carePlanTasks.length > 0)
    ? patientRecord.carePlanTasks.map((ct: any) => ({
        id: ct.id || `ct-${Math.random()}`,
        title: ct.title,
        category: ct.category || "General",
        source: "Doctor",
        status: ct.completed || ct.status === "Completed" ? "Completed" : "Pending",
        dueDate: "Active",
        description: ct.description || ""
      }))
    : carePlan.tasks;

  const clinicalTasks = activeTasks.filter((t: any) => t.source === "Doctor" || t.source === "System");
  const personalTasks = carePlan.tasks.filter(t => t.source === "Patient");

  return (
    <div className="space-y-6">
      {/* Care Plan Header Card */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Clinical Care Plan</span>
            <h2 className="text-lg font-black text-slate-800">Personalized Health &amp; Follow-up Protocol</h2>
            <p className="text-xs text-slate-500 mt-0.5">Issued by <strong>Dr. Sarah Iyer</strong></p>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-bold text-slate-400 block uppercase">Plan Status</span>
            <span className="text-xs font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full uppercase">Issued &amp; Active</span>
          </div>
        </div>

        {patientRecord?.carePlanNotes && (
          <div className="p-4 bg-teal-50/60 border border-teal-200/60 rounded-xl text-xs text-teal-900 leading-relaxed font-medium">
            💡 <strong>Doctor's Guidance:</strong> {patientRecord.carePlanNotes}
          </div>
        )}
      </div>

      {/* Clinical Instructions Section (Read-Only Editing Restriction) */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" />
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Clinician-Issued Instructions</h3>
          </div>
          <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
            <Lock className="w-3 h-3 text-slate-400" />
            Doctor orders cannot be edited or removed by patient
          </span>
        </div>

        <div className="space-y-3">
          {clinicalTasks.map((t) => (
            <div
              key={t.id}
              onClick={() => toggleTask(t.id)}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                t.status === "Completed"
                  ? "bg-slate-50 border-slate-200/80 opacity-75"
                  : "bg-white border-slate-100 hover:border-slate-300"
              }`}
            >
              <div className="mt-0.5 shrink-0 text-primary">
                {t.status === "Completed" ? (
                  <CheckSquare className="w-5 h-5 text-emerald-600" />
                ) : (
                  <Square className="w-5 h-5 text-slate-300" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold ${t.status === "Completed" ? "line-through text-slate-400" : "text-slate-800"}`}>
                    {t.title}
                  </span>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600`}>
                    {t.category}
                  </span>
                </div>
                {t.description && (
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{t.description}</p>
                )}
                <div className="flex items-center gap-4 text-[10px] text-slate-400 mt-2 font-medium">
                  <span>Source: {t.source}</span>
                  {t.dueDate && <span>Due: {t.dueDate}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Patient Created Personal Tasks Section */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <Heart className="w-4 h-4 text-rose-500" />
          Personal Health Reminders & Tasks
        </h3>

        {/* Add Personal Task Form */}
        <form onSubmit={handleAddPersonalTask} className="flex gap-2 flex-wrap">
          <input
            type="text"
            placeholder="Add personal care note or task..."
            value={personalTaskTitle}
            onChange={(e) => setPersonalTaskTitle(e.target.value)}
            className="flex-1 min-w-[200px] px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-primary/20"
          />
          <select
            value={personalTaskCategory}
            onChange={(e) => setPersonalTaskCategory(e.target.value as any)}
            className="px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white text-slate-700 font-medium focus:outline-hidden"
          >
            <option value="Exercise">Exercise</option>
            <option value="Nutrition">Nutrition</option>
            <option value="Hydration">Hydration</option>
            <option value="Sleep">Sleep</option>
            <option value="Other">Other</option>
          </select>
          <button
            type="submit"
            className="px-4 py-2 bg-primary text-white font-bold text-xs rounded-xl hover:bg-primary-hover transition-colors flex items-center gap-1"
          >
            <Plus className="w-4 h-4" /> Add Task
          </button>
        </form>

        {personalTasks.length === 0 ? (
          <p className="text-xs text-slate-400 italic py-2">No personal tasks added yet.</p>
        ) : (
          <div className="space-y-2">
            {personalTasks.map((t) => (
              <div
                key={t.id}
                onClick={() => toggleTask(t.id)}
                className="p-3 rounded-xl border border-slate-100 hover:border-slate-200 cursor-pointer flex items-center gap-3 bg-slate-50/40"
              >
                {t.status === "Completed" ? (
                  <CheckSquare className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Square className="w-4 h-4 text-slate-300" />
                )}
                <span className={`text-xs font-semibold ${t.status === "Completed" ? "line-through text-slate-400" : "text-slate-700"}`}>
                  {t.title}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
