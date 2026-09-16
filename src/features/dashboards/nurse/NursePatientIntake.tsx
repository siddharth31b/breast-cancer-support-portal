import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Users,
  UserPlus,
  ArrowRight,
  AlertCircle,
  Send,
  Check,
  RefreshCw,
  Search,
  Plus,
  Trash2,
  CheckCircle2,
  FileText,
  Save,
} from "lucide-react";
import { PatientService } from "../../../services/patient.service";
import { NurseService } from "../../../services/nurse.service";
import type { PatientRecord } from "../../../types/questionnaire";

export interface RelativeCancerEntry {
  id: string;
  relationship: string;
  side: "Maternal" | "Paternal" | "Direct Line" | "Not sure";
  cancerType: string;
  ageAtDiagnosis: string;
  breastSide?: "Left" | "Right" | "Bilateral (Both)" | "Not sure";
  status?: "Living" | "Deceased" | "Unknown";
}

export interface UploadedDocItem {
  id: string;
  docType: string;
  reportDate: string;
  hospital: string;
  side: string;
  readability: "Clear" | "Blurry" | "Incomplete" | "Wrong file";
  identityMatched: "Yes" | "No" | "Unable to verify";
  fileTitle: string;
}

export const NursePatientIntake: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [activeMainTab, setActiveMainTab] = useState<"WAITING" | "NEW_INTAKE">(
    searchParams.get("tab") === "new" ? "NEW_INTAKE" : "WAITING"
  );

  // WAITING PATIENTS TAB STATE
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [statusFilter, setStatusFilter] = useState<"ALL" | "WAITING" | "INCOMPLETE" | "COMPLETED">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [, setIsLoading] = useState(true);

  // NEW INTAKE WIZARD STATE — STRICTLY 7 STEPS
  const [step, setStep] = useState<number>(1);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [lastSavedTime, setLastSavedTime] = useState<string>("Just now");

  // =========================================================================
  // STEP 1: PATIENT & VISIT DETAILS
  // =========================================================================
  const [name, setName] = useState("");
  const [patientId] = useState(`BC-${Math.floor(1000 + Math.random() * 9000)}`);
  const [dob, setDob] = useState("");
  const [age, setAge] = useState("");
  const [sex] = useState("Female");
  const [genderIdentity, setGenderIdentity] = useState("Female");
  const [preferredName, setPreferredName] = useState("");
  const [phone, setPhone] = useState("");
  const [altPhone, setAltPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [city] = useState("Indore");
  const [state] = useState("Madhya Pradesh");
  const [pinCode] = useState("452001");
  const [preferredLanguage, setPreferredLanguage] = useState("English");
  const [preferredContact, setPreferredContact] = useState("SMS");

  // Section B: Emergency Contact
  const [emergencyName, setEmergencyName] = useState("");
  const [emergencyRelation, setEmergencyRelation] = useState("Spouse");
  const [emergencyPhone, setEmergencyPhone] = useState("");

  // Section C: Visit Details
  const [patientVisitType, setPatientVisitType] = useState<"New Patient" | "Returning Patient">("New Patient");
  const [arrivalMode, setArrivalMode] = useState<"Appointment" | "Walk-in">("Appointment");
  const [referralSource, setReferralSource] = useState("Self");
  const [assignedDoctor, setAssignedDoctor] = useState("Dr. Sarah Iyer");
  const [visitReason, setVisitReason] = useState("New symptom");

  // Section D: Information Source
  const [infoSource, setInfoSource] = useState<"Patient" | "Family member" | "Caregiver" | "Nurse-assisted patient" | "Existing medical record" | "Other">("Nurse-assisted patient");

  // =========================================================================
  // STEP 2: CURRENT BREAST CONCERN
  // =========================================================================
  const [primaryConcerns, setPrimaryConcerns] = useState<string[]>(["Lump or thickening"]);
  const [affectedSide, setAffectedSide] = useState<"Left" | "Right" | "Both" | "Not sure" | "Not applicable">("Left");
  const [breastLocation, setBreastLocation] = useState("Upper outer area");
  const [firstNoticedDate, setFirstNoticedDate] = useState("2-3 weeks ago");
  const [durationCategory, setDurationCategory] = useState("1–4 weeks");
  const [symptomOnset, setSymptomOnset] = useState<"Sudden" | "Gradual" | "Not sure">("Gradual");
  const [symptomProgression] = useState<"Stable" | "Worsening" | "Improving" | "Fluctuating">("Stable");

  // Lump details
  const [lumpPain, setLumpPain] = useState<"Painful" | "Painless" | "Tender" | "Not sure">("Painless");
  const [lumpSizeChange, setLumpSizeChange] = useState<"Increased" | "Unchanged" | "Decreased" | "Not sure">("Unchanged");
  const [lumpCycleRelated, setLumpCycleRelated] = useState<"Yes" | "No" | "Not sure">("No");

  // Skin / Shape changes
  const [skinChangesList] = useState<string[]>(["None"]);
  const [associatedConcerns] = useState<string[]>(["None"]);

  // =========================================================================
  // STEP 3: MEDICAL & SURGICAL HISTORY
  // =========================================================================
  const [medicalConditions, setMedicalConditions] = useState<string[]>(["None known"]);
  const [currentMedicines, setCurrentMedicines] = useState("Metformin 500mg once daily");
  const [medsPatientUnknown, setMedsPatientUnknown] = useState(false);
  const [medsInReport, setMedsInReport] = useState(false);

  const [previousProcedures, setPreviousProcedures] = useState<string[]>(["None"]);

  // =========================================================================
  // STEP 4: MENSTRUAL, REPRODUCTIVE & HORMONAL HISTORY
  // =========================================================================
  const [periodsStatus, setPeriodsStatus] = useState("Regular");
  const [ageFirstPeriod, setAgeFirstPeriod] = useState("13");
  const [lastPeriodDate, setLastPeriodDate] = useState("2026-07-05");

  const [everPregnant, setEverPregnant] = useState("Yes");
  const [numLiveBirths, setNumLiveBirths] = useState("2");
  const [hasBreastfed, setHasBreastfed] = useState("Yes");

  // =========================================================================
  // STEP 5: FAMILY & PERSONAL CANCER HISTORY
  // =========================================================================
  const [personalCancer, setPersonalCancer] = useState<"Yes" | "No" | "Not sure">("No");
  const [familyCancerTypes] = useState<string[]>(["Breast cancer"]);
  const [relativesList, setRelativesList] = useState<RelativeCancerEntry[]>([
    {
      id: "rel-1",
      relationship: "Maternal Aunt",
      side: "Maternal",
      cancerType: "Breast cancer",
      ageAtDiagnosis: "48",
      breastSide: "Left",
      status: "Living",
    },
  ]);

  // =========================================================================
  // STEP 6: LIFESTYLE, MEASUREMENTS & DOCUMENTS
  // =========================================================================
  const [heightCm, setHeightCm] = useState("162");
  const [weightKg, setWeightKg] = useState("58");
  const [bpSys, setBpSys] = useState("120");
  const [bpDia, setBpDia] = useState("80");

  const [uploadedDocsList, setUploadedDocsList] = useState<UploadedDocItem[]>([
    {
      id: "doc-1",
      docType: "Mammography report",
      reportDate: "2024-05-12",
      hospital: "Indore Diagnostics",
      side: "Left",
      readability: "Clear",
      identityMatched: "Yes",
      fileTitle: "Mammogram_Scan_2024.pdf",
    },
  ]);

  const [newDocTitle, setNewDocTitle] = useState("");
  const [newDocType, setNewDocType] = useState("Mammography report");
  const [newDocReadability, setNewDocReadability] = useState<"Clear" | "Blurry" | "Incomplete" | "Wrong file">("Clear");
  const [newDocIdentityMatch, setNewDocIdentityMatch] = useState<"Yes" | "No" | "Unable to verify">("Yes");

  // =========================================================================
  // STEP 7: REVIEW, CONSENT & DOCTOR HANDOFF
  // =========================================================================
  const [patientConfirmedAccurate, setPatientConfirmedAccurate] = useState(true);
  const [patientConfirmedBelonging, setPatientConfirmedBelonging] = useState(true);
  const [patientUnderstandPreliminary, setPatientUnderstandPreliminary] = useState(true);
  const [patientConsentShare, setPatientConsentShare] = useState(true);

  const [nurseFactualNote, setNurseFactualNote] = useState(
    "Patient registered at nursing desk. Verbal consent confirmed. Height, weight, and vital signs recorded. Uploaded 2024 mammography scan verified clear. Patient requested routine review."
  );

  const [escalationRequired] = useState<"No" | "Yes" | "Unsure — ask doctor">("No");

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

  // Calculate BMI
  const bmi = NurseService.calculateBmi(parseFloat(heightCm), parseFloat(weightKg));

  // Compute percentage completion
  const completionPercentage = Math.round((step / 7) * 100);

  // Check prompt escalation conditions
  const promptReviewTriggered =
    skinChangesList.some((s) => ["Redness", "Warmth", "Swelling", "Ulcer or wound"].includes(s)) ||
    associatedConcerns.includes("Unexplained weight loss") ||
    escalationRequired === "Yes";

  const handleNextStep = () => {
    setErrorMsg("");
    if (step === 1) {
      if (!name.trim() || !age || !phone.trim()) {
        setErrorMsg("Please fill in mandatory patient identity details (Full Name, Age, Phone).");
        return;
      }
    }
    setStep((s) => Math.min(s + 1, 7));
    setLastSavedTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
  };

  const handlePrevStep = () => {
    setErrorMsg("");
    setStep((s) => Math.max(s - 1, 1));
  };

  const handleAddRelative = () => {
    setRelativesList([
      ...relativesList,
      {
        id: `rel-${Date.now()}`,
        relationship: "Maternal Aunt",
        side: "Maternal",
        cancerType: "Breast cancer",
        ageAtDiagnosis: "50",
        breastSide: "Not sure",
        status: "Living",
      },
    ]);
  };

  const handleRemoveRelative = (id: string) => {
    setRelativesList(relativesList.filter((r) => r.id !== id));
  };

  const handleAddDocument = () => {
    if (!newDocTitle.trim()) return;
    setUploadedDocsList([
      ...uploadedDocsList,
      {
        id: `doc-${Date.now()}`,
        docType: newDocType,
        reportDate: new Date().toISOString().split("T")[0],
        hospital: "City Diagnostic Centre",
        side: affectedSide === "Not applicable" ? "N/A" : affectedSide,
        readability: newDocReadability,
        identityMatched: newDocIdentityMatch,
        fileTitle: newDocTitle,
      },
    ]);
    setNewDocTitle("");
  };

  const handleFinalSubmit = async (sendToDoctor: boolean) => {
    setIsSubmitting(true);
    try {
      const hospital = "IIT Indore Main Campus Hospital";
      const newPatient = await PatientService.registerPatient(
        name,
        parseInt(age) || 30,
        dob || "1994-05-10",
        phone,
        email,
        `${address}, ${city}, ${state} - ${pinCode}`,
        preferredLanguage,
        preferredContact,
        emergencyPhone,
        emergencyRelation,
        hospital
      );

      // Save BMI
      newPatient.bmi = {
        value: bmi.value,
        category: bmi.category,
        heightCm: parseFloat(heightCm) || 0,
        weightKg: parseFloat(weightKg) || 0,
        age: parseInt(age) || 30,
        description: bmi.description,
        lastCalculatedAt: new Date().toISOString(),
      };

      // Medical History
      newPatient.medicalHistory = {
        medications: currentMedicines !== "None" ? [currentMedicines] : [],
        familyHistory: familyCancerTypes.length > 0 && !familyCancerTypes.includes("None known"),
        previousBreastProcedure: previousProcedures.length > 0 && !previousProcedures.includes("None"),
      };

      // Reports
      if (uploadedDocsList.length > 0) {
        newPatient.reports = uploadedDocsList.map((d) => ({
          id: d.id,
          patientId: newPatient.id,
          title: d.fileTitle,
          category: d.docType.includes("Mammography") ? "Mammogram" : d.docType.includes("Ultrasound") ? "Ultrasound" : "Other",
          uploadedAt: new Date().toISOString(),
          validationStatus: d.readability === "Clear" ? "Validated" : "Needs Update",
          source: "Nurse Portal",
          downloadable: true,
          shareable: true,
          date: d.reportDate,
          status: d.readability === "Clear" ? "Validated" : "Needs Update",
          type: "mammogram",
        }));
      }

      if (sendToDoctor) {
        newPatient.status = "Awaiting Review";
        newPatient.clinicalJourney = {
          assessmentSubmitted: true,
          reportsUploaded: uploadedDocsList.length > 0,
          aiAnalysisStatus: "PENDING",
          radiologyStatus: "PENDING",
          doctorReviewStatus: "AWAITING_REVIEW",
          appointmentStatus: "CONFIRMED",
        };
      }

      await PatientService.updatePatientRecord(newPatient);

      // Save Doctor Handoff Record
      NurseService.saveHandoff({
        id: `hd-${Date.now()}`,
        patientId: newPatient.id,
        patientName: newPatient.name,
        presentingConcern: `${primaryConcerns.join(", ")} (Location: ${breastLocation})`,
        symptomDuration: `${durationCategory} (Onset: ${symptomOnset}, Progression: ${symptomProgression})`,
        affectedSide,
        relevantHistory: `Family: ${relativesList.map((r) => `${r.relationship} (${r.cancerType} @ ${r.ageAtDiagnosis}y)`).join("; ") || "None"}; Meds: ${currentMedicines}`,
        measurementsSummary: `Height: ${heightCm}cm, Weight: ${weightKg}kg, BMI: ${bmi.value} (${bmi.category}), BP: ${bpSys}/${bpDia}`,
        reportsAvailable: uploadedDocsList.map((d) => `${d.fileTitle} [${d.readability}]`).join(", ") || "None uploaded",
        missingInformation: "None — Comprehensive 7-step intake complete",
        nurseFactualNote: nurseFactualNote,
        completionTime: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        sentToDoctor: sendToDoctor,
        doctorName: assignedDoctor,
      });

      setIsSubmitting(false);
      setShowConfirmModal(false);
      router.push(`/nurse/patients/${newPatient.id}`);
    } catch (e: any) {
      setIsSubmitting(false);
      setErrorMsg(e.message || "Failed to submit intake.");
    }
  };

  const filteredPatients = patients.filter((p) => {
    const isCompleted = p.clinicalJourney?.assessmentSubmitted;
    const isIncomplete = p.status === "In Progress" || p.status === "Needs Clarification";
    const isWaiting = !isCompleted && !isIncomplete;

    const q = searchQuery.toLowerCase();
    const matchSearch = p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q);
    if (!matchSearch) return false;

    if (statusFilter === "WAITING") return isWaiting;
    if (statusFilter === "INCOMPLETE") return isIncomplete;
    if (statusFilter === "COMPLETED") return isCompleted;
    return true;
  });

  return (
    <div className="space-y-6 text-left max-w-6xl mx-auto pb-24">
      {/* Header */}
      <div className="border-b border-slate-200/60 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Patient Intake Workflow</h1>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            Guided 7-step clinical information collection for doctor handoff preparation.
          </p>
        </div>
        <div className="text-right">
          <span className="text-[11px] font-bold text-slate-400 block">Autosave Status</span>
          <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1 justify-end">
            <CheckCircle2 className="w-3.5 h-3.5" /> Draft saved at {lastSavedTime}
          </span>
        </div>
      </div>

      {/* 2 Main Tabs */}
      <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-100/80 rounded-2xl">
        <button
          onClick={() => setActiveMainTab("WAITING")}
          className={`py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeMainTab === "WAITING" ? "bg-white text-primary shadow-xs" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Users className="w-4 h-4" /> Waiting Patients ({patients.length})
        </button>
        <button
          onClick={() => setActiveMainTab("NEW_INTAKE")}
          className={`py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeMainTab === "NEW_INTAKE" ? "bg-primary text-white shadow-xs" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <UserPlus className="w-4 h-4" /> Start New Intake
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: WAITING PATIENTS LIST                                              */}
      {/* ========================================================================= */}
      {activeMainTab === "WAITING" && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Search by patient name or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-xs w-full focus:outline-none text-slate-700 font-medium"
              />
            </div>

            <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
              {[
                { id: "ALL", label: "All" },
                { id: "WAITING", label: "Waiting" },
                { id: "INCOMPLETE", label: "Incomplete" },
                { id: "COMPLETED", label: "Completed" },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setStatusFilter(f.id as any)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                    statusFilter === f.id ? "bg-primary text-white border-primary" : "bg-slate-50 text-slate-500 border-slate-200"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-3xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider font-bold text-[9px] bg-slate-50/50">
                    <th className="p-4">Patient</th>
                    <th className="p-4">Age</th>
                    <th className="p-4">Appt Time</th>
                    <th className="p-4">Intake Status</th>
                    <th className="p-4">Missing Items</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPatients.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400 font-semibold">
                        No patients found matching the selected filter.
                      </td>
                    </tr>
                  ) : (
                    filteredPatients.map((p) => {
                      const isCompleted = p.clinicalJourney?.assessmentSubmitted;
                      const isIncomplete = p.status === "In Progress" || p.status === "Needs Clarification";
                      const actionLabel = isCompleted ? "View Summary" : isIncomplete ? "Continue" : "Start Intake";

                      return (
                        <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="p-4 font-bold text-slate-800">
                            {p.name} <span className="text-[10px] text-slate-400 font-normal">({p.id})</span>
                          </td>
                          <td className="p-4 text-slate-600 font-medium">{p.age}y</td>
                          <td className="p-4 font-bold text-slate-700">10:30 AM</td>
                          <td className="p-4">
                            <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full border ${
                              isCompleted ? "bg-emerald-50 text-emerald-700 border-emerald-200" : isIncomplete ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-blue-50 text-blue-700 border-blue-200"
                            }`}>
                              {isCompleted ? "Completed" : isIncomplete ? "Incomplete" : "Waiting Intake"}
                            </span>
                          </td>
                          <td className="p-4 text-slate-500 font-medium">{isCompleted ? "None" : "Intake pending"}</td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => {
                                if (isCompleted) {
                                  router.push(`/nurse/patients/${p.id}`);
                                } else {
                                  setName(p.name);
                                  setAge(p.age.toString());
                                  setPhone(p.phone || "");
                                  setActiveMainTab("NEW_INTAKE");
                                }
                              }}
                              className="px-3.5 py-1.5 bg-primary hover:bg-[#004D46] text-white font-bold rounded-xl text-xs"
                            >
                              {actionLabel}
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: START NEW INTAKE (EXACTLY 7 GUIDED STEPS)                         */}
      {/* ========================================================================= */}
      {activeMainTab === "NEW_INTAKE" && (
        <div className="space-y-6">
          {/* Progress Header */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Step {step} of 7 — {completionPercentage}% Completed
              </span>
              <div className="w-48 sm:w-64 bg-slate-100 h-2 rounded-full mt-1.5 overflow-hidden">
                <div className="bg-primary h-full transition-all duration-300" style={{ width: `${completionPercentage}%` }}></div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleFinalSubmit(false)}
                className="px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1"
              >
                <Save className="w-3.5 h-3.5" /> Save Draft
              </button>
              <button
                type="button"
                onClick={() => setShowPreviewModal(true)}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1"
              >
                <FileText className="w-3.5 h-3.5" /> Preview Handoff
              </button>
            </div>
          </div>

          {/* Stepper Tabs Bar (7 Steps) */}
          <div className="flex border-b border-slate-200 gap-1 overflow-x-auto scrollbar-none pb-0.5">
            {[
              { num: 1, title: "1. Details" },
              { num: 2, title: "2. Concern" },
              { num: 3, title: "3. History" },
              { num: 4, title: "4. Reproductive" },
              { num: 5, title: "5. Family" },
              { num: 6, title: "6. Lifestyle & Docs" },
              { num: 7, title: "7. Review & Send" },
            ].map((s) => (
              <button
                key={s.num}
                onClick={() => s.num < step && setStep(s.num)}
                className={`px-3.5 py-2.5 rounded-t-xl text-xs font-bold whitespace-nowrap transition-all border-b-2 cursor-pointer ${
                  step === s.num
                    ? "border-primary text-primary bg-primary/5"
                    : step > s.num
                    ? "border-emerald-500 text-emerald-700 bg-emerald-50/50"
                    : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
              >
                {s.title}
              </button>
            ))}
          </div>

          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-2xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* STEP 1: PATIENT & VISIT DETAILS */}
          {step === 1 && (
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-6 text-xs">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-800 text-sm">Step 1: Patient Identity &amp; Visit Details</h3>
                <p className="text-slate-400 text-[11px]">Primary demographics and hospital visit registration.</p>
              </div>

              {/* Section A: Identity */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-700 text-xs uppercase tracking-wider">Section A — Patient Identity</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-bold text-slate-500 mb-1">Full Name *</label>
                    <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Sunita Deshmukh" className="w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl" />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-500 mb-1">Patient ID (Generated)</label>
                    <input value={patientId} readOnly className="w-full px-3.5 py-2.5 bg-slate-100 border rounded-xl font-mono text-slate-500" />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-500 mb-1">Age *</label>
                    <input value={age} onChange={(e) => setAge(e.target.value)} placeholder="e.g. 42" className="w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl" />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-500 mb-1">Date of Birth</label>
                    <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} className="w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl" />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-500 mb-1">Sex recorded at registration</label>
                    <input value={sex} readOnly className="w-full px-3.5 py-2.5 bg-slate-100 border rounded-xl font-semibold text-slate-600" />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-500 mb-1">Gender Identity (Optional)</label>
                    <input value={genderIdentity} onChange={(e) => setGenderIdentity(e.target.value)} className="w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl" />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-500 mb-1">Preferred Name (Optional)</label>
                    <input value={preferredName} onChange={(e) => setPreferredName(e.target.value)} className="w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl" />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-500 mb-1">Phone Number *</label>
                    <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765-43210" className="w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl" />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-500 mb-1">Alternate Phone (Optional)</label>
                    <input value={altPhone} onChange={(e) => setAltPhone(e.target.value)} className="w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl" />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-500 mb-1">Email Address (Optional)</label>
                    <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="patient@email.com" className="w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl" />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-500 mb-1">Preferred Language</label>
                    <select value={preferredLanguage} onChange={(e) => setPreferredLanguage(e.target.value)} className="w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl">
                      <option>English</option>
                      <option>Hindi</option>
                      <option>Marathi</option>
                      <option>Gujarati</option>
                      <option>Tamil</option>
                      <option>Telugu</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-500 mb-1">Preferred Contact Method</label>
                    <select value={preferredContact} onChange={(e) => setPreferredContact(e.target.value)} className="w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl">
                      <option>SMS</option>
                      <option>Phone Call</option>
                      <option>WhatsApp</option>
                      <option>Email</option>
                    </select>
                  </div>
                  <div className="sm:col-span-3">
                    <label className="block font-bold text-slate-500 mb-1">Address</label>
                    <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="House / Street" className="w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl" />
                  </div>
                </div>
              </div>

              {/* Section B: Emergency Contact */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <h4 className="font-bold text-slate-700 text-xs uppercase tracking-wider">Section B — Emergency Contact</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-bold text-slate-500 mb-1">Contact Name</label>
                    <input value={emergencyName} onChange={(e) => setEmergencyName(e.target.value)} placeholder="Relative name" className="w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl" />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-500 mb-1">Relationship</label>
                    <select value={emergencyRelation} onChange={(e) => setEmergencyRelation(e.target.value)} className="w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl">
                      <option>Spouse</option>
                      <option>Parent</option>
                      <option>Child</option>
                      <option>Sibling</option>
                      <option>Friend</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-500 mb-1">Phone Number</label>
                    <input value={emergencyPhone} onChange={(e) => setEmergencyPhone(e.target.value)} placeholder="+91 98765-99999" className="w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl" />
                  </div>
                </div>
              </div>

              {/* Section C: Visit Details */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <h4 className="font-bold text-slate-700 text-xs uppercase tracking-wider">Section C — Visit Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-bold text-slate-500 mb-1">Patient Type</label>
                    <select value={patientVisitType} onChange={(e) => setPatientVisitType(e.target.value as any)} className="w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl">
                      <option value="New Patient">New Patient</option>
                      <option value="Returning Patient">Returning Patient</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-500 mb-1">Arrival Mode</label>
                    <select value={arrivalMode} onChange={(e) => setArrivalMode(e.target.value as any)} className="w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl">
                      <option value="Appointment">Appointment</option>
                      <option value="Walk-in">Walk-in</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-500 mb-1">Referral Source</label>
                    <select value={referralSource} onChange={(e) => setReferralSource(e.target.value)} className="w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl">
                      <option>Self</option>
                      <option>General practitioner</option>
                      <option>Gynaecologist</option>
                      <option>Surgeon</option>
                      <option>Screening programme</option>
                      <option>Hospital referral</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-500 mb-1">Assigned Doctor</label>
                    <select value={assignedDoctor} onChange={(e) => setAssignedDoctor(e.target.value)} className="w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl font-medium">
                      <option>Dr. Sarah Iyer</option>
                      <option>Dr. Alok Mehta</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-500 mb-1">Reason for Visit</label>
                    <select value={visitReason} onChange={(e) => setVisitReason(e.target.value)} className="w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl">
                      <option>New symptom</option>
                      <option>Follow-up</option>
                      <option>Report review</option>
                      <option>Screening concern</option>
                      <option>Family-history consultation</option>
                      <option>Post-procedure follow-up</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section D: Information Source */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <h4 className="font-bold text-slate-700 text-xs uppercase tracking-wider">Section D — Information Source</h4>
                <div>
                  <label className="block font-bold text-slate-500 mb-1">Who is providing this information?</label>
                  <div className="flex gap-2 flex-wrap">
                    {(["Patient", "Family member", "Caregiver", "Nurse-assisted patient", "Existing medical record", "Other"] as const).map((src) => (
                      <button
                        key={src}
                        type="button"
                        onClick={() => setInfoSource(src)}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-bold ${
                          infoSource === src ? "bg-primary text-white border-primary" : "bg-slate-50 text-slate-600 border-slate-200"
                        }`}
                      >
                        {src}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: CURRENT BREAST CONCERN */}
          {step === 2 && (
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-6 text-xs">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-800 text-sm">Step 2: Current Breast Concern &amp; Symptoms</h3>
                <p className="text-slate-400 text-[11px]">Primary symptoms, location, duration, and onset details.</p>
              </div>

              {/* Main reason for visit */}
              <div className="space-y-2">
                <label className="block font-bold text-slate-700 text-xs uppercase tracking-wider">What is the main reason for today's visit? (Select all that apply)</label>
                <div className="flex gap-2 flex-wrap">
                  {[
                    "Lump or thickening",
                    "Breast pain",
                    "Swelling",
                    "Nipple discharge",
                    "Nipple shape or position change",
                    "Skin change",
                    "Change in breast size or shape",
                    "Underarm lump or swelling",
                    "Follow-up of previous finding",
                    "Screening-related concern",
                    "No current symptom",
                    "Other",
                  ].map((conc) => {
                    const isSel = primaryConcerns.includes(conc);
                    return (
                      <button
                        key={conc}
                        type="button"
                        onClick={() => {
                          if (conc === "No current symptom") {
                            setPrimaryConcerns(["No current symptom"]);
                          } else {
                            const filtered = primaryConcerns.filter((c) => c !== "No current symptom");
                            if (isSel) {
                              setPrimaryConcerns(filtered.filter((c) => c !== conc));
                            } else {
                              setPrimaryConcerns([...filtered, conc]);
                            }
                          }
                        }}
                        className={`px-3 py-2 rounded-xl border text-xs font-bold transition-all ${
                          isSel ? "bg-primary text-white border-primary shadow-xs" : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        {conc}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Symptom Location */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <h4 className="font-bold text-slate-700 text-xs uppercase tracking-wider">Symptom Location</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-500 mb-1">Which side is affected?</label>
                    <div className="flex gap-1.5 flex-wrap">
                      {(["Left", "Right", "Both", "Not sure", "Not applicable"] as const).map((side) => (
                        <button
                          key={side}
                          type="button"
                          onClick={() => setAffectedSide(side)}
                          className={`px-3 py-1.5 rounded-xl border font-bold text-xs ${
                            affectedSide === side ? "bg-primary text-white border-primary" : "bg-slate-50 border-slate-200 text-slate-600"
                          }`}
                        >
                          {side}
                        </button>
                      ))}
                    </div>
                  </div>

                  {["Left", "Right", "Both"].includes(affectedSide) && (
                    <div>
                      <label className="block font-bold text-slate-500 mb-1">Where is the concern located?</label>
                      <select value={breastLocation} onChange={(e) => setBreastLocation(e.target.value)} className="w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl">
                        <option>Upper outer area</option>
                        <option>Upper inner area</option>
                        <option>Lower outer area</option>
                        <option>Lower inner area</option>
                        <option>Behind the nipple</option>
                        <option>Underarm</option>
                        <option>Whole breast</option>
                        <option>Not sure</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>

              {/* Symptom Start & Duration */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <h4 className="font-bold text-slate-700 text-xs uppercase tracking-wider">Symptom Duration &amp; Progression</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-bold text-slate-500 mb-1">When first noticed?</label>
                    <input value={firstNoticedDate} onChange={(e) => setFirstNoticedDate(e.target.value)} placeholder="e.g. 2-3 weeks ago" className="w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl" />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-500 mb-1">Duration Category</label>
                    <select value={durationCategory} onChange={(e) => setDurationCategory(e.target.value)} className="w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl">
                      <option>Less than 1 week</option>
                      <option>1–4 weeks</option>
                      <option>1–3 months</option>
                      <option>3–6 months</option>
                      <option>More than 6 months</option>
                      <option>Not sure</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-500 mb-1">Onset Type</label>
                    <select value={symptomOnset} onChange={(e) => setSymptomOnset(e.target.value as any)} className="w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl">
                      <option value="Gradual">Gradual</option>
                      <option value="Sudden">Sudden</option>
                      <option value="Not sure">Not sure</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* CONDITIONAL LUMP SECTION */}
              {primaryConcerns.includes("Lump or thickening") && (
                <div className="p-4 bg-teal-50/60 border border-teal-200 rounded-2xl space-y-3">
                  <h4 className="font-bold text-teal-900 text-xs uppercase tracking-wider">Lump or Thickening Details</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-bold text-teal-800 mb-1">Pain Characteristics</label>
                      <select value={lumpPain} onChange={(e) => setLumpPain(e.target.value as any)} className="w-full px-3 py-2 bg-white border rounded-xl">
                        <option value="Painless">Painless</option>
                        <option value="Painful">Painful</option>
                        <option value="Tender">Tender</option>
                        <option value="Not sure">Not sure</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-bold text-teal-800 mb-1">Size Change</label>
                      <select value={lumpSizeChange} onChange={(e) => setLumpSizeChange(e.target.value as any)} className="w-full px-3 py-2 bg-white border rounded-xl">
                        <option value="Unchanged">Unchanged</option>
                        <option value="Increased">Increased</option>
                        <option value="Decreased">Decreased</option>
                        <option value="Not sure">Not sure</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-bold text-teal-800 mb-1">Cycle Related?</label>
                      <select value={lumpCycleRelated} onChange={(e) => setLumpCycleRelated(e.target.value as any)} className="w-full px-3 py-2 bg-white border rounded-xl">
                        <option value="No">No</option>
                        <option value="Yes">Yes</option>
                        <option value="Not sure">Not sure</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Prompt Review Escalation Banner */}
              {promptReviewTriggered && (
                <div className="p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl text-xs space-y-1">
                  <div className="flex items-center gap-2 font-bold text-amber-800">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    <span>Flagged for Prompt Clinician Review</span>
                  </div>
                  <p className="text-[11px] text-amber-800">
                    "This information requires review by the assigned clinician."
                  </p>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: MEDICAL & SURGICAL HISTORY */}
          {step === 3 && (
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-6 text-xs">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-800 text-sm">Step 3: Medical, Surgical &amp; Allergy History</h3>
                <p className="text-slate-400 text-[11px]">General medical conditions, current medications, and past procedures.</p>
              </div>

              {/* General Medical Conditions */}
              <div className="space-y-2">
                <label className="block font-bold text-slate-700 text-xs uppercase tracking-wider">General Medical History (Select all that apply)</label>
                <div className="flex gap-2 flex-wrap">
                  {[
                    "Diabetes",
                    "High blood pressure",
                    "Heart disease",
                    "Thyroid disorder",
                    "Kidney disease",
                    "Liver disease",
                    "Bleeding disorder",
                    "Autoimmune condition",
                    "Other major condition",
                    "None known",
                  ].map((cond) => {
                    const isSel = medicalConditions.includes(cond);
                    return (
                      <button
                        key={cond}
                        type="button"
                        onClick={() => {
                          if (cond === "None known") {
                            setMedicalConditions(["None known"]);
                          } else {
                            const filtered = medicalConditions.filter((c) => c !== "None known");
                            if (isSel) {
                              setMedicalConditions(filtered.filter((c) => c !== cond));
                            } else {
                              setMedicalConditions([...filtered, cond]);
                            }
                          }
                        }}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-bold ${
                          isSel ? "bg-primary text-white border-primary" : "bg-slate-50 text-slate-600 border-slate-200"
                        }`}
                      >
                        {cond}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Medications */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <h4 className="font-bold text-slate-700 text-xs uppercase tracking-wider">Current Medications</h4>
                <input value={currentMedicines} onChange={(e) => setCurrentMedicines(e.target.value)} placeholder="List current medications and dosages..." className="w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl" />
                <div className="flex gap-4">
                  <label className="flex items-center gap-1.5 font-semibold text-slate-600">
                    <input type="checkbox" checked={medsPatientUnknown} onChange={(e) => setMedsPatientUnknown(e.target.checked)} />
                    Patient does not know medicine name
                  </label>
                  <label className="flex items-center gap-1.5 font-semibold text-slate-600">
                    <input type="checkbox" checked={medsInReport} onChange={(e) => setMedsInReport(e.target.checked)} />
                    Medication list available in uploaded report
                  </label>
                </div>
              </div>

              {/* Previous Breast Procedures */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <h4 className="font-bold text-slate-700 text-xs uppercase tracking-wider">Previous Breast Procedures &amp; Imaging</h4>
                <div className="flex gap-2 flex-wrap">
                  {[
                    "Mammogram",
                    "Ultrasound",
                    "Breast MRI",
                    "Fine-needle aspiration",
                    "Core biopsy",
                    "Excision biopsy",
                    "Breast surgery",
                    "Breast-conserving surgery",
                    "Mastectomy",
                    "Reconstructive surgery",
                    "Breast implants",
                    "Radiation therapy",
                    "Chemotherapy",
                    "None",
                  ].map((proc) => {
                    const isSel = previousProcedures.includes(proc);
                    return (
                      <button
                        key={proc}
                        type="button"
                        onClick={() => {
                          if (proc === "None") {
                            setPreviousProcedures(["None"]);
                          } else {
                            const filtered = previousProcedures.filter((p) => p !== "None");
                            if (isSel) {
                              setPreviousProcedures(filtered.filter((p) => p !== proc));
                            } else {
                              setPreviousProcedures([...filtered, proc]);
                            }
                          }
                        }}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-bold ${
                          isSel ? "bg-primary text-white border-primary" : "bg-slate-50 text-slate-600 border-slate-200"
                        }`}
                      >
                        {proc}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: MENSTRUAL, REPRODUCTIVE & HORMONAL HISTORY */}
          {step === 4 && (
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-6 text-xs">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-800 text-sm">Step 4: Menstrual, Reproductive &amp; Hormonal History</h3>
                <p className="text-slate-400 text-[11px]">
                  "These questions may be relevant to breast-health assessment. The patient may select 'Prefer not to answer' where appropriate."
                </p>
              </div>

              {/* Menstrual History */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-700 text-xs uppercase tracking-wider">Menstrual History</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-bold text-slate-500 mb-1">Periods Currently</label>
                    <select value={periodsStatus} onChange={(e) => setPeriodsStatus(e.target.value)} className="w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl">
                      <option>Regular</option>
                      <option>Irregular</option>
                      <option>Stopped naturally</option>
                      <option>Stopped after surgery or treatment</option>
                      <option>Not applicable</option>
                      <option>Not sure</option>
                      <option>Prefer not to answer</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-500 mb-1">Age at First Period</label>
                    <input value={ageFirstPeriod} onChange={(e) => setAgeFirstPeriod(e.target.value)} placeholder="e.g. 13" className="w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl" />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-500 mb-1">Date of Last Period</label>
                    <input type="date" value={lastPeriodDate} onChange={(e) => setLastPeriodDate(e.target.value)} className="w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl" />
                  </div>
                </div>
              </div>

              {/* Pregnancy & Breastfeeding */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <h4 className="font-bold text-slate-700 text-xs uppercase tracking-wider">Pregnancy &amp; Breastfeeding</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-bold text-slate-500 mb-1">Ever Pregnant?</label>
                    <select value={everPregnant} onChange={(e) => setEverPregnant(e.target.value)} className="w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl">
                      <option>Yes</option>
                      <option>No</option>
                      <option>Prefer not to answer</option>
                    </select>
                  </div>
                  {everPregnant === "Yes" && (
                    <>
                      <div>
                        <label className="block font-bold text-slate-500 mb-1">Number of Live Births</label>
                        <input value={numLiveBirths} onChange={(e) => setNumLiveBirths(e.target.value)} placeholder="e.g. 2" className="w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl" />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-500 mb-1">Has Breastfed?</label>
                        <select value={hasBreastfed} onChange={(e) => setHasBreastfed(e.target.value)} className="w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl">
                          <option>Yes</option>
                          <option>No</option>
                        </select>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: FAMILY & PERSONAL CANCER HISTORY */}
          {step === 5 && (
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-6 text-xs">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-800 text-sm">Step 5: Personal, Family &amp; Genetic Cancer History</h3>
                <p className="text-slate-400 text-[11px]">
                  "Family and genetic history will be reviewed by the authorised clinical team."
                </p>
              </div>

              {/* Personal Cancer History */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-700 text-xs uppercase tracking-wider">Has the patient ever been diagnosed with cancer?</h4>
                <div className="flex gap-2">
                  {(["No", "Yes", "Not sure"] as const).map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setPersonalCancer(opt)}
                      className={`px-4 py-2 rounded-xl border text-xs font-bold ${
                        personalCancer === opt ? "bg-primary text-white border-primary" : "bg-slate-50 text-slate-600 border-slate-200"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Family Cancer History Cards */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-700 text-xs uppercase tracking-wider">Affected Blood Relatives</h4>
                  <button
                    type="button"
                    onClick={handleAddRelative}
                    className="px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold rounded-xl flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Another Relative
                  </button>
                </div>

                <div className="space-y-3">
                  {relativesList.map((rel, index) => (
                    <div key={rel.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 text-xs">Relative #{index + 1}</span>
                        {relativesList.length > 1 && (
                          <button type="button" onClick={() => handleRemoveRelative(rel.id)} className="text-rose-600 hover:text-rose-800">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                        <div>
                          <label className="block font-bold text-slate-500 mb-1">Relationship</label>
                          <input value={rel.relationship} onChange={(e) => {
                            const updated = [...relativesList];
                            updated[index].relationship = e.target.value;
                            setRelativesList(updated);
                          }} className="w-full px-3 py-2 bg-white border rounded-xl" />
                        </div>
                        <div>
                          <label className="block font-bold text-slate-500 mb-1">Side</label>
                          <select value={rel.side} onChange={(e) => {
                            const updated = [...relativesList];
                            updated[index].side = e.target.value as any;
                            setRelativesList(updated);
                          }} className="w-full px-3 py-2 bg-white border rounded-xl">
                            <option>Maternal</option>
                            <option>Paternal</option>
                            <option>Direct Line</option>
                            <option>Not sure</option>
                          </select>
                        </div>
                        <div>
                          <label className="block font-bold text-slate-500 mb-1">Cancer Type</label>
                          <input value={rel.cancerType} onChange={(e) => {
                            const updated = [...relativesList];
                            updated[index].cancerType = e.target.value;
                            setRelativesList(updated);
                          }} className="w-full px-3 py-2 bg-white border rounded-xl" />
                        </div>
                        <div>
                          <label className="block font-bold text-slate-500 mb-1">Age at Diagnosis</label>
                          <input value={rel.ageAtDiagnosis} onChange={(e) => {
                            const updated = [...relativesList];
                            updated[index].ageAtDiagnosis = e.target.value;
                            setRelativesList(updated);
                          }} className="w-full px-3 py-2 bg-white border rounded-xl" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: LIFESTYLE, MEASUREMENTS & DOCUMENTS */}
          {step === 6 && (
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-6 text-xs">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-800 text-sm">Step 6: Measurements, Lifestyle &amp; Medical Documents</h3>
                <p className="text-slate-400 text-[11px]">Vital signs, auto BMI, lifestyle factors, and document readability verification.</p>
              </div>

              {/* Measurements */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-700 text-xs uppercase tracking-wider">Basic Physical Measurements</h4>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block font-bold text-slate-500 mb-1">Height (cm)</label>
                    <input type="number" value={heightCm} onChange={(e) => setHeightCm(e.target.value)} className="w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl" />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-500 mb-1">Weight (kg)</label>
                    <input type="number" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} className="w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl" />
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Calculated BMI</span>
                    <p className="text-lg font-black text-slate-800">
                      {bmi.value || "—"} <span className="text-xs font-bold text-primary">({bmi.category})</span>
                    </p>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-500 mb-1">Blood Pressure (mmHg)</label>
                    <div className="flex gap-1">
                      <input value={bpSys} onChange={(e) => setBpSys(e.target.value)} placeholder="120" className="w-1/2 px-3 py-2.5 bg-slate-50 border rounded-xl" />
                      <span className="self-center font-bold text-slate-400">/</span>
                      <input value={bpDia} onChange={(e) => setBpDia(e.target.value)} placeholder="80" className="w-1/2 px-3 py-2.5 bg-slate-50 border rounded-xl" />
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3 text-[11px] text-blue-800 font-semibold">
                  "BMI is a general screening indicator and is not a diagnosis."
                </div>
              </div>

              {/* Documents & Reports Uploader */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <h4 className="font-bold text-slate-700 text-xs uppercase tracking-wider">Medical Reports &amp; Document Verification</h4>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                  <h5 className="font-bold text-slate-800 text-xs">Add Document &amp; Verify Readability</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block font-bold text-slate-500 mb-1">File Title</label>
                      <input value={newDocTitle} onChange={(e) => setNewDocTitle(e.target.value)} placeholder="e.g. Mammogram 2024" className="w-full px-3 py-2 bg-white border rounded-xl" />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-500 mb-1">Document Type</label>
                      <select value={newDocType} onChange={(e) => setNewDocType(e.target.value)} className="w-full px-3 py-2 bg-white border rounded-xl">
                        <option>Mammography report</option>
                        <option>Ultrasound report</option>
                        <option>MRI report</option>
                        <option>Pathology report</option>
                        <option>Biopsy report</option>
                        <option>Laboratory report</option>
                        <option>Previous consultation note</option>
                        <option>Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-bold text-slate-500 mb-1">Readability</label>
                      <select value={newDocReadability} onChange={(e) => setNewDocReadability(e.target.value as any)} className="w-full px-3 py-2 bg-white border rounded-xl">
                        <option value="Clear">Clear (Readable)</option>
                        <option value="Blurry">Blurry</option>
                        <option value="Incomplete">Incomplete</option>
                        <option value="Wrong file">Wrong file</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-bold text-slate-500 mb-1">Identity Matched?</label>
                      <select value={newDocIdentityMatch} onChange={(e) => setNewDocIdentityMatch(e.target.value as any)} className="w-full px-3 py-2 bg-white border rounded-xl">
                        <option value="Yes">Yes (Matches Patient)</option>
                        <option value="No">No (Mismatched)</option>
                        <option value="Unable to verify">Unable to verify</option>
                      </select>
                    </div>
                  </div>
                  <button type="button" onClick={handleAddDocument} disabled={!newDocTitle.trim()} className="px-4 py-2 bg-primary text-white font-bold rounded-xl text-xs disabled:opacity-40">
                    Add Document
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 7: REVIEW, CONSENT & DOCTOR HANDOFF */}
          {step === 7 && (
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-6 text-xs">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-800 text-sm">Step 7: Final Review, Consent &amp; Doctor Handoff</h3>
                <p className="text-slate-400 text-[11px]">Verify completeness, record patient consent, and generate doctor handoff summary.</p>
              </div>

              {/* Section A: Completeness Summary */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-700 text-xs uppercase tracking-wider">Completeness Summary</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { stepNum: 1, label: "Step 1: Identity & Visit", complete: !!name && !!phone },
                    { stepNum: 2, label: "Step 2: Current Concern", complete: primaryConcerns.length > 0 },
                    { stepNum: 3, label: "Step 3: Medical History", complete: true },
                    { stepNum: 4, label: "Step 4: Reproductive History", complete: true },
                    { stepNum: 5, label: "Step 5: Family Cancer History", complete: true },
                    { stepNum: 6, label: "Step 6: Measurements & Docs", complete: !!heightCm && !!weightKg },
                  ].map((sec) => (
                    <div
                      key={sec.stepNum}
                      onClick={() => !sec.complete && setStep(sec.stepNum)}
                      className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer ${
                        sec.complete ? "bg-emerald-50 border-emerald-200 text-emerald-800 font-bold" : "bg-amber-50 border-amber-200 text-amber-800 font-bold"
                      }`}
                    >
                      <span>{sec.label}</span>
                      <span className="text-[10px] font-extrabold uppercase">{sec.complete ? "Complete" : "Incomplete"}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section B: Consent */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <h4 className="font-bold text-slate-700 text-xs uppercase tracking-wider">Section B — Patient Consent Confirmation</h4>
                <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <label className="flex items-center gap-2 font-semibold text-slate-700">
                    <input type="checkbox" checked={patientConfirmedAccurate} onChange={(e) => setPatientConfirmedAccurate(e.target.checked)} />
                    The information provided is accurate to the best of patient knowledge.
                  </label>
                  <label className="flex items-center gap-2 font-semibold text-slate-700">
                    <input type="checkbox" checked={patientConfirmedBelonging} onChange={(e) => setPatientConfirmedBelonging(e.target.checked)} />
                    Uploaded reports belong to the patient.
                  </label>
                  <label className="flex items-center gap-2 font-semibold text-slate-700">
                    <input type="checkbox" checked={patientUnderstandPreliminary} onChange={(e) => setPatientUnderstandPreliminary(e.target.checked)} />
                    Patient understands this is preliminary intake information.
                  </label>
                  <label className="flex items-center gap-2 font-semibold text-slate-700">
                    <input type="checkbox" checked={patientConsentShare} onChange={(e) => setPatientConsentShare(e.target.checked)} />
                    Patient consents to sharing information with the authorized care team.
                  </label>
                </div>
              </div>

              {/* Section C: Nurse Factual Note */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <h4 className="font-bold text-slate-700 text-xs uppercase tracking-wider">Section C — Nurse Objective Factual Observations</h4>
                <textarea
                  rows={3}
                  value={nurseFactualNote}
                  onChange={(e) => setNurseFactualNote(e.target.value)}
                  placeholder="Enter objective, non-diagnostic nurse observations for the doctor..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-xs resize-none"
                />
              </div>

              {/* Section E: Doctor Handoff Card */}
              <div className="p-5 bg-slate-900 text-white rounded-3xl space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h4 className="font-extrabold text-sm text-teal-400">Concise Doctor Handoff Summary</h4>
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Autogenerated</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs opacity-90 leading-relaxed">
                  <p><strong>Patient:</strong> {name} ({age}y, Phone: {phone}) [Data Source: Nurse-assisted]</p>
                  <p><strong>Reason for Visit:</strong> {visitReason} ({patientVisitType})</p>
                  <p><strong>Main Concern:</strong> {primaryConcerns.join(", ")} ({affectedSide} side)</p>
                  <p><strong>Duration:</strong> {durationCategory} (Onset: {symptomOnset}, Progression: {symptomProgression})</p>
                  <p><strong>Measurements:</strong> H: {heightCm}cm, W: {weightKg}kg, BMI: {bmi.value} ({bmi.category}), BP: {bpSys}/{bpDia}</p>
                  <p><strong>Reports Available:</strong> {uploadedDocsList.length} file(s) uploaded</p>
                  <p><strong>Assigned Doctor:</strong> {assignedDoctor}</p>
                  <p><strong>Nurse Note:</strong> {nurseFactualNote}</p>
                </div>
              </div>
            </div>
          )}

          {/* Sticky Action Navigation Bar */}
          <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 p-4 shadow-lg">
            <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={handlePrevStep}
                disabled={step === 1}
                className="px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs disabled:opacity-40"
              >
                Back
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleFinalSubmit(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs"
                >
                  Save Draft
                </button>

                {step < 7 ? (
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="px-6 py-2.5 bg-primary text-white font-bold rounded-xl text-xs flex items-center gap-1 shadow-md shadow-primary/15"
                  >
                    Continue <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowConfirmModal(true)}
                    disabled={isSubmitting}
                    className="px-6 py-2.5 bg-primary text-white font-bold rounded-xl text-xs flex items-center gap-1 shadow-md shadow-primary/15"
                  >
                    <Send className="w-3.5 h-3.5" /> Send to Doctor
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION DIALOG */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 border border-slate-200 text-left shadow-2xl">
            <h3 className="font-bold text-slate-800 text-sm">Confirm Submission to Doctor</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to submit this comprehensive 7-step intake summary for <strong>{name}</strong> to <strong>{assignedDoctor}</strong>?
            </p>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-2.5 border rounded-xl font-bold text-slate-600 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => handleFinalSubmit(true)}
                disabled={isSubmitting}
                className="flex-1 py-2.5 bg-primary text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1"
              >
                {isSubmitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />} Confirm &amp; Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PREVIEW HANDOFF MODAL */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full space-y-4 border border-slate-200 text-left shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-sm">Doctor Handoff Preview</h3>
              <button onClick={() => setShowPreviewModal(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-2 leading-relaxed">
              <p><strong>Patient:</strong> {name || "Sunita Deshmukh"} ({age || "42"}y)</p>
              <p><strong>Visit Reason:</strong> {visitReason} ({patientVisitType})</p>
              <p><strong>Primary Concern:</strong> {primaryConcerns.join(", ")} ({affectedSide} side, {breastLocation})</p>
              <p><strong>Duration:</strong> {durationCategory} ({symptomOnset} onset, {symptomProgression} progression)</p>
              <p><strong>Measurements:</strong> Height: {heightCm}cm, Weight: {weightKg}kg, BMI: {bmi.value} ({bmi.category}), BP: {bpSys}/{bpDia}</p>
              <p><strong>Medical History:</strong> Conditions: {medicalConditions.join(", ")}; Meds: {currentMedicines}</p>
              <p><strong>Family Cancer History:</strong> {relativesList.map((r) => `${r.relationship} (${r.cancerType})`).join(", ")}</p>
              <p><strong>Uploaded Reports:</strong> {uploadedDocsList.map((d) => `${d.fileTitle} [${d.readability}]`).join(", ")}</p>
              <p><strong>Nurse Observations:</strong> {nurseFactualNote}</p>
            </div>
            <button onClick={() => setShowPreviewModal(false)} className="w-full py-2.5 bg-primary text-white font-bold rounded-xl text-xs">
              Close Preview
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
