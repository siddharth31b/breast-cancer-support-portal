import React from "react";
import { AlertTriangle } from "lucide-react";

interface MedicalDisclaimerProps {
  variant?: "ai" | "general" | "emergency";
  className?: string;
}

export const MedicalDisclaimer: React.FC<MedicalDisclaimerProps> = ({
  variant = "general",
  className = "",
}) => {
  const content = {
    ai: {
      title: "About AI-Assisted Screening",
      body: "This assessment is produced by an AI model and represents a preliminary analysis only. It is not a diagnosis. Results must be interpreted by a qualified medical professional. Do not make any clinical decisions based solely on this output.",
    },
    general: {
      title: "Medical Information Notice",
      body: "The information provided on this platform is for informational purposes only. It does not constitute medical advice, diagnosis, or treatment. Always consult your assigned healthcare professional for medical decisions.",
    },
    emergency: {
      title: "In Case of a Medical Emergency",
      body: "This messaging system is not monitored 24/7. If you are experiencing a medical emergency, call 112 (India) or your local emergency services immediately. Do not rely on this platform for urgent medical assistance.",
    },
  };

  const { title, body } = content[variant];

  return (
    <div className={`flex gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl ${className}`}>
      <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
      <div>
        <p className="text-[10px] font-black text-amber-700 uppercase tracking-wider mb-0.5">{title}</p>
        <p className="text-xs text-amber-700/80 leading-relaxed">{body}</p>
      </div>
    </div>
  );
};
