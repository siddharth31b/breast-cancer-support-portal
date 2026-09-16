import React, { useState } from "react";
import { User, Sliders, Bell, Lock, Accessibility, Save, CheckCircle, RefreshCw } from "lucide-react";
import { useAuth } from "../../auth/AuthContext";

type SettingsTab = "profile" | "preferences" | "notifications" | "security" | "accessibility";

export const NurseSettings: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Profile Form
  const [name, setName] = useState(user?.name || "Sister Lakshmi");
  const [department, setDepartment] = useState("Breast Health Nursing Desk");
  const [hospital, setHospital] = useState(user?.hospitalName || "IIT Indore Main Campus Hospital");
  const [email, setEmail] = useState("lakshmi.nurse@iitindore.ac.in");
  const [phone, setPhone] = useState("+91 98765-11223");

  // Preferences
  const [defaultFilter, setDefaultFilter] = useState("Awaiting Intake");
  const [units, setUnits] = useState("Metric (cm, kg)");
  const [autoSaveDrafts, setAutoSaveDrafts] = useState(true);

  // Notifications
  const [notifNewIntake, setNotifNewIntake] = useState(true);
  const [notifAssignedTask, setNotifAssignedTask] = useState(true);
  const [notifMissingReport, setNotifMissingReport] = useState(true);
  const [notifFollowUp, setNotifFollowUp] = useState(true);

  // Password
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    setIsSaving(false);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const tabs: { id: SettingsTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: "profile", label: "Profile", icon: User },
    { id: "preferences", label: "Work Preferences", icon: Sliders },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Lock },
    { id: "accessibility", label: "Accessibility", icon: Accessibility },
  ];

  return (
    <div className="space-y-6 text-left max-w-4xl mx-auto pb-16">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/60 pb-5">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">
            Nurse Portal Settings
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage your nursing desk preferences, staff profile and notification settings.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-0.5 border-b border-slate-200 scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl whitespace-nowrap transition-all border-b-2 ${
                activeTab === tab.id
                  ? "border-primary text-primary bg-primary/5"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Panel */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-6 text-xs">
        {activeTab === "profile" && (
          <div className="space-y-4">
            <h3 className="font-bold text-slate-800 text-sm">Staff Profile Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-500 mb-1">Full Name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl" />
              </div>
              <div>
                <label className="block font-bold text-slate-500 mb-1">Staff ID (Read-only)</label>
                <input value="NURSE-IND-884" readOnly className="w-full px-3.5 py-2.5 bg-slate-100 border rounded-xl font-mono text-slate-500" />
              </div>
              <div>
                <label className="block font-bold text-slate-500 mb-1">Department</label>
                <input value={department} onChange={(e) => setDepartment(e.target.value)} className="w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl" />
              </div>
              <div>
                <label className="block font-bold text-slate-500 mb-1">Hospital / Clinic</label>
                <input value={hospital} onChange={(e) => setHospital(e.target.value)} className="w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl" />
              </div>
              <div>
                <label className="block font-bold text-slate-500 mb-1">Work Email</label>
                <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl" />
              </div>
              <div>
                <label className="block font-bold text-slate-500 mb-1">Desk Phone</label>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl" />
              </div>
            </div>
          </div>
        )}

        {activeTab === "preferences" && (
          <div className="space-y-4">
            <h3 className="font-bold text-slate-800 text-sm">Nursing Work Preferences</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-500 mb-1">Default Queue Filter</label>
                <select value={defaultFilter} onChange={(e) => setDefaultFilter(e.target.value)} className="w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl">
                  <option>Awaiting Intake</option>
                  <option>Draft Intake</option>
                  <option>Needs Clarification</option>
                  <option>All Patients</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-500 mb-1">Measurement Units</label>
                <select value={units} onChange={(e) => setUnits(e.target.value)} className="w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl">
                  <option>Metric (cm, kg)</option>
                  <option>Imperial (in, lbs)</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <input type="checkbox" id="as" checked={autoSaveDrafts} onChange={(e) => setAutoSaveDrafts(e.target.checked)} />
              <label htmlFor="as" className="font-semibold text-slate-700">Auto-save clinical intake drafts while typing</label>
            </div>
          </div>
        )}

        {activeTab === "notifications" && (
          <div className="space-y-3">
            <h3 className="font-bold text-slate-800 text-sm mb-2">Notification Alert Preferences</h3>
            {[
              { label: "New intake patient arrivals", val: notifNewIntake, set: setNotifNewIntake },
              { label: "Assigned nurse tasks from doctors", val: notifAssignedTask, set: setNotifAssignedTask },
              { label: "Missing report alerts", val: notifMissingReport, set: setNotifMissingReport },
              { label: "Follow-up due reminders", val: notifFollowUp, set: setNotifFollowUp },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl">
                <span className="font-semibold text-slate-700">{item.label}</span>
                <input type="checkbox" checked={item.val} onChange={(e) => item.set(e.target.checked)} />
              </div>
            ))}
          </div>
        )}

        {activeTab === "security" && (
          <div className="space-y-4">
            <h3 className="font-bold text-slate-800 text-sm">Security &amp; Password</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-500 mb-1">Current Password</label>
                <input type="password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} className="w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl" />
              </div>
              <div>
                <label className="block font-bold text-slate-500 mb-1">New Password</label>
                <input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} className="w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl" />
              </div>
            </div>
          </div>
        )}

        {activeTab === "accessibility" && (
          <div className="space-y-3">
            <h3 className="font-bold text-slate-800 text-sm mb-2">Accessibility Options</h3>
            <div className="p-3 bg-slate-50 border rounded-xl">
              <span className="font-semibold text-slate-700">Screen Reader Landmarks Enabled</span>
            </div>
            <div className="p-3 bg-slate-50 border rounded-xl">
              <span className="font-semibold text-slate-700">Minimum Touch Targets ≥44px Active</span>
            </div>
          </div>
        )}

        <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
          <button onClick={handleSave} disabled={isSaving} className="px-6 py-2.5 bg-primary text-white font-bold rounded-xl flex items-center gap-1.5 shadow-md shadow-primary/15">
            {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Settings
          </button>
          {isSaved && <span className="text-emerald-600 font-bold flex items-center gap-1"><CheckCircle className="w-4 h-4" /> Settings updated.</span>}
        </div>
      </div>
    </div>
  );
};
