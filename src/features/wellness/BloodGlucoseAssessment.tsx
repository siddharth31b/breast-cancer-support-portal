import React, { useState, useEffect } from "react";
import { PatientService } from "../../services/patient.service";
import { useAuth } from "../auth/AuthContext";
import { CLINICAL_RULES } from "../../config/clinicalRules";
import { AlertCircle, CheckCircle, Droplets, Loader2 } from "lucide-react";
import type { GlucoseTestType, GlucoseUnit } from "../../types/questionnaire";

interface BloodGlucoseAssessmentProps {
  onSaved?: () => void;
  onCancel?: () => void;
}

export const BloodGlucoseAssessment: React.FC<BloodGlucoseAssessmentProps> = ({ onSaved, onCancel }) => {
  const { user } = useAuth();
  const patientId = user?.id || "demo-patient";

  const [testType, setTestType] = useState<GlucoseTestType | "">("");
  const [valueStr, setValueStr] = useState("");
  const [unit, setUnit] = useState<GlucoseUnit>("MG_DL");
  const [hoursFasted, setHoursFasted] = useState("");
  const [pregnancyContext, setPregnancyContext] = useState(false);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [note, setNote] = useState("");

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

  // Adjust unit options based on test type selection
  useEffect(() => {
    if (testType === "HBA1C") {
      setUnit("PERCENT");
    } else if (unit === "PERCENT") {
      setUnit("MG_DL");
    }
  }, [testType]);

  // Live conversion and classification
  useEffect(() => {
    const val = parseFloat(valueStr);

    if (!testType || !valueStr || isNaN(val)) {
      setClassification(null);
      setError(null);
      return;
    }

    const rules = CLINICAL_RULES.bloodGlucose.validation;

    // Logical validation checks
    if (testType === "HBA1C") {
      if (unit !== "PERCENT") {
        setError("HbA1c tests must be entered as a percentage.");
        setClassification(null);
        return;
      }
      if (val < rules.minHbA1c || val > rules.maxHbA1c) {
        setError(`Please enter a valid HbA1c value between ${rules.minHbA1c}% and ${rules.maxHbA1c}%.`);
        setClassification(null);
        return;
      }
    } else {
      if (unit === "PERCENT") {
        setError("Blood glucose concentration tests must use mg/dL or mmol/L.");
        setClassification(null);
        return;
      }
      if (unit === "MG_DL" && (val < rules.minMGDL || val > rules.maxMGDL)) {
        setError(`Please enter a glucose value between ${rules.minMGDL} and ${rules.maxMGDL} mg/dL.`);
        setClassification(null);
        return;
      }
      if (unit === "MMOL_L" && (val < rules.minMMOLL || val > rules.maxMMOLL)) {
        setError(`Please enter a glucose value between ${rules.minMMOLL} and ${rules.maxMMOLL} mmol/L.`);
        setClassification(null);
        return;
      }
    }

    setError(null);

    // Call service classifier
    const derived = PatientService.classifyBloodGlucose(testType, val, unit, pregnancyContext);
    setClassification(derived);

    // Trigger confirmation overlay for critical alerts
    if (derived.alertLevel === "CRITICAL" || testType === "HBA1C" && val >= 6.5) {
      setNeedsConfirmation(true);
    } else {
      setNeedsConfirmation(false);
    }
  }, [testType, valueStr, unit, pregnancyContext]);

  const handleSymptomToggle = (symptom: string) => {
    if (symptom === "None") {
      setSelectedSymptoms(["None"]);
      return;
    }
    const filtered = selectedSymptoms.filter(s => s !== "None");
    if (filtered.includes(symptom)) {
      setSelectedSymptoms(filtered.filter(s => s !== symptom));
    } else {
      setSelectedSymptoms([...filtered, symptom]);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(valueStr);
    const fastHours = hoursFasted ? parseInt(hoursFasted) : undefined;

    if (isNaN(val) || error || !testType) {
      setError("Please fill out all fields correctly before saving.");
      return;
    }

    // Additional check for fasting duration
    if (testType === "FASTING" && (!fastHours || fastHours < 8)) {
      setError("Fasting plasma glucose requires at least 8 hours of fasting. Please verify or select home meter.");
      return;
    }

    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const source = user?.role === "BREAST_CARE_NURSE" ? "NURSE" : user?.role === "DOCTOR" ? "DOCTOR" : "HOME";
      const measuredBy = user?.name || "Patient";

      await PatientService.savePatientBloodGlucose(
        patientId,
        testType,
        val,
        unit,
        fastHours,
        pregnancyContext,
        selectedSymptoms.length > 0 ? selectedSymptoms : undefined,
        note.trim() ? note.trim() : undefined,
        source,
        measuredBy
      );

      setSuccess("Glucose measurement successfully logged.");
      setTimeout(() => {
        if (onSaved) onSaved();
      }, 1000);
    } catch (e) {
      setError("Failed to record glucose reading. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Convert for display
  const getConversionsText = () => {
    const val = parseFloat(valueStr);
    if (isNaN(val) || !valueStr || testType === "HBA1C" || error) return null;

    if (unit === "MG_DL") {
      const converted = (val / 18).toFixed(1);
      return `${val} mg/dL is equivalent to ${converted} mmol/L`;
    } else if (unit === "MMOL_L") {
      const converted = Math.round(val * 18);
      return `${val} mmol/L is equivalent to ${converted} mg/dL`;
    }
    return null;
  };

  const symptomList = [
    "Excessive thirst",
    "Frequent urination",
    "Unexplained weight change",
    "Blurred vision",
    "Fatigue",
    "None"
  ];

  return (
    <form onSubmit={handleSave} className="space-y-4 text-left">
      {/* Patient info tags */}
      <div className="flex flex-wrap items-center gap-2 bg-slate-50 border border-slate-100 rounded-xl p-3 text-[11px] text-slate-500 font-medium">
        <span>Patient: <strong className="text-slate-700">{patientName}</strong></span>
        <span className="text-slate-300">•</span>
        <span>Age: <strong className="text-slate-700">{patientAge || "—"} Years</strong></span>
      </div>

      {/* Pregnancy Checkbox */}
      <label className="flex items-center gap-2 bg-purple-50/50 border border-purple-100/50 rounded-xl p-3 cursor-pointer select-none text-xs font-semibold text-purple-950">
        <input
          type="checkbox"
          checked={pregnancyContext}
          onChange={(e) => setPregnancyContext(e.target.checked)}
          className="rounded border-purple-300 text-purple-650 focus:ring-purple-250 w-4 h-4"
        />
        <span>Pregnancy Context (Apply gestational evaluation rules)</span>
      </label>

      {/* Test Type selector */}
      <div className="space-y-1">
        <label htmlFor="bg-type" className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">
          Test Type
        </label>
        <select
          id="bg-type"
          value={testType}
          onChange={(e) => setTestType(e.target.value as GlucoseTestType)}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus-ring text-slate-700 min-h-[44px]"
          required
        >
          <option value="" disabled>-- Select Glucose Test Type --</option>
          <option value="FASTING">Fasting Plasma Glucose</option>
          <option value="TWO_HOUR_OGTT">Two-Hour Glucose / OGTT</option>
          <option value="RANDOM">Random Plasma Glucose</option>
          <option value="HBA1C">HbA1c (%)</option>
          <option value="HOME_METER">Home Glucometer Reading</option>
        </select>
      </div>

      {testType && (
        <>
          {/* Numerical Input and Unit Selector */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label htmlFor="bg-value" className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                Value
              </label>
              <input
                id="bg-value"
                type="number"
                step="any"
                inputMode="decimal"
                value={valueStr}
                onChange={(e) => setValueStr(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus-ring rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-700 min-h-[44px]"
                placeholder="e.g. 98"
                required
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="bg-unit" className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                Measurement Unit
              </label>
              <select
                id="bg-unit"
                value={unit}
                onChange={(e) => setUnit(e.target.value as GlucoseUnit)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold focus-ring text-slate-700 min-h-[44px]"
                disabled={testType === "HBA1C"}
              >
                {testType === "HBA1C" ? (
                  <option value="PERCENT">% (Percentage)</option>
                ) : (
                  <>
                    <option value="MG_DL">mg/dL</option>
                    <option value="MMOL_L">mmol/L</option>
                  </>
                )}
              </select>
            </div>
          </div>

          {/* Unit helper convert text */}
          {getConversionsText() && (
            <p className="text-[10px] text-[#005F56] font-bold bg-[#005F56]/5 border border-[#005F56]/10 rounded-lg px-2.5 py-1.5 inline-block">
              {getConversionsText()}
            </p>
          )}

          {/* Fasting Duration Context */}
          {testType === "FASTING" && (
            <div className="space-y-1">
              <label htmlFor="bg-fast-hours" className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                Hours Fasted (At least 8 required)
              </label>
              <input
                id="bg-fast-hours"
                type="number"
                value={hoursFasted}
                onChange={(e) => setHoursFasted(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus-ring rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-700 min-h-[44px]"
                placeholder="e.g. 10"
                min="0"
                required
              />
            </div>
          )}

          {/* Symptoms chips */}
          <div className="space-y-1">
            <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Associated Symptoms (Optional)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {symptomList.map((sym) => {
                const isSelected = selectedSymptoms.includes(sym);
                return (
                  <button
                    key={sym}
                    type="button"
                    onClick={() => handleSymptomToggle(sym)}
                    className={`px-2.5 py-1.5 border rounded-lg text-[10px] font-semibold transition-all cursor-pointer
                      ${isSelected
                        ? "bg-slate-800 border-slate-800 text-white"
                        : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"}`}
                  >
                    {sym}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom notes */}
          <div className="space-y-1">
            <label htmlFor="bg-note" className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">
              Optional Observations
            </label>
            <input
              id="bg-note"
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus-ring rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-700 min-h-[44px]"
              placeholder="e.g. checked using home meter after brunch"
            />
          </div>
        </>
      )}

      {/* Live Classification Display */}
      {classification && (
        <div className={`p-4 rounded-xl border flex gap-3 text-xs leading-relaxed font-medium transition-all
          ${classification.alertLevel === "CRITICAL" 
            ? "bg-red-50/70 border-red-200 text-red-800" 
            : classification.alertLevel === "WARNING" 
              ? "bg-amber-50/70 border-amber-200 text-amber-800"
              : "bg-emerald-50/70 border-emerald-250 text-emerald-800"}`}>
          <div className="pt-0.5">
            <Droplets className={`w-4 h-4 ${classification.alertLevel === "CRITICAL" ? "text-red-500 animate-bounce" : ""}`} />
          </div>
          <div>
            <span className="font-bold block text-[10px] uppercase tracking-wide">
              {classification.alertLevel === "CRITICAL" ? "Critical Limit Alert" : "Derived Range Check"}
            </span>
            <p className="text-[11px] font-normal mt-1">{classification.interpretation}</p>
            {needsConfirmation && (
              <label className="flex items-center gap-2 mt-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={!needsConfirmation}
                  onChange={() => setNeedsConfirmation(false)}
                  className="rounded border-slate-350 focus:ring-0 w-3.5 h-3.5"
                  required
                />
                <span className="text-[10px] font-bold text-slate-600">I verify that the selected test type, units, and values are correct.</span>
              </label>
            )}
          </div>
        </div>
      )}

      {/* Alerts */}
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
          disabled={isSaving || (needsConfirmation && classification?.alertLevel === "CRITICAL")}
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Log Glucose"}
        </button>
      </div>
    </form>
  );
};
