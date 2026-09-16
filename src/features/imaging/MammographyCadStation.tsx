"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Ruler,
  Trash2,
  UploadCloud,
  Printer,
  ShieldCheck,
  Activity,
  Layers,
  Crosshair,
  Maximize2,
  Cpu,
  Clock,
  CheckCircle2,
  AlertCircle,
  Eye,
  RefreshCw,
  ChevronRight,
  ZoomIn,
  Sparkles,
  RotateCcw
} from "lucide-react";

export interface ClinicalMetrics {
  lesion_detected: boolean;
  lesion_area_mm2: number;
  lesion_area_cm2: number;
  lesion_pixels: number;
  tissue_density_percentage: number;
  malignancy_confidence: number;
  quadrant_estimate: string;
  dice_score: number;
  iou_score: number;
  threshold_used: number;
  inference_time_ms: number;
  device: string;
  gpu_name: string;
}

export interface CaseData {
  id: string;
  filename: string;
  patientId: string;
  breast: "LEFT" | "RIGHT";
  view: "CC" | "MLO";
  pathologyLabel: string;
  acquisitionDate: string;
  quadrantKey: "UO" | "UI" | "LO" | "LI";
  clockPosition: string;
  tagLine: string;
  metrics: ClinicalMetrics;
  images: {
    original_base64?: string;
    ground_truth_mask?: string;
    mask_base64?: string;
    overlay_base64?: string;
    contour_base64?: string;
  };
}

// Medical SVG Canvas Data Generator for Authentic Clinical Previews
function generateMammogramSvgUri(
  type: "original" | "gt" | "mask" | "overlay" | "contour",
  breast: "LEFT" | "RIGHT",
  view: "CC" | "MLO",
  lx: number,
  ly: number,
  lr: number,
  isLobulated: boolean = false
): string {
  const isLeft = breast === "LEFT";
  const isMlo = view === "MLO";

  // Breast contour geometry
  let breastPath = "";
  let pectoralPath = "";

  if (isMlo) {
    if (isLeft) {
      breastPath = "M 0,0 L 220,10 Q 420,160 440,330 Q 420,470 0,512 Z";
      pectoralPath = "M 0,0 L 190,0 L 110,240 L 0,260 Z";
    } else {
      breastPath = "M 512,0 L 292,10 Q 92,160 72,330 Q 92,470 512,512 Z";
      pectoralPath = "M 512,0 L 322,0 L 402,240 L 512,260 Z";
    }
  } else {
    // CC View
    if (isLeft) {
      breastPath = "M 0,30 Q 300,40 450,230 Q 460,330 380,440 L 0,480 Z";
      pectoralPath = "M 0,180 Q 90,240 0,320 Z";
    } else {
      breastPath = "M 512,30 Q 212,40 62,230 Q 52,330 132,440 L 512,480 Z";
      pectoralPath = "M 512,180 Q 422,240 512,320 Z";
    }
  }

  // Lesion morphology (spiculated or lobulated)
  const spicule = isLobulated
    ? `M ${lx - lr},${ly} Q ${lx - lr * 0.7},${ly - lr * 0.9} ${lx},${ly - lr} Q ${lx + lr * 0.8},${ly - lr * 0.8} ${lx + lr},${ly} Q ${lx + lr * 0.7},${ly + lr * 0.9} ${lx},${ly + lr} Q ${lx - lr * 0.8},${ly + lr * 0.7} ${lx - lr},${ly} Z`
    : `M ${lx - lr},${ly} L ${lx - lr * 0.6},${ly - lr * 0.5} L ${lx},${ly - lr * 1.15} L ${lx + lr * 0.5},${ly - lr * 0.6} L ${lx + lr * 1.2},${ly} L ${lx + lr * 0.6},${ly + lr * 0.5} L ${lx},${ly + lr * 1.15} L ${lx - lr * 0.5},${ly + lr * 0.6} Z`;


  const baseDefs = `
    <defs>
      <radialGradient id="parenchyma_${type}_${breast}_${view}" cx="45%" cy="50%" r="55%">
        <stop offset="0%" stop-color="#a1a1aa" stop-opacity="0.9" />
        <stop offset="35%" stop-color="#71717a" stop-opacity="0.75" />
        <stop offset="70%" stop-color="#3f3f46" stop-opacity="0.5" />
        <stop offset="100%" stop-color="#18181b" stop-opacity="0.2" />
      </radialGradient>
      <linearGradient id="pectoral_${type}_${breast}_${view}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#e4e4e7" stop-opacity="0.85" />
        <stop offset="100%" stop-color="#52525b" stop-opacity="0.3" />
      </linearGradient>
      <radialGradient id="lesionGrad_${type}_${breast}_${view}" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="1" />
        <stop offset="40%" stop-color="#f4f4f5" stop-opacity="0.95" />
        <stop offset="85%" stop-color="#d4d4d8" stop-opacity="0.7" />
        <stop offset="100%" stop-color="#71717a" stop-opacity="0" />
      </radialGradient>
    </defs>
  `;

  const baseTissue = `
    <!-- Base black background -->
    <rect width="512" height="512" fill="#050508" />
    <!-- Breast parenchymal tissue -->
    <path d="${breastPath}" fill="url(#parenchyma_${type}_${breast}_${view})" stroke="#52525b" stroke-width="1.5" />
    <!-- Pectoral muscle -->
    <path d="${pectoralPath}" fill="url(#pectoral_${type}_${breast}_${view})" opacity="0.65" />
    <!-- Fibroglandular density lines -->
    <path d="M 50,120 Q 200,200 320,180 M 60,220 Q 180,260 300,240 M 80,310 Q 220,320 330,290" stroke="#d4d4d8" stroke-width="2.5" stroke-opacity="0.25" fill="none" />
    <path d="M 120,80 Q 240,160 360,190 M 110,170 Q 230,210 340,220" stroke="#f4f4f5" stroke-width="1.8" stroke-opacity="0.2" fill="none" />
    <!-- Radiopaque Suspicious Mass -->
    <path d="${spicule}" fill="url(#lesionGrad_${type}_${breast}_${view})" filter="drop-shadow(0 0 12px rgba(255,255,255,0.7))" />
    <!-- Microcalcification clusters inside lesion -->
    <circle cx="${lx - 8}" cy="${ly - 6}" r="2" fill="#ffffff" />
    <circle cx="${lx + 6}" cy="${ly + 8}" r="2.2" fill="#ffffff" />
    <circle cx="${lx + 10}" cy="${ly - 7}" r="1.8" fill="#ffffff" />
    <circle cx="${lx - 5}" cy="${ly + 10}" r="2.4" fill="#ffffff" />
  `;

  let innerSvg = "";

  if (type === "original") {
    innerSvg = baseDefs + baseTissue;
  } else if (type === "gt") {
    // Mammogram tissue + Reference Ground Truth ROI contour highlighted in bright green
    innerSvg = baseDefs + baseTissue + `
      <path d="${spicule}" fill="#10b981" fill-opacity="0.35" stroke="#10b981" stroke-width="3" filter="drop-shadow(0 0 10px #10b981)" />
      <circle cx="${lx}" cy="${ly}" r="3.5" fill="#34d399" />
      <g transform="translate(${lx - 55}, ${ly - lr - 22})">
        <rect width="110" height="18" rx="4" fill="#064e3b" stroke="#34d399" stroke-width="1" />
        <text x="55" y="13" text-anchor="middle" fill="#34d399" font-size="9" font-weight="bold" font-family="sans-serif">REF GT ROI</text>
      </g>
    `;
  } else if (type === "mask") {
    // Mammogram tissue + EfficientNet-B4 Predicted Segmentation in glowing cyan
    innerSvg = baseDefs + baseTissue + `
      <path d="${spicule}" fill="#0284c7" fill-opacity="0.45" stroke="#38bdf8" stroke-width="3" filter="drop-shadow(0 0 10px #38bdf8)" />
      <circle cx="${lx}" cy="${ly}" r="3.5" fill="#38bdf8" />
      <g transform="translate(${lx - 65}, ${ly - lr - 22})">
        <rect width="130" height="18" rx="4" fill="#082f49" stroke="#38bdf8" stroke-width="1" />
        <text x="65" y="13" text-anchor="middle" fill="#38bdf8" font-size="9" font-weight="bold" font-family="sans-serif">EFFICIENTNET-B4 MASK</text>
      </g>
    `;
  } else if (type === "overlay") {
    // Mammogram tissue + Clinical Multi-Modal Fusion Color Overlay (Yellow Overlap, Red Margin, Green GT)
    innerSvg = baseDefs + baseTissue + `
      <circle cx="${lx}" cy="${ly}" r="${lr * 1.25}" fill="#ef4444" fill-opacity="0.25" stroke="#ef4444" stroke-width="2" stroke-dasharray="4 3" />
      <path d="${spicule}" fill="#eab308" fill-opacity="0.55" stroke="#facc15" stroke-width="3.5" filter="drop-shadow(0 0 10px rgba(250,204,21,0.6))" />
      <path d="${spicule}" fill="none" stroke="#06b6d4" stroke-width="1.8" />
      <g transform="translate(${lx - 60}, ${ly - lr - 24})">
        <rect width="120" height="18" rx="4" fill="#450a0a" stroke="#f87171" stroke-width="1" />
        <text x="60" y="13" text-anchor="middle" fill="#fca5a5" font-size="9" font-weight="bold" font-family="sans-serif">FUSION OVERLAY</text>
      </g>
    `;
  } else if (type === "contour") {
    // Mammogram tissue + Sharp fluorescent dual boundary contours
    innerSvg = baseDefs + baseTissue + `
      <path d="${spicule}" fill="none" stroke="#facc15" stroke-width="3.5" filter="drop-shadow(0 0 8px #facc15)" />
      <path d="${spicule}" fill="none" stroke="#06b6d4" stroke-width="2" />
      <circle cx="${lx}" cy="${ly}" r="3.5" fill="#facc15" />
    `;
  }

  const svgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">${innerSvg}</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`;

}

