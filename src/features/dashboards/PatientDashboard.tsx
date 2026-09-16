import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { DashboardService } from "../../services/dashboard.service";
import { getQuestions } from "../../services/symptom.service";
import type { Category } from "../../services/symptom.service";
import { PatientService } from "../../services/patient.service";
import { MessageService } from "../../services/message.service";
import type { PatientRecord } from "../../types/questionnaire";
import type { ChatMessage as PortalChatMessage } from "../../types/patient-portal";
import { saveSymptomResponse, exportSymptomResponsesCsv, loadSymptomResponses } from "../../services/symptom.storage.service";
import { BreastCareSymptomChatbot } from "../questionnaire/BreastCareSymptomChatbot";
import { useAuth } from "../auth/AuthContext";
import {
  CheckCircle,
  Clock,
  FileText,
  BrainCircuit,
  MessageSquare,
  X,
  Send,
  Loader2,
  ChevronRight,
  ArrowLeft,
  CalendarDays,
  Activity,
  Dumbbell,
  Moon,
  Apple,
  AlertCircle,
  Download,
  ExternalLink,
  Droplets,
  Utensils,
  Brain,
  Video,
  Bell,
  Scan,
  Stethoscope,
  Heart,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  MoreHorizontal,
  BookOpen,
  Phone,
  User,
  ClipboardList,
  Eye,
  Info,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────
type ActivePanel =
  | null
  | "trackReview"
  | "exercisePlan"
  | "reportViewer"
  | "notifications"
  | "newAssessment"
  | "bookAppointment"
  | "uploadReport"
  | "downloadReports"
  | "messageDoctor"
  | "viewCarePlan"
  | "emergency";

// ─── Track Review Panel ───────────────────────────────────────────────────────
const TrackReviewPanel: React.FC<{ patient: PatientRecord | null; onClose: () => void }> = ({ patient, onClose }) => {
  const journey = patient?.clinicalJourney;
  const reports = patient?.reports || [];
  const carePlan = patient?.carePlan || [];

  const assessmentDone = !!(journey?.assessmentSubmitted || patient?.assessmentSession?.status === "SUBMITTED");
  const scanDone = !!(reports.length > 0 || journey?.reportsUploaded);
  const aiDone = !!(journey?.aiAnalysisStatus === "COMPLETE");
  const doctorDone = !!(journey?.doctorReviewStatus === "COMPLETED" || patient?.clinicalIntake?.status === "REVIEWED");
  const carePlanDone = !!(journey?.carePlanStatus === "COMPLETED" || carePlan.length > 0);

  const getStepStatus = (done: boolean, prevDone: boolean) => {
    if (done) return "completed";
    if (prevDone) return "active";
    return "pending";
  };

  const steps = [
    {
      id: 1,
      label: "Assessment Submitted",
      date: patient?.assessmentSession?.completedAt
        ? new Date(patient.assessmentSession.completedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }) + " · " + new Date(patient.assessmentSession.completedAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
        : "Nov 12 · 9:00 AM",
      status: assessmentDone ? "completed" as const : "active" as const,
      actor: patient?.name || "Meera Sharma",
      detail: "Symptom questionnaire and medical history submitted via Patient Portal."
    },
    {
      id: 2,
      label: "DICOM Files Uploaded",
      date: reports.length > 0 && reports[0].date ? reports[0].date : "Nov 13 · 10:30 AM",
      status: getStepStatus(scanDone, assessmentDone),
      actor: patient?.name || "Meera Sharma",
      detail: `${reports.length > 0 ? reports.length : 3} mammogram scans encrypted and transferred to secure archive.`
    },
    {
      id: 3,
      label: "AI Analysis Complete",
      date: "Nov 13 · 11:05 AM",
      status: getStepStatus(aiDone, scanDone),
      actor: "NariSetu AI v2.4",
      detail: "3 regions of interest annotated. BI-RADS 2 with 98.2% confidence. Heatmap generated."
    },
    {
      id: 4,
      label: "Assigned to Specialist",
      date: "Nov 14 · 8:15 AM",
      status: getStepStatus(aiDone, aiDone),
      actor: "System Dispatch",
      detail: "Auto-assigned to Dr. Sarah Iyer. Priority: Routine. SLA: 48 hours."
    },
    {
      id: 5,
      label: "Specialist Review In Progress",
      date: "Nov 15 · 2:30 PM",
      status: getStepStatus(doctorDone, aiDone),
      actor: "Dr. Sarah Iyer",
      detail: doctorDone
        ? "Review complete. Clinical findings and annotated images verified."
        : "Reviewing AI-annotated overlays and cross-referencing with patient history."
    },
    {
      id: 6,
      label: "Report Finalisation",
      date: "Est. Today · 5:00 PM",
      status: getStepStatus(doctorDone, doctorDone),
      actor: "Dr. Sarah Iyer",
      detail: "Signed clinical report generated and digitally countersigned."
    },
    {
      id: 7,
      label: "Patient Delivery",
      date: "Est. Today · 5:30 PM",
      status: getStepStatus(carePlanDone, doctorDone),
      actor: "System",
      detail: "In-app notification + email delivered when report is available."
    },
  ];

  const completedStepsCount = steps.filter(s => s.status === "completed").length;
  const percentComplete = Math.round((completedStepsCount / steps.length) * 100);

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col animate-slide-right">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="w-8 h-8 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-500 cursor-pointer transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h2 className="font-bold text-slate-800">Clinical Review Tracker</h2>
              <p className="text-[11px] text-slate-400">Live pipeline status for your case</p>
            </div>
          </div>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold ${carePlanDone ? "text-emerald-700 bg-emerald-50 border-emerald-250" : "text-amber-700 bg-amber-50 border-amber-200"
            }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${carePlanDone ? "bg-emerald-500" : "bg-amber-500 animate-pulse"} inline-block`} />
            {carePlanDone ? "Completed" : "In Progress"}
          </span>
        </div>

        {/* Progress */}
        <div className="px-8 py-4 bg-slate-50 border-b border-slate-100">
          <div className="flex justify-between text-[10px] text-slate-500 font-bold mb-2">
            <span>{percentComplete}% Complete</span>
            <span className="text-primary">Est. completion: {carePlanDone ? "Delivered" : "5:00 PM today"}</span>
          </div>
          <div className="flex gap-1">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i < Math.round(percentComplete / 10) ? "bg-primary" : "bg-slate-200"}`} />
            ))}
          </div>
        </div>

        {/* Steps */}
        <div className="flex-1 overflow-y-auto px-8 py-6 scrollbar-thin space-y-0">
          {steps.map((step, idx) => {
            const isLast = idx === steps.length - 1;
            return (
              <div key={step.id} className="flex gap-5">
                <div className="flex flex-col items-center">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 shrink-0 z-10 transition-all
                    ${step.status === "completed" ? "bg-primary border-primary text-white" : ""}
                    ${step.status === "active" ? "bg-white border-primary text-primary stage-active-ring" : ""}
                    ${step.status === "upcoming" ? "bg-slate-50 border-slate-200 text-slate-400" : ""}
                    ${step.status === "pending" ? "bg-slate-50 border-slate-100 text-slate-300" : ""}
                  `}>
                    {step.status === "completed" ? <CheckCircle className="w-4 h-4" /> : <span className="text-xs font-black">{step.id}</span>}
                  </div>
                  {!isLast && <div className={`w-0.5 mt-1 mb-1 ${step.status === "completed" ? "bg-primary" : "bg-slate-150"}`} style={{ minHeight: 36 }} />}
                </div>
                <div className={`${isLast ? "pb-4" : "pb-7"} flex-1`}>
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <p className={`font-bold text-sm ${step.status === "active" ? "text-primary" : step.status === "completed" ? "text-slate-800" : "text-slate-400"}`}>
                      {step.label}
                    </p>
                    <span className="text-[9px] text-slate-400 whitespace-nowrap">{step.date}</span>
                  </div>
                  <p className="text-[10px] text-primary font-semibold mb-1">{step.actor}</p>
                  <p className="text-[11px] text-slate-500 leading-relaxed">{step.detail}</p>
                  {step.status === "active" && (
                    <div className="mt-2 inline-flex items-center gap-1.5 text-[9px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                      <Loader2 className="w-3 h-3 animate-spin" /> Currently processing
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ─── Exercise Plan Panel ──────────────────────────────────────────────────────
const ExercisePlanPanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {


  const schedule = [
    { day: "Mon", name: "Brisk Walking", duration: "30 min", icon: Activity, done: true, intensity: "Moderate" },
    { day: "Tue", name: "Gentle Yoga", duration: "20 min", icon: Moon, done: true, intensity: "Light" },
    { day: "Wed", name: "Resistance Bands", duration: "25 min", icon: Dumbbell, done: false, intensity: "Moderate" },
    { day: "Thu", name: "Aqua Walking", duration: "30 min", icon: Activity, done: false, intensity: "Light" },
    { day: "Fri", name: "Brisk Walking", duration: "30 min", icon: Activity, done: false, intensity: "Moderate" },
    { day: "Sat", name: "Breathing & Stretch", duration: "15 min", icon: Moon, done: false, intensity: "Light" },
    { day: "Sun", name: "Rest & Recovery", duration: "—", icon: Heart, done: false, intensity: "Rest" },
  ];

  const nutrition = [
    { label: "Increase Fiber", detail: "25–30g daily from lentils, greens, and whole grains." },
    { label: "Anti-inflammatory Diet", detail: "Berries, turmeric, walnuts, and green tea daily." },
    { label: "Reduce Added Sugar", detail: "Limit processed foods — reduces systemic inflammation." },
    { label: "Hydration", detail: "8+ glasses of water, more on exercise days." },
  ];

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col animate-slide-right">
        <div className="flex items-center justify-between px-8 py-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="w-8 h-8 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-500 cursor-pointer transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h2 className="font-bold text-slate-800">Wellness Exercise Plan</h2>
              <p className="text-[11px] text-slate-400">Assigned by Dr. Sarah Iyer · Week of Nov 11</p>
            </div>
          </div>
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">2 / 7 done</span>
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6 scrollbar-thin">
          {/* Weekly progress ring */}
          <div className="flex items-center gap-6 p-5 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="relative w-16 h-16 shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
                <circle cx="32" cy="32" r="26" fill="none" stroke="#f1f5f9" strokeWidth="6" />
                <circle cx="32" cy="32" r="26" fill="none" stroke="#005F56" strokeWidth="6"
                  strokeDasharray={`${2 * Math.PI * 26}`}
                  strokeDashoffset={`${2 * Math.PI * 26 * (1 - 2 / 7)}`}
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[11px] font-black text-primary">29%</span>
            </div>
            <div>
              <p className="font-bold text-slate-800">Weekly Progress</p>
              <p className="text-xs text-slate-500 mt-0.5">2 of 7 sessions completed</p>
              <p className="text-xs text-emerald-600 font-bold mt-1">50 of 150 mins logged</p>
            </div>
          </div>

          {/* Schedule */}
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Weekly Schedule</p>
            <div className="space-y-2">
              {schedule.map((ex, i) => {
                const Icon = ex.icon;
                return (
                  <div key={i} className={`flex items-center gap-4 p-4 rounded-2xl border transition-all
                    ${ex.done ? "bg-primary/5 border-primary/15" : "bg-white border-slate-100 hover:border-slate-200"}`}>
                    <div className="w-8 text-center">
                      <span className={`text-[10px] font-bold ${ex.done ? "text-primary" : "text-slate-400"}`}>{ex.day}</span>
                    </div>
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${ex.done ? "bg-primary text-white" : "bg-slate-100 text-slate-400"}`}>
                      <Icon className="w-4.5 h-4.5" />
                    </div>
                    <div className="flex-1">
                      <p className={`font-semibold text-xs ${ex.done ? "text-slate-700" : "text-slate-600"}`}>{ex.name}</p>
                      <p className="text-[10px] text-slate-400">{ex.duration} · {ex.intensity}</p>
                    </div>
                    {ex.done && <CheckCircle className="w-4 h-4 text-primary shrink-0" />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Nutrition */}
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Apple className="w-3.5 h-3.5 text-emerald-500" /> Nutriti
              on Guidance
            </p>
            <div className="space-y-2">
              {nutrition.map((n, i) => (
                <div key={i} className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl">
                  <p className="font-semibold text-xs text-slate-700">{n.label}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{n.detail}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex gap-3">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-[11px] text-amber-800 leading-relaxed">
              This plan is a general wellness guideline. Adjust intensity to how you feel. Stop if you experience pain and contact your care team.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Report Viewer Modal ──────────────────────────────────────────────────────
const ReportViewerModal: React.FC<{ report: { title: string; date: string } | null; onClose: () => void }> = ({ report, onClose }) => {
  if (!report) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-[28px] shadow-2xl max-w-2xl w-full border border-slate-100 flex flex-col max-h-[88vh] animate-scale-in">
        <div className="flex items-center justify-between px-8 py-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <FileText className="w-4.5 h-4.5 text-primary" />
            </div>
            <div>
              <h2 className="font-bold text-slate-800">{report.title}</h2>
              <p className="text-[10px] text-slate-400">Uploaded: {report.date} · IIT Indore Clinical Archive</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3.5 py-2 text-[10px] font-bold text-slate-700 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer">
              <Download className="w-3.5 h-3.5" /> PDF
            </button>
            <button onClick={onClose} className="w-8 h-8 hover:bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 cursor-pointer transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-thin">
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Patient", value: "Meera Sharma" },
              { label: "Medical ID", value: "IIT-MC-9281" },
              { label: "Scan Date", value: "Nov 12, 2025" },
              { label: "Facility", value: "IIT Indore" },
              { label: "AI Engine", value: "v2.4" },
              { label: "BI-RADS", value: "Category 2" },
            ].map((f, i) => (
              <div key={i} className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{f.label}</p>
                <p className="text-xs text-slate-800 font-bold mt-0.5">{f.value}</p>
              </div>
            ))}
          </div>

          <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl">
            <p className="font-bold text-sm text-emerald-800 mb-2">BI-RADS 2 — Benign Finding</p>
            <p className="text-[11px] text-emerald-700 leading-relaxed">
              No high-density micro-calcifications or high-risk spiculed margins detected. AI identified 3 regions of interest, all classified as benign tissue variation. Radiologist confidence: <strong>98.2%</strong>.
            </p>
          </div>

          <div>
            <p className="font-bold text-xs text-slate-700 mb-3 uppercase tracking-wider">Recommendations</p>
            <ul className="space-y-2">
              {[
                "Continue annual bi-lateral mammography screening.",
                "Maintain prescribed wellness programme (exercise, nutrition, sleep).",
                "Schedule interval follow-up in 6 months.",
                "Report any new symptoms immediately to your care team.",
              ].map((r, i) => (
                <li key={i} className="flex gap-2.5 text-[11px] text-slate-600">
                  <CheckCircle className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                  {r}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl">
            <div>
              <p className="font-bold text-xs text-slate-800">Dr. Sarah Iyer, MD Oncology</p>
              <p className="text-[10px] text-slate-500">IIT Indore · Clinician-Validated Result</p>
            </div>
            <span className="inline-flex items-center gap-1.5 text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
              <ShieldCheck className="w-3.5 h-3.5" /> Digitally Signed
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Notification Drawer ──────────────────────────────────────────────────────
const NotificationDrawer: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [readIds, setReadIds] = useState<number[]>([]);
  const categories = [
    { label: "All", count: 3 },
    { label: "Clinical", count: 1 },
    { label: "Appointments", count: 1 },
    { label: "Reports", count: 1 },
  ];
  const [activeTab, setActiveTab] = useState("All");

  const notifications = [
    { id: 1, category: "Clinical", title: "Specialist Review Completed", desc: "Dr. Sarah Iyer has verified and signed your diagnosis.", time: "Today · 11:30 AM", icon: ShieldCheck, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
    { id: 2, category: "Appointments", title: "Appointment Confirmed", desc: "Telehealth consult confirmed with Dr. Sarah — Nov 18 at 3:00 PM.", time: "Yesterday", icon: CalendarDays, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" },
    { id: 3, category: "Reports", title: "New Report Available", desc: "Your AI analysis report is ready for review.", time: "2 days ago", icon: FileText, color: "text-primary", bg: "bg-teal-50", border: "border-teal-200" },
  ];

  const filtered = activeTab === "All" ? notifications : notifications.filter(n => n.category === activeTab);

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="w-full max-w-sm bg-white h-full shadow-2xl flex flex-col animate-slide-right">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div>
            <h2 className="font-bold text-slate-800">Notifications</h2>
            <p className="text-[11px] text-slate-400">3 unread alerts</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 hover:bg-slate-100 rounded-xl flex items-center justify-center cursor-pointer">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 px-6 py-3 overflow-x-auto border-b border-slate-100 scrollbar-thin">
          {categories.map(c => (
            <button key={c.label} onClick={() => setActiveTab(c.label)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold whitespace-nowrap transition-all cursor-pointer border
                ${activeTab === c.label ? "bg-primary text-white border-primary" : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100"}`}
            >
              {c.label}
              <span className={`text-[9px] px-1 rounded-full ${activeTab === c.label ? "bg-white/20" : "bg-slate-200 text-slate-600"}`}>{c.count}</span>
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3 scrollbar-thin">
          {filtered.map(n => {
            const Icon = n.icon;
            const isRead = readIds.includes(n.id);
            return (
              <div key={n.id} className={`p-4 rounded-2xl border transition-all ${isRead ? "bg-white border-slate-100 opacity-60" : `${n.bg} ${n.border}`}`}>
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${isRead ? "bg-slate-100" : `bg-white border ${n.border}`}`}>
                    <Icon className={`w-4 h-4 ${isRead ? "text-slate-400" : n.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-xs text-slate-800">{n.title}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">{n.desc}</p>
                    <p className="text-[9px] text-slate-400 mt-1.5">{n.time}</p>
                  </div>
                  {!isRead && (
                    <button onClick={() => setReadIds(prev => [...prev, n.id])} className="shrink-0 text-[9px] text-slate-400 hover:text-primary cursor-pointer font-bold">
                      Mark read
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="px-6 py-4 border-t border-slate-100">
          <button
            onClick={() => setReadIds([1, 2, 3])}
            className="w-full py-2.5 text-xs font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Mark all as read
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── BreastCare Assistant ─────────────────────────────────────────────────────
const CATEGORY_INFO: Record<string, { interpretation: string; recommendation: string }> = {
  "Symptoms on Neck": {
    interpretation: "A lump in the neck may indicate enlarged lymph nodes, infection, or in some cases, spread of breast cancer to nearby lymph nodes.",
    recommendation: "If the lump persists for more than 2 weeks or is painless and increasing in size, consult a breast surgeon or oncologist for further evaluation."
  },
  "Symptoms on Left Arm": {
    interpretation: "An armpit lump may represent swollen lymph nodes, infection, or possible lymph node involvement associated with breast disease.",
    recommendation: "Schedule a clinical breast examination. Your doctor may recommend an ultrasound or biopsy if necessary."
  },
  "Symptoms on Right Arm": {
    interpretation: "A lump in the right armpit may indicate enlarged lymph nodes due to infection or breast-related conditions.",
    recommendation: "Consult a healthcare professional, especially if the lump is persistent, painless, or enlarging."
  },
  "Symptoms on Left Breast": {
    interpretation: "One or more breast symptoms may be associated with benign breast conditions or, in some cases, breast cancer. A painless lump, nipple discharge, skin changes, or a non-healing wound require prompt medical evaluation.",
    recommendation: "Consult a breast specialist. Diagnostic tests such as a clinical breast examination, mammography, ultrasound, or biopsy may be recommended."
  },
  "Symptoms on Right Breast": {
    interpretation: "The selected symptoms may indicate a benign breast disorder or a possible breast malignancy. Multiple symptoms occurring together increase the need for medical assessment.",
    recommendation: "Arrange an appointment with a breast specialist as soon as possible for appropriate clinical evaluation and imaging."
  },
  "Respiratory Symptoms": {
    interpretation: "Respiratory symptoms like cough or breathlessness can be related to minor respiratory tract infections, allergies, or other systemic issues.",
    recommendation: "If symptoms persist, worsen, or are accompanied by chest pain, seek clinical review."
  },
  "CNS Symptoms": {
    interpretation: "Central Nervous System symptoms such as headache, nausea, giddiness, or vomiting can have various causes ranging from stress to neurological issues.",
    recommendation: "Seek immediate medical attention for sudden severe headaches, convulsions, or persistent neurological symptoms."
  },
  "Under Muscular Skeleton": {
    interpretation: "Musculoskeletal symptoms such as back, shoulder, or underarm pain are often related to muscle strain, posture, or joint issues.",
    recommendation: "Rest, warm compress, and gentle stretching may help. Consult a clinician if pain is persistent or severe."
  }
};

interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  text: string;
  type?: "text" | "checklist" | "interpretation";
  category?: Category;
  submitted?: boolean;
  interpretation?: string;
  recommendation?: string;
}

const BreastCareAssistant: React.FC<{ onClose: () => void; onAssessmentComplete?: () => void }> = ({ onClose, onAssessmentComplete }) => {
  return (
    <BreastCareSymptomChatbot 
      isModal={true} 
      onClose={() => {
        onAssessmentComplete?.();
        onClose();
      }}
      onSubmitted={() => {
        onAssessmentComplete?.();
      }}
    />
  );
};

// ─── Wellness Score Widget ────────────────────────────────────────────────────
const WellnessMetric: React.FC<{ label: string; value: number; max: number; unit: string; color: string; icon: React.ComponentType<{ className?: string }> }> = ({ label, value, max, unit, color, icon: Icon }) => {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[10px] text-slate-600 font-semibold">
          <Icon className={`w-3.5 h-3.5 ${color}`} />
          {label}
        </div>
        <span className={`text-[10px] font-bold ${color}`}>{value}{unit}</span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${color.replace("text-", "bg-")}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};

// ─── Main PatientDashboard ────────────────────────────────────────────────────
export const PatientDashboard: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const data = DashboardService.getPatientData();

  const [patientRecord, setPatientRecord] = useState<PatientRecord | null>(null);
  const [doctorMessageText, setDoctorMessageText] = useState("");
  const [messageSentSuccess, setMessageSentSuccess] = useState(false);
  const [patientMessages, setPatientMessages] = useState<PortalChatMessage[]>(() => MessageService.getMessagesForPatient(user?.id || "patient-001"));

  useEffect(() => {
    let active = true;
    const loadPatient = async () => {
      if (user) {
        const record = await PatientService.getPatient(user.id);
        if (active) setPatientRecord(record);
      }
      setPatientMessages(MessageService.getMessagesForPatient(user?.id || "patient-001"));
    };
    loadPatient();

    const handleUpdate = () => {
      loadPatient();
    };

    const handleAppointmentRequest = async (e: Event) => {
      const customEvent = e as CustomEvent<{ date: string }>;
      if (user) {
        const patient = await PatientService.getPatient(user.id);
        if (patient) {
          patient.clinicalJourney = {
            ...patient.clinicalJourney,
            assessmentSubmitted: patient.clinicalJourney?.assessmentSubmitted ?? false,
            reportsUploaded: patient.clinicalJourney?.reportsUploaded ?? false,
            aiAnalysisStatus: patient.clinicalJourney?.aiAnalysisStatus ?? "PENDING",
            radiologyStatus: patient.clinicalJourney?.radiologyStatus ?? "PENDING",
            doctorReviewStatus: patient.clinicalJourney?.doctorReviewStatus ?? "AWAITING_REVIEW",
            appointmentStatus: "REQUESTED",
            waitingTime: patient.clinicalJourney?.waitingTime ?? "0 hrs",
            appointmentDate: customEvent.detail.date
          };

          await PatientService.updatePatientRecord(patient);
          loadPatient();
        }
      }
    };

    window.addEventListener("patient-updated", handleUpdate);
    window.addEventListener("reports-updated", handleUpdate);
    window.addEventListener("patient-appointment-requested", handleAppointmentRequest);

    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel("breastcare-sync");
      channel.onmessage = (event) => {
        if (event.data?.type === "patient-updated") {
          loadPatient();
        }
      };
    } catch (e) {
      console.error("Failed to init BroadcastChannel in PatientDashboard", e);
    }

    return () => {
      active = false;
      window.removeEventListener("patient-updated", handleUpdate);
      window.removeEventListener("reports-updated", handleUpdate);
      window.removeEventListener("patient-appointment-requested", handleAppointmentRequest);
      if (channel) {
        channel.close();
      }
    };
  }, [user?.id]);

  // Determine dynamic health journey steps
  const journey = patientRecord?.clinicalJourney;
  const reports = patientRecord?.reports || [];
  const carePlan = patientRecord?.carePlan || [];

  const assessmentDone = !!(journey?.assessmentSubmitted || patientRecord?.assessmentSession?.status === "SUBMITTED");
  const scanDone = !!(reports.length > 0 || journey?.reportsUploaded);
  const aiDone = !!(journey?.aiAnalysisStatus === "COMPLETE");
  const doctorDone = !!(journey?.doctorReviewStatus === "COMPLETED" || patientRecord?.clinicalIntake?.status === "REVIEWED");
  const appointmentDone = !!(journey?.appointmentStatus === "SCHEDULED" || journey?.appointmentStatus === "CONFIRMED" || journey?.appointmentStatus === "COMPLETED");
  const carePlanDone = !!(journey?.carePlanStatus === "COMPLETED" || carePlan.length > 0);

  const getStepStatus = (done: boolean, prevDone: boolean) => {
    if (done) return "completed";
    if (prevDone) return "active";
    return "pending";
  };

  const dynamicJourneySteps = [
    { label: "Assessment", status: assessmentDone ? "completed" as const : "active" as const, icon: ClipboardList },
    { label: "Scan Upload", status: getStepStatus(scanDone, assessmentDone), icon: Scan },
    { label: "AI Analysis", status: getStepStatus(aiDone, scanDone), icon: BrainCircuit },
    { label: "Doctor Review", status: getStepStatus(doctorDone, aiDone), icon: Stethoscope },
    { label: "Appointment", status: getStepStatus(appointmentDone, doctorDone), icon: CalendarDays },
    { label: "Care Plan", status: getStepStatus(carePlanDone, appointmentDone), icon: Heart },
  ];

  const currentStepNumber = dynamicJourneySteps.filter(s => s.status === "completed").length +
    (dynamicJourneySteps.some(s => s.status === "active") ? 1 : 0);

  const activeLabel = dynamicJourneySteps.find(s => s.status === "active")?.label || "Assessment";

  const summary = patientRecord?.assessmentSession?.summary;
  const riskAnalysis = summary?.riskAnalysis;
  const totalRiskScore = riskAnalysis?.totalScore;
  const guidanceLevel = patientRecord?.assessmentSession?.careGuidanceLevel;
  const priority = patientRecord?.priority;
  
  const tier: "Urgent" | "High" | "Moderate" | "Low" = 
    riskAnalysis?.tier || 
    (guidanceLevel === "URGENT" || priority === "HIGH" ? "Urgent" : 
     guidanceLevel === "HIGH" ? "High" : 
     guidanceLevel === "MEDIUM" ? "Moderate" : "Low");

  let calculatedWellnessScore: number | null = null;
  let riskBadgeColor = "bg-slate-100/90 text-slate-600 border-slate-200 font-semibold";
  let riskLevel = "Intake Pending";
  let strokeColor = "#CBD5E1";
  let scoreTextColor = "text-slate-400";

  if (assessmentDone) {
    if (tier === "Urgent") {
      calculatedWellnessScore = Math.min(42, Math.max(18, Math.round(42 - Math.max(0, (totalRiskScore || 24.1) - 24) * 0.8)));
      riskLevel = "Urgent Risk (Clinical Override)";
      riskBadgeColor = "bg-rose-50 text-rose-800 border-rose-300 font-bold";
      strokeColor = "#E11D48";
      scoreTextColor = "text-rose-600";
    } else if (tier === "High") {
      calculatedWellnessScore = Math.min(68, Math.max(48, Math.round(68 - Math.max(0, (totalRiskScore || 16.1) - 16) * 2.2)));
      riskLevel = `High Risk (Score: ${totalRiskScore !== undefined ? totalRiskScore : "16+"})`;
      riskBadgeColor = "bg-amber-50 text-amber-800 border-amber-300 font-bold";
      strokeColor = "#D97706";
      scoreTextColor = "text-amber-600";
    } else if (tier === "Moderate") {
      calculatedWellnessScore = Math.min(85, Math.max(72, Math.round(85 - Math.max(0, (totalRiskScore || 8.1) - 8) * 1.5)));
      riskLevel = `Moderate Risk (Score: ${totalRiskScore !== undefined ? totalRiskScore : "8.1+"})`;
      riskBadgeColor = "bg-blue-50 text-blue-800 border-blue-300 font-bold";
      strokeColor = "#2563EB";
      scoreTextColor = "text-blue-600";
    } else {
      calculatedWellnessScore = Math.min(98, Math.max(88, Math.round(98 - (totalRiskScore || 0) * 1.2)));
      riskLevel = `Low Risk (Score: ${totalRiskScore !== undefined ? totalRiskScore : 0})`;
      riskBadgeColor = "bg-emerald-50 text-emerald-800 border-emerald-300 font-bold";
      strokeColor = "#005F56";
      scoreTextColor = "text-[#005F56]";
    }
  }

  const patientData = {
    wellnessScore: calculatedWellnessScore,
    isAssessed: assessmentDone,
    riskScore: totalRiskScore,
    tier,
    riskLevel,
    riskBadgeColor,
    strokeColor,
    scoreTextColor,
    assignedDoctor: {
      name: "Dr. Sarah Iyer",
      specialty: "Lead Oncologist",
      initials: "SI"
    },
    upcomingAppointment: {
      date: data.upcomingAppointment?.date || "18 July 2026",
      time: data.upcomingAppointment?.time || "11:30 AM"
    }
  };
  const [tasks, setTasks] = useState(data.carePlanTasks);
  const [activePanel, setActivePanel] = useState<ActivePanel>(null);
  const [viewingReport, setViewingReport] = useState<{ title: string; date: string } | null>(null);
  const [showChatbot, setShowChatbot] = useState(false);
  const [notifCount] = useState(3);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [customAppointmentDate, setCustomAppointmentDate] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Greeting based on time
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const toggleTask = (id: string) => setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  const completedCount = tasks.filter(t => t.completed).length;
  const progressPercent = Math.round((completedCount / tasks.length) * 100);
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const dashoffset = circumference - (progressPercent / 100) * circumference;

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setUploadSuccess(false);

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("patientId", user?.id || "demo-patient");

    try {
      const response = await fetch("/api/reports/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const resData = await response.json();
      if (resData.success && resData.study) {
        const patientId = user?.id || "demo-patient";

        // 1. Save document to IndexedDB documentRepo
        await PatientService.addReport(patientId, {
          id: `rep-${resData.study.id}`,
          patientId: patientId,
          title: selectedFile.name,
          category: "Other",
          uploadedAt: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
          validationStatus: "Uploaded",
          source: "Patient Portal",
          downloadable: true,
          shareable: true,
          date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
          status: "Uploaded",
          type: "mammogram"
        });

        // 2. Set reportsUploaded to true in PatientRecord
        const patient = await PatientService.getPatient(patientId);
        if (patient) {
          patient.clinicalJourney = {
            assessmentSubmitted: patient.clinicalJourney?.assessmentSubmitted ?? false,
            reportsUploaded: true,
            aiAnalysisStatus: patient.clinicalJourney?.aiAnalysisStatus ?? "PENDING",
            radiologyStatus: patient.clinicalJourney?.radiologyStatus ?? "PENDING",
            appointmentStatus: patient.clinicalJourney?.appointmentStatus ?? "NOT_SCHEDULED",
            doctorReviewStatus: patient.clinicalJourney?.doctorReviewStatus ?? "AWAITING_REVIEW",
            waitingTime: patient.clinicalJourney?.waitingTime ?? "0 hrs"
          };
          await PatientService.updatePatientRecord(patient);
        }
      }

      setUploadSuccess(true);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error(error);
      alert("Report upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F8FA] text-slate-800 font-sans">

      {/* ─── HERO CARD ──────────────────────────────────────────────────────── */}
      <div className="px-6 pt-6 pb-0">
        <div className="relative bg-gradient-to-br from-primary via-[#007066] to-accent-teal rounded-[28px] p-8 overflow-hidden">
          {/* Background subtle pattern */}
          <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`, backgroundSize: "28px 28px" }} />

          <div className="relative z-10 flex flex-col lg:flex-row gap-8 items-start lg:items-center justify-between">
            <div className="space-y-4 max-w-xl">
              {/* Status badge */}
              <div className="inline-flex items-center gap-2 bg-white/15 border border-white/25 rounded-full px-3 py-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${carePlanDone ? "bg-emerald-400 animate-pulse" : "bg-amber-400 animate-pulse"}`} />
                <span className="text-[10px] font-bold text-white/90 uppercase tracking-wider">
                  {carePlanDone ? "All Stages Completed" : `${activeLabel} In Progress`}
                </span>
              </div>

              {/* Greeting */}
              <div>
                <p className="text-white/60 text-sm font-medium">{greeting},</p>
                <h1 className="text-3xl font-black text-white tracking-tight leading-tight mt-0.5">{(patientRecord?.name || data.patientName).split(" ")[0]}.</h1>
              </div>

              {/* Current recommendation */}
              <p className="text-white/75 text-sm leading-relaxed">
                {activeLabel === "Assessment" && "Please complete your symptom and medical history questionnaire to begin your diagnostic journey."}
                {activeLabel === "Scan Upload" && "Your intake assessment is received. Please upload your mammogram scans or clinical reports to begin AI processing."}
                {activeLabel === "AI Analysis" && "Your scans are successfully uploaded. Our AI engine is currently analyzing your images for diagnostic checkpoints."}
                {activeLabel === "Doctor Review" && "Your AI analysis is complete. Lead Oncologist Dr. Sarah Iyer is currently reviewing your findings."}
                {activeLabel === "Appointment" && "Your clinical review is complete. Please schedule your specialist consultation to discuss the next steps."}
                {activeLabel === "Care Plan" && "Your consultation is complete. A personalized wellness and care plan is being prepared for you."}
                {!dynamicJourneySteps.some(s => s.status === "active") && "Your diagnostic journey is complete. All reports and recommendations are active in your portal."}
              </p>

              {/* Review progress */}
              <div className="space-y-2">
                {(() => {
                  const completedStagesCount =
                    (assessmentDone ? 1 : 0) +
                    (scanDone ? 1 : 0) +
                    (aiDone ? 2 : 0) + // AI Complete + Assigned
                    (doctorDone ? 2 : 0) + // Specialist Review + Report Finalisation
                    (carePlanDone ? 1 : 0); // Patient Delivery
                  const pipelinePercent = Math.round((completedStagesCount / 7) * 100);
                  const activeBarCount = Math.max(1, Math.round(pipelinePercent / 10));
                  return (
                    <>
                      <div className="flex justify-between text-[10px] font-bold text-white/60">
                        <span>Review Pipeline</span>
                        <span className="text-white">{pipelinePercent}% Complete</span>
                      </div>
                      <div className="flex gap-1">
                        {Array.from({ length: 10 }).map((_, i) => (
                          <div key={i} className={`h-2 flex-1 rounded-full ${i < activeBarCount ? "bg-white" : "bg-white/20"}`} />
                        ))}
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-white/60">
                        <Clock className="w-3.5 h-3.5" /> Estimated: {carePlanDone ? "Delivered" : "Today · 5:00 PM"}
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* CTAs */}
              <div className="flex flex-wrap gap-3 pt-1">
                <button onClick={() => setActivePanel("trackReview")}
                  className="group flex items-center gap-2 px-4 py-2.5 bg-white text-primary font-bold text-xs rounded-xl hover:bg-white/90 transition-all cursor-pointer shadow-lg shadow-black/10">
                  Track Review <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
                <button onClick={() => setViewingReport({ title: "AI Clinical Intelligence Overview", date: "Nov 13, 2025" })}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white/15 border border-white/25 text-white font-bold text-xs rounded-xl hover:bg-white/20 transition-all cursor-pointer">
                  View AI Summary
                </button>
              </div>
            </div>

            {/* Right side: Trust badges */}
            <div className="flex flex-col gap-3 shrink-0">
              {[
                { 
                  label: doctorDone ? "Doctor Validated" : "Assigned Specialist", 
                  sub: "Dr. Sarah Iyer", 
                  icon: ShieldCheck, 
                  color: doctorDone ? "bg-emerald-400/20 text-emerald-300 border-emerald-400/30" : "bg-white/10 text-white/80 border-white/20" 
                },
                { 
                  label: scanDone ? "BI-RADS Staging" : "Diagnostic Scan", 
                  sub: scanDone ? "Benign · Low Risk" : "Pending Upload", 
                  icon: CheckCircle, 
                  color: scanDone ? "bg-blue-400/20 text-blue-300 border-blue-400/30" : "bg-white/10 text-white/80 border-white/20" 
                },
                { 
                  label: "AI Diagnostic Engine", 
                  sub: assessmentDone ? "Analysis Active" : "Intake Ready", 
                  icon: BrainCircuit, 
                  color: assessmentDone ? "bg-violet-400/20 text-violet-300 border-violet-400/30" : "bg-white/10 text-white/80 border-white/20" 
                },
              ].map((b, i) => {
                const Icon = b.icon;
                return (
                  <div key={i} className={`flex items-center gap-3 px-4 py-3 rounded-2xl border ${b.color} glass-card`} style={{ background: "rgba(255,255,255,0.08)" }}>
                    <Icon className={`w-4 h-4 ${b.color.split(" ")[1] || "text-white"}`} />
                    <div>
                      <p className="text-[10px] font-bold text-white">{b.label}</p>
                      <p className={`text-[9px] ${b.color.split(" ")[1] || "text-white/80"} opacity-80`}>{b.sub}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Center Column: Prominent Health Score & Risk (3 cols) */}
            <div className="lg:col-span-3 flex flex-col justify-between items-center text-center p-6 bg-white/90 border border-white/50 rounded-[28px] shadow-md relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-[#005F56]/5 rounded-bl-full pointer-events-none" />

              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-slate-750 font-bold">Overall Wellness Score</span>
                <div className="group/tooltip relative cursor-pointer z-20">
                  <Info className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600" />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/tooltip:block bg-slate-950 text-white text-[10px] p-3 rounded-xl shadow-xl w-60 z-30 leading-normal text-left font-medium">
                    <p className="font-bold text-emerald-400 mb-1">Score Clarification</p>
                    {patientData.isAssessed 
                      ? "The Overall Wellness Score reflects your general lifestyle & health calibrated against your Clinical AI Risk Assessment." 
                      : "Complete your symptom and medical history questionnaire via the AI Assistant to generate your clinical risk and wellness scores."}
                  </div>
                </div>
              </div>

              {/* Circular Gauge Ring */}
              <div className="relative w-28 h-28 my-3 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  {/* Track ring */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#E2E8F0"
                    strokeWidth="7.5"
                    fill="transparent"
                    strokeDasharray={patientData.isAssessed ? undefined : "4 4"}
                  />
                  {/* Active progress ring */}
                  {patientData.isAssessed && patientData.wellnessScore !== null && (
                    <motion.circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke={patientData.strokeColor}
                      strokeWidth="8.5"
                      strokeLinecap="round"
                      fill="transparent"
                      strokeDasharray="251.2"
                      initial={{ strokeDashoffset: 251.2 }}
                      animate={{ strokeDashoffset: 251.2 - (251.2 * patientData.wellnessScore) / 100 }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                    />
                  )}
                </svg>

                {/* Score Text in Center */}
                <div className="absolute flex flex-col items-center">
                  <motion.span
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className={`text-3xl font-black leading-none tracking-tighter ${patientData.scoreTextColor}`}
                  >
                    {patientData.wellnessScore !== null ? patientData.wellnessScore : "—"}
                  </motion.span>
                  <span className="text-[8px] text-slate-450 font-bold uppercase tracking-wider mt-0.5">
                    {patientData.isAssessed ? "/100" : "Pending Intake"}
                  </span>
                </div>
              </div>

              {/* Risk badge indicator */}
              <div className="w-full">
                <span className="text-[8px] text-slate-450 font-black uppercase tracking-wider block mb-1.5">Breast Screening Risk</span>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border transition-all ${patientData.riskBadgeColor}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${patientData.isAssessed ? "bg-amber-500 animate-pulse" : "bg-slate-400"}`} />
                  {patientData.riskLevel}
                </span>
              </div>
            </div>

            {/* Right Column: Doctor, Appointment, Action CTAs (4 cols) */}
            <div className="lg:col-span-4 flex flex-col justify-between space-y-4">

              {/* Doctor & Appointment info stack */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
                {/* Doctor */}
                <div className="bg-white/90 border border-white/50 rounded-2xl p-3 flex gap-3 items-center shadow-sm">
                  <div className="w-9 h-9 rounded-xl shrink-0 bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-xs font-black">
                    {patientData.assignedDoctor.initials}
                  </div>
                  <div className="text-left">
                    <span className="text-[8px] text-slate-400 font-black uppercase tracking-wider block">Assigned Specialist</span>
                    <p className="text-xs font-black text-slate-800">{patientData.assignedDoctor.name}</p>
                    <p className="text-[9px] text-slate-500 font-semibold">{patientData.assignedDoctor.specialty}</p>
                  </div>
                </div>

                {/* Appointment */}
                <div className="bg-white/90 border border-white/50 rounded-2xl p-3 flex gap-3 items-center shadow-sm">
                  <div className="w-9 h-9 rounded-xl shrink-0 bg-emerald-50 border border-emerald-150 flex items-center justify-center text-emerald-600">
                    <CalendarDays className="w-4.5 h-4.5" />
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <div className="flex justify-between items-baseline gap-1">
                      <span className="text-[8px] text-slate-400 font-black uppercase tracking-wider block">Upcoming Visit</span>
                      <span className="px-1.5 py-0.5 rounded-full text-[7px] font-black bg-emerald-50 text-emerald-700 uppercase tracking-widest border border-emerald-250">Video</span>
                    </div>
                    <p className="text-xs font-black text-slate-800 truncate">{patientData.upcomingAppointment.date}</p>
                    <p className="text-[9px] text-slate-500 font-semibold">{patientData.upcomingAppointment.time}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons CTAs - Secondary Enterprise Healthcare Controls */}
              <div className="dashboard-hero-actions flex flex-col gap-3 w-full shrink-0">
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => setActivePanel("trackReview")}
                  className="group w-full h-[46px] px-4 bg-white/95 hover:bg-emerald-50/90 text-[#005F56] border border-white/60 hover:border-emerald-200/80 focus:outline-none font-semibold text-xs sm:text-[14px] leading-none rounded-xl transition-all cursor-pointer flex items-center justify-between shadow-xs box-border"
                >
                  <span>View Diagnostic Journey</span>
                  <ArrowRight className="w-4 h-4 shrink-0 text-[#005F56] transition-transform duration-200 group-hover:translate-x-0.5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => setViewingReport({ title: "AI Clinical Intelligence Overview", date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) })}
                  className="group w-full h-[46px] px-4 bg-white/95 hover:bg-emerald-50/90 text-[#005F56] border border-white/60 hover:border-emerald-200/80 focus:outline-none font-semibold text-xs sm:text-[14px] leading-none rounded-xl transition-all cursor-pointer flex items-center justify-between shadow-xs box-border"
                >
                  <span>View AI Summary</span>
                  <ArrowRight className="w-4 h-4 shrink-0 text-[#005F56] transition-transform duration-200 group-hover:translate-x-0.5" />
                </motion.button>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* ─── MAIN GRID ──────────────────────────────────────────────────────── */}
      <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-5">

        {/* ── LEFT COLUMN (9 cols) ──────────────────────────────────────────── */}
        <div className="lg:col-span-9 space-y-5">

          {/* ─ Health Journey Timeline ─ */}
          <div className="card-base p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-slate-800">Your Diagnostic Journey</h2>
              <span className="text-[10px] text-slate-400 font-medium">
                Step {currentStepNumber} of 6 · {carePlanDone ? "Completed" : "In Progress"}
              </span>
            </div>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {dynamicJourneySteps.map((step, idx) => {
                const Icon = step.icon;
                return (
                  <div key={idx} className="flex flex-col items-center text-center gap-2.5 group">
                    <div className={`relative w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-all duration-300 cursor-default
                      ${step.status === "completed" ? "bg-primary border-primary text-white shadow-md shadow-primary/20" : ""}
                      ${step.status === "active" ? "bg-white border-primary text-primary stage-active-ring" : ""}
                      ${step.status === "upcoming" ? "bg-slate-50 border-slate-200 text-slate-400" : ""}
                      ${step.status === "pending" ? "bg-slate-50 border-slate-100 text-slate-300" : ""}
                    `}>
                      {step.status === "completed" ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                    </div>
                    <p className={`text-[10px] font-semibold ${step.status === "active" ? "text-primary" : step.status === "completed" ? "text-slate-700" : "text-slate-400"}`}>
                      {step.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>



          {/* ─ Personalized Care Plan Summary (Clinician Instructions checklist is inside View Full Plan) ─ */}
          {(() => {
            const isCarePlanIssued = !!(patientRecord?.carePlanIssued && patientRecord?.carePlanNotes?.trim());
            if (!isCarePlanIssued) return null;

            return (
              <div className="card-base p-6 text-left border-l-4 border-l-primary space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Clinical Protocol</span>
                    <h2 className="font-bold text-slate-800 text-sm">Personalized Health Care Plan</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[9.5px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                      Active Protocol
                    </span>
                    <button
                      onClick={() => router.push("/patient/care/plan")}
                      className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      View Full Plan <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="p-3.5 bg-teal-50/60 border border-teal-200/60 rounded-xl text-xs text-teal-950 font-medium space-y-1">
                  <p className="font-bold text-teal-900 flex items-center gap-1.5">
                    <Stethoscope className="w-4 h-4 text-primary" /> Doctor's Guidance Notes:
                  </p>
                  <p className="text-slate-700 text-xs leading-relaxed">
                    {patientRecord.carePlanNotes}
                  </p>
                </div>
              </div>
            );
          })()}

          {/* ─ Wellness Insights ─ */}
          <div className="card-base p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-slate-800">Wellness Insights</h2>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200">
                {data.bmi.category}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

              
              {/* BMI Visual */}
              <div className="space-y-5">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Body Mass Index</p>
                  <div className="flex items-baseline gap-3">
                    <span className="text-5xl font-black text-slate-800 tracking-tight">{data.bmi.value}</span>
                    <span className="text-sm text-slate-400 font-medium">kg/m²</span>
                  </div>
                </div>
                {/* Range track */}
                <div className="space-y-1.5">
                  <div className="relative h-3 rounded-full overflow-hidden flex">
                    <div className="h-full bg-blue-400" style={{ width: "25%" }} />
                    <div className="h-full bg-emerald-400" style={{ width: "35%" }} />
                    <div className="h-full bg-amber-400" style={{ width: "20%" }} />
                    <div className="h-full bg-rose-400" style={{ width: "20%" }} />
                    {/* Pin */}
                    <div className="absolute inset-y-0 flex items-center" style={{ left: "70%" }}>
                      <div className="w-4 h-4 rounded-full bg-slate-800 border-2 border-white shadow-lg -translate-x-1/2" />
                    </div>
                  </div>
                  <div className="flex justify-between text-[9px] text-slate-400 font-bold pt-1">
                    <span>Underweight<br />&lt; 18.5</span>
                    <span className="text-center">Healthy<br />18.5–24.9</span>
                    <span className="text-center">Overweight<br />25–29.9</span>
                    <span className="text-right">Obese<br />&gt; 30</span>
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  BMI is a general wellness reference. It does not represent a clinical cancer diagnosis.
                </p>
              </div>

              {/* Wellness Metrics */}
              <div className="space-y-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Today's Goals</p>
                <WellnessMetric label="Hydration" value={6} max={8} unit=" glasses" color="text-blue-500" icon={Droplets} />
                <WellnessMetric label="Sleep" value={7.5} max={8} unit=" hrs" color="text-violet-500" icon={Moon} />
                <WellnessMetric label="Activity" value={50} max={150} unit=" min" color="text-emerald-500" icon={Activity} />
                <WellnessMetric label="Nutrition Score" value={72} max={100} unit="%" color="text-orange-500" icon={Utensils} />
              </div>
            </div>
          </div>

          {/* ─ Mammogram AI Preview ─ */}
          <div className="card-base p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-slate-800">AI Imaging Intelligence</h2>
              <span className="badge-live">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Overlay Active
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* Scan preview */}
              <div
                className="relative rounded-2xl overflow-hidden bg-slate-950 aspect-video flex items-center justify-center group cursor-pointer border border-slate-800"
                onClick={() => setViewingReport({ title: "AI Clinical Intelligence Overview", date: "Nov 13, 2025" })}
              >
                <div className="absolute inset-0 flex items-center justify-center opacity-20">
                  <BrainCircuit className="w-20 h-20 text-white" />
                </div>
                {/* ROI ring */}
                <div className="absolute top-[35%] left-[40%] w-14 h-14 rounded-full border-2 border-dashed border-teal-400/80 animate-pulse flex items-center justify-center">
                  <span className="text-[7px] text-teal-400 font-black">ROI</span>
                </div>
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/20 transition-all duration-300 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-all duration-200 bg-white text-slate-800 text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2">
                    <Eye className="w-4 h-4" /> View AI Analysis
                  </div>
                </div>
                {/* Labels */}
                <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-sm rounded-lg px-2.5 py-1.5 text-[9px] text-white font-bold">
                  Nov 12 Scan
                </div>
                <div className="absolute bottom-3 right-3 bg-black/50 backdrop-blur-sm rounded-lg px-2.5 py-1.5 text-[9px] text-emerald-400 font-bold">
                  99.4% Confidence
                </div>
              </div>

              {/* Details */}
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">AI Findings</p>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    3 regions of interest identified and annotated. All classified as benign tissue variation consistent with normal parenchyma. Queued for Dr. Sarah Iyer's final review.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "BI-RADS", value: "Category 2", color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
                    { label: "Anomaly Index", value: "Low Risk", color: "text-blue-700 bg-blue-50 border-blue-200" },
                  ].map((f, i) => (
                    <div key={i} className={`p-3 rounded-xl border text-center ${f.color}`}>
                      <p className="text-[9px] font-bold uppercase tracking-wider opacity-70">{f.label}</p>
                      <p className="font-bold text-sm mt-0.5">{f.value}</p>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setViewingReport({ title: "AI Clinical Intelligence Overview", date: "Nov 13, 2025" })}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-50 border border-slate-200 hover:border-primary/30 hover:bg-primary/5 text-slate-700 hover:text-primary text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  View Full AI Report <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* ─ Appointment + Care Plan ─ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* Appointment */}
            <div className="card-base p-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Next Appointment</p>
                    <h3 className="font-bold text-slate-800 mt-1">Dr. Sarah Iyer</h3>
                    <p className="text-xs text-slate-500">Lead Oncologist · IIT Indore</p>
                  </div>
                  <div className="text-right">
                    <div className="bg-primary/8 border border-primary/20 rounded-2xl px-3 py-2 text-center">
                      <p className="text-[9px] text-primary font-bold uppercase">Nov</p>
                      <p className="text-2xl font-black text-primary leading-tight">18</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 p-3 bg-slate-50 border border-slate-100 rounded-xl">
                  <Video className="w-4 h-4 text-primary shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-slate-700">Telehealth Video Consult</p>
                    <p className="text-[10px] text-slate-400">3:00 PM · Link active 5 min before</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 text-xs font-bold">SI</div>
                  <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full w-3/4 bg-primary rounded-full" />
                  </div>
                  <span className="text-[9px] text-slate-400 font-bold">3 days</span>
                </div>
              </div>

              <div className="flex gap-2.5 pt-4 mt-4 border-t border-slate-100">
                <button onClick={() => setActivePanel("bookAppointment")}
                  className="flex-1 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow-md shadow-primary/15 transition-all cursor-pointer">
                  Join Call
                </button>
                <button onClick={() => setActivePanel("bookAppointment")}
                  className="px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold rounded-xl transition-all cursor-pointer">
                  Reschedule
                </button>
              </div>
            </div>

            {/* Care Plan */}
            <div className="card-base p-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-800">Today's Care Plan</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">Daily wellness goals</p>
                  </div>
                  {/* SVG Ring */}
                  <div className="relative w-14 h-14">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 68 68">
                      <circle cx="34" cy="34" r={radius} fill="none" stroke="#f1f5f9" strokeWidth="5" />
                      <circle cx="34" cy="34" r={radius} fill="none" stroke="#005F56" strokeWidth="5"
                        strokeDasharray={circumference} strokeDashoffset={dashoffset}
                        className="transition-all duration-700" strokeLinecap="round"
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-[11px] font-black text-primary">{progressPercent}%</span>
                  </div>
                </div>

                <div className="space-y-2">
                  {tasks.slice(0, 4).map(task => (
                    <div key={task.id} onClick={() => toggleTask(task.id)}
                      className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 hover:border-slate-200 rounded-xl transition-all cursor-pointer group">
                      <div className={`w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${task.completed ? "bg-primary border-primary" : "border-slate-300 group-hover:border-primary/50"}`}>
                        {task.completed && <CheckCircle className="w-3 h-3 text-white" />}
                      </div>
                      <span className={`text-xs flex-1 ${task.completed ? "line-through text-slate-400" : "text-slate-600 font-medium"}`}>
                        {task.task}
                      </span>
                      <span className="text-[9px] text-slate-400 font-medium">{task.time}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button onClick={() => setActivePanel("exercisePlan")}
                className="mt-4 pt-4 border-t border-slate-100 w-full flex items-center justify-center gap-1.5 text-[11px] font-bold text-primary hover:underline cursor-pointer">
                <BookOpen className="w-3.5 h-3.5" /> View Full Exercise Plan
              </button>
            </div>
          </div>

          {/* ─ Diagnostic Reports ─ */}
          <div className="card-base p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-slate-800">Diagnostic Reports</h2>
              <button className="text-[11px] text-primary font-bold hover:underline cursor-pointer flex items-center gap-1">
                View all <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {data.recentReports.map((report, idx) => (
                <div key={idx}
                  className="group p-4 bg-slate-50 border border-slate-100 hover:border-primary/20 hover:bg-white rounded-2xl transition-all duration-200 flex flex-col gap-3 cursor-pointer"
                  onClick={() => setViewingReport(report)}
                >
                  <div className="flex items-start justify-between">
                    <div className="w-9 h-9 rounded-xl bg-primary/8 border border-primary/15 flex items-center justify-center">
                      <FileText className="w-4.5 h-4.5 text-primary" />
                    </div>
                    <button className="opacity-0 group-hover:opacity-100 transition-opacity w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center">
                      <MoreHorizontal className="w-3.5 h-3.5 text-slate-500" />
                    </button>
                  </div>
                  <div>
                    <p className="font-semibold text-xs text-slate-800 leading-tight">{report.title}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Uploaded: {report.date}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="badge-verified text-[9px]">
                      <ShieldCheck className="w-3 h-3" /> Validated
                    </span>
                  </div>
                  <div className="flex gap-2 pt-1 border-t border-slate-100">
                    <button onClick={e => { e.stopPropagation(); setViewingReport(report); }}
                      className="flex-1 py-1.5 flex items-center justify-center gap-1 text-[10px] font-bold text-slate-600 hover:text-primary bg-white border border-slate-200 hover:border-primary/30 rounded-lg transition-all">
                      <ExternalLink className="w-3 h-3" /> View
                    </button>
                    <button onClick={e => { e.stopPropagation(); setViewingReport(report); }}
                      className="flex-1 py-1.5 flex items-center justify-center gap-1 text-[10px] font-bold text-slate-600 hover:text-primary bg-white border border-slate-200 hover:border-primary/30 rounded-lg transition-all">
                      <Download className="w-3 h-3" /> PDF
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* ── RIGHT COLUMN (3 cols) ─────────────────────────────────────────── */}
        <div className="lg:col-span-3 space-y-4">

          {/* Notifications Bell */}
          <div className="card-base p-4 flex items-center justify-between">
            <div>
              <p className="font-bold text-sm text-slate-800">Notifications</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{notifCount} new alerts</p>
            </div>
            <button
              onClick={() => setActivePanel("notifications")}
              className="relative w-10 h-10 bg-slate-50 border border-slate-200 hover:border-primary/30 hover:bg-primary/5 rounded-xl flex items-center justify-center text-slate-600 hover:text-primary cursor-pointer transition-all"
            >
              <Bell className="w-4.5 h-4.5" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full flex items-center justify-center text-[8px] text-white font-black">{notifCount}</span>
            </button>
          </div>

          {/* Quick Actions */}
          <div className="card-base p-5 space-y-3">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Quick Actions</p>
            <div className="space-y-2">
              {[
                { label: "Start New Assessment", icon: ClipboardList, action: "newAssessment" as ActivePanel, color: "text-primary bg-primary/8 border-primary/15" },
                { label: "Book Appointment", icon: CalendarDays, action: "bookAppointment" as ActivePanel, color: "text-blue-600 bg-blue-50 border-blue-200" },
                { label: "Upload Report", icon: Scan, action: "uploadReport" as ActivePanel, color: "text-violet-600 bg-violet-50 border-violet-200" },
                { label: "Download Reports", icon: Download, action: "downloadReports" as ActivePanel, color: "text-slate-600 bg-slate-50 border-slate-200" },
                { label: "Message Doctor", icon: MessageSquare, action: "messageDoctor" as ActivePanel, color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
                { label: "Emergency Contact", icon: Phone, action: "emergency" as ActivePanel, color: "text-rose-600 bg-rose-50 border-rose-200" },
              ].map((act, i) => {
                const Icon = act.icon;
                return (
                  <button key={i} onClick={() => setActivePanel(act.action)}
                    className="w-full flex items-center justify-between p-3 bg-white border border-slate-100 hover:border-primary/20 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-7 h-7 rounded-lg border flex items-center justify-center ${act.color}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      {act.label}
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-400 transition-colors" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Daily Wellness Tip */}
          <div className="card-base p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Today's Tip</p>
            </div>
            <h4 className="font-bold text-slate-800 text-sm leading-tight">30 minutes of walking cuts cancer recurrence risk by 25%.</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Moderate aerobic exercise daily supports immune function, reduces inflammation, and improves treatment outcomes.
            </p>
            <button onClick={() => setActivePanel("exercisePlan")}
              className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer">
              View Exercise Plan <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* Medical ID Card */}
          <div className="relative overflow-hidden rounded-2xl gradient-primary p-5 space-y-3">
            <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`, backgroundSize: "20px 20px" }} />
            <div className="relative flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-bold text-white text-sm">{data.patientName}</p>
                <p className="text-[10px] text-white/60">IIT-MC-9281 · Patient</p>
              </div>
            </div>
            <div className="relative grid grid-cols-2 gap-2 text-[9px]">
              {[
                { label: "Age", value: "34" },
                { label: "Blood Group", value: "O+ve" },
                { label: "Cohort", value: "IIT Indore" },
                { label: "Status", value: "Active" },
              ].map((f, i) => (
                <div key={i} className="bg-white/10 rounded-lg px-2.5 py-2">
                  <p className="text-white/50 font-bold uppercase">{f.label}</p>
                  <p className="text-white font-bold mt-0.5">{f.value}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* ── FLOATING CHATBOT ────────────────────────────────────────────────── */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        {showChatbot && (
          <BreastCareAssistant 
            onClose={() => setShowChatbot(false)} 
            onAssessmentComplete={async () => {
              if (user) {
                const updated = await PatientService.getPatient(user.id);
                setPatientRecord(updated);
              }
            }}
          />
        )}
        <button
          onClick={() => setShowChatbot(!showChatbot)}
          className={`w-14 h-14 gradient-primary rounded-full flex items-center justify-center shadow-xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all cursor-pointer ${showChatbot ? "rotate-45" : ""}`}
          title="NariSetu Assistant"
          aria-label="Open NariSetu Assistant"
        >
          {showChatbot ? <X className="w-5 h-5 text-white" /> : <MessageSquare className="w-5 h-5 text-white" />}
        </button>
      </div>

      {/* ── PANEL OVERLAYS ──────────────────────────────────────────────────── */}
      {activePanel === "trackReview" && <TrackReviewPanel patient={patientRecord} onClose={() => setActivePanel(null)} />}
      {activePanel === "exercisePlan" && <ExercisePlanPanel onClose={() => setActivePanel(null)} />}
      {activePanel === "notifications" && <NotificationDrawer onClose={() => setActivePanel(null)} />}
      {viewingReport && <ReportViewerModal report={viewingReport} onClose={() => setViewingReport(null)} />}

      {/* Quick Action Modals */}
      {["newAssessment", "bookAppointment", "uploadReport", "downloadReports", "messageDoctor", "emergency"].includes(activePanel ?? "") && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/30 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-[24px] shadow-2xl max-w-md w-full p-8 border border-slate-100 animate-scale-in space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800">
                {activePanel === "newAssessment" && "Start New Assessment"}
                {activePanel === "bookAppointment" && "Book Appointment"}
                {activePanel === "uploadReport" && "Upload Report"}
                {activePanel === "downloadReports" && "Download Reports"}
                {activePanel === "messageDoctor" && "Message Dr. Sarah Iyer"}
                {activePanel === "emergency" && "Emergency Contact"}
              </h3>
              <button onClick={() => setActivePanel(null)} className="w-8 h-8 hover:bg-slate-100 rounded-xl flex items-center justify-center cursor-pointer">
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            {activePanel === "newAssessment" && (
              <div className="space-y-4">
                <p className="text-xs text-slate-500">A new symptom questionnaire helps your care team track your current health status.</p>
                <div className="space-y-2">
                  {["1. Symptom Check", "2. Medical History Update", "3. Lifestyle Factors", "4. Upload New Imaging"].map((s, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-600">{s}</div>
                  ))}
                </div>
                <button
                  onClick={() => {
                    setActivePanel(null);
                    router.push("/patient/risk-assessment");
                  }}
                  className="w-full py-3 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow-md shadow-primary/15 cursor-pointer transition-colors"
                >
                  Begin Assessment
                </button>
              </div>
            )}
            {activePanel === "bookAppointment" && (
              <div className="space-y-4">
                <p className="text-xs text-slate-500">Select a date for your next consultation with Dr. Sarah Iyer.</p>
                <div className="grid grid-cols-3 gap-2">
                  {["Nov 19", "Nov 20", "Nov 21", "Nov 22", "Nov 25", "Nov 26"].map((d, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        const evt = new CustomEvent("patient-appointment-requested", { detail: { date: d } });
                        window.dispatchEvent(evt);
                        setActivePanel(null);
                        alert(`Appointment for ${d} has been requested. Waiting for doctor's confirmation.`);
                      }}
                      className={`py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer border-slate-200 text-slate-600 hover:border-primary/40 hover:text-primary`}>
                      {d}
                    </button>
                  ))}
                </div>
                <div className="space-y-2 mt-4 pt-4 border-t border-slate-100">
                  <p className="text-xs font-bold text-slate-700">Or request a custom date manually:</p>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      min={new Date().toISOString().split("T")[0]}
                      value={customAppointmentDate}
                      onChange={(e) => setCustomAppointmentDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all text-slate-600 font-semibold"
                    />
                    <button
                      type="button"
                      disabled={!customAppointmentDate}
                      onClick={() => {
                        if (customAppointmentDate) {
                          const evt = new CustomEvent("patient-appointment-requested", { detail: { date: customAppointmentDate } });
                          window.dispatchEvent(evt);
                          setActivePanel(null);
                          alert(`Appointment for ${customAppointmentDate} has been requested. Waiting for doctor's confirmation.`);
                          setCustomAppointmentDate("");
                        }
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${customAppointmentDate
                        ? "bg-primary hover:bg-[#004D46] text-white shadow-xs"
                        : "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                        }`}
                    >
                      Request Date
                    </button>
                  </div>
                </div>
              </div>
            )}
            {activePanel === "uploadReport" && (
              <div className="space-y-4">
                <p className="text-xs text-slate-500">Upload new DICOM files, lab results, or letters to your clinical archive.</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={(event) => setSelectedFile(event.target.files?.[0] || null)}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-slate-200 hover:border-primary/40 rounded-2xl p-8 text-center space-y-2 cursor-pointer transition-colors group"
                >
                  <Scan className="w-8 h-8 text-slate-300 group-hover:text-primary mx-auto transition-colors" />
                  <p className="text-xs font-semibold text-slate-500">{selectedFile ? selectedFile.name : "Click to browse"}</p>
                  <p className="text-[10px] text-slate-400">Supports .DCM, .PDF, .JPG, .PNG</p>
                </button>
                <button
                  type="button"
                  onClick={handleUpload}
                  disabled={!selectedFile || uploading}
                  className="w-full py-3 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow-md shadow-primary/15 cursor-pointer transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {uploading ? "Uploading..." : "Upload Files"}
                </button>
                {uploadSuccess && (
                  <p className="text-[11px] text-emerald-600 font-semibold">Upload complete. Your report is now available for review.</p>
                )}
              </div>
            )}
            {activePanel === "downloadReports" && (
              <div className="space-y-3">
                <p className="text-xs text-slate-500">Select reports to download as PDF:</p>
                {data.recentReports.map((r, i) => (
                  <div key={i} className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-100 rounded-xl">
                    <div className="flex items-center gap-2.5">
                      <FileText className="w-4 h-4 text-primary" />
                      <div>
                        <p className="text-xs font-semibold text-slate-700">{r.title}</p>
                        <p className="text-[9px] text-slate-400">{r.date}</p>
                      </div>
                    </div>
                    <button className="flex items-center gap-1 text-[10px] font-bold text-primary hover:underline cursor-pointer">
                      <Download className="w-3 h-3" /> PDF
                    </button>
                  </div>
                ))}
              </div>
            )}
            {activePanel === "messageDoctor" && (
              <div className="space-y-4 text-left">
                <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-xl">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-black">SI</div>
                  <div>
                    <p className="text-xs font-extrabold text-slate-800">Dr. Sarah Iyer &bull; Lead Oncologist</p>
                    <p className="text-[10px] text-slate-400">Direct Secure Clinical Messaging Channel</p>
                  </div>
                </div>

                {/* Message History Container */}
                <div className="h-64 border border-slate-200 rounded-xl p-3.5 overflow-y-auto space-y-3 bg-slate-50/40 text-xs">
                  {patientMessages.length === 0 ? (
                    <p className="text-center text-slate-400 text-xs py-8">No message history yet. Type a message to Dr. Sarah Iyer below.</p>
                  ) : (
                    patientMessages.map((msg) => {
                      const isDoctor = msg.senderRole === "Doctor" || msg.senderRole === "System" || msg.senderId === "doc-001";
                      return (
                        <div
                          key={msg.id}
                          className={`p-3 rounded-2xl max-w-[85%] text-xs space-y-1 ${isDoctor
                            ? "bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-2xs"
                            : "bg-primary text-white ml-auto text-right rounded-br-none"
                            }`}
                        >
                          <p className={`text-[9px] font-bold ${isDoctor ? "text-primary" : "text-teal-200"}`}>
                            {msg.senderName} &bull; {new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                          <p className="text-xs leading-relaxed font-medium">{msg.content}</p>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Message Input Box */}
                <div className="space-y-2">
                  <textarea
                    rows={3}
                    value={doctorMessageText}
                    onChange={(e) => setDoctorMessageText(e.target.value)}
                    placeholder="Type your non-urgent message to Dr. Sarah Iyer..."
                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 resize-none transition-all text-slate-800 font-medium"
                  />
                  <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl flex gap-2">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-amber-700">For emergencies, do not use this form. Call your hospital directly.</p>
                  </div>
                  <button
                    onClick={() => {
                      if (!doctorMessageText.trim()) return;
                      MessageService.sendMessage({
                        patientId: user?.id || "patient-001",
                        senderId: user?.id || "patient-001",
                        senderName: patientRecord?.name || user?.name || "Meera Sharma",
                        senderRole: "Patient",
                        content: doctorMessageText.trim()
                      });
                      setDoctorMessageText("");
                      setPatientMessages(MessageService.getMessagesForPatient(user?.id || "patient-001"));
                    }}
                    className="w-full py-3 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow-md shadow-primary/15 cursor-pointer transition-colors flex items-center justify-center gap-2"
                  >
                    <Send className="w-3.5 h-3.5" /> Send Message
                  </button>
                </div>
              </div>
            )}
            {activePanel === "viewCarePlan" && (
              <div className="space-y-4 text-left">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="font-extrabold text-slate-800 text-sm">Clinical Care Plan &amp; Protocol</h3>
                    <p className="text-[10px] text-slate-400">Issued by Dr. Sarah Iyer &bull; Active Monitoring</p>
                  </div>
                  <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[9px] font-bold uppercase">Active</span>
                </div>

                <div className="p-3 bg-teal-50/60 border border-teal-200/60 rounded-xl text-xs text-teal-950 font-medium space-y-1">
                  <p className="font-extrabold text-teal-900 flex items-center gap-1.5">
                    <Stethoscope className="w-4 h-4 text-primary" /> Doctor's Guidance Notes:
                  </p>
                  <p className="text-slate-700 leading-relaxed text-xs">
                    {patientRecord?.clinicalJourney?.doctorReviewStatus === "COMPLETED"
                      ? "Follow up with 6-month mammogram screening, perform monthly self-breast exams, and maintain your daily hydration and symptom log."
                      : "Complete your initial clinical intake questionnaire and upload previous breast imaging reports for oncologist review."}
                  </p>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Clinician Instructions</span>
                  <div className="space-y-2 max-h-52 overflow-y-auto">
                    {[
                      { title: "6-Month Follow-Up Mammography Screening", category: "Screening", status: "Active" },
                      { title: "Monthly Self-Breast Examination", category: "Lifestyle", status: "Completed" },
                      { title: "Maintain Healthy Diet & Hydration Log", category: "Nutrition", status: "Active" },
                      { title: "Review AI Clinical Intelligence Summary", category: "Report", status: "Completed" }
                    ].map((task, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <CheckCircle className={`w-4 h-4 ${task.status === "Completed" ? "text-primary fill-primary/10" : "text-slate-300"}`} />
                          <span className={`font-semibold ${task.status === "Completed" ? "line-through text-slate-400" : "text-slate-750"}`}>{task.title}</span>
                        </div>
                        <span className="text-[8.5px] font-bold px-1.5 py-0.5 bg-white border border-slate-200 rounded text-slate-500 uppercase">{task.category}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => {
                    setActivePanel(null);
                    router.push("/patient/care/plan");
                  }}
                  className="w-full py-2.5 bg-primary hover:bg-[#004D46] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                >
                  Go to Full Care Plan Page <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
            {activePanel === "emergency" && (
              <div className="space-y-4 text-center">
                <div className="w-16 h-16 rounded-full bg-rose-100 border-2 border-rose-300 flex items-center justify-center mx-auto">
                  <Phone className="w-7 h-7 text-rose-600" />
                </div>
                <div>
                  <p className="font-bold text-slate-800">Emergency Contact</p>
                  <p className="text-xs text-slate-500 mt-1">If you are experiencing a medical emergency, contact your hospital immediately.</p>
                </div>
                <div className="space-y-2.5">
                  {[
                    { label: "IIT Indore Hospital", number: "+91-731-2438-700", color: "bg-rose-500 hover:bg-rose-600 text-white" },
                    { label: "National Emergency", number: "112", color: "bg-slate-800 hover:bg-slate-900 text-white" },
                    { label: "Dr. Sarah Iyer (Urgent)", number: "+91-98765-43210", color: "border border-slate-200 hover:bg-slate-50 text-slate-700" },
                  ].map((c, i) => (
                    <button key={i} className={`w-full py-3 px-4 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center justify-between ${c.color}`}>
                      <span>{c.label}</span>
                      <span className="opacity-70">{c.number}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
