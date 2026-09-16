"use client";

import Link from "next/link";
import React from "react";
import { 
  MessageSquare, 
  Calendar, 
  Clock
} from "lucide-react";
import { mockCareTeam } from "../../mocks/patient-portal.mock";


export const CareTeamPage: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs space-y-2">
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Multidisciplinary Medical Staff</span>
        <h2 className="text-lg font-black text-slate-800">Your Assigned Oncological Care Team</h2>
        <p className="text-xs text-slate-500 max-w-xl leading-relaxed">
          Your care is managed by a dedicated multidisciplinary team at <strong>IIT Indore Drishti Clinic</strong> comprising lead oncologists, radiologists, and care coordinators.
        </p>
      </div>

      {/* Care Team Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {mockCareTeam.map((member) => (
          <div key={member.id} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-200 transition-all">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-black text-base shrink-0">
                {member.initials}
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                  {member.role}
                </span>
                <h3 className="text-sm font-black text-slate-800">{member.name}</h3>
                <p className="text-xs text-slate-500 font-medium">{member.department} • {member.hospital}</p>
                {member.availability && (
                  <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Availability: {member.availability}
                  </p>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] text-slate-400">Patient-facing provider</span>
              <div className="flex gap-2">
                <Link href="/patient/connect/messages"
                  className="px-3 py-1.5 border border-slate-200 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-1"
                >
                  <MessageSquare className="w-3.5 h-3.5" /> Message
                </Link>
                <Link href="/patient/connect"
                  className="px-3 py-1.5 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-hover transition-colors flex items-center gap-1"
                >
                  <Calendar className="w-3.5 h-3.5" /> Book
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
