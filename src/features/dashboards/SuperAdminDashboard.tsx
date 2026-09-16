import React, { useState, useEffect } from "react";
import { DashboardService } from "../../services/dashboard.service";
import { 
  Building, 
  Users, 
  HardDrive, 
  FileSpreadsheet, 
  Cpu, 
  CheckCircle,
  Trash2,
  UserPlus
} from "lucide-react";

export const SuperAdminDashboard: React.FC = () => {
  const data = DashboardService.getSuperAdminData();
  const [doctors, setDoctors] = useState<any[]>([]);
  const [newDoctor, setNewDoctor] = useState({ name: "", email: "", password: "", hospitalName: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const res = await fetch("/api/admin/doctors");
      const data = await res.json();
      if (res.ok) setDoctors(data);
    } catch (e) { console.error(e); }
  };

  const handleAddDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin/doctors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newDoctor)
      });
      if (res.ok) {
        setNewDoctor({ name: "", email: "", password: "", hospitalName: "" });
        fetchDoctors();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to add doctor");
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleDeleteDoctor = async (id: string) => {
    if (!confirm("Are you sure you want to revoke this clinical account?")) return;
    try {
      const res = await fetch(`/api/admin/doctors?id=${id}`, { method: "DELETE" });
      if (res.ok) fetchDoctors();
    } catch (e) { console.error(e); }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Dev Header */}
      <div className="bg-red-50 border border-red-100 p-3.5 rounded-xl flex items-center justify-between text-xs text-red-800">
        <div className="flex items-center gap-2">
          <span className="font-bold uppercase tracking-wider bg-red-600 text-white text-[9px] px-1.5 py-0.5 rounded-sm">System Authority</span>
          <span>Logged in as: <strong>Super Administrator</strong> &bull; Node Controls: <strong>All Central Registries</strong></span>
        </div>
      </div>

      {/* Admin stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Onboarded Hospitals */}
        <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-xs flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Hospitals Onboarded</span>
            <h2 className="text-3xl font-black text-slate-800 leading-none">{data.hospitalsOnboarded}</h2>
            <p className="text-[10px] text-slate-400">Total hospital nodes online</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
            <Building className="w-6 h-6" />
          </div>
        </div>

        {/* Total Users */}
        <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-xs flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Active Users Directory</span>
            <h2 className="text-3xl font-black text-slate-800 leading-none">
              {Object.values(data.totalUsersByRole).reduce((a, b) => a + b, 0)}
            </h2>
            <p className="text-[10px] text-slate-400">{data.activeSessionsCount} active sessions</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* AI model in prod */}
        <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-xs flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">AI Registry State</span>
            <h2 className="text-xl font-extrabold text-slate-800 leading-none mt-1.5">{data.aiModelVersionProd}</h2>
            <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5">
              <Cpu className="w-3.5 h-3.5" /> Stable production release
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-primary flex items-center justify-center">
            <HardDrive className="w-6 h-6" />
          </div>
        </div>

        {/* Uptime */}
        <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-xs flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">System Health</span>
            <h2 className="text-3xl font-black text-slate-800 leading-none">{data.systemUptimePercent}%</h2>
            <p className="text-[10px] text-slate-400">{data.openIncidentsCount} Open Incidents</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Main Grid content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Hospital list registry */}
        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-xs lg:col-span-2">
          <h3 className="font-bold text-slate-800 text-sm mb-4">Onboarded Hospital Node Registry</h3>
          <div className="space-y-3">
            {data.hospitalsList.map((hospital) => (
              <div 
                key={hospital.id} 
                className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between"
              >
                <div className="text-left space-y-1">
                  <span className="font-bold text-slate-800 text-xs block">{hospital.name}</span>
                  <span className="text-[10px] text-slate-400 block font-medium">Node ID: {hospital.id} &bull; Users Onboarded: {hospital.users}</span>
                </div>
                <span className={`
                  px-2.5 py-0.5 rounded-full text-[9px] font-bold border uppercase
                  ${hospital.status === "ONLINE" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"}
                `}>
                  {hospital.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* User breakdown list */}
        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-xs lg:col-span-1 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-sm mb-4">Users Role Audit</h3>
            <div className="space-y-2">
              {Object.entries(data.totalUsersByRole).map(([role, count]) => (
                <div key={role} className="flex justify-between items-center text-xs py-1 border-b border-slate-50">
                  <span className="font-semibold text-slate-500">{role}</span>
                  <span className="font-bold text-slate-800">{count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-primary font-bold hover:underline cursor-pointer">
            <span>Uptime & Compliance Logs</span>
            <FileSpreadsheet className="w-4 h-4" />
          </div>
        </div>

      </div>

      {/* Clinical Accounts Management */}
      <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-xs">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Clinical Accounts Management</h3>
            <p className="text-[10px] text-slate-400 mt-1">Directly provision or revoke Doctor access.</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <UserPlus className="w-5 h-5" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Add Doctor Form */}
          <div className="lg:col-span-1 space-y-4">
            <h4 className="text-xs font-bold text-slate-700 border-b border-slate-100 pb-2">Provision New Doctor</h4>
            <form onSubmit={handleAddDoctor} className="space-y-3">
              <div>
                <label className="text-[10px] font-semibold text-slate-500">Full Name</label>
                <input required type="text" value={newDoctor.name} onChange={e => setNewDoctor({...newDoctor, name: e.target.value})} className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-primary focus:outline-none" placeholder="Dr. John Doe" />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-slate-500">Email Address</label>
                <input required type="email" value={newDoctor.email} onChange={e => setNewDoctor({...newDoctor, email: e.target.value})} className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-primary focus:outline-none" placeholder="doctor@example.com" />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-slate-500">Temporary Password</label>
                <input required type="password" value={newDoctor.password} onChange={e => setNewDoctor({...newDoctor, password: e.target.value})} className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-primary focus:outline-none" placeholder="••••••••" />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-slate-500">Hospital Assignment</label>
                <input type="text" value={newDoctor.hospitalName} onChange={e => setNewDoctor({...newDoctor, hospitalName: e.target.value})} className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-primary focus:outline-none" placeholder="e.g. Main Campus Hospital" />
              </div>
              <button disabled={loading} type="submit" className="w-full py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-70 cursor-pointer">
                {loading ? "Provisioning..." : "Add Doctor"}
              </button>
            </form>
          </div>

          {/* List Doctors */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-xs font-bold text-slate-700 border-b border-slate-100 pb-2">Active Doctor Accounts</h4>
            <div className="space-y-3 max-h-[320px] overflow-y-auto scrollbar-thin pr-2">
              {doctors.map(doc => (
                <div key={doc.id} className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between group hover:border-slate-200 transition-colors">
                  <div>
                    <p className="text-xs font-bold text-slate-800">{doc.name}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{doc.email} &bull; {doc.hospitalName}</p>
                  </div>
                  <button onClick={() => handleDeleteDoctor(doc.id)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-colors cursor-pointer" title="Revoke Access">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {doctors.length === 0 && <p className="text-xs text-slate-400 italic">No doctor accounts found.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
