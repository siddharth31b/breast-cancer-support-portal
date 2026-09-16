import React, { useState, useEffect } from "react";
import { PatientService } from "../../services/patient.service";
import { useAuth } from "../auth/AuthContext";
import { CLINICAL_RULES } from "../../config/clinicalRules";
import { AlertCircle, CheckCircle, Heart, Loader2 } from "lucide-react";

interface BloodPressureAssessmentProps {
  onSaved?: () => void;
  onCancel?: () => void;
}

export const BloodPressureAssessment: React.FC<BloodPressureAssessmentProps> = ({ onSaved, onCancel }) => {
  const { user } = useAuth();
  const patientId = user?.id || "demo-patient";

  const [systolicStr, setSystolicStr] = useState("");
  const [diastolicStr, setDiastolicStr] = useState("");
  const [pulseStr, setPulseStr] = useState("");
  const [position, setPosition] = useState<"SITTING" | "STANDING" | "LYING">("SITTING");
  const [note, setNote] = useState("");
  const [selectedNotes, setSelectedNotes] = useState<string[]>([]);
  
  // Patient Context
  const [patientName, setPatientName] = useState("");
  const [patientAge, setPatientAge] = useState("");

  const [classification, setClassification] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);

  // Pre-populate patient profile info
  useEffect(() => {
    const loadProfile = async () => {
      const record = await PatientService.getPatient(patientId);
      if (record) {
        setPatientName(record.name);
        setPatientAge(String(record.age));
      } else if (user) {
        setPatientName(user.name);
      }
    };
    loadProfile();
  }, [patientId, user]);

  // Live classification derivation
  useEffect(() => {
    const sys = parseInt(systolicStr);
    const dia = parseInt(diastolicStr);

    if (!systolicStr || !diastolicStr || isNaN(sys) || isNaN(dia)) {
      setClassification(null);
      setError(null);
      return;
    }

    const rules = CLINICAL_RULES.bloodPressure.validation;

    // Check logical bounds
    if (sys < rules.minSystolic || sys > rules.maxSystolic) {
      setError(`Systolic pressure must be between ${rules.minSystolic} and ${rules.maxSystolic} mmHg.`);
      setClassification(null);
      return;
    }

    if (dia < rules.minDiastolic || dia > rules.maxDiastolic) {
      setError(`Diastolic pressure must be between ${rules.minDiastolic} and ${rules.maxDiastolic} mmHg.`);
      setClassification(null);
      return;
    }

    if (sys <= dia) {
      setError("Systolic pressure must exceed diastolic pressure.");
      setClassification(null);
      return;
    }

    setError(null);

    // Call static classifier to preview status
    const derived = PatientService.classifyBloodPressure(sys, dia, []);
    setClassification(derived);

    // If extremely high (Crisis) or extremely low, set confirmation flag
    if (derived.showCrisisAlert || derived.status === "BELOW_USUAL") {
      setNeedsConfirmation(true);
    } else {
      setNeedsConfirmation(false);
    }
  }, [systolicStr, diastolicStr]);

  const handleNoteChipToggle = (chip: string) => {
    if (selectedNotes.includes(chip)) {
      setSelectedNotes(selectedNotes.filter(n => n !== chip));
    } else {
      setSelectedNotes([...selectedNotes, chip]);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const sys = parseInt(systolicStr);
    const dia = parseInt(diastolicStr);
    const pulse = pulseStr ? parseInt(pulseStr) : undefined;

    if (isNaN(sys) || isNaN(dia) || error) {
      setError("Please resolve form validation errors before saving.");
      return;
    }

    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      // Set recordedBy based on current authenticated role
      const source = user?.role === "BREAST_CARE_NURSE" ? "NURSE" : user?.role === "DOCTOR" ? "DOCTOR" : "HOME";
      const measuredBy = user?.name || "Patient";

      const finalNotes = [
        ...selectedNotes,
        ...(note.trim() ? [note.trim()] : [])
      ].join(", ");

      await PatientService.savePatientBloodPressure(
        patientId,
        sys,
        dia,
        pulse,
        position,
        finalNotes || undefined,
        source,
        measuredBy
      );

      setSuccess("Blood pressure measurement successfully saved.");
      setTimeout(() => {
        if (onSaved) onSaved();
      }, 1000);
    } catch (e) {
      setError("Failed to record blood pressure. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const noteChips = [
    "Rested before measurement",
    "Recently exercised",
    "Felt stressed or anxious",
    "Post-medication"
  ];

  return (
    <form onSubmit={handleSave} className="space-y-4 text-left">
      {/* Patient info tags */}
      <div className="flex flex-wrap items-center gap-2 bg-slate-50 border border-slate-100 rounded-xl p-3 text-[11px] text-slate-500 font-medium">
        <span>Patient: <strong className="text-slate-700">{patientName}</strong></span>
        <span className="text-slate-300">•</span>
        <span>Age: <strong className="text-slate-700">{patientAge || "—"} Years</strong></span>
      </div>

      {/* Numerical values */}
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1">
          <label htmlFor="bp-systolic" className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">
            Systolic (mmHg)
          </label>
          <input
            id="bp-systolic"
            type="number"
            inputMode="decimal"
            value={systolicStr}
            onChange={(e) => setSystolicStr(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 focus-ring rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-700 min-h-[44px]"
            placeholder="e.g. 120"
            required
            min="40"
            max="260"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="bp-diastolic" className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">
            Diastolic (mmHg)
          </label>
          <input
            id="bp-diastolic"
            type="number"
            inputMode="decimal"
            value={diastolicStr}
            onChange={(e) => setDiastolicStr(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 focus-ring rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-700 min-h-[44px]"
            placeholder="e.g. 80"
            required
            min="30"
            max="180"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="bp-pulse" className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">
            Pulse (bpm)
          </label>
          <input
            id="bp-pulse"
            type="number"
            inputMode="decimal"
            value={pulseStr}
            onChange={(e) => setPulseStr(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 focus-ring rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-700 min-h-[44px]"
            placeholder="Optional"
            min="30"
            max="220"
          />
        </div>
      </div>

      {/* Position Selector */}
      <div className="space-y-1">
        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
          Measurement Position
        </label>
        <div className="grid grid-cols-3 gap-2">
          {(["SITTING", "STANDING", "LYING"] as const).map((pos) => (
            <button
              key={pos}
              type="button"
              onClick={() => setPosition(pos)}
              className={`py-2 px-3 border text-xs font-semibold rounded-xl text-center cursor-pointer transition-all min-h-[40px]
                ${position === pos 
                  ? "bg-[#005F56] border-[#005F56] text-white" 
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`}
            >
              {pos.charAt(0) + pos.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Structured note chips */}
      <div className="space-y-1">
        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
          Activity / Context Notes
        </label>
        <div className="flex flex-wrap gap-1.5">
          {noteChips.map((chip) => {
            const isSelected = selectedNotes.includes(chip);
            return (
              <button
                key={chip}
                type="button"
                onClick={() => handleNoteChipToggle(chip)}
                className={`px-2.5 py-1.5 border rounded-lg text-[10px] font-semibold transition-all cursor-pointer
                  ${isSelected
                    ? "bg-slate-800 border-slate-800 text-white"
                    : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"}`}
              >
                {chip}
              </button>
            );
          })}
        </div>
      </div>

      {/* Optional Short Custom Note */}
      <div className="space-y-1">
        <label htmlFor="bp-note" className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">
          Custom Note
        </label>
        <input
          id="bp-note"
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 focus-ring rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-700 min-h-[44px]"
          placeholder="Any additional observations..."
        />
      </div>

      {/* Live Classification Display */}
      {classification && (
        <div className={`p-4 rounded-xl border flex gap-3 text-xs leading-relaxed font-medium transition-all
          ${classification.status === "HIGH_READING" 
            ? classification.showCrisisAlert 
              ? "bg-red-50/70 border-red-200 text-red-800" 
              : "bg-amber-50/70 border-amber-200 text-amber-800" 
            : classification.status === "BELOW_USUAL"
              ? "bg-blue-50/70 border-blue-200 text-blue-800"
              : "bg-emerald-50/70 border-emerald-250 text-emerald-800"}`}>
          <div className="pt-0.5">
            <Heart className={`w-4 h-4 ${classification.status === "HIGH_READING" ? "text-red-500 fill-red-500 animate-pulse" : ""}`} />
          </div>
          <div>
            <span className="font-bold block text-[10px] uppercase tracking-wide">
              {classification.label}
            </span>
            <p className="text-[11px] font-normal mt-1">{classification.description}</p>
            {needsConfirmation && (
              <label className="flex items-center gap-2 mt-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={!needsConfirmation}
                  onChange={() => setNeedsConfirmation(false)}
                  className="rounded border-slate-350 focus:ring-0 w-3.5 h-3.5"
                  required
                />
                <span className="text-[10px] font-bold text-slate-600">I confirm these values are entered correctly.</span>
              </label>
            )}
          </div>
        </div>
      )}

      {/* Status Messages */}
      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex gap-2 text-xs font-medium">
          <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-250 text-emerald-800 rounded-xl flex gap-2 text-xs font-medium">
          <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-2.5 pt-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-150 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer min-h-[44px]"
            disabled={isSaving}
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="px-5 py-2.5 bg-[#005F56] hover:bg-[#004e47] text-white text-xs font-semibold rounded-xl flex items-center gap-2 cursor-pointer shadow-md shadow-[#005F56]/15 min-h-[44px]"
          disabled={isSaving || (needsConfirmation && classification?.status === "HIGH_READING")}
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Reading"}
        </button>
      </div>
    </form>
  );
};
