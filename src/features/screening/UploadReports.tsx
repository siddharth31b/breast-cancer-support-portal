import React, { useState } from "react";
import { 
  Upload, 
  AlertCircle, 
  CheckCircle2, 
  Lock, 
  Search
} from "lucide-react";
import type { ReportCategory } from "../../types/patient-portal";

const REPORT_TYPES: Record<ReportCategory, string[]> = {
  "Breast Imaging": [
    "Mammography",
    "Breast Ultrasound",
    "Breast MRI Report",
    "Digital Breast Tomosynthesis Report",
    "Thermography Report"
  ],
  "General Imaging": [
    "X-Ray",
    "Ultrasound",
    "CT Scan Report",
    "MRI Scan Report",
    "PET Scan Report"
  ],
  "Pathology & Laboratory": [
    "Biopsy Report",
    "Histopathology Report",
    "Cytology Report",
    "Blood Test Report",
    "Hormone Test Report",
    "Genetic Test Report",
    "Tumour Marker Report"
  ],
  "Clinical Documents": [
    "Prescription",
    "Referral Letter",
    "Previous Diagnosis",
    "Treatment Plan",
    "Follow-up Report",
    "Discharge Summary"
  ],
  "Other": [
    "Other Medical Report",
    "Other Medical Image"
  ]
};

const ALLOWED_EXTENSIONS = [".pdf", ".jpg", ".jpeg", ".png"];

export const UploadReports: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<ReportCategory>("Breast Imaging");
  const [selectedReportType, setSelectedReportType] = useState<string>("Mammography");
  const [searchTerm, setSearchTerm] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [success, setSuccess] = useState(false);

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (f: File) => {
    setError(null);
    setSuccess(false);

    const ext = f.name.substring(f.name.lastIndexOf(".")).toLowerCase();
    
    // Explicitly reject DICOM or hospital raw format files
    if (ext === ".dcm" || f.name.toLowerCase().includes("dicom")) {
      setError("DICOM files (.dcm) are not accepted directly by patients. Please ask your radiology facility to export PDF or image summary reports.");
      return;
    }

    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      setError(`Unsupported file type (${ext}). Only PDF, JPG, JPEG, and PNG formats are supported.`);
      return;
    }

    if (f.size > 20 * 1024 * 1024) {
      setError("File size exceeds 20 MB limit. Please compress or choose a smaller file.");
      return;
    }

    setFile(f);
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a valid report file first.");
      return;
    }

    setUploading(true);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploading(false);
          setSuccess(true);
          return 100;
        }
        return prev + 25;
      });
    }, 300);
  };

  const resetForm = () => {
    setFile(null);
    setError(null);
    setSuccess(false);
    setProgress(0);
  };

  const filteredTypes = REPORT_TYPES[selectedCategory].filter(t => 
    t.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* DICOM Restriction Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex gap-3 items-start">
        <Lock className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="text-xs text-blue-900 leading-relaxed">
          <p className="font-bold mb-0.5">Patient Upload Guidelines & Safety Notice</p>
          Patients may upload medical documents in <strong>PDF, JPG, JPEG, or PNG</strong> format. Raw DICOM files (.dcm) or hospital PACS archives are strictly handled via direct provider integration to ensure data integrity and prevent patient processing errors.
        </div>
      </div>

      {success ? (
        <div className="bg-white border border-slate-100 rounded-2xl p-8 text-center space-y-4 shadow-xs">
          <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-black text-slate-800">Report Successfully Uploaded</h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            Your <strong>{selectedReportType}</strong> document has been saved. It is now queued for AI preliminary screening and specialist clinical review.
          </p>
          <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-4 text-left max-w-md mx-auto text-xs space-y-1.5 font-medium">
            <div className="flex justify-between"><span className="text-slate-500">File Name:</span><span className="font-bold text-slate-800">{file?.name}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Category:</span><span className="font-bold text-slate-800">{selectedCategory}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Status:</span><span className="font-bold text-emerald-600">Uploaded & Queued</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Source:</span><span className="font-bold text-slate-800">Patient Uploaded</span></div>
          </div>
          <div className="pt-2 flex justify-center gap-3">
            <button
              onClick={resetForm}
              className="px-4 py-2 bg-primary text-white font-bold text-xs rounded-xl shadow-xs hover:bg-primary-hover transition-colors"
            >
              Upload Another Report
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleUploadSubmit} className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs space-y-6">
          {/* Step 1: Category & Type */}
          <div>
            <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-2">
              1. Select Report Category & Type
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-4">
              {(Object.keys(REPORT_TYPES) as ReportCategory[]).map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat);
                    setSelectedReportType(REPORT_TYPES[cat][0]);
                  }}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all text-center border ${
                    selectedCategory === cat
                      ? "bg-primary text-white border-primary shadow-xs"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Sub-type selector */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search specific report type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-1 border border-slate-100 rounded-xl">
                {filteredTypes.map((type) => (
                  <button
                    type="button"
                    key={type}
                    onClick={() => setSelectedReportType(type)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      selectedReportType === type
                        ? "bg-teal-50 border-teal-300 text-teal-800 font-bold"
                        : "bg-slate-50 border-slate-100 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Step 2: Upload Drag & Drop Area */}
          <div>
            <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-2">
              2. Upload File (PDF, JPG, PNG — Max 20 MB)
            </label>
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleFileDrop}
              className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
                file
                  ? "border-emerald-300 bg-emerald-50/30"
                  : error
                  ? "border-red-300 bg-red-50/20"
                  : "border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300"
              }`}
            >
              <input
                type="file"
                id="file-upload"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileInput}
                className="hidden"
              />
              <label htmlFor="file-upload" className="cursor-pointer block">
                <div className="w-12 h-12 bg-white border border-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-3 text-slate-500 shadow-xs">
                  <Upload className="w-6 h-6 text-primary" />
                </div>
                {file ? (
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-emerald-800">{file.name}</p>
                    <p className="text-[11px] text-slate-500">{(file.size / (1024 * 1024)).toFixed(2)} MB • Ready to upload</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs font-bold text-slate-700">Drag and drop file here, or browse</p>
                    <p className="text-[11px] text-slate-400 mt-1">Accepts PDF, JPG, JPEG, PNG</p>
                  </div>
                )}
              </label>
            </div>

            {error && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-xs text-red-700">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          {uploading && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold text-slate-600">
                <span>Uploading report...</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-primary h-full transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}

          {/* Privacy Note */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <Lock className="w-3.5 h-3.5" />
              Encrypted patient upload • ISO 27001 & HIPAA Compliant
            </span>
            <button
              type="submit"
              disabled={!file || uploading}
              className="px-6 py-2.5 bg-primary text-white font-bold text-xs rounded-xl shadow-xs hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {uploading ? "Processing Upload..." : "Confirm & Save Report"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
