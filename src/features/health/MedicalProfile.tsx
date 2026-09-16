import React from "react";
import { mockMedicalProfile } from "../../mocks/patient-portal.mock";

export const MedicalProfilePage: React.FC = () => {
  const profile = mockMedicalProfile;

  return (
    <div className="space-y-6">
      {/* Completion Header */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs flex flex-wrap justify-between items-center gap-4">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Clinical History & Profile</span>
          <h2 className="text-lg font-black text-slate-800">Patient Comprehensive Medical History</h2>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">Used by clinical care team for oncological risk stratifications.</p>
        </div>
        <div className="text-right">
          <span className="text-xl font-black text-primary">{profile.completionPercent}%</span>
          <span className="text-[10px] text-slate-400 block font-semibold">Profile Completion</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Medical History */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs space-y-3">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Medical Conditions History</h3>
          <ul className="space-y-2 text-xs text-slate-700 font-medium">
            {profile.medicalHistory.map((item, i) => (
              <li key={i} className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">• {item}</li>
            ))}
          </ul>
        </div>

        {/* Family History */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs space-y-3">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Family Oncology & Health History</h3>
          <ul className="space-y-2 text-xs text-slate-700 font-medium">
            {profile.familyHistory.map((item, i) => (
              <li key={i} className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">• {item}</li>
            ))}
          </ul>
        </div>

        {/* Current Medications */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs space-y-3">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Active Medications</h3>
          <div className="space-y-2">
            {profile.medications.map((m, i) => (
              <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex justify-between text-xs font-medium">
                <span className="font-bold text-slate-800">{m.name} ({m.dose})</span>
                <span className="text-slate-500">{m.frequency}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Allergies */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs space-y-3">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Documented Allergies</h3>
          <div className="flex flex-wrap gap-2">
            {profile.allergies.map((a, i) => (
              <span key={i} className="px-3 py-1 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs font-bold">
                ⚠️ {a}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
