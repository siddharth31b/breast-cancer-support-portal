import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Bell,
  Shield,
  Lock,
  Eye,
  EyeOff,
  Settings,
  Heart,
  CheckCircle,
  AlertCircle,
  Save,
  ChevronRight,
  LogOut,
  Accessibility,
  Download,
  Trash2,
  RefreshCw,
  Sliders,
} from "lucide-react";
import { useAuth } from "../auth/AuthContext";

// ─── Types ────────────────────────────────────────────────────────────────────

type SettingsTab =
  | "profile"
  | "health"
  | "notifications"
  | "privacy"
  | "security"
  | "accessibility"
  | "account";

// ─── Reusable sub-components ──────────────────────────────────────────────────

const SectionHeader: React.FC<{ title: string; description: string }> = ({
  title,
  description,
}) => (
  <div className="mb-6">
    <h2 className="text-lg font-bold text-slate-800">{title}</h2>
    <p className="text-xs text-slate-400 mt-1">{description}</p>
  </div>
);

const FieldLabel: React.FC<{ htmlFor: string; label: string; required?: boolean }> = ({
  htmlFor,
  label,
  required,
}) => (
  <label
    htmlFor={htmlFor}
    className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1"
  >
    {label}
    {required && <span className="text-red-500 ml-0.5">*</span>}
  </label>
);

const FieldInput: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { error?: string }> = ({
  error,
  className,
  ...props
}) => (
  <>
    <input
      {...props}
      className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all ${
        error ? "border-red-300" : "border-slate-200"
      } ${className ?? ""}`}
    />
    {error && (
      <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1">
        <AlertCircle className="w-3 h-3" /> {error}
      </p>
    )}
  </>
);

const ToggleSwitch: React.FC<{
  checked: boolean;
  onChange: (v: boolean) => void;
  id: string;
  label: string;
  description?: string;
  disabled?: boolean;
}> = ({ checked, onChange, id, label, description, disabled }) => (
  <div className="flex items-start justify-between gap-4 py-3 border-b border-slate-100 last:border-0">
    <div>
      <label htmlFor={id} className="text-sm font-semibold text-slate-700 cursor-pointer">
        {label}
      </label>
      {description && (
        <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{description}</p>
      )}
    </div>
    <button
      id={id}
      role="switch"
      aria-checked={checked}
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={`relative shrink-0 w-10 h-5.5 rounded-full border transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
        disabled
          ? "opacity-50 cursor-not-allowed"
          : "cursor-pointer"
      } ${checked ? "bg-primary border-primary" : "bg-slate-200 border-slate-300"}`}
      style={{ minWidth: "40px", height: "22px" }}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-4.5 h-4.5 bg-white rounded-full shadow-sm transition-transform ${
          checked ? "translate-x-[18px]" : "translate-x-0"
        }`}
        style={{ width: "18px", height: "18px" }}
      />
    </button>
  </div>
);

// ─── TAB PANELS ───────────────────────────────────────────────────────────────

