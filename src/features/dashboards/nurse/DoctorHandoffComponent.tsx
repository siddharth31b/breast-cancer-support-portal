import React, { useState } from "react";
import { Send, Save, CheckCircle, AlertCircle, Clock } from "lucide-react";
import type { PatientRecord } from "../../../types/questionnaire";
import { NurseService, type DoctorHandoffRecord } from "../../../services/nurse.service";

interface DoctorHandoffProps {
  patient: PatientRecord;
  onSent?: () => void;
  onClose?: () => void;
}

export const DoctorHandoffComponent: React.FC<DoctorHandoffProps> = ({
  patient,
  onSent,
  onClose,
}) => {
  const existingHandoff = NurseService.getHandoff(patient.id);

  const concern = (patient.clinicalIntake?.answers?.main_concern ?? []).join(", ").replace(/_/g, " ") || "Routine screening / General check-up";
  const side = patient.clinicalIntake?.answers?.affected_side || "Not specified";
  const duration = patient.clinicalIntake?.answers?.symptom_duration || "Not specified";
  const history = patient.medicalHistory
    ? [
        patient.medicalHistory.familyHistory ? "Family history of breast concern" : null,
        patient.medicalHistory.previousBreastProcedure ? "Previous breast procedure/biopsy" : null,
        patient.medicalHistory.recentInjury ? "Recent trauma/injury" : null,
      ]
        .filter(Boolean)
        .join(", ") || "No major history noted"
    : "No history on record";

  const measurements = patient.bmi?.value
    ? `Height: ${patient.bmi.heightCm} cm, Weight: ${patient.bmi.weightKg} kg, BMI: ${patient.bmi.value} (${patient.bmi.category})`
    : "Vitals/Measurements pending";

  const reports = patient.reports && patient.reports.length > 0
    ? `${patient.reports.length} document(s) uploaded (${patient.reports.map((r) => r.title).join(", ")})`
    : "No reports uploaded";

  const missingInfo = [
    !patient.clinicalIntake?.answers?.symptom_duration ? "Symptom duration" : null,
    !patient.reports || patient.reports.length === 0 ? "Diagnostic imaging reports" : null,
    !patient.bmi?.value ? "Vitals / BMI measurements" : null,
  ]
    .filter(Boolean)
    .join(", ") || "None — Intake complete";

  const [factualNote, setFactualNote] = useState(
    existingHandoff?.nurseFactualNote || "Patient arrived on time. Identity verified via national ID. Intake questionnaire assisted by nursing staff. Patient requested routine review."
  );
  const [assignedDoctor, setAssignedDoctor] = useState("Dr. Sarah Iyer");
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(existingHandoff?.sentToDoctor || false);
  const [savedDraft, setSavedDraft] = useState(false);

  const handleSaveDraft = () => {
    const record: DoctorHandoffRecord = {
      id: existingHandoff?.id || `hd-${Date.now()}`,
      patientId: patient.id,
      patientName: patient.name,
      presentingConcern: concern,
      symptomDuration: duration,
      affectedSide: side,
      relevantHistory: history,
      measurementsSummary: measurements,
      reportsAvailable: reports,
      missingInformation: missingInfo,
      nurseFactualNote: factualNote,
      completionTime: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      sentToDoctor: false,
      doctorName: assignedDoctor,
    };
    NurseService.saveHandoff(record);
    setSavedDraft(true);
    setTimeout(() => setSavedDraft(false), 3000);
  };

  const handleSendToDoctor = async () => {
    setIsSending(true);
    await new Promise((r) => setTimeout(r, 800));
    const record: DoctorHandoffRecord = {
      id: existingHandoff?.id || `hd-${Date.now()}`,
      patientId: patient.id,
      patientName: patient.name,
      presentingConcern: concern,
      symptomDuration: duration,
      affectedSide: side,
      relevantHistory: history,
      measurementsSummary: measurements,
      reportsAvailable: reports,
      missingInformation: missingInfo,
      nurseFactualNote: factualNote,
      completionTime: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      sentToDoctor: true,
      doctorName: assignedDoctor,
    };
    NurseService.saveHandoff(record);
    setIsSending(false);
    setIsSent(true);
    if (onSent) onSent();
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-5 text-left">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded-md">
            Doctor Handoff Summary
          </span>
          <h3 className="text-base font-bold text-slate-800 mt-1">
            Clinical Handoff Note for {patient.name}
          </h3>
          <p className="text-xs text-slate-400">
            Factual summary compiled by nursing staff for clinician review.
          </p>
        </div>
        {isSent && (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold rounded-full">
            <CheckCircle className="w-3.5 h-3.5" /> Sent to Doctor
          </span>
        )}
      </div>

      {/* Structured Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-2">
          <p className="font-bold text-slate-700 uppercase tracking-wider text-[10px] text-slate-400">
            Patient &amp; Concern
          </p>
          <p><strong>Patient:</strong> {patient.name} ({patient.id}, {patient.age}y)</p>
          <p><strong>Presenting Concern:</strong> <span className="capitalize">{concern}</span></p>
          <p><strong>Duration:</strong> {duration}</p>
          <p><strong>Affected Side:</strong> <span className="capitalize">{side}</span></p>
        </div>

        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-2">
          <p className="font-bold text-slate-700 uppercase tracking-wider text-[10px] text-slate-400">
            Medical History &amp; Vitals
          </p>
          <p><strong>Relevant History:</strong> {history}</p>
          <p><strong>Measurements:</strong> {measurements}</p>
          <p><strong>Reports Available:</strong> {reports}</p>
        </div>
      </div>

      {/* Missing Information Banner */}
      <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-4 text-xs text-amber-800 flex items-start gap-2.5">
        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <strong className="block font-bold">Information Still Pending / Missing:</strong>
          <span>{missingInfo}</span>
        </div>
      </div>

      {/* Nurse Factual Note */}
      <div>
        <label htmlFor="nurseNote" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
          Nurse Factual Observation Note <span className="text-red-500">*</span>
        </label>
        <textarea
          id="nurseNote"
          rows={3}
          value={factualNote}
          onChange={(e) => setFactualNote(e.target.value)}
          placeholder="Record objective, factual observations only. Do not record diagnosis or treatment recommendations."
          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
        />
        <p className="text-[10px] text-slate-400 mt-1">
          ℹ️ Record objective facts only (e.g. arrival time, patient statements, verified ID). Do not include diagnostic interpretations.
        </p>
      </div>

      {/* Destination Doctor */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-slate-100 pt-4">
        <div>
          <label htmlFor="assignedDoctor" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Assign Clinician for Handoff
          </label>
          <select
            id="assignedDoctor"
            value={assignedDoctor}
            onChange={(e) => setAssignedDoctor(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="Dr. Sarah Iyer">Dr. Sarah Iyer (Lead Oncology)</option>
            <option value="Dr. Alok Mehta">Dr. Alok Mehta (Radiology Specialist)</option>
            <option value="Dr. Priya Patel">Dr. Priya Patel (Clinical Registrar)</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          {onClose && (
            <button
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-600 transition-colors"
            >
              Close
            </button>
          )}
          <button
            onClick={handleSaveDraft}
            className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <Save className="w-3.5 h-3.5" /> Save Draft
          </button>
          <button
            onClick={handleSendToDoctor}
            disabled={isSending || isSent}
            className="px-5 py-2 bg-primary hover:bg-[#004D46] disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-primary/15 transition-colors"
          >
            {isSending ? (
              <Clock className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
            {isSent ? "Handoff Sent" : "Submit & Notify Doctor"}
          </button>
        </div>
      </div>

      {savedDraft && (
        <p className="text-xs text-emerald-600 font-bold flex items-center gap-1">
          <CheckCircle className="w-3.5 h-3.5" /> Handoff draft saved locally.
        </p>
      )}
    </div>
  );
};
