"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Eye, 
  EyeOff, 
  Loader2, 
  KeyRound, 
  Mail, 
  AlertCircle, 
  ShieldCheck, 
  Activity, 
  Sparkles, 
  CheckCircle2, 
  Building2, 
  Stethoscope, 
  Heart, 
  Users, 
  RotateCcw,
  Radio
} from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { DEMO_USERS, DEMO_PASSWORD } from "../../mocks/users";
import { IndiaSpreadMap } from "../../components/map/IndiaSpreadMap";
import { 
  PlatformReachService, 
  StateReachData, 
  LoginEvent, 
  ReachSummary 
} from "../../services/platform-reach.service";

export const SpreadPage: React.FC = () => {
  const { login } = useAuth();
  const router = useRouter();

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Spread reach & map states
  const [statesData, setStatesData] = useState<Record<string, StateReachData>>({});
  const [selectedStateId, setSelectedStateId] = useState<string>("AP");
  const [recentActiveStateId, setRecentActiveStateId] = useState<string | undefined>("AP");
  const [summary, setSummary] = useState<ReachSummary>({
    totalStates: 2,
    totalDistricts: 2,
    totalLivesAffected: 9,
    totalClinicians: 2,
    totalPatients: 8,
    totalRadiologists: 1,
    totalNurses: 2,
    totalLoginsToday: 18
  });
  const [recentLogins, setRecentLogins] = useState<LoginEvent[]>([]);
  const [latestLiveLoginToast, setLatestLiveLoginToast] = useState<LoginEvent | null>(null);

  // Refresh reach state
  const refreshReachData = () => {
    const states = PlatformReachService.getStates();
    const sum = PlatformReachService.getSummaryMetrics();
    const logins = PlatformReachService.getRecentLogins();
    setStatesData(states);
    setSummary(sum);
    setRecentLogins(logins);
  };

  useEffect(() => {
    refreshReachData();

    // Listen for cross-tab or in-page reach & login updates
    const handleReachUpdate = () => refreshReachData();
    const handleLoginUpdate = (e: any) => {
      refreshReachData();
      if (e.detail?.logins && e.detail.logins.length > 0) {
        const latest = e.detail.logins[0];
        setLatestLiveLoginToast(latest);
        setRecentActiveStateId(latest.stateId);
        setSelectedStateId(latest.stateId);
      }
    };

    window.addEventListener("platform-reach-updated", handleReachUpdate);
    window.addEventListener("platform-logins-updated", handleLoginUpdate);

    return () => {
      window.removeEventListener("platform-reach-updated", handleReachUpdate);
      window.removeEventListener("platform-logins-updated", handleLoginUpdate);
    };
  }, []);

  // Handle Sign In submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!email || !password) {
      setErrorMsg("Please enter both credentials.");
      return;
    }

    setIsSubmitting(true);

    try {
      const user = await login(email, password);

      // Record login in platform reach service to track user on map
      const loginEvent = PlatformReachService.recordUserLogin(user);
      setRecentActiveStateId(loginEvent.stateId);
      setSelectedStateId(loginEvent.stateId);
      setLatestLiveLoginToast(loginEvent);

      // Brief delay to allow the user to view the detection animation before redirect
      setTimeout(() => {
        switch (user.role) {
          case "PATIENT":
            router.push("/patient/dashboard");
            break;
          case "DOCTOR":
            router.push("/doctor/dashboard");
            break;
          case "BREAST_CARE_NURSE":
            router.push("/nurse/dashboard");
            break;
          case "RADIOLOGIST":
            router.push("/radiologist/worklist");
            break;
          case "HOSPITAL_ADMIN":
            router.push("/hospital/dashboard");
            break;
          case "RESEARCHER":
            router.push("/research/dashboard");
            break;
          case "COMMUNITY_HEALTH_WORKER":
            router.push("/field/dashboard");
            break;
          case "SUPER_ADMIN":
            router.push("/admin/dashboard");
            break;
          default:
            router.push("/unauthorized");
        }
      }, 700);

    } catch (err: any) {
      setErrorMsg(err.message || "Failed to sign in. Please verify credentials.");
      setIsSubmitting(false);
    }
  };

  // Quick dev account filler
  const fillDemoAccount = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword(DEMO_PASSWORD);
    setErrorMsg("");
  };

  // Test simulate a login from a specific state to demonstrate live map detection
  const handleSimulateLogin = (role: "DOCTOR" | "PATIENT" | "RADIOLOGIST", stateId: string, stateName: string) => {
    const mockUser: any = {
      id: `sim-${Date.now()}`,
      name: role === "DOCTOR" ? "Dr. A. N. Rao" : role === "PATIENT" ? "P. Lakshmi" : "Dr. V. Verma",
      role,
      institution: stateName + " Regional Health Center",
      hospitalName: stateName + " Care Unit"
    };

    const event = PlatformReachService.recordUserLogin(mockUser, stateId);
    setRecentActiveStateId(stateId);
    setSelectedStateId(stateId);
    setLatestLiveLoginToast(event);
    refreshReachData();
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5] flex flex-col justify-between font-sans select-none">
      
      {/* ─── Institutional Header Banner (Matching reference screenshot) ─── */}
      <header className="bg-white border-b border-slate-200/80 px-4 sm:px-8 py-3.5 shadow-2xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Left Brand: DRISHTI CPS Foundation & CharakDT / BreastCare AI */}
          <div className="flex items-center gap-3">
            <img
              src="/assets/logos/drishti-cps-logo.png"
              alt="DRISHTI CPS Foundation IIT Indore"
              className="h-13 w-auto object-contain shrink-0 drop-shadow-xs"
            />

            {/* CharakDT Brand Mark */}
            <div className="border-l border-slate-200 pl-3">
              <div className="flex items-baseline gap-1">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 font-serif">
                  charak<span className="text-rose-600">dt</span>
                </span>
                <span className="text-[8px] font-bold uppercase tracking-widest text-slate-400">
                  PLATFORM
                </span>
              </div>
              <div className="text-[8.5px] uppercase font-bold tracking-wider text-slate-500">
                UNIFIED HUMAN DIGITAL TWIN PLATFORM
              </div>
            </div>
          </div>

          {/* Center Platform Title */}
          <div className="text-center px-2">
            <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              DRISHTI-SCD &bull; NARISETU-AI
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-600 max-w-xl mx-auto font-medium">
              Detection and Risk Inference of Severity for Healthcare Trajectories in India
            </p>
          </div>

          {/* Right Partner Emblems: Clean, Large Real Logos */}
          <div className="flex items-center gap-4">
            <img
              src="/assets/logos/iit-indore-logo.png"
              alt="IIT Indore"
              title="Indian Institute of Technology Indore"
              className="h-12 w-auto object-contain shrink-0 hover:scale-105 transition-transform drop-shadow-xs"
            />
            <img
              src="/assets/logos/aiims-logo.png"
              alt="AIIMS Bhopal"
              title="All India Institute of Medical Sciences Bhopal"
              className="h-12 w-auto object-contain shrink-0 hover:scale-105 transition-transform drop-shadow-xs"
            />
          </div>

        </div>
      </header>

      {/* ─── Live Login Toast Banner ─── */}
      {latestLiveLoginToast && (
        <div className="bg-emerald-600 text-white text-xs px-4 py-2 text-center flex items-center justify-center gap-2 animate-fadeIn shadow-xs">
          <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-200" />
          <span>
            <strong>Live Detection:</strong> {latestLiveLoginToast.userName} ({latestLiveLoginToast.userRole}) just logged in from <strong>{latestLiveLoginToast.stateName}</strong> ({latestLiveLoginToast.district})
          </span>
          <span className="text-emerald-200 text-[10px] ml-2 font-mono">[{latestLiveLoginToast.timestamp}]</span>
        </div>
      )}

      {/* ─── Main Spread Dual Card Area ─── */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* ──── LEFT PANEL: Credential Sign In Card ──── */}
          <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-2xl shadow-sm p-6 sm:p-8 text-left">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight mb-1">
              Sign in with your clinician or administrator credentials
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              Access clinical data, patient registries, diagnostic queues, and AI risk trajectories.
            </p>

            {errorMsg && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-700">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username / Email */}
              <div>
                <label htmlFor="email" className="block text-xs font-semibold text-slate-700 mb-1">
                  Username
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    id="email"
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. doctor@demo.breastcare.ai or yty"
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-blue-700 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-100 transition-all text-slate-800"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label htmlFor="password" className="text-xs font-semibold text-slate-700">
                    Password
                  </label>
                </div>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 focus:border-blue-700 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-100 transition-all text-slate-800"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Secure Login Button (Matching the screenshot's dark blue button) */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-3 bg-[#1e293b] hover:bg-[#0f172a] text-white font-semibold rounded-xl text-sm shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-[0.99]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Signing in & detecting location...</span>
                  </>
                ) : (
                  "Secure Login"
                )}
              </button>
            </form>

            {/* Links matching screenshot */}
            <div className="mt-5 text-center space-y-2 text-xs">
              <div>
                <a href="#" className="text-blue-700 hover:underline font-medium">
                  Forgotten your password?
                </a>
              </div>
              <div className="text-slate-500">
                Don't have an account?{" "}
                <Link href="/register" className="text-blue-700 hover:underline font-semibold">
                  Register as a Doctor
                </Link>{" "}
                or{" "}
                <Link href="/register" className="text-rose-600 hover:underline font-semibold">
                  Patient
                </Link>
              </div>
            </div>

            {/* Dev Mode Accounts Selector */}
            <div className="mt-6 pt-5 border-t border-slate-100">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  1-Click Role Login & Live Detect
                </span>
                <span className="text-[9px] text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded-sm">
                  Active
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {DEMO_USERS.slice(0, 6).map((demo) => (
                  <button
                    key={demo.role}
                    type="button"
                    onClick={() => fillDemoAccount(demo.email)}
                    className="p-2 text-left border border-slate-200 hover:bg-blue-50/50 hover:border-blue-300 rounded-lg text-[10px] transition-all cursor-pointer group"
                  >
                    <span className="font-bold text-slate-800 block group-hover:text-blue-700 leading-tight">
                      {demo.role.replace("_", " ")}
                    </span>
                    <span className="text-slate-400 block truncate text-[9px]">
                      {demo.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Institutional verification notice */}
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 text-[10px] text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Protected under National Digital Health Mission (ABDM) & HIPAA guidelines.</span>
            </div>
          </div>

          {/* ──── RIGHT PANEL: "Where the platform has reached" Map Card ──── */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            
            {/* The India Spread Map */}
            <IndiaSpreadMap
              statesData={statesData}
              selectedStateId={selectedStateId}
              onSelectState={(st) => setSelectedStateId(st.id)}
              recentActiveStateId={recentActiveStateId}
            />

            {/* Summary Line matching exact screenshot phrasing: 
                "Reached 2 states, 2 districts — affecting 9 lives." */}
            <div className="bg-white border border-slate-200/80 px-5 py-3 rounded-xl shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
              <div className="text-slate-600 font-medium">
                Reached <strong className="text-slate-900">{summary.totalStates} states</strong>,{" "}
                <strong className="text-slate-900">{summary.totalDistricts} districts</strong> — affecting{" "}
                <strong className="text-blue-700 font-bold">{summary.totalLivesAffected} lives</strong>.
              </div>

              {/* Reset to baseline button */}
              <button
                type="button"
                onClick={() => {
                  PlatformReachService.resetToInitialScreenshotBaseline();
                  refreshReachData();
                }}
                title="Reset to initial screenshot values"
                className="text-[11px] text-slate-400 hover:text-slate-700 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                Reset Baseline
              </button>
            </div>

            {/* Live Detection Simulator & Recent Login Ticker */}
            <div className="bg-white border border-slate-200/80 p-4 rounded-xl shadow-2xs text-left">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-blue-600" />
                  Live Login Detection Simulator
                </span>
                <span className="text-[10px] text-slate-400">Click to test live state map detection:</span>
              </div>

              {/* Simulation Quick Buttons */}
              <div className="flex flex-wrap gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => handleSimulateLogin("DOCTOR", "AP", "Andhra Pradesh")}
                  className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-lg text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1"
                >
                  <Stethoscope className="w-3 h-3 text-blue-600" />
                  + Doctor in Andhra Pradesh
                </button>
                <button
                  type="button"
                  onClick={() => handleSimulateLogin("PATIENT", "MP", "Madhya Pradesh")}
                  className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded-lg text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1"
                >
                  <Heart className="w-3 h-3 text-rose-500" />
                  + Patient in Madhya Pradesh
                </button>
                <button
                  type="button"
                  onClick={() => handleSimulateLogin("DOCTOR", "AR", "Arunachal Pradesh")}
                  className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 rounded-lg text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1"
                >
                  <Stethoscope className="w-3 h-3 text-indigo-600" />
                  + Clinician in Arunachal Pradesh
                </button>
                <button
                  type="button"
                  onClick={() => handleSimulateLogin("PATIENT", "CG", "Chhattisgarh")}
                  className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1"
                >
                  <Heart className="w-3 h-3 text-emerald-600" />
                  + Patient in AIIMS Raipur
                </button>
              </div>

              {/* Recent Activity Ticker */}
              <div className="text-[11px] text-slate-500 border-t border-slate-100 pt-2.5">
                <span className="font-semibold text-slate-700 block mb-1">Recent Real-Time Logins:</span>
                <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
                  {recentLogins.slice(0, 4).map((log) => (
                    <div key={log.id} className="flex items-center justify-between text-[10.5px] text-slate-600 bg-slate-50 px-2 py-1 rounded-md">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className={`w-1.5 h-1.5 rounded-full ${log.userRole === "DOCTOR" ? "bg-blue-500" : "bg-rose-500"}`} />
                        <span className="font-medium text-slate-800">{log.userName}</span>
                        <span className="text-slate-400">({log.userRole})</span>
                        <span className="text-slate-600 truncate">&bull; {log.stateName}</span>
                      </div>
                      <span className="text-[9.5px] text-slate-400 shrink-0 font-mono ml-2">{log.timestamp}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>

        </div>
      </main>

      {/* ─── Institutional Footer (Matching reference screenshot) ─── */}
      <footer className="bg-[#1e293b] text-slate-300 py-3 px-4 text-center text-xs tracking-wide">
        <p className="font-medium">
          Developed by <strong>IITI DRISHTI CPS FOUNDATION</strong> IN ASSOCIATION WITH <strong>AIIMS RAIPUR</strong> & <strong>IIT INDORE</strong>
        </p>
      </footer>

    </div>
  );
};
