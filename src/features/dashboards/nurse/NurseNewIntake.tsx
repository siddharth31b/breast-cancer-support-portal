import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ArrowLeft,
  Send,
  AlertCircle,
  Check,
} from "lucide-react";
import { PatientService } from "../../../services/patient.service";
import { NurseService } from "../../../services/nurse.service";

export const NurseNewIntake: React.FC = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Step 1: Patient Details
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [dob, setDob] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [emergency, setEmergency] = useState("");
  const [consentConfirmed, setConsentConfirmed] = useState(true);

  // Step 2: Concern & History
  const [concern, setConcern] = useState("Soft lump check / Routine screening");
  const [side, setSide] = useState("Left");
  const [duration, setDuration] = useState("2-3 weeks");
  const [medications, setMedications] = useState("None");
  const [familyHist, setFamilyHist] = useState("Maternal aunt had breast concern");

  // Step 3: Questionnaire
  const [pain, setPain] = useState("Mild intermittent");
  const [nippleChange, setNippleChange] = useState("No");
  const [skinChange, setSkinChange] = useState("No");
  const [armpitSwelling, setArmpitSwelling] = useState("No");

  // Step 4: Measurements & Reports
  const [heightCm, setHeightCm] = useState("162");
  const [weightKg, setWeightKg] = useState("58");
  const [reportTitle, setReportTitle] = useState("");
  const [reportType, setReportType] = useState<"Mammogram" | "Ultrasound" | "Pathology">("Mammogram");

  // Step 5: Review & Handoff
  const [nurseNote, setNurseNote] = useState(
    "Patient registered at desk. Identity verified via ID card. Consent confirmed. Height, weight and vital signs recorded. Patient requested routine review."
  );
  const [assignedDoctor] = useState("Dr. Sarah Iyer");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState("");

  const bmi = NurseService.calculateBmi(parseFloat(heightCm), parseFloat(weightKg));

  const handleNext = () => {
    setValidationError("");
    if (currentStep === 1) {
      if (!name.trim() || !age || !phone.trim() || !emergency.trim()) {
        setValidationError("Please fill in mandatory patient details (Name, Age, Phone, Emergency Contact).");
        return;
      }
    }
    setCurrentStep((s) => Math.min(s + 1, 5));
  };

  const handlePrev = () => {
    setValidationError("");
    setCurrentStep((s) => Math.max(s - 1, 1));
  };

  const handleSubmitIntake = async (notifyDoctor: boolean) => {
    setIsSubmitting(true);
    try {
      const hospital = "IIT Indore Main Campus Hospital";
      const newPatient = await PatientService.registerPatient(
        name,
        parseInt(age) || 30,
        dob || "1994-05-10",
        phone,
        email,
        address,
        "English",
        "SMS",
        emergency,
        "Spouse",
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

      // Add report if uploaded
      if (reportTitle) {
        newPatient.reports = [
          {
            id: `rep-${Date.now()}`,
            patientId: newPatient.id,
            title: reportTitle,
            category: reportType,
            uploadedAt: new Date().toISOString(),
            validationStatus: "Uploaded",
            source: "Nurse Portal",
            downloadable: true,
            shareable: true,
            date: new Date().toLocaleDateString("en-IN"),
            status: "Uploaded",
            type: "mammogram",
          },
        ];
      }

      await PatientService.updatePatientRecord(newPatient);

      // Save Doctor Handoff Record
      NurseService.saveHandoff({
        id: `hd-${Date.now()}`,
        patientId: newPatient.id,
        patientName: newPatient.name,
        presentingConcern: concern,
        symptomDuration: duration,
        affectedSide: side,
        relevantHistory: familyHist,
        measurementsSummary: `Height: ${heightCm}cm, Weight: ${weightKg}kg, BMI: ${bmi.value} (${bmi.category})`,
        reportsAvailable: reportTitle ? `1 Document: ${reportTitle}` : "None uploaded",
        missingInformation: "None — Initial intake complete",
        nurseFactualNote: nurseNote,
        completionTime: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        sentToDoctor: notifyDoctor,
        doctorName: assignedDoctor,
      });

      setIsSubmitting(false);
      router.push(`/nurse/patients/${newPatient.id}`);
    } catch (e: any) {
      setIsSubmitting(false);
      setValidationError(e.message || "Failed to submit intake.");
    }
  };

  const steps = [
    { num: 1, title: "Patient Details" },
    { num: 2, title: "Concern & History" },
    { num: 3, title: "Questionnaire" },
    { num: 4, title: "Measurements & Reports" },
    { num: 5, title: "Review & Handoff" },
  ];

  return (
    <div className="space-y-6 text-left max-w-4xl mx-auto pb-16">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-200/60 pb-5">
        <button onClick={() => router.push("/nurse")} className="w-9 h-9 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-500">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">New Patient Intake</h1>
          <p className="text-xs text-slate-400 mt-0.5">Step-by-step patient registration and clinical preparation wizard.</p>
        </div>
      </div>

      {/* 5-Step Stepper Bar */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2">
        {steps.map((s) => (
          <div
            key={s.num}
            onClick={() => s.num < currentStep && setCurrentStep(s.num)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
              currentStep === s.num
                ? "bg-primary text-white border-primary shadow-xs"
                : currentStep > s.num
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-slate-50 text-slate-400 border-slate-200"
            }`}
          >
            <span className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-black ${
              currentStep === s.num ? "bg-white/20 text-white" : currentStep > s.num ? "bg-emerald-200 text-emerald-800" : "bg-slate-200 text-slate-500"
            }`}>
              {currentStep > s.num ? <Check className="w-3 h-3" /> : s.num}
            </span>
            <span className="whitespace-nowrap">{s.title}</span>
          </div>
        ))}
      </div>

      {validationError && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-2xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* STEP PANELS */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-5 text-xs">
        {/* STEP 1 */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <h3 className="font-bold text-slate-800 text-sm">Step 1: Patient Identity &amp; Contact</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-500 mb-1">Full Name *</label>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Suman Deshmukh" className="w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-xs" />
              </div>
              <div>
                <label className="block font-bold text-slate-500 mb-1">Age *</label>
                <input type="number" value={age} onChange={(e) => setAge(e.target.value)} placeholder="e.g. 42" className="w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-xs" />
              </div>
              <div>
                <label className="block font-bold text-slate-500 mb-1">Date of Birth</label>
                <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} className="w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-xs" />
              </div>
              <div>
                <label className="block font-bold text-slate-500 mb-1">Phone Number *</label>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765-43210" className="w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-xs" />
              </div>
              <div>
                <label className="block font-bold text-slate-500 mb-1">Email (Optional)</label>
                <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="patient@email.com" className="w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-xs" />
              </div>
              <div>
                <label className="block font-bold text-slate-500 mb-1">Emergency Contact Phone *</label>
                <input value={emergency} onChange={(e) => setEmergency(e.target.value)} placeholder="+91 98765-99999" className="w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-xs" />
              </div>
              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-500 mb-1">Residential Address</label>
                <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Address, City, PIN" className="w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-xs" />
              </div>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <input type="checkbox" id="c1" checked={consentConfirmed} onChange={(e) => setConsentConfirmed(e.target.checked)} />
              <label htmlFor="c1" className="font-semibold text-slate-600">Patient identity verified via document &amp; consent recorded.</label>
            </div>
          </div>
        )}

        {/* STEP 2 */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <h3 className="font-bold text-slate-800 text-sm">Step 2: Presenting Concern &amp; Medical History</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-500 mb-1">Presenting Concern</label>
                <input value={concern} onChange={(e) => setConcern(e.target.value)} className="w-full px-3.5 py-2.5 bg-white border rounded-xl" />
              </div>
              <div>
                <label className="block font-bold text-slate-500 mb-1">Affected Side</label>
                <select value={side} onChange={(e) => setSide(e.target.value)} className="w-full px-3.5 py-2.5 bg-white border rounded-xl">
                  <option>Left</option>
                  <option>Right</option>
                  <option>Bilateral (Both)</option>
                  <option>Not Sure</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-500 mb-1">Symptom Duration</label>
                <input value={duration} onChange={(e) => setDuration(e.target.value)} className="w-full px-3.5 py-2.5 bg-white border rounded-xl" />
              </div>
              <div>
                <label className="block font-bold text-slate-500 mb-1">Current Medications</label>
                <input value={medications} onChange={(e) => setMedications(e.target.value)} className="w-full px-3.5 py-2.5 bg-white border rounded-xl" />
              </div>
              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-500 mb-1">Family History of Breast Concern</label>
                <input value={familyHist} onChange={(e) => setFamilyHist(e.target.value)} className="w-full px-3.5 py-2.5 bg-white border rounded-xl" />
              </div>
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <div className="bg-teal-50 border border-teal-200 rounded-2xl p-3 text-[11px] text-teal-800 font-medium">
              Responses were provided by the patient with nurse assistance.
            </div>
            <h3 className="font-bold text-slate-800 text-sm">Step 3: Guided Questionnaire</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-500 mb-1">Pain Experience</label>
                <input value={pain} onChange={(e) => setPain(e.target.value)} className="w-full px-3.5 py-2.5 bg-white border rounded-xl" />
              </div>
              <div>
                <label className="block font-bold text-slate-500 mb-1">Nipple Changes / Discharge</label>
                <input value={nippleChange} onChange={(e) => setNippleChange(e.target.value)} className="w-full px-3.5 py-2.5 bg-white border rounded-xl" />
              </div>
              <div>
                <label className="block font-bold text-slate-500 mb-1">Skin Changes</label>
                <input value={skinChange} onChange={(e) => setSkinChange(e.target.value)} className="w-full px-3.5 py-2.5 bg-white border rounded-xl" />
              </div>
              <div>
                <label className="block font-bold text-slate-500 mb-1">Underarm Swelling</label>
                <input value={armpitSwelling} onChange={(e) => setArmpitSwelling(e.target.value)} className="w-full px-3.5 py-2.5 bg-white border rounded-xl" />
              </div>
            </div>
          </div>
        )}

        {/* STEP 4 */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3 text-[11px] text-blue-800 font-medium">
              BMI is a general screening indicator and is not a diagnosis.
            </div>
            <h3 className="font-bold text-slate-800 text-sm">Step 4: Measurements &amp; Reports Upload</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-bold text-slate-500 mb-1">Height (cm)</label>
                <input type="number" value={heightCm} onChange={(e) => setHeightCm(e.target.value)} className="w-full px-3.5 py-2.5 bg-white border rounded-xl" />
              </div>
              <div>
                <label className="block font-bold text-slate-500 mb-1">Weight (kg)</label>
                <input type="number" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} className="w-full px-3.5 py-2.5 bg-white border rounded-xl" />
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Calculated BMI</span>
                <p className="text-lg font-black text-slate-800">{bmi.value || "—"} <span className="text-xs font-bold text-primary">({bmi.category})</span></p>
              </div>
            </div>

            <div className="pt-2">
              <label className="block font-bold text-slate-500 mb-1">Optional Report Document Upload</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input value={reportTitle} onChange={(e) => setReportTitle(e.target.value)} placeholder="Report Document Title" className="px-3.5 py-2.5 bg-white border rounded-xl" />
                <select value={reportType} onChange={(e) => setReportType(e.target.value as any)} className="px-3.5 py-2.5 bg-white border rounded-xl">
                  <option value="Mammogram">Mammography report</option>
                  <option value="Ultrasound">Ultrasound report</option>
                  <option value="Pathology">Pathology report</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5 */}
        {currentStep === 5 && (
          <div className="space-y-4">
            <h3 className="font-bold text-slate-800 text-sm">Step 5: Final Review &amp; Doctor Handoff</h3>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <p><strong>Patient Name:</strong> {name} ({age}y)</p>
              <p><strong>Concern:</strong> {concern} ({side} side)</p>
              <p><strong>Measurements:</strong> Height: {heightCm}cm, Weight: {weightKg}kg (BMI: {bmi.value} - {bmi.category})</p>
              <p><strong>Report:</strong> {reportTitle || "No report attached"}</p>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
                Nurse Objective Factual Note *
              </label>
              <textarea
                rows={3}
                value={nurseNote}
                onChange={(e) => setNurseNote(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-xs font-medium resize-none"
              />
            </div>
          </div>
        )}

        {/* Wizard Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentStep === 1}
            className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl font-bold disabled:opacity-40"
          >
            Back
          </button>

          {currentStep < 5 ? (
            <button type="button" onClick={handleNext} className="px-6 py-2.5 bg-primary text-white font-bold rounded-xl flex items-center gap-1">
              Continue <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleSubmitIntake(false)}
                disabled={isSubmitting}
                className="px-4 py-2.5 border border-slate-200 hover:bg-slate-50 font-bold rounded-xl"
              >
                Save Intake
              </button>
              <button
                type="button"
                onClick={() => handleSubmitIntake(true)}
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-primary text-white font-bold rounded-xl flex items-center gap-1 shadow-md shadow-primary/15"
              >
                <Send className="w-3.5 h-3.5" /> Submit &amp; Notify Doctor
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
