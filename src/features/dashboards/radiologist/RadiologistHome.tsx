import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Eye, AlertCircle, CheckCircle2, Clock, Upload } from "lucide-react";
import { RadiologistService, type RadiologyStudy } from "../../../services/radiologist.service";

export const RadiologistHome: React.FC = () => {
  const router = useRouter();
  const [studies, setStudies] = useState<RadiologyStudy[]>(() => RadiologistService.getStudies());

  const reloadData = () => {
    setStudies([...RadiologistService.getStudies()]);
  };

  useEffect(() => {
    window.addEventListener("radiologist-studies-updated", reloadData);
    return () => {
      window.removeEventListener("radiologist-studies-updated", reloadData);
    };
  }, []);

  const pendingCount = studies.filter((s) => s.status === "Pending" || s.status === "Draft").length;
  const urgentCount = studies.filter((s) => s.priority === "URGENT" || s.priority === "STAT").length;
  const completedTodayCount = studies.filter((s) => s.status === "Reviewed").length;
  const avgReviewTime = "8.5 mins";

  const todayQueue = studies.slice(0, 5);
  const recentReports = RadiologistService.getReports().slice(0, 5);

  return (
    <div className="space-y-6 text-left max-w-7xl mx-auto pb-16">
      {/* Title Header */}
      <div className="border-b border-slate-200/60 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Radiologist Dashboard</h1>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            Diagnostic imaging review summary &amp; pending study worklist.
          </p>
        </div>

        <button
          onClick={() => router.push("/radiologist/queue")}
          className="px-4 py-2.5 bg-primary hover:bg-[#004D46] text-white text-xs font-bold rounded-xl shadow-md shadow-primary/15 transition-all cursor-pointer flex items-center justify-center gap-2 self-start sm:self-auto shrink-0 border border-primary/30"
        >
          <Upload className="w-4 h-4" />
          <span>Go to Imaging Queue</span>
        </button>
      </div>

      {/* 4 KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/80 p-5 rounded-3xl shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Pending Studies</span>
            <Eye className="w-4 h-4 text-primary" />
          </div>
          <p className="text-3xl font-black text-slate-800">{pendingCount}</p>
          <p className="text-[11px] text-slate-400 font-medium">Awaiting primary reading</p>
        </div>

        <div className="bg-white border border-slate-200/80 p-5 rounded-3xl shadow-xs space-y-2">
          <div className="flex items-center justify-between text-rose-500">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600">Urgent Studies</span>
            <AlertCircle className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-3xl font-black text-rose-700">{urgentCount}</p>
          <p className="text-[11px] text-rose-500 font-semibold">Priority &amp; STAT reviews</p>
        </div>

        <div className="bg-white border border-slate-200/80 p-5 rounded-3xl shadow-xs space-y-2">
          <div className="flex items-center justify-between text-emerald-600">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Reports Completed Today</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-3xl font-black text-slate-800">{completedTodayCount}</p>
          <p className="text-[11px] text-emerald-600 font-semibold">Signed &amp; sent to doctor</p>
        </div>

        <div className="bg-white border border-slate-200/80 p-5 rounded-3xl shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Average Review Time</span>
            <Clock className="w-4 h-4 text-primary" />
          </div>
          <p className="text-3xl font-black text-slate-800">{avgReviewTime}</p>
          <p className="text-[11px] text-slate-400 font-medium">Per study turnaround</p>
        </div>
      </div>

      {/* TODAY'S IMAGING QUEUE TABLE */}
      <div className="bg-white border border-slate-200/80 rounded-3xl shadow-xs overflow-hidden space-y-3 p-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Today's Imaging Queue</h2>
          <button
            onClick={() => router.push("/radiologist/queue")}
            className="text-xs text-primary font-bold hover:underline cursor-pointer"
          >
            View All Queue →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider font-bold text-[9px] bg-slate-50/50">
                <th className="p-3">Patient</th>
                <th className="p-3">Study ID</th>
                <th className="p-3">Study Type</th>
                <th className="p-3">Upload Time</th>
                <th className="p-3">Priority</th>
                <th className="p-3">AI Status</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {todayQueue.map((study) => (
                <tr key={study.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="p-3 font-bold text-slate-800">
                    {study.patientName} <span className="text-[10px] text-slate-400 font-normal">({study.patientId})</span>
                  </td>
                  <td className="p-3 font-mono font-bold text-primary text-[11px]">{study.id}</td>
                  <td className="p-3 text-slate-600 font-medium">{study.imagingType} ({study.side})</td>
                  <td className="p-3 text-slate-500 font-medium">{study.uploadTime}</td>
                  <td className="p-3">
                    <span className={`px-2.5 py-0.5 text-[9.5px] font-bold rounded-full border ${
                      study.priority === "URGENT" || study.priority === "STAT" ? "bg-rose-50 text-rose-700 border-rose-200" : "bg-slate-100 text-slate-600 border-slate-200"
                    }`}>
                      {study.priority}
                    </span>
                  </td>
                  <td className="p-3 text-slate-600 font-medium">
                    <span className="px-2.5 py-0.5 text-[9.5px] font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {study.aiStatus}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => router.push(`/radiologist/workspace/${study.id}`)}
                      className="px-3.5 py-1.5 bg-primary hover:bg-[#004D46] text-white font-bold rounded-xl text-xs cursor-pointer"
                    >
                      Open Study
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* RECENT REPORTS CARD */}
      <div className="bg-white border border-slate-200/80 rounded-3xl shadow-xs space-y-3 p-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Recent Reports</h2>
          <button
            onClick={() => router.push("/radiologist/reports")}
            className="text-xs text-primary font-bold hover:underline cursor-pointer"
          >
            View All Reports →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider font-bold text-[9px] bg-slate-50/50">
                <th className="p-3">Patient</th>
                <th className="p-3">Study ID</th>
                <th className="p-3">BI-RADS</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentReports.map((rep) => (
                <tr key={rep.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="p-3 font-bold text-slate-800">{rep.patientName} ({rep.patientId})</td>
                  <td className="p-3 font-mono font-bold text-slate-600">{rep.studyId}</td>
                  <td className="p-3 font-extrabold text-primary">BI-RADS {rep.birads}</td>
                  <td className="p-3">
                    <span className={`px-2.5 py-0.5 text-[9.5px] font-bold rounded-full border ${
                      rep.status === "Submitted" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : rep.status === "Draft" ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-rose-50 text-rose-700 border-rose-200"
                    }`}>
                      {rep.status}
                    </span>
                  </td>
                  <td className="p-3 text-right text-slate-400 font-medium">{rep.submittedAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
