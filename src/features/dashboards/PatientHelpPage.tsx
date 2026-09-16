import React, { useState } from "react";
import {
  HelpCircle,
  Search,
  ChevronDown,
  ChevronUp,
  Send,
  CheckCircle,
  AlertTriangle,
  Paperclip,
  Star,
  RefreshCw,
  BookOpen,
  MessageSquare,
  Phone,
  X,
  Info,
  AlertCircle,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type HelpTab = "faqs" | "contact" | "guides" | "feedback" | "report";

// ─── Emergency Notice ─────────────────────────────────────────────────────────
const EmergencyNotice: React.FC = () => (
  <div className="flex items-start gap-3 p-4 bg-rose-50 border border-rose-200 rounded-2xl mb-6">
    <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" aria-hidden="true" />
    <div>
      <p className="text-sm font-bold text-rose-700">Medical Emergency Notice</p>
      <p className="text-[11px] text-rose-600 mt-1 leading-relaxed">
        NariSetu AI is not an emergency service. If you are experiencing severe pain, difficulty breathing, heavy bleeding,
        loss of consciousness or another medical emergency, contact your local emergency service or visit the nearest
        hospital immediately.
      </p>
    </div>
  </div>
);

// ─── FAQ data ─────────────────────────────────────────────────────────────────
const categories = [
  "Getting Started",
  "Completing the Questionnaire",
  "Using the Chatbot",
  "Uploading Reports",
  "Understanding AI-Assisted Results",
  "Appointments",
  "Care Plans",
  "Daily Goals",
  "Messages",
  "Privacy and Security",
  "Account Settings",
];

const faqs = [
  {
    category: "Completing the Questionnaire",
    question: "How do I complete my breast-health questionnaire?",
    answer:
      "Sign in to your patient portal and navigate to Assessments in the sidebar. Follow the guided step-by-step form covering your symptoms, medical history and lifestyle factors. Your progress is saved automatically.",
  },
  {
    category: "Completing the Questionnaire",
    question: "Can I change my answers later?",
    answer:
      "You can update responses to certain sections before a clinician has reviewed your case. Contact your care team directly if you need to correct information that has already been reviewed.",
  },
  {
    category: "Uploading Reports",
    question: "Which reports can I upload?",
    answer:
      "You can upload breast imaging (mammography, ultrasound, MRI), lab and pathology results (biopsy, blood tests, hormone and genetic tests), and clinical documents (prescriptions, referral letters, discharge summaries).",
  },
  {
    category: "Uploading Reports",
    question: "What file types are supported?",
    answer: "Supported formats are PDF, JPG and PNG. Each file must not exceed 25 MB. DICOM files should be shared directly with your radiologist through your care team.",
  },
  {
    category: "Uploading Reports",
    question: "Why is my report marked pending?",
    answer:
      "Reports are processed after upload and assigned to your clinical team. If a report remains pending for more than 48 hours, use the Contact Support form below to alert our team.",
  },
  {
    category: "Understanding AI-Assisted Results",
    question: "What does AI-assisted assessment mean?",
    answer:
      "NariSetu AI uses machine learning models to analyse imaging data and highlight areas of interest. This is an AI-assisted assessment tool that supports — it does not replace — your qualified healthcare professional.",
  },
  {
    category: "Understanding AI-Assisted Results",
    question: "Does the AI provide a diagnosis?",
    answer:
      "No. NariSetu AI does not provide diagnoses. All AI-assisted assessments are reviewed and validated by a qualified clinician before any clinical decision is made.",
  },
  {
    category: "Appointments",
    question: "When will a doctor review my report?",
    answer:
      "Once your reports are uploaded and AI analysis is complete, your case is assigned to a specialist. You will receive an in-app and email notification when the clinician review is complete.",
  },
  {
    category: "Appointments",
    question: "How do I book or reschedule an appointment?",
    answer: "Go to Appointments in the sidebar. Choose an available slot and confirm. To reschedule, open your existing appointment and select Reschedule.",
  },
  {
    category: "Care Plans",
    question: "How do I view my care plan?",
    answer: "Navigate to Care Plan in the sidebar. Your care plan is created by your clinician after review and includes your treatment recommendations, follow-up schedule and assigned goals.",
  },
  {
    category: "Daily Goals",
    question: "How do daily goals work?",
    answer: "Your care team may assign daily wellness goals (exercise, sleep, nutrition) through the Care Plan. You can log progress and view your streak on the Daily Goals page.",
  },
  {
    category: "Privacy and Security",
    question: "How is my data protected?",
    answer: "All data is encrypted at rest (AES-256) and in transit (TLS 1.3). Access to your health records is restricted to your authorised care team. Review your authorised access in Settings → Privacy.",
  },
  {
    category: "Account Settings",
    question: "How do I change my password?",
    answer: "Go to Settings → Security → Change Password. Enter your current password, then choose a strong new password of at least 8 characters including an uppercase letter, a number and a special character.",
  },
  {
    category: "Getting Started",
    question: "How do I contact support?",
    answer: "Use the Contact Support tab on this page. Fill in the subject, category and a short description. Our support team aims to respond within 2 business days.",
  },
];

const FAQsTab: React.FC = () => {
  const [selectedCat, setSelectedCat] = useState<string>("All");
  const [query, setQuery] = useState("");
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const filtered = faqs.filter((f) => {
    const matchCat = selectedCat === "All" || f.category === selectedCat;
    const matchQuery =
      !query ||
      f.question.toLowerCase().includes(query.toLowerCase()) ||
      f.answer.toLowerCase().includes(query.toLowerCase());
    return matchCat && matchQuery;
  });

  return (
    <div>
      {/* Search */}
      <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 mb-4 focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
        <Search className="w-4 h-4 text-slate-400 shrink-0" />
        <input
          type="search"
          placeholder="Search FAQs…"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpenIdx(null); }}
          className="bg-transparent text-sm w-full focus:outline-none text-slate-700"
          aria-label="Search frequently asked questions"
        />
        {query && (
          <button onClick={() => setQuery("")} className="text-slate-400 hover:text-slate-600">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Category filters */}
      <div className="flex gap-1.5 flex-wrap mb-5">
        {["All", ...categories].map((cat) => (
          <button
            key={cat}
            onClick={() => { setSelectedCat(cat); setOpenIdx(null); }}
            className={`px-3 py-1.5 rounded-full text-[10px] font-bold border transition-all ${
              selectedCat === cat
                ? "bg-primary text-white border-primary"
                : "bg-white text-slate-500 border-slate-200 hover:border-primary/40 hover:text-primary"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* FAQ disclaimer */}
      <div className="flex items-start gap-2 px-4 py-3 bg-teal-50 border border-teal-200 rounded-xl mb-5 text-[11px] text-teal-700">
        <Info className="w-4 h-4 shrink-0 mt-0.5" />
        <span>
          NariSetu AI does not replace professional medical evaluation. Final clinical decisions are made by qualified healthcare professionals.
        </span>
      </div>

      {/* FAQ list */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <Search className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm font-semibold">No results found for "{query}"</p>
          <p className="text-xs mt-1">Try different keywords or browse by category.</p>
        </div>
      ) : (
        <div className="space-y-2" role="list">
          {filtered.map((faq, i) => (
            <div
              key={i}
              className={`border rounded-xl transition-all ${
                openIdx === i ? "border-primary/30 bg-teal-50/40" : "border-slate-200 bg-white"
              }`}
              role="listitem"
            >
              <button
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
                className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-xl"
                aria-expanded={openIdx === i}
              >
                <span className="text-sm font-semibold text-slate-800">{faq.question}</span>
                {openIdx === i ? (
                  <ChevronUp className="w-4 h-4 text-primary shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                )}
              </button>
              {openIdx === i && (
                <div className="px-5 pb-4">
                  <p className="text-xs text-slate-600 leading-relaxed">{faq.answer}</p>
                  <p className="text-[10px] text-slate-400 mt-2">Category: {faq.category}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Contact Support ──────────────────────────────────────────────────────────
const supportCategories = [
  "Account access",
  "Report upload",
  "Appointment",
  "Questionnaire",
  "Chatbot",
  "AI-assessment display",
  "Care plan",
  "Privacy",
  "Technical issue",
  "Other",
];

const ContactTab: React.FC = () => {
  const [form, setForm] = useState({
    subject: "",
    category: "",
    description: "",
    responseMethod: "email",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [refNum] = useState(() => `BC-${Date.now().toString(36).toUpperCase().slice(-6)}`);

  const set = (k: string, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: "" }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.subject.trim()) e.subject = "Subject is required.";
    if (!form.category) e.category = "Please select a category.";
    if (!form.description.trim()) e.description = "Please describe your issue.";
    else if (form.description.trim().length < 20) e.description = "Please provide a more detailed description (at least 20 characters).";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1200));
    setSubmitting(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="text-center py-14 space-y-4">
        <div className="w-14 h-14 rounded-full bg-emerald-100 border-2 border-emerald-300 flex items-center justify-center mx-auto">
          <CheckCircle className="w-7 h-7 text-emerald-600" />
        </div>
        <h3 className="text-lg font-bold text-slate-800">Request Submitted</h3>
        <p className="text-sm text-slate-500 max-w-xs mx-auto">
          Your support request has been received. Our team aims to respond within 2 business days.
        </p>
        <div className="inline-block px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600">
          Reference: <span className="text-primary">{refNum}</span>
        </div>
        <button
          onClick={() => { setSubmitted(false); setForm({ subject: "", category: "", description: "", responseMethod: "email" }); }}
          className="block mx-auto text-xs font-bold text-primary hover:underline mt-2"
        >
          Submit another request
        </button>
      </div>
    );
  }

  return (
    <div>
      <EmergencyNotice />
      <p className="text-xs text-slate-500 mb-6">
        Use this form for non-urgent support queries. For clinical questions, please contact your care team directly.
      </p>
      <div className="space-y-5">
        <div>
          <label htmlFor="subject" className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Subject <span className="text-red-500">*</span>
          </label>
          <input
            id="subject"
            value={form.subject}
            onChange={(e) => set("subject", e.target.value)}
            placeholder="Brief summary of your issue"
            className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all ${
              errors.subject ? "border-red-300" : "border-slate-200"
            }`}
            aria-required="true"
          />
          {errors.subject && <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.subject}</p>}
        </div>

        <div>
          <label htmlFor="catSelect" className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            id="catSelect"
            value={form.category}
            onChange={(e) => set("category", e.target.value)}
            className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all ${
              errors.category ? "border-red-300" : "border-slate-200"
            }`}
          >
            <option value="">— Select a category —</option>
            {supportCategories.map((c) => <option key={c}>{c}</option>)}
          </select>
          {errors.category && <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.category}</p>}
        </div>

        <div>
          <label htmlFor="description" className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            rows={5}
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="Describe the issue in detail. Include what you were trying to do and what happened."
            className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all resize-none ${
              errors.description ? "border-red-300" : "border-slate-200"
            }`}
          />
          {errors.description && <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.description}</p>}
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
            Preferred Response Method
          </label>
          <div className="flex gap-2">
            {["email", "in-app"].map((method) => (
              <button
                key={method}
                onClick={() => set("responseMethod", method)}
                className={`px-4 py-2.5 border rounded-xl text-xs font-bold capitalize transition-all ${
                  form.responseMethod === method
                    ? "bg-primary text-white border-primary"
                    : "border-slate-200 text-slate-600 hover:border-primary/40"
                }`}
              >
                {method === "email" ? "Email" : "In-App Notification"}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-500">
          <Paperclip className="w-3.5 h-3.5 shrink-0" />
          Optional: attach a screenshot by emailing support@breastcareai.in with reference <strong className="text-slate-600">{refNum}</strong>. Do not attach files containing health records.
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-6 py-2.5 bg-primary hover:bg-[#004D46] text-white text-sm font-bold rounded-xl transition-colors flex items-center gap-2 shadow-md shadow-primary/15 disabled:opacity-60"
          >
            {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Submit Request
          </button>
          <button
            onClick={() => { setForm({ subject: "", category: "", description: "", responseMethod: "email" }); setErrors({}); }}
            className="px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 text-sm font-semibold rounded-xl transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── User Guides ──────────────────────────────────────────────────────────────
const guides = [
  {
    title: "Uploading a Report",
    steps: [
      "Sign in and navigate to the Overview or Reports section.",
      "Click Upload Report in the Quick Actions sidebar.",
      "Select the report type from the dropdown (e.g., Mammography, Blood Test).",
      "Drag and drop your file or click to browse. Supported: PDF, JPG, PNG (max 25 MB).",
      "Click Upload Files. You will see a progress bar during upload.",
      "Once complete, the report appears in your Diagnostic Reports section.",
    ],
  },
  {
    title: "Completing the Questionnaire",
    steps: [
      "Go to Assessments in the sidebar.",
      "Click Start New Assessment.",
      "Complete each step: Symptom Check, Medical History, Lifestyle Factors.",
      "Progress is saved automatically. You may return to a draft at any time.",
      "Review your answers on the summary screen and click Submit.",
    ],
  },
  {
    title: "Using the Chatbot",
    steps: [
      "Click the chatbot button at the bottom-right corner of the portal.",
      "Type your health question or concern in the chat box.",
      "The BreastCare Companion provides general wellness guidance and portal help.",
      "For urgent clinical questions, always contact your care team directly.",
    ],
  },
  {
    title: "Viewing Doctor Feedback",
    steps: [
      "After your clinician completes their review, you will receive a notification.",
      "Navigate to Reports or use the Track Review panel.",
      "Open the finalised report to read the doctor's signed clinical notes.",
      "Contact your care team via Messages for clarification.",
    ],
  },
  {
    title: "Checking Appointments",
    steps: [
      "Go to Appointments in the sidebar.",
      "View upcoming and past appointments in the calendar view.",
      "Click any appointment to see the details, mode (in-person or teleconsult) and doctor.",
      "Use the Book Appointment quick action to schedule a new slot.",
    ],
  },
  {
    title: "Viewing Care Plan Instructions",
    steps: [
      "Navigate to Care Plan in the sidebar.",
      "Your care plan is populated by your clinician after review.",
      "Review your treatment recommendations, follow-up schedule and assigned daily goals.",
      "Use the Daily Goals section to log your daily wellness progress.",
    ],
  },
  {
    title: "Updating Notification Preferences",
    steps: [
      "Go to Settings → Notifications.",
      "Toggle each notification type on or off for In-App and Email channels.",
      "Click Save Preferences.",
      "Note: essential clinical and security notifications cannot be fully disabled.",
    ],
  },
];

const GuidesTab: React.FC = () => {
  const [openGuide, setOpenGuide] = useState<number | null>(null);

  return (
    <div className="space-y-3" role="list">
      {guides.map((guide, i) => (
        <div
          key={i}
          className={`border rounded-xl transition-all ${
            openGuide === i ? "border-primary/30 bg-teal-50/30" : "border-slate-200 bg-white"
          }`}
          role="listitem"
        >
          <button
            onClick={() => setOpenGuide(openGuide === i ? null : i)}
            className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-xl"
            aria-expanded={openGuide === i}
          >
            <div className="flex items-center gap-3">
              <BookOpen className="w-4 h-4 text-primary shrink-0" />
              <span className="text-sm font-semibold text-slate-800">{guide.title}</span>
            </div>
            {openGuide === i ? (
              <ChevronUp className="w-4 h-4 text-primary shrink-0" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
            )}
          </button>
          {openGuide === i && (
            <div className="px-5 pb-5">
              <ol className="space-y-2 list-none">
                {guide.steps.map((step, j) => (
                  <li key={j} className="flex items-start gap-3 text-xs text-slate-600">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black flex items-center justify-center mt-0.5">
                      {j + 1}
                    </span>
                    <span className="leading-relaxed">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// ─── Technical Issue Report ───────────────────────────────────────────────────
const techIssueTypes = [
  "Page not loading",
  "Upload failure",
  "Missing data",
  "Incorrect display",
  "Notification issue",
  "Login issue",
  "Other",
];

const ReportIssueTab: React.FC = () => {
  const [issueType, setIssueType] = useState("");
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [refNum] = useState(() => `TI-${Date.now().toString(36).toUpperCase().slice(-7)}`);

  const handleSubmit = async () => {
    if (!issueType) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 900));
    setSubmitting(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="text-center py-14 space-y-4">
        <div className="w-14 h-14 rounded-full bg-emerald-100 border-2 border-emerald-300 flex items-center justify-center mx-auto">
          <CheckCircle className="w-7 h-7 text-emerald-600" />
        </div>
        <h3 className="text-lg font-bold text-slate-800">Issue Reported</h3>
        <p className="text-sm text-slate-500 max-w-xs mx-auto">
          Thank you for reporting this technical issue. Our engineering team will investigate.
        </p>
        <div className="inline-block px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600">
          Reference: <span className="text-primary">{refNum}</span>
        </div>
        <button
          onClick={() => { setSubmitted(false); setIssueType(""); setDetails(""); }}
          className="block mx-auto text-xs font-bold text-primary hover:underline mt-2"
        >
          Report another issue
        </button>
      </div>
    );
  }

  return (
    <div>
      <p className="text-xs text-slate-500 mb-5">
        Report a technical problem with the portal. Do not include health information in this form.
      </p>

      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-5 text-[11px] text-slate-500 space-y-1">
        <p className="font-bold text-slate-600">Automatically included context:</p>
        <p>Page: {typeof window !== "undefined" ? window.location.pathname : "/patient/help"}</p>
        <p>Browser: {typeof navigator !== "undefined" ? navigator.userAgent.split(") ")[0].split("(")[1] ?? "Unknown" : "Unknown"}</p>
        <p>Time: {new Date().toLocaleString("en-IN")}</p>
        <p>Reference: {refNum}</p>
        <p className="text-[10px] mt-1">No health data is included in this technical report.</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
            Issue Type <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {techIssueTypes.map((t) => (
              <button
                key={t}
                onClick={() => setIssueType(t)}
                className={`px-3 py-2.5 border rounded-xl text-xs font-semibold text-left transition-all ${
                  issueType === t
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-slate-200 text-slate-600 hover:border-primary/40"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="techDetails" className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Additional Details
          </label>
          <textarea
            id="techDetails"
            rows={4}
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="What were you trying to do when the issue occurred? (optional)"
            className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all resize-none"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={!issueType || submitting}
          className="px-6 py-2.5 bg-primary hover:bg-[#004D46] text-white text-sm font-bold rounded-xl transition-colors flex items-center gap-2 shadow-md shadow-primary/15 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          Submit Report
        </button>
      </div>
    </div>
  );
};

// ─── Feedback ─────────────────────────────────────────────────────────────────
const FeedbackTab: React.FC = () => {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [worked, setWorked] = useState("");
  const [improve, setImprove] = useState("");
  const [difficult, setDifficult] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!rating) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 800));
    setSubmitting(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="text-center py-14 space-y-3">
        <div className="w-14 h-14 rounded-full bg-amber-100 border-2 border-amber-300 flex items-center justify-center mx-auto">
          <Star className="w-7 h-7 text-amber-500 fill-amber-400" />
        </div>
        <h3 className="text-lg font-bold text-slate-800">Thank you for your feedback!</h3>
        <p className="text-sm text-slate-500">Your response helps us improve NariSetu AI for all patients.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-start gap-2 p-4 bg-blue-50 border border-blue-200 rounded-xl mb-6 text-[11px] text-blue-700">
        <Info className="w-4 h-4 shrink-0 mt-0.5" />
        Product feedback is separate from clinical communication. For urgent medical queries, contact your care team.
      </div>

      <div className="space-y-6">
        <div>
          <p className="text-sm font-bold text-slate-700 mb-3">How helpful is BreastCare AI?</p>
          <div className="flex gap-2" aria-label="Rating: select 1 to 5 stars">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                onClick={() => setRating(n)}
                onMouseEnter={() => setHovered(n)}
                onMouseLeave={() => setHovered(0)}
                className="focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded"
                aria-label={`Rate ${n} out of 5`}
              >
                <Star
                  className={`w-8 h-8 transition-colors ${
                    n <= (hovered || rating)
                      ? "text-amber-400 fill-amber-400"
                      : "text-slate-300"
                  }`}
                />
              </button>
            ))}
          </div>
          {rating > 0 && (
            <p className="text-[11px] text-slate-400 mt-1">
              {["", "Poor", "Below average", "Average", "Good", "Excellent"][rating]} experience selected.
            </p>
          )}
        </div>

        {[
          { id: "worked", label: "What worked well?", value: worked, setter: setWorked },
          { id: "improve", label: "What could be improved?", value: improve, setter: setImprove },
          {
            id: "difficult",
            label: "Which feature was difficult to use?",
            value: difficult,
            setter: setDifficult,
          },
        ].map((field) => (
          <div key={field.id}>
            <label htmlFor={field.id} className="block text-xs font-semibold text-slate-600 mb-1">
              {field.label} <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <textarea
              id={field.id}
              rows={3}
              value={field.value}
              onChange={(e) => field.setter(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none transition-all"
            />
          </div>
        ))}

        <button
          onClick={handleSubmit}
          disabled={!rating || submitting}
          className="px-6 py-2.5 bg-primary hover:bg-[#004D46] text-white text-sm font-bold rounded-xl transition-colors flex items-center gap-2 shadow-md shadow-primary/15 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Star className="w-4 h-4" />}
          Submit Feedback
        </button>
      </div>
    </div>
  );
};

// ─── Main component ────────────────────────────────────────────────────────────

export const PatientHelpPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<HelpTab>("faqs");

  const tabs: { id: HelpTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: "faqs", label: "FAQs", icon: HelpCircle },
    { id: "guides", label: "User Guides", icon: BookOpen },
    { id: "contact", label: "Contact Support", icon: MessageSquare },
    { id: "report", label: "Report Issue", icon: AlertTriangle },
    { id: "feedback", label: "Feedback", icon: Star },
  ];

  return (
    <div className="max-w-4xl mx-auto pb-16">
      {/* Page Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
          <HelpCircle className="w-4.5 h-4.5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Help &amp; Support</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Find guidance for using BreastCare AI or contact the support team.
          </p>
        </div>
      </div>

      {/* Quick-contact chips */}
      <div className="flex flex-wrap gap-3 mb-6">
        {[
          {
            label: "Support Email",
            sub: "support@breastcareai.in",
            icon: MessageSquare,
            cls: "text-primary border-primary/20 bg-primary/5",
          },
          {
            label: "Response Time",
            sub: "Within 2 business days",
            icon: Phone,
            cls: "text-slate-600 border-slate-200 bg-slate-50",
          },
        ].map((chip) => {
          const Icon = chip.icon;
          return (
            <div
              key={chip.label}
              className={`flex items-center gap-2.5 px-4 py-2.5 border rounded-xl text-xs ${chip.cls}`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <div>
                <p className="font-bold">{chip.label}</p>
                <p className="opacity-70">{chip.sub}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tab nav */}
      <div className="flex gap-1 overflow-x-auto pb-0.5 mb-6 scrollbar-none border-b border-slate-200">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl whitespace-nowrap transition-all border-b-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                activeTab === tab.id
                  ? "border-primary text-primary bg-primary/5"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"
              }`}
              aria-selected={activeTab === tab.id}
              role="tab"
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab panel */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs" role="tabpanel">
        {activeTab === "faqs" && <FAQsTab />}
        {activeTab === "guides" && <GuidesTab />}
        {activeTab === "contact" && <ContactTab />}
        {activeTab === "report" && <ReportIssueTab />}
        {activeTab === "feedback" && <FeedbackTab />}
      </div>
    </div>
  );
};
