import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  AlertCircle,
  Save,
  Send,
  RefreshCw,
  Ruler,
  MousePointer,
  Layers,
  CheckCircle,
  Sparkles
} from "lucide-react";
import { RadiologistService, type RadiologyStudy } from "../../../services/radiologist.service";

export const RadiologistWorkspace: React.FC = () => {
  const { studyId } = useParams<{ studyId?: string }>();
  const router = useRouter();

  const [study, setStudy] = useState<RadiologyStudy | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // PACS Viewer Controls State
  const [viewTab, setViewTab] = useState<"ORIGINAL" | "AI_OVERLAY" | "SPLIT">("AI_OVERLAY");
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(100);
  const [overlayActive, setOverlayActive] = useState<boolean>(true);
  const [toolActive, setToolActive] = useState<"pointer" | "ruler" | "pan">("pointer");

  // Radiologist Findings Form State
  const [breastSide, setBreastSide] = useState<"Left" | "Right" | "Bilateral">("Left");
  const [findingType, setFindingType] = useState<"Mass" | "Calcification" | "Architectural Distortion" | "Asymmetry" | "No Suspicious Finding">("Mass");
  const [clockPosition, setClockPosition] = useState("2 o'clock");
  const [quadrant, setQuadrant] = useState<"Upper Outer" | "Upper Inner" | "Lower Outer" | "Lower Inner" | "Behind Nipple" | "Underarm">("Upper Outer");
  const [sizeMm, setSizeMm] = useState("18");
  const [margins, setMargins] = useState<"Circumscribed" | "Indistinct" | "Spiculated" | "Microlobulated" | "Obscured">("Indistinct");
  const [density, setDensity] = useState<"Fat-containing" | "Low density" | "Equal density" | "High density">("High density");
  const [associatedFindings, setAssociatedFindings] = useState<string[]>(["Architectural Distortion"]);
  const [birads, setBirads] = useState<"0" | "1" | "2" | "3" | "4A" | "4B" | "4C" | "5" | "6">("4A");
  const [impression, setImpression] = useState(
    "High-density irregular mass in the upper outer quadrant of the left breast (2 o'clock position) measuring 18mm with indistinct margins and focal architectural distortion."
  );
  const [recommendations, setRecommendations] = useState("Ultrasound-guided core needle biopsy recommended for histological confirmation.");
  const [repeatRequired, setRepeatRequired] = useState<boolean>(false);
  const [repeatReason, setRepeatReason] = useState("Suboptimal compression / Motion blur");

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const all = RadiologistService.getStudies();
    const found = studyId ? RadiologistService.getStudyById(studyId) : all[0];
    if (found) {
      setStudy(found);
      setBreastSide(found.side);
      if (found.birads) setBirads(found.birads as any);
      if (found.findingType) setFindingType(found.findingType);
      if (found.clockPosition) setClockPosition(found.clockPosition);
      if (found.quadrant) setQuadrant(found.quadrant);
      if (found.sizeMm) setSizeMm(found.sizeMm.toString());
      if (found.associatedFindings) setAssociatedFindings(found.associatedFindings);
      if (found.impression) setImpression(found.impression);
      if (found.recommendations) setRecommendations(found.recommendations);
      if (found.repeatRequired) {
        setRepeatRequired(true);
        if (found.repeatReason) setRepeatReason(found.repeatReason);
      }
    }
    setIsLoading(false);
  }, [studyId]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto py-16 text-center text-slate-400 space-y-3">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-primary" />
        <p className="text-xs font-bold">Loading PACS Diagnostic Workstation...</p>
      </div>
    );
  }

  if (!study) {
    return (
      <div className="max-w-7xl mx-auto py-16 text-center text-slate-500 space-y-4">
        <AlertCircle className="w-10 h-10 mx-auto text-amber-500" />
        <h2 className="text-lg font-bold">Study Not Found</h2>
        <p className="text-xs">The requested imaging study could not be loaded.</p>
        <Link href="/radiologist/queue" className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold inline-block">
          Return to Imaging Queue
        </Link>
      </div>
    );
  }

  const handleSaveDraft = () => {
    RadiologistService.saveDraft(study.id, {
      side: breastSide,
      birads,
      findingType,
      clockPosition,
      quadrant,
      sizeMm: parseInt(sizeMm) || null,
      margins,
      density,
      associatedFindings,
      impression,
      recommendations,
      repeatRequired,
      repeatReason: repeatRequired ? repeatReason : null,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleSubmitToOncologist = () => {
    RadiologistService.submitReport(study.id, {
      side: breastSide,
      birads,
      findingType,
      clockPosition,
      quadrant,
      sizeMm: parseInt(sizeMm) || null,
      margins,
      density,
      associatedFindings,
      impression,
      recommendations,
      repeatRequired,
      repeatReason: repeatRequired ? repeatReason : null,
    });
    setSubmittedSuccess(true);
    setTimeout(() => {
      setSubmittedSuccess(false);
      router.push("/radiologist/queue");
    }, 1800);
  };

  const toggleAssociatedFinding = (item: string) => {
    if (associatedFindings.includes(item)) {
      setAssociatedFindings(associatedFindings.filter((i) => i !== item));
    } else {
      setAssociatedFindings([...associatedFindings, item]);
    }
  };

  const handleResetViewer = () => {
    setZoomLevel(100);
    setBrightness(100);
    setContrast(100);
    setToolActive("pointer");
  };

  // Realistic DICOM Medical Image Canvas Renderer (Mammography / Ultrasound DICOM)
  const renderDicomViewport = (showOverlay: boolean, label: string) => {
    return (
      <div className="relative w-full h-full bg-slate-950 flex items-center justify-center overflow-hidden select-none border border-slate-800">
        {/* DICOM Header Overlay Info */}
        <div className="absolute top-3 left-3 z-20 text-[10px] font-mono text-emerald-400/90 bg-slate-950/80 p-2 rounded-lg border border-slate-800 pointer-events-none space-y-0.5">
          <p className="font-bold text-white">{study.patientName} ({study.patientId})</p>
          <p>Study ID: {study.id} &nbsp;|&nbsp; Age: {study.patientAge}y</p>
          <p>Modality: {study.imagingType} &nbsp;|&nbsp; View: {breastSide.toUpperCase()} MLO</p>
          <p>Detector: FFDM 24x30cm &nbsp;|&nbsp; 28 kVp / 85 mAs</p>
        </div>

        <div className="absolute top-3 right-3 z-20 text-[10px] font-mono text-slate-400 bg-slate-950/80 p-2 rounded-lg border border-slate-800 pointer-events-none text-right space-y-0.5">
          <p className="text-emerald-400 font-bold">{label}</p>
          <p>Zoom: {zoomLevel}% &nbsp;|&nbsp; B: {brightness}% &nbsp;|&nbsp; C: {contrast}%</p>
          <p>Window / Level: W:400 L:40</p>
          <p className="text-[9px] text-slate-500">DICOM 3.0 Compliant</p>
        </div>

        {/* Anatomical Scale Bar & Orientation */}
        <div className="absolute bottom-3 left-3 z-20 text-[9px] font-mono text-slate-400 bg-slate-950/80 px-2 py-1 rounded border border-slate-800 pointer-events-none flex items-center gap-2">
          <span>5 cm</span>
          <div className="w-12 h-1 bg-slate-400 rounded-full" />
        </div>

        <div className="absolute bottom-3 right-3 z-20 text-xs font-mono font-bold text-slate-400 bg-slate-950/80 px-2.5 py-1 rounded border border-slate-800 pointer-events-none">
          {breastSide === "Left" ? "L" : breastSide === "Right" ? "R" : "L/R"}
        </div>

        {/* DICOM Radiographic Render Box */}
        <div
          className="relative transition-all duration-150 flex items-center justify-center"
          style={{
            transform: `scale(${zoomLevel / 100})`,
            filter: `brightness(${brightness}%) contrast(${contrast}%)`,
          }}
        >
          {/* Realistic Mammography Anatomical Breast Contour SVG */}
          <svg className="w-[360px] h-[480px]" viewBox="0 0 360 480" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              {/* Radiographic Tissue Texture Gradients */}
              <radialGradient id="tissueBg" cx="40%" cy="40%" r="65%" fx="30%" fy="30%">
                <stop offset="0%" stopColor="#e2e8f0" stopOpacity="0.85" />
                <stop offset="35%" stopColor="#94a3b8" stopOpacity="0.6" />
                <stop offset="70%" stopColor="#334155" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
              </radialGradient>

              <radialGradient id="lesionDensity" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
                <stop offset="50%" stopColor="#cbd5e1" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#64748b" stopOpacity="0.2" />
              </radialGradient>
            </defs>

            {/* Pectoral Muscle Line */}
            <path d="M 0 0 L 140 0 L 70 240 L 0 200 Z" fill="#475569" opacity="0.4" />

            {/* Fibroglandular Parenchyma Breast Profile */}
            <path
              d="M 10 30 Q 180 50 290 180 Q 340 260 280 380 Q 180 470 10 440 Z"
              fill="url(#tissueBg)"
            />

            {/* Dense Fibroglandular Trabeculae Network */}
            <path d="M 40 80 Q 140 120 220 220" stroke="#f8fafc" strokeWidth="3" opacity="0.3" fill="none" />
            <path d="M 60 140 Q 160 180 240 280" stroke="#f8fafc" strokeWidth="2.5" opacity="0.25" fill="none" />
            <path d="M 80 200 Q 150 240 200 340" stroke="#e2e8f0" strokeWidth="2" opacity="0.2" fill="none" />

            {/* Suspicious High-Density Mass (2 o'clock, Upper Outer Quadrant) */}
            <circle cx="210" cy="160" r="28" fill="url(#lesionDensity)" />
            <path d="M 190 145 Q 210 135 230 150 Q 240 175 220 185 Q 195 180 190 145 Z" fill="#ffffff" opacity="0.9" />

            {/* Microcalcification Spec Cluster Callout */}
            <circle cx="205" cy="152" r="1.5" fill="#ffffff" />
            <circle cx="214" cy="158" r="1.2" fill="#ffffff" />
            <circle cx="218" cy="148" r="1.8" fill="#ffffff" />
            <circle cx="222" cy="164" r="1.0" fill="#ffffff" />

            {/* AI Bounding Box & Annotations (If Overlay Enabled) */}
            {showOverlay && overlayActive && (
              <g>
                {/* Heatmap Ring */}
                <circle cx="210" cy="160" r="42" stroke="#f43f5e" strokeWidth="2" strokeDasharray="4 3" fill="#f43f5e" fillOpacity="0.15" className="animate-pulse" />
                <rect x="160" y="110" width="100" height="100" stroke="#f43f5e" strokeWidth="1.5" fill="none" rx="8" />

                {/* AI Label Card */}
                <rect x="160" y="85" width="125" height="22" fill="#f43f5e" rx="4" />
                <text x="166" y="100" fill="#ffffff" fontSize="10" fontWeight="bold" fontFamily="sans-serif">
                  AI: Mass ({study.aiConfidence}%)
                </text>

                {/* Measurement Lines if Ruler Active */}
                {toolActive === "ruler" && (
                  <g>
                    <line x1="190" y1="160" x2="230" y2="160" stroke="#005F56" strokeWidth="2" strokeDasharray="3 2" />
                    <circle cx="190" cy="160" r="3" fill="#005F56" />
                    <circle cx="230" cy="160" r="3" fill="#005F56" />
                    <rect x="195" y="166" width="38" height="16" fill="#005F56" rx="3" />
                    <text x="199" y="178" fill="#ffffff" fontSize="9" fontWeight="bold" fontFamily="sans-serif">18.2 mm</text>
                  </g>
                )}
              </g>
            )}
          </svg>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 text-left max-w-[1600px] mx-auto pb-16">
      {/* Workspace Header */}
      <div className="border-b border-slate-200/60 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/radiologist/queue")}
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
            title="Back to Queue"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-800 tracking-tight">
                {study.patientName} <span className="text-xs font-mono text-slate-400 font-normal">({study.patientId})</span>
              </h1>
              <span className={`px-2.5 py-0.5 text-[9.5px] font-bold rounded-full border ${
                study.priority === "URGENT" || study.priority === "STAT" ? "bg-rose-50 text-rose-700 border-rose-200" : "bg-slate-100 text-slate-600 border-slate-200"
              }`}>
                {study.priority}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 font-medium">
              Study ID: <span className="font-mono text-primary font-bold">{study.id}</span> &nbsp;·&nbsp; {study.imagingType} ({study.side}) &nbsp;·&nbsp; Uploaded: {study.uploadDate} {study.uploadTime}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {savedSuccess && (
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 animate-fade-in flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" /> Draft Saved
            </span>
          )}
          {submittedSuccess && (
            <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-300 animate-fade-in flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" /> Report Finalised &amp; Sent!
            </span>
          )}
          <button
            onClick={handleSaveDraft}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 border border-slate-200"
          >
            <Save className="w-3.5 h-3.5" /> Save Draft
          </button>
          <button
            onClick={handleSubmitToOncologist}
            className="px-4 py-2 bg-primary hover:bg-[#004D46] text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-primary/15"
          >
            <Send className="w-3.5 h-3.5" /> Submit to Oncologist
          </button>
        </div>
      </div>

      {/* Main Grid: Left PACS Viewer (8 Cols) vs Right Structured Findings (4 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* PACS IMAGE VIEWER (8 COLS) */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[720px]">
          {/* PACS Viewer Toolbar */}
          <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between gap-4 text-xs font-medium text-slate-300">
            {/* View Tabs */}
            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setViewTab("ORIGINAL")}
                className={`px-3 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                  viewTab === "ORIGINAL" ? "bg-slate-800 text-white shadow-xs" : "text-slate-400 hover:text-white"
                }`}
              >
                Original DICOM
              </button>
              <button
                onClick={() => setViewTab("AI_OVERLAY")}
                className={`px-3 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer flex items-center gap-1 ${
                  viewTab === "AI_OVERLAY" ? "bg-primary text-white shadow-xs" : "text-slate-400 hover:text-white"
                }`}
              >
                <Sparkles className="w-3 h-3 text-emerald-300" /> AI Overlay
              </button>
              <button
                onClick={() => setViewTab("SPLIT")}
                className={`px-3 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                  viewTab === "SPLIT" ? "bg-slate-800 text-white shadow-xs" : "text-slate-400 hover:text-white"
                }`}
              >
                Split View
              </button>
            </div>

            {/* Interactive PACS Tools */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => setToolActive("pointer")}
                  className={`p-1.5 rounded-lg cursor-pointer transition-colors ${toolActive === "pointer" ? "bg-slate-800 text-primary" : "text-slate-400 hover:text-white"}`}
                  title="Select Pointer"
                >
                  <MousePointer className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setToolActive("ruler")}
                  className={`p-1.5 rounded-lg cursor-pointer transition-colors ${toolActive === "ruler" ? "bg-slate-800 text-primary" : "text-slate-400 hover:text-white"}`}
                  title="Ruler Measurement Line"
                >
                  <Ruler className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Zoom & Reset */}
              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => setZoomLevel((z) => Math.max(50, z - 10))}
                  className="p-1.5 text-slate-400 hover:text-white cursor-pointer"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="text-[10px] font-mono w-10 text-center text-slate-300 font-bold">{zoomLevel}%</span>
                <button
                  onClick={() => setZoomLevel((z) => Math.min(250, z + 10))}
                  className="p-1.5 text-slate-400 hover:text-white cursor-pointer"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleResetViewer}
                  className="p-1.5 text-slate-400 hover:text-white cursor-pointer border-l border-slate-800 ml-1"
                  title="Reset Viewer Adjustments"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Toggle AI Button */}
              <button
                onClick={() => setOverlayActive(!overlayActive)}
                className={`px-2.5 py-1 rounded-xl text-[10px] font-bold border transition-colors cursor-pointer flex items-center gap-1 ${
                  overlayActive ? "bg-emerald-950 text-emerald-300 border-emerald-800" : "bg-slate-900 text-slate-400 border-slate-800"
                }`}
              >
                <Layers className="w-3 h-3" />
                <span>AI Layer {overlayActive ? "ON" : "OFF"}</span>
              </button>
            </div>
          </div>

          {/* Viewport Render Area */}
          <div className="flex-1 bg-black relative flex overflow-hidden">
            {viewTab === "SPLIT" ? (
              <div className="w-full h-full grid grid-cols-2 divide-x divide-slate-800">
                {renderDicomViewport(false, "ORIGINAL DICOM")}
                {renderDicomViewport(true, `AI ANNOTATED (${study.aiConfidence}%)`)}
              </div>
            ) : viewTab === "AI_OVERLAY" ? (
              renderDicomViewport(true, `AI OVERLAY (${study.aiConfidence}% Confidence)`)
            ) : (
              renderDicomViewport(false, "ORIGINAL UNPROCESSED DICOM")
            )}
          </div>

          {/* Viewer Footer Status Bar */}
          <div className="bg-slate-950 px-4 py-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <div className="flex items-center gap-3">
              <span className="text-emerald-400 font-bold">AI Status: {study.aiStatus}</span>
              <span>Region: {study.aiFindingRegion}</span>
            </div>
            <span>BI-RADS Classification Engine v2.4</span>
          </div>
        </div>

        {/* STRUCTURED FINDINGS FORM (4 COLS) */}
        <div className="lg:col-span-4 bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Structured Diagnostic Findings</h2>
            <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">BI-RADS Standard</span>
          </div>

          <div className="space-y-4">
            {/* BI-RADS Category Selection */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                BI-RADS Category Assessment
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {(["0", "1", "2", "3", "4A", "4B", "4C", "5", "6"] as const).map((b) => (
                  <button
                    key={b}
                    onClick={() => setBirads(b)}
                    className={`py-2 text-xs font-black rounded-xl border transition-all cursor-pointer ${
                      birads === b
                        ? "bg-primary text-white border-primary shadow-xs"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:border-primary/40"
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>

            {/* Finding Type & Side */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                  Primary Finding Type
                </label>
                <select
                  value={findingType}
                  onChange={(e) => setFindingType(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-700 focus:outline-none"
                >
                  <option value="Mass">Mass / Lesion</option>
                  <option value="Calcification">Microcalcification</option>
                  <option value="Architectural Distortion">Architectural Distortion</option>
                  <option value="Asymmetry">Asymmetry</option>
                  <option value="No Suspicious Finding">No Suspicious Finding</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                  Affected Side
                </label>
                <select
                  value={breastSide}
                  onChange={(e) => setBreastSide(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-700 focus:outline-none"
                >
                  <option value="Left">Left Breast</option>
                  <option value="Right">Right Breast</option>
                  <option value="Bilateral">Bilateral</option>
                </select>
              </div>
            </div>

            {/* Quadrant & Clock Position */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                  Anatomical Quadrant
                </label>
                <select
                  value={quadrant}
                  onChange={(e) => setQuadrant(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-700 focus:outline-none"
                >
                  <option value="Upper Outer">Upper Outer</option>
                  <option value="Upper Inner">Upper Inner</option>
                  <option value="Lower Outer">Lower Outer</option>
                  <option value="Lower Inner">Lower Inner</option>
                  <option value="Behind Nipple">Behind Nipple</option>
                  <option value="Underarm">Underarm / Axillary Tail</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                  Clock Position &amp; Size (mm)
                </label>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={clockPosition}
                    onChange={(e) => setClockPosition(e.target.value)}
                    placeholder="2 o'clock"
                    className="w-1/2 bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-700 focus:outline-none"
                  />
                  <input
                    type="number"
                    value={sizeMm}
                    onChange={(e) => setSizeMm(e.target.value)}
                    placeholder="Size mm"
                    className="w-1/2 bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-700 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Margins & Parenchymal Density */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                  Lesion Margins
                </label>
                <select
                  value={margins}
                  onChange={(e) => setMargins(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-700 focus:outline-none"
                >
                  <option value="Circumscribed">Circumscribed</option>
                  <option value="Indistinct">Indistinct</option>
                  <option value="Spiculated">Spiculated</option>
                  <option value="Microlobulated">Microlobulated</option>
                  <option value="Obscured">Obscured</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                  Parenchymal Density
                </label>
                <select
                  value={density}
                  onChange={(e) => setDensity(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-700 focus:outline-none"
                >
                  <option value="High density">High density</option>
                  <option value="Equal density">Equal density</option>
                  <option value="Low density">Low density</option>
                  <option value="Fat-containing">Fat-containing</option>
                </select>
              </div>
            </div>

            {/* Associated Findings Checkboxes */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                Associated Clinical Features
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs font-medium text-slate-700">
                {[
                  "Architectural Distortion",
                  "Skin Thickening",
                  "Nipple Retraction",
                  "Axillary Lymphadenopathy",
                ].map((item) => (
                  <label key={item} className="flex items-center gap-2 cursor-pointer p-1.5 bg-slate-50 rounded-lg border border-slate-200/60">
                    <input
                      type="checkbox"
                      checked={associatedFindings.includes(item)}
                      onChange={() => toggleAssociatedFinding(item)}
                      className="text-primary rounded focus:ring-primary"
                    />
                    <span className="text-[11px] font-semibold">{item}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Radiologist Impression */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                Diagnostic Impression Summary
              </label>
              <textarea
                rows={3}
                value={impression}
                onChange={(e) => setImpression(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-700 font-medium leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Enter radiological impression..."
              />
            </div>

            {/* Oncologist Recommendations */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                Recommendations for Oncologist
              </label>
              <textarea
                rows={2}
                value={recommendations}
                onChange={(e) => setRecommendations(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-700 font-medium leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Enter clinical recommendations..."
              />
            </div>

            {/* Repeat Scan Request */}
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl space-y-2">
              <label className="flex items-center gap-2 text-xs font-bold text-amber-900 cursor-pointer">
                <input
                  type="checkbox"
                  checked={repeatRequired}
                  onChange={(e) => setRepeatRequired(e.target.checked)}
                  className="text-amber-600 rounded focus:ring-amber-500"
                />
                <span>Request Scan Repeat / Additional Views</span>
              </label>
              {repeatRequired && (
                <input
                  type="text"
                  value={repeatReason}
                  onChange={(e) => setRepeatReason(e.target.value)}
                  placeholder="Reason for repeat (e.g. motion artifact)..."
                  className="w-full bg-white border border-amber-300 rounded-xl p-2.5 text-xs font-bold text-amber-900 focus:outline-none"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
