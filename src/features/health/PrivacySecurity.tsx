import React, { useState } from "react";
import { 
  Trash2, 
  Download, 
  AlertTriangle 
} from "lucide-react";
import { mockActiveSessions } from "../../mocks/patient-portal.mock";

export const PrivacySecurityPage: React.FC = () => {
  const [sessions] = useState(mockActiveSessions);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Security Summary */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <h2 className="text-base font-black text-slate-800">Privacy, Security & Data Consent</h2>
          <p className="text-xs text-slate-500 font-medium">Manage credentials, active sessions, and data permissions.</p>
        </div>

        {/* Password & 2FA */}
        <div className="space-y-3">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Account Credentials</h3>
          <div className="p-4 bg-slate-50 rounded-xl flex justify-between items-center">
            <div>
              <p className="text-xs font-bold text-slate-800">Password</p>
              <p className="text-[11px] text-slate-500">Last changed 3 months ago</p>
            </div>
            <button className="px-3.5 py-1.5 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-white">
              Change Password
            </button>
          </div>
        </div>

        {/* Active Sessions */}
        <div className="space-y-3">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Active Device Sessions</h3>
          <div className="space-y-2">
            {sessions.map((s) => (
              <div key={s.id} className="p-3 bg-slate-50 rounded-xl flex justify-between items-center text-xs">
                <div>
                  <p className="font-bold text-slate-800">{s.device} {s.isCurrent && <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">Current Session</span>}</p>
                  <p className="text-[11px] text-slate-500">{s.location} • Last active {new Date(s.lastActiveAt).toLocaleString()}</p>
                </div>
                {!s.isCurrent && (
                  <button className="text-xs font-bold text-red-600 hover:underline">Revoke</button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Data & Deactivation */}
        <div className="pt-4 border-t border-slate-100 flex justify-between items-center flex-wrap gap-3">
          <button className="px-4 py-2 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-50 flex items-center gap-1.5">
            <Download className="w-4 h-4" /> Export Personal Data
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="px-4 py-2 bg-red-50 text-red-600 font-bold text-xs rounded-xl hover:bg-red-100 transition-colors flex items-center gap-1.5"
          >
            <Trash2 className="w-4 h-4" /> Request Account Deactivation
          </button>
        </div>
      </div>

      {/* Account Deactivation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-base font-black text-slate-800">Confirm Account Deactivation Request</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Deactivating your account will archive your screening records in accordance with medical retention laws. This action requires specialist verification and cannot be immediately reversed.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-slate-200 text-slate-600 font-bold text-xs rounded-xl hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert("Deactivation request submitted to hospital compliance team.");
                  setShowDeleteModal(false);
                }}
                className="px-4 py-2 bg-red-600 text-white font-bold text-xs rounded-xl hover:bg-red-700"
              >
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
