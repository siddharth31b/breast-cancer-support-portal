"use client";

import Link from "next/link";
import React, { useState, useEffect, useRef } from "react";

import {
  ArrowRight,
  CheckCircle,
  Scan,
  BrainCircuit,
  Stethoscope,
  Heart,
  Users,
  Building2,
  FlaskConical,
  Shield,
  Lock,
  ChevronRight,
  Play,
  Eye,
  FileCheck,
  Activity,
  Sparkles,
  Cpu,
  Award,
  Check,
} from "lucide-react";



// ─── Ecosystem Nodes ─────────────────────────────────────────────────────────

const ecosystemNodes = [
  { id: "patient", label: "Patient", icon: Heart, pos: "top-0 left-1/2 -translate-x-1/2 -translate-y-1/2", color: "text-rose-500", bg: "bg-rose-50", border: "border-rose-200", desc: "Access reports, track journey, chat with care team" },
  { id: "chw", label: "Community Health Worker", icon: Users, pos: "top-[22%] right-[3%]", color: "text-orange-500", bg: "bg-orange-50", border: "border-orange-200", desc: "Conduct field screenings, register patients, refer cases" },
  { id: "radiologist", label: "Radiologist", icon: Scan, pos: "bottom-[22%] right-[3%]", color: "text-violet-600", bg: "bg-violet-50", border: "border-violet-200", desc: "Review AI-annotated DICOM scans, generate reports" },
  { id: "hospital", label: "Hospital", icon: Building2, pos: "bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2", color: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-200", desc: "Manage staff, escalations, appointments, compliance" },
  { id: "research", label: "Researcher", icon: FlaskConical, pos: "bottom-[22%] left-[3%]", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", desc: "Analyse anonymised cohorts, benchmark AI model metrics" },
  { id: "doctor", label: "Doctor", icon: Stethoscope, pos: "top-[22%] left-[3%]", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200", desc: "Validate AI predictions, sign clinical reports, manage cases" },
];



// ─── Distinct Capability Items ───────────────────────────────────────────────

const capabilitiesList = [
  { title: "System Modelling", desc: "Mathematical & neural representations of tissue density.", icon: BrainCircuit, color: "text-teal-600" },
  { title: "System Simulation", desc: "Simulating screening workflows prior to field deployment.", icon: Activity, color: "text-blue-600" },
  { title: "Data Visualisation", desc: "Intuitive heatmaps and explainable spatial reasoning.", icon: Eye, color: "text-amber-600" },
  { title: "Digital Healthcare", desc: "Tele-radiology screening & remote specialist consults.", icon: Heart, color: "text-rose-600" },
  { title: "Technology Development", desc: "Proprietary DICOM analysis models built at IIT Indore.", icon: Cpu, color: "text-indigo-600" },
  { title: "Technology Translation", desc: "Translating academic AI research to clinical practice.", icon: Sparkles, color: "text-violet-600" },
  { title: "Pilot Deployment", desc: "Field-tested across rural & urban healthcare centers.", icon: Building2, color: "text-emerald-600" },
  { title: "Industry Collaboration", desc: "Partnering with healthcare providers and PACS platforms.", icon: Users, color: "text-sky-600" },
  { title: "Startup Incubation", desc: "Nurtured within IITI DRISHTI CPS Foundation hub.", icon: Award, color: "text-teal-700" },
  { title: "Skill Development", desc: "Capacity building for health workers & radiologists.", icon: FileCheck, color: "text-indigo-700" },
];

// ─── Workflow strip data (top of hero visual) ────────────────────────────────

const workflowNodes = [
  { label: "Screening", icon: FileCheck, color: "text-amber-500", left: "6%" },
  { label: "AI Analysis", icon: BrainCircuit, color: "text-emerald-500", left: "36%" },
  { label: "Expert Review", icon: Stethoscope, color: "text-teal-500", left: "64%" },
  { label: "Care Guidance", icon: Heart, color: "text-rose-500", left: "93%" },
];

// ─── Photo-based Hero Scene (matches target screenshot) ──────────────────────

const HealthcareHeroScene: React.FC = () => {
  // 0 = Journey card active, 1 = AI Analysis card active, 2 = Patient Overview active, 3 = rest
  const [storyStage, setStoryStage] = useState<number>(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.1 }
    );
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    timerRef.current = setInterval(() => {
      setStoryStage((prev) => (prev + 1) % 4);
    }, 4000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isVisible]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
    const y = (e.clientY - rect.top - rect.height / 2) / rect.height;
    setMousePos({ x: x * 4, y: y * 4 });
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setMousePos({ x: 0, y: 0 })}
      className="relative w-full h-[520px] lg:h-[580px] select-none pointer-events-auto"
      style={{
        transform: `perspective(1200px) rotateX(${2 + mousePos.y * 0.05}deg) rotateY(${mousePos.x * 0.08}deg)`,
        transition: "transform 0.5s ease-out",
      }}
    >
      {/* Dotted connector arc across the four workflow stages */}
      <svg
        className="absolute top-0 left-0 w-full h-24 pointer-events-none z-20"
        viewBox="0 0 800 110"
        fill="none"
        preserveAspectRatio="none"
      >
        <path
          d="M 60 70 Q 260 8 400 55 T 740 70"
          stroke="url(#arc-flow-grad)"
          strokeWidth="2"
          strokeDasharray="4 5"
          className="opacity-60"
        />
        <defs>
          <linearGradient id="arc-flow-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="35%" stopColor="#10b981" />
            <stop offset="70%" stopColor="#14b8a6" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
        </defs>
        <circle r="4.5" fill="#10b981">
          <animateMotion dur="4s" repeatCount="indefinite" path="M 60 70 Q 260 8 400 55 T 740 70" />
        </circle>
      </svg>

      {/* Four workflow stage icons */}
      <div className="absolute top-0 left-0 w-full h-24 z-30 pointer-events-none">
        {workflowNodes.map((node, i) => {
          const isActive = storyStage === i;
          const Icon = node.icon;
          return (
            <div
              key={node.label}
              className="absolute -translate-x-1/2 top-2 flex flex-col items-center gap-1.5"
              style={{ left: node.left }}
            >
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center border bg-white shadow-md transition-all duration-500 ${
                  isActive ? "border-emerald-300 scale-110 shadow-emerald-200/60" : "border-slate-200/80"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? node.color : "text-slate-400"}`} />
              </div>
              <span
                className={`text-[9px] font-extrabold uppercase tracking-wider whitespace-nowrap ${
                  isActive ? "text-slate-800" : "text-slate-400"
                }`}
              >
                {node.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* AI Analysis card — over the mammogram monitor */}
      <div
        className="absolute left-[5%] top-[24%] w-[46%] max-w-[280px] transition-all duration-700 pointer-events-auto z-25"
        style={{
          transform: `scale(${storyStage === 1 ? 1.03 : 0.97})`,
          opacity: storyStage === 1 ? 1 : 0.55,
        }}
      >
        <div className="rounded-2xl bg-slate-900/95 backdrop-blur-md border border-slate-700/60 shadow-xl p-3 space-y-2 text-white">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold flex items-center gap-1.5">
              <BrainCircuit className="w-3.5 h-3.5 text-emerald-400" /> AI Analysis
            </span>
            <span className="text-[8px] text-slate-400 font-semibold">ID · BC-74821</span>
          </div>
          <div>
            <p className="text-[8px] text-slate-400 font-semibold uppercase tracking-wide">High Confidence</p>
            <p className="text-lg font-black text-emerald-400 leading-none">98.7%</p>
          </div>
          <div className="space-y-1 pt-1 border-t border-slate-700/60">
            <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wide">Key Insights</p>
            {["Mass Detection", "Microcalcifications", "Architectural Distortion"].map((label) => (
              <div key={label} className="flex items-center justify-between text-[8.5px] font-semibold text-slate-200">
                <span>{label}</span>
                <CheckCircle className="w-2.5 h-2.5 text-emerald-400" />
              </div>
            ))}
          </div>
          <div className="pt-1.5 border-t border-slate-700/60 flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center font-black text-emerald-400 text-xs">
              2
            </div>
            <div>
              <p className="text-[8px] font-bold text-slate-200">BI-RADS® Assessment</p>
              <p className="text-[7.5px] text-slate-400 font-semibold">Benign Finding · Routine Follow-up</p>
            </div>
          </div>
        </div>
      </div>

      {/* Patient Overview card — right side, near the doctor */}
      <div
        className="absolute right-[2%] top-[22%] w-[38%] max-w-[210px] transition-all duration-700 pointer-events-auto z-25"
        style={{
          transform: `scale(${storyStage === 2 ? 1.03 : 0.97})`,
          opacity: storyStage === 2 ? 1 : 0.55,
        }}
      >
        <div className="rounded-2xl bg-slate-900/95 backdrop-blur-md border border-slate-700/60 shadow-xl p-3 space-y-2 text-white">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-[8px] font-black text-emerald-300">
              AK
            </div>
            <div>
              <p className="text-[8.5px] font-bold leading-tight">Patient Overview</p>
              <p className="text-[7px] text-slate-400 font-semibold">ID: BC-74492 · Age 42</p>
            </div>
          </div>
          <div className="space-y-1 pt-1 border-t border-slate-700/60">
            {["Personal & Family History", "Previous Reports", "Risk Assessment", "AI Chat History"].map((label) => (
              <div key={label} className="flex items-center justify-between text-[8px] font-semibold text-slate-200">
                <span>{label}</span>
                <ChevronRight className="w-2.5 h-2.5 text-slate-500" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* My Journey checklist card — near the patient */}
      <div
        className="absolute left-[4%] bottom-[5%] w-[42%] max-w-[230px] transition-all duration-700 pointer-events-auto z-25"
        style={{
          transform: `scale(${storyStage === 0 ? 1.03 : 0.97})`,
          opacity: storyStage === 0 ? 1 : 0.55,
        }}
      >
        <div className="rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200 shadow-xl p-3 space-y-1.5 text-slate-800">
          <p className="text-[9px] font-extrabold uppercase tracking-wide text-slate-700 pb-1 border-b border-slate-100">
            My Journey
          </p>
          {[
            { label: "Profile & History", status: "done" },
            { label: "Questionnaire", status: "done" },
            { label: "Reports Uploaded", status: "done" },
            { label: "AI Assessment", status: "In Progress" },
            { label: "Doctor Review", status: "Pending" },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between text-[8.5px] font-semibold">
              <span className="text-slate-600">{item.label}</span>
              {item.status === "done" ? (
                <CheckCircle className="w-3 h-3 text-emerald-500" />
              ) : (
                <span
                  className={`text-[7px] font-bold px-1.5 py-0.5 rounded-full ${
                    item.status === "In Progress" ? "bg-amber-50 text-amber-600" : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {item.status}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── Landing Page Component ──────────────────────────────────────────────────

export const LandingPage: React.FC = () => {
  const [activeNode, setActiveNode] = useState<string | null>(null);

  return (
    <div className="bg-white text-slate-800 overflow-x-hidden">

      <section className="relative min-h-screen gradient-hero flex flex-col justify-center pt-8 pb-20 px-6 overflow-hidden" aria-label="NariSetu AI Introduction">
        {/* Full-width Seamless background composition */}
        <div className="absolute inset-y-0 right-0 w-full lg:w-[72%] xl:w-[68%] z-0 select-none pointer-events-none">
          <img
            src="/assets/images/hero-clinical-consult.jpg"
            alt="Clinic atmosphere backdrop"
            className="w-full h-full object-cover object-right pointer-events-none"
            style={{
              maskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.05) 18%, rgba(0,0,0,0.8) 52%, black 100%)',
              WebkitMaskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.05) 18%, rgba(0,0,0,0.8) 52%, black 100%)'
            }}
          />
          <div className="absolute top-[10%] right-[10%] w-[450px] h-[450px] rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />
        </div>
        

        <div className="max-w-7xl mx-auto w-full relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

            <div className="lg:col-span-5 space-y-8 animate-fade-up pl-6 lg:pl-10">
              <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-full px-4 py-2 shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse motion-reduce:animate-none" />
                <span className="text-[10px] font-black text-emerald-800 uppercase tracking-widest">AI-Powered • Explainable • Clinician-in-the-Loop</span>
              </div>

              <div className="space-y-3">
                <h1 className="text-4xl lg:text-[54px] xl:text-[58px] font-black text-slate-900 leading-[1.05] tracking-tight max-w-[600px]">
                  Intelligent Support,<br />
                  <span className="text-primary">Human Expertise.</span>
                </h1>
                <p className="text-sm lg:text-base text-slate-500 font-medium leading-relaxed max-w-[500px]">
                  NariSetu AI combines advanced explainable AI with specialist validation to support early screening, accurate analysis, and better breast healthcare for all.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link href="/login" className="group flex items-center gap-2.5 px-6 py-3.5 bg-primary hover:bg-primary-hover active:scale-[0.98] text-white font-semibold rounded-2xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-200 hover:-translate-y-0.5 focus-ring">
                  Start Your Journey <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link href="/login" className="flex items-center gap-2 px-6 py-3.5 bg-white border border-slate-200 text-slate-700 font-semibold rounded-2xl hover:border-primary/40 hover:text-primary active:scale-[0.98] transition-all duration-200 focus-ring">
                  <Play className="w-3.5 h-3.5 fill-current text-primary" /> Watch Demo
                </Link>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold pt-1 border-t border-slate-100/50">
                <Shield className="w-4.5 h-4.5 text-emerald-500 shrink-0" />
                <span>Your data is secure, private and protected with enterprise-grade encryption.</span>
              </div>
            </div>

            <div className="lg:col-span-7 animate-fade-up-delay overflow-visible">
              <HealthcareHeroScene />
            </div>
          </div>

          {/* ── 4 COMPLIANCE CHECKMARK CARDS ─────────────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12 animate-fade-up">
            {[
              { title: "Explainable AI", desc: "Transparent Insights" },
              { title: "Clinician-in-the-Loop", desc: "Human Oversight" },
              { title: "Privacy & Security", desc: "AES-256 Encrypted" },
              { title: "Research Driven", desc: "IITI DRISHTI CPS Initiative" }
            ].map((card, i) => (
              <div key={i} className="bg-white border border-slate-200/85 px-5 py-4 rounded-2xl flex items-center gap-3.5 shadow-xs hover:border-emerald-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-300/30 flex items-center justify-center text-emerald-600 shrink-0">
                  <Check className="w-4 h-4 stroke-[3]" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-800 text-xs">{card.title}</h4>
                  <p className="text-[10px] text-slate-400 font-bold tracking-wide mt-0.5">{card.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* ── FULL-WIDTH DYNAMIC STATS BAR ─────────────────────────────────── */}
          <div className="bg-white/80 backdrop-blur-md rounded-[32px] p-6 shadow-xl hover:shadow-2xl hover:border-slate-300/80 border border-slate-200/80 mt-12 transition-all duration-300 animate-fade-up">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6 text-center">
              {[
                { value: "10,000+", label: "Lives Impacted", icon: Heart, color: "text-rose-500" },
                { value: "500+", label: "Expert Users", icon: Users, color: "text-sky-500" },
                { value: "98%", label: "AI Confidence*", icon: Award, color: "text-emerald-500" },
                { value: "24/7", label: "Secure Access", icon: Lock, color: "text-amber-500" },
                { value: "100%", label: "Privacy First", icon: Shield, color: "text-indigo-500" }
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="flex flex-col items-center gap-1.5 p-3 hover:bg-slate-50/70 rounded-2xl transition-colors">
                    <div className={`w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center ${item.color}`}>
                      <Icon className="w-4.5 h-4.5" />
                    </div>
                    <p className="text-2xl font-black text-slate-900 leading-none mt-1">{item.value}</p>
                    <p className="text-[10px] font-bold text-slate-500 tracking-wide">{item.label}</p>
                  </div>
                );
              })}
            </div>
            {/* Footnote */}
            <p className="text-[9.5px] text-center text-slate-400 font-semibold mt-4">
              *AI confidence varies based on data quality and clinical context. Final diagnosis rests with healthcare professionals.
            </p>
          </div>
        </div>
      </section>



      <section className="py-28 px-6 bg-white relative overflow-hidden" aria-label="Patient Journey">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
          backgroundImage: `radial-gradient(circle, #005F56 1px, transparent 1px)`,
          backgroundSize: "32px 32px"
        }} />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-20 space-y-4">
            <div className="inline-flex items-center gap-2 bg-primary/6 border border-primary/15 rounded-full px-4 py-1.5 text-[11px] font-bold text-primary uppercase tracking-wider">
              <Activity className="w-3.5 h-3.5" /> Patient Journey
            </div>
            <h2 className="text-headline text-slate-900">One seamless path<br />from symptom to care.</h2>
            <p className="text-slate-500 text-base max-w-xl mx-auto leading-relaxed">
              Every touchpoint is designed to reduce friction and increase trust — for patients, clinicians, and researchers.
            </p>
          </div>
          <div className="relative">
            <div className="absolute top-10 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-slate-200 to-transparent hidden md:block" />
            <div className="grid grid-cols-1 md:grid-cols-7 gap-6 relative">
              {[
                { step: 1, label: "Awareness", desc: "Symptoms noticed", icon: Heart, color: "text-rose-500", bg: "bg-rose-50", border: "border-rose-200" },
                { step: 2, label: "Assessment", desc: "Digital screening", icon: Activity, color: "text-orange-500", bg: "bg-orange-50", border: "border-orange-200" },
                { step: 3, label: "Upload", desc: "Secure scan transfer", icon: Scan, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" },
                { step: 4, label: "AI Analysis", desc: "Neural detection", icon: BrainCircuit, color: "text-primary", bg: "bg-teal-50", border: "border-teal-200", active: true },
                { step: 5, label: "Validation", desc: "Doctor sign-off", icon: Stethoscope, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" },
                { step: 6, label: "Appointment", desc: "Expert consult", icon: Users, color: "text-violet-600", bg: "bg-violet-50", border: "border-violet-200" },
                { step: 7, label: "Care Plan", desc: "Long-term wellness", icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
              ].map((s) => {
                const Icon = s.step === 4 ? BrainCircuit : s.icon; // safely handle dynamic icons if any
                return (
                  <div key={s.step} className="group flex flex-col items-center text-center gap-4">
                    <div className={`relative w-20 h-20 rounded-2xl flex items-center justify-center border-2 transition-all duration-300 
                      ${s.active ? `${s.bg} ${s.border} ${s.color} shadow-lg shadow-primary/20 stage-active-ring scale-110` : `bg-white border-slate-150 text-slate-400 group-hover:${s.bg} group-hover:${s.border} group-hover:${s.color} group-hover:scale-105`}`}
                    >
                      <Icon className="w-7 h-7" />
                      {s.active && <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-primary text-white text-[8px] font-black flex items-center justify-center">✓</span>}
                    </div>
                    <div>
                      <p className={`text-sm font-bold ${s.active ? "text-primary" : "text-slate-700"}`}>{s.label}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{s.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="py-28 px-6" style={{ background: "linear-gradient(160deg, #f8fafb 0%, #f0f9f8 100%)" }} aria-label="Explainable AI">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="relative">
              <div className="relative rounded-[32px] overflow-hidden shadow-2xl shadow-slate-200/80 border border-slate-200/80 aspect-[4/3] bg-slate-900 flex items-center justify-center select-none group">
                <img src="/assets/images/explainable-ai-workstation.jpg" alt="Healthcare professional reviewing digital clinical information." width={1000} height={750} className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-102" loading="lazy" />
              </div>
            </div>
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 bg-violet-50 border border-violet-200 rounded-full px-4 py-1.5 text-[11px] font-bold text-violet-700 uppercase tracking-wider">
                  <BrainCircuit className="w-3.5 h-3.5" /> Explainable AI
                </div>
                <h2 className="text-headline text-slate-900">AI you can see.<br />Decisions you can trust.</h2>
                <p className="text-slate-500 leading-relaxed">
                  Unlike black-box models, NariSetu AI shows exactly what it found and why — with spatial heatmaps, confidence scores, and structured reasoning that clinicians can review and override.
                </p>
              </div>
              <div className="space-y-4">
                {[
                  { title: "Region-of-Interest Heatmaps", desc: "Dynamic overlays highlight suspicious tissue regions for radiologist review.", icon: Eye },
                  { title: "Confidence Scoring", desc: "Every prediction carries a calibrated confidence measure benchmarked against clinical standards.", icon: Shield },
                  { title: "Doctor Override", desc: "AI is advisory only. The final report is always signed by a certified oncologist.", icon: Stethoscope },
                ].map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div key={i} className="flex gap-4 p-5 rounded-2xl bg-white border border-slate-200/70 hover:border-primary/30 hover:shadow-md hover:-translate-y-1 transition-all duration-300 ease-out group cursor-default">
                      <div className="w-10 h-10 rounded-xl bg-primary/8 border border-primary/15 flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-2xs">
                        <Icon className="w-4.5 h-4.5 text-primary group-hover:text-white transition-colors duration-300" />
                      </div>
                      <div>
                        <p className="font-bold text-sm text-slate-800 group-hover:text-primary transition-colors duration-200">{item.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-28 px-6 bg-white border-b border-slate-100" aria-label="Research & Technology Translation Pillars">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 bg-teal-50 border border-teal-200 rounded-full px-4 py-1.5 text-[11px] font-bold text-teal-700 uppercase tracking-wider">
              <FlaskConical className="w-3.5 h-3.5" /> Research to Market
            </div>
            <h2 className="text-headline text-slate-900">Lab-to-Impact Innovation Pillars</h2>
            <p className="text-slate-500 text-base leading-relaxed">
              Advancing digital healthcare through rigorous research, technology translation, and capacity building.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "Technology Development", subtitle: "Proprietary AI Engine", desc: "Building neural DICOM analysis models and vision transformers benchmarked at IIT Indore.", image: "/assets/images/drishti-hero-research.jpg", icon: Cpu },
              { title: "Startups & Translation", subtitle: "Lab to Clinical Field", desc: "Translating academic laboratory breakthroughs into scalable clinical healthcare deployments.", image: "/assets/images/drishti-translation-team.jpg", icon: Sparkles },
              { title: "Digital Health Training", subtitle: "Capacity Building", desc: "Empowering health workers, nurses, and clinicians with AI-assisted screening skills.", image: "/assets/images/drishti-digital-healthcare.jpg", icon: FileCheck },
            ].map((card, i) => {
              const Icon = card.icon;
              return (
                <div key={i} className="group rounded-3xl overflow-hidden bg-white border border-slate-200/80 shadow-md hover:shadow-2xl hover:border-primary/50 hover:-translate-y-2 hover:scale-[1.025] transition-all duration-300 ease-out flex flex-col cursor-pointer">
                  <div className="relative aspect-[16/10] overflow-hidden bg-slate-900">
                    <img src={card.image} alt={card.title} width={800} height={500} className="w-full h-full object-cover opacity-90 transition-transform duration-700 ease-out group-hover:scale-108" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent" />
                    <div className="absolute top-4 left-4 w-9 h-9 rounded-xl bg-white/90 backdrop-blur-xs flex items-center justify-center shadow-md text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                      <Icon className="w-4.5 h-4.5" />
                    </div>
                  </div>
                  <div className="p-6 space-y-2 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-primary uppercase tracking-wider">{card.subtitle}</span>
                      <h3 className="font-bold text-slate-900 text-lg group-hover:text-primary transition-colors duration-200 mt-0.5">{card.title}</h3>
                      <p className="text-xs text-slate-500 leading-relaxed mt-2">{card.desc}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="pt-8 space-y-6">
            <div className="text-center space-y-1">
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Institutional Capabilities</span>
              <h3 className="text-xl font-bold text-slate-900">Core Expertise & Focus Areas</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {capabilitiesList.map((cap, idx) => {
                const CapIcon = cap.icon;
                return (
                  <div key={idx} className="p-4.5 rounded-2xl bg-slate-50 hover:bg-white border border-slate-200/80 hover:border-primary/40 shadow-xs hover:shadow-2xl hover:-translate-y-2 hover:scale-[1.025] transition-all duration-300 ease-out group text-center space-y-2 cursor-pointer">
                    <div className="w-11 h-11 rounded-xl bg-white border border-slate-200/80 group-hover:border-primary/40 flex items-center justify-center mx-auto shadow-2xs group-hover:bg-primary/10 group-hover:scale-110 transition-all duration-300">
                      <CapIcon className={`w-5.5 h-5.5 ${cap.color}`} />
                    </div>
                    <div>
                      <p className="font-bold text-xs text-slate-900 group-hover:text-primary transition-colors duration-200">{cap.title}</p>
                      <p className="text-[10px] text-slate-500 leading-tight mt-0.5">{cap.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="py-28 px-6 bg-white" aria-label="Role Ecosystem">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-200 rounded-full px-4 py-1.5 text-[11px] font-bold text-indigo-700 uppercase tracking-wider">
              <Building2 className="w-3.5 h-3.5" /> Unified Healthcare Ecosystem
            </div>
            <h2 className="text-headline text-slate-900">Every stakeholder,<br />one connected platform.</h2>
            <p className="text-slate-500 text-base max-w-xl mx-auto leading-relaxed">
              NariSetu AI bridges the gap between community health workers, hospitals, researchers, and patients — on a single secure platform.
            </p>
          </div>
          <div className="relative w-full max-w-2xl mx-auto" style={{ height: 480 }}>
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 600 480" fill="none">
              {ecosystemNodes.map((node, i) => {
                const angle = (i * 60 - 90) * (Math.PI / 180);
                const radius = 185;
                const nx = 300 + radius * Math.cos(angle);
                const ny = 240 + radius * Math.sin(angle);
                return (
                  <line
                    key={node.id}
                    x1={nx} y1={ny}
                    x2={300} y2={240}
                    stroke={activeNode === node.id ? "#005F56" : "#E2E8F0"}
                    strokeWidth={activeNode === node.id ? "2.5" : "1.5"}
                    strokeDasharray="4 3"
                    className="transition-all duration-300"
                  />
                );
              })}
            </svg>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-3xl w-24 h-24 bg-primary text-white flex flex-col items-center justify-center shadow-xl shadow-primary/30 border-4 border-white z-20">
              <BrainCircuit className="w-8 h-8 animate-pulse motion-reduce:animate-none" />
              <span className="text-[9px] font-extrabold uppercase tracking-wider mt-1">AI Core</span>
            </div>
            {ecosystemNodes.map((node, i) => {
              const angle = (i * 60 - 90) * (Math.PI / 180);
              const radius = 185;
              const cx = 50 + (radius / 300) * 50 * Math.cos(angle);
              const cy = 50 + (radius / 240) * 50 * Math.sin(angle);
              const Icon = node.icon;
              const isActive = activeNode === node.id;
              return (
                <div
                  key={node.id}
                  className="absolute z-10 -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                  style={{ left: `${cx}%`, top: `${cy}%` }}
                  onMouseEnter={() => setActiveNode(node.id)}
                  onMouseLeave={() => setActiveNode(null)}
                >
                  <div className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center border-2 transition-all duration-200 focus-ring
                    ${isActive ? `${node.bg} ${node.border} shadow-lg scale-110` : "bg-white border-slate-200 hover:scale-105"}`}
                  >
                    <Icon className={`w-6 h-6 ${isActive ? node.color : "text-slate-400"}`} />
                  </div>
                  <p className={`text-center mt-2 text-[10px] font-bold whitespace-nowrap ${isActive ? node.color : "text-slate-500"}`}>
                    {node.label}
                  </p>
                  {isActive && (
                    <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-48 bg-slate-900 text-white text-[10px] leading-relaxed px-3 py-2 rounded-xl shadow-xl z-30 animate-scale-in pointer-events-none">
                      {node.desc}
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-slate-900" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16 px-6 bg-slate-50 border-y border-slate-100" aria-label="Compliance and Governance">
        <div className="max-w-7xl mx-auto text-center space-y-10">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Clinical Compliance & Governance</p>
          <div className="flex flex-wrap justify-center gap-8">
            {[
              { label: "WCAG 2.2 AA", icon: Shield },
              { label: "AES-256 Encryption", icon: Lock },
              { label: "Role-Based Access", icon: Users },
              { label: "Audit Logs", icon: FileCheck },
              { label: "Consent Management", icon: CheckCircle },
              { label: "Drishti CPS Funded", icon: Sparkles },
            ].map((c, i) => {
              const Icon = c.icon;
              return (
                <div key={i} className="flex items-center gap-2 text-slate-600 text-xs font-semibold hover:text-primary transition-colors cursor-default">
                  <Icon className="w-4 h-4 text-primary" />
                  {c.label}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-28 px-6 bg-white" aria-label="Get Started">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 bg-primary/6 border border-primary/15 rounded-full px-4 py-1.5 text-[11px] font-bold text-primary uppercase tracking-wider">
            <Heart className="w-3.5 h-3.5" /> For Every Patient
          </div>
          <h2 className="text-display text-slate-900">Your health.<br /><span className="text-primary">Our mission.</span></h2>
          <p className="text-slate-500 text-lg leading-relaxed max-w-xl mx-auto font-medium">
            Join thousands of patients across India benefiting from AI-powered, doctor-validated breast cancer screening — free for the IIT Indore pilot cohort.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/login"
              aria-label="Get Started Free"
              className="group flex items-center gap-2.5 px-8 py-4 bg-primary hover:bg-primary-hover active:scale-[0.98] text-white font-semibold rounded-2xl shadow-lg shadow-primary/25 hover:shadow-primary/35 transition-all duration-200 hover:-translate-y-0.5 text-sm focus-ring"
            >
              Get Started — It's Free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/login"
              aria-label="Already have an account"
              className="flex items-center gap-2 px-8 py-4 bg-white border border-slate-200 text-slate-700 font-semibold rounded-2xl hover:border-primary/30 hover:text-primary active:scale-[0.98] transition-all duration-200 text-sm focus-ring"
            >
              Already have an account
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <p className="text-xs text-slate-400 font-medium">
            IIT Indore · Drishti CPS · ICMR Compliance · Research Platform
          </p>
        </div>
      </section>
    </div>
  );
};
