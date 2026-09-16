import React, { useState } from "react";
import { 
  Plus, 
  Trash2
} from "lucide-react";
import { mockHealthReadings } from "../../mocks/patient-portal.mock";
import type { HealthReading, HealthMetric } from "../../types/patient-portal";
import { MedicalDisclaimer } from "../../components/patient/MedicalDisclaimer";

const METRICS: HealthMetric[] = [
  "BMI",
  "Weight",
  "Blood Pressure",
  "Blood Glucose",
  "Hydration",
  "Exercise",
  "Sleep",
  "Mood"
];

export const HealthTrackerPage: React.FC = () => {
  const [readings, setReadings] = useState<HealthReading[]>(mockHealthReadings);
  const [selectedMetric, setSelectedMetric] = useState<HealthMetric>("BMI");
  const [newValue, setNewValue] = useState("");
  const [newUnit, setNewUnit] = useState("kg");

  const handleAddReading = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newValue.trim()) return;

    const newR: HealthReading = {
      id: `hr-${Date.now()}`,
      patientId: "patient-001",
      metric: selectedMetric,
      value: newValue.trim(),
      unit: newUnit,
      recordedAt: new Date().toISOString(),
      source: "Self-reported",
    };

    setReadings(prev => [newR, ...prev]);
    setNewValue("");
  };

  const handleDelete = (id: string) => {
    setReadings(prev => prev.filter(r => r.id !== id));
  };

  const filteredReadings = readings.filter(r => r.metric === selectedMetric);
  const latestReading = filteredReadings[0];

  return (
    <div className="space-y-6">
      {/* Disclaimer */}
      <MedicalDisclaimer variant="general" />

      {/* Metric Selection Pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {METRICS.map((m) => (
          <button
            key={m}
            onClick={() => {
              setSelectedMetric(m);
              setNewUnit(m === "Weight" ? "kg" : m === "Hydration" ? "L" : m === "Sleep" ? "hours" : "unit");
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedMetric === m ? "bg-primary text-white shadow-xs" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      {/* Active Metric Summary Card */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs flex flex-wrap justify-between items-center gap-6">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Selected Health Metric</span>
          <h2 className="text-xl font-black text-slate-800">{selectedMetric}</h2>
          <p className="text-xs text-slate-500 mt-0.5">Continuous patient health observation.</p>
        </div>

        {latestReading ? (
          <div className="text-right">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase block">Latest Reading</span>
            <span className="text-2xl font-black text-primary">{latestReading.value} <span className="text-xs font-bold text-slate-500">{latestReading.unit}</span></span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Source: {latestReading.source}</span>
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic">No readings logged for {selectedMetric}.</p>
        )}
      </div>

      {/* Log New Reading Form */}
      <form onSubmit={handleAddReading} className="bg-white border border-slate-100 rounded-2xl p-4 shadow-xs flex flex-wrap gap-3 items-center">
        <span className="text-xs font-bold text-slate-700">Log New {selectedMetric}:</span>
        <input
          type="text"
          placeholder={`Enter value (e.g. 65)...`}
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          className="px-3.5 py-2 border border-slate-200 rounded-xl text-xs flex-1 min-w-[160px] focus:outline-hidden focus:ring-2 focus:ring-primary/20"
        />
        <input
          type="text"
          placeholder="Unit"
          value={newUnit}
          onChange={(e) => setNewUnit(e.target.value)}
          className="w-20 px-3 py-2 border border-slate-200 rounded-xl text-xs text-center focus:outline-hidden"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-primary text-white font-bold text-xs rounded-xl hover:bg-primary-hover transition-colors flex items-center gap-1"
        >
          <Plus className="w-4 h-4" /> Log Entry
        </button>
      </form>

      {/* Logged Readings Table */}
      <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 font-bold text-xs text-slate-800">
          History of {selectedMetric} Readings
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-400 font-extrabold uppercase tracking-wider text-[10px]">
                <th className="p-3.5">Value</th>
                <th className="p-3.5">Unit</th>
                <th className="p-3.5">Recorded At</th>
                <th className="p-3.5">Data Source</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredReadings.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/50">
                  <td className="p-3.5 font-bold text-slate-800">{r.value}</td>
                  <td className="p-3.5 text-slate-500 font-medium">{r.unit}</td>
                  <td className="p-3.5 text-slate-500">{new Date(r.recordedAt).toLocaleString()}</td>
                  <td className="p-3.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      r.source === "Self-reported" ? "bg-slate-100 text-slate-600" : "bg-teal-50 text-teal-700"
                    }`}>
                      {r.source}
                    </span>
                  </td>
                  <td className="p-3.5 text-right">
                    {r.source === "Self-reported" && (
                      <button
                        onClick={() => handleDelete(r.id)}
                        className="p-1 text-slate-400 hover:text-red-600 rounded-md"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
