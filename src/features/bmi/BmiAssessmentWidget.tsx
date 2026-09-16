import React, { useState, useEffect } from "react";
import { PatientService } from "../../services/patient.service";
import { useAuth } from "../auth/AuthContext";
import { AlertCircle, CheckCircle, RefreshCw, Save } from "lucide-react";

interface BmiAssessmentWidgetProps {
  onSaved?: () => void;
  inlineMode?: boolean;
}

export const BmiAssessmentWidget: React.FC<BmiAssessmentWidgetProps> = ({ onSaved, inlineMode = false }) => {
  const { user } = useAuth();
  const patientId = user?.id || "demo-patient";

  const [heightStr, setHeightStr] = useState("");
  const [weightStr, setWeightStr] = useState("");
  const [ageStr, setAgeStr] = useState("");
  const [sex, setSex] = useState("Female");
  
  const [calculatedBmi, setCalculatedBmi] = useState<number | null>(null);
  const [classification, setClassification] = useState<{ category: string; description: string } | null>(null);
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Pre-populate with current patient data if available
  useEffect(() => {
    let active = true;
    const loadBmiData = async () => {
      const record = await PatientService.getPatient(patientId);
      if (!active) return;
      if (record && record.bmi) {
        setHeightStr(record.bmi.heightCm.toString());
        setWeightStr(record.bmi.weightKg.toString());
        setAgeStr(record.bmi.age.toString());
        setCalculatedBmi(record.bmi.value);
        setClassification({
          category: record.bmi.category,
          description: record.bmi.description
        });
      } else if (record) {
        setAgeStr(record.age.toString());
      }
    };
    loadBmiData();
    return () => { active = false; };
  }, [patientId]);

  // Handle live calculation
  useEffect(() => {
    const h = parseFloat(heightStr);
    const w = parseFloat(weightStr);
    const a = parseInt(ageStr);

    // Reset calculation if inputs are incomplete
    if (!heightStr || !weightStr || !ageStr || isNaN(h) || isNaN(w) || isNaN(a)) {
      setCalculatedBmi(null);
      setClassification(null);
      setError(null);
      return;
    }

    // Live validation range checks
    if (h < 100 || h > 250) {
      setError("Please enter a height between 100 and 250 cm.");
      setCalculatedBmi(null);
      setClassification(null);
      return;
    }
    if (w < 20 || w > 300) {
      setError("Please enter a weight between 20 and 300 kg.");
      setCalculatedBmi(null);
      setClassification(null);
      return;
    }
    if (a <= 0 || a > 120) {
      setError("Please enter a valid age.");
      setCalculatedBmi(null);
      setClassification(null);
      return;
    }

    setError(null);

    const bmiVal = PatientService.calculateBmi(w, h);
    setCalculatedBmi(bmiVal);
    
    const classificationVal = PatientService.classifyBmi(bmiVal, a);
    setClassification(classificationVal);
  }, [heightStr, weightStr, ageStr]);

  const handleSave = () => {
    const h = parseFloat(heightStr);
    const w = parseFloat(weightStr);
    const a = parseInt(ageStr);

    if (isNaN(h) || isNaN(w) || isNaN(a) || error) {
      setError("Please provide valid inputs before saving.");
      return;
    }

    setIsSaving(true);
    setError(null);
    setSuccess(null);

    setTimeout(async () => {
      try {
        await PatientService.savePatientBmi(patientId, h, w, a);
        setSuccess("BMI results successfully saved to your wellness profile.");
        if (onSaved) onSaved();
      } catch (e) {
        setError("Failed to save BMI. Please try again.");
      } finally {
        setIsSaving(false);
      }
    }, 600);
  };

  const handleReset = async () => {
    setHeightStr("");
    setWeightStr("");
    const record = await PatientService.getPatient(patientId);
    setAgeStr(record ? record.age.toString() : (user?.role === "PATIENT" ? "30" : ""));
    setCalculatedBmi(null);
    setClassification(null);
    setError(null);
    setSuccess(null);
  };

  const getMarkerLeftPercentage = (bmi: number): string => {
    // Maps BMI range [15, 35] to [0%, 100%] slider
    const minBmi = 15;
    const maxBmi = 35;
    const percentage = ((bmi - minBmi) / (maxBmi - minBmi)) * 100;
    return `${Math.max(0, Math.min(100, percentage))}%`;
  };

  return (
    <div className={`bg-white rounded-2xl border border-slate-100 ${inlineMode ? "p-0" : "p-6"} space-y-6 text-left`}>
      {!inlineMode && (
        <div>
          <h3 className="font-bold text-slate-800 text-sm">Calculate Body Mass Index (BMI)</h3>
          <p className="text-[11px] text-slate-400 mt-1">A screening wellness indicator integrated with your health profile.</p>
        </div>
      )}

      {/* Inputs Form */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label htmlFor="bmi-age" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Age (Years)</label>
          <input
            id="bmi-age"
            type="number"
            value={ageStr}
            onChange={(e) => setAgeStr(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus-ring text-slate-700 min-h-[44px]"
            placeholder="e.g. 46"
            min="1"
            max="120"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="bmi-sex" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Sex (Optional)</label>
          <select
            id="bmi-sex"
            value={sex}
            onChange={(e) => setSex(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus-ring text-slate-700 min-h-[44px]"
          >
            <option value="Female">Female</option>
            <option value="Male">Male</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div className="space-y-1">
          <label htmlFor="bmi-height" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Height (cm)</label>
          <input
            id="bmi-height"
            type="number"
            value={heightStr}
            onChange={(e) => setHeightStr(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus-ring text-slate-700 min-h-[44px]"
            placeholder="e.g. 160"
            min="100"
            max="250"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="bmi-weight" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Weight (kg)</label>
          <input
            id="bmi-weight"
            type="number"
            value={weightStr}
            onChange={(e) => setWeightStr(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus-ring text-slate-700 min-h-[44px]"
            placeholder="e.g. 72"
            min="20"
            max="300"
          />
        </div>
      </div>

      {/* Validation Message */}
      {error && (
        <div className="flex gap-2.5 p-3.5 bg-rose-50 border border-rose-150 rounded-xl text-xs text-rose-800 leading-normal" role="alert">
          <AlertCircle className="w-4.5 h-4.5 text-rose-500 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* BMI Live Display */}
      {calculatedBmi !== null && classification && !error && (
        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Calculated BMI</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-4xl font-black text-slate-800 tracking-tight" aria-live="polite">{calculatedBmi}</span>
                <span className="text-xs text-slate-400 font-semibold">kg/m²</span>
              </div>
            </div>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold border uppercase
              ${classification.category.includes("Healthy range") ? "bg-emerald-50 text-emerald-700 border-emerald-250" : ""}
              ${classification.category.includes("Above") ? "bg-amber-50 text-amber-700 border-amber-250" : ""}
              ${classification.category.includes("Below") ? "bg-blue-50 text-blue-700 border-blue-250" : ""}
              ${classification.category.includes("Obesity") ? "bg-rose-50 text-rose-700 border-rose-250" : ""}
              ${classification.category.includes("Pediatric") ? "bg-purple-50 text-purple-700 border-purple-250" : ""}
            `}>
              {classification.category}
            </span>
          </div>

          {/* Under 20 warning special layout */}
          {classification.category.includes("Pediatric") ? (
            <div className="p-3 bg-purple-50 border border-purple-100 rounded-xl flex gap-2 text-xs text-purple-800 leading-normal">
              <AlertCircle className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
              <span>{classification.description}</span>
            </div>
          ) : (
            <>
              {/* Range track */}
              <div className="space-y-1.5" aria-hidden="true">
                <div className="relative">
                  {/* Coloured segments — overflow-hidden only on this inner bar */}
                  <div className="relative h-2 rounded-full overflow-hidden flex bg-slate-200">
                    {/* Underweight: 15 to 18.5 (17.5% width) */}
                    <div className="h-full bg-blue-300" style={{ width: "17.5%" }} title="Underweight" />
                    {/* Normal: 18.5 to 25 (32.5% width) */}
                    <div className="h-full bg-emerald-400" style={{ width: "32.5%" }} title="Healthy" />
                    {/* Overweight: 25 to 30 (25% width) */}
                    <div className="h-full bg-amber-400" style={{ width: "25%" }} title="Overweight" />
                    {/* Obese: 30 to 35+ (25% width) */}
                    <div className="h-full bg-rose-400" style={{ width: "25%" }} title="Obese" />
                  </div>
                  {/* Dynamic Pointer — outside overflow-hidden so it is never clipped */}
                  <div className="absolute inset-y-0 flex items-center transition-all duration-500 pointer-events-none" style={{ left: getMarkerLeftPercentage(calculatedBmi) }}>
                    <div className="w-3.5 h-3.5 rounded-full bg-slate-800 border-2 border-white shadow-md -translate-x-1/2" />
                  </div>
                </div>
                <div className="flex justify-between text-[8px] text-slate-400 font-bold pt-1">
                  <span>Underweight<br />&lt; 18.5</span>
                  <span className="text-center">Healthy<br />18.5–24.9</span>
                  <span className="text-center">Overweight<br />25–29.9</span>
                  <span className="text-right">Obese<br />&ge; 30</span>
                </div>
              </div>

              {/* Informative wording */}
              <p className="text-[11px] text-slate-500 leading-relaxed font-normal">
                {classification.description}
              </p>
            </>
          )}
        </div>
      )}

      {/* Explanation banner */}
      {calculatedBmi === null && (
        <div className="p-4 bg-teal-50/40 border border-teal-100 rounded-xl flex gap-3 text-xs text-primary leading-normal">
          <AlertCircle className="w-4 h-4 text-accent-teal shrink-0 mt-0.5" />
          <p className="text-slate-500 text-[11px] leading-relaxed">
            Your BMI is one general wellness indicator. It should be considered alongside medical history, lifestyle and clinical evaluation.
          </p>
        </div>
      )}

      {/* Success Notification */}
      {success && (
        <div className="flex gap-2.5 p-3.5 bg-emerald-50 border border-emerald-150 rounded-xl text-xs text-emerald-800 leading-normal" role="status">
          <CheckCircle className="w-4.5 h-4.5 text-emerald-500 shrink-0 mt-0.5" />
          <span>{success}</span>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={handleSave}
          disabled={isSaving || calculatedBmi === null || !!error}
          className="flex-1 px-4 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow-md shadow-primary/10 transition-colors cursor-pointer flex items-center justify-center gap-2 min-h-[44px] disabled:opacity-55 disabled:cursor-not-allowed"
        >
          {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          Save to Profile
        </button>
        <button
          onClick={handleReset}
          className="px-4 py-2.5 border border-slate-200 text-slate-500 hover:bg-slate-50 text-xs font-bold rounded-xl transition-colors cursor-pointer min-h-[44px]"
        >
          Reset
        </button>
      </div>
    </div>
  );
};
