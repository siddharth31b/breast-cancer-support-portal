"use client";

import Link from "next/link";
import React from "react";
import { 
  CheckCircle2, 
  Calendar, 
  MessageSquare, 
  ShieldCheck
} from "lucide-react";
import { mockDoctorReview } from "../../mocks/patient-portal.mock";
import { StatusBadge } from "../../components/patient/StatusBadge";


export const DoctorReviewPage: React.FC = () => {
  const review = mockDoctorReview;

  return (
    <div className="space-y-6">
      {/* Explicit Distinction Banner */}
      <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4 flex gap-3 items-start">
        <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div className="text-xs text-emerald-900 leading-relaxed">
          <p className="font-bold mb-0.5">Clinical Evaluation vs. AI Screening</p>
          AI screening outputs are preliminary computational insights. The report below represents the <strong>binding clinical assessment</strong> completed by your assigned specialist physician.
        </div>
      </div>

      {/* Doctor Info & Review Header */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-black text-sm shrink-0">
              {review.assignedDoctor.initials}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-slate-800">{review.assignedDoctor.name}</h2>
                <StatusBadge status={review.reviewStatus} />
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {review.assignedDoctor.specialty} • Review completed on {new Date(review.reviewedAt!).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/patient/connect/messages"
              className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
            >
              <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
              Message Doctor
            </Link>
            <Link href="/patient/connect"
              className="px-3.5 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5"
            >
              <Calendar className="w-3.5 h-3.5" />
              Book Appointment
            </Link>
          </div>
        </div>

        {/* Doctor Clinical Interpretation */}
        <div className="space-y-2">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Clinical Interpretation</h3>
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-xs text-slate-700 leading-relaxed font-medium">
            {review.clinicalInterpretation}
          </div>
        </div>

        {/* AI vs Doctor Findings Comparison */}
        <div className="space-y-2">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Clinical Correlation vs. AI Findings</h3>
          <div className="bg-amber-50/60 border border-amber-200/60 rounded-xl p-4 text-xs text-amber-900 leading-relaxed font-medium">
            {review.differenceFromAI}
          </div>
        </div>

        {/* Recommended Tests & Follow-up Instructions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <div className="space-y-2">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Recommended Next Tests</h3>
            <ul className="space-y-2">
              {review.recommendedTests?.map((test, i) => (
                <li key={i} className="flex items-center gap-2 text-xs text-slate-700 font-semibold bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{test}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Follow-Up Instructions</h3>
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-600 leading-relaxed font-medium">
              {review.followUpInstructions}
            </div>
          </div>
        </div>

        {/* Doctor Visible Patient Notes */}
        {review.doctorNotes && (
          <div className="p-4 bg-teal-50/50 border border-teal-200/60 rounded-xl text-xs text-teal-900 leading-relaxed font-medium space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-teal-700 block">Doctor Notes to Patient</span>
            <p>{review.doctorNotes}</p>
          </div>
        )}
      </div>
    </div>
  );
};