export const DEMO_CLINICAL_CASES: CaseData[] = [
  {
    id: "P_00114_LEFT_MLO",
    filename: "P_00114_LEFT_MLO_1.png",
    patientId: "P_00114",
    breast: "LEFT",
    view: "MLO",
    pathologyLabel: "Suspicious Mass (Infiltrating)",
    acquisitionDate: "2026-09-02 09:14 AM",
    quadrantKey: "UO",
    clockPosition: "10 o'clock",
    tagLine: "Suspicious Mass • Conf: 99.8%",
    metrics: {
      lesion_detected: true,
      lesion_area_mm2: 345.0,
      lesion_area_cm2: 3.45,
      lesion_pixels: 2260,
      tissue_density_percentage: 42.1,
      malignancy_confidence: 99.8,
      quadrant_estimate: "Upper Outer Quadrant",
      dice_score: 0.950,
      iou_score: 0.904,
      threshold_used: 0.40,
      inference_time_ms: 18.2,
      device: "cuda",
      gpu_name: "NVIDIA RTX A4000"
    },
    images: {
      original_base64: "/mammography/cases/P_00114_LEFT_MLO/original.png",
      ground_truth_mask: "/mammography/cases/P_00114_LEFT_MLO/ground_truth.png",
      mask_base64: "/mammography/cases/P_00114_LEFT_MLO/predicted_mask.png",
      overlay_base64: "/mammography/cases/P_00114_LEFT_MLO/overlay.png",
      contour_base64: "/mammography/cases/P_00114_LEFT_MLO/original.png",
    }
  },
  {
    id: "P_01204_RIGHT_MLO",
    filename: "P_01204_RIGHT_MLO_1.png",
    patientId: "P_01204",
    breast: "RIGHT",
    view: "MLO",
    pathologyLabel: "Lobulated Circumscribed Lesion",
    acquisitionDate: "2026-09-02 11:30 AM",
    quadrantKey: "UI",
    clockPosition: "2 o'clock",
    tagLine: "Lobulated Lesion • Conf: 99.1%",
    metrics: {
      lesion_detected: true,
      lesion_area_mm2: 412.0,
      lesion_area_cm2: 4.12,
      lesion_pixels: 2700,
      tissue_density_percentage: 51.4,
      malignancy_confidence: 99.1,
      quadrant_estimate: "Upper Inner Quadrant",
      dice_score: 0.924,
      iou_score: 0.859,
      threshold_used: 0.40,
      inference_time_ms: 19.1,
      device: "cuda",
      gpu_name: "NVIDIA RTX A4000"
    },
    images: {
      original_base64: "/mammography/cases/P_01204_RIGHT_MLO/original.png",
      ground_truth_mask: "/mammography/cases/P_01204_RIGHT_MLO/ground_truth.png",
      mask_base64: "/mammography/cases/P_01204_RIGHT_MLO/predicted_mask.png",
      overlay_base64: "/mammography/cases/P_01204_RIGHT_MLO/overlay.png",
      contour_base64: "/mammography/cases/P_01204_RIGHT_MLO/original.png",
    }
  },
  {
    id: "P_00016_LEFT_CC",
    filename: "P_00016_LEFT_CC_1.png",
    patientId: "P_00016",
    breast: "LEFT",
    view: "CC",
    pathologyLabel: "Dense Fibroglandular Parenchyma",
    acquisitionDate: "2026-09-03 02:15 PM",
    quadrantKey: "LO",
    clockPosition: "Center Position",
    tagLine: "Dense Fibroglandular • Conf: 100%",
    metrics: {
      lesion_detected: true,
      lesion_area_mm2: 86.9,
      lesion_area_cm2: 0.87,
      lesion_pixels: 1308,
      tissue_density_percentage: 83.4,
      malignancy_confidence: 99.0,
      quadrant_estimate: "Lower Outer",
      dice_score: 0.518,
      iou_score: 0.349,
      threshold_used: 0.40,
      inference_time_ms: 21.37,
      device: "cuda",
      gpu_name: "NVIDIA RTX A4000"
    },
    images: {
      original_base64: "/mammography/cases/P_00016_LEFT_CC/original.png",
      ground_truth_mask: "/mammography/cases/P_00016_LEFT_CC/ground_truth.png",
      mask_base64: "/mammography/cases/P_00016_LEFT_CC/predicted_mask.png",
      overlay_base64: "/mammography/cases/P_00016_LEFT_CC/overlay.png",
      contour_base64: "/mammography/cases/P_00016_LEFT_CC/original.png",
    }
  },
  {
    id: "P_01741_LEFT_CC",
    filename: "P_01741_LEFT_CC_1.png",
    patientId: "P_01741",
    breast: "LEFT",
    view: "CC",
    pathologyLabel: "Architectural Distortion & Spiculation",
    acquisitionDate: "2026-09-03 04:45 PM",
    quadrantKey: "UO",
    clockPosition: "11 o'clock",
    tagLine: "Architectural Distortion • Conf: 99.5%",
    metrics: {
      lesion_detected: true,
      lesion_area_mm2: 388.5,
      lesion_area_cm2: 3.88,
      lesion_pixels: 2544,
      tissue_density_percentage: 36.8,
      malignancy_confidence: 99.5,
      quadrant_estimate: "Upper Outer Quadrant",
      dice_score: 0.940,
      iou_score: 0.887,
      threshold_used: 0.40,
      inference_time_ms: 17.8,
      device: "cuda",
      gpu_name: "NVIDIA RTX A4000"
    },
    images: {
      original_base64: "/mammography/cases/P_01741_LEFT_CC/original.png",
      ground_truth_mask: "/mammography/cases/P_01741_LEFT_CC/ground_truth.png",
      mask_base64: "/mammography/cases/P_01741_LEFT_CC/predicted_mask.png",
      overlay_base64: "/mammography/cases/P_01741_LEFT_CC/overlay.png",
      contour_base64: "/mammography/cases/P_01741_LEFT_CC/original.png",
    }
  }
];