const ProfileSection: React.FC = () => {
  const initial = {
    fullName: "Meera Sharma",
    dob: "1990-03-15",
    email: "meera.sharma@example.com",
    phone: "+91 98765 43210",
    address: "42, Green Park Colony, Indore, MP 452001",
    language: "English",
    emergencyName: "Rohan Sharma",
    emergencyPhone: "+91 94321 10987",
  };
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const age =
    form.dob
      ? Math.floor(
          (Date.now() - new Date(form.dob).getTime()) / (1000 * 60 * 60 * 24 * 365.25)
        )
      : "";

  const set = (field: string, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: "" }));
    setSaved(false);
    setIsDirty(true);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.fullName.trim()) e.fullName = "Full name is required.";
    if (!form.email.trim()) e.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Enter a valid email address.";
    if (!form.phone.trim()) e.phone = "Phone number is required.";
    else if (!/^\+?[\d\s-]{8,}$/.test(form.phone.replace(/\s/g, "")))
      e.phone = "Enter a valid phone number.";
    return e;
  };

  const handleSave = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }
    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 900));
    setIsSaving(false);
    setSaved(true);
    setIsDirty(false);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div>
      <SectionHeader
        title="Profile Information"
        description="Update your personal details. These are used for appointment bookings and communication with your care team."
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <FieldLabel htmlFor="fullName" label="Full Name" required />
          <FieldInput
            id="fullName"
            value={form.fullName}
            onChange={(e) => set("fullName", e.target.value)}
            placeholder="Your full name"
            error={errors.fullName}
            aria-required="true"
          />
        </div>
        <div>
          <FieldLabel htmlFor="dob" label="Date of Birth" />
          <FieldInput
            id="dob"
            type="date"
            value={form.dob}
            onChange={(e) => set("dob", e.target.value)}
          />
        </div>
        {age !== "" && (
          <div>
            <FieldLabel htmlFor="age" label="Age (calculated)" />
            <input
              id="age"
              readOnly
              value={`${age} years`}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm text-slate-500 font-medium"
              aria-readonly="true"
            />
          </div>
        )}
        <div>
          <FieldLabel htmlFor="email" label="Email" required />
          <FieldInput
            id="email"
            type="email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            placeholder="your@email.com"
            error={errors.email}
          />
        </div>
        <div>
          <FieldLabel htmlFor="phone" label="Phone Number" required />
          <FieldInput
            id="phone"
            type="tel"
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
            placeholder="+91 9XXXX XXXXX"
            error={errors.phone}
          />
        </div>
        <div className="md:col-span-2">
          <FieldLabel htmlFor="address" label="Address" />
          <FieldInput
            id="address"
            value={form.address}
            onChange={(e) => set("address", e.target.value)}
            placeholder="Street, City, State, PIN"
          />
        </div>
        <div>
          <FieldLabel htmlFor="language" label="Preferred Language" />
          <select
            id="language"
            value={form.language}
            onChange={(e) => set("language", e.target.value)}
            className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            {["English", "Hindi", "Marathi", "Tamil", "Telugu", "Kannada", "Bengali", "Gujarati"].map(
              (l) => (
                <option key={l}>{l}</option>
              )
            )}
          </select>
        </div>
        <div className="md:col-span-2 border-t border-slate-100 pt-5 mt-2">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">
            Emergency Contact
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <FieldLabel htmlFor="emergencyName" label="Contact Name" />
              <FieldInput
                id="emergencyName"
                value={form.emergencyName}
                onChange={(e) => set("emergencyName", e.target.value)}
                placeholder="Emergency contact name"
              />
            </div>
            <div>
              <FieldLabel htmlFor="emergencyPhone" label="Contact Phone" />
              <FieldInput
                id="emergencyPhone"
                type="tel"
                value={form.emergencyPhone}
                onChange={(e) => set("emergencyPhone", e.target.value)}
                placeholder="+91 9XXXX XXXXX"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="mt-6 flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={!isDirty || isSaving}
          className="px-6 py-2.5 bg-primary hover:bg-[#004D46] text-white text-sm font-bold rounded-xl transition-colors flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-primary/15"
        >
          {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Profile
        </button>
        {isDirty && (
          <button
            onClick={() => { setForm(initial); setErrors({}); setIsDirty(false); }}
            className="px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 text-sm font-semibold rounded-xl transition-colors"
          >
            Discard
          </button>
        )}
        {saved && (
          <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
            <CheckCircle className="w-4 h-4" /> Saved
          </span>
        )}
      </div>
    </div>
  );
};

