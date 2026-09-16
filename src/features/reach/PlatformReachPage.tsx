"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { 
  Building2, 
  ChevronRight,
  RotateCcw,
  UserCheck,
  ArrowLeft,
  Brain,
  MapPin,
  Sparkles,
  Stethoscope,
  Heart
} from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { 
  PlatformReachService, 
  StateReachData, 
  LoginEvent, 
  ReachSummary 
} from "../../services/platform-reach.service";

// Dynamic import for Leaflet India Map to avoid SSR window issues
const LeafletIndiaMap = dynamic(
  () => import("../../components/map/LeafletIndiaMap").then((mod) => mod.LeafletIndiaMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[600px] bg-white rounded-2xl border border-slate-200/80 flex flex-col items-center justify-center text-xs text-slate-500 font-medium gap-2.5 shadow-xs">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <span>Loading Survey of India Official Administrative Map...</span>
      </div>
    )
  }
);

export const PlatformReachPage: React.FC = () => {
  const { user } = useAuth();
  const [statesData, setStatesData] = useState<Record<string, StateReachData>>({});
  const [selectedStateId, setSelectedStateId] = useState<string>("AP");
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

  const activeState = statesData[selectedStateId] || {
    id: "AP",
    name: "Andhra Pradesh",
    clinicians: 1,
    patients: 5,
    radiologists: 1,
    nurses: 1,
    fieldWorkers: 1,
    admins: 0,
    districts: [
      { name: "Guntur", clinicians: 1, patients: 3, radiologists: 1, nurses: 1, livesAffected: 5, centerName: "AIIMS Mangalagiri" },
      { name: "Visakhapatnam", clinicians: 0, patients: 2, radiologists: 0, nurses: 0, livesAffected: 4, centerName: "Visakhapatnam District Hospital" }
    ],
    activeCenters: ["AIIMS Mangalagiri Clinical Center", "Visakhapatnam District Hospital"]
  };

  const refreshData = () => {
    const states = PlatformReachService.getStates();
    const sum = PlatformReachService.getSummaryMetrics();
    const logins = PlatformReachService.getRecentLogins();
    setStatesData(states);
    setSummary(sum);
    setRecentLogins(logins);
  };

  useEffect(() => {
    refreshData();

    const handleReachUpdate = () => refreshData();
    const handleLoginUpdate = (e: any) => {
      refreshData();
      if (e.detail?.logins && e.detail.logins.length > 0) {
        const latest = e.detail.logins[0];
        setLatestLiveLoginToast(latest);
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

  const handleSimulateLogin = (
    role: "DOCTOR" | "PATIENT" | "RADIOLOGIST",
    stateId: string,
    stateName: string,
    districtName: string
  ) => {
    const mockUser: any = {
      id: `sim-${Date.now()}`,
      name: role === "DOCTOR" ? "Dr. K. S. Rao" : role === "PATIENT" ? "Meera Sharma" : "Dr. Rajesh Kumar",
      role,
      institution: `${stateName} Regional Health Unit`,
      hospitalName: `${districtName} Clinical Center`
    };

    const event = PlatformReachService.recordUserLogin(mockUser, stateId);
    setSelectedStateId(stateId);
    setLatestLiveLoginToast(event);
    refreshData();
  };

  return (
    <div className="min-h-screen bg-[#FAFBFD] flex flex-col justify-between font-sans text-slate-800 antialiased">
      
      {/* ─── Institutional Header Banner (Harmonized with BreastCare AI) ─── */}
      <header className="bg-white border-b border-slate-200/80 px-4 sm:px-6 py-2.5 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          
          {/* Left Brand: BreastCare AI + DRISHTI CPS + CharakDT */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-primary to-accent-teal flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
                <Brain className="w-4.5 h-4.5" />
              </div>
              <div className="text-left leading-tight">
                <span className="font-extrabold text-slate-900 text-sm tracking-tight block">
                  NariSetu <span className="text-accent-teal">AI</span>
                </span>
                <span className="text-[8.5px] font-semibold text-slate-400 block">
                  National Clinical Reach
                </span>
              </div>
            </Link>

            <span className="h-6 w-px bg-slate-200 hidden md:block" />

            {/* DRISHTI CPS Foundation & CharakDT */}
            <div className="flex items-center gap-2.5">
              <img
                src="/assets/logos/drishti-cps-logo.png"
                alt="DRISHTI CPS Foundation"
                className="h-10 w-auto object-contain shrink-0"
              />
              <div className="text-left hidden lg:block">
                <div className="flex items-baseline gap-1">
                  <span className="text-base font-black tracking-tight text-slate-900 font-sans">
                    charak<span className="text-rose-600">dt</span>
                  </span>
                  <span className="text-[7.5px] font-bold uppercase tracking-widest text-slate-400">
                    PLATFORM
                  </span>
                </div>
                <span className="text-[7px] uppercase font-bold tracking-wider text-slate-500 block">
                  UNIFIED DIGITAL TWIN
                </span>
              </div>
            </div>
          </div>

          {/* Center Platform Title */}
          <div className="text-center px-2">
            <h1 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
              DRISHTI-SCD &bull; CLINICAL REACH
            </h1>
            <p className="text-[10.5px] text-slate-500 font-medium">
              Detection and Risk Inference of Severity for Healthcare Trajectories in India
            </p>
          </div>

          {/* Right Partner Emblems: Real IIT Indore & AIIMS Bhopal Logos */}
          <div className="flex items-center gap-3">
            <img
              src="/assets/logos/iit-indore-logo.png"
              alt="IIT Indore"
              title="Indian Institute of Technology Indore"
              className="h-10 w-auto object-contain shrink-0 hover:scale-105 transition-transform"
            />
            <img
              src="/assets/logos/aiims-logo.png"
              alt="AIIMS Bhopal"
              title="All India Institute of Medical Sciences Bhopal"
              className="h-10 w-auto object-contain shrink-0 hover:scale-105 transition-transform"
            />

            {user ? (
              <Link
                href={
                  user.role === "PATIENT" ? "/patient/dashboard" :
                  user.role === "DOCTOR" ? "/doctor/dashboard" :
                  user.role === "RADIOLOGIST" ? "/radiologist/dashboard" :
                  user.role === "HOSPITAL_ADMIN" ? "/hospital/dashboard" :
                  user.role === "BREAST_CARE_NURSE" ? "/nurse" : "/patient/dashboard"
                }
                className="px-3.5 py-1.5 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-xl transition-all shadow-xs flex items-center gap-1.5 ml-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="px-3.5 py-1.5 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-xl transition-all shadow-xs flex items-center gap-1 ml-1"
              >
                <span>Login</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>

        </div>
      </header>

      {/* ─── Clean Real-Time Login Notification ─── */}
      {latestLiveLoginToast && (
        <div className="bg-slate-900 border-b border-teal-900/40 text-white text-xs px-4 py-1.5 text-center flex items-center justify-center gap-2 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 animate-pulse" />
          <span>
            <strong>User Detected:</strong> {latestLiveLoginToast.userName} ({latestLiveLoginToast.userRole}) active in <strong>{latestLiveLoginToast.stateName}</strong> • {latestLiveLoginToast.district}
          </span>
          <span className="text-slate-400 text-[10px] font-mono">[{latestLiveLoginToast.timestamp}]</span>
        </div>
      )}

      {/* ─── Main Clinical Spread Container (Aligned with App Cards) ─── */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-3 flex-1 space-y-3">
        
        {/* Sleek, Single-Row Clinical Reach Telemetry Bar Matching BreastCare AI */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200/80 px-5 py-2.5 rounded-2xl shadow-xs text-xs">
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-slate-600 font-medium">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Clinicians:</span>
              <span className="font-bold text-slate-900 text-sm">{summary.totalClinicians}</span>
            </div>
            <span className="text-slate-200 hidden sm:inline">&bull;</span>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Screened Patients:</span>
              <span className="font-bold text-slate-900 text-sm">{summary.totalPatients}</span>
            </div>
            <span className="text-slate-200 hidden sm:inline">&bull;</span>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-sky-500" />
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Active States:</span>
              <span className="font-bold text-slate-900 text-sm">{summary.totalStates}</span>
            </div>
            <span className="text-slate-200 hidden sm:inline">&bull;</span>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Lives Affected:</span>
              <span className="font-bold text-slate-900 text-sm">{summary.totalLivesAffected}</span>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 font-medium hidden md:flex items-center gap-3">
            <span>
              Reached <strong className="text-primary font-bold">{summary.totalStates} states</strong>, <strong className="text-slate-900">{summary.totalDistricts} districts</strong> — affecting <strong className="text-primary font-bold">{summary.totalLivesAffected} lives</strong>
            </span>
            <button
              type="button"
              onClick={() => {
                PlatformReachService.resetToInitialScreenshotBaseline();
                refreshData();
              }}
              title="Reset Initial Baseline"
              className="text-[10px] text-slate-400 hover:text-primary flex items-center gap-1 cursor-pointer transition-colors border-l border-slate-200 pl-2.5"
            >
              <RotateCcw className="w-2.5 h-2.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* ─── Main Map & Inspection Grid ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          
          {/* Big, Prominent India Map Viewport (8 Columns) */}
          <div className="lg:col-span-8 flex flex-col gap-2">
            <LeafletIndiaMap
              statesData={statesData}
              selectedStateId={selectedStateId}
              onSelectState={(st) => setSelectedStateId(st.id)}
            />
          </div>

          {/* Right Inspection & Telemetry Panel (4 Columns) */}
          <div className="lg:col-span-4 space-y-3 text-left">
            
            {/* Selected State Card */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 mb-3">
                <div>
                  <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider">
                    Selected Region
                  </span>
                  <h3 className="text-base font-bold text-slate-900 leading-tight">
                    {activeState.name}
                  </h3>
                </div>
                <span className="px-2 py-0.5 bg-teal-50 text-primary border border-teal-200/60 font-mono text-xs font-bold rounded-lg">
                  {activeState.id}
                </span>
              </div>

              {/* State Counts */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="bg-teal-50/40 p-2.5 rounded-xl border border-teal-100/60">
                  <span className="text-[9.5px] font-bold text-teal-800 block uppercase">Clinicians</span>
                  <span className="text-lg font-black text-primary block">{activeState.clinicians}</span>
                </div>
                <div className="bg-emerald-50/40 p-2.5 rounded-xl border border-emerald-100/60">
                  <span className="text-[9.5px] font-bold text-emerald-800 block uppercase">Patients</span>
                  <span className="text-lg font-black text-emerald-700 block">{activeState.patients}</span>
                </div>
              </div>

              {/* Mapped Hospitals */}
              <div className="space-y-1.5 mb-3">
                <span className="text-[10px] font-bold text-slate-700 block">Active Health Centers:</span>
                {activeState.activeCenters && activeState.activeCenters.length > 0 ? (
                  <div className="space-y-1">
                    {activeState.activeCenters.map((center, idx) => (
                      <div key={idx} className="flex items-start gap-1.5 text-[11px] text-slate-700 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                        <Building2 className="w-3 h-3 text-primary mt-0.5 shrink-0" />
                        <span>{center}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-400 italic bg-slate-50 p-1.5 rounded-lg">
                    No clinical center registered in this state yet.
                  </div>
                )}
              </div>

              {/* District Breakdown */}
              {activeState.districts && activeState.districts.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold text-slate-700 block mb-1">Districts:</span>
                  <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                    {activeState.districts.map((d, i) => (
                      <div key={i} className="flex items-center justify-between text-[11px] p-1.5 bg-slate-50 rounded-lg border border-slate-100">
                        <span className="font-medium text-slate-800">{d.name}</span>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                          <span>{d.clinicians} doc</span>
                          <span>•</span>
                          <span>{d.livesAffected} lives</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Regional Login Simulation Buttons */}
            <div className="bg-white border border-slate-200/80 p-3 rounded-2xl shadow-xs">
              <span className="text-[10px] font-bold text-slate-500 block uppercase tracking-wider mb-2">
                Simulate Sign-In Detection
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => handleSimulateLogin("DOCTOR", "AP", "Andhra Pradesh", "Guntur")}
                  className="px-2.5 py-1.5 bg-white hover:bg-teal-50/70 hover:border-primary/40 text-slate-700 border border-slate-200 rounded-xl text-[11px] font-medium transition-all cursor-pointer truncate text-left shadow-2xs"
                  title="Simulate Doctor in Andhra Pradesh"
                >
                  + Doctor (AP)
                </button>
                <button
                  type="button"
                  onClick={() => handleSimulateLogin("DOCTOR", "AR", "Arunachal Pradesh", "Papum Pare")}
                  className="px-2.5 py-1.5 bg-white hover:bg-teal-50/70 hover:border-primary/40 text-slate-700 border border-slate-200 rounded-xl text-[11px] font-medium transition-all cursor-pointer truncate text-left shadow-2xs"
                  title="Simulate Doctor in Arunachal Pradesh"
                >
                  + Doctor (AR)
                </button>
                <button
                  type="button"
                  onClick={() => handleSimulateLogin("PATIENT", "MP", "Madhya Pradesh", "Indore")}
                  className="px-2.5 py-1.5 bg-white hover:bg-teal-50/70 hover:border-primary/40 text-slate-700 border border-slate-200 rounded-xl text-[11px] font-medium transition-all cursor-pointer truncate text-left shadow-2xs"
                  title="Simulate Patient in Madhya Pradesh"
                >
                  + Patient (MP)
                </button>
                <button
                  type="button"
                  onClick={() => handleSimulateLogin("DOCTOR", "CG", "Chhattisgarh", "Raipur")}
                  className="px-2.5 py-1.5 bg-white hover:bg-teal-50/70 hover:border-primary/40 text-slate-700 border border-slate-200 rounded-xl text-[11px] font-medium transition-all cursor-pointer truncate text-left shadow-2xs"
                  title="Simulate Doctor in AIIMS Raipur"
                >
                  + Doctor (AIIMS)
                </button>
              </div>
            </div>

            {/* Audit Log Stream */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <UserCheck className="w-3 h-3 text-primary" />
                  Recent Sign-Ins
                </span>
                <span className="text-[9.5px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200">Live</span>
              </div>

              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {recentLogins.slice(0, 4).map((log) => (
                  <div key={log.id} className="p-1.5 bg-slate-50 border border-slate-100 rounded-xl text-[11px] flex items-center justify-between gap-2">
                    <div className="truncate">
                      <div className="font-semibold text-slate-800 truncate">{log.userName}</div>
                      <div className="text-[9.5px] text-slate-400 truncate">
                        <span className={log.userRole === "DOCTOR" ? "text-primary font-bold" : "text-emerald-700 font-bold"}>
                          {log.userRole}
                        </span>{" "}
                        &bull; {log.stateName}
                      </div>
                    </div>
                    <span className="text-[9.5px] text-slate-400 shrink-0 font-mono">
                      {log.timestamp}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </main>

      {/* ─── Harmonized Institutional Footer ─── */}
      <footer className="bg-white border-t border-slate-200 py-3.5 px-6 text-center text-xs text-slate-500 mt-2">
        <p className="font-medium">
          Developed by <strong className="text-slate-800">IITI DRISHTI CPS FOUNDATION</strong> in association with <strong className="text-slate-800">AIIMS BHOPAL</strong> & <strong className="text-slate-800">IIT INDORE</strong>
        </p>
      </footer>

    </div>
  );
};
