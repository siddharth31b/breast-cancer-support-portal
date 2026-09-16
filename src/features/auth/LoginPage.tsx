"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

import { useAuth } from "./AuthContext";
import { 
  Eye, 
  EyeOff, 
  Loader2, 
  KeyRound, 
  Mail, 
  AlertCircle, 
  ShieldCheck, 
  MapPin,
  ArrowRight,
  ArrowLeft,
  Activity,
  Stethoscope,
  Heart,
  Users,
  Building2,
  Scan,
  FlaskConical,
  Shield,
  Sparkles,
  CheckCircle2
} from "lucide-react";
import { DEMO_USERS, DEMO_PASSWORD, DemoUser } from "../../mocks/users";
import { InstitutionalLogos } from "../../components/InstitutionalLogos";

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Role metadata for fast visual selection
  const roleCards = [
    { role: "DOCTOR", label: "Doctor", icon: Stethoscope, color: "text-blue-600", bg: "hover:bg-blue-50/80 hover:border-blue-300" },
    { role: "BREAST_CARE_NURSE", label: "Nurse", icon: Heart, color: "text-rose-600", bg: "hover:bg-rose-50/80 hover:border-rose-300" },
    { role: "PATIENT", label: "Patient", icon: Users, color: "text-teal-600", bg: "hover:bg-teal-50/80 hover:border-teal-300" },
    { role: "RADIOLOGIST", label: "Radiologist", icon: Scan, color: "text-violet-600", bg: "hover:bg-violet-50/80 hover:border-violet-300" },
    { role: "HOSPITAL_ADMIN", label: "Hospital", icon: Building2, color: "text-indigo-600", bg: "hover:bg-indigo-50/80 hover:border-indigo-300" },
    { role: "COMMUNITY_HEALTH_WORKER", label: "Field Worker", icon: Users, color: "text-amber-600", bg: "hover:bg-amber-50/80 hover:border-amber-300" },
    { role: "RESEARCHER", label: "Researcher", icon: FlaskConical, color: "text-emerald-600", bg: "hover:bg-emerald-50/80 hover:border-emerald-300" },
    { role: "SUPER_ADMIN", label: "Admin", icon: Shield, color: "text-red-600", bg: "hover:bg-red-50/80 hover:border-red-300" },
  ];

  const handleSelectRole = (roleKey: string) => {
    const demo = DEMO_USERS.find(u => u.role === roleKey);
    if (demo) {
      setSelectedRole(roleKey);
      setEmail(demo.email);
      setPassword(DEMO_PASSWORD);
      setErrorMsg("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!email || !password) {
      setErrorMsg("Please enter both email and password.");
      return;
    }

    setIsSubmitting(true);

    try {
      const user = await login(email, password);
      
      let redirectTarget = "";
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        const cb = params.get("callbackUrl");
        if (cb && cb.startsWith("/") && !cb.startsWith("/login")) {
          redirectTarget = cb;
        }
      }

      if (!redirectTarget) {
        switch (user.role) {
          case "PATIENT":
            redirectTarget = "/patient/dashboard";
            break;
          case "DOCTOR":
            redirectTarget = "/doctor/dashboard";
            break;
          case "BREAST_CARE_NURSE":
            redirectTarget = "/nurse/dashboard";
            break;
          case "RADIOLOGIST":
            redirectTarget = "/radiologist/dashboard";
            break;
          case "HOSPITAL_ADMIN":
            redirectTarget = "/hospital/dashboard";
            break;
          case "RESEARCHER":
            redirectTarget = "/research/dashboard";
            break;
          case "COMMUNITY_HEALTH_WORKER":
            redirectTarget = "/field/dashboard";
            break;
          case "SUPER_ADMIN":
            redirectTarget = "/admin/dashboard";
            break;
          default:
            redirectTarget = "/unauthorized";
        }
      }

      router.push(redirectTarget);
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to sign in. Please verify credentials.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeDemoUser = DEMO_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());

  return (
    <div className="min-h-screen flex flex-col lg:grid lg:grid-cols-12 bg-[#FAFBFD]">
      
      {/* ─── LEFT SHOWCASE PANE (Desktop & Large screens) ─── */}
      <div className="lg:col-span-5 xl:col-span-5 relative hidden lg:flex flex-col justify-between p-8 xl:p-12 text-white overflow-hidden bg-slate-950">
        
        {/* Background photo overlay with deep clinical teal gradient */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-luminosity scale-105 pointer-events-none"
          style={{ backgroundImage: "url('/assets/images/hero-clinical-consult.jpg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-[#003833]/92 to-[#00221F]/96 pointer-events-none" />
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Top: Institutional Logos Crisp White Card for 100% Clarity */}
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-950/80 border border-teal-500/40 text-[11px] font-bold text-teal-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>National Clinical Decision Support Consortium</span>
          </div>

          <div className="bg-white rounded-2xl p-3.5 shadow-2xl border border-white/90">
            <div className="flex items-center justify-between gap-3">
              {/* DRISHTI CPS Logo */}
              <img
                src="/assets/logos/drishti-cps-logo.png"
                alt="DRISHTI CPS Foundation"
                title="IITI DRISHTI CPS Foundation"
                className="h-9 xl:h-10 w-auto object-contain shrink-0"
              />

              <span className="h-7 w-px bg-slate-200 shrink-0" />

              {/* CharakDT Platform Badge */}
              <div className="text-left shrink-0">
                <div className="flex items-baseline gap-1">
                  <span className="text-sm xl:text-base font-black tracking-tight text-slate-900 font-sans">
                    charak<span className="text-rose-600">dt</span>
                  </span>
                  <span className="text-[7px] font-bold uppercase tracking-widest text-slate-400">
                    PLATFORM
                  </span>
                </div>
                <span className="text-[6.5px] uppercase font-bold tracking-wider text-slate-500 block leading-tight">
                  UNIFIED DIGITAL TWIN
                </span>
              </div>

              <span className="h-7 w-px bg-slate-200 shrink-0" />

              {/* IIT Indore Logo */}
              <img
                src="/assets/logos/iit-indore-logo.png"
                alt="IIT Indore"
                title="Indian Institute of Technology Indore"
                className="h-9 xl:h-10 w-auto object-contain shrink-0 hover:scale-105 transition-transform"
              />

              <span className="h-7 w-px bg-slate-200 shrink-0" />

              {/* AIIMS Bhopal Logo */}
              <img
                src="/assets/logos/aiims-logo.png"
                alt="AIIMS Bhopal"
                title="All India Institute of Medical Sciences Bhopal"
                className="h-9 xl:h-10 w-auto object-contain shrink-0 hover:scale-105 transition-transform"
              />
            </div>
          </div>
        </div>

        {/* Center: Mission & Impact highlights */}
        <div className="relative z-10 space-y-6 my-auto py-8">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-primary to-accent-teal flex items-center justify-center text-white shadow-lg shadow-teal-900/40">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl xl:text-3xl font-black tracking-tight text-white">
                NariSetu <span className="text-teal-400">AI</span>
              </h1>
              <p className="text-xs text-slate-300 font-medium">
                IITI DRISHTI CPS Foundation &bull; AIIMS Bhopal
              </p>
            </div>
          </div>

          <div className="space-y-3 max-w-lg">
            <h2 className="text-xl xl:text-2xl font-bold text-slate-100 leading-snug">
              Explainable AI for Early Screening, Accurate Triage & Clinician Oversight
            </h2>
            <p className="text-xs xl:text-sm text-slate-300 leading-relaxed font-normal">
              Empowering patients, community nurses, radiologists, and oncologists across India with transparent tissue density modeling and structured clinical pathways.
            </p>
          </div>

          {/* National Healthcare Reach Map Glass Card */}
          <Link
            href="/platform-reach"
            className="group block p-4 rounded-2xl bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/15 hover:border-teal-400/40 transition-all duration-300 shadow-xl"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300 group-hover:scale-110 transition-transform">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-white group-hover:text-teal-300 transition-colors">
                      National Clinical Reach Map
                    </p>
                    <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-400/30 text-[9px] font-bold text-emerald-300">
                      LIVE
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    Real-time state and district telemetry across 28+ States
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-teal-300 group-hover:translate-x-1 transition-transform mt-2" />
            </div>
          </Link>
        </div>

        {/* Bottom Trust Row */}
        <div className="relative z-10 pt-6 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>AES-256 Encrypted &bull; HIPAA & DISHA Aligned</span>
          </div>
          <span className="text-slate-400 font-mono text-[10px]">v2.4 LTS</span>
        </div>

      </div>

      {/* ─── RIGHT WORKSTATION FORM PANE ─── */}
      <div className="lg:col-span-7 xl:col-span-7 flex flex-col justify-between p-4 sm:p-8 lg:p-12 overflow-y-auto">
        
        {/* Top Navbar Row */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 max-w-xl mx-auto w-full">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-primary to-accent-teal flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
              <Activity className="w-4.5 h-4.5" />
            </div>
            <div className="text-left leading-tight">
              <span className="font-extrabold text-slate-900 text-base tracking-tight block">
                NariSetu <span className="text-accent-teal">AI</span>
              </span>
            </div>
          </Link>

          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-primary transition-colors px-3 py-1.5 rounded-xl hover:bg-slate-100/70"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Website</span>
          </Link>
        </div>

        {/* Center: Sign-In Card Container */}
        <div className="my-auto py-6 max-w-xl mx-auto w-full space-y-6">
          
          {/* Card Title & Intro */}
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-bold text-primary uppercase tracking-wider">
                Clinical Portal Access
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Sign In to Your Workspace
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Select a clinical role below or enter your registered institutional credentials.
            </p>
          </div>

          {/* Quick Demo Role Selector (1-Tap Fast Fill, No Scroll Cutoff!) */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-3 shadow-xs space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                Select Portal Role (1-Click Demo)
              </span>
              {activeDemoUser && (
                <span className="text-[10px] font-bold text-primary bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                  {activeDemoUser.name} &bull; {activeDemoUser.role}
                </span>
              )}
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-4 gap-1.5">
              {roleCards.map((rc) => {
                const Icon = rc.icon;
                const isSelected = selectedRole === rc.role;
                return (
                  <button
                    key={rc.role}
                    type="button"
                    onClick={() => handleSelectRole(rc.role)}
                    className={`p-2 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 group ${
                      isSelected
                        ? "bg-primary text-white border-primary shadow-sm ring-2 ring-primary/20 scale-[1.02]"
                        : `bg-slate-50 border-slate-200/70 text-slate-700 ${rc.bg}`
                    }`}
                    title={`Click to fill credentials for ${rc.label}`}
                  >
                    <Icon className={`w-4 h-4 ${isSelected ? "text-white" : rc.color}`} />
                    <span className="text-[10.5px] font-bold truncate max-w-full leading-tight">
                      {rc.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Error Notification */}
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-xs text-rose-700 animate-fade-in">
              <AlertCircle className="w-4.5 h-4.5 text-rose-500 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Authentication failed</strong>
                <span>{errorMsg}</span>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Email / Username Field */}
            <div>
              <label htmlFor="email" className="block text-xs font-bold text-slate-700 mb-1.5">
                Email Address or Phone
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  id="email"
                  type="text"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setSelectedRole(null);
                  }}
                  placeholder="e.g. nurse@demo.breastcare.ai"
                  className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-2xs"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor="password" className="text-xs font-bold text-slate-700">
                  Password
                </label>
                <a href="#" className="text-[11px] font-semibold text-primary hover:underline">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-11 py-3 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-2xs"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5 rounded-md"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between py-0.5">
              <label className="flex items-center gap-2 text-xs font-medium text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded-md border-slate-300 text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                />
                <span>Remember this workstation</span>
              </label>

              <span className="text-[11px] text-slate-400">
                Default: <code className="text-slate-700 font-mono font-bold bg-slate-100 px-1 py-0.5 rounded">Demo@123</code>
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 bg-primary hover:bg-primary-hover active:scale-[0.99] disabled:bg-primary/50 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 focus-ring"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying credentials & session...</span>
                </>
              ) : (
                <>
                  <span>
                    Sign In {selectedRole ? `as ${roleCards.find(r => r.role === selectedRole)?.label}` : "to Portal"}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Registration / Help Links */}
          <div className="pt-2 text-center text-xs space-y-2">
            <p className="text-slate-500">
              Need a patient account?{" "}
              <Link href="/register" className="font-bold text-primary hover:underline">
                Register Patient Profile &rarr;
              </Link>
            </p>
            
            <div className="flex items-center justify-center gap-3 pt-2 text-[11px] text-slate-400">
              <Link href="/platform-reach" className="hover:text-primary transition-colors flex items-center gap-1">
                <MapPin className="w-3 h-3 text-primary" />
                <span>National Reach Map</span>
              </Link>
              <span>&bull;</span>
              <Link href="/about-drishti-cps" className="hover:text-primary transition-colors">
                About IITI DRISHTI CPS
              </Link>
              <span>&bull;</span>
              <Link href="/research" className="hover:text-primary transition-colors">
                AI Validation
              </Link>
            </div>
          </div>

        </div>

        {/* Bottom Institutional Disclaimer */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400 max-w-xl mx-auto w-full">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Encrypted Institutional Healthcare System</span>
          </div>
          <p>&copy; 2026 NariSetu AI &bull; IIT Indore</p>
        </div>

      </div>

    </div>
  );
};
