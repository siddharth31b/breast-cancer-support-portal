import React, { useState, useEffect } from "react";
import { PatientService } from "../services/patient.service";
import type { PatientRecord, PatientReport } from "../types/questionnaire";
import { 
  X, 
  Clipboard, 
  History, 
  Activity, 
  FileText, 
  MessageSquare,
  Plus,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  FileClock,
  Heart,
  Loader2
} from "lucide-react";
import { useAuth } from "../features/auth/AuthContext";
import { BloodPressureAssessment } from "../features/wellness/BloodPressureAssessment";
import { BloodGlucoseAssessment } from "../features/wellness/BloodGlucoseAssessment";

interface PatientOverviewDrawerProps {
  patientId: string;
  onClose: () => void;
  onUpdate: () => void;
}

export const PatientOverviewDrawer: React.FC<PatientOverviewDrawerProps> = ({ 
  patientId, 
  onClose, 
  onUpdate 
}) => {
  const { user } = useAuth();
  const [patient, setPatient] = useState<PatientRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeWellnessTab, setActiveWellnessTab] = useState<"bmi" | "bp" | "glucose">("bmi");
  const [showAddBPSession, setShowAddBPSession] = useState(false);
  const [showAddGlucoseSession, setShowAddGlucoseSession] = useState(false);

  // Accordion Section Toggles
  const [openSection, setOpenSection] = useState<string | null>("intake");
  const [newNote, setNewNote] = useState("");
  const [noteSuccess, setNoteSuccess] = useState(false);
  const [activeSourceTab, setActiveSourceTab] = useState<"patient" | "nurse" | "compare">("compare");

  // Clarification Input State
  const [showClarifyInput, setShowClarifyInput] = useState(false);
  const [clarifyNotes, setClarifyNotes] = useState("");
  const [clarifySuccess, setClarifySuccess] = useState(false);
  const [databaseReports, setDatabaseReports] = useState<PatientReport[]>([]);

  const loadPatient = async () => {
    try {
      const record = await PatientService.getPatient(patientId);
      setPatient(record);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    loadPatient();
  }, [patientId]);

  useEffect(() => {
    const loadReports = async () => {
      try {
        const res = await fetch(`/api/reports?patientId=${patientId}`, { credentials: "include" });
        if (!res.ok) return;
        const studies = await res.json();
        setDatabaseReports(
          studies.map((study: any) => ({
            id: study.id,
            patientId,
            title: study.studyType || "Uploaded Report",
            category: "Other",
            uploadedAt: new Date(study.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
            validationStatus: study.status === "COMPLETED" ? "Validated" : "Uploaded",
            source: "Patient Upload",
            documentUrl: study.dicomUrl || undefined,
            downloadable: Boolean(study.dicomUrl),
            shareable: Boolean(study.dicomUrl),
            date: new Date(study.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
            status: study.status || "Uploaded",
            type: "clinical_note",
          }))
        );
      } catch (error) {
        console.error("Failed to load database reports", error);
      }
    };

    loadReports();
  }, [patientId]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex">
        <div className="flex-1 bg-black/40 backdrop-blur-xs animate-fade-in" onClick={onClose} />
        <div className="w-full max-w-xl bg-white h-full shadow-2xl flex items-center justify-center p-8 border-l border-slate-200">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      </div>
    );
  }

  if (!patient) return null;

  const toggleSection = (sec: string) => {
    setOpenSection(openSection === sec ? null : sec);
  };

  const handlePriorityChange = async (newPriority: "HIGH" | "MEDIUM" | "LOW") => {
    const updated = {
      ...patient,
      priority: newPriority
    };
    await PatientService.updatePatientRecord(updated);
    
    await PatientService.addNotification({
      patientId: patient.id,
      patientName: patient.name,
      title: "Priority Level Changed",
      description: `Priority for ${patient.name} updated to ${newPriority} by Dr. Sarah Iyer.`,
      category: "Clinical Updates"
    });

    onUpdate();
    loadPatient();
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    const dateStr = new Date().toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });

    const newReport: PatientReport = {
      id: `rep-${Date.now()}`,
      patientId: patient.id,
      title: "Doctor Consultation Note",
      category: "Clinical Assessment",
      uploadedAt: dateStr,
      validationStatus: "Validated",
      source: "Dr. Sarah Iyer",
      downloadable: true,
      shareable: false,
      date: dateStr,
      status: "Validated",
      type: "clinical_note"
    };

    const updated: PatientRecord = {
      ...patient,
      reports: [...(patient.reports || []), newReport]
    };

    if (updated.medicalHistory) {
      updated.medicalHistory.previousConditions = [
        ...(updated.medicalHistory.previousConditions || []),
        `Clinical Note: ${newNote}`
      ];
    }

    await PatientService.updatePatientRecord(updated);
    setNewNote("");
    setNoteSuccess(true);
    setTimeout(() => setNoteSuccess(false), 2000);
    onUpdate();
    loadPatient();
  };

  const handleAcceptIntake = async () => {
    const updated: PatientRecord = {
      ...patient,
      status: "Review Completed",
      clinicalJourney: {
        ...patient.clinicalJourney!,
        doctorReviewStatus: "COMPLETED"
      }
    };
    await PatientService.updatePatientRecord(updated);
    await PatientService.addNotification({
      patientId: patient.id,
      patientName: patient.name,
      title: "Clinical Intake Accepted",
      description: `Dr. Sarah Iyer approved the clinical intake file for ${patient.name}.`,
      category: "Doctor Review"
    });
    alert("Clinical Intake file accepted and locked successfully.");
    onUpdate();
    onClose();
  };

  const handleReviewBP = async (readingId: string) => {
    if (!patient) return;
    const comment = prompt("Enter a clinical review note / recommendation for this reading:");
    if (comment === null) return;

    const updatedHistory = (patient.bloodPressureHistory || []).map(r => {
      if (r.id === readingId) {
        return {
          ...r,
          isReviewed: true,
          reviewedBy: user?.name || "Dr. Sarah Iyer",
          reviewedAt: new Date().toISOString(),
          note: r.note ? `${r.note} | Review Note: ${comment}` : `Review Note: ${comment}`
        };
      }
      return r;
    });

    const latest = updatedHistory.find(r => r.id === readingId);

    const updated: PatientRecord = {
      ...patient,
      bloodPressureHistory: updatedHistory,
      bloodPressure: latest?.id === patient.bloodPressure?.id ? latest : patient.bloodPressure
    };

    await PatientService.updatePatientRecord(updated);
    
    await PatientService.addNotification({
      patientId: patient.id,
      patientName: patient.name,
      title: "Blood Pressure Reading Reviewed",
      description: `Dr. Sarah Iyer reviewed your blood pressure reading: ${comment}`,
      category: "Clinical Updates"
    });

    loadPatient();
    onUpdate();
  };

  const handleReviewGlucose = async (readingId: string) => {
    if (!patient) return;
    const comment = prompt("Enter a clinical review note / recommendation for this reading:");
    if (comment === null) return;

    const updatedHistory = (patient.bloodGlucoseHistory || []).map(r => {
      if (r.id === readingId) {
        return {
          ...r,
          isReviewed: true,
          reviewedBy: user?.name || "Dr. Sarah Iyer",
          reviewedAt: new Date().toISOString(),
          note: r.note ? `${r.note} | Review Note: ${comment}` : `Review Note: ${comment}`
        };
      }
      return r;
    });

    const latest = updatedHistory.find(r => r.id === readingId);

    const updated: PatientRecord = {
      ...patient,
      bloodGlucoseHistory: updatedHistory,
      bloodGlucose: latest?.id === patient.bloodGlucose?.id ? latest : patient.bloodGlucose
    };

    await PatientService.updatePatientRecord(updated);

    await PatientService.addNotification({
      patientId: patient.id,
      patientName: patient.name,
      title: "Glucose Reading Reviewed",
      description: `Dr. Sarah Iyer reviewed your glucose reading: ${comment}`,
      category: "Clinical Updates"
    });

    loadPatient();
    onUpdate();
  };

  const handleSendClarification = async () => {
    if (!clarifyNotes.trim()) return;
    await PatientService.requestClarification(patient.id, clarifyNotes);
    setClarifySuccess(true);
    setClarifyNotes("");
    setTimeout(() => {
      setClarifySuccess(false);
      setShowClarifyInput(false);
      onUpdate();
      onClose();
    }, 1500);
  };

  const handleReconciliationDecision = async (field: string, decision: string) => {
    if (!patient || !patient.clinicalIntake) return;
    const decisions = {
      ...(patient.clinicalIntake.reconciliationDecisions || {}),
      [field]: decision
    };
    const updated: PatientRecord = {
      ...patient,
      clinicalIntake: {
        ...patient.clinicalIntake,
        reconciliationDecisions: decisions
      }
    };
    setPatient(updated);
    await PatientService.updatePatientRecord(updated);
    onUpdate();
  };

  const triggerPlaceholderAction = (actionName: string) => {
    alert(`"${actionName}" action is staged. This feature will be unlocked in the next clinical workflow integration phase.`);
  };

  const isBmiHealthy = patient.bmi?.category?.includes("Healthy") || patient.bmi?.category?.includes("healthy");

  // Retrieve priority flags from both patient assessment and nurse intake
  const getCombinedPriorityFlags = () => {
    const flags = [...(patient.assessmentSession?.priorityFlags || [])];
    if (patient.clinicalIntake) {
      // Convert flat answers to QuestionnaireAnswer format
      const qAns = Object.entries(patient.clinicalIntake.answers).map(([key, val]) => ({
        questionId: key,
        value: val,
        label: String(val),
        answeredAt: ""
      }));
      const nurseFlags = PatientService.generatePriorityFlags(qAns);
      nurseFlags.forEach(nf => {
        if (!flags.some(f => f.type === nf.type)) {
          flags.push(nf);
        }
      });
    }
    return flags;
  };

  const combinedFlags = getCombinedPriorityFlags();
  // Show only database-backed reports in the doctor review drawer
  const reportsToDisplay = databaseReports;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="flex-1 bg-black/40 backdrop-blur-xs" onClick={onClose} />
      
      {/* Drawer Body */}
      <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col animate-slide-right text-slate-800 border-l border-slate-200">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
          <div>
            <h2 className="font-bold text-slate-800 text-base">{patient.name}</h2>
            <p className="text-[11px] text-slate-400 mt-0.5">Patient ID: {patient.id} · Age {patient.age} · {patient.gender || "Female"}</p>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 hover:bg-slate-200 rounded-xl flex items-center justify-center text-slate-400 cursor-pointer min-h-[44px]"
            aria-label="Close patient details panel"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Scrollable Context Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 scrollbar-thin text-left">
          
          {/* Priority Status Bar */}
          <div className="p-4 bg-slate-50 border border-slate-200/65 rounded-2xl flex items-center justify-between gap-4">
            <div>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Review Priority</span>
              <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-[9px] font-black border uppercase
                ${patient.priority === "HIGH" ? "bg-red-50 text-red-700 border-red-200" : ""}
                ${patient.priority === "MEDIUM" ? "bg-amber-50 text-amber-700 border-amber-200" : ""}
                ${patient.priority === "LOW" ? "bg-slate-50 text-slate-700 border-slate-200" : ""}
              `}>
                {patient.priority}
              </span>
            </div>
            
            <div className="space-y-1 text-right">
              <label htmlFor="assign-priority" className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest">Reassign Priority</label>
              <select
                id="assign-priority"
                value={patient.priority}
                onChange={(e) => handlePriorityChange(e.target.value as any)}
                className="bg-white border border-slate-200 rounded-lg text-xs font-semibold px-2 py-1 text-slate-700 focus-ring"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
          </div>

          {/* Safety Alerts Banner */}
          {combinedFlags.length > 0 && (
            <div className="p-4 bg-rose-50 border border-rose-150 rounded-2xl space-y-2 text-xs text-rose-800">
              <span className="font-bold flex items-center gap-1.5 uppercase text-[10px] tracking-wider text-rose-700">
                <AlertTriangle className="w-4 h-4 text-rose-600 animate-pulse" /> Critical Safety Flags
              </span>
              <ul className="list-disc list-inside space-y-1 leading-relaxed font-semibold">
                {combinedFlags.map((flag, idx) => (
                  <li key={idx} className="list-item">{flag.message}</li>
                ))}
              </ul>
            </div>
          )}

          {/* SECTION 1: Active Concern & Source Comparison */}
          <div className="border border-slate-200/80 rounded-2xl overflow-hidden bg-white shadow-xs">
            <button 
              onClick={() => toggleSection("intake")}
              className="w-full px-5 py-4 flex items-center justify-between font-bold text-xs text-slate-700 hover:bg-slate-50 cursor-pointer min-h-[44px] uppercase tracking-wider"
            >
              <span className="flex items-center gap-2">
                <Clipboard className="w-4 h-4 text-primary" /> Active Intake Concerns
              </span>
              {openSection === "intake" ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>

            {openSection === "intake" && (
              <div className="p-5 border-t border-slate-100 bg-slate-50/20 space-y-4 text-xs leading-relaxed">
                {/* Source Selection tabs if both exist */}
                {patient.assessmentSession?.status === "SUBMITTED" && patient.clinicalIntake?.status === "SUBMITTED" && (
                  <div className="flex border border-slate-200 rounded-xl overflow-hidden mb-3">
                    {["compare", "patient", "nurse"].map(tab => (
                      <button
                        key={tab}
                        onClick={() => setActiveSourceTab(tab as any)}
                        className={`flex-1 py-1.5 font-bold text-[10px] uppercase cursor-pointer ${
                          activeSourceTab === tab 
                            ? "bg-primary text-white" 
                            : "bg-white text-slate-500 hover:bg-slate-50"
                        }`}
                      >
                        {tab === "compare" ? "Comparison View" : tab === "patient" ? "Patient Reported" : "Nurse Recorded"}
                      </button>
                    ))}
                  </div>
                )}

                {/* Compare Tab contents */}
                {(activeSourceTab === "compare" || !patient.assessmentSession || !patient.clinicalIntake) && (
                  <div className="space-y-3">
                    <table className="w-full text-[11px] text-left border-collapse bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                      <thead>
                        <tr className="bg-slate-50 border-b font-bold text-[9px] text-slate-450 uppercase tracking-wider">
                          <th className="p-3">Field</th>
                          <th className="p-3">Patient Chatbot</th>
                          <th className="p-3">Nurse Intake</th>
                          <th className="p-3">Status & Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {[
                          {
                            key: "affectedSide",
                            label: "Affected Side",
                            pVal: patient.assessmentSession?.summary?.affectedSide || "—",
                            nVal: patient.clinicalIntake?.answers?.affectedSide || "—"
                          },
                          {
                            key: "symptoms",
                            label: "Symptoms/Concern",
                            pVal: patient.assessmentSession?.summary?.symptoms?.join(", ") || "—",
                            nVal: patient.clinicalIntake?.answers?.main_concern?.join(", ") || "—"
                          },
                          {
                            key: "duration",
                            label: "Duration",
                            pVal: patient.assessmentSession?.summary?.duration?.replace(/_/g, " ") || "—",
                            nVal: patient.clinicalIntake?.answers?.duration?.replace(/_/g, " ") || "—"
                          },
                          {
                            key: "progression",
                            label: "Progression",
                            pVal: patient.assessmentSession?.summary?.progression || "—",
                            nVal: patient.clinicalIntake?.answers?.progression || "—"
                          }
                        ].map((row) => {
                          const isDifferent =
                            row.pVal !== "—" &&
                            row.nVal !== "—" &&
                            row.pVal.toLowerCase().trim() !== row.nVal.toLowerCase().trim();
                          
                          const savedDecision = patient.clinicalIntake?.reconciliationDecisions?.[row.key] || "";

                          return (
                            <tr key={row.key} className={`${isDifferent ? "bg-amber-50/20 border-l-2 border-l-amber-400" : ""}`}>
                              <td className="p-3 font-semibold text-slate-650">{row.label}</td>
                              <td className="p-3 capitalize text-slate-600">{row.pVal}</td>
                              <td className="p-3 capitalize text-slate-600">{row.nVal}</td>
                              <td className="p-3 whitespace-nowrap">
                                {!isDifferent ? (
                                  <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                                    ✓ Matched
                                  </span>
                                ) : (
                                  <div className="space-y-1">
                                    <span className="inline-flex items-center gap-1 text-[9px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100 mb-1">
                                      ⚠️ Discrepancy
                                    </span>
                                    <select
                                      aria-label={`Resolve conflict for ${row.label}`}
                                      value={savedDecision}
                                      onChange={(e) => handleReconciliationDecision(row.key, e.target.value)}
                                      className="block w-full bg-white border border-slate-200 rounded-lg text-[9px] font-bold p-1 text-slate-750 focus-ring"
                                    >
                                      <option value="">Resolve...</option>
                                      <option value="CONFIRMED">Confirmed</option>
                                      <option value="NEEDS_CLARIFICATION">Needs Clarification</option>
                                      <option value="NOT_CLINICALLY_RELEVANT">Not Clinically Relevant</option>
                                    </select>
                                    {savedDecision && (
                                      <p className="text-[8px] text-slate-450 font-bold uppercase mt-0.5">
                                        Marked: {savedDecision.replace(/_/g, " ")}
                                      </p>
                                    )}
                                  </div>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Patient reported tab */}
                {activeSourceTab === "patient" && patient.assessmentSession && (
                  <div className="space-y-3 p-3 bg-white border border-slate-150 rounded-2xl">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Patient Chatbot Note</span>
                    <p className="p-3 bg-slate-50 rounded-xl italic mt-1 border">
                      "{patient.assessmentSession.summary?.patientNote || "No text comments recorded."}"
                    </p>
                  </div>
                )}

                {/* Nurse reported tab */}
                {activeSourceTab === "nurse" && patient.clinicalIntake && (
                  <div className="space-y-3 p-3 bg-white border border-slate-150 rounded-2xl">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Nurse Documented Note</span>
                    <p className="p-3 bg-slate-50 rounded-xl italic mt-1 border">
                      "{patient.clinicalIntake.answers?.symptomNotes || "No text comments recorded."}"
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* SECTION 2: Menstrual & Reproductive History */}
          <div className="border border-slate-200/80 rounded-2xl overflow-hidden bg-white shadow-xs">
            <button 
              onClick={() => toggleSection("reproductive")}
              className="w-full px-5 py-4 flex items-center justify-between font-bold text-xs text-slate-700 hover:bg-slate-50 cursor-pointer min-h-[44px] uppercase tracking-wider"
            >
              <span className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-primary" /> Menstrual & Reproductive History
              </span>
              {openSection === "reproductive" ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>

            {openSection === "reproductive" && (
              <div className="p-5 border-t border-slate-100 bg-slate-50/20 space-y-4 text-xs">
                {patient.clinicalIntake?.answers ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">Menstrual Status</span>
                      <span className="font-semibold text-slate-800 capitalize">{patient.clinicalIntake.answers.menstrualStatus || "—"}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">Menarche Age</span>
                      <span className="font-semibold text-slate-800">{patient.clinicalIntake.answers.menarcheAge || "—"} years</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">Menopause Status</span>
                      <span className="font-semibold text-slate-800 capitalize">{patient.clinicalIntake.answers.menopauseStatus || "—"}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">Menopause Age</span>
                      <span className="font-semibold text-slate-800">{patient.clinicalIntake.answers.menopauseAge || "—"} years</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">Pregnancy Count</span>
                      <span className="font-semibold text-slate-800">{patient.clinicalIntake.answers.pregnancyCount || "0"}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">Breastfeeding Duration</span>
                      <span className="font-semibold text-slate-800">{patient.clinicalIntake.answers.breastfeedingDuration || "—"} months</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">HRT Usage</span>
                      <span className="font-semibold text-slate-800 capitalize">{patient.clinicalIntake.answers.hrtUse || "—"}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">Contraceptive Use</span>
                      <span className="font-semibold text-slate-800 capitalize">{patient.clinicalIntake.answers.contraceptiveUse || "—"}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-400 text-center py-2 font-medium">Reproductive data not recorded.</p>
                )}
              </div>
            )}
          </div>

          {/* SECTION 3: Personal & Family Medical History */}
          <div className="border border-slate-200/80 rounded-2xl overflow-hidden bg-white shadow-xs">
            <button 
              onClick={() => toggleSection("history")}
              className="w-full px-5 py-4 flex items-center justify-between font-bold text-xs text-slate-700 hover:bg-slate-50 cursor-pointer min-h-[44px] uppercase tracking-wider"
            >
              <span className="flex items-center gap-2">
                <History className="w-4 h-4 text-primary" /> Medical & Family History
              </span>
              {openSection === "history" ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>

            {openSection === "history" && (
              <div className="p-5 border-t border-slate-100 bg-slate-50/20 space-y-4 text-xs">
                {/* Family History summary card */}
                {patient.clinicalIntake?.answers ? (
                  <div className="space-y-4">
                    <div className="p-3 bg-white border border-slate-150 rounded-xl space-y-2">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Family Cancer History Card</span>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-[9px] text-slate-400 block">Breast Cancer:</span>
                          <span className="font-bold text-slate-850 capitalize">{patient.clinicalIntake.answers.familyCancerBreast || "None"}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 block">Ovarian Cancer:</span>
                          <span className="font-bold text-slate-850 capitalize">{patient.clinicalIntake.answers.familyCancerOvarian || "None"}</span>
                        </div>
                        {patient.clinicalIntake.answers.familyRelation && (
                          <div className="col-span-2">
                            <span className="text-[9px] text-slate-400 block">Relationship:</span>
                            <span className="font-bold text-slate-850">{patient.clinicalIntake.answers.familyRelation} (Diagnosed age: {patient.clinicalIntake.answers.familyDiagnosisAge || "Unk"})</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Chronic Systemic conditions */}
                    <div className="p-3 bg-white border border-slate-150 rounded-xl space-y-2">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Chronic Systemic Conditions</span>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <span className="text-[9px] text-slate-400 block">Diabetes</span>
                          <span className="font-bold text-slate-850 capitalize">{patient.clinicalIntake.answers.diabetes || "No"}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 block">Hypertension</span>
                          <span className="font-bold text-slate-850 capitalize">{patient.clinicalIntake.answers.hypertension || "No"}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 block">Thyroid</span>
                          <span className="font-bold text-slate-850 capitalize">{patient.clinicalIntake.answers.thyroid || "No"}</span>
                        </div>
                      </div>
                    </div>

                    {/* Current meds */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="p-3 bg-white border border-slate-150 rounded-xl">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Current Medications</span>
                        <p className="font-bold text-slate-800 mt-1">{patient.clinicalIntake.answers.currentMeds || "None reported"}</p>
                      </div>
                      <div className="p-3 bg-white border border-slate-150 rounded-xl">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Allergies</span>
                        <p className="font-bold text-slate-800 mt-1">{patient.clinicalIntake.answers.allergies || "None reported"}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-400 text-center py-2 font-medium">History checklist not compiled.</p>
                )}
              </div>
            )}
          </div>

          {/* SECTION 4: General Wellness Indicators */}
          <div className="border border-slate-200/80 rounded-2xl overflow-hidden bg-white shadow-xs">
            <button 
              onClick={() => toggleSection("wellness")}
              className="w-full px-5 py-4 flex items-center justify-between font-bold text-xs text-slate-700 hover:bg-slate-50 cursor-pointer min-h-[44px] uppercase tracking-wider"
            >
              <span className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" /> General Wellness Indicators
              </span>
              {openSection === "wellness" ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>

            {openSection === "wellness" && (
              <div className="p-5 border-t border-slate-100 bg-slate-50/20 space-y-4 text-xs">
                {/* Tabs */}
                <div className="flex border-b border-slate-200 gap-1 pb-1">
                  <button 
                    type="button"
                    onClick={() => setActiveWellnessTab("bmi")}
                    className={`py-1.5 px-3 font-extrabold text-[10px] uppercase rounded-t-lg transition-all cursor-pointer
                      ${activeWellnessTab === "bmi" ? "bg-white border border-slate-200 border-b-white text-[#005F56]" : "text-slate-400 hover:text-slate-600"}`}
                  >
                    BMI Context
                  </button>
                  <button 
                    type="button"
                    onClick={() => setActiveWellnessTab("bp")}
                    className={`py-1.5 px-3 font-extrabold text-[10px] uppercase rounded-t-lg transition-all cursor-pointer
                      ${activeWellnessTab === "bp" ? "bg-white border border-slate-200 border-b-white text-[#005F56]" : "text-slate-400 hover:text-slate-600"}`}
                  >
                    Blood Pressure
                  </button>
                  <button 
                    type="button"
                    onClick={() => setActiveWellnessTab("glucose")}
                    className={`py-1.5 px-3 font-extrabold text-[10px] uppercase rounded-t-lg transition-all cursor-pointer
                      ${activeWellnessTab === "glucose" ? "bg-white border border-slate-200 border-b-white text-[#005F56]" : "text-slate-400 hover:text-slate-600"}`}
                  >
                    Blood Glucose
                  </button>
                </div>

                {/* BMI Tab */}
                {activeWellnessTab === "bmi" && (
                  <div className="space-y-3.5">
                    {patient.bmi ? (
                      <>
                        <div className="grid grid-cols-3 gap-3">
                          <div className="p-3 bg-white border border-slate-150 rounded-xl text-center">
                            <span className="text-[9px] font-bold text-slate-400 uppercase">Height</span>
                            <span className="block font-bold text-slate-800 text-sm mt-0.5">{patient.bmi.heightCm} cm</span>
                          </div>
                          <div className="p-3 bg-white border border-slate-150 rounded-xl text-center">
                            <span className="text-[9px] font-bold text-slate-400 uppercase">Weight</span>
                            <span className="block font-bold text-slate-800 text-sm mt-0.5">{patient.bmi.weightKg} kg</span>
                          </div>
                          <div className="p-3 bg-white border border-slate-150 rounded-xl text-center">
                            <span className="text-[9px] font-bold text-slate-400 uppercase">BMI Value</span>
                            <span className="block font-bold text-[#005F56] text-sm mt-0.5">{patient.bmi.value}</span>
                          </div>
                        </div>

                        <div className="p-4 bg-white border border-slate-150 rounded-2xl space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-[9px] font-bold text-slate-400 uppercase">Category</span>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border uppercase
                              ${isBmiHealthy ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}>
                              {patient.bmi.category}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 leading-relaxed pt-1">
                            {patient.bmi.description}
                          </p>
                        </div>
                      </>
                    ) : (
                      <p className="text-slate-400 text-center py-2 font-medium">BMI data not recorded.</p>
                    )}

                    {/* Lifestyle summary if nurse recorded */}
                    {patient.clinicalIntake?.answers && (
                      <div className="p-4 bg-white border border-slate-150 rounded-2xl space-y-2 text-[11px] text-slate-500 leading-relaxed">
                        <span className="font-bold text-[9px] uppercase block tracking-wider text-slate-400">General Wellness Context</span>
                        <div>• Smoking: {patient.clinicalIntake.answers.smoking || "—"}</div>
                        <div>• Alcohol: {patient.clinicalIntake.answers.alcohol || "—"}</div>
                        <div>• Sleep: {patient.clinicalIntake.answers.sleepQuality || "—"}</div>
                        <div>• Activity: {patient.clinicalIntake.answers.physicalActivity || "—"}</div>
                      </div>
                    )}
                  </div>
                )}

                {/* Blood Pressure Tab */}
                {activeWellnessTab === "bp" && (
                  <div className="space-y-4">
                    {/* Add Reading Box for Nurse/Doctor */}
                    {(user?.role === "BREAST_CARE_NURSE" || user?.role === "DOCTOR") && (
                      <div className="bg-slate-50/50 border border-slate-150 rounded-2xl p-4">
                        {showAddBPSession ? (
                          <div className="space-y-3">
                            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                              <span className="font-extrabold uppercase text-[9px] text-[#005F56]">Record Clinical BP</span>
                              <button 
                                type="button" 
                                onClick={() => setShowAddBPSession(false)} 
                                className="text-[10px] font-bold text-slate-400 hover:text-slate-650"
                              >
                                Cancel
                              </button>
                            </div>
                            <BloodPressureAssessment 
                              onSaved={() => { setShowAddBPSession(false); loadPatient(); onUpdate(); }} 
                              onCancel={() => setShowAddBPSession(false)} 
                            />
                          </div>
                        ) : (
                          <button 
                            type="button"
                            onClick={() => setShowAddBPSession(true)}
                            className="w-full flex items-center justify-center gap-1.5 py-2.5 border-2 border-dashed border-slate-200 hover:border-primary text-slate-500 hover:text-primary rounded-xl font-bold text-xs bg-white cursor-pointer min-h-[44px]"
                          >
                            <Plus className="w-3.5 h-3.5" /> Record Blood Pressure
                          </button>
                        )}
                      </div>
                    )}

                    {/* Latest read summary banner */}
                    {patient.bloodPressure ? (
                      <div className="p-4 bg-white border border-slate-150 rounded-2xl flex justify-between items-center">
                        <div className="space-y-1">
                          <span className="text-[9px] font-bold text-slate-400 uppercase block tracking-wider">Latest Reading</span>
                          <span className="text-xl font-black text-slate-800">{patient.bloodPressure.systolic} / {patient.bloodPressure.diastolic} mmHg</span>
                          {patient.bloodPressure.pulse && <span className="block text-[9px] text-slate-400 font-semibold">Pulse: {patient.bloodPressure.pulse} bpm &bull; {patient.bloodPressure.position || "Sitting"}</span>}
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold border uppercase
                          ${patient.bloodPressure.status === "EXPECTED" ? "bg-emerald-50 text-emerald-700 border-emerald-250" : ""}
                          ${patient.bloodPressure.status === "ABOVE_USUAL" ? "bg-amber-50 text-amber-700 border-amber-250" : ""}
                          ${patient.bloodPressure.status === "BELOW_USUAL" ? "bg-blue-50 text-blue-700 border-blue-200" : ""}
                          ${patient.bloodPressure.status === "HIGH_READING" ? "bg-rose-50 text-rose-700 border-rose-200" : ""}`}>
                          {patient.bloodPressure.status.replace("_", " ")}
                        </span>
                      </div>
                    ) : (
                      <p className="text-slate-400 text-center py-2 font-medium">No blood pressure records found.</p>
                    )}

                    {/* Historical List */}
                    {patient.bloodPressureHistory && patient.bloodPressureHistory.length > 0 && (
                      <div className="space-y-2.5">
                        <span className="font-bold text-[9px] uppercase tracking-wider text-slate-400 block mb-1">BP Log History</span>
                        {patient.bloodPressureHistory.slice().reverse().map((r) => (
                          <div key={r.id} className="p-3 bg-white border border-slate-150 rounded-xl space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="font-black text-slate-800 text-xs">{r.systolic}/{r.diastolic} mmHg (Pulse: {r.pulse || "—"})</span>
                              <div className="flex items-center gap-1.5">
                                <span className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase border
                                  ${r.status === "EXPECTED" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : ""}
                                  ${r.status === "ABOVE_USUAL" ? "bg-amber-50 text-amber-700 border-amber-205" : ""}
                                  ${r.status === "BELOW_USUAL" ? "bg-blue-50 text-blue-700 border-blue-205" : ""}
                                  ${r.status === "HIGH_READING" ? "bg-rose-50 text-rose-700 border-rose-205" : ""}`}>
                                  {r.status.replace("_", " ")}
                                </span>
                              </div>
                            </div>
                            <div className="flex justify-between text-[9px] text-slate-400">
                              <span>Source: <strong className="text-slate-500">{r.source}</strong> ({r.measuredBy})</span>
                              <span>{new Date(r.measuredAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                            </div>
                            {r.note && <p className="text-[10px] text-slate-500 leading-normal italic bg-slate-50 border border-slate-100 rounded p-1.5">{r.note}</p>}
                            
                            {/* Doctor Countersign Action */}
                            <div className="border-t border-slate-50 pt-2 flex justify-between items-center text-[9px]">
                              {r.isReviewed ? (
                                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Reviewed by {r.reviewedBy}
                                </span>
                              ) : (
                                <span className="text-amber-600 italic">Awaiting clinical review</span>
                              )}
                              
                              {user?.role === "DOCTOR" && !r.isReviewed && (
                                <button
                                  type="button"
                                  onClick={() => handleReviewBP(r.id)}
                                  className="px-2 py-1 bg-primary text-white hover:bg-primary-hover font-bold rounded cursor-pointer transition-colors"
                                >
                                  Countersign Review
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Blood Glucose Tab */}
                {activeWellnessTab === "glucose" && (
                  <div className="space-y-4">
                    {/* Add Reading Box for Nurse/Doctor */}
                    {(user?.role === "BREAST_CARE_NURSE" || user?.role === "DOCTOR") && (
                      <div className="bg-slate-50/50 border border-slate-155 rounded-2xl p-4">
                        {showAddGlucoseSession ? (
                          <div className="space-y-3">
                            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                              <span className="font-extrabold uppercase text-[9px] text-[#005F56]">Record Clinical Glucose</span>
                              <button 
                                type="button" 
                                onClick={() => setShowAddGlucoseSession(false)} 
                                className="text-[10px] font-bold text-slate-400 hover:text-slate-650"
                              >
                                Cancel
                              </button>
                            </div>
                            <BloodGlucoseAssessment 
                              onSaved={() => { setShowAddGlucoseSession(false); loadPatient(); onUpdate(); }} 
                              onCancel={() => setShowAddGlucoseSession(false)} 
                            />
                          </div>
                        ) : (
                          <button 
                            type="button"
                            onClick={() => setShowAddGlucoseSession(true)}
                            className="w-full flex items-center justify-center gap-1.5 py-2.5 border-2 border-dashed border-slate-205 hover:border-primary text-slate-500 hover:text-primary rounded-xl font-bold text-xs bg-white cursor-pointer min-h-[44px]"
                          >
                            <Plus className="w-3.5 h-3.5" /> Record Blood Glucose
                          </button>
                        )}
                      </div>
                    )}

                    {/* Latest read summary banner */}
                    {patient.bloodGlucose ? (
                      <div className="p-4 bg-white border border-slate-150 rounded-2xl flex justify-between items-center">
                        <div className="space-y-1">
                          <span className="text-[9px] font-bold text-slate-400 uppercase block tracking-wider">Latest Reading</span>
                          <span className="text-xl font-black text-slate-800">
                            {patient.bloodGlucose.value} {patient.bloodGlucose.unit === "PERCENT" ? "%" : patient.bloodGlucose.unit === "MMOL_L" ? "mmol/L" : "mg/dL"}
                          </span>
                          <span className="block text-[9px] text-[#005F56] font-bold uppercase">{patient.bloodGlucose.testType.replace("_", " ")}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold border uppercase text-center max-w-[140px] leading-tight
                          ${patient.bloodGlucose.interpretation.includes("expected") && !patient.bloodGlucose.interpretation.includes("Above") ? "bg-emerald-50 text-emerald-700 border-emerald-250" : ""}
                          ${patient.bloodGlucose.interpretation.includes("Above") || patient.bloodGlucose.interpretation.includes("warning") ? "bg-amber-50 text-amber-700 border-amber-250" : ""}
                          ${patient.bloodGlucose.interpretation.includes("Diabetes-range") || patient.bloodGlucose.interpretation.includes("High random") ? "bg-rose-50 text-rose-700 border-rose-250" : ""}`}>
                          {patient.bloodGlucose.interpretation.includes("expected") ? "Expected Range" : "Clinical Warning"}
                        </span>
                      </div>
                    ) : (
                      <p className="text-slate-400 text-center py-2 font-medium">No blood glucose records found.</p>
                    )}

                    {/* Historical List */}
                    {patient.bloodGlucoseHistory && patient.bloodGlucoseHistory.length > 0 && (
                      <div className="space-y-2.5">
                        <span className="font-bold text-[9px] uppercase tracking-wider text-slate-400 block mb-1">Glucose Log History</span>
                        {patient.bloodGlucoseHistory.slice().reverse().map((r) => {
                          let displayValueMGDL = r.value;
                          let displayValueMMOLL = r.value;
                          if (r.unit === "MG_DL") {
                            displayValueMMOLL = parseFloat((r.value / 18).toFixed(1));
                          } else if (r.unit === "MMOL_L") {
                            displayValueMGDL = Math.round(r.value * 18);
                          }

                          return (
                            <div key={r.id} className="p-3.5 bg-white border border-slate-150 rounded-xl space-y-2">
                              <div className="flex justify-between items-start">
                                <div>
                                  <span className="font-black text-slate-800 text-xs">
                                    {r.unit === "PERCENT" ? `${r.value}%` : `${displayValueMGDL} mg/dL (${displayValueMMOLL} mmol/L)`}
                                  </span>
                                  <span className="block text-[8px] font-bold text-slate-450 uppercase">{r.testType.replace("_", " ")}</span>
                                </div>
                                <span className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase border text-center
                                  ${r.interpretation.includes("expected") && !r.interpretation.includes("Above") ? "bg-emerald-50 text-emerald-700 border-emerald-200" : ""}
                                  ${r.interpretation.includes("Above") || r.interpretation.includes("warning") ? "bg-amber-50 text-amber-700 border-amber-200" : ""}
                                  ${r.interpretation.includes("Diabetes-range") || r.interpretation.includes("High random") ? "bg-rose-50 text-rose-700 border-rose-200" : ""}`}>
                                  {r.interpretation.includes("expected") ? r.interpretation.includes("Above") ? "Above Expected" : "Expected" : "Recorded"}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-500 bg-slate-50 border border-slate-100 rounded p-1.5">{r.interpretation}</p>
                              
                              <div className="flex justify-between text-[9px] text-slate-400">
                                <span>Source: <strong className="text-slate-500">{r.source}</strong> ({r.measuredBy})</span>
                                <span>{new Date(r.measuredAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span>
                              </div>
                              {r.note && <p className="text-[9px] text-slate-450 leading-relaxed italic">{r.note}</p>}

                              {/* Doctor Countersign Action */}
                              <div className="border-t border-slate-50 pt-2 flex justify-between items-center text-[9px]">
                                {r.isReviewed ? (
                                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Reviewed by {r.reviewedBy}
                                  </span>
                                ) : (
                                  <span className="text-amber-600 italic">Awaiting clinical review</span>
                                )}
                                
                                {user?.role === "DOCTOR" && !r.isReviewed && (
                                  <button
                                    type="button"
                                    onClick={() => handleReviewGlucose(r.id)}
                                    className="px-2 py-1 bg-primary text-white hover:bg-primary-hover font-bold rounded cursor-pointer transition-colors"
                                  >
                                    Countersign Review
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* SECTION 5: Previous Audit Revisions Trail */}
          {patient.clinicalIntake?.revisions && patient.clinicalIntake.revisions.length > 0 && (
            <div className="border border-slate-200/80 rounded-2xl overflow-hidden bg-white shadow-xs">
              <button 
                onClick={() => toggleSection("revisions")}
                className="w-full px-5 py-4 flex items-center justify-between font-bold text-xs text-slate-700 hover:bg-slate-50 cursor-pointer min-h-[44px] uppercase tracking-wider"
              >
                <span className="flex items-center gap-2">
                  <FileClock className="w-4 h-4 text-primary" /> Case Revisions Audit Trail ({patient.clinicalIntake.revisions.length})
                </span>
                {openSection === "revisions" ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>

              {openSection === "revisions" && (
                <div className="p-5 border-t border-slate-100 bg-slate-50/20 space-y-2 text-xs">
                  {patient.clinicalIntake.revisions.map((rev, i) => (
                    <div key={i} className="p-2.5 bg-white border border-slate-150 rounded-xl space-y-1">
                      <div className="flex justify-between font-semibold text-[10px] text-slate-400 uppercase">
                        <span>By: {rev.editedBy}</span>
                        <span>{new Date(rev.timestamp).toLocaleDateString()}</span>
                      </div>
                      <p className="font-bold text-slate-800 text-[11px]">Section: {rev.sectionEdited}</p>
                      <div className="flex gap-2 items-center text-[10px] pt-1 leading-normal text-slate-500">
                        <span className="line-through">{rev.previousValue}</span>
                        <span className="text-emerald-700 font-extrabold">→ {rev.newValue}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SECTION 6: Reports & Screenings */}
          <div className="border border-slate-200/80 rounded-2xl overflow-hidden bg-white shadow-xs">
            <button 
              onClick={() => toggleSection("reports")}
              className="w-full px-5 py-4 flex items-center justify-between font-bold text-xs text-slate-700 hover:bg-slate-50 cursor-pointer min-h-[44px] uppercase tracking-wider"
            >
              <span className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" /> Reports & Screenings ({reportsToDisplay.length})
              </span>
              {openSection === "reports" ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>

            {openSection === "reports" && (
              <div className="p-5 border-t border-slate-100 bg-slate-50/20 space-y-3">
                {reportsToDisplay.length > 0 ? (
                  reportsToDisplay.map((rep, i) => (
                    <div key={rep.id || i} className="bg-white border border-slate-155 p-3.5 rounded-xl flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-teal-50 text-primary flex items-center justify-center shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-750 leading-tight">{rep.title}</p>
                          <span className="text-[10px] text-slate-400 mt-1 block">Uploaded: {rep.date} · Type: <span className="uppercase font-bold">{rep.type}</span></span>
                        </div>
                      </div>
                      {rep.documentUrl ? (
                        <a href={rep.documentUrl} target="_blank" rel="noreferrer" className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-250 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                          <ShieldCheck className="w-3 h-3" /> Open
                        </a>
                      ) : (
                        <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-250 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                          <ShieldCheck className="w-3 h-3" /> Secure View
                        </span>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400 text-center py-2 font-medium">No files uploaded.</p>
                )}
              </div>
            )}
          </div>

          {/* SECTION 7: Append Doctor Note */}
          <div className="p-5 border border-slate-200/80 rounded-2xl bg-white space-y-3">
            <h4 className="font-bold text-slate-800 text-xs flex items-center gap-2 uppercase tracking-wide">
              <MessageSquare className="w-4.5 h-4.5 text-primary" /> Append Consultation Note
            </h4>
            <form onSubmit={handleAddNote} className="space-y-3">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                rows={3}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus-ring text-slate-750 resize-none"
                placeholder="Type clinician notes to append directly to the reports record..."
                required
              />
              {noteSuccess && (
                <div className="text-[11px] font-bold text-emerald-600">
                  ✓ Note appended successfully to Patient Reports.
                </div>
              )}
              <button
                type="submit"
                className="w-full py-2.5 bg-[#005F56] hover:bg-[#004D46] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Save Note to File
              </button>
            </form>
          </div>

        </div>

        {/* Doctor Actions Bottom Sticky Bar */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex flex-col gap-3 shrink-0">
          
          {/* Clarification Request Inline Input */}
          {showClarifyInput && (
            <div className="p-3.5 bg-white border border-slate-200 rounded-2xl space-y-3 animate-fade-in text-left">
              <div>
                <span className="font-bold text-xs text-slate-800 block">Clarification Request Note</span>
                <span className="text-[10px] text-slate-400">Describe the specific sections the nurse must review.</span>
              </div>
              <textarea
                value={clarifyNotes}
                onChange={(e) => setClarifyNotes(e.target.value)}
                rows={2}
                className="w-full bg-slate-50 border p-2 text-xs rounded-lg"
                placeholder="e.g. Please clarify patient family cancer details..."
              />
              {clarifySuccess && (
                <div className="text-[10px] text-emerald-600 font-bold">
                  ✓ Clarification request sent successfully. Redirecting...
                </div>
              )}
              <div className="flex gap-2">
                <button
                  onClick={handleSendClarification}
                  className="flex-1 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Send Request
                </button>
                <button
                  onClick={() => setShowClarifyInput(false)}
                  className="px-3 py-1.5 border rounded-lg hover:bg-slate-50 text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="flex gap-2 overflow-x-auto scrollbar-none">
            {patient.status !== "Review Completed" && (
              <button
                onClick={handleAcceptIntake}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl whitespace-nowrap cursor-pointer shrink-0 transition-colors"
              >
                Accept & Approve Intake
              </button>
            )}
            
            <button
              onClick={() => setShowClarifyInput(true)}
              className="px-3.5 py-2.5 border border-slate-250 bg-white text-slate-650 hover:bg-slate-100 text-xs font-semibold rounded-xl whitespace-nowrap cursor-pointer shrink-0"
            >
              Request Clarification
            </button>
            
            <button
              onClick={() => triggerPlaceholderAction("Open Scan Analysis")}
              className="px-3.5 py-2.5 border border-slate-250 bg-white text-slate-650 hover:bg-slate-100 text-xs font-semibold rounded-xl whitespace-nowrap cursor-pointer shrink-0"
            >
              Open Scan Review
            </button>

            <button
              onClick={() => triggerPlaceholderAction("Consultation Scheduled")}
              className="px-3.5 py-2.5 border border-slate-250 bg-white text-slate-650 hover:bg-slate-100 text-xs font-semibold rounded-xl whitespace-nowrap cursor-pointer shrink-0"
            >
              Schedule Consultation
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
