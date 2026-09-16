"use client";

import Link from "next/link";
import React from "react";
import { 
  Sparkles, 
  Info, 
  CheckCircle2, 
  HelpCircle, 
  Shield, 
  ChevronRight
} from "lucide-react";
import { mockAIAssessment } from "../../mocks/patient-portal.mock";
import { StatusBadge } from "../../components/patient/StatusBadge";
import { MedicalDisclaimer } from "../../components/patient/MedicalDisclaimer";


export const AIAssessmentPage: React.FC = () => {
  const assessment = mockAIAssessment;

  return (
    <div className="space-y-6">
      {/* Medical Safety Disclaimer */}
      <MedicalDisclaimer variant="ai" />

      {/* Main AI Summary Header Card */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-slate-800">AI Screening Pipeline Assessment</h2>
                <StatusBadge status={assessment.riskLevel} />
              </div>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                Model: <strong>{assessment.modelVersion}</strong> • Evaluated on {new Date(assessment.performedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">AI Confidence Metric</span>
            <span className="text-xl font-black text-slate-800">{assessment.overallConfidence}%</span>
          </div>
        </div>

        {/* Preliminary Finding Summary Notice (Patient Safe Language) */}
        <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 flex gap-3 items-start">
          <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 leading-relaxed">
            <p className="font-bold mb-0.5">Screening Status: Findings Require Clinical Correlation</p>
            Preliminary AI image analysis identified localized tissue density patterns. This result is <strong>not a diagnosis</strong> and must be confirmed by your assigned oncologist during clinical review.
          </div>
        </div>

        {/* Heatmap & Image Region Analysis Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Heatmap Mock View */}
          <div className="bg-slate-900 rounded-2xl p-4 text-white flex flex-col items-center justify-center relative min-h-[220px] overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-900/40 via-slate-900 to-indigo-950/60" />
            <div className="relative z-10 text-center space-y-2">
              <div className="w-16 h-16 rounded-full border-2 border-dashed border-amber-400/80 bg-amber-500/20 flex items-center justify-center mx-auto animate-pulse">
                <span className="text-[10px] font-bold text-amber-300">Region A</span>
              </div>
              <p className="text-xs font-bold text-slate-200">AI Highlighted Region of Interest</p>
              <p className="text-[10px] text-slate-400">Upper outer quadrant density anomaly detected</p>
            </div>
            <span className="absolute bottom-3 left-3 text-[9px] font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-md">
              Confidence Overlay: 74%
            </span>
          </div>

          {/* Key Observations List */}
          <div className="space-y-4">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Key AI Observations</h3>
            <ul className="space-y-2.5">
              {assessment.keyObservations.map((obs, i) => (
                <li key={i} className="flex items-start gap-2.5 text-xs text-slate-700 leading-relaxed font-medium">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>{obs}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Explainability & Limitations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Why this result? */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs space-y-3">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-primary" />
            Explainability — Why This Result?
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            The AI model analyses digital mammography features against millions of trained clinical data points. It detected asymmetric soft tissue density in the left upper outer region. Dense tissue can mask underlying structures, which is why the model flags this for specialist evaluation.
          </p>
        </div>

        {/* AI Limitations */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs space-y-3">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Shield className="w-4 h-4 text-amber-500" />
            What the AI Cannot Determine
          </h3>
          <ul className="space-y-2">
            {assessment.limitations.map((lim, i) => (
              <li key={i} className="text-xs text-slate-500 leading-relaxed flex items-start gap-2 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0 mt-1.5" />
                <span>{lim}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Recommended Next Step Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md flex items-center justify-between gap-4 flex-wrap">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400 block mb-1">Recommended Next Step</span>
          <p className="text-sm font-bold">{assessment.recommendedNextStep}</p>
        </div>
        <Link href="/patient/screening/review"
          className="px-4 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-2"
        >
          View Doctor Review <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
