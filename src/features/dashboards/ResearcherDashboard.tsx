import React from "react";
import { DashboardService } from "../../services/dashboard.service";
import { 
  Database, 
  Target, 
  ShieldCheck, 
  Layers,
  ArrowDownToLine
} from "lucide-react";
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis
} from "recharts";

export const ResearcherDashboard: React.FC = () => {
  const data = DashboardService.getResearcherData();

  const densityChartData = data.demographics.breastDensityDistribution.map(item => ({
    name: item.category,
    value: item.percentage
  }));

  const ageChartData = data.demographics.ageGroups.map(item => ({
    name: item.group,
    count: item.count
  }));

  const COLORS = ["#005F56", "#00897B", "#00A193", "#4DB6AC"];

  return (
    <div className="space-y-6 text-left">
      {/* Dev Notice */}
      <div className="bg-emerald-50 border border-emerald-150 p-3.5 rounded-xl flex items-center justify-between text-xs text-emerald-800">
        <div className="flex items-center gap-2">
          <span className="font-bold uppercase tracking-wider bg-emerald-600 text-white text-[9px] px-1.5 py-0.5 rounded-sm">De-Identified Workspace</span>
          <span>Logged in as researcher: <strong>Dr. Sunita Sharma</strong> &bull; Framework: <strong>Drishti CPS Research Hub</strong></span>
        </div>
        <span className="flex items-center gap-1 font-semibold text-[10px] text-emerald-700 bg-white px-2 py-0.5 rounded-full border border-emerald-100">
          <ShieldCheck className="w-3.5 h-3.5" /> Anonymity Verified (HIPAA)
        </span>
      </div>

      {/* Researcher stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* De-identified records */}
        <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-xs flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Anonymized Records</span>
            <h2 className="text-3xl font-black text-slate-800 leading-none">{data.deIdentifiedRecords.toLocaleString()}</h2>
            <p className="text-[10px] text-slate-400">Total screening training set</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Database className="w-6 h-6" />
          </div>
        </div>

        {/* Model Accuracy (Sensitivity) */}
        <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-xs flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Model Sensitivity</span>
            <h2 className="text-3xl font-black text-slate-800 leading-none">{data.sensitivityPercent}%</h2>
            <p className="text-[10px] text-emerald-600 font-semibold">True Positive Rate</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-primary flex items-center justify-center">
            <Target className="w-6 h-6" />
          </div>
        </div>

        {/* Specificity */}
        <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-xs flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Model Specificity</span>
            <h2 className="text-3xl font-black text-slate-800 leading-none">{data.specificityPercent}%</h2>
            <p className="text-[10px] text-slate-400">True Negative Rate</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-accent-teal flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Fairness Indicator */}
        <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-xs flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Fairness Disparity</span>
            <h2 className="text-3xl font-black text-slate-800 leading-none">{data.modelSummary.fairnessRatio.split(" ")[0]}</h2>
            <p className="text-[10px] text-slate-400">Disparate impact ratio</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-650 flex items-center justify-center">
            <Layers className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Breast density distribution pie */}
        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-xs text-center flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-sm mb-4 text-left">Breast Density Distribution (BI-RADS Categories)</h3>
            <div className="h-56 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={densityChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {densityChartData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          {/* Custom legend */}
          <div className="grid grid-cols-2 gap-2 mt-4 text-[10px] text-slate-500 font-semibold text-left">
            {densityChartData.map((item, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                <span>{item.name}: {item.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Demographic age distribution */}
        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-sm mb-4">Cohort Demographics (Age Range Counts)</h3>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ageChartData}>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <Tooltip cursor={{ fill: "rgba(0,0,0,0.01)" }} />
                  <Bar dataKey="count" fill="#005F56" radius={[4, 4, 0, 0]} name="Record Volume" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-slate-100">
            <div className="text-left">
              <span className="text-[10px] text-slate-400 font-bold block uppercase">False Positive Trend</span>
              <span className="text-xs font-bold text-red-650 block mt-1">{data.falsePositiveTrend}</span>
            </div>
            <div className="text-left">
              <span className="text-[10px] text-slate-400 font-bold block uppercase">False Negative Trend</span>
              <span className="text-xs font-bold text-red-650 block mt-1">{data.falseNegativeTrend}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Model summaries */}
      <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="text-left space-y-1.5">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-primary bg-primary/10">
            Current Model Version
          </span>
          <h4 className="font-bold text-slate-800 text-sm">{data.modelSummary.version}</h4>
          <p className="text-xs text-slate-500 max-w-xl">
            This model was trained over {data.modelSummary.trainingEpochs} epochs using de-identified datasets. 
            Audits demonstrate equitable diagnostic accuracies across diverse age brackets and breast densities.
          </p>
        </div>
        <button className="flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition-all cursor-pointer shrink-0">
          <ArrowDownToLine className="w-4 h-4 text-slate-400" />
          Export Model Metrics
        </button>
      </div>
    </div>
  );
};
