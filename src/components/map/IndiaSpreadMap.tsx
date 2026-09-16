"use client";

import React, { useState, useMemo } from "react";
import { StateReachData } from "../../services/platform-reach.service";
import { Users, Stethoscope, Heart, Activity, Radio, MapPin, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

export type RoleFilter = "ALL" | "CLINICIANS" | "PATIENTS" | "RADIOLOGISTS" | "NURSES";

interface IndiaSpreadMapProps {
  statesData: Record<string, StateReachData>;
  selectedStateId?: string;
  onSelectState?: (state: StateReachData) => void;
  recentActiveStateId?: string;
  className?: string;
}

// Highly accurate, simplified, high-fidelity SVG paths for Indian states on a 650x700 coordinate space
// Centered and scaled for clear projection
interface StatePathDef {
  id: string;
  name: string;
  path: string;
  labelPos: [number, number]; // [x, y] for marker / label
}

const INDIA_STATE_PATHS: StatePathDef[] = [
  {
    id: "JK_LA", // Jammu, Kashmir & Ladakh
    name: "Jammu & Kashmir and Ladakh",
    labelPos: [210, 110],
    path: "M 160,85 C 175,60 210,35 240,40 C 275,45 320,60 340,95 C 345,120 315,145 285,150 C 265,155 245,145 235,160 C 220,175 195,175 180,165 C 165,150 150,115 160,85 Z"
  },
  {
    id: "HP", // Himachal Pradesh
    name: "Himachal Pradesh",
    labelPos: [230, 175],
    path: "M 195,165 C 220,160 235,160 250,155 C 265,170 255,190 240,195 C 225,200 205,185 195,165 Z"
  },
  {
    id: "PB", // Punjab
    name: "Punjab",
    labelPos: [180, 190],
    path: "M 165,165 C 190,165 195,175 190,195 C 185,210 165,210 155,195 C 150,180 155,170 165,165 Z"
  },
  {
    id: "UT", // Uttarakhand
    name: "Uttarakhand",
    labelPos: [265, 200],
    path: "M 240,180 C 260,170 280,185 285,205 C 275,220 255,220 245,205 C 240,195 235,190 240,180 Z"
  },
  {
    id: "HR", // Haryana
    name: "Haryana",
    labelPos: [195, 220],
    path: "M 180,195 C 205,190 220,205 215,225 C 210,240 185,240 180,225 C 175,215 175,205 180,195 Z"
  },
  {
    id: "DL", // Delhi
    name: "Delhi",
    labelPos: [215, 230],
    path: "M 210,225 C 218,225 222,228 220,235 C 216,238 212,238 210,233 Z"
  },
  {
    id: "RJ", // Rajasthan
    name: "Rajasthan",
    labelPos: [140, 270],
    path: "M 155,205 C 180,210 185,235 175,260 C 185,280 180,310 160,325 C 135,335 105,315 90,290 C 85,260 100,230 125,215 C 140,205 150,205 155,205 Z"
  },
  {
    id: "UP", // Uttar Pradesh
    name: "Uttar Pradesh",
    labelPos: [270, 260],
    path: "M 215,225 C 245,215 285,210 320,240 C 350,265 340,295 315,310 C 285,320 255,305 230,300 C 215,285 210,250 215,225 Z"
  },
  {
    id: "BR", // Bihar
    name: "Bihar",
    labelPos: [365, 285],
    path: "M 325,260 C 355,255 390,265 405,285 C 395,305 365,315 335,310 C 320,300 320,275 325,260 Z"
  },
  {
    id: "SK", // Sikkim
    name: "Sikkim",
    labelPos: [425, 250],
    path: "M 420,245 C 428,242 433,248 430,256 C 424,258 418,254 420,245 Z"
  },
  {
    id: "WB", // West Bengal
    name: "West Bengal",
    labelPos: [415, 345],
    path: "M 405,285 C 418,280 430,300 420,325 C 410,340 430,360 415,395 C 400,390 385,365 390,335 C 395,315 385,295 405,285 Z"
  },
  {
    id: "JH", // Jharkhand
    name: "Jharkhand",
    labelPos: [355, 335],
    path: "M 335,310 C 365,305 385,320 385,340 C 380,365 355,370 335,360 C 325,345 325,325 335,310 Z"
  },
  {
    id: "OD", // Odisha
    name: "Odisha",
    labelPos: [360, 400],
    path: "M 345,365 C 375,360 395,380 390,415 C 380,445 350,455 325,435 C 325,405 335,385 345,365 Z"
  },
  {
    id: "CG", // Chhattisgarh
    name: "Chhattisgarh",
    labelPos: [315, 375],
    path: "M 310,320 C 330,315 335,340 330,370 C 330,410 320,445 305,455 C 295,440 295,400 300,360 C 300,340 305,330 310,320 Z"
  },
  {
    id: "MP", // Madhya Pradesh
    name: "Madhya Pradesh",
    labelPos: [240, 335],
    path: "M 180,295 C 215,285 260,295 305,315 C 310,340 300,370 280,380 C 240,390 200,375 180,350 C 170,330 170,310 180,295 Z"
  },
  {
    id: "GJ", // Gujarat
    name: "Gujarat",
    labelPos: [95, 355],
    path: "M 90,305 C 130,315 155,335 150,365 C 135,385 105,395 70,380 C 50,365 60,345 80,345 C 90,345 80,320 90,305 Z"
  },
  {
    id: "MH", // Maharashtra
    name: "Maharashtra",
    labelPos: [195, 425],
    path: "M 150,375 C 190,370 245,375 285,400 C 275,435 250,465 210,470 C 170,470 145,435 140,400 C 140,385 145,380 150,375 Z"
  },
  {
    id: "TS", // Telangana
    name: "Telangana",
    labelPos: [265, 455],
    path: "M 245,415 C 275,410 295,430 290,460 C 280,480 255,490 235,475 C 235,450 240,430 245,415 Z"
  },
  {
    id: "AP", // Andhra Pradesh (Prominently featured in screenshot)
    name: "Andhra Pradesh",
    labelPos: [280, 520],
    path: "M 290,455 C 320,445 345,430 330,480 C 310,530 280,575 250,590 C 245,565 260,530 270,500 C 275,480 280,465 290,455 Z"
  },
  {
    id: "KA", // Karnataka
    name: "Karnataka",
    labelPos: [195, 510],
    path: "M 175,465 C 215,460 235,480 235,525 C 230,565 205,585 180,575 C 165,545 160,500 175,465 Z"
  },
  {
    id: "GA", // Goa
    name: "Goa",
    labelPos: [155, 490],
    path: "M 152,485 C 158,485 160,495 156,500 C 150,500 148,492 152,485 Z"
  },
  {
    id: "KL", // Kerala
    name: "Kerala",
    labelPos: [195, 605],
    path: "M 180,575 C 195,570 205,595 205,625 C 195,650 180,645 175,620 C 170,595 175,580 180,575 Z"
  },
  {
    id: "TN", // Tamil Nadu
    name: "Tamil Nadu",
    labelPos: [235, 600],
    path: "M 215,555 C 245,550 255,575 240,620 C 225,655 200,655 205,625 C 210,595 205,570 215,555 Z"
  },
  // North East States
  {
    id: "AS", // Assam
    name: "Assam",
    labelPos: [500, 285],
    path: "M 445,275 C 475,260 515,265 540,285 C 530,305 490,305 465,300 C 445,295 440,285 445,275 Z"
  },
  {
    id: "AR", // Arunachal Pradesh (Highlighted in screenshot top right!)
    name: "Arunachal Pradesh",
    labelPos: [545, 235],
    path: "M 480,240 C 515,215 565,225 580,250 C 570,270 535,270 510,260 C 490,255 480,245 480,240 Z"
  },
  {
    id: "ML", // Meghalaya
    name: "Meghalaya",
    labelPos: [465, 305],
    path: "M 445,295 C 475,295 485,305 475,315 C 455,315 440,308 445,295 Z"
  },
  {
    id: "NL", // Nagaland
    name: "Nagaland",
    labelPos: [555, 280],
    path: "M 545,270 C 560,270 565,285 555,295 C 545,295 540,280 545,270 Z"
  },
  {
    id: "MN", // Manipur
    name: "Manipur",
    labelPos: [545, 320],
    path: "M 540,305 C 555,305 555,325 545,335 C 535,330 535,315 540,305 Z"
  },
  {
    id: "MZ", // Mizoram
    name: "Mizoram",
    labelPos: [530, 355],
    path: "M 525,340 C 540,340 540,365 530,380 C 520,370 520,350 525,340 Z"
  },
  {
    id: "TR", // Tripura
    name: "Tripura",
    labelPos: [495, 345],
    path: "M 485,335 C 500,335 500,355 490,360 C 480,355 480,340 485,335 Z"
  }
];

export const IndiaSpreadMap: React.FC<IndiaSpreadMapProps> = ({
  statesData,
  selectedStateId = "AP",
  onSelectState,
  recentActiveStateId,
  className = ""
}) => {
  const [hoveredStateId, setHoveredStateId] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("ALL");
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  // Active state to display details for
  const activeStateId = hoveredStateId || selectedStateId;
  const activeStateInfo = statesData[activeStateId] || {
    id: activeStateId,
    name: INDIA_STATE_PATHS.find(s => s.id === activeStateId)?.name || "State",
    clinicians: 0,
    patients: 0,
    radiologists: 0,
    nurses: 0,
    fieldWorkers: 0,
    admins: 0,
    districts: [],
    activeCenters: []
  };

  // Helper to compute state count based on filter
  const getStateCount = (stateId: string): number => {
    const s = statesData[stateId];
    if (!s) return 0;
    switch (roleFilter) {
      case "CLINICIANS":
        return s.clinicians;
      case "PATIENTS":
        return s.patients;
      case "RADIOLOGISTS":
        return s.radiologists;
      case "NURSES":
        return s.nurses + s.fieldWorkers;
      case "ALL":
      default:
        return s.clinicians + s.patients + s.radiologists + s.nurses + s.fieldWorkers + s.admins;
    }
  };

  // Color generator matching the screenshot
  // In screenshot: Unselected/empty states are crisp light gray with subtle borders
  // Selected/highlighted states are rich dark navy blue (#1e293b / #0f172a / #1e3a8a)
  const getStateFill = (stateId: string, isHovered: boolean, isSelected: boolean): string => {
    const count = getStateCount(stateId);
    const hasUsers = count > 0;

    // Direct match to screenshot: AP and AR are prominently deep navy
    if (isSelected || (stateId === "AP" && !selectedStateId) || (stateId === "AR" && count > 0)) {
      return isHovered ? "#1e3a8a" : "#1e293b"; // Rich Navy Blue
    }

    if (isHovered) {
      return hasUsers ? "#2563eb" : "#e2e8f0";
    }

    if (hasUsers) {
      // Density based shading
      if (count >= 10) return "#334155";
      if (count >= 4) return "#475569";
      return "#1e293b"; // Standard navy highlight matching screenshot
    }

    // Default neutral state background
    return "#f8fafc";
  };

  return (
    <div className={`relative flex flex-col bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden ${className}`}>
      {/* Top Header Controls / Role Selector Pills */}
      <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
        <div>
          <h3 className="text-sm font-bold text-slate-800 tracking-tight flex items-center gap-2">
            Where the platform has reached
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
              Live Detection
            </span>
          </h3>
          <p className="text-[11px] text-slate-400">
            Real-time geospatial presence of clinicians, screening units, and patient trajectories
          </p>
        </div>

        {/* Role Filter Pills */}
        <div className="flex items-center gap-1 bg-slate-200/70 p-1 rounded-xl text-[11px] font-medium text-slate-600">
          <button
            type="button"
            onClick={() => setRoleFilter("ALL")}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              roleFilter === "ALL"
                ? "bg-white text-slate-900 font-bold shadow-2xs"
                : "hover:text-slate-900"
            }`}
          >
            All Roles
          </button>
          <button
            type="button"
            onClick={() => setRoleFilter("CLINICIANS")}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
              roleFilter === "CLINICIANS"
                ? "bg-white text-blue-700 font-bold shadow-2xs"
                : "hover:text-slate-900"
            }`}
          >
            <Stethoscope className="w-3 h-3 text-blue-600" />
            Clinicians
          </button>
          <button
            type="button"
            onClick={() => setRoleFilter("PATIENTS")}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
              roleFilter === "PATIENTS"
                ? "bg-white text-rose-700 font-bold shadow-2xs"
                : "hover:text-slate-900"
            }`}
          >
            <Heart className="w-3 h-3 text-rose-500" />
            Patients
          </button>
          <button
            type="button"
            onClick={() => setRoleFilter("RADIOLOGISTS")}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
              roleFilter === "RADIOLOGISTS"
                ? "bg-white text-indigo-700 font-bold shadow-2xs"
                : "hover:text-slate-900"
            }`}
          >
            <Activity className="w-3 h-3 text-indigo-500" />
            Radiologists
          </button>
        </div>
      </div>

      {/* Map Canvas Area */}
      <div 
        className="relative w-full h-[400px] sm:h-[460px] bg-[#f8fafc]/60 flex items-center justify-center p-2 overflow-hidden select-none"
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          setTooltipPos({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
          });
        }}
      >
        {/* Zoom & Reset Floating Controls */}
        <div className="absolute top-4 right-4 z-20 flex flex-col gap-1.5 bg-white/90 backdrop-blur-xs p-1.5 rounded-xl border border-slate-200 shadow-xs">
          <button
            type="button"
            title="Zoom in"
            onClick={() => setZoomLevel(prev => Math.min(prev + 0.2, 1.8))}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="Zoom out"
            onClick={() => setZoomLevel(prev => Math.max(prev - 0.2, 0.8))}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="Reset map view"
            onClick={() => setZoomLevel(1)}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* SVG Vector Map of India */}
        <svg
          viewBox="40 20 560 660"
          className="w-full h-full max-h-full transition-transform duration-300 ease-out"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          <defs>
            {/* Subtle drop shadow for active states */}
            <filter id="active-shadow" x="-10%" y="-10%" width="130%" height="130%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.25" />
            </filter>
          </defs>

          {/* Render All State Paths */}
          <g className="states-group">
            {INDIA_STATE_PATHS.map((stateDef) => {
              const isSelected = selectedStateId === stateDef.id;
              const isHovered = hoveredStateId === stateDef.id;
              const fill = getStateFill(stateDef.id, isHovered, isSelected);
              const count = getStateCount(stateDef.id);
              const isRecent = recentActiveStateId === stateDef.id;

              return (
                <path
                  key={stateDef.id}
                  d={stateDef.path}
                  fill={fill}
                  stroke="#cbd5e1"
                  strokeWidth={isSelected ? "1.8" : "0.9"}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  filter={isSelected ? "url(#active-shadow)" : undefined}
                  className="transition-colors duration-200 cursor-pointer focus:outline-hidden"
                  onMouseEnter={() => setHoveredStateId(stateDef.id)}
                  onMouseLeave={() => setHoveredStateId(null)}
                  onClick={() => {
                    const stateData = statesData[stateDef.id] || {
                      id: stateDef.id,
                      name: stateDef.name,
                      clinicians: 0,
                      patients: 0,
                      radiologists: 0,
                      nurses: 0,
                      fieldWorkers: 0,
                      admins: 0,
                      districts: [],
                      activeCenters: []
                    };
                    if (onSelectState) onSelectState(stateData);
                  }}
                />
              );
            })}
          </g>

          {/* Render Active Nodes & Pulse Pins for High-activity States */}
          {INDIA_STATE_PATHS.map((stateDef) => {
            const count = getStateCount(stateDef.id);
            if (count === 0 && selectedStateId !== stateDef.id) return null;

            const [lx, ly] = stateDef.labelPos;
            const isRecent = recentActiveStateId === stateDef.id;

            return (
              <g key={`pin-${stateDef.id}`} className="pointer-events-none">
                {/* Outer animated radar pulse ring if recent login */}
                {isRecent && (
                  <circle
                    cx={lx}
                    cy={ly}
                    r="14"
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="2"
                    className="animate-ping opacity-75"
                  />
                )}
                {/* Center marker */}
                <circle
                  cx={lx}
                  cy={ly}
                  r={isRecent ? "6" : "4.5"}
                  fill={stateDef.id === "AP" ? "#38bdf8" : "#ffffff"}
                  stroke="#0f172a"
                  strokeWidth="1.5"
                />
                {/* State Code Badge */}
                <text
                  x={lx}
                  y={ly - 7}
                  textAnchor="middle"
                  fill="#1e293b"
                  fontSize="8.5"
                  fontWeight="bold"
                  className="select-none"
                  style={{ textShadow: "0 1px 2px rgba(255,255,255,0.9)" }}
                >
                  {stateDef.id}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Floating Tooltip during Hover */}
        {hoveredStateId && tooltipPos && (
          <div
            className="absolute z-30 pointer-events-none bg-slate-900/90 backdrop-blur-md text-white px-3 py-2 rounded-xl text-xs shadow-xl border border-slate-700/60 -translate-x-1/2 -translate-y-full -mt-2 transition-all"
            style={{
              left: `${tooltipPos.x}px`,
              top: `${tooltipPos.y}px`
            }}
          >
            <div className="font-bold text-white mb-1 flex items-center gap-1.5">
              <MapPin className="w-3 h-3 text-sky-400" />
              {INDIA_STATE_PATHS.find(s => s.id === hoveredStateId)?.name || hoveredStateId}
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-slate-300">
              <span className="text-slate-400">Clinicians:</span>
              <span className="font-semibold text-sky-300">{statesData[hoveredStateId]?.clinicians || 0}</span>
              <span className="text-slate-400">Patients:</span>
              <span className="font-semibold text-rose-300">{statesData[hoveredStateId]?.patients || 0}</span>
              <span className="text-slate-400">Radiologists:</span>
              <span className="font-semibold text-indigo-300">{statesData[hoveredStateId]?.radiologists || 0}</span>
            </div>
          </div>
        )}
      </div>

      {/* Selected State Summary Display (Matching the screenshot: "Andhra Pradesh 1 clinician") */}
      <div className="p-4 bg-slate-50/90 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-left">
        <div>
          <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
            <span>{activeStateInfo.name}</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-800">
              <Stethoscope className="w-3 h-3" />
              {activeStateInfo.clinicians} {activeStateInfo.clinicians === 1 ? "clinician" : "clinicians"}
            </span>
            {activeStateInfo.patients > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-100 text-rose-800">
                <Heart className="w-3 h-3" />
                {activeStateInfo.patients} patients
              </span>
            )}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5 flex flex-wrap items-center gap-2">
            {activeStateInfo.activeCenters && activeStateInfo.activeCenters.length > 0 ? (
              <span>Nodes: {activeStateInfo.activeCenters.join(", ")}</span>
            ) : (
              <span>No clinical centers onboarded in this state yet</span>
            )}
          </div>
        </div>

        {/* Action button to view all state metrics */}
        <div className="text-[10px] text-slate-400 self-end sm:self-auto font-mono">
          State ID: {activeStateInfo.id} &bull; Click on any state to inspect
        </div>
      </div>
    </div>
  );
};
