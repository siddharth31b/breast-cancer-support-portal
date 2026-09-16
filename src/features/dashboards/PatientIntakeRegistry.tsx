import React, { useState, useMemo, useEffect } from "react";
import { 
  Sparkles, 
  Activity, 
  AlertCircle, 
  Download, 
  Search, 
  ChevronRight, 
  ChevronLeft, 
  Printer, 
  X, 
  FileText, 
  Bot, 
  User
} from "lucide-react";
import { PatientService } from "../../services/patient.service";
import type { PatientRecord } from "../../types/questionnaire";
import simulationDataRaw from "../../mocks/simulation_results_100_subjects.json";
import questionsData from "../../mocks/symptoms_questions.json";

export interface NormalizedIntakePatient {
  id: string;
  name: string;
  age: string | number;
  gender: string;
  source: "MANUAL_PORTAL" | "SIMULATION_CHATBOT";
  cohortLabel: string;
  clinicalArchetype?: string;
  timestamp: string;
  totalScore: number;
  riskTier: "Low" | "Moderate" | "High" | "Urgent";
  brmScore: number;
  symptomScore: number;
  phase1Weighted: number;
  phase2Weighted: number;
  phase3Weighted: number;
  phase2Multiplier: number;
  phase3Multiplier: number;
  overrideTriggered: boolean;
  overrideRuleName: string | null;
  overrideReason: string | null;
  interpretation: string;
  recommendation: string;
  riskProfile: {
    age: string;
    ageAtMarriage: string;
    ageAtFirstChild: string;
    numberOfChildren: string;
    breastfeeding: string;
    contraceptives: string;
    familyHistory: string;
    smoking: string;
    diet: string;
  };
  symptomAnswers: Record<string, "Yes" | "No">;
  positiveSymptoms: string[];
}

