import React, { useState } from "react";
import { DashboardService } from "../../services/dashboard.service";
import { 
  Users, 
  MapPin, 
  WifiOff, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle, 
  BookmarkCheck, 
  Heart,
  Globe,
  Loader2
} from "lucide-react";

export const CHWDashboard: React.FC = () => {
  const data = DashboardService.getCHWData();
  const [offlineCount, setOfflineCount] = useState(data.offlineRecordCount);
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState(data.syncStatus);
  const [visits, setVisits] = useState(data.visitsList);

  const handleSync = () => {
    if (offlineCount === 0) return;
    setSyncing(true);
    setSyncStatus("Synchronizing files...");
    setTimeout(() => {
      setOfflineCount(0);
      setSyncing(false);
      setSyncStatus("Connected - All changes synced");
      // Mark all visits as completed for demonstration
      setVisits(visits.map(v => ({ ...v, done: true })));
    }, 1500);
  };

  const handleCompleteVisit = (id: string) => {
    setVisits(visits.map(v => v.id === id ? { ...v, done: !v.done } : v));
  };

  return (
    <div className="space-y-6 text-left">
      {/* Dev & Camp Header */}
      <div className="bg-orange-50 border border-orange-100 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="text-left space-y-1">
          <span className="font-bold uppercase tracking-wider bg-orange-600 text-white text-[9px] px-1.5 py-0.5 rounded-sm">Field Operations</span>
          <h2 className="font-bold text-slate-800 text-sm">Today's Camp: {data.campSchedule}</h2>
          <p className="text-xs text-slate-500">Language preference: <strong>English / Hindi (मराठी)</strong></p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-orange-850">
          <WifiOff className="w-4 h-4 text-orange-600 shrink-0" />
          <span>Network state: <strong>{data.connectivityStatus}</strong></span>
        </div>
      </div>

      {/* Sync Status Action Box */}
      <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="text-left">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Synchronization Engine</span>
          <h3 className="font-bold text-slate-800 text-sm mt-1 flex items-center gap-1.5">
            {offlineCount > 0 ? (
              <>
                <AlertCircle className="w-4 h-4 text-orange-500" />
                {offlineCount} screenings saved offline
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                All local files synchronized
              </>
            )}
          </h3>
          <p className="text-[10px] text-slate-400 mt-1">Status: {syncStatus}</p>
        </div>
        <button
          onClick={handleSync}
          disabled={syncing || offlineCount === 0}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-primary disabled:bg-primary/50 text-white font-semibold rounded-xl text-xs shadow-sm hover:bg-primary-hover cursor-pointer"
        >
          {syncing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Syncing...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4" />
              Sync Records Now
            </>
          )}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Visits */}
        <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-xs flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Scheduled Visits</span>
            <h2 className="text-3xl font-black text-slate-800 leading-none">{data.visitsToday}</h2>
            <p className="text-[10px] text-slate-400">Village homes agenda</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
            <MapPin className="w-6 h-6" />
          </div>
        </div>

        {/* Registrations */}
        <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-xs flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Assisted Registrations</span>
            <h2 className="text-3xl font-black text-slate-800 leading-none">{data.registrationsPending}</h2>
            <p className="text-[10px] text-slate-400">New patients profiles</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-primary flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Pending Screenings */}
        <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-xs flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Field Assessments</span>
            <h2 className="text-3xl font-black text-slate-800 leading-none">{data.screeningsPending}</h2>
            <p className="text-[10px] text-slate-400">Symptom checkcards</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <BookmarkCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Referrals */}
        <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-xs flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Active Referrals</span>
            <h2 className="text-3xl font-black text-slate-800 leading-none">{data.referralsPending}</h2>
            <p className="text-[10px] text-slate-400">Referred to IIT Indore oncology</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <Heart className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Touch-Friendly Visits Agenda */}
      <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-xs">
        <h3 className="font-bold text-slate-800 text-sm mb-4">Today's Visits Schedule</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {visits.map((visit) => (
            <div 
              key={visit.id}
              onClick={() => handleCompleteVisit(visit.id)}
              className={`
                p-5 border rounded-2xl transition-all cursor-pointer text-left flex flex-col justify-between min-h-[140px]
                ${visit.done 
                  ? "bg-emerald-50/20 border-emerald-200 text-slate-500" 
                  : "bg-slate-50 border-slate-100 hover:border-slate-300 text-slate-700"}
              `}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                    Time: {visit.time}
                  </span>
                  {visit.done && (
                    <span className="text-[8px] font-bold px-2 py-0.5 rounded-full text-emerald-800 bg-emerald-100">
                      Done
                    </span>
                  )}
                </div>
                <h4 className={`font-bold text-sm ${visit.done ? "line-through" : ""}`}>{visit.name}</h4>
                <p className="text-[10px] text-slate-400 mt-1">Village: <strong>{visit.village}</strong></p>
              </div>

              <div className="mt-4 flex items-center gap-1.5 text-[10px] font-semibold text-slate-600">
                <Globe className="w-3.5 h-3.5 text-slate-400" />
                <span>{visit.purpose}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
