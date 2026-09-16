import React from "react";
import { 
  HelpCircle, 
} from "lucide-react";
import { mockJourney } from "../../mocks/patient-portal.mock";
import { StatusBadge } from "../../components/patient/StatusBadge";

export const DiagnosticJourney: React.FC = () => {
  const journey = mockJourney;

  return (
    <div className="space-y-6">
      {/* Progress Overview Card */}
      <div className="bg-gradient-to-br from-primary via-[#00524B] to-[#007066] text-white rounded-2xl p-6 shadow-md space-y-4">
        <div className="flex justify-between items-center flex-wrap gap-3">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-300">Care Pathway Progress</span>
            <h2 className="text-xl font-black tracking-tight mt-0.5">Diagnostic Screening & Treatment Journey</h2>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-white">{journey.overallProgress}%</span>
            <span className="text-[10px] text-emerald-200 block font-semibold">Overall Completed</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-white/20 h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-emerald-300 h-full rounded-full transition-all duration-500"
            style={{ width: `${journey.overallProgress}%` }}
          />
        </div>

        <div className="flex justify-between text-xs text-white/80 pt-1 font-medium">
          <span>Current Active Stage: <strong>Stage 5 — Clinical Review</strong></span>
          <span>Last updated: {new Date(journey.lastUpdated).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Interactive Timeline Stages List */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs space-y-6">
        <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Journey Stages & Roadmap</h3>

        <div className="relative pl-6 space-y-8 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
          {journey.stages.map((stage, i) => {
            const isCompleted = stage.status === "completed";
            const isActive = stage.status === "active";

            return (
              <div key={stage.id} className="relative flex items-start gap-4">
                {/* Node icon */}
                <div
                  className={`absolute -left-6 w-5.5 h-5.5 rounded-full border-2 flex items-center justify-center text-[10px] font-bold shrink-0 bg-white ${
                    isCompleted
                      ? "border-emerald-500 text-emerald-600 bg-emerald-50"
                      : isActive
                      ? "border-primary text-primary bg-primary/10 ring-4 ring-primary/10 animate-pulse"
                      : "border-slate-300 text-slate-400"
                  }`}
                >
                  {isCompleted ? "✓" : i + 1}
                </div>

                <div className={`flex-1 p-4 rounded-xl border transition-all ${
                  isActive
                    ? "bg-teal-50/50 border-teal-200 shadow-2xs"
                    : isCompleted
                    ? "bg-slate-50/60 border-slate-100"
                    : "bg-white border-slate-100 opacity-60"
                }`}>
                  <div className="flex justify-between items-start flex-wrap gap-2 mb-1">
                    <h4 className="text-sm font-black text-slate-800">{stage.label}</h4>
                    <StatusBadge status={isCompleted ? "Completed" : isActive ? "Active" : "Pending"} />
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed font-medium mb-3">{stage.description}</p>

                  <div className="flex flex-wrap gap-4 text-[11px] text-slate-500 pt-2 border-t border-slate-200/50">
                    {stage.responsibleRole && (
                      <span>Responsible: <strong className="text-slate-700">{stage.responsibleRole} {stage.responsibleName ? `(${stage.responsibleName})` : ""}</strong></span>
                    )}
                    {stage.completedAt && (
                      <span>Completed: <strong className="text-emerald-700">{new Date(stage.completedAt).toLocaleDateString()}</strong></span>
                    )}
                    {stage.expectedAt && !isCompleted && (
                      <span>Expected completion: <strong className="text-amber-700">{new Date(stage.expectedAt).toLocaleDateString()}</strong></span>
                    )}
                  </div>

                  {stage.patientAction && (
                    <div className="mt-3 p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 font-medium">
                      👉 <strong>Action for Patient:</strong> {stage.patientAction}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Journey FAQs */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs space-y-4">
        <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-primary" />
          Frequently Asked Questions About Your Journey
        </h3>

        <div className="space-y-3 text-xs text-slate-600">
          <div className="p-3 bg-slate-50 rounded-xl space-y-1">
            <p className="font-bold text-slate-800">What happens if my review status is delayed?</p>
            <p className="leading-relaxed">Our clinical care team reviews scans in order of priority. If additional clinical imaging or info is needed, you will receive a notification.</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl space-y-1">
            <p className="font-bold text-slate-800">Can I request an expedited appointment?</p>
            <p className="leading-relaxed">Yes. Use the Appointments section to message your care coordinator or book an urgent video consultation.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
