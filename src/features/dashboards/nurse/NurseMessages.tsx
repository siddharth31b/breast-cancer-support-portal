import React, { useState } from "react";
import { Send } from "lucide-react";
import { NurseService, type NurseMessage } from "../../../services/nurse.service";

export const NurseMessages: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<"Doctors" | "Patients" | "Care Team">("Doctors");
  const [messages, setMessages] = useState<NurseMessage[]>(NurseService.getMessages());
  const [newText, setNewText] = useState("");
  const [isUrgentMsg, setIsUrgentMsg] = useState(false);
  const [attachedPatient, setAttachedPatient] = useState("Suman Deshmukh (BC-9041)");

  const filtered = messages.filter((m) => m.category === activeCategory);

  const handleSend = () => {
    if (!newText.trim()) return;
    NurseService.sendMessage({
      senderId: "nurse-1",
      senderName: "Sister Lakshmi",
      senderRole: "Nurse",
      recipientId: "doc-1",
      recipientName: activeCategory === "Doctors" ? "Dr. Sarah Iyer" : activeCategory === "Patients" ? "Suman Deshmukh" : "Care Team",
      category: activeCategory,
      content: newText,
      patientName: attachedPatient,
      isUrgent: isUrgentMsg,
    });
    setMessages(NurseService.getMessages());
    setNewText("");
    setIsUrgentMsg(false);
  };

  return (
    <div className="space-y-6 text-left max-w-7xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/60 pb-5">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">
            Care Coordination Messages
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Communicate with doctors, patients and multidisciplinary care team members.
          </p>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex border-b border-slate-200 gap-2">
        {(["Doctors", "Patients", "Care Team"] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-5 py-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer ${
              activeCategory === cat ? "border-primary text-primary" : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Messaging Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs">
        {/* Messages List Column */}
        <div className="md:col-span-1 border-r border-slate-100 pr-4 space-y-3">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Threads ({filtered.length})</p>
          <div className="space-y-2">
            {filtered.map((m) => (
              <div key={m.id} className="p-3 bg-slate-50 border border-slate-100 hover:border-primary/20 rounded-xl space-y-1 text-xs cursor-pointer">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-800">{m.senderName}</span>
                  <span className="text-[10px] text-slate-400">{m.timestamp}</span>
                </div>
                <p className="text-[11px] text-slate-600 truncate">{m.content}</p>
                {m.patientName && (
                  <span className="text-[9.5px] font-bold text-primary bg-primary/5 px-2 py-0.5 rounded-full inline-block">
                    Ref: {m.patientName}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Message Input & Thread Column */}
        <div className="md:col-span-2 space-y-5 flex flex-col justify-between">
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filtered.map((m) => (
              <div key={m.id} className={`p-4 rounded-2xl border text-xs space-y-1 ${
                m.senderRole === "Nurse" ? "bg-teal-50/50 border-teal-100 ml-8" : "bg-slate-50 border-slate-100 mr-8"
              }`}>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-800">{m.senderName} ({m.senderRole})</span>
                  <span className="text-[10px] text-slate-400">{m.timestamp}</span>
                </div>
                <p className="text-slate-700 leading-relaxed">{m.content}</p>
                {m.patientName && <p className="text-[10px] font-semibold text-primary">Attached Patient: {m.patientName}</p>}
              </div>
            ))}
          </div>

          {/* New Message Composer */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Link Patient Record:</span>
              <select
                value={attachedPatient}
                onChange={(e) => setAttachedPatient(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-700"
              >
                <option value="Suman Deshmukh (BC-9041)">Suman Deshmukh (BC-9041)</option>
                <option value="Kiran Rao (BC-7812)">Kiran Rao (BC-7812)</option>
                <option value="Meera Sharma (demo-patient)">Meera Sharma (demo-patient)</option>
              </select>

              <label className="flex items-center gap-1.5 ml-auto cursor-pointer">
                <input type="checkbox" checked={isUrgentMsg} onChange={(e) => setIsUrgentMsg(e.target.checked)} />
                <span className="text-[11px] font-bold text-red-600">Mark Urgent</span>
              </label>
            </div>

            <div className="flex gap-2">
              <textarea
                rows={2}
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                placeholder="Type coordination message... (nurses do not provide medical diagnosis via chat)"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              />
              <button
                onClick={handleSend}
                disabled={!newText.trim()}
                className="px-5 py-2.5 bg-primary hover:bg-[#004D46] disabled:opacity-40 text-white rounded-xl font-bold text-xs shrink-0 flex items-center gap-1"
              >
                <Send className="w-4 h-4" /> Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