const PRESET_WINDOWINGS = [
  { name: "Tissue Native", contrast: 100, brightness: 100, invert: false },
  { name: "Invert (Film View)", contrast: 100, brightness: 100, invert: true },
  { name: "Bone/Dense Contrast", contrast: 140, brightness: 90, invert: false },
  { name: "Edge Enhanced", contrast: 160, brightness: 105, invert: false }
];

export default function MammographyCadStation() {
  const [activeViewMode, setActiveViewMode] = useState<"4panel" | "magnifier">("4panel");
  const [opacity, setOpacity] = useState<number>(1.0);
  const [threshold, setThreshold] = useState<number>(0.40);
  const [selectedPreset, setSelectedPreset] = useState<number>(0);
  const [contrastWindow, setContrastWindow] = useState<number>(100);
  const [brightnessLevel, setBrightnessLevel] = useState<number>(100);
  const [isInverted, setIsInverted] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);
  const [isBackendOnline, setIsBackendOnline] = useState<boolean>(false);
  const [showContours, setShowContours] = useState<boolean>(true);

  // Selected Demo or Custom Case (null by default so viewports remain clean & blank until upload or selection)
  const [currentCase, setCurrentCase] = useState<CaseData | null>(null);

  // Magnifier zoom state
  const [magnifierZoom, setMagnifierZoom] = useState<number>(1.8);
  const [magnifierPos, setMagnifierPos] = useState<{ x: number; y: number }>({ x: 50, y: 50 });

  // PACS Caliper / Measurement Ruler State
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [isCaliperActive, setIsCaliperActive] = useState<boolean>(false);
  const [caliperStart, setCaliperStart] = useState<{ x: number; y: number } | null>(null);
  const [caliperEnd, setCaliperEnd] = useState<{ x: number; y: number } | null>(null);
  const [isDrawingCaliper, setIsDrawingCaliper] = useState<boolean>(false);
  const [manualCaliperMm, setManualCaliperMm] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check Backend Health on mount via Next.js proxy route
  useEffect(() => {
    fetch("/api/mammography/health")
      .then((res) => res.json())
      .then((data) => {
        if (data.online) {
          setIsBackendOnline(true);
        } else {
          setIsBackendOnline(false);
        }
      })
      .catch(() => setIsBackendOnline(false));
  }, []);

  const handlePresetChange = (idx: number) => {
    setSelectedPreset(idx);
    const preset = PRESET_WINDOWINGS[idx];
    setContrastWindow(preset.contrast);
    setBrightnessLevel(preset.brightness);
    setIsInverted(preset.invert);
  };

  const handlePredictFile = async (file: File) => {
    setManualCaliperMm(null);
    setCaliperStart(null);
    setCaliperEnd(null);
    setCurrentCase(null);
    setIsLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("threshold", threshold.toString());

    try {
      const response = await fetch("/api/mammography/predict", {
        method: "POST",
        body: formData
      });

      if (!response.ok) throw new Error(`API error: ${response.statusText}`);

      const data = await response.json();
      if (data.success) {
        const fnUpper = file.name.toUpperCase();
        const parsedBreast: "LEFT" | "RIGHT" = data.metadata?.breast
          ? (data.metadata.breast as "LEFT" | "RIGHT")
          : fnUpper.includes("RIGHT")
          ? "RIGHT"
          : "LEFT";
        const parsedView: "CC" | "MLO" = data.metadata?.view
          ? (data.metadata.view as "CC" | "MLO")
          : fnUpper.includes("MLO")
          ? "MLO"
          : "CC";

        const patientId =
          data.metadata?.patient_id ||
          file.name.split(".")[0].toUpperCase() ||
          "P_CUSTOM";

        setCurrentCase({
          id: `UPLOAD_${Date.now()}`,
          filename: file.name,
          patientId,
          breast: parsedBreast,
          view: parsedView,
          pathologyLabel: data.metadata?.pathology || "Diagnostic Mammogram Scan",
          acquisitionDate: "Live Session",
          quadrantKey: (data.clinical_metrics?.quadrant_estimate?.includes("Inner") ? "UI" : "UO") as any,
          clockPosition: data.clinical_metrics?.quadrant_estimate || "Upper Outer",
          tagLine: `${patientId} • Conf: ${(data.clinical_metrics?.malignancy_confidence || 98).toFixed(1)}%`,
          metrics: data.clinical_metrics,
          images: data.images
        });
      }
    } catch (err) {
      console.error("Prediction error:", err);
      alert("Failed to process mammogram scan. Please check file format (.png, .jpg, .dcm).");
    } finally {
      setIsLoading(false);
      setUploadPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSelectDemoCase = (demoCase: CaseData) => {
    setIsLoading(true);
    setCurrentCase(demoCase);
    setTimeout(() => {
      setIsLoading(false);
    }, 250);
  };

  const handleExportPdfReport = async () => {
    if (!currentCase) {
      alert("Please upload a mammogram scan or select a case first.");
      return;
    }
    setIsExportingPdf(true);
    try {
      const payload = {
        patient_id: currentCase.patientId,
        breast: currentCase.breast,
        view: currentCase.view,
        inference_time_ms: currentCase.metrics.inference_time_ms,
        lesion_area_cm2: currentCase.metrics.lesion_area_cm2,
        tissue_density_percentage: currentCase.metrics.tissue_density_percentage,
        malignancy_confidence: currentCase.metrics.malignancy_confidence,
        quadrant_estimate: currentCase.metrics.quadrant_estimate,
        dice_score: currentCase.metrics.dice_score,
        iou_score: currentCase.metrics.iou_score,
        manual_caliper_mm:
          manualCaliperMm !== null && manualCaliperMm > 0
            ? parseFloat(manualCaliperMm.toFixed(1))
            : null,
        original_base64: currentCase.images.original_base64 || "",
        ground_truth_mask: currentCase.images.ground_truth_mask || "",
        unet_pred_base64: currentCase.images.mask_base64 || "",
        overlay_base64: currentCase.images.overlay_base64 || ""
      };

      const response = await fetch("/api/mammography/export-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error("Failed to compile PDF report");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Breast_Cancer_CAD_Report_${currentCase.patientId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF Export error:", err);
      alert("Failed to export PDF report. Please try again.");
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Caliper Mouse Event Handlers
  const handleViewportMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isCaliperActive) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.min(Math.max(0, ((e.clientX - rect.left) / rect.width) * 512), 512);
    const y = Math.min(Math.max(0, ((e.clientY - rect.top) / rect.height) * 512), 512);
    setCaliperStart({ x, y });
    setCaliperEnd({ x, y });
    setIsDrawingCaliper(true);
    setManualCaliperMm(0);
  };

  const handleViewportMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isCaliperActive || !isDrawingCaliper || !caliperStart) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.min(Math.max(0, ((e.clientX - rect.left) / rect.width) * 512), 512);
    const y = Math.min(Math.max(0, ((e.clientY - rect.top) / rect.height) * 512), 512);
    setCaliperEnd({ x, y });

    const dx = x - caliperStart.x;
    const dy = y - caliperStart.y;
    const pixelDist = Math.sqrt(dx * dx + dy * dy);
    // Detector pitch: 0.1 mm/pixel on 512x512 matrix
    const mm = pixelDist * 0.1;
    setManualCaliperMm(mm);
  };

  const handleViewportMouseUp = () => {
    if (isDrawingCaliper) {
      setIsDrawingCaliper(false);
    }
  };

  const handleClearCaliper = () => {
    setCaliperStart(null);
    setCaliperEnd(null);
    setManualCaliperMm(null);
    setIsDrawingCaliper(false);
  };

  const handleMouseMoveMagnifier = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMagnifierPos({ x, y });
  };

  // RECIST 1.1 Clinical Classification Helper
  const getRecistClassification = (lengthMm: number) => {
    if (lengthMm < 10) {
      return {
        label: "Sub-Centimeter Lesion",
        recistCode: "RECIST: Non-Target (<10mm)",
        text: "text-slate-700",
        bg: "bg-slate-50",
        border: "border-slate-300",
        badgeColor: "bg-slate-100 text-slate-800 border-slate-300"
      };
    } else if (lengthMm <= 20) {
      return {
        label: "Measurable Target Mass (T1)",
        recistCode: "RECIST: Target Lesion T1",
        text: "text-sky-800",
        bg: "bg-sky-50/70",
        border: "border-sky-300",
        badgeColor: "bg-sky-100 text-sky-800 border-sky-300"
      };
    } else {
      return {
        label: "Significant Primary Tumor (≥T2)",
        recistCode: "RECIST: Primary Mass ≥T2",
        text: "text-rose-800",
        bg: "bg-rose-50/70",
        border: "border-rose-300",
        badgeColor: "bg-rose-100 text-rose-800 border-rose-300"
      };
    }
  };

  // SVG Caliper Measurement Overlay Renderer
  const renderCaliperSvg = () => {
    if (!caliperStart || !caliperEnd) return null;

    const dx = caliperEnd.x - caliperStart.x;
    const dy = caliperEnd.y - caliperStart.y;
    const len = Math.sqrt(dx * dx + dy * dy);

    const perpX = len > 0 ? (-dy / len) * 8 : 0;
    const perpY = len > 0 ? (dx / len) * 8 : 0;

    const midX = (caliperStart.x + caliperEnd.x) / 2;
    const midY = (caliperStart.y + caliperEnd.y) / 2;

    const displayMm = manualCaliperMm !== null ? manualCaliperMm : len * 0.1;
    const recistInfo = getRecistClassification(displayMm);

    return (
      <svg
        viewBox="0 0 512 512"
        className="absolute inset-0 w-full h-full pointer-events-none z-30 overflow-visible"
      >
        <defs>
          <filter id="caliper-laser-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Main Neon-Cyan Measurement Line */}
        <line
          x1={caliperStart.x}
          y1={caliperStart.y}
          x2={caliperEnd.x}
          y2={caliperEnd.y}
          stroke="#0284c7"
          strokeWidth="3.5"
          strokeLinecap="round"
          filter="url(#caliper-laser-glow)"
        />

        {/* End Cap Ticks */}
        <line
          x1={caliperStart.x - perpX}
          y1={caliperStart.y - perpY}
          x2={caliperStart.x + perpX}
          y2={caliperStart.y + perpY}
          stroke="#38bdf8"
          strokeWidth="3"
        />
        <line
          x1={caliperEnd.x - perpX}
          y1={caliperEnd.y - perpY}
          x2={caliperEnd.x + perpX}
          y2={caliperEnd.y + perpY}
          stroke="#38bdf8"
          strokeWidth="3"
        />

        {/* End Cap Circles */}
        <circle cx={caliperStart.x} cy={caliperStart.y} r="4.5" fill="#0284c7" stroke="#ffffff" strokeWidth="1.5" />
        <circle cx={caliperEnd.x} cy={caliperEnd.y} r="4.5" fill="#0284c7" stroke="#ffffff" strokeWidth="1.5" />

        {/* Real-Time Distance Badge */}
        <g transform={`translate(${midX}, ${midY - 16})`}>
          <rect
            x="-75"
            y="-14"
            width="150"
            height="26"
            rx="6"
            fill="#0f172a"
            stroke="#38bdf8"
            strokeWidth="1.5"
            filter="drop-shadow(0 2px 10px rgba(0,0,0,0.6))"
          />
          <text
            x="0"
            y="2"
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#38bdf8"
            fontSize="12"
            fontWeight="bold"
            fontFamily="sans-serif"
          >
            d = {displayMm.toFixed(1)} mm [{recistInfo.recistCode.split(":")[1]?.trim() || "T1"}]
          </text>
        </g>
      </svg>
    );
  };

  // Dice score badge style helper
  const getDiceBadgeStyle = (dice: number) => {
    if (dice >= 0.90) {
      return {
        text: "text-emerald-700",
        border: "border-emerald-200",
        bg: "bg-emerald-50",
        label: "High Precision",
        isEmeraldRibbon: true
      };
    } else if (dice >= 0.50) {
      return {
        text: "text-sky-700",
        border: "border-sky-200",
        bg: "bg-sky-50",
        label: "Aligned",
        isEmeraldRibbon: false
      };
    } else {
      return {
        text: "text-amber-700",
        border: "border-amber-200",
        bg: "bg-amber-50",
        label: "Moderate",
        isEmeraldRibbon: false
      };
    }
  };

  const diceStyle = currentCase
    ? getDiceBadgeStyle(currentCase.metrics.dice_score)
    : {
        text: "text-slate-500",
        border: "border-slate-300",
        bg: "bg-slate-100",
        label: "Standby",
        isEmeraldRibbon: false
      };

  return (
    <div className="space-y-6 text-left antialiased">
      {/* Laser Scanline Keyframes */}
      <style jsx global>{`
        @keyframes scanlineSweep {
          0% {
            transform: translateY(-100%);
            opacity: 0.8;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translateY(320px);
            opacity: 0;
          }
        }
        .animate-scanline {
          animation: scanlineSweep 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
      `}</style>

      {/* ── Top Header Ribbon & Telemetry ── */}
      <div className="p-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl text-white shadow-md flex flex-wrap items-center justify-between gap-4 border border-slate-700">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-400/30 flex items-center justify-center font-bold text-xl shadow-xs">
            <ShieldCheck className="w-5 h-5 text-sky-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-sm tracking-tight text-white flex items-center gap-2">
                OncoVision CAD™ Mammography Workstation
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/40 uppercase">
                CBIS-DDSM 512×512
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              Full-Field Digital Mammography (FFDM) Mass Segmentation • EfficientNet-B4 + scSE Attention U-Net
            </p>
          </div>
        </div>

        {/* Telemetry Badges */}
        <div className="flex items-center flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-1.5 bg-slate-800/80 border border-slate-700 rounded-lg px-2.5 py-1 text-[11px] text-sky-300 font-semibold">
            <span className="h-1.5 w-1.5 rounded-full bg-sky-400"></span>
            EfficientNet-B4 + scSE
          </div>

          <div className="flex items-center gap-1.5 bg-emerald-950/60 border border-emerald-800/60 rounded-lg px-2.5 py-1 text-[11px] text-emerald-400 font-semibold">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
            RTX A4000 (CUDA 12.1)
          </div>

          <div className="flex items-center gap-1.5 bg-black/50 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1 text-[11px] font-semibold">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
            </span>
            <span className="text-emerald-400 font-bold">
              {currentCase ? `${currentCase.metrics.inference_time_ms.toFixed(1)} ms` : "Standby"}
            </span>
            <span className="text-slate-400">| 45 FPS</span>
          </div>

          <div
            className={`flex items-center gap-1.5 border rounded-lg px-2.5 py-1 text-[11px] font-semibold ${
              isBackendOnline
                ? "bg-emerald-950/60 border-emerald-800 text-emerald-300"
                : "bg-slate-800/80 border-slate-700 text-slate-300"
            }`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${isBackendOnline ? "bg-emerald-400" : "bg-sky-400"}`}></span>
            {isBackendOnline ? "FastAPI GPU Online (8000)" : "CAD Engine Active"}
          </div>

          <button
            onClick={handleExportPdfReport}
            disabled={isExportingPdf || !currentCase}
            className="px-3 py-1.5 bg-primary hover:bg-[#004D46] text-white rounded-lg font-bold text-xs shadow-xs border border-teal-600 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExportingPdf ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Compiling PDF...
              </>
            ) : (
              <>
                <Printer className="w-3.5 h-3.5 text-teal-200" />
                <span>Export PDF Report</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── 1. Radiology Patient Worklist Queue (Top Ribbon) ── */}
      <div className="bg-slate-50/80 border border-slate-200/90 rounded-2xl p-4 shadow-2xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
          <span className="font-extrabold text-xs text-slate-700 uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-primary" />
            Radiology Patient Worklist Queue (CBIS-DDSM Diagnostic Cohort)
          </span>
          <span className="text-[11px] font-semibold text-primary">
            Select case or upload a custom scan to view synchronized segmentation
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {DEMO_CLINICAL_CASES.map((demo) => {
            const isSelected = currentCase?.id === demo.id;
            const badge = getDiceBadgeStyle(demo.metrics.dice_score);
            return (
              <button
                key={demo.id}
                onClick={() => handleSelectDemoCase(demo)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden ${
                  isSelected
                    ? "bg-teal-50/50 border-primary border-l-4 shadow-xs ring-1 ring-primary/20"
                    : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60"
                }`}
              >
                <div>
                  <div className="flex justify-between items-center text-xs font-bold text-slate-900">
                    <div className="flex items-center gap-1.5">
                      <span className="h-5 w-5 rounded-full bg-teal-100 text-teal-800 font-black text-[9px] flex items-center justify-center border border-teal-200">
                        {demo.patientId.replace("P_", "P")}
                      </span>
                      <span className="text-xs font-extrabold">
                        {demo.patientId} ({demo.breast} {demo.view})
                      </span>
                    </div>

                    {badge.isEmeraldRibbon ? (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs flex items-center gap-1">
                        <span>🎗️</span> Dice: {demo.metrics.dice_score.toFixed(3)}
                      </span>
                    ) : (
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${badge.bg} ${badge.text} ${badge.border}`}
                      >
                        Dice: {demo.metrics.dice_score.toFixed(3)}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] font-medium text-slate-600 mt-1.5 line-clamp-1">
                    {demo.pathologyLabel}
                  </p>
                </div>
                <div className="mt-2 text-[10px] font-semibold text-slate-500 flex justify-between border-t border-slate-100 pt-1.5">
                  <span className="text-slate-400 font-mono">
                    {demo.acquisitionDate.split(" ")[1]} {demo.acquisitionDate.split(" ")[2]}
                  </span>
                  <span className="text-rose-600 font-bold">
                    Conf: {demo.metrics.malignancy_confidence}%
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 2. Diagnostic Radiologist Toolbar ── */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        {/* View Mode */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <span className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-900 text-white shadow-2xs">
            4-Panel PACS Strip
          </span>
        </div>

        {/* Smooth Interactive Opacity Slider */}
        <div className="flex items-center gap-2 shrink-0 min-w-[190px] max-w-[220px]">
          <span className="text-xs font-bold text-slate-600 shrink-0">Overlay Opacity:</span>
          <input
            type="range"
            min="0.0"
            max="1.0"
            step="0.05"
            value={opacity}
            onChange={(e) => setOpacity(parseFloat(e.target.value))}
            className="accent-primary flex-1 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
          />
          <span className="text-xs font-black text-primary bg-teal-50 px-2 py-0.5 rounded border border-teal-200 shrink-0">
            {(opacity * 100).toFixed(0)}%
          </span>
        </div>

        {/* Image Enhancement Presets */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[11px] text-slate-400 font-bold uppercase mr-1">Presets:</span>
          {PRESET_WINDOWINGS.map((preset, idx) => (
            <button
              key={preset.name}
              onClick={() => handlePresetChange(idx)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                selectedPreset === idx
                  ? "bg-slate-900 text-white shadow-2xs"
                  : "bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200 hover:text-slate-900"
              }`}
            >
              {preset.name}
            </button>
          ))}
        </div>

        {/* Manual DICOM / PNG Import */}
        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handlePredictFile(file);
            }}
            accept="image/*,.dcm"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="px-3.5 py-1.5 bg-primary hover:bg-[#004D46] text-white rounded-xl font-bold text-xs transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Processing Scan...
              </>
            ) : (
              <>
                <UploadCloud className="w-3.5 h-3.5 text-teal-200" />
                <span>Upload Custom Scan</span>
              </>
            )}
          </button>
          {currentCase && (
            <button
              onClick={() => {
                setCurrentCase(null);
                handleClearCaliper();
              }}
              title="Reset Workstation to blank state"
              className="px-2.5 py-1.5 bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-700 border border-slate-300 hover:border-rose-200 rounded-xl font-bold text-xs transition-colors flex items-center gap-1 shadow-2xs cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* ── 3. Patient Biomarkers & Quantitative Metric Strip (5 KPI Cards) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Card 1: Lesion Assessment */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs flex flex-col justify-between">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Lesion Assessment</span>
            <Activity className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="my-2">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black ${
                !currentCase
                  ? "bg-slate-100 text-slate-500 border border-slate-200"
                  : currentCase.metrics.lesion_detected
                  ? "bg-rose-50 text-rose-700 border border-rose-200"
                  : "bg-emerald-50 text-emerald-700 border border-emerald-200"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  !currentCase
                    ? "bg-slate-400"
                    : currentCase.metrics.lesion_detected
                    ? "bg-rose-600 animate-pulse"
                    : "bg-emerald-500"
                }`}
              ></span>
              {!currentCase
                ? "AWAITING SCAN"
                : currentCase.metrics.lesion_detected
                ? "CONFIRMED MASS"
                : "HEALTHY TISSUE"}
            </span>
          </div>
          <div className="text-[11px] text-slate-500 flex justify-between pt-1 font-semibold border-t border-slate-100">
            <span>Patient ID:</span>
            <span className="text-slate-900 font-extrabold">{currentCase ? currentCase.patientId : "—"}</span>
          </div>
        </div>

        {/* Card 2: Tumor Morphometry */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs flex flex-col justify-between">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Tumor Morphometry</span>
            <Maximize2 className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="my-1.5">
            <div className="text-xl font-black text-slate-900 tracking-tight">
              {currentCase ? (
                <>
                  {currentCase.metrics.lesion_area_mm2.toFixed(1)}{" "}
                  <span className="text-xs font-semibold text-slate-500">mm²</span>
                </>
              ) : (
                "—"
              )}
            </div>
            <div className="text-[11px] text-slate-500 font-bold">
              {currentCase ? `(${currentCase.metrics.lesion_area_cm2.toFixed(2)} cm²)` : "No lesion measured"}
            </div>
          </div>
          <div className="text-[10px] font-semibold text-slate-400 pt-1 border-t border-slate-100">
            0.1mm Standard Pixel Pitch
          </div>
        </div>

        {/* Card 3: Anatomical Radar Locator */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs flex flex-col justify-between">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Anatomical Radar Locator</span>
            <Crosshair className="w-3.5 h-3.5 text-primary" />
          </div>

          <div className="my-1.5 flex items-center gap-2.5">
            {/* Dynamic SVG Breast Quadrant Crosshair */}
            <div className="relative h-11 w-11 bg-slate-900 rounded-full border border-slate-700 p-1 flex items-center justify-center shrink-0 shadow-inner">
              <svg viewBox="0 0 40 40" className="w-full h-full text-slate-600">
                <circle cx="20" cy="20" r="18" fill="none" stroke="currentColor" strokeWidth="1" />
                <line x1="20" y1="2" x2="20" y2="38" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
                <line x1="2" y1="20" x2="38" y2="20" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
              </svg>

              {/* Pulsing Target Dot */}
              {currentCase && (
                <div
                  className={`absolute h-2.5 w-2.5 ${
                    currentCase.quadrantKey === "UO"
                      ? "top-1.5 left-1.5"
                      : currentCase.quadrantKey === "UI"
                      ? "top-1.5 right-1.5"
                      : currentCase.quadrantKey === "LO"
                      ? "bottom-1.5 left-1.5"
                      : "bottom-1.5 right-1.5"
                  }`}
                >
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-600 border border-white"></span>
                </div>
              )}
            </div>

            <div>
              <div className="text-xs font-black text-slate-900 leading-tight">
                {currentCase ? currentCase.metrics.quadrant_estimate : "Awaiting Scan"}
              </div>
              <div className="text-[10px] text-slate-500 font-bold mt-0.5">
                {currentCase ? `📍 ${currentCase.clockPosition} Position` : "Positioning Pending"}
              </div>
            </div>
          </div>

          <div className="text-[10px] text-slate-500 flex justify-between pt-1 font-semibold border-t border-slate-100">
            <span>Projection:</span>
            <span className="text-slate-800 font-bold">
              {currentCase ? `${currentCase.breast} ${currentCase.view}` : "—"}
            </span>
          </div>
        </div>

        {/* Card 4: Tissue Composition & BI-RADS */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs flex flex-col justify-between">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>ACR BI-RADS Density</span>
            <Layers className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="my-1 space-y-0.5">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-slate-500 text-[11px]">Fibroglandular:</span>
              <span className="text-amber-700 font-black text-xs">
                {currentCase ? `${currentCase.metrics.tissue_density_percentage.toFixed(1)}% (Cat C)` : "—"}
              </span>
            </div>
            <div className="flex justify-between text-xs font-medium">
              <span className="text-slate-500 text-[11px]">Malignancy Conf:</span>
              <span className="text-rose-600 font-black text-xs">
                {currentCase ? `${currentCase.metrics.malignancy_confidence.toFixed(1)}%` : "—"}
              </span>
            </div>
          </div>
          <div className="text-[10px] font-semibold text-slate-400 pt-1 border-t border-slate-100">
            {currentCase ? "High Density Mass Masking Risk" : "Awaiting Density Analysis"}
          </div>
        </div>

        {/* Card 5: Radiometric Precision */}
        <div
          className={`border rounded-2xl p-4 shadow-2xs flex flex-col justify-between ${diceStyle.bg} ${diceStyle.border}`}
        >
          <div className="flex items-center justify-between text-[10px] uppercase tracking-wider font-bold">
            <span className="text-slate-700">Dice Precision</span>
            <span className={`font-black ${diceStyle.text}`}>
              {currentCase ? currentCase.metrics.dice_score.toFixed(3) : "—"}
            </span>
          </div>
          <div className="my-1 space-y-1">
            <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  !currentCase
                    ? "bg-slate-300"
                    : currentCase.metrics.dice_score >= 0.80
                    ? "bg-emerald-500"
                    : currentCase.metrics.dice_score >= 0.50
                    ? "bg-sky-500"
                    : "bg-amber-500"
                }`}
                style={{ width: `${currentCase ? currentCase.metrics.dice_score * 100 : 0}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-[11px] font-semibold text-slate-600">
              <span>IoU: {currentCase ? currentCase.metrics.iou_score.toFixed(3) : "—"}</span>
              <span>Latency: {currentCase ? `${currentCase.metrics.inference_time_ms}ms` : "—"}</span>
            </div>
          </div>
          <div className="text-[10px] font-bold text-slate-600 pt-1 border-t border-slate-200/80">
            {currentCase ? `${diceStyle.label} Overlap` : "Model Standby"}
          </div>
        </div>
      </div>

      {/* Live RECIST 1.1 Measurement Banner */}
      {manualCaliperMm !== null && manualCaliperMm > 0 && (() => {
        const recist = getRecistClassification(manualCaliperMm);
        return (
          <div
            className={`p-3.5 rounded-2xl border backdrop-blur-md shadow-xs flex flex-wrap items-center justify-between gap-4 ${recist.bg} ${recist.border} animate-fade-in`}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-white border border-slate-200 text-primary font-bold text-base shadow-2xs">
                📏
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                    Radiological Caliper:
                  </span>
                  <span className="text-sm font-black text-slate-900">
                    {manualCaliperMm.toFixed(1)} mm
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    ({(manualCaliperMm / 10).toFixed(2)} cm)
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 font-medium">
                  Standard Pitch: 0.1 mm/px • 512×512 Synchronized PACS Viewport
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">
                RECIST 1.1 Category:
              </span>
              <span
                className={`px-2.5 py-1 rounded-xl border text-xs font-black shadow-2xs ${recist.badgeColor}`}
              >
                {recist.label}
              </span>
              <button
                onClick={handleClearCaliper}
                className="px-2.5 py-1 rounded-xl text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition-colors cursor-pointer flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                Clear
              </button>
            </div>
          </div>
        );
      })()}

      {/* ── 4. Enhanced 4-Panel PACS Viewport ── */}
      {activeViewMode === "4panel" && (
        <div className="bg-slate-100/80 p-4 rounded-2xl border border-slate-200/80 shadow-xs relative">
          {/* Clinical Tri-Color Overlap Standard Header Bar */}
          <div className="flex flex-wrap items-center justify-between bg-slate-900/95 backdrop-blur-md px-4 py-2.5 rounded-xl border border-slate-800 text-xs mb-3.5 shadow-md">
            <div className="flex items-center gap-2 font-bold text-slate-100">
              <Layers className="w-4 h-4 text-amber-400" />
              <span className="tracking-wide">Clinical Tri-Color Overlap Standard:</span>
            </div>
            <div className="flex flex-wrap items-center gap-2.5 text-[11px] font-bold">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/90 border border-emerald-700/80 text-emerald-300">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-emerald-500/40"></span>
                <span>Ground Truth (ROI Reference)</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-950/90 border border-rose-700/80 text-rose-300">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-rose-500/40"></span>
                <span>Predicted Model (CAD AI)</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-yellow-950/90 border border-yellow-700/80 text-yellow-300">
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 ring-2 ring-yellow-400/40 animate-pulse"></span>
                <span>Overlap (Clinical Concordance)</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Panel 1: Full-Field Mammogram */}
            <div className="bg-slate-950 p-1.5 rounded-2xl border border-slate-800 shadow-md flex flex-col overflow-hidden relative group">
              <div className="bg-slate-900/90 backdrop-blur-md px-3 py-1.5 border-b border-slate-800 flex items-center justify-between font-bold text-xs text-slate-200 rounded-t-xl">
                <span>1. Full-Field Mammogram</span>
                <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  {isLoading ? "Analyzing..." : currentCase ? "Otsu Isolated" : "Standby"}
                </span>
              </div>
              <div
                className={`p-2 flex-1 flex flex-col items-center justify-center bg-black relative min-h-[300px] aspect-square overflow-hidden select-none ${
                  isCaliperActive ? "cursor-crosshair" : ""
                }`}
                onMouseDown={handleViewportMouseDown}
                onMouseMove={handleViewportMouseMove}
                onMouseUp={handleViewportMouseUp}
              >
                {isLoading && (
                  <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden">
                    <div className="w-full h-8 bg-gradient-to-b from-transparent via-sky-400/50 to-transparent shadow-[0_0_20px_#38bdf8] animate-scanline"></div>
                  </div>
                )}

                {isLoading ? (
                  <div className="flex flex-col items-center justify-center text-center p-4 text-slate-400">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-2 shadow-inner">
                      <Activity className="w-5 h-5 text-sky-400 animate-spin" />
                    </div>
                    <p className="text-xs font-bold text-slate-300">Processing CUDA Inference...</p>
                    <p className="text-[10px] text-slate-500 mt-1">
                      512×512 CLAHE & Aspect Normalization
                    </p>
                  </div>
                ) : currentCase?.images?.original_base64 ? (
                  <div className="relative w-full h-full flex items-center justify-center">
                    <img
                      src={currentCase.images.original_base64}
                      alt="Original Mammogram"
                      className="w-full h-full aspect-square object-contain transition-all pointer-events-none"
                      style={{
                        filter: `contrast(${contrastWindow}%) brightness(${brightnessLevel}%) ${
                          isInverted ? "invert(1)" : ""
                        }`
                      }}
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center p-4 text-slate-500">
                    <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-2.5 shadow-inner">
                      <UploadCloud className="w-6 h-6 text-sky-400 animate-pulse" />
                    </div>
                    <p className="text-xs font-bold text-slate-300">Awaiting Mammogram</p>
                    <p className="text-[10px] text-slate-500 mt-1 max-w-[180px]">
                      Upload a scan (.png, .dcm) to view Full-Field scan
                    </p>
                  </div>
                )}
                {renderCaliperSvg()}

                <div className="absolute bottom-2.5 left-2.5 bg-slate-900/90 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-bold border border-slate-700 text-slate-200 z-20">
                  {isLoading ? "ANALYZING..." : currentCase ? `${currentCase.breast} ${currentCase.view}` : "NO SCAN"}
                </div>
              </div>
              <div className="p-2 bg-slate-900/80 text-[10px] text-slate-400 flex justify-between font-semibold rounded-b-xl border-t border-slate-800">
                <span>Aspect Preserved</span>
                <span className="text-sky-400 font-bold">512×512 Grid (CLAHE)</span>
              </div>
            </div>

            {/* Panel 2: Ground Truth ROI Mask */}
            <div className="bg-slate-950 p-1.5 rounded-2xl border border-slate-700/60 shadow-lg flex flex-col overflow-hidden relative group">
              <div className="bg-slate-900/90 backdrop-blur-md px-3.5 py-2 border-b border-slate-800/80 flex items-center justify-between font-semibold text-xs text-slate-200 rounded-t-xl">
                <span>2. Reference ROI</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800">
                  {isLoading ? "Synchronizing..." : currentCase ? "Ground Truth ROI" : "Standby"}
                </span>
              </div>
              <div className="p-2 flex-1 flex flex-col items-center justify-center bg-black relative min-h-[320px] aspect-square overflow-hidden">
                {isLoading && (
                  <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden">
                    <div className="w-full h-10 bg-gradient-to-b from-transparent via-sky-400/50 to-transparent shadow-[0_0_20px_#38bdf8] animate-scanline"></div>
                  </div>
                )}

                {isLoading ? (
                  <div className="animate-pulse text-xs font-medium text-slate-400">
                    Synchronizing GT Crop...
                  </div>
                ) : currentCase?.images?.ground_truth_mask ? (
                  <div className="relative w-full h-full flex items-center justify-center">
                    <img
                      src={currentCase.images.ground_truth_mask}
                      alt="Ground Truth Mask"
                      className="w-full h-full aspect-square object-contain border border-emerald-500/40 rounded-lg pointer-events-none"
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center p-4 text-slate-500">
                    <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-2.5 shadow-inner">
                      <Crosshair className="w-6 h-6 text-emerald-400/80" />
                    </div>
                    <p className="text-xs font-bold text-slate-300">Reference Ground Truth</p>
                    <p className="text-[10px] text-slate-500 mt-1 max-w-[180px]">
                      Synchronized ROI mask will appear on scan upload
                    </p>
                  </div>
                )}
                {renderCaliperSvg()}
              </div>
              <div className="p-2.5 bg-slate-900/80 text-[11px] text-slate-400 flex justify-between font-medium rounded-b-xl border-t border-slate-800/80">
                <span>Synchronized Crop</span>
                <span className="text-emerald-400 font-semibold">512×512 ROI</span>
              </div>
            </div>

            {/* Panel 3: CAD Inference Segmentation */}
            <div className="bg-slate-950 p-1.5 rounded-2xl border border-slate-700/60 shadow-lg flex flex-col overflow-hidden relative group">
              <div className="bg-slate-900/90 backdrop-blur-md px-3.5 py-2 border-b border-slate-800/80 flex items-center justify-between font-semibold text-xs text-slate-200 rounded-t-xl">
                <span>3. CAD Inference</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-950/80 text-sky-400 border border-sky-800">
                  {isLoading ? "Inference..." : currentCase ? "EfficientNet-B4 + scSE" : "Standby"}
                </span>
              </div>
              <div className="p-2 flex-1 flex flex-col items-center justify-center bg-black relative min-h-[320px] aspect-square overflow-hidden">
                {isLoading && (
                  <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden">
                    <div className="w-full h-10 bg-gradient-to-b from-transparent via-sky-400/50 to-transparent shadow-[0_0_20px_#38bdf8] animate-scanline"></div>
                  </div>
                )}

                {isLoading ? (
                  <div className="animate-pulse text-xs font-medium text-slate-400">
                    Refining Connected Components...
                  </div>
                ) : currentCase?.images?.mask_base64 ? (
                  <div className="relative w-full h-full flex items-center justify-center">
                    <img
                      src={currentCase.images.mask_base64}
                      alt="U-Net Prediction Mask"
                      className="w-full h-full aspect-square object-contain border border-sky-500/40 rounded-lg pointer-events-none"
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center p-4 text-slate-500">
                    <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-2.5 shadow-inner">
                      <Activity className="w-6 h-6 text-sky-400/80" />
                    </div>
                    <p className="text-xs font-bold text-slate-300">CAD Inference Ready</p>
                    <p className="text-[10px] text-slate-500 mt-1 max-w-[180px]">
                      Single-lesion segmentation computed on upload
                    </p>
                  </div>
                )}
                {renderCaliperSvg()}
              </div>
              <div className="p-2.5 bg-slate-900/80 text-[11px] text-slate-400 flex justify-between font-medium rounded-b-xl border-t border-slate-800/80">
                <span>Threshold: {threshold.toFixed(2)}</span>
                <span className="text-sky-400 font-semibold">Largest Component</span>
              </div>
            </div>

            {/* Panel 4: Clinical Multi-Modal Fusion */}
            <div className="bg-slate-950 p-1.5 rounded-2xl border border-slate-700/60 shadow-xl flex flex-col overflow-hidden relative group">
              <div className="bg-slate-900/95 backdrop-blur-md px-3.5 py-2 border-b border-slate-800/80 flex items-center justify-between font-semibold text-xs text-slate-200 rounded-t-xl">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                  <span className="font-bold text-white tracking-wide">4. Clinical Color Overlay</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-950/80 text-rose-400 border border-rose-800">
                    {isLoading ? "Synthesizing..." : currentCase ? `${currentCase.metrics.malignancy_confidence}% Conf` : "Standby"}
                  </span>
                </div>
              </div>

              <div
                className={`p-2 flex-1 flex flex-col items-center justify-center bg-black relative min-h-[320px] aspect-square overflow-hidden select-none ${
                  isCaliperActive ? "cursor-crosshair" : ""
                }`}
                onMouseDown={handleViewportMouseDown}
                onMouseMove={handleViewportMouseMove}
                onMouseUp={handleViewportMouseUp}
              >
                {isLoading && (
                  <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden">
                    <div className="w-full h-10 bg-gradient-to-b from-transparent via-sky-400/50 to-transparent shadow-[0_0_20px_#38bdf8] animate-scanline"></div>
                  </div>
                )}

                {isLoading ? (
                  <div className="flex flex-col items-center justify-center text-center p-4 text-slate-400">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-2 shadow-inner">
                      <Layers className="w-5 h-5 text-amber-400 animate-spin" />
                    </div>
                    <p className="text-xs font-bold text-slate-300">Synthesizing Overlay...</p>
                    <p className="text-[10px] text-slate-500 mt-1 max-w-[180px]">
                      Computing Tri-Color alignment
                    </p>
                  </div>
                ) : currentCase ? (
                  <div className="relative w-full h-full flex items-center justify-center">
                    {/* Underlying Base Mammogram / Contours (Aligned 1:1, visible when fading overlay) */}
                    {currentCase.images?.original_base64 && (
                      <img
                        src={
                          showContours && currentCase.images.contour_base64
                            ? currentCase.images.contour_base64
                            : currentCase.images.original_base64
                        }
                        alt="Base Mammogram"
                        className="absolute inset-0 m-auto w-full h-full object-contain pointer-events-none"
                        style={{
                          filter: `contrast(${contrastWindow}%) brightness(${brightnessLevel}%) ${
                            isInverted ? "invert(1)" : ""
                          }`
                        }}
                      />
                    )}
                    {/* Clinical Color Overlay (Exact identical inset-0 m-auto coordinates - zero shift or ghosting) */}
                    {currentCase.images?.overlay_base64 && (
                      <img
                        src={currentCase.images.overlay_base64}
                        alt="Clinical Overlay"
                        className="absolute inset-0 m-auto w-full h-full object-contain pointer-events-none z-10 transition-opacity"
                        style={{ opacity: opacity }}
                      />
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center p-4 text-slate-500">
                    <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-2.5 shadow-inner">
                      <Layers className="w-6 h-6 text-amber-400/80" />
                    </div>
                    <p className="text-xs font-bold text-slate-300">Clinical Color Fusion</p>
                    <p className="text-[10px] text-slate-500 mt-1 max-w-[180px]">
                      Multi-modal overlay & contours appear on upload
                    </p>
                  </div>
                )}

                {renderCaliperSvg()}

                {!isLoading && currentCase && (
                  <div className="absolute bottom-2.5 right-2.5 bg-slate-950/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/80 text-xs font-semibold space-y-0.5 text-right shadow-2xl z-20">
                    <div className="font-black text-xs text-emerald-400 flex items-center justify-end gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      Dice: {currentCase.metrics.dice_score.toFixed(3)}
                    </div>
                    <div className="text-sky-300 font-semibold text-[11px] flex items-center justify-end gap-1">
                      <span>IoU: {currentCase.metrics.iou_score.toFixed(3)}</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-yellow-950/90 text-yellow-300 border border-yellow-700/80 font-extrabold ml-1">
                        OVERLAP
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-2.5 bg-slate-900/95 text-[11px] text-slate-300 flex items-center justify-between font-medium rounded-b-xl border-t border-slate-800/80">
                <button
                  onClick={() => setShowContours(!showContours)}
                  className="px-2 py-0.5 rounded-md bg-sky-950/80 border border-sky-800/80 text-sky-300 hover:bg-sky-900/80 transition-colors font-bold text-[10px] flex items-center gap-1 cursor-pointer"
                >
                  {showContours ? "✓ Contours Active" : "○ Contours Hidden"}
                </button>
                <div className="flex items-center gap-2.5 text-[11px]">
                  <span className="flex items-center gap-1 font-bold text-emerald-400" title="Ground Truth Reference">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-emerald-500/40"></span>
                    GT (Reference)
                  </span>
                  <span className="flex items-center gap-1 font-bold text-rose-400" title="Predicted Model CAD">
                    <span className="w-2 h-2 rounded-full bg-rose-500 ring-2 ring-rose-500/40"></span>
                    Pred (AI)
                  </span>
                  <span className="flex items-center gap-1 font-bold text-yellow-300" title="Overlap Agreement">
                    <span className="w-2 h-2 rounded-full bg-yellow-400 ring-2 ring-yellow-400/40 animate-pulse"></span>
                    Overlap
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODE B: INTERACTIVE SPLIT-SCREEN MAGNIFIER ── */}
      {activeViewMode === "magnifier" && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 font-bold text-xs">
            <span className="text-slate-800 font-extrabold flex items-center gap-2">
              <ZoomIn className="w-4 h-4 text-primary" />
              Interactive Split-Screen Magnifier View (Hover over Right Panel)
            </span>
            <div className="flex items-center gap-3">
              <span className="text-slate-500 text-xs">Magnifier Lens Zoom:</span>
              <input
                type="range"
                min="1.2"
                max="3.0"
                step="0.2"
                value={magnifierZoom}
                onChange={(e) => setMagnifierZoom(parseFloat(e.target.value))}
                className="accent-primary h-1.5 bg-slate-200 rounded-lg cursor-pointer w-28"
              />
              <span className="text-primary font-black text-xs">{magnifierZoom.toFixed(1)}x</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 relative flex items-center justify-center min-h-[380px] overflow-hidden">
              <div className="absolute top-3 left-3 bg-slate-900/90 px-2.5 py-1 rounded text-[11px] font-bold text-slate-200 z-10 border border-slate-700">
                Original Isolated Mammogram
              </div>
              {currentCase && currentCase.images?.original_base64 ? (
                <img
                  src={currentCase.images.original_base64}
                  alt="Original Viewport"
                  className="w-full h-80 max-w-[340px] object-contain"
                  style={{
                    filter: `contrast(${contrastWindow}%) brightness(${brightnessLevel}%) ${
                      isInverted ? "invert(1)" : ""
                    }`
                  }}
                />
              ) : (
                <div className="text-slate-500 text-xs font-semibold">No scan loaded</div>
              )}
            </div>

            <div
              className="bg-slate-950 border border-slate-800 rounded-xl p-4 relative flex items-center justify-center min-h-[380px] overflow-hidden cursor-crosshair"
              onMouseMove={handleMouseMoveMagnifier}
            >
              <div className="absolute top-3 left-3 bg-slate-900/90 px-2.5 py-1 rounded text-[11px] font-bold text-sky-300 z-10 border border-slate-700">
                Fluorescent Sharp Contours & Overlay
              </div>
              {currentCase && currentCase.images?.contour_base64 ? (
                <img
                  src={currentCase.images.contour_base64}
                  alt="Contour Viewport"
                  className="w-full h-80 max-w-[340px] object-contain"
                  style={{
                    filter: `contrast(${contrastWindow}%) brightness(${brightnessLevel}%) ${
                      isInverted ? "invert(1)" : ""
                    }`
                  }}
                />
              ) : (
                <div className="text-slate-500 text-xs font-semibold">No scan loaded</div>
              )}

              {/* Magnifier Lens Overlay */}
              {currentCase && (currentCase.images?.contour_base64 || currentCase.images?.original_base64) && (
                <div
                  className="absolute w-36 h-36 rounded-full border-2 border-sky-400 shadow-xl pointer-events-none overflow-hidden z-30"
                  style={{
                    left: `${magnifierPos.x}%`,
                    top: `${magnifierPos.y}%`,
                    transform: "translate(-50%, -50%)",
                    backgroundImage: `url(${
                      currentCase.images.contour_base64 || currentCase.images.original_base64
                    })`,
                    backgroundPosition: `${magnifierPos.x}% ${magnifierPos.y}%`,
                    backgroundSize: `${340 * magnifierZoom}px`,
                    boxShadow: "0 0 20px rgba(2, 132, 199, 0.5)"
                  }}
                ></div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