const HealthPreferencesSection: React.FC = () => {
  const [prefs, setPrefs] = useState({
    hospital: "IIT Indore Main Campus",
    doctor: "Dr. Sarah Iyer",
    appointmentMode: "In-Person",
    heightUnit: "cm",
    weightUnit: "kg",
    commLanguage: "English",
  });
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const set = (k: string, v: string) => {
    setPrefs((p) => ({ ...p, [k]: v }));
    setSaved(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 700));
    setIsSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div>
      <SectionHeader
        title="Health Profile Preferences"
        description="Set your preferred care settings. Clinical decisions and verified medical history remain with your care team."
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <FieldLabel htmlFor="hospital" label="Preferred Hospital" />
          <select
            id="hospital"
            value={prefs.hospital}
            onChange={(e) => set("hospital", e.target.value)}
            className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            {["IIT Indore Main Campus", "AIIMS New Delhi", "CMC Vellore", "Tata Memorial Mumbai"].map(
              (h) => <option key={h}>{h}</option>
            )}
          </select>
        </div>
        <div>
          <FieldLabel htmlFor="doctor" label="Preferred Doctor" />
          <select
            id="doctor"
            value={prefs.doctor}
            onChange={(e) => set("doctor", e.target.value)}
            className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            {["Dr. Sarah Iyer", "Dr. Priya Mehta", "Dr. Alok Kumar"].map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
        </div>
        <div>
          <FieldLabel htmlFor="appointmentMode" label="Preferred Appointment Mode" />
          <select
            id="appointmentMode"
            value={prefs.appointmentMode}
            onChange={(e) => set("appointmentMode", e.target.value)}
            className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            {["In-Person", "Teleconsult (Video)", "Teleconsult (Phone)"].map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
        </div>
        <div>
          <FieldLabel htmlFor="commLanguage" label="Communication Language" />
          <select
            id="commLanguage"
            value={prefs.commLanguage}
            onChange={(e) => set("commLanguage", e.target.value)}
            className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            {["English", "Hindi", "Marathi", "Tamil", "Telugu"].map((l) => (
              <option key={l}>{l}</option>
            ))}
          </select>
        </div>
        <div>
          <FieldLabel htmlFor="heightUnit" label="Height Unit" />
          <div className="flex gap-2" id="heightUnit">
            {["cm", "ft/in"].map((u) => (
              <button
                key={u}
                onClick={() => set("heightUnit", u)}
                className={`flex-1 py-2.5 border rounded-xl text-sm font-bold transition-all ${
                  prefs.heightUnit === u
                    ? "bg-primary text-white border-primary"
                    : "border-slate-200 text-slate-600 hover:border-primary/40"
                }`}
              >
                {u}
              </button>
            ))}
          </div>
        </div>
        <div>
          <FieldLabel htmlFor="weightUnit" label="Weight Unit" />
          <div className="flex gap-2" id="weightUnit">
            {["kg", "lbs"].map((u) => (
              <button
                key={u}
                onClick={() => set("weightUnit", u)}
                className={`flex-1 py-2.5 border rounded-xl text-sm font-bold transition-all ${
                  prefs.weightUnit === u
                    ? "bg-primary text-white border-primary"
                    : "border-slate-200 text-slate-600 hover:border-primary/40"
                }`}
              >
                {u}
              </button>
            ))}
          </div>
        </div>
      </div>
      <p className="mt-5 text-[11px] text-slate-400 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3">
        ℹ️ Clinician-verified medical history and AI assessments can only be updated by your assigned healthcare professional.
      </p>
      <div className="mt-5 flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-2.5 bg-primary hover:bg-[#004D46] text-white text-sm font-bold rounded-xl transition-colors flex items-center gap-2 shadow-md shadow-primary/15"
        >
          {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Preferences
        </button>
        {saved && (
          <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
            <CheckCircle className="w-4 h-4" /> Saved
          </span>
        )}
      </div>
    </div>
  );
};

const NotificationsSection: React.FC = () => {
  const notifItems = [
    { id: "appt", label: "Upcoming Appointments", description: "Reminders before scheduled consultations." },
    { id: "report", label: "Report Upload Reminders", description: "Nudges to upload pending medical documents." },
    { id: "quest", label: "Questionnaire Reminders", description: "Reminders to complete your symptom questionnaire." },
    { id: "docReview", label: "Doctor Review Updates", description: "Notifications when your clinician reviews your case." },
    { id: "carePlan", label: "Care Plan Updates", description: "Alerts when your care plan is created or modified." },
    { id: "goals", label: "Daily Goals", description: "Daily wellness and goal tracking nudges." },
    { id: "followup", label: "Follow-up Reminders", description: "Reminders about upcoming follow-up actions." },
    { id: "messages", label: "New Messages", description: "Notifications for new messages from your care team." },
    { id: "edu", label: "Breast-Health Education", description: "Periodic educational content about breast health." },
  ];

  const [inApp, setInApp] = useState<Record<string, boolean>>(
    Object.fromEntries(notifItems.map((n) => [n.id, true]))
  );
  const [email, setEmail] = useState<Record<string, boolean>>(
    Object.fromEntries(notifItems.map((n) => [n.id, n.id !== "goals" && n.id !== "edu"]))
  );
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 700));
    setIsSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div>
      <SectionHeader
        title="Notification Preferences"
        description="Control which non-critical notifications you receive and through which channels."
      />
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6 text-[11px] text-amber-700 font-medium">
        Essential account, privacy and clinically important notifications may still be sent regardless of your preferences.
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-slate-400 uppercase text-[9px] tracking-wider font-bold">
              <th className="text-left py-3 pr-4">Notification Type</th>
              <th className="text-center py-3 px-4 min-w-[80px]">In-App</th>
              <th className="text-center py-3 px-4 min-w-[80px]">Email</th>
            </tr>
          </thead>
          <tbody>
            {notifItems.map((item) => (
              <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                <td className="py-3 pr-4">
                  <p className="font-semibold text-slate-700">{item.label}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{item.description}</p>
                </td>
                <td className="text-center py-3 px-4">
                  <button
                    role="switch"
                    aria-checked={inApp[item.id]}
                    onClick={() => setInApp((p) => ({ ...p, [item.id]: !p[item.id] }))}
                    className={`w-9 h-5 rounded-full border transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                      inApp[item.id] ? "bg-primary border-primary" : "bg-slate-200 border-slate-300"
                    }`}
                    aria-label={`Toggle in-app notification for ${item.label}`}
                    style={{ position: "relative", display: "inline-block" }}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 bg-white rounded-full shadow-sm transition-transform ${
                        inApp[item.id] ? "translate-x-4" : "translate-x-0"
                      }`}
                      style={{ width: "16px", height: "16px" }}
                    />
                  </button>
                </td>
                <td className="text-center py-3 px-4">
                  <button
                    role="switch"
                    aria-checked={email[item.id]}
                    onClick={() => setEmail((p) => ({ ...p, [item.id]: !p[item.id] }))}
                    className={`w-9 h-5 rounded-full border transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                      email[item.id] ? "bg-primary border-primary" : "bg-slate-200 border-slate-300"
                    }`}
                    aria-label={`Toggle email notification for ${item.label}`}
                    style={{ position: "relative", display: "inline-block" }}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 bg-white rounded-full shadow-sm transition-transform ${
                        email[item.id] ? "translate-x-4" : "translate-x-0"
                      }`}
                      style={{ width: "16px", height: "16px" }}
                    />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-5 flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-2.5 bg-primary hover:bg-[#004D46] text-white text-sm font-bold rounded-xl transition-colors flex items-center gap-2 shadow-md shadow-primary/15"
        >
          {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Preferences
        </button>
        {saved && (
          <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
            <CheckCircle className="w-4 h-4" /> Saved
          </span>
        )}
      </div>
    </div>
  );
};

const PrivacySection: React.FC = () => {
  const [researchConsent, setResearchConsent] = useState(false);
  const [commConsent, setCommConsent] = useState(true);
  const [correctionRequested, setCorrectionRequested] = useState(false);
  const [exportRequested, setExportRequested] = useState(false);
  const [deactivateModal, setDeactivateModal] = useState(false);

  return (
    <div>
      <SectionHeader
        title="Privacy & Consent"
        description="Manage your consent choices, authorised access and data rights."
      />

      {/* Consent toggles */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-6 space-y-1">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">Consent Management</p>
        <ToggleSwitch
          id="researchConsent"
          checked={researchConsent}
          onChange={setResearchConsent}
          label="Optional Research Consent"
          description="Allow de-identified health data to contribute to NariSetu AI research. You can withdraw at any time."
        />
        <ToggleSwitch
          id="commConsent"
          checked={commConsent}
          onChange={setCommConsent}
          label="Communication Consent"
          description="Receive care-related communications from the NariSetu AI platform and your care team."
        />
      </div>

      {/* Authorised care team */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-6">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">Authorised Care Team</p>
        {[
          { name: "Dr. Sarah Iyer", role: "Lead Oncologist" },
          { name: "Dr. Alok Mehta", role: "Radiologist" },
          { name: "Nurse Pooja Verma", role: "Breast Care Nurse" },
        ].map((m, i) => (
          <div key={i} className="flex items-center justify-between py-2.5 border-b border-slate-100 last:border-0">
            <div>
              <p className="text-sm font-semibold text-slate-700">{m.name}</p>
              <p className="text-[11px] text-slate-400">{m.role}</p>
            </div>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
              Authorised
            </span>
          </div>
        ))}
      </div>

      {/* Data rights */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Data Rights</p>
        {[
          {
            label: "View Privacy Notice",
            desc: "Read the NariSetu AI privacy notice.",
            action: () => alert("Privacy notice: [institutional document link]"),
            cls: "text-primary",
          },
          {
            label: "Request Profile Correction",
            desc: "Request a correction to your recorded personal information.",
            action: () => setCorrectionRequested(true),
            cls: "text-primary",
            done: correctionRequested,
          },
          {
            label: "Request Data Export",
            desc: "Download a copy of your non-clinical account data.",
            action: () => setExportRequested(true),
            cls: "text-primary",
            done: exportRequested,
          },
        ].map((item, i) => (
          <div key={i} className="flex items-start justify-between gap-4 py-2 border-b border-slate-100 last:border-0">
            <div>
              <p className="text-sm font-semibold text-slate-700">{item.label}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{item.desc}</p>
            </div>
            {item.done ? (
              <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> Requested
              </span>
            ) : (
              <button
                onClick={item.action}
                className={`text-xs font-bold ${item.cls} hover:underline flex items-center gap-1 shrink-0`}
              >
                Open <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ))}
      </div>

      <p className="mt-5 text-[11px] text-slate-400 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3">
        Your health records may be retained according to applicable institutional and legal requirements.
      </p>

      {/* Deactivate */}
      <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-red-700">Request Account Deactivation</p>
          <p className="text-[11px] text-red-500 mt-0.5">
            Your clinical records are managed under institutional retention policies and may not be immediately removed.
          </p>
        </div>
        <button
          onClick={() => setDeactivateModal(true)}
          className="shrink-0 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-colors"
        >
          Request
        </button>
      </div>

      {deactivateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full space-y-4 border border-slate-200">
            <h3 className="font-bold text-slate-800">Confirm Deactivation Request</h3>
            <p className="text-xs text-slate-500">
              Submitting this request will notify your care team and account administrators. Clinical records are subject to institutional retention policies.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeactivateModal(false)}
                className="flex-1 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setDeactivateModal(false);
                  alert("Deactivation request submitted. Your account team will be in touch within 5 business days.");
                }}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold"
              >
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const SecuritySection: React.FC = () => {
  const [current, setCurrent] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const strength = (() => {
    if (!newPw) return 0;
    let s = 0;
    if (newPw.length >= 8) s++;
    if (/[A-Z]/.test(newPw)) s++;
    if (/[0-9]/.test(newPw)) s++;
    if (/[^A-Za-z0-9]/.test(newPw)) s++;
    return s;
  })();
  const strengthLabel = ["Too weak", "Weak", "Fair", "Good", "Strong"][strength];
  const strengthColor = ["bg-red-400", "bg-orange-400", "bg-amber-400", "bg-teal-400", "bg-emerald-500"][strength];

  const handleChange = async () => {
    const e: Record<string, string> = {};
    if (!current) e.current = "Current password is required.";
    if (!newPw) e.newPw = "New password is required.";
    else if (newPw.length < 8) e.newPw = "Password must be at least 8 characters.";
    else if (strength < 2) e.newPw = "Please choose a stronger password.";
    if (newPw !== confirm) e.confirm = "Passwords do not match.";
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setSaving(true);
    await new Promise((r) => setTimeout(r, 900));
    setSaving(false);
    setSuccess(true);
    setCurrent(""); setNewPw(""); setConfirm(""); setErrors({});
    setTimeout(() => setSuccess(false), 4000);
  };

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Security"
        description="Manage your password and account access settings."
      />

      {/* Change password */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Change Password</p>
        <div>
          <FieldLabel htmlFor="currentPw" label="Current Password" required />
          <div className="relative">
            <FieldInput
              id="currentPw"
              type={showCurrent ? "text" : "password"}
              value={current}
              onChange={(e) => { setCurrent(e.target.value); setErrors((err) => ({ ...err, current: "" })); }}
              placeholder="Enter current password"
              error={errors.current}
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              aria-label={showCurrent ? "Hide password" : "Show password"}
            >
              {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <div>
          <FieldLabel htmlFor="newPw" label="New Password" required />
          <div className="relative">
            <FieldInput
              id="newPw"
              type={showNew ? "text" : "password"}
              value={newPw}
              onChange={(e) => { setNewPw(e.target.value); setErrors((err) => ({ ...err, newPw: "" })); }}
              placeholder="Min. 8 characters"
              error={errors.newPw}
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              aria-label={showNew ? "Hide password" : "Show password"}
            >
              {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {newPw && (
            <div className="mt-2 space-y-1">
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className={`flex-1 h-1 rounded-full ${i <= strength ? strengthColor : "bg-slate-200"}`} />
                ))}
              </div>
              <p className="text-[10px] text-slate-500">
                Password strength: <strong className="text-slate-700">{strengthLabel}</strong>
              </p>
              <ul className="text-[10px] text-slate-400 space-y-0.5 mt-1">
                <li className={newPw.length >= 8 ? "text-emerald-600" : ""}>• At least 8 characters</li>
                <li className={/[A-Z]/.test(newPw) ? "text-emerald-600" : ""}>• At least one uppercase letter</li>
                <li className={/[0-9]/.test(newPw) ? "text-emerald-600" : ""}>• At least one number</li>
                <li className={/[^A-Za-z0-9]/.test(newPw) ? "text-emerald-600" : ""}>• At least one special character</li>
              </ul>
            </div>
          )}
        </div>
        <div>
          <FieldLabel htmlFor="confirmPw" label="Confirm New Password" required />
          <div className="relative">
            <FieldInput
              id="confirmPw"
              type={showConfirm ? "text" : "password"}
              value={confirm}
              onChange={(e) => { setConfirm(e.target.value); setErrors((err) => ({ ...err, confirm: "" })); }}
              placeholder="Re-enter new password"
              error={errors.confirm}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              aria-label={showConfirm ? "Hide password" : "Show password"}
            >
              {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={handleChange}
            disabled={saving}
            className="px-6 py-2.5 bg-primary hover:bg-[#004D46] text-white text-sm font-bold rounded-xl transition-colors flex items-center gap-2 shadow-md shadow-primary/15"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
            Update Password
          </button>
          {success && (
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
              <CheckCircle className="w-4 h-4" /> Password updated
            </span>
          )}
        </div>
      </div>

      {/* Recent activity */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-4">Recent Login Activity</p>
        <div className="space-y-3">
          {[
            { device: "Chrome on Windows", location: "Indore, IN", time: "Today 2:34 PM", current: true },
            { device: "Safari on iPhone", location: "Indore, IN", time: "Yesterday 8:12 AM", current: false },
            { device: "Firefox on macOS", location: "Mumbai, IN", time: "Jul 19 · 4:55 PM", current: false },
          ].map((s, i) => (
            <div key={i} className="flex items-center justify-between text-xs py-2.5 border-b border-slate-100 last:border-0">
              <div>
                <p className="font-semibold text-slate-700">{s.device}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{s.location} · {s.time}</p>
              </div>
              {s.current ? (
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  This session
                </span>
              ) : (
                <button className="text-[10px] font-bold text-red-500 hover:underline">End session</button>
              )}
            </div>
          ))}
        </div>
        <button className="mt-4 text-xs font-bold text-red-500 hover:underline flex items-center gap-1">
          <LogOut className="w-3.5 h-3.5" /> Sign out from all other devices
        </button>
      </div>
    </div>
  );
};

const AccessibilitySection: React.FC = () => {
  const [a11y, setA11y] = useState({
    highContrast: false,
    reducedMotion: false,
    largeText: false,
    screenReader: false,
    simplifiedView: false,
  });
  const [textSize, setTextSize] = useState("medium");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const toggle = (k: string) => setA11y((p) => ({ ...p, [k]: !p[k as keyof typeof p] }));

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 700));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div>
      <SectionHeader
        title="Accessibility"
        description="Personalise the display and interaction settings to make NariSetu AI easier to use."
      />
      <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-1 mb-6">
        <ToggleSwitch
          id="highContrast"
          checked={a11y.highContrast}
          onChange={() => toggle("highContrast")}
          label="High Contrast Mode"
          description="Increases colour contrast for improved readability."
        />
        <ToggleSwitch
          id="reducedMotion"
          checked={a11y.reducedMotion}
          onChange={() => toggle("reducedMotion")}
          label="Reduce Motion"
          description="Minimises animations and transitions throughout the portal."
        />
        <ToggleSwitch
          id="largeText"
          checked={a11y.largeText}
          onChange={() => toggle("largeText")}
          label="Larger Text"
          description="Increases base font size for improved legibility."
        />
        <ToggleSwitch
          id="screenReader"
          checked={a11y.screenReader}
          onChange={() => toggle("screenReader")}
          label="Screen Reader Optimisation"
          description="Adds additional ARIA labels and landmarks to improve screen reader experience."
        />
        <ToggleSwitch
          id="simplifiedView"
          checked={a11y.simplifiedView}
          onChange={() => toggle("simplifiedView")}
          label="Simplified Dashboard View"
          description="Shows a simplified overview with fewer panels to reduce visual complexity."
        />
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-5">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">Text Size</p>
        <div className="flex gap-2 flex-wrap">
          {["small", "medium", "large", "x-large"].map((size) => (
            <button
              key={size}
              onClick={() => setTextSize(size)}
              className={`px-4 py-2 border rounded-xl text-sm font-bold capitalize transition-all ${
                textSize === size
                  ? "bg-primary text-white border-primary"
                  : "border-slate-200 text-slate-600 hover:border-primary/40"
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 bg-primary hover:bg-[#004D46] text-white text-sm font-bold rounded-xl transition-colors flex items-center gap-2 shadow-md shadow-primary/15"
        >
          {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Accessibility Settings
        </button>
        {saved && (
          <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
            <CheckCircle className="w-4 h-4" /> Saved
          </span>
        )}
      </div>
    </div>
  );
};

const AccountActionsSection: React.FC = () => {
  const { logout } = useAuth();
  const router = useRouter();
  const [deactivateModal, setDeactivateModal] = useState(false);

  return (
    <div>
      <SectionHeader
        title="Account Actions"
        description="Manage data downloads, account status and sign-out options."
      />
      <div className="space-y-4">
        {[
          {
            label: "Download Account Summary",
            desc: "Export a summary of your non-clinical account data.",
            icon: Download,
            action: () => alert("Your data export request has been queued. You will receive an email when it is ready."),
            cls: "text-primary border-primary/20 bg-primary/5 hover:bg-primary/10",
          },
          {
            label: "Request Profile Correction",
            desc: "Ask your care team to correct inaccurate personal information.",
            icon: RefreshCw,
            action: () => alert("A correction request has been sent to your care team."),
            cls: "text-slate-600 border-slate-200 bg-slate-50 hover:bg-slate-100",
          },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              onClick={item.action}
              className={`w-full flex items-center gap-4 p-4 border rounded-2xl text-left transition-all ${item.cls}`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <div>
                <p className="text-sm font-bold">{item.label}</p>
                <p className="text-[11px] mt-0.5 opacity-70">{item.desc}</p>
              </div>
              <ChevronRight className="w-4 h-4 ml-auto opacity-60" />
            </button>
          );
        })}

        <button
          onClick={() => { logout(); router.push("/login"); }}
          className="w-full flex items-center gap-4 p-4 border border-slate-200 bg-slate-50 hover:bg-slate-100 rounded-2xl text-left transition-all"
        >
          <LogOut className="w-5 h-5 text-slate-500 shrink-0" />
          <div>
            <p className="text-sm font-bold text-slate-700">Sign Out</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Sign out of NariSetu AI on this device.</p>
          </div>
        </button>

        <button
          onClick={() => setDeactivateModal(true)}
          className="w-full flex items-center gap-4 p-4 border border-red-200 bg-red-50 hover:bg-red-100 rounded-2xl text-left transition-all"
        >
          <Trash2 className="w-5 h-5 text-red-500 shrink-0" />
          <div>
            <p className="text-sm font-bold text-red-700">Deactivate Account</p>
            <p className="text-[11px] text-red-400 mt-0.5">
              Submit a deactivation request. Clinical records are retained per institutional policy.
            </p>
          </div>
        </button>
      </div>

      {deactivateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full space-y-4 border border-slate-200">
            <h3 className="font-bold text-slate-800">Confirm Deactivation Request</h3>
            <p className="text-xs text-slate-500">
              This request will notify your care team. Clinical records may be retained per institutional and legal requirements.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeactivateModal(false)} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50">Cancel</button>
              <button onClick={() => { setDeactivateModal(false); alert("Deactivation request submitted."); }} className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold">Submit Request</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Main component ────────────────────────────────────────────────────────────

export const PatientSettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");

  const tabs: { id: SettingsTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: "profile", label: "Profile", icon: User },
    { id: "health", label: "Health Prefs", icon: Heart },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "privacy", label: "Privacy", icon: Shield },
    { id: "security", label: "Security", icon: Lock },
    { id: "accessibility", label: "Accessibility", icon: Accessibility },
    { id: "account", label: "Account", icon: Sliders },
  ];

  return (
    <div className="max-w-4xl mx-auto pb-16">
      {/* Page Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
          <Settings className="w-4.5 h-4.5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Settings</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage your personal information, preferences, privacy and account security.
          </p>
        </div>
      </div>

      {/* Tab nav — scrollable on mobile */}
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
        {activeTab === "profile" && <ProfileSection />}
        {activeTab === "health" && <HealthPreferencesSection />}
        {activeTab === "notifications" && <NotificationsSection />}
        {activeTab === "privacy" && <PrivacySection />}
        {activeTab === "security" && <SecuritySection />}
        {activeTab === "accessibility" && <AccessibilitySection />}
        {activeTab === "account" && <AccountActionsSection />}
      </div>
    </div>
  );
};
