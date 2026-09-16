import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  AlertCircle,
  RefreshCw,
  Check,
} from "lucide-react";
import { PatientService } from "../../../services/patient.service";
import { NurseService } from "../../../services/nurse.service";
import type { PatientRecord } from "../../../types/questionnaire";

type PatientWorkspaceTab = "summary" | "intake" | "reports" | "appointments" | "follow-up";

export const NursePatientWorkspace: React.FC = () => {
  const params = useParams<{ patientId?: string }>();
  const patientId = params?.patientId;
  const router = useRouter();

  const [patient, setPatient] = useState<PatientRecord | null>(null);
  const [activeTab, setActiveTab] = useState<PatientWorkspaceTab>("summary");
  const [isLoading, setIsLoading] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Intake Tab States
  const [intakeNote, setIntakeNote] = useState("Patient requested routine review.");

  // Reports Tab States
  const [docTitle, setDocTitle] = useState("");
  const [docCategory, setDocCategory] = useState<"Mammogram" | "Ultrasound" | "MRI" | "Pathology" | "Laboratory" | "Other">("Mammogram");
  const [readabilityStatus, setReadabilityStatus] = useState<"Uploaded" | "Validated" | "Needs Update">("Uploaded");

  // Follow-Up Tab States
  const [contactDate, setContactDate] = useState("2026-07-23");
  const [patientReached, setPatientReached] = useState<"Yes" | "No">("Yes");
  const [patientUpdate, setPatientUpdate] = useState("Patient reports feeling fine with no new symptoms.");
  const [nextAction, setNextAction] = useState("Routine consultation");
  const [needsDoctorAttention, setNeedsDoctorAttention] = useState<"Yes" | "No">("No");

  const loadPatient = async () => {
    if (!patientId) return;
    setIsLoading(true);
    try {
      const p = await PatientService.getPatient(patientId);
      setPatient(p || null);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPatient();
  }, [patientId]);

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto py-12 text-center text-slate-400 space-y-3">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-primary" />
        <p className="text-xs font-bold">Loading Patient Record...</p>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="max-w-6xl mx-auto py-12 text-center text-slate-500 space-y-4">
        <AlertCircle className="w-10 h-10 mx-auto text-amber-500" />
        <h2 className="text-lg font-bold">Patient Not Found</h2>
        <p className="text-xs">The requested patient record could not be loaded.</p>
        <Link href="/nurse/patients" className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold inline-block">
          Return to Patients
        </Link>
      </div>
    );
  }

  const isIntakeComplete = patient.clinicalJourney?.assessmentSubmitted;

  const handleAddReport = async () => {
    if (!docTitle || !patient) return;
    patient.reports = patient.reports || [];
    patient.reports.push({
      id: `rep-${Date.now()}`,
      patientId: patient.id,
      title: docTitle,
      category: docCategory,
      uploadedAt: new Date().toISOString(),
      validationStatus: readabilityStatus,
      source: "Nurse Portal",
      downloadable: true,
      shareable: true,
      date: new Date().toLocaleDateString("en-IN"),
      status: readabilityStatus,
      type: "mammogram",
    });

    await PatientService.updatePatientRecord(patient);
    setDocTitle("");
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
    loadPatient();
  };

  const handleSaveFollowUp = async () => {
    NurseService.addFollowUp({
      patientId: patient.id,
      patientName: patient.name,
      reason: "Recorded in Patient Workspace",
      dueDate: contactDate,
      assignedDoctor: "Dr. Sarah Iyer",
      contactMethod: "Phone Call",
      contactStatus: "Completed",
      reached: patientReached === "Yes",
      patientUpdate,
      nextAction,
      escalateRequired: needsDoctorAttention === "Yes",
      priority: needsDoctorAttention === "Yes" ? "HIGH" : "LOW",
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 text-left max-w-6xl mx-auto pb-16">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-slate-200/60 pb-4">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/nurse/patients")} className="p-2 rounded-xl hover:bg-slate-100 text-slate-500">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">{patient.name}</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Age: {patient.age}y • Phone: {patient.phone || "+91 98765-43210"} • Assigned Doctor: Dr. Sarah Iyer
            </p>
          </div>
        </div>

        <span className={`px-3 py-1 text-xs font-bold rounded-full border ${
          isIntakeComplete ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"
        }`}>
          {isIntakeComplete ? "Intake Completed" : "Intake Incomplete"}
        </span>
      </div>

      {/* 5 EXACT TABS ONLY */}
      <div className="flex gap-2 border-b border-slate-200 overflow-x-auto">
        {[
          { id: "summary", label: "1. Summary" },
          { id: "intake", label: "2. Intake" },
          { id: "reports", label: "3. Reports" },
          { id: "appointments", label: "4. Appointments" },
          { id: "follow-up", label: "5. Follow-Up" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`px-5 py-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer ${
              activeTab === t.id
                ? "border-primary text-primary"
                : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-2xl flex items-center gap-2">
          <Check className="w-4 h-4" /> Changes saved successfully.
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: SUMMARY                                                            */}
      {/* ========================================================================= */}
      {activeTab === "summary" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-3 text-xs">
            <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-2">Patient Overview</h3>
            <p><strong>Full Name:</strong> {patient.name}</p>
            <p><strong>Age:</strong> {patient.age} years</p>
            <p><strong>Assigned Doctor:</strong> Dr. Sarah Iyer</p>
            <p><strong>Main Concern:</strong> Soft lump check / Routine screening</p>
            <p><strong>Intake Status:</strong> {isIntakeComplete ? "Sent to Doctor" : "In Progress"}</p>
            <p><strong>Reports Available:</strong> {patient.reports?.length || 0} document(s)</p>
            <p><strong>Next Appointment:</strong> Today at 10:30 AM</p>
            <p><strong>Follow-Up Status:</strong> Up to date</p>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-3 text-xs">
            <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-2">Simple Intake Checklist</h3>
            {[
              { label: "Patient details complete", done: true },
              { label: "Questions complete", done: isIntakeComplete },
              { label: "Measurements complete", done: !!patient.bmi },
              { label: "Reports uploaded", done: (patient.reports?.length ?? 0) > 0 },
              { label: "Sent to doctor", done: isIntakeComplete },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-100 rounded-xl">
                <span className="font-semibold text-slate-700">{item.label}</span>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center border text-[10px] ${
                  item.done ? "bg-emerald-500 text-white border-emerald-500" : "bg-slate-200 text-slate-400 border-slate-300"
                }`}>
                  {item.done && <Check className="w-3.5 h-3.5" />}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: INTAKE                                                             */}
      {/* ========================================================================= */}
      {activeTab === "intake" && (
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4 text-xs">
          <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-2">Patient Intake Summary</h3>
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
            <p><strong>Main Concern:</strong> Soft lump check / Routine screening (Left side, 2-3 weeks)</p>
            <p><strong>Pain Reported:</strong> No</p>
            <p><strong>Lump/Swelling:</strong> Yes</p>
            <p><strong>Height &amp; Weight:</strong> {patient.bmi?.heightCm || 162}cm, {patient.bmi?.weightKg || 58}kg (BMI: {patient.bmi?.value || 22.1})</p>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
              Add Missing Patient-Reported Information / Nurse Note
            </label>
            <textarea
              rows={3}
              value={intakeNote}
              onChange={(e) => setIntakeNote(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-xs resize-none"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button onClick={() => setSavedSuccess(true)} className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl border border-slate-200">
              Save Draft
            </button>
            <button onClick={() => setSavedSuccess(true)} className="px-5 py-2 bg-primary text-white font-bold rounded-xl">
              Send to Doctor
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: REPORTS                                                            */}
      {/* ========================================================================= */}
      {activeTab === "reports" && (
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-6 text-xs">
          <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-2">Medical Reports (Nurse Readability Check Only)</h3>

          {/* Upload Form */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
            <h4 className="font-bold text-slate-700 text-xs">Upload New Document</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                value={docTitle}
                onChange={(e) => setDocTitle(e.target.value)}
                placeholder="Document Title"
                className="px-3 py-2 bg-white border rounded-xl"
              />
              <select value={docCategory} onChange={(e) => setDocCategory(e.target.value as any)} className="px-3 py-2 bg-white border rounded-xl">
                <option value="Mammogram">Mammography</option>
                <option value="Ultrasound">Ultrasound</option>
                <option value="MRI">MRI</option>
                <option value="Pathology">Pathology</option>
                <option value="Laboratory">Laboratory report</option>
                <option value="Other">Other</option>
              </select>
              <select value={readabilityStatus} onChange={(e) => setReadabilityStatus(e.target.value as any)} className="px-3 py-2 bg-white border rounded-xl">
                <option value="Uploaded">Clear</option>
                <option value="Validated">Validated</option>
                <option value="Needs Update">Blurry / Needs Re-upload</option>
              </select>
            </div>
            <button onClick={handleAddReport} disabled={!docTitle} className="px-4 py-2 bg-primary text-white font-bold rounded-xl disabled:opacity-40">
              Upload Report
            </button>
          </div>

          {/* Reports Table */}
          <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
            {(patient.reports ?? []).length === 0 ? (
              <p className="py-8 text-center text-slate-400 font-semibold">No medical reports uploaded yet.</p>
            ) : (
              (patient.reports ?? []).map((r) => (
                <div key={r.id} className="p-4 flex items-center justify-between gap-4">
                  <div>
                    <span className="font-bold text-slate-800">{r.title}</span>
                    <p className="text-[11px] text-slate-400">{r.category} • Uploaded {r.date || "Today"}</p>
                  </div>
                  <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full border ${
                    r.validationStatus === "Validated" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"
                  }`}>
                    {r.validationStatus}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: APPOINTMENTS                                                       */}
      {/* ========================================================================= */}
      {activeTab === "appointments" && (
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4 text-xs">
          <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-2">Appointments</h3>
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-4">
            <div>
              <span className="font-bold text-slate-800">Initial Consultation</span>
              <p className="text-slate-500 text-[11px] mt-0.5">Today at 10:30 AM • Doctor: Dr. Sarah Iyer</p>
            </div>
            <div className="flex gap-1.5">
              <button onClick={() => setSavedSuccess(true)} className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold rounded-xl">
                Mark Arrived
              </button>
              <button onClick={() => setSavedSuccess(true)} className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl">
                Reschedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: FOLLOW-UP                                                          */}
      {/* ========================================================================= */}
      {activeTab === "follow-up" && (
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4 text-xs">
          <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-2">Record Follow-Up Contact</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-500 mb-1">Contact Date</label>
              <input type="date" value={contactDate} onChange={(e) => setContactDate(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border rounded-xl" />
            </div>
            <div>
              <label className="block font-bold text-slate-500 mb-1">Patient Reached?</label>
              <select value={patientReached} onChange={(e) => setPatientReached(e.target.value as any)} className="w-full px-3 py-2 bg-slate-50 border rounded-xl">
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-500 mb-1">Factual Patient Update</label>
              <textarea rows={2} value={patientUpdate} onChange={(e) => setPatientUpdate(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border rounded-xl resize-none" />
            </div>
            <div>
              <label className="block font-bold text-slate-500 mb-1">Next Action</label>
              <input value={nextAction} onChange={(e) => setNextAction(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border rounded-xl" />
            </div>
            <div>
              <label className="block font-bold text-slate-500 mb-1">Needs Doctor Attention?</label>
              <select value={needsDoctorAttention} onChange={(e) => setNeedsDoctorAttention(e.target.value as any)} className="w-full px-3 py-2 bg-slate-50 border rounded-xl">
                <option value="No">No</option>
                <option value="Yes">Yes (Flag for Doctor)</option>
              </select>
            </div>
          </div>

          <button onClick={handleSaveFollowUp} className="px-5 py-2.5 bg-primary text-white font-bold rounded-xl">
            Save Follow-Up Record
          </button>
        </div>
      )}
    </div>
  );
};
