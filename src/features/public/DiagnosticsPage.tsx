"use client";

import Link from "next/link";
import React from "react";

import {
  Activity,
  Scan,
  BrainCircuit,
  Eye,
  Stethoscope,
  Users,
  CheckCircle,
  ArrowRight,
  Shield,
  AlertTriangle,
  Play,
  Heart
} from "lucide-react";

export const DiagnosticsPage: React.FC = () => {
  return (
    <div className="bg-white text-slate-800 overflow-x-hidden min-h-screen">
      
      {/* ── A. DIAGNOSTICS HERO ────────────────────────────────────────────── */}
      <section className="relative min-h-[70vh] gradient-hero flex flex-col justify-center pt-12 pb-20 px-6 border-b border-slate-100" aria-label="Diagnostics Overview">
        <div className="max-w-7xl mx-auto w-full relative z-10">
          <div className="max-w-3xl space-y-6">
            
            <div className="inline-flex items-center gap-2 bg-white/90 border border-slate-200 rounded-full px-4 py-2 shadow-xs hover:border-primary/30 transition-all duration-300 cursor-default">
              <Activity className="w-4 h-4 text-primary" />
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Clinical Workflow & Capability Platform</span>
            </div>

            <h1 className="text-display text-slate-900 leading-tight">
              From screening information<br />
              <span className="text-primary">to clinician-reviewed insight.</span>
            </h1>

            <p className="text-lg text-slate-600 font-normal leading-relaxed max-w-2xl">
              NariSetu AI supports end-to-end breast screening pathways by integrating patient risk intake, DICOM scan management, explainable AI pre-analysis, and doctor validation into a unified digital environment.
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              <Link href="/login" className="px-6 py-3.5 bg-primary hover:bg-primary-hover text-white font-semibold rounded-2xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all text-xs flex items-center gap-2 focus-ring">
                Begin Your Journey <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/login" className="px-6 py-3.5 bg-white border border-slate-200 text-slate-700 font-semibold rounded-2xl hover:border-primary/40 hover:text-primary hover:shadow-md hover:-translate-y-0.5 transition-all text-xs flex items-center gap-2 focus-ring">
                <Play className="w-3.5 h-3.5 fill-current" /> Sign In to Portal
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* ── B. SUPPORTED WORKFLOW TIMELINE ─────────────────────────────────── */}
      <section className="py-24 px-6 bg-slate-50/50 border-b border-slate-100" aria-label="Supported Diagnostic Workflow">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold text-primary uppercase tracking-widest">End-to-End Pathway</span>
            <h2 className="text-headline text-slate-900">Supported Diagnostic Pathway</h2>
            <p className="text-slate-500 text-sm leading-relaxed">
              Structured stages connecting patients, community health workers, and specialist physicians.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { num: "01", stage: "Awareness & Intake", desc: "Symptom recording & digital health questionnaire.", icon: Heart, color: "text-rose-500", bg: "bg-rose-50" },
              { num: "02", stage: "Risk Assessment", desc: "Patient risk profile & BI-RADS history logging.", icon: Activity, color: "text-orange-500", bg: "bg-orange-50" },
              { num: "03", stage: "Report & Scan Upload", desc: "Encrypted DICOM mammogram or PDF report ingestion.", icon: Scan, color: "text-amber-600", bg: "bg-amber-50" },
              { num: "04", stage: "AI-Assisted Analysis", desc: "Neural processing & spatial density region identification.", icon: BrainCircuit, color: "text-teal-600", bg: "bg-teal-50" },
              { num: "05", stage: "Explainability Output", desc: "Calibrated confidence scores & spatial heatmap overlays.", icon: Eye, color: "text-violet-600", bg: "bg-violet-50" },
              { num: "06", stage: "Clinical Review", desc: "Certified radiologist review, annotation, & report sign-off.", icon: Stethoscope, color: "text-blue-600", bg: "bg-blue-50" },
              { num: "07", stage: "Appointment Booking", desc: "Telehealth or in-person specialist consult scheduling.", icon: Users, color: "text-indigo-600", bg: "bg-indigo-50" },
              { num: "08", stage: "Care Guidance", desc: "Validated patient report delivery & long-term follow-up plan.", icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50" },
            ].map((wf, i) => {
              const Icon = wf.icon;
              return (
                <div key={i} className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-lg hover:border-primary/30 hover:-translate-y-1 transition-all duration-300 space-y-3 group">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-slate-400 group-hover:text-primary uppercase tracking-widest transition-colors duration-200">Stage {wf.num}</span>
                    <div className={`w-8 h-8 rounded-lg ${wf.bg} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className={`w-4 h-4 ${wf.color}`} />
                    </div>
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm group-hover:text-primary transition-colors duration-200">{wf.stage}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-normal">{wf.desc}</p>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ── C. DIAGNOSTIC CAPABILITIES ─────────────────────────────────────── */}
      <section className="py-24 px-6 bg-white border-b border-slate-100" aria-label="Diagnostic Capabilities">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold text-primary uppercase tracking-widest">Platform Modalities</span>
            <h2 className="text-headline text-slate-900">Diagnostic Capabilities</h2>
            <p className="text-slate-500 text-sm leading-relaxed">
              Transparent capability status across imaging modalities and document analysis workflows.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: "Mammography Workflow Support", status: "Available", badge: "bg-emerald-50 text-emerald-700 border-emerald-200", desc: "DICOM ingestion, AI spatial heatmaps, & radiologist review interface." },
              { name: "Breast Ultrasound Support", status: "Pilot Phase", badge: "bg-amber-50 text-amber-700 border-amber-200", desc: "Structured report parsing & lesion classification assistance." },
              { name: "Breast MRI Report Support", status: "Planned", badge: "bg-slate-100 text-slate-600 border-slate-200", desc: "Volumetric segmentation & multi-sequence evaluation framework." },
              { name: "Pathology & Biopsy Support", status: "Planned", badge: "bg-slate-100 text-slate-600 border-slate-200", desc: "Histopathology report aggregation & clinical correlation." },
              { name: "Risk-Questionnaire Insights", status: "Available", badge: "bg-emerald-50 text-emerald-700 border-emerald-200", desc: "Standardized Gail & Tyrer-Cuzick risk factor calculation intake." },
              { name: "Clinical History Aggregation", status: "Available", badge: "bg-emerald-50 text-emerald-700 border-emerald-200", desc: "Longitudinal record history linking past screenings with current results." },
              { name: "AI-Generated Findings", status: "Available", badge: "bg-emerald-50 text-emerald-700 border-emerald-200", desc: "Pre-analysis density observations formatted for physician validation." },
              { name: "Doctor-Reviewed Summaries", status: "Available", badge: "bg-emerald-50 text-emerald-700 border-emerald-200", desc: "Final validated diagnostic summary signed off by certified clinicians." },
            ].map((cap, i) => (
              <div key={i} className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:bg-white hover:border-primary/30 shadow-2xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 space-y-3 flex flex-col justify-between group">
                <div className="space-y-2">
                  <span className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${cap.badge}`}>
                    {cap.status}
                  </span>
                  <h4 className="font-bold text-slate-900 text-sm group-hover:text-primary transition-colors duration-200">{cap.name}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed font-normal">{cap.desc}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── D. AI ASSESSMENT EXPLANATION ──────────────────────────────────── */}
      <section className="py-24 px-6 bg-slate-50/50 border-b border-slate-100" aria-label="AI Assessment Transparency">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold text-violet-600 uppercase tracking-widest">Clinical Transparency</span>
            <h2 className="text-headline text-slate-900">Understanding AI Assessment Outputs</h2>
            <p className="text-slate-500 text-sm leading-relaxed">
              Clear clinical boundaries defining how artificial intelligence models assist—rather than replace—medical evaluations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "Confidence Is Not Certainty",
                desc: "Numerical AI confidence scores represent statistical model probability based on training data. They do not equal clinical certainty."
              },
              {
                title: "Highlighted Regions Require Expertise",
                desc: "Spatial heatmap highlights denote areas of tissue density interest. They must be evaluated by a certified radiologist."
              },
              {
                title: "Output Is Strictly Advisory",
                desc: "All AI model findings serve purely as advisory pre-analysis. The final report is always signed by a qualified doctor."
              },
              {
                title: "Mandatory Clinical Review",
                desc: "No patient receives unverified AI recommendations. A physician must inspect, edit, or approve all findings."
              },
              {
                title: "Quality Affects Analysis",
                desc: "Low-resolution scans or motion artifacts can impair AI pre-analysis. Low-quality uploads are flagged for re-scanning."
              },
              {
                title: "Follow-Up Testing May Be Needed",
                desc: "Initial screening observations may require follow-up diagnostic ultrasound, MRI, or biopsy as advised by clinicians."
              },
            ].map((exp, i) => (
              <div key={i} className="p-6 rounded-2xl bg-white border border-slate-200/80 hover:border-violet-300/80 shadow-2xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 space-y-2 group">
                <Shield className="w-5 h-5 text-violet-600 mb-2 group-hover:scale-110 transition-transform duration-300" />
                <h4 className="font-bold text-slate-900 text-sm group-hover:text-violet-700 transition-colors duration-200">{exp.title}</h4>
                <p className="text-xs text-slate-500 leading-relaxed font-normal">{exp.desc}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── E. PATIENT VS CLINICIAN VIEWS ──────────────────────────────────── */}
      <section className="py-24 px-6 bg-white border-b border-slate-100" aria-label="Role-Tailored Views">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold text-primary uppercase tracking-widest">Tailored Interfaces</span>
            <h2 className="text-headline text-slate-900">Patient & Clinician Experience Views</h2>
            <p className="text-slate-500 text-sm leading-relaxed">
              Information is presented thoughtfully to ensure clarity for patients and high-density precision for medical specialists.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Patient Experience Card */}
            <div className="p-8 rounded-3xl bg-slate-50 hover:bg-white border border-slate-200/80 hover:border-rose-200 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 space-y-6 group">
              <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
                <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 font-bold group-hover:scale-110 group-hover:bg-rose-100 transition-all duration-300">
                  <Heart className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base group-hover:text-rose-600 transition-colors duration-200">Patient Experience View</h3>
                  <p className="text-xs text-slate-500">Reassuring, accessible, & plain-language</p>
                </div>
              </div>
              <ul className="space-y-3 text-xs text-slate-600 font-medium">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Plain-language summary of validated doctor findings</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Clear next-step recommendations & follow-up timeline</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Direct appointment booking with assigned care team</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Secure access to clinician-signed PDF reports</span>
                </li>
              </ul>
            </div>

            {/* Clinician Experience Card */}
            <div className="p-8 rounded-3xl bg-slate-900 hover:bg-slate-950 text-white border border-slate-800 hover:border-teal-500/30 shadow-xl hover:shadow-2xl transition-all duration-300 space-y-6 group">
              <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                <div className="w-10 h-10 rounded-xl bg-teal-950 border border-teal-800 flex items-center justify-center text-teal-400 font-bold group-hover:scale-110 transition-all duration-300">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-100 text-base group-hover:text-teal-400 transition-colors duration-200">Clinician Workstation View</h3>
                  <p className="text-xs text-slate-400">High-density DICOM diagnostic controls</p>
                </div>
              </div>
              <ul className="space-y-3 text-xs text-slate-300 font-medium">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                  <span>Structured BI-RADS pre-analysis & spatial density heatmaps</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                  <span>Full doctor override authority to adjust or reject AI findings</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                  <span>Longitudinal comparison with prior patient screening records</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                  <span>Comprehensive audit trail recording every clinical action</span>
                </li>
              </ul>
            </div>

          </div>

        </div>
      </section>

      {/* ── F. SAFETY AND LIMITATIONS BANNER ──────────────────────────────── */}
      <section className="py-16 px-6 bg-amber-50/60 border-b border-amber-200/80 hover:bg-amber-50 hover:border-amber-300 hover:shadow-md transition-all duration-300" aria-label="Clinical Disclaimer & Limitations">
        <div className="max-w-5xl mx-auto space-y-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0" />
            <h3 className="font-bold text-slate-900 text-base">Important Medical Disclaimer & Platform Boundaries</h3>
          </div>
          <div className="text-xs text-slate-700 leading-relaxed space-y-2 font-normal">
            <p>
              • <strong className="font-semibold text-slate-900">Not a Replacement for Medical Advice:</strong> NariSetu AI does not replace a qualified physician or healthcare professional.
            </p>
            <p>
              • <strong className="font-semibold text-slate-900">No Emergency Diagnostics:</strong> This platform must not be used for emergency diagnostic evaluation or acute medical crises.
            </p>
            <p>
              • <strong className="font-semibold text-slate-900">Comprehensive Clinical Context:</strong> Artificial intelligence outputs must be interpreted alongside full patient clinical history, physical examination, and appropriate diagnostic testing.
            </p>
            <p>
              • <strong className="font-semibold text-slate-900">Symptom Advisory:</strong> A low-risk or benign AI observation does not eliminate the need for professional medical evaluation when physical symptoms or clinical concerns exist.
            </p>
          </div>
        </div>
      </section>

      {/* ── G. DIAGNOSTICS CTA ─────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-slate-900 text-white" aria-label="Get Started">
        <div className="max-w-4xl mx-auto text-center space-y-8 p-8 rounded-3xl border border-slate-800 hover:border-slate-700 shadow-xl hover:shadow-2xl transition-all duration-300">
          <h2 className="text-display text-white">Ready to explore NariSetu AI?</h2>
          <p className="text-slate-400 text-base leading-relaxed max-w-xl mx-auto">
            Experience structured screening pathways and explainable clinical decision support.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/login" className="px-8 py-4 bg-primary hover:bg-primary-hover text-white font-semibold rounded-2xl text-xs transition-all shadow-md hover:shadow-xl hover:-translate-y-0.5 flex items-center gap-2 focus-ring">
              Begin Your Journey <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/login" className="px-8 py-4 bg-slate-800 border border-slate-700 text-slate-200 font-semibold rounded-2xl hover:border-slate-500 hover:shadow-md hover:-translate-y-0.5 transition-all text-xs focus-ring">
              Sign In to Portal
            </Link>
            <Link href="/research" className="px-8 py-4 bg-slate-800 border border-slate-700 text-slate-200 font-semibold rounded-2xl hover:border-slate-500 hover:shadow-md hover:-translate-y-0.5 transition-all text-xs focus-ring">
              Learn About Research
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};
