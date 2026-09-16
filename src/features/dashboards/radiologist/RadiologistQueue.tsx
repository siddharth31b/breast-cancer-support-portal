import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, Upload, X, AlertTriangle, CheckCircle, UploadCloud, ArrowUpDown, Filter } from "lucide-react";
import { RadiologistService, type RadiologyStudy, type RegisteredPatient } from "../../../services/radiologist.service";

export const RadiologistQueue: React.FC = () => {
  const router = useRouter();
  const [studies, setStudies] = useState<RadiologyStudy[]>(() => RadiologistService.getStudies());
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "Pending" | "Urgent" | "Reviewed" | "Repeat Requested">("ALL");
  const [imagingTypeFilter, setImagingTypeFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"date" | "priority" | "confidence" | "patient">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Modal State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [patientSearchQuery, setPatientSearchQuery] = useState("");
  const [searchedPatient, setSearchedPatient] = useState<RegisteredPatient | null>(null);
  const [patientSearchAttempted, setPatientSearchAttempted] = useState(false);
  
  // Upload Form State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagingType, setImagingType] = useState<"Mammogram (FFDM)" | "Digital Breast Tomosynthesis (3D)" | "Breast Ultrasound" | "Breast MRI">("Mammogram (FFDM)");
  const [affectedSide, setAffectedSide] = useState<"Left" | "Right" | "Bilateral">("Left");
  const [priority, setPriority] = useState<"ROUTINE" | "URGENT">("ROUTINE");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const reloadStudies = () => {
    setStudies([...RadiologistService.getStudies()]);
  };

  useEffect(() => {
    window.addEventListener("radiologist-studies-updated", reloadStudies);
    return () => {
      window.removeEventListener("radiologist-studies-updated", reloadStudies);
    };
  }, []);

  const handlePatientSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setPatientSearchAttempted(true);
    const results = RadiologistService.searchPatients(patientSearchQuery);
    if (results.length > 0) {
      setSearchedPatient(results[0]);
    } else {
      setSearchedPatient(null);
    }
  };

  const handleOpenUploadModal = () => {
    setIsUploadModalOpen(true);
    setPatientSearchQuery("");
    setSearchedPatient(null);
    setPatientSearchAttempted(false);
    setSelectedFile(null);
    setImagingType("Mammogram (FFDM)");
    setAffectedSide("Left");
    setPriority("ROUTINE");
    setUploadSuccessMsg(null);
  };

  const handleCloseUploadModal = () => {
    setIsUploadModalOpen(false);
  };

  const handleExecuteUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchedPatient) return;
    setIsUploading(true);

    setTimeout(() => {
      const created = RadiologistService.uploadStudy({
        patientId: searchedPatient.id,
        patientName: searchedPatient.name,
        patientAge: searchedPatient.age,
        gender: searchedPatient.gender,
        assignedDoctor: searchedPatient.assignedDoctor,
        imagingType,
        side: affectedSide,
        priority,
        fileName: selectedFile?.name || "DICOM_Study_Scan.dcm",
      });

      setIsUploading(false);
      setIsUploadModalOpen(false);
      setUploadSuccessMsg(`Study ${created.id} uploaded successfully for ${searchedPatient.name}. AI analysis in progress.`);
      setTimeout(() => setUploadSuccessMsg(null), 4500);
      reloadStudies();
    }, 600);
  };

  // Filter & Sorting Logic
  const filtered = studies.filter((s) => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      s.patientName.toLowerCase().includes(q) ||
      s.id.toLowerCase().includes(q) ||
      s.patientId.toLowerCase().includes(q);
    if (!matchSearch) return false;

    if (statusFilter === "Pending" && !(s.status === "Pending" || s.status === "In Review")) return false;
    if (statusFilter === "Urgent" && !(s.priority === "URGENT" || s.priority === "STAT")) return false;
    if (statusFilter === "Reviewed" && s.status !== "Reviewed") return false;
    if (statusFilter === "Repeat Requested" && !(s.status === "Repeat Requested" || s.repeatRequired)) return false;

    if (imagingTypeFilter !== "ALL" && !s.imagingType.toLowerCase().includes(imagingTypeFilter.toLowerCase())) return false;

    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "priority") {
      const weight = { STAT: 3, URGENT: 2, ROUTINE: 1 };
      const diff = weight[b.priority] - weight[a.priority];
      return sortOrder === "asc" ? -diff : diff;
    }
    if (sortBy === "confidence") {
      const diff = (b.aiConfidence || 0) - (a.aiConfidence || 0);
      return sortOrder === "asc" ? -diff : diff;
    }
    if (sortBy === "patient") {
      return sortOrder === "asc" ? a.patientName.localeCompare(b.patientName) : b.patientName.localeCompare(a.patientName);
    }
    // Date sort
    return sortOrder === "asc" ? a.uploadDate.localeCompare(b.uploadDate) : b.uploadDate.localeCompare(a.uploadDate);
  });

  return (
    <div className="space-y-6 text-left max-w-7xl mx-auto pb-16">
      {/* Title Header with Compact Upload Study Button */}
      <div className="border-b border-slate-200/60 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Imaging Queue</h1>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            Primary diagnostic PACS worklist &amp; imaging review queue.
          </p>
        </div>

        <button
          onClick={handleOpenUploadModal}
          className="px-4 py-2.5 bg-primary hover:bg-[#004D46] text-white text-xs font-bold rounded-xl shadow-md shadow-primary/15 transition-all cursor-pointer flex items-center justify-center gap-2 self-start sm:self-auto shrink-0 border border-primary/30"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Study</span>
        </button>
      </div>

      {uploadSuccessMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl flex items-center gap-2.5 animate-fade-in shadow-xs">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{uploadSuccessMsg}</span>
        </div>
      )}

      {/* Controls: Search, Filters & Sorting */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex flex-col lg:flex-row items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
          {/* Search Box */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Search Patient, ID, or Study ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-xs w-full focus:outline-none text-slate-700 font-medium"
            />
          </div>

          {/* Imaging Type Select */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl w-full sm:w-auto">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={imagingTypeFilter}
              onChange={(e) => setImagingTypeFilter(e.target.value)}
              className="bg-transparent text-xs text-slate-700 font-bold focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Imaging Types</option>
              <option value="Mammogram">Mammography (FFDM)</option>
              <option value="Ultrasound">Breast Ultrasound</option>
              <option value="MRI">Breast MRI</option>
              <option value="Tomosynthesis">3D Tomosynthesis</option>
            </select>
          </div>
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 w-full lg:w-auto overflow-x-auto">
          {[
            { id: "ALL", label: "All Status" },
            { id: "Pending", label: "Pending" },
            { id: "Urgent", label: "Urgent" },
            { id: "Reviewed", label: "Reviewed" },
            { id: "Repeat Requested", label: "Repeat" },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setStatusFilter(f.id as any)}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === f.id ? "bg-primary text-white border-primary" : "bg-slate-50 text-slate-500 border-slate-200 hover:border-slate-300"
              }`}
            >
              {f.label}
            </button>
          ))}

          {/* Sort Selector */}
          <button
            onClick={() => {
              if (sortBy === "date") setSortBy("priority");
              else if (sortBy === "priority") setSortBy("confidence");
              else if (sortBy === "confidence") setSortBy("patient");
              else setSortBy("date");
              setSortOrder(sortOrder === "asc" ? "desc" : "asc");
            }}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1 shrink-0 ml-1 border border-slate-200 cursor-pointer"
            title="Toggle sort criterion"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
            <span className="capitalize">{sortBy} ({sortOrder})</span>
          </button>
        </div>
      </div>

      {/* PACS Queue Worklist Table */}
      <div className="bg-white border border-slate-200/80 rounded-3xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            PACS Studies Worklist ({sorted.length})
          </h2>
          <span className="text-[10px] text-slate-400 font-semibold">Auto-refreshing live worklist</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider font-bold text-[9px] bg-slate-50/80">
                <th className="p-4">Patient Name</th>
                <th className="p-4">Patient ID</th>
                <th className="p-4">Study ID</th>
                <th className="p-4">Imaging Type</th>
                <th className="p-4">Side</th>
                <th className="p-4">Upload Date</th>
                <th className="p-4">Priority</th>
                <th className="p-4">AI Status</th>
                <th className="p-4">Confidence</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sorted.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-14 text-center text-slate-400 font-semibold">
                    No studies found matching the selected query or filters.
                  </td>
                </tr>
              ) : (
                sorted.map((study) => (
                  <tr key={study.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-4 font-bold text-slate-800">
                      {study.patientName}
                    </td>
                    <td className="p-4 font-mono font-bold text-slate-500 text-[11px]">{study.patientId}</td>
                    <td className="p-4 font-mono font-bold text-primary text-[11px]">{study.id}</td>
                    <td className="p-4 text-slate-700 font-semibold">{study.imagingType}</td>
                    <td className="p-4 text-slate-600 font-medium">{study.side}</td>
                    <td className="p-4 text-slate-500 font-medium">{study.uploadDate} <span className="text-[10px] text-slate-400">{study.uploadTime}</span></td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 text-[9.5px] font-bold rounded-full border ${
                        study.priority === "URGENT" || study.priority === "STAT" ? "bg-rose-50 text-rose-700 border-rose-200" : "bg-slate-100 text-slate-600 border-slate-200"
                      }`}>
                        {study.priority}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 text-[9.5px] font-bold rounded-full border ${
                        study.aiStatus.includes("Processing") ? "bg-amber-50 text-amber-700 border-amber-200 animate-pulse" : "bg-emerald-50 text-emerald-700 border-emerald-200"
                      }`}>
                        {study.aiStatus}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-slate-700">
                      {study.aiConfidence > 0 ? `${study.aiConfidence}%` : "—"}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => router.push(`/radiologist/workspace/${study.id}`)}
                        className="px-3.5 py-2 bg-primary hover:bg-[#004D46] text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
                      >
                        Open Study
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* UPLOAD STUDY MODAL */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 border border-slate-100 space-y-5 animate-scale-in max-h-[90vh] overflow-y-auto text-left">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-800">Upload Imaging Study</h3>
                <p className="text-[11px] text-slate-400">Add new breast imaging scan to PACS DICOM archive.</p>
              </div>
              <button
                onClick={handleCloseUploadModal}
                className="w-8 h-8 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleExecuteUpload} className="space-y-4">
              {/* STEP 1: Search Patient */}
              <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  1. Search Patient (Patient ID or Name)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter Patient ID (e.g. MS-9281, BC-1002)..."
                    value={patientSearchQuery}
                    onChange={(e) => setPatientSearchQuery(e.target.value)}
                    className="flex-1 px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => handlePatientSearch()}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl cursor-pointer transition-colors"
                  >
                    Search Patient
                  </button>
                </div>

                {/* Patient Search Results */}
                {patientSearchAttempted && !searchedPatient && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-rose-700 text-xs font-semibold mt-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                    <span>Patient not found. Please ask the intake nurse to register the patient.</span>
                  </div>
                )}

                {searchedPatient && (
                  <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1 text-xs mt-2">
                    <div className="flex items-center justify-between font-bold text-emerald-900">
                      <span>{searchedPatient.name}</span>
                      <span className="text-[10px] font-mono bg-emerald-100 px-2 py-0.5 rounded text-emerald-800">{searchedPatient.id}</span>
                    </div>
                    <p className="text-[11px] text-emerald-700 font-medium">
                      Age: {searchedPatient.age} &nbsp;·&nbsp; Gender: {searchedPatient.gender} &nbsp;·&nbsp; Doctor: {searchedPatient.assignedDoctor}
                    </p>
                  </div>
                )}
              </div>

              {/* STEP 2: File Upload (Only enabled if patient selected) */}
              <div className={`space-y-2 ${!searchedPatient ? "opacity-40 pointer-events-none" : ""}`}>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  2. Upload Imaging File
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".dcm,.jpg,.jpeg,.png,.tif,.tiff,.zip"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setSelectedFile(e.target.files[0]);
                    }
                  }}
                />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 hover:border-primary bg-slate-50 hover:bg-primary/5 rounded-2xl p-5 text-center cursor-pointer transition-colors space-y-1.5"
                >
                  <UploadCloud className="w-8 h-8 text-primary mx-auto" />
                  <p className="text-xs font-bold text-slate-700">
                    {selectedFile ? selectedFile.name : "Drag & drop study file or click to browse"}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Supported: DICOM (.dcm), JPEG (.jpg), PNG (.png), TIFF (.tif), ZIP (.zip)
                  </p>
                </div>
              </div>

              {/* STEP 3: Study Parameters */}
              <div className={`space-y-3 ${!searchedPatient ? "opacity-40 pointer-events-none" : ""}`}>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                      Imaging Type
                    </label>
                    <select
                      value={imagingType}
                      onChange={(e) => setImagingType(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-700 focus:outline-none"
                    >
                      <option value="Mammogram (FFDM)">Mammography (FFDM)</option>
                      <option value="Breast Ultrasound">Breast Ultrasound</option>
                      <option value="Breast MRI">Breast MRI</option>
                      <option value="Digital Breast Tomosynthesis (3D)">Tomosynthesis (3D)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                      Affected Side
                    </label>
                    <select
                      value={affectedSide}
                      onChange={(e) => setAffectedSide(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-700 focus:outline-none"
                    >
                      <option value="Left">Left Breast</option>
                      <option value="Right">Right Breast</option>
                      <option value="Bilateral">Bilateral (Both)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                    Priority Level
                  </label>
                  <div className="flex gap-3">
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                      <input
                        type="radio"
                        name="priority"
                        value="ROUTINE"
                        checked={priority === "ROUTINE"}
                        onChange={() => setPriority("ROUTINE")}
                        className="text-primary focus:ring-primary"
                      />
                      <span>Routine</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs font-bold text-rose-700 cursor-pointer">
                      <input
                        type="radio"
                        name="priority"
                        value="URGENT"
                        checked={priority === "URGENT"}
                        onChange={() => setPriority("URGENT")}
                        className="text-rose-600 focus:ring-rose-500"
                      />
                      <span>Urgent / STAT</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleCloseUploadModal}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!searchedPatient || isUploading}
                  className="flex-1 py-2.5 bg-primary hover:bg-[#004D46] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-md shadow-primary/15"
                >
                  {isUploading ? "Uploading Study..." : "Upload Study"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
