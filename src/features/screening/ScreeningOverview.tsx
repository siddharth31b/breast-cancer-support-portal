"use client";

import Link from "next/link";
import React from "react";

import { 
  Upload, 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  ChevronRight
} from "lucide-react";
import { mockReports, mockAIAssessment, mockDoctorReview, mockJourney } from "../../mocks/patient-portal.mock";
import { StatusBadge } from "../../components/patient/StatusBadge";
import { MedicalDisclaimer } from "../../components/patient/MedicalDisclaimer";

export const ScreeningOverview: React.FC = () => {
  const latestReport = mockReports[0];
  const aiStatus = mockAIAssessment;
  const doctorStatus = mockDoctorReview;

  return (
    <div className="space-y-6">
      {/* Disclaimer */}
      <MedicalDisclaimer variant="ai" />

      {/* Main Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Screening Stage */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Current Stage</span>
            <StatusBadge status="Active" />
          </div>
          <p className="text-base font-black text-slate-800 mb-1">Clinical Review</p>
          <p className="text-xs text-slate-500 mb-4">Stage 5 of 7 — Assigned oncologist is evaluating AI outputs.</p>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-4">
            <div className="bg-primary h-full rounded-full transition-all" style={{ width: `${mockJourney.overallProgress}%` }} />
          </div>
          <Link href="/patient/care/journey"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
          >
            Track full journey <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Latest Report Uploaded */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Latest Uploaded Report</span>
            <StatusBadge status={latestReport.status} />
          </div>
          <p className="text-base font-black text-slate-800 truncate mb-1">{latestReport.title}</p>
          <p className="text-xs text-slate-500 mb-4">Uploaded on {new Date(latestReport.uploadedAt).toLocaleDateString()} • {latestReport.fileType} ({latestReport.fileSizeMb} MB)</p>
          <Link href="/patient/screening/reports"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
          >
            View all reports <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* AI & Doctor Status */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Review Status</span>
              <StatusBadge status={doctorStatus.reviewStatus} />
            </div>
            <p className="text-base font-black text-slate-800 mb-1">{doctorStatus.assignedDoctor.name}</p>
            <p className="text-xs text-slate-500">{doctorStatus.assignedDoctor.specialty} • Review completed</p>
          </div>
          <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Risk Assessment: <strong className="text-amber-600 font-bold">{aiStatus.riskLevel}</strong></span>
            <Link href="/patient/screening/review"
              className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
            >
              Details <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Primary Action Banner */}
      <div className="bg-gradient-to-r from-primary via-[#00524B] to-[#007066] text-white rounded-2xl p-6 shadow-md flex items-center justify-between gap-6 flex-wrap">
        <div className="space-y-1 max-w-xl">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-300">Next Recommended Action</span>
          <h2 className="text-lg font-black tracking-tight">Upload Next Mammography or Clinical Documents</h2>
          <p className="text-xs text-white/80 leading-relaxed font-medium">
            Keeping your records updated ensures our AI model and clinical care team provide accurate, continuous screening insights.
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <Link href="/patient/screening/upload"
            className="px-4 py-2.5 bg-white text-[#005F56] hover:bg-emerald-50 text-xs font-black rounded-xl shadow-sm transition-all flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Upload Report
          </Link>
          <Link href="/patient/screening/ai"
            className="px-4 py-2.5 bg-white/10 border border-white/20 text-white hover:bg-white/20 text-xs font-semibold rounded-xl transition-all flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-emerald-300" />
            View AI Assessment
          </Link>
        </div>
      </div>

      {/* Recent Screening Activity Timeline */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs">
        <h3 className="text-sm font-black text-slate-800 mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" />
          Recent Screening Activity
        </h3>
        <div className="space-y-4">
          <div className="flex items-start gap-3.5">
            <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">Doctor Clinical Review Finalised</p>
              <p className="text-[11px] text-slate-500">Dr. Sarah Iyer completed clinical interpretation of Bilateral Mammography Report.</p>
              <span className="text-[10px] text-slate-400 mt-0.5 block">Nov 13, 2025 • 2:00 PM</span>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-7 h-7 rounded-full bg-violet-50 text-violet-600 flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">AI Screening Pipeline Analysis Complete</p>
              <p className="text-[11px] text-slate-500">NariSetu-AI v2.3.1 completed automated image density and asymmetry processing.</p>
              <span className="text-[10px] text-slate-400 mt-0.5 block">Nov 11, 2025 • 10:00 AM</span>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">New Report Uploaded by Patient</p>
              <p className="text-[11px] text-slate-500">Bilateral Mammography Report (PDF, 2.4 MB) added to screening library.</p>
              <span className="text-[10px] text-slate-400 mt-0.5 block">Nov 10, 2025 • 9:30 AM</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
