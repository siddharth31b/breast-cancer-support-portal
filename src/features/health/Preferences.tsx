import React, { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { mockPreferences } from "../../mocks/patient-portal.mock";

export const PreferencesPage: React.FC = () => {
  const [prefs, setPrefs] = useState(mockPreferences);
  const [saved, setSaved] = useState(false);

  const toggleNotif = (key: keyof typeof prefs.notifications) => {
    setPrefs(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: !prev.notifications[key]
      }
    }));
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs space-y-6">
        <div className="flex justify-between items-center border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-black text-slate-800">Notification & Application Preferences</h2>
            <p className="text-xs text-slate-500 font-medium">Control how and when you receive portal alerts.</p>
          </div>
          {saved && (
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Preferences Saved
            </span>
          )}
        </div>

        <div className="space-y-4">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Notification Channels</h3>
          
          <div className="space-y-3">
            {Object.entries(prefs.notifications).map(([key, value]) => (
              <label key={key} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100/60">
                <span className="text-xs font-bold text-slate-700 capitalize">
                  {key.replace(/([A-Z])/g, " $1")}
                </span>
                <input
                  type="checkbox"
                  checked={value}
                  onChange={() => toggleNotif(key as any)}
                  className="w-4 h-4 accent-primary rounded cursor-pointer"
                />
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
