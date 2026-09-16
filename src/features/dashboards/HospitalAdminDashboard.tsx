import React from "react";
import Link from "next/link";
import { DashboardService } from "../../services/dashboard.service";
import { 
  Users, 
  FileText, 
  Clock, 
  TrendingUp, 
  AlertTriangle, 
  CalendarCheck,
  Building,
  ArrowRight,
  MapPin
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";

export const HospitalAdminDashboard: React.FC = () => {
  const data = DashboardService.getHospitalAdminData();

  // Simple formatting helper
  const formattedDeptData = data.departmentMetrics.map(item => ({
    name: item.name,
    volume: item.volume,
    load: parseInt(item.load.replace("%", ""))
  }));

  return (
    <div className="space-y-6 text-left">
      {/* Dev Notice */}
      <div className="bg-indigo-50 border border-indigo-150 p-3.5 rounded-xl flex items-center justify-between text-xs text-indigo-800">
        <div className="flex items-center gap-2">
          <span className="font-bold uppercase tracking-wider bg-indigo-650 text-white text-[9px] px-1.5 py-0.5 rounded-sm">Operational Console</span>
          <span>Logged in as: <strong>Amit Patel</strong> &bull; Node: <strong>IIT Indore Main Campus Hospital</strong></span>
        </div>
        <Link
          href="/platform-reach"
          className="inline-flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-indigo-100/80 border border-indigo-200 text-indigo-900 font-bold rounded-lg text-xs shadow-2xs transition-all cursor-pointer"
        >
          <MapPin className="w-3.5 h-3.5 text-indigo-600" />
          <span>National Healthcare Reach Map</span>
          <ArrowRight className="w-3 h-3 text-indigo-500" />
        </Link>
      </div>

      {/* Operations Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Screening Volume */}
        <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-xs flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Screening Volume</span>
            <h2 className="text-3xl font-black text-slate-800 leading-none">{data.screeningVolume}</h2>
            <p className="text-[10px] text-slate-400">Mammograms completed this month</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-605 flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        {/* Turnaround Time */}
        <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-xs flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Average Turnaround</span>
            <h2 className="text-3xl font-black text-slate-800 leading-none">{data.averageTurnaroundHours}h</h2>
            <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5">
              <TrendingUp className="w-3.5 h-3.5" /> +15% vs last month
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Escalations */}
        <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-xs flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Escalations Queue</span>
            <h2 className="text-3xl font-black text-red-650 leading-none">{data.escalationsCount}</h2>
            <p className="text-[10px] text-red-500 font-medium">Pending admin resolution</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-red-50 text-red-650 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        {/* Follow-up completion */}
        <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-xs flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Follow-up Completion</span>
            <h2 className="text-3xl font-black text-slate-800 leading-none">{data.followUpCompletionRate}%</h2>
            <p className="text-[10px] text-slate-400">Target rate: 95%</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-primary flex items-center justify-center">
            <CalendarCheck className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Secondary metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Load Chart */}
        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-xs lg:col-span-2">
          <h3 className="font-bold text-slate-800 text-sm mb-6">Department Load & Patient Volumes</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={formattedDeptData}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip cursor={{ fill: "rgba(0,0,0,0.02)" }} />
                <Bar dataKey="volume" fill="#005F56" radius={[4, 4, 0, 0]} name="Active Patients" />
                <Bar dataKey="load" fill="#00897B" radius={[4, 4, 0, 0]} name="Load Factor (%)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Workload list */}
        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-xs lg:col-span-1 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-sm mb-4">Operations & Staff Summary</h3>
            <div className="space-y-4">
              {/* Staff workload */}
              <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl flex gap-3 text-xs text-slate-700 leading-relaxed text-left">
                <Building className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Hospital Node Workload</span>
                  <p className="text-[11px] text-slate-400 mt-1">{data.staffWorkload}</p>
                </div>
              </div>

              {/* Total Active Patients */}
              <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl flex gap-3 text-xs text-slate-700 leading-relaxed text-left">
                <Users className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Active Registrations</span>
                  <p className="text-[11px] text-slate-400 mt-1">Total {data.patientVolume} patients in screening database</p>
                </div>
              </div>

              {/* Appointments load */}
              <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl flex gap-3 text-xs text-slate-700 leading-relaxed text-left">
                <CalendarCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Appointment Slots Load</span>
                  <p className="text-[11px] text-slate-400 mt-1">{data.appointmentLoadPercent}% slots booked for today and tomorrow</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center text-xs text-primary font-bold hover:underline cursor-pointer">
            <span>Operational Reports</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>

      </div>
    </div>
  );
};
