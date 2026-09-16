import React, { useState } from "react";
import { BookOpen, AlertTriangle, MessageSquare, CheckCircle, ChevronDown, ChevronUp } from "lucide-react";

export const NurseHelp: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [issueSubmitted, setIssueSubmitted] = useState(false);

  const helpTopics = [
    { title: "How to start patient intake", content: "Go to Patient Intake in the sidebar → click 'Start New Intake'. Enter patient details, answer health questions, record vitals, and send to the assigned doctor." },
    { title: "How to complete health questions", content: "In Step 2 of Patient Intake, select Yes / No / Not Sure for each question with the patient. Answers are saved under 'Patient-reported information'." },
    { title: "How to record height and weight", content: "In Step 3 of Patient Intake, enter height in cm and weight in kg. The portal automatically computes BMI with the screening disclaimer." },
    { title: "How to upload reports", content: "In Step 3 or Patient Workspace → Reports tab, select the document title, category and mark readability (Clear, Blurry, Incomplete, Wrong file). Nurses check readability only." },
    { title: "How to send intake to doctor", content: "In Step 4 of Patient Intake, review the summary, add an optional nurse note, click 'Send to Doctor', and confirm submission in the confirmation modal." },
    { title: "How to record a follow-up", content: "Go to Follow-Ups or Patient Workspace → Follow-Up tab. Select contact date, indicate if patient was reached, record factual update, and save." },
  ];

  return (
    <div className="space-y-6 text-left max-w-4xl mx-auto pb-16">
      {/* Title */}
      <div className="border-b border-slate-200/60 pb-4">
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Nurse Help</h1>
        <p className="text-xs text-slate-400 mt-1 font-medium">Quick workflow guides and technical support.</p>
      </div>

      {/* CLINICAL ESCALATION REMINDER */}
      <div className="bg-amber-50 border border-amber-200 rounded-3xl p-5 text-xs text-amber-900 flex items-start gap-3 shadow-xs">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-xs uppercase tracking-wider text-amber-800">Clinical Escalation Reminder</h4>
          <p className="text-xs font-bold text-amber-900 mt-1">
            "If a patient reports an urgent concern, do not diagnose. Inform the assigned doctor immediately."
          </p>
        </div>
      </div>

      {/* 6 HELP TOPICS */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-primary" /> Essential Nurse Workflow Guides
        </h2>

        <div className="space-y-2">
          {helpTopics.map((topic, i) => (
            <div key={i} className="border border-slate-100 rounded-2xl overflow-hidden text-xs">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between p-3.5 bg-slate-50/70 hover:bg-slate-100 text-left font-bold text-slate-800 transition-colors"
              >
                <span>{topic.title}</span>
                {openFaq === i ? <ChevronUp className="w-4 h-4 text-primary" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </button>
              {openFaq === i && (
                <div className="p-4 bg-white text-slate-600 leading-relaxed border-t border-slate-100 text-xs">
                  {topic.content}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* TECHNICAL SUPPORT */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4 text-xs">
        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-primary" /> Technical Support &amp; Problem Report
        </h2>
        <p className="text-slate-500">Contact IIT Indore Hospital IT Desk for hardware or login support.</p>

        {issueSubmitted ? (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl font-bold flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" /> Ticket submitted to IT Support.
          </div>
        ) : (
          <div className="flex gap-2">
            <button onClick={() => setIssueSubmitted(true)} className="px-5 py-2.5 bg-primary text-white font-bold rounded-xl">
              Contact Technical Support
            </button>
            <button onClick={() => setIssueSubmitted(true)} className="px-5 py-2.5 bg-slate-100 text-slate-700 border border-slate-200 font-bold rounded-xl">
              Report a Problem
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