export const PatientIntakeRegistry: React.FC = () => {
  const [manualPatients, setManualPatients] = useState<PatientRecord[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<NormalizedIntakePatient | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [tierFilter, setTierFilter] = useState<"ALL" | "Urgent" | "High" | "Moderate" | "Low">("ALL");
  const [sourceFilter, setSourceFilter] = useState<"ALL" | "SIMULATION" | "MANUAL">("ALL");
  const [, setIsLoading] = useState(true);

  // Load manual patients from PatientService
  useEffect(() => {
    async function loadManual() {
      try {
        const patients = await PatientService.getPatients();
        setManualPatients(patients);
      } catch (err) {
        console.warn("Could not load manual patients", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadManual();
  }, []);

  // Convert simulated subjects from JSON into NormalizedIntakePatient format
  const simulatedPatients: NormalizedIntakePatient[] = useMemo(() => {
    const rawList = (simulationDataRaw as any[]) || [];
    return rawList.map((item: any) => {
      const positiveSymptoms = Object.entries(item.symptomAnswers || {})
        .filter(([_, val]) => val === "Yes")
        .map(([key]) => key);

      return {
        id: item.subject_id,
        name: item.patient_name,
        age: item.riskProfile?.age?.replace(/[^0-9]/g, "") || "38",
        gender: "Female",
        source: "SIMULATION_CHATBOT",
        cohortLabel: item.cohort,
        clinicalArchetype: item.clinical_archetype,
        timestamp: item.timestamp,
        totalScore: item.analysis?.totalScore ?? 0,
        riskTier: item.analysis?.tier ?? "Low",
        brmScore: item.analysis?.brm?.score ?? 0,
        symptomScore: item.analysis?.symptomScoring?.totalSymptomScore ?? 0,
        phase1Weighted: item.analysis?.symptomScoring?.phase1Weighted ?? 0,
        phase2Weighted: item.analysis?.symptomScoring?.phase2Weighted ?? 0,
        phase3Weighted: item.analysis?.symptomScoring?.phase3Weighted ?? 0,
        phase2Multiplier: item.analysis?.symptomScoring?.phase2Multiplier ?? 1.2,
        phase3Multiplier: item.analysis?.symptomScoring?.phase3Multiplier ?? 1.3,
        overrideTriggered: !!item.analysis?.override?.triggered,
        overrideRuleName: item.analysis?.override?.ruleName || null,
        overrideReason: item.analysis?.override?.reason || null,
        interpretation: item.analysis?.interpretation || "Clinical assessment completed.",
        recommendation: item.analysis?.recommendation || "Follow routine clinical evaluation.",
        riskProfile: {
          age: item.riskProfile?.age || "Not specified",
          ageAtMarriage: item.riskProfile?.ageAtMarriage || "Not specified",
          ageAtFirstChild: item.riskProfile?.ageAtFirstChild || "Not specified",
          numberOfChildren: item.riskProfile?.numberOfChildren || "0",
          breastfeeding: item.riskProfile?.breastfeeding || "Not specified",
          contraceptives: item.riskProfile?.contraceptives || "None",
          familyHistory: item.riskProfile?.familyHistory || "No family history",
          smoking: item.riskProfile?.smoking || "Never",
          diet: item.riskProfile?.diet || "Balanced"
        },
        symptomAnswers: item.symptomAnswers || {},
        positiveSymptoms
      };
    });
  }, []);

  // Convert manual live portal patients into NormalizedIntakePatient format
  const manualNormalizedPatients: NormalizedIntakePatient[] = useMemo(() => {
    return manualPatients.map((p) => {
      const summary = p.assessmentSession?.summary;
      const risk = summary?.riskAnalysis;
      const rp = summary?.riskProfile;
      const answersList = p.assessmentSession?.answers || [];

      const symptomMap: Record<string, "Yes" | "No"> = {};
      const positiveSymptoms: string[] = [];

      answersList.forEach(a => {
        if (a.questionId.startsWith("sym_") || a.questionId.includes("Symptoms on")) {
          const isYes = a.value === "Yes" || a.value === "yes" || a.value === true;
          symptomMap[a.questionId] = isYes ? "Yes" : "No";
          if (isYes) positiveSymptoms.push(a.label || a.questionId);
        }
      });

      const tier: "Low" | "Moderate" | "High" | "Urgent" =
        risk?.tier ||
        (p.priority === "HIGH" ? "High" : p.priority === "MEDIUM" ? "Moderate" : "Low");

      return {
        id: p.id,
        name: p.name,
        age: p.age,
        gender: p.gender || "Female",
        source: "MANUAL_PORTAL",
        cohortLabel: "Live Patient Portal Intake",
        clinicalArchetype: p.clinicalIntake?.answers?.main_concern?.join(", ") || "Patient-Reported Self Intake",
        timestamp: p.assessmentSession?.completedAt || p.clinicalIntake?.submittedAt || new Date().toISOString(),
        totalScore: risk?.totalScore ?? (positiveSymptoms.length * 2),
        riskTier: tier,
        brmScore: risk?.brmScore ?? 0,
        symptomScore: risk?.symptomScore ?? (positiveSymptoms.length * 2),
        phase1Weighted: risk?.phase1Weighted ?? 0,
        phase2Weighted: risk?.phase2Weighted ?? 0,
        phase3Weighted: risk?.phase3Weighted ?? 0,
        phase2Multiplier: risk?.phase2Multiplier ?? 1.2,
        phase3Multiplier: risk?.phase3Multiplier ?? 1.3,
        overrideTriggered: !!risk?.overrideTriggered,
        overrideRuleName: risk?.overrideTriggered || null,
        overrideReason: risk?.overrideReason || null,
        interpretation: risk?.interpretation || "Live portal intake submitted by patient.",
        recommendation: risk?.recommendation || "Correlate with in-person physical clinical examination.",
        riskProfile: {
          age: rp?.age || String(p.age),
          ageAtMarriage: rp?.ageAtMarriage || "Not specified",
          ageAtFirstChild: rp?.ageAtFirstChild || "Not specified",
          numberOfChildren: rp?.numberOfChildren || "0",
          breastfeeding: rp?.breastfeeding || "Not specified",
          contraceptives: rp?.contraceptives || "None reported",
          familyHistory: rp?.familyHistory || (p.medicalHistory?.familyHistory ? "Yes reported" : "No"),
          smoking: rp?.smoking || "Never smoked",
          diet: rp?.diet || "Standard"
        },
        symptomAnswers: symptomMap,
        positiveSymptoms
      };
    });
  }, [manualPatients]);

  // Combined Dataset
  const allPatients = useMemo(() => {
    return [...manualNormalizedPatients, ...simulatedPatients];
  }, [manualNormalizedPatients, simulatedPatients]);

  // Filtered Dataset
  const filteredPatients = useMemo(() => {
    return allPatients.filter(p => {
      // Source filter
      if (sourceFilter === "SIMULATION" && p.source !== "SIMULATION_CHATBOT") return false;
      if (sourceFilter === "MANUAL" && p.source !== "MANUAL_PORTAL") return false;

      // Tier filter
      if (tierFilter !== "ALL" && p.riskTier !== tierFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = p.name.toLowerCase().includes(q);
        const matchId = p.id.toLowerCase().includes(q);
        const matchArchetype = (p.clinicalArchetype || "").toLowerCase().includes(q);
        const matchOverride = (p.overrideRuleName || "").toLowerCase().includes(q);
        if (!matchName && !matchId && !matchArchetype && !matchOverride) return false;
      }

      return true;
    });
  }, [allPatients, sourceFilter, tierFilter, searchQuery]);

  // Metrics summary
  const metrics = useMemo(() => {
    let urgent = 0, high = 0, moderate = 0, low = 0, overrides = 0;
    allPatients.forEach(p => {
      if (p.riskTier === "Urgent") urgent++;
      else if (p.riskTier === "High") high++;
      else if (p.riskTier === "Moderate") moderate++;
      else low++;
      if (p.overrideTriggered) overrides++;
    });
    return { total: allPatients.length, urgent, high, moderate, low, overrides };
  }, [allPatients]);

  // Navigation helpers for modal
  const currentIndex = selectedPatient 
    ? filteredPatients.findIndex(p => p.id === selectedPatient.id) 
    : -1;
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex >= 0 && currentIndex < filteredPatients.length - 1;

  const handlePrev = () => {
    if (hasPrev) setSelectedPatient(filteredPatients[currentIndex - 1]);
  };
  const handleNext = () => {
    if (hasNext) setSelectedPatient(filteredPatients[currentIndex + 1]);
  };

  return (
    <div className="space-y-6 text-left pb-12">
      {/* ── HEADER & BREADCRUMBS ────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                Clinical Registry
              </span>
              <span className="text-[10px] bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-primary" />
                Adaptive Oncology Triage Database
              </span>
            </div>
            <h1 className="text-xl font-black text-slate-900 mt-2 flex items-center gap-2">
              Patient-Reported Breast Health & Risk Triage Intake
            </h1>
            <p className="text-slate-500 text-xs mt-1">
              Unified registry of patient intakes containing <strong>{allPatients.length} records</strong> (Live portal submissions and 100-subject AI chatbot simulation). Click <strong>Review Intake & Questionnaire</strong> to inspect any patient's clinical document.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <a
              href="/simulation_results_100_subjects.csv"
              download="simulation_results_100_subjects.csv"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl border border-slate-300 shadow-xs transition-all cursor-pointer"
            >
              <Download className="w-4 h-4 text-primary" /> Download 100-Subject CSV
            </a>
            <a
              href="/simulation_results_100_subjects.json"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl border border-slate-300 shadow-xs transition-all cursor-pointer"
            >
              <FileText className="w-4 h-4 text-slate-600" /> View Raw JSON
            </a>
          </div>
        </div>

        {/* ── KPI METRIC CARDS ─────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6">
          <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Intakes</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl font-black text-slate-800">{metrics.total}</span>
              <span className="text-[10px] text-slate-500">records</span>
            </div>
          </div>

          <div className="bg-rose-50/60 border border-rose-200 p-3 rounded-xl">
            <span className="text-[10px] text-rose-700 font-bold uppercase tracking-wider block flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-600" /> Urgent Priority
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl font-black text-rose-700">{metrics.urgent}</span>
              <span className="text-[10px] text-rose-600 font-semibold">({Math.round((metrics.urgent / (metrics.total || 1)) * 100)}%)</span>
            </div>
          </div>

          <div className="bg-amber-50/60 border border-amber-200 p-3 rounded-xl">
            <span className="text-[10px] text-amber-700 font-bold uppercase tracking-wider block flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500" /> High Risk
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl font-black text-amber-700">{metrics.high}</span>
              <span className="text-[10px] text-amber-600 font-semibold">({Math.round((metrics.high / (metrics.total || 1)) * 100)}%)</span>
            </div>
          </div>

          <div className="bg-blue-50/60 border border-blue-200 p-3 rounded-xl">
            <span className="text-[10px] text-blue-700 font-bold uppercase tracking-wider block flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-500" /> Moderate Risk
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl font-black text-blue-700">{metrics.moderate}</span>
              <span className="text-[10px] text-blue-600 font-semibold">({Math.round((metrics.moderate / (metrics.total || 1)) * 100)}%)</span>
            </div>
          </div>

          <div className="bg-emerald-50/60 border border-emerald-200 p-3 rounded-xl">
            <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider block flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-600" /> Low Risk
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl font-black text-emerald-700">{metrics.low}</span>
              <span className="text-[10px] text-emerald-600 font-semibold">({Math.round((metrics.low / (metrics.total || 1)) * 100)}%)</span>
            </div>
          </div>

          <div className="bg-purple-50/60 border border-purple-200 p-3 rounded-xl">
            <span className="text-[10px] text-purple-700 font-bold uppercase tracking-wider block flex items-center gap-1">
              <AlertCircle className="w-3 h-3 text-purple-600" /> Safety Overrides
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl font-black text-purple-700">{metrics.overrides}</span>
              <span className="text-[10px] text-purple-600 font-semibold">fired</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── FILTER & SEARCH TOOLBAR ───────────────────────────────────── */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by patient name, ID (e.g. SIM-PAT-045), symptom, or alert..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Source Filter */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-[11px] font-bold">
            <button
              onClick={() => setSourceFilter("ALL")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${sourceFilter === "ALL" ? "bg-white text-primary shadow-xs font-extrabold" : "text-slate-500 hover:text-slate-800"}`}
            >
              All ({allPatients.length})
            </button>
            <button
              onClick={() => setSourceFilter("SIMULATION")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${sourceFilter === "SIMULATION" ? "bg-white text-primary shadow-xs font-extrabold" : "text-slate-500 hover:text-slate-800"}`}
            >
              <Bot className="w-3 h-3" /> Simulation ({simulatedPatients.length})
            </button>
            <button
              onClick={() => setSourceFilter("MANUAL")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${sourceFilter === "MANUAL" ? "bg-white text-primary shadow-xs font-extrabold" : "text-slate-500 hover:text-slate-800"}`}
            >
              <User className="w-3 h-3" /> Live ({manualNormalizedPatients.length})
            </button>
          </div>

          {/* Tier Filter */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-[11px] font-bold">
            {(["ALL", "Urgent", "High", "Moderate", "Low"] as const).map(t => (
              <button
                key={t}
                onClick={() => setTierFilter(t)}
                className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                  tierFilter === t 
                    ? "bg-white text-slate-900 shadow-xs font-black" 
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {t === "ALL" ? "All Tiers" : t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── PATIENT TABLE DIRECTORY ─────────────────────────────────────── */}
      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div>
            <h3 className="font-extrabold text-slate-800 text-sm">
              Intake Submissions & Triage Queue ({filteredPatients.length})
            </h3>
            <p className="text-[11px] text-slate-400">Click &ldquo;Review Intake &amp; Questionnaire&rdquo; to examine any patient&rsquo;s clinical document.</p>
          </div>
          <span className="text-[11px] font-bold text-slate-500">
            Showing {filteredPatients.length} of {allPatients.length} records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200 text-slate-500 font-extrabold text-[10px] uppercase tracking-wider">
                <th className="py-3 px-4">Subject / Patient</th>
                <th className="py-3 px-3">Intake Mode</th>
                <th className="py-3 px-3">Date Submitted</th>
                <th className="py-3 px-3">Reported Symptoms</th>
                <th className="py-3 px-3">Safety Override</th>
                <th className="py-3 px-3 text-center">Score</th>
                <th className="py-3 px-3">Risk Tier</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    No intake records match your search or filter criteria.
                  </td>
                </tr>
              ) : (
                filteredPatients.map((p) => (
                  <tr 
                    key={p.id} 
                    className="hover:bg-teal-50/20 transition-colors cursor-pointer group"
                    onClick={() => setSelectedPatient(p)}
                  >
                    {/* Subject / Patient Info */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                          p.riskTier === "Urgent" 
                            ? "bg-rose-100 text-rose-800 border border-rose-200" 
                            : p.riskTier === "High"
                            ? "bg-amber-100 text-amber-800 border border-amber-200"
                            : p.riskTier === "Moderate"
                            ? "bg-blue-100 text-blue-800 border border-blue-200"
                            : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                        }`}>
                          {p.name.charAt(0)}
                        </div>
                        <div>
                          <span className="font-extrabold text-slate-900 block group-hover:text-primary transition-colors">
                            {p.name}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {p.id} &middot; Age {p.age} &middot; {p.gender}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Intake Mode */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      {p.source === "SIMULATION_CHATBOT" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                          <Bot className="w-3 h-3" /> AI Chatbot
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                          <User className="w-3 h-3" /> Live Portal
                        </span>
                      )}
                    </td>

                    {/* Date Submitted */}
                    <td className="py-3.5 px-3 text-slate-500 whitespace-nowrap text-[11px]">
                      {new Date(p.timestamp).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric"
                      })}
                    </td>

                    {/* Reported Symptoms */}
                    <td className="py-3.5 px-3 max-w-[220px]">
                      {p.positiveSymptoms.length > 0 ? (
                        <span className="text-slate-800 font-semibold block truncate" title={p.positiveSymptoms.join(", ")}>
                          {p.positiveSymptoms.slice(0, 2).map(s => s.replace(/Symptoms on (Left|Right) Breast – /g, "").replace(/Symptoms on /g, "")).join(", ")}
                          {p.positiveSymptoms.length > 2 ? ` +${p.positiveSymptoms.length - 2} more` : ""}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">No symptoms reported</span>
                      )}
                      <span className="text-[10px] text-slate-400 block truncate" title={p.clinicalArchetype}>
                        {p.clinicalArchetype || "Routine check"}
                      </span>
                    </td>

                    {/* Safety Override Alert */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      {p.overrideTriggered ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-200 shadow-xs">
                          <AlertCircle className="w-3 h-3 text-rose-600" />
                          {p.overrideRuleName?.replace(" Alert", "") || "Override Triggered"}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[10px]">None</span>
                      )}
                    </td>

                    {/* Score */}
                    <td className="py-3.5 px-3 text-center whitespace-nowrap">
                      <span className="font-mono font-black text-slate-800 text-xs">
                        {p.totalScore}
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        BRM: +{p.brmScore}
                      </span>
                    </td>

                    {/* Risk Tier Badge */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wide border inline-flex items-center gap-1 ${
                        p.riskTier === "Urgent" 
                          ? "bg-rose-600 text-white border-rose-700 shadow-xs" 
                          : p.riskTier === "High"
                          ? "bg-amber-500 text-white border-amber-600 shadow-xs"
                          : p.riskTier === "Moderate"
                          ? "bg-blue-600 text-white border-blue-700"
                          : "bg-emerald-600 text-white border-emerald-700"
                      }`}>
                        <Activity className="w-3 h-3" />
                        {p.riskTier.toUpperCase()}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPatient(p);
                        }}
                        className="px-3 py-1.5 bg-primary hover:bg-[#004D46] text-white text-[11px] font-bold rounded-lg transition-all shadow-xs inline-flex items-center gap-1 cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Review Intake &amp; Questionnaire
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 5. FULL DOCUMENT MODAL: PATIENT-REPORTED BREAST HEALTH & RISK TRIAGE INTAKE ── */}
      {selectedPatient && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Top Control Bar */}
            <div className="bg-slate-900 text-white px-6 py-3.5 flex items-center justify-between border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-primary/20 text-primary border border-primary/30 flex items-center justify-center font-black text-xs">
                  {selectedPatient.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-xs font-bold text-slate-100 flex items-center gap-2">
                    Reviewing Intake: <span className="text-white font-extrabold">{selectedPatient.name}</span>
                    <span className="text-slate-400 font-mono">({selectedPatient.id})</span>
                  </h2>
                  <span className="text-[10px] text-slate-400">
                    Record {currentIndex + 1} of {filteredPatients.length} matching subjects
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrev}
                  disabled={!hasPrev}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white text-[11px] font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-3.5 h-3.5" /> Prev
                </button>
                <button
                  onClick={handleNext}
                  disabled={!hasNext}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white text-[11px] font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed"
                >
                  Next <ChevronRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white text-[11px] font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer ml-1"
                >
                  <Printer className="w-3.5 h-3.5" /> Print
                </button>
                <button
                  onClick={() => setSelectedPatient(null)}
                  className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-rose-900/50 hover:text-rose-300 text-slate-400 flex items-center justify-center transition-all cursor-pointer ml-2"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Document Body (Scrollable) */}
            <div className="overflow-y-auto p-6 space-y-6 flex-1 text-left bg-slate-50/30">
              
              {/* DOCUMENT HEADER */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                      Clinical Record
                    </span>
                    <span className="text-[10px] bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-primary" />
                      {selectedPatient.source === "SIMULATION_CHATBOT" ? "AI Phased Triage Intake" : "Portal Intake Document"}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-slate-900 text-lg mt-1.5 flex items-center gap-2">
                    Patient-Reported Breast Health &amp; Risk Triage Intake
                  </h3>
                  <p className="text-slate-500 text-xs mt-0.5">
                    Patient: <strong className="text-slate-800">{selectedPatient.name}</strong> (Age {selectedPatient.age}) &middot; ID: <span className="font-mono">{selectedPatient.id}</span> &middot; Protocol: <strong>Clinical Oncology Triage Algorithm (v2.0)</strong>
                  </p>
                </div>

                <div className="text-left sm:text-right shrink-0">
                  <span className="text-[10px] text-slate-400 block font-semibold uppercase tracking-wider">Date Submitted</span>
                  <span className="text-xs font-bold text-slate-800">
                    {new Date(selectedPatient.timestamp).toLocaleString("en-GB", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true
                    })}
                  </span>
                </div>
              </div>

              {/* 1. EXECUTIVE CLINICAL RISK & STAGING SUMMARY CARD */}
              <div className="bg-gradient-to-br from-white via-slate-50 to-teal-50/20 border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-3.5">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                      AI Care Priority &amp; Risk Classification
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-3 py-1 rounded-full text-xs font-black tracking-wide border flex items-center gap-1.5 ${
                        selectedPatient.riskTier === "Urgent"
                          ? "bg-rose-600 text-white border-rose-700 shadow-sm" 
                          : selectedPatient.riskTier === "High"
                          ? "bg-amber-500 text-white border-amber-600 shadow-sm" 
                          : selectedPatient.riskTier === "Moderate"
                          ? "bg-blue-600 text-white border-blue-700" 
                          : "bg-emerald-600 text-white border-emerald-700"
                      }`}>
                        <Activity className="w-3.5 h-3.5" />
                        {selectedPatient.riskTier.toUpperCase()} PRIORITY ({selectedPatient.riskTier} Risk)
                      </span>
                      <span className="text-xs font-bold text-slate-700">
                        Total Composite Score: <span className="text-primary font-black font-mono">{selectedPatient.totalScore}</span> pts
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[10px]">
                    <div className="bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 shadow-2xs">
                      <span className="text-slate-400 block font-semibold">Phase 0 BRM</span>
                      <strong className="text-slate-800 font-bold">+{selectedPatient.brmScore} pts</strong>
                    </div>
                    <div className="bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 shadow-2xs">
                      <span className="text-slate-400 block font-semibold">Phase 1 (×1.5)</span>
                      <strong className="text-slate-800 font-bold">{selectedPatient.phase1Weighted} pts</strong>
                    </div>
                    <div className="bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 shadow-2xs">
                      <span className="text-slate-400 block font-semibold">Phase 2 (×{selectedPatient.phase2Multiplier})</span>
                      <strong className="text-slate-800 font-bold">{selectedPatient.phase2Weighted} pts</strong>
                    </div>
                    <div className="bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 shadow-2xs">
                      <span className="text-slate-400 block font-semibold">Phase 3 (×{selectedPatient.phase3Multiplier})</span>
                      <strong className="text-slate-800 font-bold">{selectedPatient.phase3Weighted} pts</strong>
                    </div>
                  </div>
                </div>

                {/* Escalation Override Alert */}
                {selectedPatient.overrideTriggered && (
                  <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl space-y-1.5 text-xs">
                    <div className="flex items-center gap-1.5 text-rose-800 font-black uppercase text-[11px] tracking-wider">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>Safety Escalation Override Fired: {selectedPatient.overrideRuleName || "Critical Presentation"}</span>
                    </div>
                    <p className="text-rose-900 font-medium text-[11px] leading-relaxed">
                      {selectedPatient.overrideReason || "A red-flag clinical presentation was detected that escalates this intake directly to Urgent Priority."}
                    </p>
                  </div>
                )}

                {/* Clinical Recommendation & Interpretation */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1 shadow-2xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Clinical Interpretation
                    </span>
                    <p className="text-slate-700 font-medium text-[11px] leading-relaxed">
                      {selectedPatient.interpretation}
                    </p>
                  </div>
                  <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1 shadow-2xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Recommended Action
                    </span>
                    <p className="text-slate-800 font-bold text-[11px] leading-relaxed">
                      {selectedPatient.recommendation}
                    </p>
                  </div>
                </div>
              </div>

              {/* 2. PHASE 0: BASELINE RISK PROFILE & REPRODUCTIVE CONTEXT */}
              <div className="space-y-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-black">0</span>
                    Phase 0: Baseline Risk Profile &amp; Reproductive Context
                  </h4>
                  <span className="text-[10px] text-slate-400 font-semibold">9 Baseline Factor Questions</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                  {[
                    { label: "Patient Age / Group", value: selectedPatient.riskProfile.age },
                    { label: "Age at Marriage", value: selectedPatient.riskProfile.ageAtMarriage },
                    { label: "Age at First Childbirth", value: selectedPatient.riskProfile.ageAtFirstChild },
                    { label: "Number of Children", value: selectedPatient.riskProfile.numberOfChildren },
                    { label: "Breastfeeding History", value: selectedPatient.riskProfile.breastfeeding },
                    { label: "Hormonal Contraceptive Use", value: selectedPatient.riskProfile.contraceptives },
                    { label: "Family History of Cancer", value: selectedPatient.riskProfile.familyHistory },
                    { label: "Smoking Status", value: selectedPatient.riskProfile.smoking },
                    { label: "Diet & Nutrition", value: selectedPatient.riskProfile.diet }
                  ].map((item, idx) => (
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

              {/* 3. PHASE 1: PRIMARY BREAST SCREENING FINDINGS */}
              {(() => {
                const getSymptomState = (name: string) => {
                  return selectedPatient.symptomAnswers[name] === "Yes" ? "Yes" : "No";
                };

                const leftCat = questionsData.find(c => c.category.includes("Left Breast"));
                const rightCat = questionsData.find(c => c.category.includes("Right Breast"));

                const leftCount = (leftCat?.options || []).filter(o => getSymptomState(o.converted_name) === "Yes").length;
                const rightCount = (rightCat?.options || []).filter(o => getSymptomState(o.converted_name) === "Yes").length;

                return (
                  <div className="space-y-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-black">1</span>
                        Phase 1: Primary Breast Screening Findings (Diagnostic Multiplier ×1.5)
                      </h4>
                      <span className="text-[10px] font-bold px-2.5 py-0.5 bg-slate-100 rounded-full text-slate-600">
                        {leftCount + rightCount} Positive Primary Findings
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Left Breast */}
                      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                        <div className="bg-slate-100 px-3.5 py-2 border-b border-slate-200 flex items-center justify-between">
                          <span className="text-xs font-black text-slate-800">Left Breast Symptoms</span>
                          <span className="text-[10px] text-slate-500 font-semibold">{leftCount} Positive</span>
                        </div>
                        <div className="divide-y divide-slate-100 text-xs">
                          {leftCat?.options.map((opt, idx) => {
                            const isYes = getSymptomState(opt.converted_name) === "Yes";
                            return (
                              <div key={idx} className={`px-3.5 py-2 flex items-center justify-between ${isYes ? "bg-rose-50/60" : ""}`}>
                                <div className="flex items-center gap-2">
                                  <span className={`w-1.5 h-1.5 rounded-full ${isYes ? "bg-rose-600" : "bg-slate-300"}`} />
                                  <span className={`font-medium ${isYes ? "font-bold text-slate-900" : "text-slate-700"}`}>
                                    {opt.label.replace(/Symptoms on Left Breast – /g, "")}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                    opt.relevance === "H" ? "bg-rose-100 text-rose-800" : opt.relevance === "M" ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-600"
                                  }`}>
                                    {opt.relevance === "H" ? "High (W3)" : opt.relevance === "M" ? "Med (W2)" : "Low (W1)"}
                                  </span>
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                                    isYes ? "bg-rose-600 text-white" : "bg-slate-100 text-slate-500"
                                  }`}>
                                    {isYes ? "Yes" : "No"}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Right Breast */}
                      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                        <div className="bg-slate-100 px-3.5 py-2 border-b border-slate-200 flex items-center justify-between">
                          <span className="text-xs font-black text-slate-800">Right Breast Symptoms</span>
                          <span className="text-[10px] text-slate-500 font-semibold">{rightCount} Positive</span>
                        </div>
                        <div className="divide-y divide-slate-100 text-xs">
                          {rightCat?.options.map((opt, idx) => {
                            const isYes = getSymptomState(opt.converted_name) === "Yes";
                            return (
                              <div key={idx} className={`px-3.5 py-2 flex items-center justify-between ${isYes ? "bg-rose-50/60" : ""}`}>
                                <div className="flex items-center gap-2">
                                  <span className={`w-1.5 h-1.5 rounded-full ${isYes ? "bg-rose-600" : "bg-slate-300"}`} />
                                  <span className={`font-medium ${isYes ? "font-bold text-slate-900" : "text-slate-700"}`}>
                                    {opt.label.replace(/Symptoms on Right Breast – /g, "")}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                    opt.relevance === "H" ? "bg-rose-100 text-rose-800" : opt.relevance === "M" ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-600"
                                  }`}>
                                    {opt.relevance === "H" ? "High (W3)" : opt.relevance === "M" ? "Med (W2)" : "Low (W1)"}
                                  </span>
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                                    isYes ? "bg-rose-600 text-white" : "bg-slate-100 text-slate-500"
                                  }`}>
                                    {isYes ? "Yes" : "No"}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* 4. PHASE 2: REGIONAL SPREAD SCREENING */}
              {(() => {
                const getSymptomState = (name: string) => selectedPatient.symptomAnswers[name] === "Yes" ? "Yes" : "No";
                const neckCat = questionsData.find(c => c.category.includes("Neck"));
                const armLCat = questionsData.find(c => c.category.includes("Left Arm"));
                const armRCat = questionsData.find(c => c.category.includes("Right Arm"));

                const neckCount = (neckCat?.options || []).filter(o => getSymptomState(o.converted_name) === "Yes").length;
                const armCount = [...(armLCat?.options || []), ...(armRCat?.options || [])].filter(o => getSymptomState(o.converted_name) === "Yes").length;

                return (
                  <div className="space-y-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-black">2</span>
                        Phase 2: Regional Spread Screening (Neck &amp; Axillary Lymph Nodes)
                      </h4>
                      <span className="text-[10px] text-slate-400 font-semibold">{neckCount + armCount} Positive Regional Findings</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Neck Territory */}
                      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                        <div className="bg-slate-100 px-3.5 py-2 border-b border-slate-200 flex items-center justify-between">
                          <span className="text-xs font-black text-slate-800">Neck &amp; Supraclavicular Territory</span>
                          <span className="text-[10px] text-slate-500 font-semibold">{neckCount} Positive</span>
                        </div>
                        <div className="divide-y divide-slate-100 text-xs">
                          {neckCat?.options.map((opt, idx) => {
                            const isYes = getSymptomState(opt.converted_name) === "Yes";
                            return (
                              <div key={idx} className={`px-3.5 py-2 flex items-center justify-between ${isYes ? "bg-rose-50/60" : ""}`}>
                                <span className={`font-medium ${isYes ? "font-bold text-slate-900" : "text-slate-700"}`}>
                                  {opt.label.replace(/Symptoms on Neck – /g, "")}
                                </span>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                                  isYes ? "bg-rose-600 text-white" : "bg-slate-100 text-slate-500"
                                }`}>
                                  {isYes ? "Yes" : "No"}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Axilla & Arm Territory */}
                      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                        <div className="bg-slate-100 px-3.5 py-2 border-b border-slate-200 flex items-center justify-between">
                          <span className="text-xs font-black text-slate-800">Axilla (Armpit) &amp; Arm Territory</span>
                          <span className="text-[10px] text-slate-500 font-semibold">{armCount} Positive</span>
                        </div>
                        <div className="divide-y divide-slate-100 text-xs max-h-80 overflow-y-auto">
                          {[...(armLCat?.options || []), ...(armRCat?.options || [])].map((opt, idx) => {
                            const isYes = getSymptomState(opt.converted_name) === "Yes";
                            return (
                              <div key={idx} className={`px-3.5 py-2 flex items-center justify-between ${isYes ? "bg-rose-50/60" : ""}`}>
                                <span className={`font-medium ${isYes ? "font-bold text-slate-900" : "text-slate-700"}`}>
                                  {opt.label.replace(/Symptoms on (Left|Right) Arm – /g, (m) => m.includes("Left") ? "Left: " : "Right: ")}
                                </span>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                                  isYes ? "bg-rose-600 text-white" : "bg-slate-100 text-slate-500"
                                }`}>
                                  {isYes ? "Yes" : "No"}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* 5. PHASE 3: SYSTEMIC SCREENING */}
              {(() => {
                const getSymptomState = (name: string) => selectedPatient.symptomAnswers[name] === "Yes" ? "Yes" : "No";
                const resCat = questionsData.find(c => c.category.includes("Respiratory"));
                const cnsCat = questionsData.find(c => c.category.includes("CNS"));
                const umsCat = questionsData.find(c => c.category.includes("Muscular"));

                const systemics = [...(resCat?.options || []), ...(cnsCat?.options || []), ...(umsCat?.options || [])];
                const positiveSystemics = systemics.filter(o => getSymptomState(o.converted_name) === "Yes");

                return (
                  <div className="space-y-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-black">3</span>
                        Phase 3: Systemic &amp; Distant Screening (Respiratory, CNS, Musculoskeletal)
                      </h4>
                      <span className="text-[10px] text-slate-400 font-semibold">{positiveSystemics.length} Positive Systemic Findings</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                      {/* Respiratory */}
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
                        <span className="text-[11px] font-black text-slate-800 block border-b border-slate-200 pb-1">
                          Respiratory Territory
                        </span>
                        {resCat?.options.map((opt, i) => {
                          const isYes = getSymptomState(opt.converted_name) === "Yes";
                          return (
                            <div key={i} className="flex items-center justify-between text-[11px]">
                              <span className={isYes ? "font-bold text-rose-800" : "text-slate-600"}>
                                {opt.label.replace(/Respiratory Symptoms – /g, "")}
                              </span>
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-black ${isYes ? "bg-rose-600 text-white" : "bg-slate-200 text-slate-500"}`}>
                                {isYes ? "Yes" : "No"}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {/* CNS */}
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
                        <span className="text-[11px] font-black text-slate-800 block border-b border-slate-200 pb-1">
                          Central Nervous System (CNS)
                        </span>
                        {cnsCat?.options.map((opt, i) => {
                          const isYes = getSymptomState(opt.converted_name) === "Yes";
                          return (
                            <div key={i} className="flex items-center justify-between text-[11px]">
                              <span className={isYes ? "font-bold text-rose-800" : "text-slate-600"}>
                                {opt.label.replace(/CNS Symptoms – /g, "")}
                              </span>
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-black ${isYes ? "bg-rose-600 text-white" : "bg-slate-200 text-slate-500"}`}>
                                {isYes ? "Yes" : "No"}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Musculoskeletal */}
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
                        <span className="text-[11px] font-black text-slate-800 block border-b border-slate-200 pb-1">
                          Musculoskeletal Territory
                        </span>
                        {umsCat?.options.map((opt, i) => {
                          const isYes = getSymptomState(opt.converted_name) === "Yes";
                          return (
                            <div key={i} className="flex items-center justify-between text-[11px]">
                              <span className={isYes ? "font-bold text-rose-800" : "text-slate-600"}>
                                {opt.label.replace(/Under Muscular Skeleton – /g, "")}
                              </span>
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-black ${isYes ? "bg-rose-600 text-white" : "bg-slate-200 text-slate-500"}`}>
                                {isYes ? "Yes" : "No"}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })()}

            </div>

            {/* Modal Bottom Footer */}
            <div className="bg-white px-6 py-3.5 border-t border-slate-200 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">
                  Showing record: <strong className="text-slate-800">{selectedPatient.name}</strong> ({selectedPatient.id})
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedPatient(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  Close Document
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
