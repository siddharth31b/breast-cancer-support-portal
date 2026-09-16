import React, { useState } from "react";
import { 
  CheckCircle2, 
  Circle, 
  XCircle, 
  Plus, 
  Trash2
} from "lucide-react";
import { mockGoals } from "../../mocks/patient-portal.mock";
import type { Goal } from "../../types/patient-portal";
import { StatusBadge } from "../../components/patient/StatusBadge";

export const DailyGoalsPage: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>(mockGoals);
  const [newTitle, setNewTitle] = useState("");
  const [newFrequency, setNewFrequency] = useState<"Daily" | "Weekly">("Daily");
  const [activeTab, setActiveTab] = useState<"Today" | "Upcoming" | "Completed" | "Missed">("Today");

  const toggleGoal = (id: string) => {
    setGoals(prev => prev.map(g => {
      if (g.id === id) {
        const nextStatus = g.status === "Completed" ? "Pending" : "Completed";
        return {
          ...g,
          status: nextStatus,
          completedAt: nextStatus === "Completed" ? new Date().toISOString() : undefined
        };
      }
      return g;
    }));
  };

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newGoal: Goal = {
      id: `g-custom-${Date.now()}`,
      patientId: "patient-001",
      title: newTitle.trim(),
      frequency: newFrequency,
      source: "Patient",
      status: "Pending",
      date: new Date().toISOString().slice(0, 10),
      isPersonal: true,
      icon: "📌",
    };

    setGoals(prev => [newGoal, ...prev]);
    setNewTitle("");
  };

  const handleDeleteGoal = (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  const completedCount = goals.filter(g => g.status === "Completed").length;
  const completionPercent = Math.round((completedCount / goals.length) * 100) || 0;

  const filteredGoals = goals.filter(g => {
    if (activeTab === "Today") return g.status === "Pending" || g.status === "Completed";
    if (activeTab === "Completed") return g.status === "Completed";
    if (activeTab === "Missed") return g.status === "Missed";
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Goal Overview Card */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs flex flex-wrap items-center justify-between gap-6">
        <div className="space-y-1">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Daily Health & Wellness Tracking</span>
          <h2 className="text-lg font-black text-slate-800">Today's Health Activity Checklist</h2>
          <p className="text-xs text-slate-500">Track doctor-recommended and personal health habits.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-2xl font-black text-primary">{completionPercent}%</span>
            <span className="text-[10px] text-slate-400 block font-semibold">{completedCount} of {goals.length} Goals Completed</span>
          </div>
          <div className="w-16 h-16 rounded-full border-4 border-emerald-500/20 border-t-primary flex items-center justify-center font-bold text-xs text-primary">
            {completedCount}/{goals.length}
          </div>
        </div>
      </div>

      {/* Add Custom Goal Form */}
      <form onSubmit={handleAddGoal} className="bg-white border border-slate-100 rounded-2xl p-4 shadow-xs flex flex-wrap gap-3 items-center">
        <input
          type="text"
          placeholder="Add a new personal wellness goal..."
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          className="flex-1 min-w-[200px] px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-primary/20"
        />
        <select
          value={newFrequency}
          onChange={(e) => setNewFrequency(e.target.value as any)}
          className="px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white text-slate-700 font-medium focus:outline-hidden"
        >
          <option value="Daily">Daily Goal</option>
          <option value="Weekly">Weekly Goal</option>
        </select>
        <button
          type="submit"
          className="px-4 py-2 bg-primary text-white font-bold text-xs rounded-xl hover:bg-primary-hover transition-colors flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Add Goal
        </button>
      </form>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-slate-200/60 pb-2">
        {(["Today", "Completed", "Missed"] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === tab
                ? "bg-primary text-white"
                : "text-slate-500 hover:bg-slate-100"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Goals List */}
      <div className="space-y-3">
        {filteredGoals.map((g) => (
          <div
            key={g.id}
            className={`bg-white border rounded-2xl p-4 shadow-2xs flex items-center justify-between gap-4 transition-all ${
              g.status === "Completed" ? "border-emerald-200 bg-emerald-50/20" : "border-slate-100 hover:border-slate-200"
            }`}
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <button
                onClick={() => toggleGoal(g.id)}
                className="text-primary hover:scale-110 transition-transform shrink-0"
              >
                {g.status === "Completed" ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 fill-emerald-100" />
                ) : g.status === "Missed" ? (
                  <XCircle className="w-6 h-6 text-red-500" />
                ) : (
                  <Circle className="w-6 h-6 text-slate-300" />
                )}
              </button>

              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm">{g.icon || "📌"}</span>
                  <span className={`text-xs font-bold ${g.status === "Completed" ? "line-through text-slate-400" : "text-slate-800"}`}>
                    {g.title}
                  </span>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md ${
                    g.source === "Doctor" ? "bg-teal-50 text-teal-700" : "bg-slate-100 text-slate-600"
                  }`}>
                    {g.source}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-1 font-medium">
                  <span>Frequency: {g.frequency}</span>
                  {g.reminderTime && <span>Reminder: {g.reminderTime}</span>}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <StatusBadge status={g.status} />
              {g.isPersonal && (
                <button
                  onClick={() => handleDeleteGoal(g.id)}
                  className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                  title="Delete Goal"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
