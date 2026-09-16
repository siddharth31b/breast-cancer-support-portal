import React, { useState, useEffect, useMemo } from "react";
import { usePathname, useRouter, useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { PatientService } from "../../services/patient.service";
import { MessageService } from "../../services/message.service";
import type { PatientRecord } from "../../types/questionnaire";
import type { Conversation, ChatMessage } from "../../types/patient-portal";
import MammographyCadStation from "../imaging/MammographyCadStation";
import { 
  ClipboardList, 
  AlertTriangle, 
  Calendar, 
  Clock, 
  ChevronRight,
  Search,
  SlidersHorizontal,
  BrainCircuit,
  Heart,
  Eye,
  Activity,
  Check,
  BookOpen,
  Send,
  FileText,
  AlertCircle,
  Download,
  ExternalLink,
  Plus,
  RefreshCw,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  Stethoscope,
  Sparkles,
  ArrowLeft,
  Loader2,
  Dna,
  Layers
} from "lucide-react";

// ─── Priority helper — case-insensitive ───────────────────────────────────────
function isPriorityCriticalOrHigh(patient: PatientRecord): boolean {
  const p = (patient.priority ?? "").toUpperCase();
  return (
    p === "CRITICAL" ||
    p === "HIGH" ||
    (patient as any).urgentFlag === true ||
    (patient as any).requiresImmediateReview === true
  );
}

// ─── Step status helper ────────────────────────────────────────────────────────
type StepStatus = "completed" | "current" | "pending" | "not_required";

function getJourneyStepStatus(
  stepKey: string,
  patient: PatientRecord
): StepStatus {
  const j = patient.clinicalJourney;
  switch (stepKey) {
    case "intake":
      return (j?.assessmentSubmitted || patient.clinicalIntake?.status === "SUBMITTED") ? "completed" : "current";
    case "reports":
      if (patient.reports && patient.reports.length > 0) return "completed";
      if (j?.reportsUploaded) return "completed";
      return "pending";
    case "imaging":
      if ((j?.radiologyStatus ?? "").toUpperCase() === "COMPLETE") return "completed";
      if (patient.reports?.some(r => r.type === "mammogram" || r.type === "ultrasound")) return "current";
      return "not_required";
    case "ai":
      if ((j?.aiAnalysisStatus ?? "").toUpperCase() === "COMPLETE") return "completed";
      if ((j?.aiAnalysisStatus ?? "").toUpperCase() === "PENDING" && j?.reportsUploaded) return "current";
      return "pending";
    case "radiologist":
      if ((j?.radiologyStatus ?? "").toUpperCase() === "COMPLETE") return "completed";
      if ((j?.radiologyStatus ?? "").toUpperCase() === "PENDING") return "current";
      return "not_required";
    case "doctor":
      if ((j?.doctorReviewStatus ?? "").toUpperCase() === "COMPLETED") return "completed";
      if ((j?.doctorReviewStatus ?? "").toUpperCase().includes("REVIEW") || (j?.doctorReviewStatus ?? "").toUpperCase() === "IN_QUEUE") return "current";
      return "pending";
    case "careplan":
      if ((j?.carePlanStatus ?? "").toUpperCase() === "COMPLETED") return "completed";
      if ((j?.doctorReviewStatus ?? "").toUpperCase() === "COMPLETED") return "current";
      return "pending";
    case "followup":
      if (j?.appointmentStatus === "SCHEDULED" || j?.appointmentStatus === "CONFIRMED" || j?.appointmentStatus === "COMPLETED") return "completed";
      if (j?.appointmentStatus === "REQUESTED") return "current";
      return "pending";
    default:
      return "pending";
  }
}

// ─── Care Journey Stepper ─────────────────────────────────────────────────────
const JOURNEY_STEPS = [
  { key: "intake",      label: "Intake",            tabId: "intake" },
  { key: "reports",     label: "Reports Uploaded",   tabId: "reports" },
  { key: "imaging",     label: "Imaging Review",     tabId: "imaging" },
  { key: "ai",          label: "AI Assistance",      tabId: "ai" },
  { key: "radiologist", label: "Radiologist Review", tabId: "imaging" },
  { key: "doctor",      label: "Doctor Review",      tabId: "review" },
  { key: "careplan",    label: "Care Plan",          tabId: "careplan" },
  { key: "followup",    label: "Follow-Up",          tabId: "appointments" },
];

interface CareJourneyStepperProps {
  patient: PatientRecord;
  onTabChange: (tabId: string) => void;
}

const CareJourneyStepper: React.FC<CareJourneyStepperProps> = ({ patient, onTabChange }) => {
  const statuses: StepStatus[] = JOURNEY_STEPS.map(s =>
    getJourneyStepStatus(s.key, patient)
  );

  // Determine the current step label for the summary
  const currentStepIdx = statuses.findIndex(s => s === "current");
  const lastCompletedIdx = statuses.reduce((acc, s, i) => s === "completed" ? i : acc, -1);
  const summaryStepIdx = currentStepIdx >= 0 ? currentStepIdx : lastCompletedIdx + 1;
  const summaryStep = JOURNEY_STEPS[summaryStepIdx];

  const summaryMessages: Record<string, string> = {
    intake: "Patient intake form is in progress. Complete the questionnaire to proceed.",
    reports: "Intake complete. Reports and imaging documents are awaited.",
    imaging: "Reports received. Awaiting radiologist imaging review.",
    ai: "Imaging available. AI analysis is processing or pending.",
    radiologist: "AI assessment ready. Awaiting specialist radiologist review.",
    doctor: "AI and radiologist observations are available for clinician review.",
    careplan: "Clinical review finalised. Care plan is awaiting creation.",
    followup: "Care plan active. Follow-up appointment to be scheduled.",
  };

  const getStepStyle = (status: StepStatus) => {
    switch (status) {
      case "completed":
        return {
          circle: "bg-primary border-primary text-white",
          label: "text-primary font-bold",
          connector: "bg-primary"
        };
      case "current":
        return {
          circle: "bg-white border-primary border-2 text-primary ring-2 ring-primary/20",
          label: "text-primary font-extrabold",
          connector: "bg-slate-200"
        };
      case "not_required":
        return {
          circle: "bg-slate-100 border-slate-200 text-slate-400",
          label: "text-slate-400 font-medium",
          connector: "bg-slate-200"
        };
      default: // pending
        return {
          circle: "bg-white border-slate-200 text-slate-400",
          label: "text-slate-400 font-medium",
          connector: "bg-slate-200"
        };
    }
  };

  return (
    <div className="space-y-4">
      {/* Summary pill */}
      {summaryStep && (
        <div className="flex items-center gap-2 text-xs">
          <span className="font-bold text-slate-600">Current stage:</span>
          <span className="px-2.5 py-0.5 bg-primary/10 text-primary font-extrabold rounded-full border border-primary/20 text-[10px] uppercase tracking-wide">
            {summaryStep.label}
          </span>
        </div>
      )}
      {summaryStep && (
        <p className="text-[11px] text-slate-500 leading-relaxed">
          {summaryMessages[summaryStep.key] ?? ""}
        </p>
      )}

      {/* Desktop + Tablet: horizontal scrollable stepper */}
      <div
        className="relative overflow-x-auto pb-2"
        style={{ WebkitOverflowScrolling: "touch" }}
        aria-label="Care journey progress"
      >
        <ol
          className="flex items-start"
          style={{ minWidth: `${JOURNEY_STEPS.length * 130}px` }}
        >
          {JOURNEY_STEPS.map((step, idx) => {
            const status = statuses[idx];
            const style = getStepStyle(status);
            const isClickable = status !== "pending" && status !== "not_required";
            const prevCompleted = idx === 0 || statuses[idx - 1] === "completed";

            return (
              <li
                key={step.key}
                className="flex-1 flex flex-col items-center relative"
                aria-label={`Step ${idx + 1} of ${JOURNEY_STEPS.length}, ${step.label}, ${status.replace("_", " ")}`}
              >
                {/* Connector line (before this step) */}
                {idx > 0 && (
                  <div
                    aria-hidden="true"
                    className="absolute top-4 right-1/2 left-0 h-0.5 -translate-y-0"
                    style={{ left: 0, right: "50%" }}
                  >
                    <div
                      className={`h-full transition-all duration-500 ${prevCompleted ? "bg-primary" : "bg-slate-200"}`}
                    />
                  </div>
                )}

                {/* Step circle */}
                <button
                  type="button"
                  disabled={!isClickable}
                  onClick={() => isClickable && onTabChange(step.tabId)}
                  aria-current={status === "current" ? "step" : undefined}
                  title={!isClickable ? `${step.label} — not yet available` : `Go to ${step.label}`}
                  className={`
                    relative z-10 w-8 h-8 rounded-full border flex items-center justify-center text-xs transition-all duration-200
                    ${style.circle}
                    ${isClickable ? "cursor-pointer hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary/40" : "cursor-default"}
                    ${status === "current" ? "animate-[pulse_2.2s_ease-in-out_infinite]" : ""}
                  `}
                >
                  {status === "completed" ? (
                    <Check className="w-3.5 h-3.5" aria-hidden="true" />
                  ) : status === "not_required" ? (
                    <span className="text-[9px] font-bold">—</span>
                  ) : (
                    <span className="font-bold">{idx + 1}</span>
                  )}
                </button>

                {/* Label */}
                <span
                  className={`mt-2 text-center text-[10px] leading-tight px-1 ${style.label}`}
                  style={{ maxWidth: "110px", wordBreak: "break-word" }}
                >
                  {step.label}
                </span>

                {/* Status sub-label */}
                <span className="mt-0.5 text-[9px] text-slate-400 capitalize">
                  {status === "not_required" ? "Not required" : status.replace("_", " ")}
                </span>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
};

// ─── Priority Cases Widget ─────────────────────────────────────────────────────
interface PriorityCasesWidgetProps {
  patients: PatientRecord[];
  isLoading: boolean;
  loadError: string | null;
  onRetry: () => void;
  onSelectPatient: (patient: PatientRecord) => void;
}

const PriorityCasesWidget: React.FC<PriorityCasesWidgetProps> = ({
  patients,
  isLoading,
  loadError,
  onRetry,
  onSelectPatient
}) => {
  const priorityCases = useMemo(
    () =>
      patients
        .filter(isPriorityCriticalOrHigh)
        // Deduplicate by patient id
        .filter((p, i, arr) => arr.findIndex(x => x.id === p.id) === i)
        .slice(0, 4),
    [patients]
  );

  const getPriorityBadge = (p: PatientRecord) => {
    const level = (p.priority ?? "").toUpperCase();
    if (level === "CRITICAL") return { label: "Critical", cls: "bg-red-50 text-red-700 border-red-200" };
    if (level === "HIGH")     return { label: "High",     cls: "bg-amber-50 text-amber-700 border-amber-200" };
    return                           { label: level || "Unknown", cls: "bg-slate-50 text-slate-600 border-slate-200" };
  };

  return (
    <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
        <h3 className="font-extrabold text-slate-800 text-sm">Critical &amp; High Priority Cases</h3>
        {isLoading ? (
          <span className="text-[10px] bg-slate-100 text-slate-500 font-semibold px-2 py-0.5 rounded-full border border-slate-200">
            Loading…
          </span>
        ) : (
          <span className="text-[10px] bg-red-100 text-red-700 font-extrabold px-2 py-0.5 rounded-full border border-red-200">
            {priorityCases.length > 0 ? `${priorityCases.length} Need${priorityCases.length === 1 ? "s" : ""} Action` : "No Urgent Cases"}
          </span>
        )}
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="space-y-3" aria-label="Loading priority cases">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-[76px] bg-slate-100 animate-pulse rounded-xl" />
          ))}
        </div>
      )}

      {/* Error state */}
      {!isLoading && loadError && (
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <AlertTriangle className="w-8 h-8 text-amber-400" />
          <p className="text-xs font-semibold text-slate-600">Priority cases could not be loaded.</p>
          <button
            onClick={onRetry}
            className="px-4 py-1.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !loadError && priorityCases.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <ShieldCheck className="w-9 h-9 text-emerald-400" aria-hidden="true" />
          <p className="text-sm font-extrabold text-slate-700">No priority cases require immediate review</p>
          <p className="text-xs text-slate-400">New critical or high-priority cases will appear here.</p>
        </div>
      )}

      {/* Cases list */}
      {!isLoading && !loadError && priorityCases.length > 0 && (
        <div className="space-y-2">
          {priorityCases.map(patient => {
            const badge = getPriorityBadge(patient);
            const concern = (patient.clinicalIntake?.answers?.main_concern ?? []).join(", ").replace(/_/g, " ") || "Routine screening";
            const reportsOk = patient.reports && patient.reports.length > 0;
            const radStatus = (patient.clinicalJourney?.radiologyStatus ?? "PENDING").toUpperCase();
            return (
              <div
                key={patient.id}
                className="p-3 bg-slate-50/70 hover:bg-white border border-slate-100 hover:border-primary/20 rounded-xl flex items-center justify-between gap-3 transition-all"
                style={{ minHeight: "72px" }}
              >
                {/* Left: patient info */}
                <div className="flex-1 min-w-0 space-y-0.5 text-left">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-slate-800 text-xs">
                      {patient.name}
                      <span className="font-normal text-slate-400 ml-1">#{patient.id}</span>
                      <span className="ml-1 text-slate-500">&bull; {patient.age}y</span>
                    </p>
                    <span
                      className={`px-1.5 py-0.5 text-[9px] font-bold rounded border uppercase ${badge.cls}`}
                      aria-label={`Priority: ${badge.label}`}
                    >
                      {badge.label}
                    </span>
                  </div>
                  <p className="text-[10.5px] text-slate-500 font-medium capitalize truncate">
                    {concern}
                  </p>
                  <div className="flex items-center gap-3 text-[9.5px] text-slate-400 font-medium flex-wrap">
                    <span>Waiting: <strong className="text-slate-600">{patient.timeInQueue || "—"}</strong></span>
                    <span>Reports: <strong className={reportsOk ? "text-emerald-600" : "text-slate-500"}>{reportsOk ? "Uploaded" : "Pending"}</strong></span>
                    <span>Radiologist: <strong className={radStatus === "COMPLETE" ? "text-emerald-600" : "text-amber-600"}>{radStatus === "COMPLETE" ? "Done" : "Pending"}</strong></span>
                  </div>
                </div>

                {/* Right: action */}
                <button
                  type="button"
                  onClick={() => onSelectPatient(patient)}
                  className="shrink-0 px-3.5 py-1.5 bg-primary hover:bg-[#004D46] text-white text-[10px] font-black rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                  aria-label={`Open case for ${patient.name}`}
                >
                  Open Case
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// Mock helper data for imaging & reports
const mockImagingStudies = [
  { id: "img-1", type: "Digital Mammogram (2D/3D DBT)", date: "2026-07-20", institution: "IIT Indore Healthcare Center", accession: "ACC-98212-M", radiologist: "Dr. Alok Mehta", status: "COMPLETE", reports: "Normal bilateral breast parenchyma with scattered fibroglandular densities." },
  { id: "img-2", type: "High-Resolution Ultrasound", date: "2026-07-18", institution: "IIT Indore Healthcare Center", accession: "ACC-98109-U", radiologist: "Dr. Alok Mehta", status: "COMPLETE", reports: "No suspicious solid or cystic masses detected." }
];

export const DoctorDashboard: React.FC = () => {
  const currentPath = usePathname();
  const router = useRouter();
  const params = useParams<{ patientId?: string }>();
  const searchParams = useSearchParams();
  const routePatientId = params?.patientId || searchParams.get("patientId") || undefined;

  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<PatientRecord | null>(null);
  const [activeDetailTab, setActiveDetailTab] = useState<string>("overview");

  // Filters, Search, Sort States
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"ALL" | "HIGH" | "NEW" | "REPORTS" | "IMAGING" | "PENDING">("ALL");
  const [sortBy] = useState<"PRIORITY" | "WAITING_TIME" | "AGE">("PRIORITY");

  // Local Form / Case Review States
  const [clinicalNote, setClinicalNote] = useState("");
  const [carePlanObjective, setCarePlanObjective] = useState("");
  const [carePlanMedication, setCarePlanMedication] = useState("");
  const [chatMessage, setChatMessage] = useState("");
  const [chatThread, setChatThread] = useState<Array<{ sender: string; text: string; time: string; isUrgent?: boolean }>>([
    { sender: "System", text: "Secure clinical channel initialized.", time: "10:30 AM" },
    { sender: "Dr. Sarah Iyer", text: "Hi, please review the latest AI assessment overlay when you have a moment.", time: "10:32 AM" }
  ]);
  const [aiDecision, setAiDecision] = useState<string>("");

  // Messages Hub State
  const [conversations, setConversations] = useState<Conversation[]>(() => MessageService.getConversations());
  const [activeConvId, setActiveConvId] = useState<string>(() => MessageService.getConversations()[0]?.id || "conv-001");
  const [doctorReplyText, setDoctorReplyText] = useState("");

  // Appointments Schedule State
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [schedulePatientId, setSchedulePatientId] = useState("");
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("10:00 AM");
  const [scheduleType, setScheduleType] = useState("Report Review");
  const [scheduleMode, setScheduleMode] = useState<"In-Person" | "Teleconsult">("In-Person");

  // Care Plan Management State
  const [activeCarePlanPatient, setActiveCarePlanPatient] = useState<PatientRecord | null>(null);
  const [doctorGuidanceNotes, setDoctorGuidanceNotes] = useState("");
  const [nextReviewDate, setNextReviewDate] = useState("");
  const [newInstructionTitle, setNewInstructionTitle] = useState("");
  const [newInstructionCategory, setNewInstructionCategory] = useState("Screening");
  const [customCareTasks, setCustomCareTasks] = useState<Array<{ id: string; title: string; category: string; completed: boolean }>>([
    { id: "ct-1", title: "6-Month Follow-Up Mammography Screening", category: "Screening", completed: false },
    { id: "ct-2", title: "Monthly Self-Breast Examination", category: "Lifestyle", completed: true },
    { id: "ct-3", title: "Maintain Healthy Diet & Hydration Log", category: "Nutrition", completed: false },
  ]);

  // AI ResNet50 Predictor State
  const [aiPredictFile, setAiPredictFile] = useState<File | null>(null);
  const [aiPredictPreview, setAiPredictPreview] = useState<string | null>(null);
  const [aiPredictLoading, setAiPredictLoading] = useState(false);
  const [aiPredictResult, setAiPredictResult] = useState<any | null>(null);
  const [aiPredictError, setAiPredictError] = useState<string | null>(null);
  const [aiViewMode, setAiViewMode] = useState<"overlay" | "heatmap">("overlay");
  const [imagingModality, setImagingModality] = useState<"HISTOPATHOLOGY" | "MAMMOGRAPHY">("HISTOPATHOLOGY");

  const refreshData = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const pList = await PatientService.getPatients();
      setPatients(pList);
      setConversations(MessageService.getConversations());
      // Handle direct patientId routing
      if (routePatientId) {
        const found = pList.find(p => p.id === routePatientId);
        if (found) setSelectedPatient(found);
      }
    } catch (e) {
      console.error(e);
      setLoadError("Failed to load cases.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkIntakeReviewed = async () => {
    const targetPatient = activePatient;
    if (!targetPatient) return;
    try {
      const updatedPatient: PatientRecord = {
        ...targetPatient,
        clinicalJourney: {
          assessmentSubmitted: !!targetPatient.clinicalJourney?.assessmentSubmitted,
          reportsUploaded: !!targetPatient.clinicalJourney?.reportsUploaded,
          aiAnalysisStatus: targetPatient.clinicalJourney?.aiAnalysisStatus || "PENDING",
          radiologyStatus: targetPatient.clinicalJourney?.radiologyStatus || "PENDING",
          appointmentStatus: targetPatient.clinicalJourney?.appointmentStatus || "NOT_SCHEDULED",
          carePlanStatus: targetPatient.clinicalJourney?.carePlanStatus,
          waitingTime: targetPatient.clinicalJourney?.waitingTime,
          doctorReviewStatus: "COMPLETED" as const,
        },
        clinicalIntake: targetPatient.clinicalIntake ? {
          ...targetPatient.clinicalIntake,
          status: "REVIEWED" as const,
          submittedAt: targetPatient.clinicalIntake.submittedAt || new Date().toISOString()
        } : undefined,
        status: "Review Completed"
      };

      await PatientService.updatePatientRecord(updatedPatient);
      
      // Update local state
      setSelectedPatient(updatedPatient);
      setPatients(prev => prev.map(p => p.id === updatedPatient.id ? updatedPatient : p));
      
      // Dispatch events so other panels refresh
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("patient-updated"));
      }
      
      alert(`Marked questionnaire for ${targetPatient.name} as reviewed.`);
    } catch (e) {
      console.error(e);
      alert("Failed to mark intake as reviewed.");
    }
  };

  useEffect(() => {
    refreshData();

    const handleUpdate = () => {
      refreshData();
    };

    window.addEventListener("patient-updated", handleUpdate);

    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel("breastcare-sync");
      channel.onmessage = (event) => {
        if (event.data?.type === "patient-updated") {
          refreshData();
        }
      };
    } catch (e) {
      console.error("Failed to init BroadcastChannel in DoctorDashboard", e);
    }

    return () => {
      window.removeEventListener("patient-updated", handleUpdate);
      if (channel) {
        channel.close();
      }
    };
  }, [routePatientId]);

  // Reset selected patient state when navigating to standard top-level dashboard sub-pages
  useEffect(() => {
    if (
      !currentPath.startsWith("/doctor/patients/") &&
      !searchParams.get("patientId") &&
      selectedPatient
    ) {
      setSelectedPatient(null);
    }
  }, [currentPath, searchParams]);

  // Determine current active sub-page view
  const getView = () => {
    switch (currentPath) {
      case "/doctor/queue": return "QUEUE";
      case "/doctor/patients": return "PATIENTS";
      case "/doctor/reviews": return "REVIEWS";
      case "/doctor/imaging-reports": return "IMAGING_REPORTS";
      case "/doctor/appointments": return "APPOINTMENTS";
      case "/doctor/care-plans": return "CARE_PLANS";
      case "/doctor/messages": return "MESSAGES";
      case "/doctor/tasks": return "TASKS";
      case "/doctor/analytics": return "ANALYTICS";
      case "/doctor/resources": return "RESOURCES";
      case "/doctor/settings": return "SETTINGS";
    }
    if (selectedPatient || routePatientId || currentPath.startsWith("/doctor/patients/")) {
      return "PATIENT_DETAIL";
    }
    return "OVERVIEW";
  };

  const currentView = getView();
  const activePatient = selectedPatient || patients.find(p => p.id === routePatientId) || patients[0];

  // Filters & Sort patients list
  const filteredPatients = patients
    .filter(patient => {
      const matchesSearch = 
        patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.id.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (!matchesSearch) return false;

      switch (filterType) {
        case "HIGH": return patient.priority === "HIGH";
        case "NEW": return patient.clinicalJourney?.assessmentSubmitted === true;
        case "REPORTS": return patient.clinicalJourney?.reportsUploaded === true;
        case "IMAGING": return patient.clinicalJourney?.radiologyStatus === "COMPLETE";
        case "PENDING": return patient.status === "Awaiting Review";
        default: return true;
      }
    })
    .sort((a, b) => {
      if (sortBy === "PRIORITY") {
        const priorityWeight = { HIGH: 3, MEDIUM: 2, LOW: 1 };
        return priorityWeight[b.priority] - priorityWeight[a.priority];
      }
      if (sortBy === "WAITING_TIME") {
        return b.timeInQueue.localeCompare(a.timeInQueue);
      }
      if (sortBy === "AGE") {
        return b.age - a.age;
      }
      return 0;
    });

  const [isReviewLoading, setIsReviewLoading] = useState(false);

  // Returns the best candidate: CRITICAL first, then HIGH, then longest waiting
  const getTopPriorityPatient = (): PatientRecord | null => {
    const eligible = patients.filter(isPriorityCriticalOrHigh);
    if (eligible.length === 0) return null;
    // Sort: CRITICAL > HIGH, then by waiting time (longer string = earlier in list)
    return eligible.sort((a, b) => {
      const weight = (p: PatientRecord) =>
        (p.priority ?? "").toUpperCase() === "CRITICAL" ? 2 : 1;
      const diff = weight(b) - weight(a);
      if (diff !== 0) return diff;
      return (b.timeInQueue ?? "").localeCompare(a.timeInQueue ?? "");
    })[0];
  };

  const handleReviewNextCase = async () => {
    if (isReviewLoading) return;
    const top = getTopPriorityPatient() ?? filteredPatients[0];
    if (top) {
      setIsReviewLoading(true);
      // Small delay to show loading state, then navigate
      setTimeout(() => {
        setIsReviewLoading(false);
        setSelectedPatient(top);
        setActiveDetailTab("overview");
      }, 220);
    }
  };

  const handleSendMessage = () => {
    if (!chatMessage.trim()) return;
    const isUrgent = chatMessage.toLowerCase().includes("urgent") || chatMessage.toLowerCase().includes("emergency");
    setChatThread(prev => [...prev, {
      sender: "Dr. Sarah Iyer",
      text: chatMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isUrgent
    }]);
    setChatMessage("");
  };

  // Helper values for Overviews
  const countAwaitingReview = patients.filter(p => p.status === "Awaiting Review").length;
  const countPriority = patients.filter(p => p.priority === "HIGH").length;
  const countTodayAppointments = 6;


  return (
    <div className="space-y-6 text-left max-w-[1400px] mx-auto pb-12">
      




      {/* RENDER VIEWS */}

      {/* ── 1. OVERVIEW PAGE ── */}
      {currentView === "OVERVIEW" && (
        <div className="space-y-6">
          {/* Today at a Glance Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
            {[
              { label: "Awaiting Review", val: countAwaitingReview, icon: ClipboardList, color: "text-primary bg-teal-50" },
              { label: "Urgent Alerts", val: countPriority, icon: AlertTriangle, color: "text-red-500 bg-red-50" },
              { label: "Appointments Today", val: countTodayAppointments, icon: Calendar, color: "text-blue-500 bg-blue-50" },
              { label: "Average Review Time", val: "2.1h", icon: Clock, color: "text-emerald-500 bg-emerald-50" },
              { label: "Reports Pending", val: "4", icon: FileText, color: "text-violet-500 bg-purple-50" },
              { label: "Follow-ups Due", val: "3", icon: Heart, color: "text-rose-500 bg-rose-50" }
            ].map((st, i) => {
              const Icon = st.icon;
              return (
                <div key={i} className="bg-white border border-slate-200/80 p-4 rounded-2xl flex items-center justify-between shadow-xs">
                  <div className="text-left space-y-1">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">{st.label}</span>
                    <h3 className="text-xl font-black text-slate-800">{st.val}</h3>
                  </div>
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${st.color}`}>
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Priority Cases Widget */}
            <PriorityCasesWidget
              patients={patients}
              isLoading={isLoading}
              loadError={loadError}
              onRetry={refreshData}
              onSelectPatient={(p) => {
                setSelectedPatient(p);
                setActiveDetailTab("overview");
              }}
            />

            {/* Today's Schedule */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-slate-800 text-sm">Today's Schedule</h3>
                <Link href="/doctor/appointments" className="text-[10px] text-primary font-bold hover:underline">View All</Link>
              </div>
              <div className="space-y-3">
                {[
                  { time: "09:30 AM", name: "Ananya Sharma", type: "Initial Consult", mode: "In-Person", status: "Checked In" },
                  { time: "11:00 AM", name: "Priya Patel", type: "Report Review", mode: "Teleconsult", status: "Awaiting Log" },
                  { time: "02:30 PM", name: "Meera Nair", type: "Care Planning", mode: "In-Person", status: "Scheduled" }
                ].map((ap, i) => (
                  <div key={i} className="p-3 border border-slate-100 rounded-xl flex items-center justify-between text-xs">
                    <div className="text-left">
                      <p className="font-extrabold text-slate-800">{ap.name}</p>
                      <p className="text-[10px] text-slate-500 font-medium">{ap.type} &bull; {ap.mode}</p>
                    </div>
                    <div className="text-right space-y-1">
                      <span className="text-[9px] font-bold text-slate-400 block">{ap.time}</span>
                      <span className="inline-block px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[8.5px] border border-emerald-200 font-bold uppercase">{ap.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Central Active Queue Table */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <h3 className="font-extrabold text-slate-800 text-sm">Active Review Queue ({filteredPatients.length} cases)</h3>
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-slate-400" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as any)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-700 focus-ring"
                >
                  <option value="ALL">All Patients</option>
                  <option value="PENDING">Awaiting Review</option>
                  <option value="HIGH">High Priority</option>
                  <option value="REPORTS">Reports Uploaded</option>
                </select>
              </div>
            </div>

            {/* Patients list table component */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider font-bold text-[9px] bg-slate-50/50">
                    <th className="p-3.5">Patient</th>
                    <th className="p-3.5">Age</th>
                    <th className="p-3.5">Primary Symptoms</th>
                    <th className="p-3.5">BMI</th>
                    <th className="p-3.5">Reports</th>
                    <th className="p-3.5">AI Analysis</th>
                    <th className="p-3.5">Clinical Priority</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPatients.map((patient) => (
                    <tr key={patient.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-3.5">
                        <div>
                          <p className="font-bold text-slate-800 text-xs">{patient.name}</p>
                          <span className="text-[9px] text-slate-400 block mt-0.5">{patient.id}</span>
                        </div>
                      </td>
                      <td className="p-3.5 font-semibold text-slate-650">{patient.age}</td>
                      <td className="p-3.5 font-medium text-slate-500 capitalize">
                        {patient.clinicalIntake?.answers?.main_concern?.join(", ").replace(/_/g, " ") || "Routine screen"}
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 bg-slate-50 rounded-full text-[9px] border font-bold">
                          {patient.bmi?.value || "23.4"}
                        </span>
                      </td>
                      <td className="p-3.5 font-semibold text-slate-650">
                        {patient.reports && patient.reports.length > 0 ? "✓ Uploaded" : "— None"}
                      </td>
                      <td className="p-3.5">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold border uppercase
                          ${patient.clinicalJourney?.aiAnalysisStatus === "COMPLETE" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-250 animate-pulse"}`}>
                          {patient.clinicalJourney?.aiAnalysisStatus || "PENDING"}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold border uppercase
                          ${patient.priority === "HIGH" ? "bg-red-50 text-red-750 border-red-250" : "bg-slate-50 text-slate-700 border-slate-200"}`}>
                          {patient.priority}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedPatient(patient);
                            setActiveDetailTab("overview");
                          }}
                          className="px-3.5 py-1.5 text-[10px] font-extrabold text-white bg-primary hover:bg-[#004D46] rounded-xl transition-all cursor-pointer shadow-xs"
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── 2. CASE QUEUE PAGE ── */}
      {currentView === "QUEUE" && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div className="space-y-1">
              <h2 className="text-lg font-extrabold text-slate-800">Queue Management ({filteredPatients.length} active cases)</h2>
              <p className="text-xs text-slate-400">Perform triage reviews, countersign records, and coordinate with radiologist workflows.</p>
            </div>
            <div className="flex flex-wrap gap-2.5">
              <button 
                onClick={() => alert("Bulk Action: Assign Clinician initiated.")}
                className="px-3.5 py-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-xl text-xs font-bold transition-all"
              >
                Bulk Assign
              </button>
              <button 
                onClick={() => alert("Bulk Action: Update Priority initiated.")}
                className="px-3.5 py-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-xl text-xs font-bold transition-all"
              >
                Bulk Priority
              </button>
            </div>
          </div>

          {/* Patients list queue */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider font-bold text-[9px] bg-slate-50/50">
                  <th className="p-3.5">Patient</th>
                  <th className="p-3.5">Age</th>
                  <th className="p-3.5">Concern</th>
                  <th className="p-3.5">Side</th>
                  <th className="p-3.5">Duration</th>
                  <th className="p-3.5">AI Overlay</th>
                  <th className="p-3.5">Radiologist Status</th>
                  <th className="p-3.5">Waiting Time</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPatients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-3.5">
                      <div>
                        <p className="font-bold text-slate-800 text-xs">{patient.name}</p>
                        <span className="text-[9px] text-slate-400 block mt-0.5">{patient.id}</span>
                      </div>
                    </td>
                    <td className="p-3.5 font-semibold text-slate-600">{patient.age}</td>
                    <td className="p-3.5 font-medium text-slate-550 capitalize">
                      {patient.clinicalIntake?.answers?.main_concern?.join(", ").replace(/_/g, " ") || "Routine Screening"}
                    </td>
                    <td className="p-3.5 font-semibold text-slate-550 capitalize">{patient.clinicalIntake?.answers?.affectedSide || "None"}</td>
                    <td className="p-3.5 text-slate-500 font-medium">{patient.timeInQueue || "—"}</td>
                    <td className="p-3.5">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9.5px] font-extrabold border bg-emerald-50 text-emerald-700 border-emerald-200">
                        {patient.clinicalJourney?.aiAnalysisStatus || "COMPLETE"}
                      </span>
                    </td>
                    <td className="p-3.5 font-semibold text-slate-650">
                      {patient.clinicalJourney?.radiologyStatus === "COMPLETE" ? "✓ Done" : "⏳ Pending Review"}
                    </td>
                    <td className="p-3.5 font-bold text-slate-700">{patient.timeInQueue}</td>
                    <td className="p-3.5 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedPatient(patient);
                          setActiveDetailTab("overview");
                        }}
                        className="inline-block px-3.5 py-1.5 bg-primary hover:bg-[#004D46] text-white text-[10px] font-black rounded-lg transition-all cursor-pointer shadow-xs"
                      >
                        Open Case
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── 3. PATIENTS PAGE ── */}
      {currentView === "PATIENTS" && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-extrabold text-slate-800">Patient Directory</h2>
            <p className="text-xs text-slate-400">Total registered cohort: <strong>{patients.length} patients</strong>.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPatients.map((patient) => (
              <div key={patient.id} className="p-5 border border-slate-200/80 rounded-2xl bg-slate-50/25 space-y-4 hover:border-primary/30 transition-colors flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-extrabold text-slate-800 text-sm">{patient.name}</h4>
                      <p className="text-[10px] text-slate-400">ID: {patient.id} &bull; Age: {patient.age}</p>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase border
                      ${patient.priority === "HIGH" ? "bg-red-50 border-red-200 text-red-750" : "bg-slate-50 border-slate-200 text-slate-550"}`}>
                      {patient.priority}
                    </span>
                  </div>
                  <div className="text-xs space-y-1 pt-2 border-t border-slate-100 text-slate-600">
                    <p>Phone: <strong>{patient.phone || "+91 98765 43210"}</strong></p>
                    <p>Status: <span className="font-bold text-primary">{patient.status}</span></p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPatient(patient);
                    setActiveDetailTab("overview");
                  }}
                  className="w-full text-center py-2 bg-primary hover:bg-[#004D46] text-white text-xs font-bold rounded-xl transition-all block mt-4 cursor-pointer"
                >
                  Open Workspace
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 4. PATIENT DETAIL WORKSPACE ── */}
      {currentView === "PATIENT_DETAIL" && activePatient && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                setSelectedPatient(null);
                if (routePatientId) router.push("/doctor/dashboard");
              }}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200/80 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-primary" /> Back to Dashboard Queue
            </button>
          </div>
          
          {/* Patient Detail Summary Header */}
          <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3 text-left">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 text-primary border border-teal-200 flex items-center justify-center font-black text-lg">
                  {activePatient.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-800 leading-tight">{activePatient.name}</h2>
                  <p className="text-[11px] text-slate-400 font-semibold">
                    Patient ID: <strong>{activePatient.id}</strong> &bull; DOB: <strong>{activePatient.dob || "12/04/1984"}</strong> &bull; Sex: <strong>{activePatient.gender || "Female"}</strong>
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase border
                  ${activePatient.priority === "HIGH" ? "bg-red-50 text-red-750 border-red-200" : "bg-slate-50 text-slate-600 border-slate-200"}`}>
                  {activePatient.priority} Priority
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-blue-50 text-blue-700 border border-blue-200 uppercase">
                  {activePatient.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div className="text-left">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Assigned Oncologist</span>
                <p className="font-semibold text-slate-700">Dr. Sarah Iyer</p>
              </div>
              <div className="text-left">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Assigned Radiologist</span>
                <p className="font-semibold text-slate-700">Dr. Alok Mehta</p>
              </div>
              <div className="text-left">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Next Appointment</span>
                <p className="font-semibold text-slate-700">24/07/2026 at 11:30 AM</p>
              </div>
              <div className="text-left">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Last Updated</span>
                <p className="font-semibold text-slate-700">{activePatient.timeInQueue || "Just now"}</p>
              </div>
            </div>
          </div>

          {/* Sub Workspace Tab Navigation */}
          <div className="flex border-b border-slate-200 overflow-x-auto scrollbar-thin">
            {[
              { id: "overview", label: "Overview" },
              { id: "intake", label: "Intake & Questionnaire" },
              { id: "history", label: "Medical History" },
              { id: "reports", label: "Reports" },
              { id: "imaging", label: "Imaging" },
              { id: "ai", label: "AI Assessment" },
              { id: "review", label: "Clinical Review" },
              { id: "careplan", label: "Care Plan" },
              { id: "appointments", label: "Appointments" },
              { id: "messages", label: "Messages" },
              { id: "activity", label: "Activity Log" }
            ].map((tb) => (
              <button
                key={tb.id}
                onClick={() => setActiveDetailTab(tb.id)}
                className={`px-4 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition-all cursor-pointer min-h-[42px]
                  ${activeDetailTab === tb.id 
                    ? "border-primary text-primary" 
                    : "border-transparent text-slate-500 hover:text-primary hover:border-slate-300"}`}
              >
                {tb.label}
              </button>
            ))}
          </div>

          {/* Tab Contents */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs min-h-[400px]">
            
            {/* A. OVERVIEW TAB */}
            {activeDetailTab === "overview" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4 text-left">
                    <h3 className="font-extrabold text-slate-800 text-sm border-b pb-2">Primary Clinical Concerns</h3>
                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-2 text-xs">
                      <p>Symptom: <strong className="capitalize">{activePatient.clinicalIntake?.answers?.main_concern?.join(", ").replace(/_/g, " ") || "No major localized lumps reported"}</strong></p>
                      <p>Affected Side: <strong className="capitalize">{activePatient.clinicalIntake?.answers?.affectedSide || "None"}</strong></p>
                      <p>Duration: <strong className="capitalize">{activePatient.clinicalIntake?.answers?.duration?.replace(/_/g, " ") || "1-3 months"}</strong></p>
                    </div>
                  </div>
                  <div className="space-y-4 text-left">
                    <h3 className="font-extrabold text-slate-800 text-sm border-b pb-2">Wellness & Risk Factors</h3>
                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-2 text-xs">
                      <p>Family history of breast issues: <strong>{activePatient.medicalHistory?.familyHistory ? "Yes" : "No"}</strong></p>
                      <p>Prior biopsy/procedures: <strong>{activePatient.medicalHistory?.previousBreastProcedure ? "Yes" : "No"}</strong></p>
                      <p>BMI Category: <strong className="text-primary">{activePatient.bmi?.category || "Healthy Weight (22.5)"}</strong></p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-extrabold text-slate-800 text-sm border-b pb-2 text-left">Care Journey Progress</h3>
                  <CareJourneyStepper
                    patient={activePatient}
                    onTabChange={setActiveDetailTab}
                  />
                </div>
              </div>
            )}

            {/* B. INTAKE & QUESTIONNAIRE TAB */}
            {activeDetailTab === "intake" && (
              <div className="space-y-6 text-left">
                {activePatient.assessmentSession?.status === "SUBMITTED" || activePatient.clinicalJourney?.assessmentSubmitted ? (
                  // --- PREMIUM DOCUMENTARY FORM FOR PATIENT-SUBMITTED ASSESSMENT ---
                  <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                    {/* Document Header */}
                    <div className="bg-slate-50 px-6 py-4.5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                            Clinical Record
                          </span>
                          <span className="text-[10px] bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-primary" />
                            {activePatient.assessmentSession?.summary?.assessmentMode === "CHATBOT" 
                              ? "AI Phased Triage Intake" 
                              : "Portal Intake Document"}
                          </span>
                        </div>
                        <h3 className="font-extrabold text-slate-800 text-base mt-1.5 flex items-center gap-2">
                          Patient-Reported Breast Health & Risk Triage Intake
                        </h3>
                        <p className="text-slate-500 text-[11px] mt-0.5">
                          Patient: <strong className="text-slate-800">{activePatient.name}</strong> (Age {activePatient.age}) &middot; ID: <span className="font-mono">{activePatient.id}</span> &middot; Protocol: <strong>Clinical Oncology Triage Algorithm</strong>
                        </p>
                      </div>
                      <div className="text-left sm:text-right shrink-0">
                        <span className="text-[10px] text-slate-400 block font-semibold uppercase tracking-wider">Date Submitted</span>
                        <span className="text-xs font-bold text-slate-700">
                          {activePatient.assessmentSession?.completedAt 
                            ? new Date(activePatient.assessmentSession.completedAt).toLocaleString("en-GB", {
                                day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true
                              }) 
                            : activePatient.clinicalIntake?.submittedAt || "Recent Intake"}
                        </span>
                      </div>
                    </div>

                    {/* Document Body */}
                    <div className="p-6 space-y-7">
                      {/* 1. EXECUTIVE CLINICAL RISK & STAGING SUMMARY CARD */}
                      {(() => {
                        const summary = activePatient.assessmentSession?.summary;
                        const risk = summary?.riskAnalysis;
                        const tier = risk?.tier || (summary?.careGuidanceLevel === "URGENT" || activePatient.priority === "HIGH" ? "Urgent" : summary?.careGuidanceLevel === "HIGH" ? "High" : summary?.careGuidanceLevel === "MEDIUM" ? "Moderate" : "Low");
                        const totalScore = risk?.totalScore !== undefined ? risk.totalScore : (activePatient.assessmentSession?.answers?.length ? activePatient.assessmentSession.answers.length * 2 : 0);

                        return (
                          <div className="bg-gradient-to-br from-slate-50 to-emerald-50/20 border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-3.5">
                              <div>
                                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                                  AI Care Priority & Risk Classification
                                </span>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className={`px-3 py-1 rounded-full text-xs font-black tracking-wide border flex items-center gap-1.5 ${
                                    tier === "Urgent" || summary?.careGuidanceLevel === "URGENT"
                                      ? "bg-rose-600 text-white border-rose-700 shadow-sm" 
                                      : tier === "High" || summary?.careGuidanceLevel === "HIGH"
                                      ? "bg-amber-500 text-white border-amber-600 shadow-sm" 
                                      : tier === "Moderate" || summary?.careGuidanceLevel === "MEDIUM"
                                      ? "bg-blue-600 text-white border-blue-700" 
                                      : "bg-emerald-600 text-white border-emerald-700"
                                  }`}>
                                    <Activity className="w-3.5 h-3.5" />
                                    {tier.toUpperCase()} PRIORITY ({tier} Risk)
                                  </span>
                                  <span className="text-xs font-bold text-slate-700">
                                    Total Composite Score: <span className="text-primary font-black font-mono">{totalScore}</span> pts
                                  </span>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[10px]">
                                <div className="bg-white px-2.5 py-1.5 rounded-lg border border-slate-200">
                                  <span className="text-slate-400 block font-semibold">Phase 0 BRM</span>
                                  <strong className="text-slate-800 font-bold">+{risk?.brmScore ?? 0} pts</strong>
                                </div>
                                <div className="bg-white px-2.5 py-1.5 rounded-lg border border-slate-200">
                                  <span className="text-slate-400 block font-semibold">Phase 1 (×1.5)</span>
                                  <strong className="text-slate-800 font-bold">{risk?.phase1Weighted ?? 0} pts</strong>
                                </div>
                                <div className="bg-white px-2.5 py-1.5 rounded-lg border border-slate-200">
                                  <span className="text-slate-400 block font-semibold">Phase 2 (×{risk?.phase2Multiplier ?? 1.2})</span>
                                  <strong className="text-slate-800 font-bold">{risk?.phase2Weighted ?? 0} pts</strong>
                                </div>
                                <div className="bg-white px-2.5 py-1.5 rounded-lg border border-slate-200">
                                  <span className="text-slate-400 block font-semibold">Phase 3 (×{risk?.phase3Multiplier ?? 1.3})</span>
                                  <strong className="text-slate-800 font-bold">{risk?.phase3Weighted ?? 0} pts</strong>
                                </div>
                              </div>
                            </div>

                            {/* Escalation Override Alert */}
                            {(risk?.overrideTriggered || (activePatient.assessmentSession?.priorityFlags && activePatient.assessmentSession.priorityFlags.length > 0)) && (
                              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl space-y-1.5 text-xs">
                                <div className="flex items-center gap-1.5 text-rose-800 font-black uppercase text-[11px] tracking-wider">
                                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                                  <span>Safety Escalation Override Fired: {risk?.overrideTriggered || "Critical Symptom Flag"}</span>
                                </div>
                                <p className="text-rose-900 font-medium text-[11px] leading-relaxed">
                                  {risk?.overrideReason || activePatient.assessmentSession?.priorityFlags?.[0]?.message || "A high-risk clinical presentation was detected that overrides baseline scoring to Urgent Priority."}
                                </p>
                              </div>
                            )}

                            {/* Clinical Recommendation & Interpretation */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                              <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                  Clinical Interpretation
                                </span>
                                <p className="text-slate-700 font-medium text-[11px] leading-relaxed">
                                  {risk?.interpretation || "Patient presents with clinical risk profile requiring oncologist review and correlation with physical exam findings."}
                                </p>
                              </div>
                              <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                  Recommended Action
                                </span>
                                <p className="text-slate-800 font-bold text-[11px] leading-relaxed">
                                  {risk?.recommendation || "Schedule prompt clinical consultation, bilateral mammography, and ultrasound imaging evaluation."}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })()}

                      {/* 2. PHASE 0: BASELINE RISK PROFILE & REPRODUCTIVE HISTORY */}
                      {(() => {
                        const summary = activePatient.assessmentSession?.summary;
                        const rp = summary?.riskProfile;
                        const answers = activePatient.assessmentSession?.answers || [];
                        const getAnswerVal = (id: string) => answers.find(a => a.questionId === id)?.value;

                        const phase0List = summary?.phasedAnswers?.phase0 || [
                          { label: "Patient Age / Group", value: rp?.age || String(getAnswerVal("risk_profile_age") || activePatient.age || "Not specified") },
                          { label: "Age at Marriage", value: rp?.ageAtMarriage || String(getAnswerVal("risk_profile_marriage") || "Not specified") },
                          { label: "Age at First Childbirth", value: rp?.ageAtFirstChild || String(getAnswerVal("risk_profile_first_child") || "Not specified") },
                          { label: "Number of Children", value: rp?.numberOfChildren || String(getAnswerVal("risk_profile_children") || "0") },
                          { label: "Breastfeeding History", value: rp?.breastfeeding || String(getAnswerVal("risk_profile_breastfeeding") || "Not specified") },
                          { label: "Hormonal Contraceptive Use", value: rp?.contraceptives || String(getAnswerVal("risk_profile_contraceptives") || "None reported") },
                          { label: "Family History of Cancer", value: rp?.familyHistory || String(getAnswerVal("risk_profile_family_history") || (summary?.familyHistory ? "Yes reported" : "No")) },
                          { label: "Smoking Status", value: rp?.smoking || String(getAnswerVal("risk_profile_smoking") || "Never smoked") },
                          { label: "General Diet & Nutrition", value: rp?.diet || String(getAnswerVal("risk_profile_diet") || "Standard") }
                        ];

                        return (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-black">0</span>
                                Phase 0: Baseline Risk Profile & Reproductive Context
                              </h4>
                              <span className="text-[10px] text-slate-400 font-semibold">9 Baseline Factor Questions</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                              {phase0List.map((item, idx) => (
                                <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                                  <span className="text-slate-400 font-bold block text-[10px] uppercase tracking-wider">
                                    {item.label}
                                  </span>
                                  <span className="text-slate-800 font-bold block text-xs">
                                    {item.value || "Not specified"}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })()}

                      {/* 3. PHASE 1: PRIMARY BREAST SCREENING FINDINGS */}
                      {(() => {
                        const summary = activePatient.assessmentSession?.summary;
                        const answers = activePatient.assessmentSession?.answers || [];
                        
                        // Parse Phase 1 symptoms from phasedAnswers or answers
                        const phase1Items = summary?.phasedAnswers?.phase1 || [
                          { symptom: "Symptoms on Left Breast – Palpable Lump / Abnormality", relevance: "H", weight: 3 },
                          { symptom: "Symptoms on Left Breast – Nipple Retraction / Inversion", relevance: "H", weight: 3 },
                          { symptom: "Symptoms on Left Breast – Nipple Discharge", relevance: "H", weight: 3 },
                          { symptom: "Symptoms on Left Breast – Skin Dimpling", relevance: "H", weight: 3 },
                          { symptom: "Symptoms on Left Breast – Skin Thickening", relevance: "H", weight: 3 },
                          { symptom: "Symptoms on Left Breast – Itching of the Nipple Area", relevance: "H", weight: 3 },
                          { symptom: "Symptoms on Left Breast – Redness", relevance: "M", weight: 2 },
                          { symptom: "Symptoms on Left Breast – Ulcer / Open Sore", relevance: "H", weight: 3 },
                          { symptom: "Symptoms on Left Breast – Pain", relevance: "L", weight: 1 },
                          { symptom: "Symptoms on Right Breast – Palpable Lump / Abnormality", relevance: "H", weight: 3 },
                          { symptom: "Symptoms on Right Breast – Nipple Retraction / Inversion", relevance: "H", weight: 3 },
                          { symptom: "Symptoms on Right Breast – Nipple Discharge", relevance: "H", weight: 3 },
                          { symptom: "Symptoms on Right Breast – Skin Dimpling", relevance: "H", weight: 3 },
                          { symptom: "Symptoms on Right Breast – Skin Thickening", relevance: "H", weight: 3 },
                          { symptom: "Symptoms on Right Breast – Itching of the Nipple Area", relevance: "H", weight: 3 },
                          { symptom: "Symptoms on Right Breast – Redness", relevance: "M", weight: 2 },
                          { symptom: "Symptoms on Right Breast – Ulcer / Open Sore", relevance: "H", weight: 3 },
                          { symptom: "Symptoms on Right Breast – Pain", relevance: "L", weight: 1 }
                        ].map(item => {
                          const isYes = answers.some(a => (a.questionId.toLowerCase() === item.symptom.toLowerCase() || a.label?.toLowerCase().includes(item.symptom.toLowerCase())) && (a.value === "Yes" || a.value === "yes" || a.value === true));
                          return {
                            ...item,
                            response: isYes ? "Yes" : "No"
                          };
                        });

                        const leftBreastItems = phase1Items.filter(i => i.symptom.toLowerCase().includes("left"));
                        const rightBreastItems = phase1Items.filter(i => i.symptom.toLowerCase().includes("right"));

                        return (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-black">1</span>
                                Phase 1: Primary Breast Screening Findings (Diagnostic Multiplier ×1.5)
                              </h4>
                              <span className="text-[10px] font-bold px-2.5 py-0.5 bg-slate-100 rounded-full text-slate-600">
                                Side: {summary?.affectedSide || "BOTH"}
                              </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* Left Breast */}
                              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                                <div className="bg-slate-100 px-3.5 py-2 border-b border-slate-200 flex items-center justify-between">
                                  <span className="text-xs font-black text-slate-800">Left Breast Symptoms</span>
                                  <span className="text-[10px] text-slate-500 font-semibold">{leftBreastItems.filter(i => i.response === "Yes").length} Positive</span>
                                </div>
                                <div className="divide-y divide-slate-100 text-xs">
                                  {leftBreastItems.map((item, idx) => (
                                    <div key={idx} className={`px-3.5 py-2 flex items-center justify-between ${item.response === "Yes" ? "bg-rose-50/50" : ""}`}>
                                      <div className="flex items-center gap-2">
                                        <span className={`w-1.5 h-1.5 rounded-full ${item.response === "Yes" ? "bg-rose-600" : "bg-slate-300"}`} />
                                        <span className={`font-medium ${item.response === "Yes" ? "font-bold text-slate-900" : "text-slate-700"}`}>
                                          {item.symptom.replace(/Symptoms on Left Breast – /g, "")}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2 shrink-0">
                                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                          item.relevance === "H" ? "bg-rose-100 text-rose-800" : item.relevance === "M" ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-600"
                                        }`}>
                                          {item.relevance === "H" ? "High (W3)" : item.relevance === "M" ? "Med (W2)" : "Low (W1)"}
                                        </span>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                                          item.response === "Yes" 
                                            ? "bg-rose-600 text-white" 
                                            : "bg-slate-100 text-slate-500"
                                        }`}>
                                          {item.response}
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Right Breast */}
                              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                                <div className="bg-slate-100 px-3.5 py-2 border-b border-slate-200 flex items-center justify-between">
                                  <span className="text-xs font-black text-slate-800">Right Breast Symptoms</span>
                                  <span className="text-[10px] text-slate-500 font-semibold">{rightBreastItems.filter(i => i.response === "Yes").length} Positive</span>
                                </div>
                                <div className="divide-y divide-slate-100 text-xs">
                                  {rightBreastItems.map((item, idx) => (
                                    <div key={idx} className={`px-3.5 py-2 flex items-center justify-between ${item.response === "Yes" ? "bg-rose-50/50" : ""}`}>
                                      <div className="flex items-center gap-2">
                                        <span className={`w-1.5 h-1.5 rounded-full ${item.response === "Yes" ? "bg-rose-600" : "bg-slate-300"}`} />
                                        <span className={`font-medium ${item.response === "Yes" ? "font-bold text-slate-900" : "text-slate-700"}`}>
                                          {item.symptom.replace(/Symptoms on Right Breast – /g, "")}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2 shrink-0">
                                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                          item.relevance === "H" ? "bg-rose-100 text-rose-800" : item.relevance === "M" ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-600"
                                        }`}>
                                          {item.relevance === "H" ? "High (W3)" : item.relevance === "M" ? "Med (W2)" : "Low (W1)"}
                                        </span>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                                          item.response === "Yes" 
                                            ? "bg-rose-600 text-white" 
                                            : "bg-slate-100 text-slate-500"
                                        }`}>
                                          {item.response}
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })()}

                      {/* 4. PHASE 2: REGIONAL SPREAD SCREENING (NECK & AXILLA/ARM) */}
                      {(() => {
                        const summary = activePatient.assessmentSession?.summary;
                        const answers = activePatient.assessmentSession?.answers || [];

                        const phase2Items = summary?.phasedAnswers?.phase2 || [
                          { symptom: "Symptoms on Neck – Lump", relevance: "H", weight: 3 },
                          { symptom: "Symptoms on Neck – Swelling", relevance: "M", weight: 2 },
                          { symptom: "Symptoms on Neck – Bleeding", relevance: "H", weight: 3 },
                          { symptom: "Symptoms on Neck – Redness", relevance: "M", weight: 2 },
                          { symptom: "Symptoms on Neck – Discoloration", relevance: "M", weight: 2 },
                          { symptom: "Symptoms on Neck – Wound", relevance: "H", weight: 3 },
                          { symptom: "Symptoms on Neck – Ulcer / Skin changes", relevance: "H", weight: 3 },
                          { symptom: "Symptoms on Neck – Pain", relevance: "L", weight: 1 },
                          { symptom: "Symptoms on Left Arm – Lump", relevance: "H", weight: 3 },
                          { symptom: "Symptoms on Left Arm – Swelling", relevance: "M", weight: 2 },
                          { symptom: "Symptoms on Left Arm – Restricted Movement", relevance: "M", weight: 2 },
                          { symptom: "Symptoms on Left Arm – Weakness", relevance: "M", weight: 2 },
                          { symptom: "Symptoms on Left Arm – Numbness", relevance: "M", weight: 2 },
                          { symptom: "Symptoms on Left Arm – Bruising", relevance: "L", weight: 1 },
                          { symptom: "Symptoms on Left Arm – Pain", relevance: "L", weight: 1 },
                          { symptom: "Symptoms on Right Arm – Lump", relevance: "H", weight: 3 },
                          { symptom: "Symptoms on Right Arm – Swelling", relevance: "M", weight: 2 },
                          { symptom: "Symptoms on Right Arm – Restricted Movement", relevance: "M", weight: 2 },
                          { symptom: "Symptoms on Right Arm – Weakness", relevance: "M", weight: 2 },
                          { symptom: "Symptoms on Right Arm – Numbness", relevance: "M", weight: 2 },
                          { symptom: "Symptoms on Right Arm – Bruising", relevance: "L", weight: 1 },
                          { symptom: "Symptoms on Right Arm – Pain", relevance: "L", weight: 1 }
                        ].map(item => {
                          const isYes = answers.some(a => (a.questionId.toLowerCase() === item.symptom.toLowerCase() || a.label?.toLowerCase().includes(item.symptom.toLowerCase())) && (a.value === "Yes" || a.value === "yes" || a.value === true));
                          return {
                            ...item,
                            response: isYes ? "Yes" : "No"
                          };
                        });

                        const neckItems = phase2Items.filter(i => i.symptom.toLowerCase().includes("neck"));
                        const armItems = phase2Items.filter(i => i.symptom.toLowerCase().includes("arm"));

                        return (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-black">2</span>
                                Phase 2: Regional Spread Screening (Neck & Axillary Lymph Nodes)
                              </h4>
                              <span className="text-[10px] text-slate-400 font-semibold">{phase2Items.filter(i => i.response === "Yes").length} Positive Regional Findings</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* Neck Findings */}
                              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                                <div className="bg-slate-100 px-3.5 py-2 border-b border-slate-200 flex items-center justify-between">
                                  <span className="text-xs font-black text-slate-800">Neck & Supraclavicular Territory</span>
                                  <span className="text-[10px] text-slate-500 font-semibold">{neckItems.filter(i => i.response === "Yes").length} Positive</span>
                                </div>
                                <div className="divide-y divide-slate-100 text-xs">
                                  {neckItems.map((item, idx) => (
                                    <div key={idx} className={`px-3.5 py-2 flex items-center justify-between ${item.response === "Yes" ? "bg-rose-50/50" : ""}`}>
                                      <div className="flex items-center gap-2">
                                        <span className={`w-1.5 h-1.5 rounded-full ${item.response === "Yes" ? "bg-rose-600" : "bg-slate-300"}`} />
                                        <span className={`font-medium ${item.response === "Yes" ? "font-bold text-slate-900" : "text-slate-700"}`}>
                                          {item.symptom.replace(/Symptoms on Neck – /g, "")}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2 shrink-0">
                                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                          item.relevance === "H" ? "bg-rose-100 text-rose-800" : item.relevance === "M" ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-600"
                                        }`}>
                                          {item.relevance === "H" ? "High" : item.relevance === "M" ? "Med" : "Low"}
                                        </span>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                                          item.response === "Yes" 
                                            ? "bg-rose-600 text-white" 
                                            : "bg-slate-100 text-slate-500"
                                        }`}>
                                          {item.response}
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Axillary & Arm Findings */}
                              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                                <div className="bg-slate-100 px-3.5 py-2 border-b border-slate-200 flex items-center justify-between">
                                  <span className="text-xs font-black text-slate-800">Axillary & Arm Territory</span>
                                  <span className="text-[10px] text-slate-500 font-semibold">{armItems.filter(i => i.response === "Yes").length} Positive</span>
                                </div>
                                <div className="divide-y divide-slate-100 text-xs max-h-80 overflow-y-auto">
                                  {armItems.map((item, idx) => (
                                    <div key={idx} className={`px-3.5 py-2 flex items-center justify-between ${item.response === "Yes" ? "bg-rose-50/50" : ""}`}>
                                      <div className="flex items-center gap-2">
                                        <span className={`w-1.5 h-1.5 rounded-full ${item.response === "Yes" ? "bg-rose-600" : "bg-slate-300"}`} />
                                        <span className={`font-medium ${item.response === "Yes" ? "font-bold text-slate-900" : "text-slate-700"}`}>
                                          {item.symptom.replace(/Symptoms on (Left|Right) Arm – /g, "$1 Arm: ")}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2 shrink-0">
                                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                          item.relevance === "H" ? "bg-rose-100 text-rose-800" : item.relevance === "M" ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-600"
                                        }`}>
                                          {item.relevance === "H" ? "High" : item.relevance === "M" ? "Med" : "Low"}
                                        </span>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                                          item.response === "Yes" 
                                            ? "bg-rose-600 text-white" 
                                            : "bg-slate-100 text-slate-500"
                                        }`}>
                                          {item.response}
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })()}

                      {/* 5. PHASE 3: SYSTEMIC & DISTANT SCREENING */}
                      {(() => {
                        const summary = activePatient.assessmentSession?.summary;
                        const answers = activePatient.assessmentSession?.answers || [];

                        const phase3Items = summary?.phasedAnswers?.phase3 || [
                          { symptom: "Respiratory Symptoms – Cough", relevance: "M", weight: 2 },
                          { symptom: "Respiratory Symptoms – Breathlessness", relevance: "H", weight: 3 },
                          { symptom: "Respiratory Symptoms – Chest Pain", relevance: "H", weight: 3 },
                          { symptom: "Respiratory Symptoms – Wheezing", relevance: "M", weight: 2 },
                          { symptom: "CNS Symptoms – Headache", relevance: "M", weight: 2 },
                          { symptom: "CNS Symptoms – Blurred Vision", relevance: "H", weight: 3 },
                          { symptom: "CNS Symptoms – Giddiness", relevance: "M", weight: 2 },
                          { symptom: "CNS Symptoms – Nausea", relevance: "M", weight: 2 },
                          { symptom: "CNS Symptoms – Vomiting", relevance: "M", weight: 2 },
                          { symptom: "CNS Symptoms – Convulsions", relevance: "H", weight: 3 },
                          { symptom: "Musculoskeletal Symptoms – Back Pain", relevance: "M", weight: 2 },
                          { symptom: "Musculoskeletal Symptoms – Joint Pain", relevance: "M", weight: 2 },
                          { symptom: "Musculoskeletal Symptoms – Shoulder Pain", relevance: "M", weight: 2 },
                          { symptom: "Musculoskeletal Symptoms – Underarm Pain", relevance: "M", weight: 2 },
                          { symptom: "Musculoskeletal Symptoms – Muscle Weakness", relevance: "M", weight: 2 },
                          { symptom: "Musculoskeletal Symptoms – Difficulty Moving", relevance: "M", weight: 2 }
                        ].map(item => {
                          const isYes = answers.some(a => (a.questionId.toLowerCase() === item.symptom.toLowerCase() || a.label?.toLowerCase().includes(item.symptom.toLowerCase())) && (a.value === "Yes" || a.value === "yes" || a.value === true));
                          return {
                            ...item,
                            response: isYes ? "Yes" : "No"
                          };
                        });

                        const respItems = phase3Items.filter(i => i.symptom.toLowerCase().includes("respiratory"));
                        const cnsItems = phase3Items.filter(i => i.symptom.toLowerCase().includes("cns"));
                        const mskItems = phase3Items.filter(i => i.symptom.toLowerCase().includes("musculoskeletal"));
                        const anyPositive = phase3Items.some(i => i.response === "Yes");

                        return (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-black">3</span>
                                Phase 3: Systemic & Distant Screening (Metastatic Domains)
                              </h4>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                anyPositive ? "bg-rose-100 text-rose-800" : "bg-emerald-100 text-emerald-800"
                              }`}>
                                {anyPositive ? `${phase3Items.filter(i => i.response === "Yes").length} Positive Findings` : "All Systemic Domains Clean"}
                              </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {/* Respiratory */}
                              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                                <div className="bg-slate-100 px-3.5 py-2 border-b border-slate-200 flex items-center justify-between">
                                  <span className="text-xs font-black text-slate-800">Respiratory</span>
                                  <span className="text-[10px] text-slate-500 font-semibold">{respItems.filter(i => i.response === "Yes").length} Positive</span>
                                </div>
                                <div className="divide-y divide-slate-100 text-xs">
                                  {respItems.map((item, idx) => (
                                    <div key={idx} className={`px-3.5 py-2 flex items-center justify-between ${item.response === "Yes" ? "bg-rose-50/50" : ""}`}>
                                      <span className={`font-medium ${item.response === "Yes" ? "font-bold text-slate-900" : "text-slate-700"}`}>
                                        {item.symptom.replace(/Respiratory Symptoms – /g, "")}
                                      </span>
                                      <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                                        item.response === "Yes" ? "bg-rose-600 text-white" : "bg-slate-100 text-slate-500"
                                      }`}>
                                        {item.response}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* CNS */}
                              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                                <div className="bg-slate-100 px-3.5 py-2 border-b border-slate-200 flex items-center justify-between">
                                  <span className="text-xs font-black text-slate-800">CNS / Neurological</span>
                                  <span className="text-[10px] text-slate-500 font-semibold">{cnsItems.filter(i => i.response === "Yes").length} Positive</span>
                                </div>
                                <div className="divide-y divide-slate-100 text-xs">
                                  {cnsItems.map((item, idx) => (
                                    <div key={idx} className={`px-3.5 py-2 flex items-center justify-between ${item.response === "Yes" ? "bg-rose-50/50" : ""}`}>
                                      <span className={`font-medium ${item.response === "Yes" ? "font-bold text-slate-900" : "text-slate-700"}`}>
                                        {item.symptom.replace(/CNS Symptoms – /g, "")}
                                      </span>
                                      <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                                        item.response === "Yes" ? "bg-rose-600 text-white" : "bg-slate-100 text-slate-500"
                                      }`}>
                                        {item.response}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Musculoskeletal */}
                              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                                <div className="bg-slate-100 px-3.5 py-2 border-b border-slate-200 flex items-center justify-between">
                                  <span className="text-xs font-black text-slate-800">Musculoskeletal</span>
                                  <span className="text-[10px] text-slate-500 font-semibold">{mskItems.filter(i => i.response === "Yes").length} Positive</span>
                                </div>
                                <div className="divide-y divide-slate-100 text-xs max-h-60 overflow-y-auto">
                                  {mskItems.map((item, idx) => (
                                    <div key={idx} className={`px-3.5 py-2 flex items-center justify-between ${item.response === "Yes" ? "bg-rose-50/50" : ""}`}>
                                      <span className={`font-medium ${item.response === "Yes" ? "font-bold text-slate-900" : "text-slate-700"}`}>
                                        {item.symptom.replace(/Musculoskeletal Symptoms – /g, "")}
                                      </span>
                                      <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                                        item.response === "Yes" ? "bg-rose-600 text-white" : "bg-slate-100 text-slate-500"
                                      }`}>
                                        {item.response}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })()}

                      {/* 6. PATIENT NARRATIVE & CLINICAL AUDIT NOTE */}
                      {activePatient.assessmentSession?.summary?.patientNote && (
                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                          <span className="text-[10px] text-slate-400 font-extrabold uppercase block tracking-wider">
                            Patient Narrative Note & Session Record
                          </span>
                          <p className="text-xs text-slate-800 italic font-medium leading-relaxed">
                            "{activePatient.assessmentSession.summary.patientNote}"
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  // --- FALLBACK MOCK INTAKE SUMMARY ---
                  <>
                    <div className="flex items-center justify-between border-b pb-3">
                      <h3 className="font-extrabold text-slate-800 text-sm">Patient Questionnaire Summary</h3>
                      <span className="text-[10px] text-slate-400">Submitted: {activePatient.clinicalIntake?.submittedAt || "2026-07-21"}</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                      <div className="space-y-3">
                        <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                          <p className="text-slate-450 font-bold uppercase text-[9px]">Presenting Concern</p>
                          <p className="font-bold text-slate-800">{activePatient.clinicalIntake?.answers?.main_concern?.join(", ").replace(/_/g, " ") || "No breast lumps or skin changes reported."}</p>
                        </div>
                        <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                          <p className="text-slate-450 font-bold uppercase text-[9px]">Location & Pain Side</p>
                          <p className="font-semibold text-slate-700 capitalize">{activePatient.clinicalIntake?.answers?.affectedSide || "Bilateral / None"}</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                          <p className="text-slate-450 font-bold uppercase text-[9px]">Menstrual and Reproductive history</p>
                          <p className="font-semibold text-slate-700">{activePatient.medicalHistory?.reproductiveHistory || "Post-menopausal. Age at menarche: 13. Regular cycles previously."}</p>
                        </div>
                        <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                          <p className="text-slate-450 font-bold uppercase text-[9px]">Patient-entered note</p>
                          <p className="text-slate-600 italic">"{activePatient.assessmentSession?.summary?.patientNote || "No personal notes entered."}"</p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
                <div className="pt-4 border-t border-slate-100 flex gap-3">
                  <button 
                    onClick={handleMarkIntakeReviewed}
                    className="px-4 py-2 bg-primary hover:bg-[#004D46] text-white text-xs font-bold rounded-xl transition-all"
                  >
                    Mark Intake Reviewed
                  </button>
                  <button 
                    onClick={() => alert("Sent request for clarification update.")}
                    className="px-4 py-2 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold rounded-xl transition-all"
                  >
                    Request Patient Update
                  </button>
                </div>
              </div>
            )}

            {/* C. MEDICAL HISTORY TAB */}
            {activeDetailTab === "history" && (
              <div className="space-y-6 text-left">
                <div className="border-b pb-3 flex justify-between items-center">
                  <h3 className="font-extrabold text-slate-800 text-sm">Longitudinal Medical History</h3>
                  <button 
                    onClick={() => alert("Add clinical history item")}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-xl text-xs font-bold"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add History Item
                  </button>
                </div>
                <div className="space-y-4">
                  {[
                    { date: "2024-11-12", title: "Hypertension diagnosis", desc: "Stable on Telmisartan 40mg daily.", verified: true },
                    { date: "2023-04-18", title: "Bilateral Screening Mammography", desc: "BI-RADS 1. Scattered fibroglandular density.", verified: true },
                    { date: "2019-08-02", title: "Previous right breast benign cyst removal", desc: "Excisional biopsy confirmed fibroadenoma. No atypia.", verified: true }
                  ].map((hist, i) => (
                    <div key={i} className="flex gap-4 items-start border-l-2 border-slate-200 pl-4 py-1 text-xs">
                      <span className="text-slate-400 font-bold tracking-wide w-20 shrink-0 block">{hist.date}</span>
                      <div>
                        <p className="font-extrabold text-slate-850">{hist.title}</p>
                        <p className="text-slate-500 mt-0.5">{hist.desc}</p>
                        <span className="inline-block mt-1 text-[8.5px] bg-emerald-50 text-emerald-700 border border-emerald-250 rounded px-1.5 font-bold uppercase">
                          Clinician-Verified
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* D. REPORTS TAB */}
            {activeDetailTab === "reports" && (
              <div className="space-y-6 text-left">
                <div className="border-b pb-3">
                  <h3 className="font-extrabold text-slate-800 text-sm">Uploaded Clinical Documents & PDFs</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {activePatient.reports && activePatient.reports.length > 0 ? (
                    activePatient.reports.map((rep) => (
                      <div key={rep.id} className="p-4 border border-slate-200 rounded-2xl flex items-center justify-between gap-4">
                        <div className="flex gap-3">
                          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-extrabold text-slate-850">{rep.title}</p>
                            <p className="text-slate-400 text-[10px] mt-0.5">Category: {rep.category} &bull; Uploaded: {rep.uploadedAt}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button 
                            onClick={() => alert("Previewing: " + rep.title)}
                            className="p-1.5 hover:bg-slate-100 text-slate-500 rounded-lg"
                            title="Preview file"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => alert("Downloading: " + rep.title)}
                            className="p-1.5 hover:bg-slate-100 text-slate-500 rounded-lg"
                            title="Download file"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-2 py-8 text-center text-slate-400 font-semibold">
                      No document uploads currently registered.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* E. IMAGING TAB */}
            {activeDetailTab === "imaging" && (
              <div className="space-y-6 text-left">
                <div className="border-b pb-3 flex justify-between items-center">
                  <h3 className="font-extrabold text-slate-800 text-sm">Imaging & PACS Workspace</h3>
                  <button 
                    onClick={() => alert("Opening native DICOM workspace...")}
                    className="flex items-center gap-1 px-3 py-1.5 bg-primary hover:bg-[#004D46] text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                  >
                    Open Imaging Workspace <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="space-y-4">
                  {mockImagingStudies.map((study) => (
                    <div key={study.id} className="p-4 border border-slate-200 rounded-2xl space-y-3 text-xs bg-slate-50/25">
                      <div className="flex items-center justify-between border-b pb-2 border-slate-100">
                        <div>
                          <p className="font-extrabold text-slate-800 text-sm">{study.type}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">Accession: {study.accession} &bull; Date: {study.date}</p>
                        </div>
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-250 rounded-full text-[9px] font-bold uppercase">
                          {study.status}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <p className="text-slate-400 font-bold uppercase text-[9px]">Radiology Observation summary</p>
                        <p className="text-slate-700 leading-relaxed font-semibold italic">"{study.reports}"</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* F. AI ASSESSMENT TAB */}
            {activeDetailTab === "ai" && (
              <div className="space-y-6 text-left text-xs">
                <div className="border-b pb-3 flex items-center justify-between">
                  <h3 className="font-extrabold text-slate-800 text-sm">AI Explainability & Decision Support</h3>
                  <span className="text-[10px] text-slate-400">Model: NariSetu-AI Vision Transformer v2.1.2</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="p-4 bg-emerald-50/45 border border-emerald-100 rounded-2xl space-y-2">
                      <p className="font-extrabold text-emerald-850 flex items-center gap-1 text-sm">
                        <BrainCircuit className="w-4 h-4 text-emerald-600 animate-pulse" /> Neural Assessment Density Overlay
                      </p>
                      <p className="text-slate-650 leading-relaxed">
                        The model identified an area of scattered stromal fibroglandular density in the right upper-outer quadrant. Calibrated confidence rating is <strong>98.7%</strong> matching BI-RADS 2 characteristics (benign). No visual indicators of architectural distortion or high-density spiculated masses were flagged.
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-bold text-slate-700">Record Clinician Interpretation Decision</h4>
                    <p className="text-slate-450 leading-relaxed">AI acts as supportive decision assistance only. Select your evaluation state below:</p>
                    <div className="space-y-2 pt-2">
                      {[
                        { val: "accept", label: "Accept AI assessment as supportive evidence" },
                        { val: "disagree", label: "Disagree with model features (flag manual override)" },
                        { val: "escalate", label: "Escalate scan for radiologist consensus" }
                      ].map((opt) => (
                        <label key={opt.val} className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer font-semibold text-slate-750">
                          <input
                            type="radio"
                            name="ai-decision"
                            value={opt.val}
                            checked={aiDecision === opt.val}
                            onChange={(e) => setAiDecision(e.target.value)}
                            className="accent-primary"
                          />
                          {opt.label}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="pt-4 border-t border-slate-100 flex justify-end">
                  <button 
                    onClick={() => alert("Evaluation registered successfully.")}
                    className="px-5 py-2.5 bg-primary hover:bg-[#004D46] text-white text-xs font-bold rounded-xl transition-all shadow-xs"
                  >
                    Record Clinical Decision
                  </button>
                </div>
              </div>
            )}

            {/* G. CLINICAL REVIEW TAB */}
            {activeDetailTab === "review" && (
              <div className="space-y-6 text-left text-xs">
                <div className="border-b pb-3">
                  <h3 className="font-extrabold text-slate-800 text-sm">Oncologist Clinical Summary Document</h3>
                </div>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-slate-400 font-bold uppercase text-[9px] block">Doctor Clinical Notes (Structured template or free text)</label>
                    <textarea
                      rows={5}
                      value={clinicalNote}
                      onChange={(e) => setClinicalNote(e.target.value)}
                      placeholder="Enter patient assessment notes, physical examination observations, radiologist observations, clinical logic, and final evaluation details..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-750 focus-ring"
                    />
                  </div>

                  <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-2.5 text-amber-800">
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                    <p className="leading-relaxed">
                      <strong>Clinical Safety Disclaimer:</strong> Clinical decisions must be made by qualified healthcare professionals after reviewing all available information. Ensure radiologist reports and patient history are fully consolidated.
                    </p>
                  </div>
                </div>
                <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                  <button 
                    onClick={() => alert("Draft saved successfully.")}
                    className="px-4 py-2 bg-white border border-slate-200 text-slate-650 hover:bg-slate-50 text-xs font-bold rounded-xl transition-all"
                  >
                    Save Draft Notes
                  </button>
                  <button 
                    onClick={() => alert("Clinical review finalized and countersigned.")}
                    className="px-4 py-2 bg-primary hover:bg-[#004D46] text-white text-xs font-bold rounded-xl transition-all"
                  >
                    Finalise Review & Countersign
                  </button>
                </div>
              </div>
            )}

            {/* H. CARE PLAN TAB */}
            {activeDetailTab === "careplan" && (
              <div className="space-y-6 text-left text-xs">
                <div className="border-b pb-3">
                  <h3 className="font-extrabold text-slate-800 text-sm">Active Patient Care Plan Editor</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-slate-400 font-bold uppercase text-[9px] block">Primary Clinical Objective</label>
                      <input
                        type="text"
                        value={carePlanObjective}
                        onChange={(e) => setCarePlanObjective(e.target.value)}
                        placeholder="e.g. 6-Month Routine Screening Follow-up Cycle"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus-ring text-slate-750 font-semibold"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-slate-400 font-bold uppercase text-[9px] block">Medication & Advice guidance</label>
                      <textarea
                        rows={3}
                        value={carePlanMedication}
                        onChange={(e) => setCarePlanMedication(e.target.value)}
                        placeholder="Guidance instructions, medications, follow-up timelines..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus-ring text-slate-750"
                      />
                    </div>
                  </div>
                  <div className="space-y-3 bg-slate-50/50 p-4 rounded-2xl border border-slate-200/60">
                    <h4 className="font-bold text-slate-700">Patient-Visible Guidance Checklist</h4>
                    <p className="text-[10px] text-slate-400 leading-tight">These elements will publish to the patient's personal portal:</p>
                    <div className="space-y-1.5 pt-2">
                      <div className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-500" /> Routine follow-up scan in 6 months</div>
                      <div className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-500" /> Monthly breast self-examination checklist</div>
                      <div className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-500" /> Warning signs info checklist booklet</div>
                    </div>
                  </div>
                </div>
                <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                  <button 
                    onClick={() => alert("Care plan draft updated.")}
                    className="px-4 py-2 bg-white border border-slate-200 text-slate-650 hover:bg-slate-50 text-xs font-bold rounded-xl transition-all"
                  >
                    Save Plan Draft
                  </button>
                  <button 
                    onClick={() => alert("Care plan published to Patient Portal.")}
                    className="px-4 py-2 bg-primary hover:bg-[#004D46] text-white text-xs font-bold rounded-xl transition-all"
                  >
                    Publish to Patient
                  </button>
                </div>
              </div>
            )}

            {/* I. APPOINTMENTS TAB */}
            {activeDetailTab === "appointments" && (
              <div className="space-y-6 text-left">
                <div className="border-b pb-3 flex justify-between items-center">
                  <h3 className="font-extrabold text-slate-800 text-sm">Consultation Calendars</h3>
                  <button 
                    onClick={() => alert("Scheduling consult...")}
                    className="flex items-center gap-1 px-3 py-1.5 bg-primary hover:bg-[#004D46] text-white rounded-xl text-xs font-bold cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Book Consultation
                  </button>
                </div>
                <div className="space-y-3 text-xs">
                  {/* Dynamic Requested Appointment */}
                  {activePatient.clinicalJourney?.appointmentStatus === "REQUESTED" && (
                    <div className="p-3.5 border border-amber-300 bg-amber-50/20 rounded-2xl flex items-center justify-between gap-4">
                      <div>
                        <p className="font-extrabold text-amber-800">Requested Consultation</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Date: {activePatient.clinicalJourney.appointmentDate || "Not Specified"} &bull; Mode: Teleconsult/In-Person</p>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={async () => {
                            if (confirm(`Confirm appointment request for ${activePatient.name}?`)) {
                              const updatedPatient = {
                                ...activePatient,
                                clinicalJourney: {
                                  ...activePatient.clinicalJourney!,
                                  appointmentStatus: "SCHEDULED" as const
                                }
                              };
                              await PatientService.updatePatientRecord(updatedPatient);
                              setSelectedPatient(updatedPatient);
                              window.dispatchEvent(new CustomEvent("patient-updated"));
                              alert("Appointment Confirmed");
                            }
                          }}
                          className="px-3 py-1.5 bg-primary hover:bg-[#004D46] text-white rounded-lg font-bold cursor-pointer"
                        >
                          Confirm
                        </button>
                        <button 
                          onClick={async () => {
                            if (confirm(`Deny appointment request for ${activePatient.name}?`)) {
                              const updatedPatient = {
                                ...activePatient,
                                clinicalJourney: {
                                  ...activePatient.clinicalJourney!,
                                  appointmentStatus: "NOT_SCHEDULED" as const
                                }
                              };
                              await PatientService.updatePatientRecord(updatedPatient);
                              setSelectedPatient(updatedPatient);
                              window.dispatchEvent(new CustomEvent("patient-updated"));
                              alert("Appointment Denied");
                            }
                          }}
                          className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg font-bold cursor-pointer"
                        >
                          Deny
                        </button>
                      </div>
                    </div>
                  )}

                  {[
                    ...(activePatient.clinicalJourney?.appointmentStatus === "SCHEDULED" || activePatient.clinicalJourney?.appointmentStatus === "CONFIRMED"
                      ? [{ id: "dyn-sched", date: activePatient.clinicalJourney.appointmentDate || "Pending Date", time: "11:30 AM", type: "Requested Consultation", mode: "In-Person/Teleconsult", status: "Scheduled" }]
                      : []
                    ),
                    { id: "ap-1", date: "2026-07-24", time: "11:30 AM", type: "Post-AI Review Clarification", mode: "In-Person", status: "Scheduled" },
                    { id: "ap-2", date: "2026-01-18", time: "02:00 PM", type: "Bilateral Scan Cycle Review", mode: "In-Person", status: "Completed" }
                  ].map((ap) => (
                    <div key={ap.id} className="p-3.5 border border-slate-200 rounded-2xl flex items-center justify-between gap-4 bg-white">
                      <div>
                        <p className="font-extrabold text-slate-800">{ap.type}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Date: {ap.date} &bull; Mode: {ap.mode}</p>
                      </div>
                      <div className="text-right space-y-1">
                        <span className="text-[10px] font-bold text-slate-500 block">{ap.time}</span>
                        <span className="inline-block px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-[9px] font-bold uppercase">{ap.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* J. MESSAGES TAB */}
            {activeDetailTab === "messages" && (
              <div className="space-y-6 text-left">
                <div className="border-b pb-3">
                  <h3 className="font-extrabold text-slate-800 text-sm">Clinician Messaging Area</h3>
                </div>
                <div className="h-48 border border-slate-200 rounded-2xl p-4 overflow-y-auto space-y-3 bg-slate-50/30 text-xs">
                  {chatThread.map((msg, idx) => (
                    <div key={idx} className={`p-2.5 rounded-xl max-w-sm ${msg.sender.includes("Iyer") ? "bg-primary/5 border border-primary/10 ml-auto text-right" : "bg-white border border-slate-200 mr-auto text-left"}`}>
                      <p className="text-[9px] font-bold text-slate-400 leading-none">{msg.sender} &bull; {msg.time}</p>
                      <p className="text-xs text-slate-850 mt-1 leading-relaxed">{msg.text}</p>
                    </div>
                  ))}
                </div>
                
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      placeholder="Type secure clinician note or response..."
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus-ring text-slate-750"
                      onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                    />
                    <button 
                      onClick={handleSendMessage}
                      className="px-4 py-2 bg-primary hover:bg-[#004D46] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" /> Send
                    </button>
                  </div>

                  <div className="p-3 bg-rose-50 border border-rose-250 rounded-2xl flex items-start gap-2.5 text-rose-800 text-xs">
                    <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                    <p className="leading-relaxed">
                      <strong>Secure Portal Warning:</strong> Advise the patient to contact emergency services or the appropriate clinical team. Do not rely on portal messaging for emergencies.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* K. ACTIVITY LOG TAB */}
            {activeDetailTab === "activity" && (
              <div className="space-y-6 text-left">
                <div className="border-b pb-3">
                  <h3 className="font-extrabold text-slate-800 text-sm">Case Activity Timeline</h3>
                </div>
                <div className="space-y-4">
                  {[
                    { title: "Clinical screening checklist completed", date: "2026-07-21 at 09:30 AM", user: "Nurse Anjali" },
                    { title: "Bilateral digital mammography reports verified", date: "2026-07-20 at 02:15 PM", user: "Dr. Alok Mehta" },
                    { title: "Explainability vision transformer analysis generated", date: "2026-07-20 at 02:00 PM", user: "AI Vision Core" }
                  ].map((act, i) => (
                    <div key={i} className="flex gap-4 items-start text-xs border-b border-slate-100 pb-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                        <Activity className="w-4.5 h-4.5 text-slate-550" />
                      </div>
                      <div>
                        <p className="font-extrabold text-slate-850">{act.title}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">By: {act.user} &bull; Date: {act.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ── 5. CLINICAL REVIEWS PAGE ── */}
      {currentView === "REVIEWS" && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-6 text-left">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-extrabold text-slate-800">Clinical Reviews Dashboard</h2>
            <p className="text-xs text-slate-400">Countersign model evaluations and cross-verify screening observations.</p>
          </div>
          <div className="space-y-4">
            {filteredPatients.map((patient) => (
              <div key={patient.id} className="p-4 border border-slate-200 rounded-2xl flex items-center justify-between text-xs hover:border-primary/45 transition-colors">
                <div className="space-y-1">
                  <p className="font-extrabold text-slate-850 text-sm">{patient.name}</p>
                  <p className="text-slate-400 text-[10px]">Accession ID: {patient.id} &bull; Priority: {patient.priority}</p>
                  <p className="text-slate-500">Radiologist Status: <span className="font-semibold text-slate-700">{patient.clinicalJourney?.radiologyStatus === "COMPLETE" ? "Approved" : "Awaiting Verification"}</span></p>
                </div>
                <Link
                  href={`/doctor/patients/${patient.id}`}
                  className="px-4 py-2 bg-primary hover:bg-[#004D46] text-white font-bold rounded-xl transition-all cursor-pointer shadow-xs text-xs"
                >
                  Verify Review
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 6. IMAGING & REPORTS PAGE ── */}
      {currentView === "IMAGING_REPORTS" && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-6 text-left">
          <div className="border-b border-slate-100 pb-4 flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-lg font-extrabold text-slate-800">Imaging Studies &amp; Live AI Analysis</h2>
              <p className="text-xs text-slate-400">Select a diagnostic modality below to run live AI inference or evaluate radiologic findings.</p>
            </div>
            <span className={`px-3 py-1 text-[10px] font-bold rounded-full uppercase flex items-center gap-1.5 border ${
              imagingModality === "HISTOPATHOLOGY"
                ? "bg-teal-50 text-teal-800 border-teal-200"
                : "bg-sky-50 text-sky-800 border-sky-200"
            }`}>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              {imagingModality === "HISTOPATHOLOGY" ? "Flask AI (ResNet50) Connected" : "Mammography CAD Workstation Active"}
            </span>
          </div>

          {/* ─ Diagnostic Modality Selector (Option 1: Histopathology, Option 2: Mammography) ─ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Option 1: Histopathology */}
            <button
              type="button"
              onClick={() => setImagingModality("HISTOPATHOLOGY")}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-start justify-between relative overflow-hidden group ${
                imagingModality === "HISTOPATHOLOGY"
                  ? "bg-gradient-to-br from-teal-50/90 via-white to-teal-50/40 border-primary shadow-sm ring-2 ring-primary/25"
                  : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/70"
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                  imagingModality === "HISTOPATHOLOGY"
                    ? "bg-primary text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 group-hover:bg-slate-200"
                }`}>
                  <BrainCircuit className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Modality Option 1</span>
                    {imagingModality === "HISTOPATHOLOGY" && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-primary text-white uppercase tracking-wider">
                        Active Selection
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-extrabold text-slate-800 tracking-tight">
                    Histopathology Scan Analysis
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2">
                    Microscopic tissue biopsy evaluation, BreakHis ResNet50 classification, hierarchical subtyping &amp; Grad-CAM ROI heatmap.
                  </p>
                </div>
              </div>
              <div className="shrink-0 text-right">
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> ResNet50
                </span>
              </div>
            </button>

            {/* Option 2: Mammography */}
            <button
              type="button"
              onClick={() => setImagingModality("MAMMOGRAPHY")}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-start justify-between relative overflow-hidden group ${
                imagingModality === "MAMMOGRAPHY"
                  ? "bg-gradient-to-br from-sky-50/90 via-white to-sky-50/40 border-sky-600 shadow-sm ring-2 ring-sky-500/25"
                  : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/70"
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                  imagingModality === "MAMMOGRAPHY"
                    ? "bg-slate-900 text-sky-400 shadow-xs"
                    : "bg-slate-100 text-slate-600 group-hover:bg-slate-200"
                }`}>
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Modality Option 2</span>
                    {imagingModality === "MAMMOGRAPHY" && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-slate-900 text-white uppercase tracking-wider">
                        Active Selection
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-extrabold text-slate-800 tracking-tight">
                    Mammography CAD Workstation
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2">
                    CBIS-DDSM Full-Field Digital Mammography (FFDM), 512×512 EfficientNet-B4 mass segmentation, RECIST 1.1 caliper &amp; 4-panel PACS.
                  </p>
                </div>
              </div>
              <div className="shrink-0 text-right">
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-sky-800 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-500" /> CBIS-DDSM
                </span>
              </div>
            </button>
          </div>

          {/* ─ OPTION 1 CONTENT: Live ResNet50 AI Predictor Tool (Histopathology) ─ */}
          {imagingModality === "HISTOPATHOLOGY" && (
            <div className="p-5 bg-slate-50/70 border border-slate-200 rounded-2xl space-y-4 animate-fade-in">
              <h3 className="text-xs font-black uppercase text-slate-700 tracking-wider flex items-center gap-2">
                <BrainCircuit className="w-4 h-4 text-primary" /> Run ResNet50 AI Diagnostic Inference
              </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              {/* File Upload Zone */}
              <div className={!aiPredictResult ? "space-y-3 md:col-span-2 max-w-2xl" : "space-y-3"}>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Upload Histopathology / Diagnostic Scan (.png, .jpg, .tif)</label>
                <div className="h-[52px] border border-slate-200 rounded-xl px-3 bg-white flex items-center">
                  <input
                    type="file"
                    accept=".png,.jpg,.jpeg,.bmp,.tif,.tiff"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setAiPredictFile(file);
                        setAiPredictPreview(URL.createObjectURL(file));
                        setAiPredictResult(null);
                        setAiPredictError(null);
                      }
                    }}
                    className="block w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[11px] file:font-bold file:bg-primary file:text-white hover:file:bg-[#004D46] cursor-pointer"
                  />
                </div>

                {aiPredictPreview && (
                  <div className="relative aspect-video bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center shadow-md">
                    <img src={aiPredictPreview} alt="Histopathology Scan Preview" className="w-full h-full object-cover" />
                    <span className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md text-white text-[10px] font-extrabold px-2.5 py-1 rounded-lg border border-white/10 shadow-xs">
                      Uploaded Scan Preview
                    </span>
                  </div>
                )}

                {aiPredictError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl font-medium">
                    ⚠️ {aiPredictError}
                  </div>
                )}

                <button
                  disabled={!aiPredictFile || aiPredictLoading}
                  onClick={async () => {
                    if (!aiPredictFile) return;
                    setAiPredictLoading(true);
                    setAiPredictError(null);
                    setAiPredictResult(null);

                    const formData = new FormData();
                    formData.append("image", aiPredictFile);

                    try {
                      const res = await fetch("/api/ai/predict", {
                        method: "POST",
                        body: formData
                      });
                      const data = await res.json();

                      if (!res.ok || data.error) {
                        throw new Error(data.error || "AI prediction request failed.");
                      }
                      setAiPredictResult(data);
                    } catch (err: any) {
                      console.error("AI Prediction Error:", err);
                      setAiPredictError(err.message || "Failed to run AI prediction.");
                    } finally {
                      setAiPredictLoading(false);
                    }
                  }}
                  className="w-full h-[44px] bg-primary hover:bg-[#004D46] text-white font-bold text-xs rounded-xl shadow-md shadow-primary/15 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {aiPredictLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Running ResNet50 Model &amp; Grad-CAM...
                    </>
                  ) : (
                    <>
                      <BrainCircuit className="w-4 h-4" /> Run ResNet50 AI Model Analysis
                    </>
                  )}
                </button>
              </div>

              {/* AI Prediction Results View (Only visible when result is ready) */}
              {aiPredictResult && (
                <div className="space-y-3">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">AI Inference Output &amp; Heatmap</span>

                  <div className="space-y-3 animate-fade-in">
                    {/* Primary Finding & Confidence Header Card - EXACT h-[52px] matching left file input box */}
                    <div className="h-[52px] bg-gradient-to-r from-white via-slate-50/80 to-white border border-slate-200/90 rounded-xl px-3 flex items-center justify-between gap-2 text-xs shadow-2xs">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="flex items-center gap-1.5 shrink-0">
                          {aiPredictResult.predicted_class?.toLowerCase().includes("malignant") ? (
                            <span className="flex h-2.5 w-2.5 relative shrink-0">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                            </span>
                          ) : (
                            <span className="inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 shrink-0"></span>
                          )}
                          <span className={`text-xs font-black uppercase tracking-wide ${
                            aiPredictResult.predicted_class?.toLowerCase().includes("malignant") ? "text-rose-600" : "text-emerald-600"
                          }`}>
                            {aiPredictResult.predicted_class}
                          </span>
                        </div>

                        <div className="h-4 w-px bg-slate-200 shrink-0"></div>

                        <div className="flex items-center gap-1 shrink-0">
                          <span className="text-[9px] font-bold text-slate-400 uppercase">Confidence:</span>
                          <span className="text-xs font-black text-slate-800">{aiPredictResult.confidence_percentage}</span>
                        </div>


                      </div>

                      {/* Interactive View Toggle Switch */}
                      <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200 shrink-0">
                        <button
                          type="button"
                          onClick={() => setAiViewMode("overlay")}
                          className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                            aiViewMode === "overlay"
                              ? "bg-primary text-white shadow-xs"
                              : "text-slate-500 hover:text-slate-800"
                          }`}
                        >
                          ROI Overlay
                        </button>
                        <button
                          type="button"
                          onClick={() => setAiViewMode("heatmap")}
                          className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                            aiViewMode === "heatmap"
                              ? "bg-primary text-white shadow-xs"
                              : "text-slate-500 hover:text-slate-800"
                          }`}
                        >
                          Heatmap
                        </button>
                      </div>
                    </div>

                    {/* Heatmap & Spatial Overlay Viewer Container */}
                    <div className="relative aspect-video bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-md group flex items-center justify-center">
                      <img
                        src={aiViewMode === "overlay" ? aiPredictResult.overlay_url : aiPredictResult.heatmap_url}
                        alt={aiViewMode === "overlay" ? "ROI Spatial Overlay" : "Grad-CAM Heatmap"}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />
                      
                      <div className="absolute top-3 left-3 flex items-center gap-2">
                        <span className="bg-black/70 backdrop-blur-md text-white text-[10px] font-extrabold px-2.5 py-1 rounded-lg border border-white/10 shadow-xs flex items-center gap-1.5">
                          <Eye className="w-3.5 h-3.5 text-emerald-400" />
                          {aiViewMode === "overlay" ? "ROI Spatial Overlay (α = 0.40)" : "Grad-CAM Conv-5 Activation Heatmap"}
                        </span>
                      </div>

                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-[10px] font-semibold">
                        <span className="bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/10 text-slate-300">
                          Target Class: <strong className="text-white capitalize">{aiPredictResult.predicted_class}</strong>
                        </span>
                        <span className="bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/10 text-slate-300">
                          ResNet50 Architecture
                        </span>
                      </div>
                    </div>

                    {/* Hierarchical Histological Subtype Prediction Card */}
                    {(aiPredictResult.subclass_available || aiPredictResult.predicted_subclass) && (() => {
                      const rawSubtypes = (Array.isArray(aiPredictResult.subclass_top_predictions) && aiPredictResult.subclass_top_predictions.length > 0)
                        ? aiPredictResult.subclass_top_predictions
                        : (Array.isArray(aiPredictResult.top_predictions) && aiPredictResult.top_predictions.length > 0)
                          ? aiPredictResult.top_predictions
                          : (aiPredictResult.predicted_subclass ? [{
                              rank: 1,
                              subclass: aiPredictResult.predicted_subclass_key || aiPredictResult.predicted_subclass,
                              display_name: aiPredictResult.predicted_subclass_display || aiPredictResult.predicted_subclass,
                              main_class: aiPredictResult.subclass_main_class || aiPredictResult.predicted_class,
                              confidence_percent: aiPredictResult.subclass_confidence_percentage ?? (aiPredictResult.confidence * 100)
                            }] : []);
                      const topSubtypes = rawSubtypes.slice(0, 1);

                      return (
                        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 space-y-3.5 shadow-2xs">
                          {/* Section Header */}
                          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                                <Dna className="w-3.5 h-3.5" />
                              </div>
                              <div>
                                <h4 className="text-xs font-black text-slate-800 tracking-tight">Histological Subtype Classification</h4>
                                <span className="text-[9px] font-bold text-slate-400 block -mt-0.5">BreakHis Soft-Hierarchical ResNet50 Classifier</span>
                              </div>
                            </div>
                            <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full border border-slate-200">
                              Subtype Level
                            </span>
                          </div>

                          {/* Subtype Hero Card */}
                          <div className="bg-gradient-to-r from-slate-50 via-slate-50/60 to-white border border-slate-200/80 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3">
                            <div className="space-y-1">
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                                Predicted Subtype
                              </span>
                              <div className="flex items-center gap-2">
                                <span className={`text-base font-black tracking-tight ${
                                  aiPredictResult.subclass_main_class?.toLowerCase() === "malignant"
                                    ? "text-rose-600"
                                    : "text-emerald-600"
                                }`}>
                                  {aiPredictResult.predicted_subclass_display || aiPredictResult.predicted_subclass || "Unavailable"}
                                </span>
                                {aiPredictResult.subclass_main_class && (
                                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${
                                    aiPredictResult.subclass_main_class?.toLowerCase() === "malignant"
                                      ? "bg-rose-100 text-rose-700 border-rose-200"
                                      : "bg-emerald-100 text-emerald-700 border-emerald-200"
                                  }`}>
                                    {aiPredictResult.subclass_main_class}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="text-right">
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                                Subtype Probability
                              </span>
                              <span className="text-base font-black text-slate-800 block">
                                {aiPredictResult.subclass_confidence_percentage != null
                                  ? `${aiPredictResult.subclass_confidence_percentage}%`
                                  : "N/A"}
                              </span>
                            </div>
                          </div>

                          {/* Top Subtype Distribution */}
                          {topSubtypes.length > 0 && (
                            <div className="space-y-2 pt-1">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                                  Top-1 Subtype Probability Distribution
                                </span>
                                <span className="text-[9px] text-slate-400 font-semibold">Primary histological classification</span>
                              </div>

                              <div className="space-y-2">
                                {topSubtypes.map((item: any, index: number) => {
                                  const pct = item.confidence_percent != null ? Number(item.confidence_percent) : 0;
                                  const isMalignant = item.main_class?.toLowerCase() === "malignant";
                                  const isTop = index === 0;

                                  return (
                                    <div
                                      key={`${item.subclass || item.display_name}-${index}`}
                                      className={`p-2.5 rounded-xl border transition-all ${
                                        isTop
                                          ? "bg-white border-primary/30 shadow-2xs"
                                          : "bg-slate-50/60 border-slate-200/80"
                                      }`}
                                    >
                                      <div className="flex items-center justify-between gap-3 text-xs mb-1.5">
                                        <div className="flex items-center gap-2 min-w-0">
                                          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                                            isTop ? "bg-primary text-white" : "bg-slate-200 text-slate-600"
                                          }`}>
                                            {item.rank ?? index + 1}
                                          </span>
                                          <span className="font-bold text-slate-800 truncate">
                                            {item.display_name || item.subclass}
                                          </span>
                                          {item.main_class && (
                                            <span className={`text-[8px] font-black uppercase px-1.5 py-0.2 rounded border ${
                                              isMalignant
                                                ? "bg-rose-50 text-rose-600 border-rose-200"
                                                : "bg-emerald-50 text-emerald-600 border-emerald-200"
                                            }`}>
                                              {item.main_class}
                                            </span>
                                          )}
                                        </div>
                                        <span className="font-black text-slate-900 shrink-0">
                                          {pct.toFixed(1)}%
                                        </span>
                                      </div>

                                      {/* Progress Bar */}
                                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                          className={`h-full rounded-full transition-all duration-500 ${
                                            isMalignant
                                              ? "bg-gradient-to-r from-rose-500 to-red-600"
                                              : "bg-gradient-to-r from-emerald-500 to-teal-600"
                                          }`}
                                          style={{ width: `${Math.max(pct, 2)}%` }}
                                        />
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* Model Agreement Check Message */}
                          {aiPredictResult.subclass_agreement_message && (
                            <div className="p-2.5 bg-emerald-50/80 border border-emerald-200/80 rounded-xl flex items-center gap-2 text-[11px] text-emerald-800 font-semibold">
                              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                              <span>{aiPredictResult.subclass_agreement_message}</span>
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {!aiPredictResult.subclass_available && !aiPredictResult.predicted_subclass && aiPredictResult.subclass_error && (
                      <div className="p-3 bg-amber-50/80 border border-amber-200/80 rounded-xl flex items-center gap-2 text-[11px] text-amber-800 font-semibold">
                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>Subtype analysis: {aiPredictResult.subclass_error}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

          {/* ─ OPTION 2 CONTENT: Live CBIS-DDSM Mammography CAD Workstation ─ */}
          {imagingModality === "MAMMOGRAPHY" && (
            <div className="animate-fade-in">
              <MammographyCadStation />
            </div>
          )}
        </div>
      )}

      {/* ── 7. APPOINTMENTS PAGE ── */}
      {currentView === "APPOINTMENTS" && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-6 text-left">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-extrabold text-slate-800">Appointments & Clinical Schedule</h2>
              <p className="text-xs text-slate-400">Manage patient consultation requests, video teleconsults, and diagnostic follow-ups.</p>
            </div>
            <button
              onClick={() => {
                setShowScheduleModal(!showScheduleModal);
                if (patients.length > 0 && !schedulePatientId) {
                  setSchedulePatientId(patients[0].id);
                }
              }}
              className="px-4 py-2 bg-primary hover:bg-[#004D46] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" /> {showScheduleModal ? "Close Scheduler" : "Schedule New Appointment"}
            </button>
          </div>

          {/* Schedule Appointment Form Modal / Accordion */}
          {showScheduleModal && (
            <div className="p-5 bg-teal-50/40 border border-primary/20 rounded-2xl space-y-4 animate-fade-in">
              <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">Book / Schedule Patient Consult</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-semibold text-slate-700">
                <div>
                  <label className="block text-[10px] uppercase text-slate-400 font-bold mb-1">Select Patient</label>
                  <select
                    value={schedulePatientId}
                    onChange={(e) => setSchedulePatientId(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus-ring min-h-[38px]"
                  >
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>{p.name} (#{p.id})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-slate-400 font-bold mb-1">Consultation Date</label>
                  <input
                    type="date"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus-ring min-h-[38px]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-slate-400 font-bold mb-1">Time Slot</label>
                  <select
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus-ring min-h-[38px]"
                  >
                    <option value="09:00 AM">09:00 AM</option>
                    <option value="10:30 AM">10:30 AM</option>
                    <option value="01:30 PM">01:30 PM</option>
                    <option value="03:00 PM">03:00 PM</option>
                    <option value="04:30 PM">04:30 PM</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-slate-400 font-bold mb-1">Consultation Type</label>
                  <select
                    value={scheduleType}
                    onChange={(e) => setScheduleType(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus-ring min-h-[38px]"
                  >
                    <option value="Initial Consult">Initial Consult</option>
                    <option value="Report Review">Report Review</option>
                    <option value="Care Planning">Care Planning</option>
                    <option value="Post-AI Screening Follow-up">Post-AI Screening Follow-up</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-slate-400 font-bold mb-1">Consultation Mode</label>
                  <select
                    value={scheduleMode}
                    onChange={(e) => setScheduleMode(e.target.value as any)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus-ring min-h-[38px]"
                  >
                    <option value="In-Person">In-Person (IIT Indore Clinic)</option>
                    <option value="Teleconsult">Teleconsult (Video Call)</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    const p = patients.find(x => x.id === schedulePatientId);
                    if (!p) {
                      alert("Please select a valid patient.");
                      return;
                    }
                    const targetDate = scheduleDate || new Date(Date.now() + 86400000).toISOString().slice(0, 10);
                    const updated: PatientRecord = {
                      ...p,
                      clinicalJourney: {
                        ...p.clinicalJourney!,
                        appointmentStatus: "SCHEDULED",
                        appointmentDate: targetDate,
                      }
                    };
                    await PatientService.updatePatientRecord(updated);
                    setPatients(prev => prev.map(x => x.id === updated.id ? updated : x));
                    setShowScheduleModal(false);
                    if (typeof window !== "undefined") {
                      window.dispatchEvent(new CustomEvent("patient-updated"));
                    }
                    alert(`Appointment scheduled for ${p.name} on ${targetDate} at ${scheduleTime}.`);
                  }}
                  className="px-5 py-2 bg-primary hover:bg-[#004D46] text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Confirm &amp; Notify Patient
                </button>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {/* Show dynamic requested appointments */}
            {filteredPatients.filter(p => p.clinicalJourney?.appointmentStatus === "REQUESTED").length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-black uppercase text-amber-700 tracking-wider flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-600" /> Pending Patient Appointment Requests
                </h3>
                {filteredPatients.filter(p => p.clinicalJourney?.appointmentStatus === "REQUESTED").map(p => (
                  <div key={`req-${p.id}`} className="p-4 border border-amber-300/80 bg-amber-50/40 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs shadow-2xs">
                    <div>
                      <p className="font-extrabold text-slate-800 text-sm">{p.name} <span className="font-normal text-slate-400">#{p.id}</span></p>
                      <p className="text-[10px] text-slate-600 mt-0.5">Requested Date: <strong className="text-primary">{p.clinicalJourney?.appointmentDate || "Flexible"}</strong></p>
                      <p className="text-[9px] text-slate-400 mt-0.5">Primary Concern: {(p.clinicalIntake?.answers?.main_concern || []).join(", ") || "General Assessment"}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-block px-2.5 py-0.5 bg-amber-100 text-amber-800 border border-amber-300 rounded-full text-[9px] font-bold uppercase animate-pulse">Awaiting Approval</span>
                      <button 
                        onClick={async () => {
                          const targetDate = p.clinicalJourney?.appointmentDate || new Date(Date.now() + 86400000).toISOString().slice(0, 10);
                          p.clinicalJourney = { ...p.clinicalJourney!, appointmentStatus: "CONFIRMED", appointmentDate: targetDate };
                          await PatientService.updatePatientRecord(p);
                          setPatients(prev => prev.map(x => x.id === p.id ? p : x));
                          window.dispatchEvent(new CustomEvent("patient-updated"));
                          alert(`Confirmed appointment for ${p.name} on ${targetDate}.`);
                        }}
                        className="px-3 py-1.5 bg-primary hover:bg-[#004D46] text-white rounded-xl font-bold transition-all text-xs cursor-pointer"
                      >
                        Confirm
                      </button>
                      <button 
                        onClick={async () => {
                          p.clinicalJourney = { ...p.clinicalJourney!, appointmentStatus: "NOT_SCHEDULED" };
                          await PatientService.updatePatientRecord(p);
                          setPatients(prev => prev.map(x => x.id === p.id ? p : x));
                          window.dispatchEvent(new CustomEvent("patient-updated"));
                          alert(`Denied appointment request for ${p.name}.`);
                        }}
                        className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl font-bold transition-all text-xs cursor-pointer"
                      >
                        Deny
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Confirmed / Scheduled Consultations List */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-black uppercase text-slate-700 tracking-wider">Scheduled &amp; Upcoming Consultations</h3>
              
              {/* Dynamic Confirmed Patients */}
              {filteredPatients.filter(p => p.clinicalJourney?.appointmentStatus === "SCHEDULED" || p.clinicalJourney?.appointmentStatus === "CONFIRMED").map(p => (
                <div key={`sch-${p.id}`} className="p-4 border border-teal-200 bg-teal-50/20 rounded-2xl flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-extrabold text-slate-800 text-sm">{p.name}</p>
                      <span className="px-2 py-0.5 bg-teal-100 text-teal-800 border border-teal-300 text-[9px] font-bold rounded-md uppercase">Confirmed</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">
                      Date: <strong className="text-slate-700">{p.clinicalJourney?.appointmentDate || "Scheduled"}</strong> &bull; Mode: In-Person / Teleconsult
                    </p>
                  </div>
                  <div className="text-right space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 block">10:00 AM</span>
                    <button
                      onClick={async () => {
                        p.clinicalJourney = { ...p.clinicalJourney!, appointmentStatus: "COMPLETED" };
                        await PatientService.updatePatientRecord(p);
                        setPatients(prev => prev.map(x => x.id === p.id ? p : x));
                        window.dispatchEvent(new CustomEvent("patient-updated"));
                        alert(`Marked consultation as Completed for ${p.name}`);
                      }}
                      className="px-2.5 py-1 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg text-[10px] font-bold cursor-pointer transition-all"
                    >
                      Complete Session
                    </button>
                  </div>
                </div>
              ))}

              {/* Baseline Schedule Mock Items */}
              {[
                { time: "09:30 AM", name: "Ananya Sharma", type: "Initial Consult", mode: "In-Person", status: "Checked In" },
                { time: "11:00 AM", name: "Priya Patel", type: "Report Review", mode: "Teleconsult", status: "Awaiting Log" },
                { time: "02:30 PM", name: "Meera Nair", type: "Care Planning", mode: "In-Person", status: "Scheduled" }
              ].map((ap, i) => (
                <div key={i} className="p-4 border border-slate-200 rounded-2xl flex items-center justify-between text-xs hover:border-slate-300 transition-all">
                  <div>
                    <p className="font-extrabold text-slate-800 text-sm">{ap.name}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{ap.type} &bull; {ap.mode}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 block">{ap.time}</span>
                    <span className="inline-block px-2.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-[9px] font-bold uppercase">{ap.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── 8. CARE PLANS PAGE ── */}
      {currentView === "CARE_PLANS" && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-6 text-left">
          <div className="border-b border-slate-100 pb-4 flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-lg font-extrabold text-slate-800">Care Plan Monitor &amp; Protocol Manager</h2>
              <p className="text-xs text-slate-400">Manage clinician instructions, follow-up screening intervals, and health guidance for patients.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Patient Selector List */}
            <div className="space-y-3 lg:col-span-1 border-r border-slate-100 pr-4">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Select Patient Case</span>
              {filteredPatients.map((patient) => {
                const isSelected = (activeCarePlanPatient?.id || filteredPatients[0]?.id) === patient.id;
                return (
                  <div
                    key={patient.id}
                    onClick={() => {
                      setActiveCarePlanPatient(patient);
                      setDoctorGuidanceNotes(patient.carePlanNotes || "");
                      if (patient.carePlanTasks && patient.carePlanTasks.length > 0) {
                        setCustomCareTasks(patient.carePlanTasks);
                      }
                    }}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-primary/5 border-primary/40 text-slate-800 shadow-2xs"
                        : "border-slate-200/80 hover:bg-slate-50 text-slate-600"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-extrabold text-xs">{patient.name}</p>
                      <span className={`text-[8.5px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        (patient.priority ?? "").toUpperCase() === "CRITICAL" ? "bg-red-50 text-red-700" :
                        (patient.priority ?? "").toUpperCase() === "HIGH" ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-600"
                      }`}>
                        {patient.priority || "Low"} Risk
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">Age: {patient.age} &bull; ID: #{patient.id}</p>
                  </div>
                );
              })}
            </div>

            {/* Right: Active Care Plan Manager */}
            {(() => {
              const currentP = activeCarePlanPatient || filteredPatients[0];
              if (!currentP) return <div className="lg:col-span-2 text-xs text-slate-400">No patient selected.</div>;
              
              return (
                <div className="lg:col-span-2 space-y-5">
                  <div className="p-4 bg-slate-50/80 border border-slate-200/80 rounded-2xl flex items-center justify-between">
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-800">{currentP.name}'s Active Care Plan</h3>
                      <p className="text-[10px] text-slate-400 mt-0.5">Assigned Lead Clinician: Dr. Sarah Iyer &bull; Status: Active Monitoring</p>
                    </div>
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[10px] font-extrabold uppercase">Active</span>
                  </div>

                  {/* Guidance Notes */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-700">Doctor's Guidance &amp; Instructions for Patient</label>
                    <textarea
                      rows={3}
                      value={doctorGuidanceNotes}
                      onChange={(e) => setDoctorGuidanceNotes(e.target.value)}
                      placeholder="Enter clinician guidance notes that will be visible on the patient's care plan page..."
                      className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs focus-ring text-slate-800"
                    />
                  </div>

                  {/* Target Review Date */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Next Plan Review Date</label>
                      <input
                        type="date"
                        value={nextReviewDate || "2026-09-01"}
                        onChange={(e) => setNextReviewDate(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus-ring min-h-[38px]"
                      />
                    </div>
                  </div>

                  {/* Clinician Instructions Checklist */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-black uppercase text-slate-700 tracking-wider">Clinician-Issued Instructions Checklist</h4>
                    <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                      {customCareTasks.map((task) => (
                        <div key={task.id} className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2.5">
                            <input
                              type="checkbox"
                              checked={task.completed}
                              onChange={() => {
                                setCustomCareTasks(prev => prev.map(t => t.id === task.id ? { ...t, completed: !t.completed } : t));
                              }}
                              className="rounded border-slate-300 text-primary focus:ring-primary h-4 w-4"
                            />
                            <span className={task.completed ? "line-through text-slate-400" : "font-bold text-slate-700"}>{task.title}</span>
                          </div>
                          <span className="text-[9px] font-bold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md uppercase">{task.category}</span>
                        </div>
                      ))}
                    </div>

                    {/* Form: Add New Instruction */}
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                      <p className="text-[10px] font-bold text-slate-500 uppercase">+ Add New Instruction Task</p>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="e.g. Schedule Diagnostic Ultrasound in 3 Months"
                          value={newInstructionTitle}
                          onChange={(e) => setNewInstructionTitle(e.target.value)}
                          className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus-ring"
                        />
                        <select
                          value={newInstructionCategory}
                          onChange={(e) => setNewInstructionCategory(e.target.value)}
                          className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus-ring min-h-[38px]"
                        >
                          <option value="Screening">Screening</option>
                          <option value="Imaging">Imaging</option>
                          <option value="Lifestyle">Lifestyle</option>
                          <option value="Nutrition">Nutrition</option>
                          <option value="Medication">Medication</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => {
                            if (!newInstructionTitle.trim()) return;
                            const newTask = {
                              id: `ct-${Date.now()}`,
                              title: newInstructionTitle.trim(),
                              category: newInstructionCategory,
                              completed: false
                            };
                            setCustomCareTasks(prev => [...prev, newTask]);
                            setNewInstructionTitle("");
                          }}
                          className="px-3.5 py-2 bg-primary hover:bg-[#004D46] text-white font-bold rounded-xl text-xs cursor-pointer"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="pt-2">
                    <button
                      onClick={async () => {
                        if (!currentP) return;
                        const notesToSave = doctorGuidanceNotes.trim();
                        if (!notesToSave) {
                          alert("Please enter guidance notes for the patient before issuing the Care Plan.");
                          return;
                        }
                        const updatedP: PatientRecord = {
                          ...currentP,
                          carePlanIssued: true,
                          carePlanNotes: notesToSave,
                          carePlanTasks: customCareTasks,
                          clinicalJourney: {
                            ...currentP.clinicalJourney!,
                            carePlanStatus: "COMPLETED"
                          }
                        };
                        await PatientService.updatePatientRecord(updatedP);
                        setPatients(prev => prev.map(x => x.id === updatedP.id ? updatedP : x));
                        setActiveCarePlanPatient(updatedP);
                        if (typeof window !== "undefined") {
                          window.dispatchEvent(new CustomEvent("patient-updated"));
                        }
                        alert(`Care Plan officially issued and published for ${currentP.name}.`);
                      }}
                      className="w-full py-3 bg-primary hover:bg-[#004D46] text-white font-bold text-xs rounded-xl shadow-md shadow-primary/15 transition-all cursor-pointer"
                    >
                      Save &amp; Update Patient Care Plan
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* ── 9. MESSAGES PAGE ── */}
      {currentView === "MESSAGES" && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-6 text-left">
          <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-extrabold text-slate-800">Secure Clinical Messages Hub</h2>
              <p className="text-xs text-slate-400">Direct dynamic messaging channel between clinicians, patients, and healthcare staff.</p>
            </div>
            <span className="text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full uppercase">
              Live Synchronized
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Conversation List Sidebar */}
            <div className="space-y-2 border-r pr-4 border-slate-100">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Conversations ({conversations.length})</span>
              <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
                {conversations.map((c) => {
                  const isActive = (activeConvId || conversations[0]?.id) === c.id;
                  return (
                    <div
                      key={c.id}
                      onClick={() => {
                        setActiveConvId(c.id);
                        MessageService.markAsRead(c.id);
                        setConversations(MessageService.getConversations());
                      }}
                      className={`p-3 rounded-xl border transition-all cursor-pointer ${
                        isActive
                          ? "bg-primary/5 border-primary/30 shadow-2xs"
                          : "border-transparent hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-slate-800">{c.participantName}</span>
                        <span className="text-[9px] text-slate-400">
                          {c.lastMessageAt ? new Date(c.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate font-medium">{c.lastMessage || "No messages yet."}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-[8.5px] font-bold px-2 py-0.5 rounded-md bg-teal-50 text-teal-700 border border-teal-200">
                          {c.participantRole}
                        </span>
                        {c.unreadCount > 0 && (
                          <span className="w-4 h-4 bg-primary text-white text-[9px] font-black rounded-full flex items-center justify-center">
                            {c.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Active Message Thread */}
            {(() => {
              const activeConv = conversations.find(c => c.id === (activeConvId || conversations[0]?.id)) || conversations[0];
              if (!activeConv) return <div className="lg:col-span-2 text-xs text-slate-400">No active conversation.</div>;

              return (
                <div className="lg:col-span-2 space-y-4 flex flex-col justify-between">
                  {/* Chat Header */}
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                      {activeConv.participantInitials || "PT"}
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-slate-800">{activeConv.participantName}</p>
                      <p className="text-[10px] text-slate-400 font-semibold">{activeConv.participantRole} &bull; Clinical Messaging Thread</p>
                    </div>
                  </div>

                  {/* Messages Scroll Box */}
                  <div className="h-72 border border-slate-200 rounded-xl p-4 overflow-y-auto space-y-3 bg-slate-50/20 text-xs">
                    {activeConv.messages.length === 0 ? (
                      <p className="text-center text-slate-400 py-8">No messages in this thread yet. Send a message below.</p>
                    ) : (
                      activeConv.messages.map((msg) => {
                        const isDoctor = msg.senderRole === "Doctor" || msg.senderId === "doc-001";
                        return (
                          <div
                            key={msg.id}
                            className={`p-3 rounded-2xl max-w-md text-xs space-y-1 ${
                              isDoctor
                                ? "bg-primary text-white ml-auto text-right rounded-br-none"
                                : "bg-white border border-slate-200 text-slate-800 rounded-bl-none font-medium shadow-2xs"
                            }`}
                          >
                            <p className={`text-[9px] font-bold leading-none ${isDoctor ? "text-teal-200" : "text-slate-400"}`}>
                              {msg.senderName} &bull; {new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                            <p className="text-xs mt-1 leading-relaxed">{msg.content}</p>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Reply Input Box */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!doctorReplyText.trim()) return;
                      MessageService.sendMessage({
                        conversationId: activeConv.id,
                        patientId: activeConv.patientId,
                        senderId: "doc-001",
                        senderName: "Dr. Sarah Iyer",
                        senderRole: "Doctor",
                        content: doctorReplyText.trim()
                      });
                      setDoctorReplyText("");
                      setConversations(MessageService.getConversations());
                    }}
                    className="flex gap-2"
                  >
                    <input
                      type="text"
                      placeholder={`Reply to ${activeConv.participantName}...`}
                      value={doctorReplyText}
                      onChange={(e) => setDoctorReplyText(e.target.value)}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus-ring text-slate-800 font-semibold"
                    />
                    <button 
                      type="submit"
                      className="px-5 py-2.5 bg-primary hover:bg-[#004D46] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" /> Send
                    </button>
                  </form>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* ── 10. TASKS & ALERTS PAGE ── */}
      {currentView === "TASKS" && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-6 text-left">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-extrabold text-slate-800">Tasks & Urgent Alerts Center</h2>
            <p className="text-xs text-slate-400">Action checklist for AI verifications and patient updates.</p>
          </div>
          <div className="space-y-3">
            {[
              { id: 1, title: "Review patient risk assessment", detail: "Meera Nair (BC-8109) - High risk rating flagged.", priority: "CRITICAL" },
              { id: 2, title: "Countersign radiology consensus report", detail: "Priya Patel (BC-98122) - Awaiting Lead Oncologist signature.", priority: "HIGH" },
              { id: 3, title: "Review newly uploaded patient report PDF", detail: "Ananya Sharma (BC-7482) - Patient self-submitted document.", priority: "ROUTINE" }
            ].map((task) => (
              <div key={task.id} className="p-4 border border-slate-200 rounded-2xl flex items-center justify-between text-xs hover:border-primary/30 transition-all">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-extrabold text-slate-850 text-sm">{task.title}</p>
                    <span className={`px-2 py-0.5 rounded text-[8.5px] font-bold uppercase
                      ${task.priority === "CRITICAL" ? "bg-red-50 text-red-750 border border-red-200" : ""}
                      ${task.priority === "HIGH" ? "bg-amber-50 text-amber-705 border border-amber-250" : ""}
                      ${task.priority === "ROUTINE" ? "bg-slate-50 text-slate-500 border border-slate-200" : ""}`}>
                      {task.priority}
                    </span>
                  </div>
                  <p className="text-slate-500 mt-1">{task.detail}</p>
                </div>
                <button 
                  onClick={() => alert("Task checklist validated.")}
                  className="px-3.5 py-1.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600 font-bold rounded-xl text-xs"
                >
                  Mark Done
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 11. ANALYTICS PAGE ── */}
      {currentView === "ANALYTICS" && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-6 text-left">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-extrabold text-slate-800">Operational Clinic Analytics</h2>
            <p className="text-xs text-slate-400">Turnaround audit times, screening volume, and clinical queue statistics.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 border border-slate-100 rounded-2xl space-y-2 bg-slate-50/50">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Total Cases Evaluated</span>
              <h3 className="text-3xl font-black text-slate-800">142</h3>
              <p className="text-[10px] text-slate-450 font-semibold mt-1">Validated during this screening pilot</p>
            </div>
            <div className="p-5 border border-slate-100 rounded-2xl space-y-2 bg-slate-50/50">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Median Review Speed</span>
              <h3 className="text-3xl font-black text-slate-800">2.1h</h3>
              <p className="text-[10px] text-emerald-600 font-semibold mt-1">&darr; 12% turnaround improvement</p>
            </div>
            <div className="p-5 border border-slate-100 rounded-2xl space-y-2 bg-slate-50/50">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Patient Compliance</span>
              <h3 className="text-3xl font-black text-slate-800">94.8%</h3>
              <p className="text-[10px] text-slate-450 font-semibold mt-1">Initial-to-Follow-up screening adherence</p>
            </div>
          </div>
        </div>
      )}

      {/* ── 12. CLINICAL RESOURCES PAGE ── */}
      {currentView === "RESOURCES" && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-6 text-left">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-extrabold text-slate-800">Clinical Resources & Guidelines</h2>
            <p className="text-xs text-slate-400">Institutional referral guidelines, ICMR screening protocols, and DICOM standards references.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { title: "NCCN Breast Cancer Screening Guidelines v2026", desc: "Standardized timelines, risk assessment metrics (GAIL, Tyrer-Cuzick), and evaluation markers." },
              { title: "ICMR National Guidelines for Breast Screening", desc: "Regional screening priorities, rural outreach consult directives, and mobile diagnostics guidance." },
              { title: "Explainable AI (XAI) Vision Transformer Manual", desc: "Information on model calibration, region-of-interest spatial overlay parsing, and data limit standards." }
            ].map((res, i) => (
              <div key={i} className="p-4 border border-slate-200 rounded-2xl space-y-2 hover:border-primary/30 transition-colors text-xs">
                <p className="font-extrabold text-slate-850 text-sm flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-primary" /> {res.title}
                </p>
                <p className="text-slate-500 leading-relaxed font-semibold">{res.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 13. SETTINGS PAGE ── */}
      {currentView === "SETTINGS" && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-6 text-left">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-extrabold text-slate-800">Clinician Workspace Settings</h2>
            <p className="text-xs text-slate-400">Manage consult duration slots, notifications, and electronic signature files.</p>
          </div>
          <div className="max-w-xl space-y-4 text-xs font-semibold text-slate-700">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <h4 className="font-bold text-slate-800">Consultation Duration</h4>
              <select className="bg-white border border-slate-250 rounded-xl px-3 py-2 text-xs font-semibold focus-ring w-full min-h-[38px]">
                <option value="15">15 Minutes per patient case</option>
                <option value="20">20 Minutes per patient case</option>
                <option value="30">30 Minutes per patient case</option>
              </select>
            </div>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <h4 className="font-bold text-slate-800">Availability Preferences</h4>
              <div className="space-y-1">
                <label className="flex items-center gap-2"><input type="checkbox" defaultChecked /> Mondays, Wednesdays, Fridays (09:00 AM - 01:00 PM)</label>
                <label className="flex items-center gap-2"><input type="checkbox" defaultChecked /> Tele-health consults active</label>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
