import React, { useState } from "react";
import { BookOpen, ChevronDown, ChevronUp, MessageSquare, CheckCircle2 } from "lucide-react";

export const RadiologistHelp: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [ticketSubmitted, setTicketSubmitted] = useState(false);

  const faqs = [
    {
      title: "How to review studies",
      content:
        "Open Imaging Queue or Dashboard → click 'Open Study'. The PACS Image Viewer allows toggling AI Overlay, adjusting Brightness & Contrast, zooming, measuring lesion size with the Ruler tool, and split-screen comparison.",
    },
    {
      title: "How to submit reports",
      content:
        "In the Radiology Workspace, fill out the Structured Radiologist Findings Form (Side, Finding Type, Location, Size, Margins, Density, Associated Findings), select a BI-RADS Category, enter your Impression & Recommendations, and click 'Submit & Send to Oncologist'.",
    },
    {
      title: "How BI-RADS is recorded",
      content:
        "Select BI-RADS 0 (Incomplete), 1 (Negative), 2 (Benign), 3 (Probably Benign), 4A/4B/4C (Suspicious), 5 (Highly Suggestive of Malignancy), or 6 (Known Biopsy-Proven Malignancy). The category is automatically attached to the structured report sent to the treating oncologist.",
    },
  ];

  return (
    <div className="space-y-6 text-left max-w-4xl mx-auto pb-16">
      {/* Title */}
      <div className="border-b border-slate-200/60 pb-4">
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Radiologist Help &amp; Support</h1>
        <p className="text-xs text-slate-400 mt-1 font-medium">
          PACS workflow guides and IT technical support.
        </p>
      </div>

      {/* FAQ SECTION */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-primary" /> Radiologist Workflow FAQs
        </h2>

        <div className="space-y-2">
          {faqs.map((faq, i) => (
            <div key={i} className="border border-slate-100 rounded-2xl overflow-hidden text-xs">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between p-3.5 bg-slate-50/70 hover:bg-slate-100 text-left font-bold text-slate-800 transition-colors"
              >
                <span>{faq.title}</span>
                {openFaq === i ? <ChevronUp className="w-4 h-4 text-primary" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </button>
              {openFaq === i && (
                <div className="p-4 bg-white text-slate-600 leading-relaxed border-t border-slate-100 text-xs">
                  {faq.content}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* TECHNICAL SUPPORT */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4 text-xs">
        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-primary" /> Technical Support
        </h2>
        <p className="text-slate-500">Contact IIT Indore PACS &amp; Radiology IT Desk for workstation support or DICOM connectivity issues.</p>

        {ticketSubmitted ? (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Ticket submitted to Radiology IT Support.
          </div>
        ) : (
          <div className="flex gap-2">
            <button onClick={() => setTicketSubmitted(true)} className="px-5 py-2.5 bg-primary text-white font-bold rounded-xl">
              Contact Technical Support
            </button>
            <button onClick={() => setTicketSubmitted(true)} className="px-5 py-2.5 bg-slate-100 text-slate-700 border border-slate-200 font-bold rounded-xl">
              Report a Problem
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
