"use client";

import Link from "next/link";
import React from "react";

import {
  Eye,
  Stethoscope,
  ArrowRight,
  CheckCircle,
  FileCheck,
  BrainCircuit,
  Lock,
  BookOpen,
  Building2,
  Users,
  Search,
  Activity,
  Award,
  ExternalLink,
  Shield
} from "lucide-react";

export const ResearchPage: React.FC = () => {
  return (
    <div className="bg-white text-slate-800 overflow-x-hidden min-h-screen">
      
      {/* ── A. RESEARCH HERO ────────────────────────────────────────────────── */}
      <section className="relative min-h-[75vh] gradient-hero flex flex-col justify-center pt-12 pb-20 px-6 border-b border-slate-100" aria-label="Research Introduction">
        <div className="max-w-7xl mx-auto w-full relative z-10">
          <div className="max-w-3xl space-y-6">
            
            {/* Eyebrow badge */}
            <div className="inline-flex items-center gap-2 bg-white/90 border border-slate-200 rounded-full px-4 py-2 shadow-xs hover:border-primary/30 transition-all duration-300 cursor-default">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Clinical AI Research & Decision Support</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-display text-slate-900 leading-tight">
              Advancing explainable AI<br />
              <span className="text-primary">for breast screening.</span>
            </h1>

            {/* Supporting Copy */}
            <p className="text-lg text-slate-600 font-normal leading-relaxed max-w-2xl">
              NariSetu AI is an artificial intelligence research and clinical decision-support platform designed to assist healthcare professionals in evaluating breast imaging through transparent, interpretable model outputs and structured clinical workflows.
            </p>

            {/* Contextual Badges */}
            <div className="flex flex-wrap gap-2 pt-2">
              {[
                "Explainable AI",
                "Clinical Decision Support",
                "Breast Imaging Research",
                "Doctor Validation",
                "Responsible Healthcare AI",
              ].map((tag, i) => (
                <span key={i} className="text-xs font-semibold px-3.5 py-1.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200/80 hover:bg-white hover:border-primary/40 hover:shadow-xs transition-all duration-200 cursor-default">
                  {tag}
                </span>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 pt-4">
              <a href="#objectives" className="px-6 py-3.5 bg-primary hover:bg-primary-hover text-white font-semibold rounded-2xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all text-xs flex items-center gap-2 focus-ring">
                Explore Objectives <ArrowRight className="w-4 h-4" />
              </a>
              <Link href="/diagnostics" className="px-6 py-3.5 bg-white border border-slate-200 text-slate-700 font-semibold rounded-2xl hover:border-primary/40 hover:text-primary hover:shadow-md hover:-translate-y-0.5 transition-all text-xs flex items-center gap-2 focus-ring">
                View Diagnostics Capabilities
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* ── B. RESEARCH OBJECTIVES ─────────────────────────────────────────── */}
      <section id="objectives" className="py-24 px-6 bg-slate-50/50 border-b border-slate-100" aria-label="Research Objectives">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold text-primary uppercase tracking-widest">Scientific Pillars</span>
            <h2 className="text-headline text-slate-900">Key Research Objectives</h2>
            <p className="text-slate-500 text-sm leading-relaxed">
              Developing interpretable computational methods to support screening accuracy, reduce cognitive burden, and promote equitable clinical access.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Early Screening Support",
                desc: "Investigating vision transformer architectures to assist in detecting subtle tissue density variations in screening mammography.",
                icon: Search,
                color: "text-teal-600",
                bg: "bg-teal-50",
                border: "border-teal-200"
              },
              {
                title: "Explainable Model Outputs",
                desc: "Generating spatial heatmap visualizations and confidence intervals so clinicians can verify the visual evidence behind predictions.",
                icon: Eye,
                color: "text-violet-600",
                bg: "bg-violet-50",
                border: "border-violet-200"
              },
              {
                title: "Clinician-in-the-Loop Validation",
                desc: "Embedding mandatory specialist review and override capabilities into the diagnostic workflow before final clinical sign-off.",
                icon: Stethoscope,
                color: "text-blue-600",
                bg: "bg-blue-50",
                border: "border-blue-200"
              },
              {
                title: "Accessible Digital Healthcare",
                desc: "Designing lightweight browser-accessible tools to enable community health workers and remote clinics to submit scans for specialist review.",
                icon: Building2,
                color: "text-emerald-600",
                bg: "bg-emerald-50",
                border: "border-emerald-200"
              },
              {
                title: "Structured Patient Pathways",
                desc: "Standardizing screening recommendations according to BI-RADS guidelines to ensure clear follow-up care plans for every patient.",
                icon: Activity,
                color: "text-amber-600",
                bg: "bg-amber-50",
                border: "border-amber-200"
              },
              {
                title: "Research-Ready Insights",
                desc: "Facilitating anonymized cohort statistics to benchmark AI performance across demographic and imaging equipment variations.",
                icon: BookOpen,
                color: "text-indigo-600",
                bg: "bg-indigo-50",
                border: "border-indigo-200"
              },
            ].map((obj, i) => {
              const Icon = obj.icon;
              return (
                <div key={i} className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-lg hover:border-primary/30 hover:-translate-y-1 transition-all duration-300 space-y-4 group">
                  <div className={`w-11 h-11 rounded-xl ${obj.bg} ${obj.border} border flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`w-5.5 h-5.5 ${obj.color}`} />
                  </div>
                  <h3 className="font-bold text-slate-900 text-base group-hover:text-primary transition-colors duration-200">{obj.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-normal">{obj.desc}</p>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ── C. RESEARCH METHODOLOGY ────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-white border-b border-slate-100" aria-label="Research Methodology">
        <div className="max-w-7xl mx-auto space-y-16">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold text-primary uppercase tracking-widest">Workflow Architecture</span>
            <h2 className="text-headline text-slate-900">Research & Evaluation Workflow</h2>
            <p className="text-slate-500 text-sm leading-relaxed">
              Every case passes through a multi-stage review process ensuring clinical oversight at every step.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-7 gap-4 relative">
            {[
              { step: "01", name: "Data Intake", desc: "Encrypted upload of scan or report", icon: Lock },
              { step: "02", name: "Preprocessing", desc: "Quality checks & DICOM parsing", icon: Shield },
              { step: "03", name: "AI Analysis", desc: "Neural model density evaluation", icon: BrainCircuit },
              { step: "04", name: "Explainability", desc: "Heatmap & spatial highlight generation", icon: Eye },
              { step: "05", name: "Specialist Review", desc: "Radiologist/Doctor sign-off", icon: Stethoscope },
              { step: "06", name: "Feedback Loop", desc: "Clinical annotation & validation", icon: FileCheck },
              { step: "07", name: "Workflow Evaluation", desc: "Ongoing model & safety monitoring", icon: Award },
            ].map((st, i) => {
              const Icon = st.icon;
              return (
                <div key={i} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 hover:bg-white hover:border-primary/40 shadow-2xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 text-center space-y-2 relative group">
                  <span className="text-[10px] font-mono font-bold text-primary bg-primary/10 group-hover:bg-primary group-hover:text-white px-2 py-0.5 rounded-full transition-colors duration-300">{st.step}</span>
                  <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 group-hover:border-primary/30 flex items-center justify-center mx-auto text-slate-700 group-hover:text-primary transition-colors duration-300">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-slate-900 text-xs group-hover:text-primary transition-colors duration-200">{st.name}</h4>
                  <p className="text-[10px] text-slate-500 leading-tight">{st.desc}</p>
                </div>
              );
            })}
          </div>

          <div className="p-5 rounded-2xl bg-teal-50/60 border border-teal-200/80 hover:bg-teal-50 hover:border-teal-300 hover:shadow-md transition-all duration-300 flex items-start gap-4 max-w-3xl mx-auto">
            <CheckCircle className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
            <p className="text-xs text-teal-900 leading-relaxed font-medium">
              <strong className="font-bold">Human-in-the-Loop Mandate:</strong> Specialist physician review and validation is required for every report. AI outputs serve solely as advisory clinical decision support.
            </p>
          </div>

        </div>
      </section>

      {/* ── D. EXPLAINABILITY ──────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-slate-50/50 border-b border-slate-100" aria-label="Explainability Framework">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            <div className="space-y-6">
              <span className="text-xs font-bold text-violet-600 uppercase tracking-widest">Model Interpretability</span>
              <h2 className="text-headline text-slate-900">Explainable AI Framework</h2>
              <p className="text-slate-600 text-sm leading-relaxed">
                Black-box AI models are unsuitable for medical diagnostics. NariSetu AI emphasizes transparent explainability, allowing clinicians to inspect spatial heatmaps, confidence intervals, and reasoning factors.
              </p>

              <div className="space-y-3 pt-2">
                {[
                  { label: "Highlighted Regions of Interest", detail: "Visual heatmaps overlaying suspicious tissue density areas." },
                  { label: "Calibrated Confidence Measures", detail: "Numerical confidence bounds benchmarked against clinical standards." },
                  { label: "Structured Clinical Observations", detail: "Standardized BI-RADS classification proposals for physician review." },
                  { label: "Explicit Model Limitations", detail: "Automatic warnings for low-resolution or sub-optimal quality scans." },
                  { label: "Doctor Override Authority", detail: "Clinicians maintain full control to amend, override, or reject AI outputs." },
                  { label: "Complete Auditability", detail: "Immutable audit logs recording every step from AI scan analysis to physician sign-off." },
                ].map((item, i) => (
                  <div key={i} className="p-3.5 rounded-xl bg-white border border-slate-200/70 hover:border-violet-300/80 hover:shadow-xs hover:-translate-y-0.5 transition-all duration-200 flex items-start gap-3">
                    <CheckCircle className="w-4 h-4 text-violet-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">{item.label}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">{item.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-slate-900 text-white space-y-6 shadow-xl hover:shadow-2xl border border-slate-800 hover:border-slate-700 transition-all duration-300">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-teal-400" />
                  <span className="font-bold text-sm text-slate-200">Explainability Visualiser</span>
                </div>
                <span className="text-[10px] font-mono text-teal-400 bg-teal-950/80 px-2 py-0.5 rounded border border-teal-800">Demo Prototype</span>
              </div>

              <div className="space-y-4 text-xs text-slate-300">
                <div className="p-4 rounded-xl bg-slate-850 border border-slate-800 hover:border-slate-700 transition-colors space-y-2">
                  <div className="flex justify-between font-mono text-[10px] text-slate-400">
                    <span>Target Anomaly</span>
                    <span>Left Upper Outer Quadrant</span>
                  </div>
                  <p className="font-semibold text-slate-200">Spatial Heatmap Density Score: 0.84</p>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-teal-400 h-full w-[84%]" />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-850 border border-slate-800 hover:border-slate-700 transition-colors space-y-2">
                  <div className="flex justify-between font-mono text-[10px] text-slate-400">
                    <span>BI-RADS Classification Proposal</span>
                    <span>Category 2 (Benign)</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">Reasoning: Well-circumscribed calcification pattern without architectural distortion.</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-850 border border-slate-800 text-[11px] text-emerald-400 font-medium">
                  ✓ Doctor Override Status: Clinician Verified by Dr. Sarah Iyer
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ── E. CLINICAL VALIDATION FRAMEWORK ──────────────────────────────── */}
      <section className="py-24 px-6 bg-white border-b border-slate-100" aria-label="Clinical Validation">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold text-primary uppercase tracking-widest">Quality & Rigor</span>
            <h2 className="text-headline text-slate-900">Clinical Validation Framework</h2>
            <p className="text-slate-500 text-sm leading-relaxed">
              Evaluating AI model reliability through structured validation protocols and specialist benchmark comparisons.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Dataset Evaluation", desc: "Rigorous benchmarking across multi-center screening cohorts." },
              { title: "Expert Comparison", desc: "Comparing model observations with multi-reader specialist agreement." },
              { title: "Sensitivity & Specificity Analysis", desc: "Evaluating trade-offs between true positive and false positive rates." },
              { title: "Agreement Benchmarking", desc: "Measuring inter-observer reliability against established BI-RADS scales." },
              { title: "Bias Assessment", desc: "Monitoring performance stability across patient demographics and hardware." },
              { title: "Data-Quality Review", desc: "Detecting artifact interference and image degradation automatically." },
              { title: "Human Oversight", desc: "Ensuring clinicians retain ultimate decision authority on every diagnosis." },
              { title: "Pilot Evaluation", desc: "Assessing workflow integration efficiency in real-world clinical environments." },
            ].map((v, i) => (
              <div key={i} className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:bg-white hover:border-primary/30 shadow-2xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300 space-y-2 group">
                <span className="w-6 h-6 rounded-full bg-primary/10 group-hover:bg-primary group-hover:text-white text-primary text-xs font-bold flex items-center justify-center mb-3 transition-colors duration-300">✓</span>
                <h4 className="font-bold text-slate-900 text-xs group-hover:text-primary transition-colors duration-200">{v.title}</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── F. RESPONSIBLE AI ──────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-slate-50/50 border-b border-slate-100" aria-label="Responsible AI Principles">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Ethical Governance</span>
            <h2 className="text-headline text-slate-900">Responsible AI Principles</h2>
            <p className="text-slate-500 text-sm leading-relaxed">
              Adhering to strict standards of patient privacy, data governance, and ethical artificial intelligence deployment.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: "Data Privacy", desc: "De-identification & zero unencrypted storage." },
              { label: "Informed Consent", desc: "Patient control over data usage permissions." },
              { label: "Data Minimisation", desc: "Collecting only essential diagnostic parameters." },
              { label: "Transparent Explainability", desc: "No black-box predictions; full visual reasoning." },
              { label: "Algorithmic Fairness", desc: "Continuous monitoring for demographic bias." },
              { label: "Enterprise Security", desc: "Role-based access controls and audit trails." },
              { label: "Clinical Oversight", desc: "Mandatory doctor validation before report delivery." },
              { label: "Human Accountability", desc: "Clear clinical responsibility hierarchy." },
            ].map((p, i) => (
              <div key={i} className="p-4 rounded-xl bg-white border border-slate-200/70 hover:border-indigo-300/80 shadow-2xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 space-y-1 text-center group cursor-default">
                <p className="font-bold text-xs text-slate-900 group-hover:text-indigo-700 transition-colors duration-200">{p.label}</p>
                <p className="text-[10px] text-slate-500">{p.desc}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── G. PUBLICATIONS & UPDATES ──────────────────────────────────────── */}
      <section className="py-24 px-6 bg-white border-b border-slate-100" aria-label="Publications and Updates">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold text-primary uppercase tracking-widest">Scientific Output</span>
            <h2 className="text-headline text-slate-900">Research Publications & Updates</h2>
            <p className="text-slate-500 text-sm leading-relaxed">
              Documenting research progress, pilot study outcomes, and technical evaluation reports.
            </p>
          </div>

          <div className="space-y-4 max-w-4xl mx-auto">
            {[
              {
                title: "Explainable Vision Transformers for Breast Screening Density Evaluation",
                type: "Technical Report",
                status: "Under Preparation",
                date: "2026",
                desc: "An architectural review of attention-based spatial heatmaps in DICOM mammography analysis."
              },
              {
                title: "Clinical Decision Support Workflows in Resource-Constrained Environments",
                type: "Pilot Study Report",
                status: "Internal Evaluation",
                date: "2025",
                desc: "Evaluating digital screening intake and specialist review efficiency across rural health centers."
              },
              {
                title: "Human-in-the-Loop AI Governance in Diagnostic Mammography",
                type: "Conference Poster",
                status: "Accepted Presentation",
                date: "2025",
                desc: "Frameworks for doctor override integration and audit trail logging in clinical decision support."
              },
            ].map((pub, i) => (
              <div key={i} className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:bg-white hover:border-primary/30 shadow-2xs hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-4 group">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-primary/10 text-primary">{pub.type}</span>
                    <span className="text-[10px] font-semibold text-slate-400">{pub.date}</span>
                    <span className="text-[10px] font-semibold text-slate-500 border border-slate-200 px-2 py-0.5 rounded-full bg-white">{pub.status}</span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm group-hover:text-primary transition-colors duration-200">{pub.title}</h4>
                  <p className="text-xs text-slate-500">{pub.desc}</p>
                </div>
                <button className="text-xs font-semibold text-slate-400 hover:text-primary transition-colors shrink-0 flex items-center gap-1 cursor-not-allowed" title="Publication under preparation">
                  Document Preview <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── H. RESEARCH COLLABORATION CTA ──────────────────────────────────── */}
      <section className="py-20 px-6 bg-slate-900 text-white" aria-label="Research Collaboration">
        <div className="max-w-4xl mx-auto text-center space-y-8 p-8 rounded-3xl border border-slate-800 hover:border-slate-700 shadow-xl hover:shadow-2xl transition-all duration-300">
          <div className="inline-flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-full px-4 py-1.5 text-[11px] font-bold text-teal-400 uppercase tracking-wider">
            <Users className="w-3.5 h-3.5" /> Academic & Clinical Partnerships
          </div>
          <h2 className="text-display text-white">Collaborate with the Research Team</h2>
          <p className="text-slate-400 text-base leading-relaxed max-w-xl mx-auto">
            We welcome academic researchers, medical institutions, and radiologists to participate in clinical validation pilots and explainability benchmarks.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/about-drishti-cps" className="px-6 py-3.5 bg-primary hover:bg-primary-hover text-white font-semibold rounded-2xl text-xs transition-all shadow-md hover:shadow-xl hover:-translate-y-0.5 flex items-center gap-2 focus-ring">
              Contact DRISHTI CPS <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/diagnostics" className="px-6 py-3.5 bg-slate-800 border border-slate-700 text-slate-200 font-semibold rounded-2xl hover:border-slate-500 hover:shadow-md hover:-translate-y-0.5 transition-all text-xs focus-ring">
              Explore Diagnostics Capabilities
            </Link>
          </div>
          <p className="text-[10px] text-slate-500">
            For academic research and clinical evaluation purposes only. No access to unanonymized patient data is provided.
          </p>
        </div>
      </section>

    </div>
  );
};
