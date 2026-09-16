import React, { useState, useEffect } from "react";
import { Send } from "lucide-react";
import { MessageService } from "../../services/message.service";
import type { Conversation, ChatMessage } from "../../types/patient-portal";
import { MedicalDisclaimer } from "../../components/patient/MedicalDisclaimer";

export const MessagesPage: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>(() => MessageService.getConversations());
  const [activeConvId, setActiveConvId] = useState<string>(() => MessageService.getConversations()[0]?.id || "conv-001");
  const [newMessage, setNewMessage] = useState("");

  const refreshMessages = () => {
    const list = MessageService.getConversations();
    setConversations(list);
  };

  useEffect(() => {
    refreshMessages();
    const handleUpdate = () => refreshMessages();
    window.addEventListener("patient-updated", handleUpdate);
    return () => window.removeEventListener("patient-updated", handleUpdate);
  }, []);

  const activeConv = conversations.find(c => c.id === activeConvId) || conversations[0];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConv) return;

    MessageService.sendMessage({
      conversationId: activeConv.id,
      patientId: activeConv.patientId || "patient-001",
      senderId: "patient-001",
      senderName: "Meera Sharma",
      senderRole: "Patient",
      content: newMessage.trim()
    });

    setNewMessage("");
    refreshMessages();
  };

  return (
    <div className="space-y-6">
      {/* Emergency Disclaimer Banner */}
      <MedicalDisclaimer variant="emergency" />

      {/* Main Messaging Interface */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-xs grid grid-cols-1 md:grid-cols-12 min-h-[500px] overflow-hidden">
        {/* Left Conversation List */}
        <div className="md:col-span-4 border-r border-slate-100 p-4 space-y-3 bg-slate-50/40">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-2">Care Team Messages</h3>

          <div className="space-y-2">
            {conversations.map((c) => (
              <div
                key={c.id}
                onClick={() => setActiveConvId(c.id)}
                className={`p-3 rounded-xl cursor-pointer transition-all border ${
                  activeConvId === c.id
                    ? "bg-white border-primary/30 shadow-2xs"
                    : "border-transparent hover:bg-white/80"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-800">{c.participantName}</span>
                  <span className="text-[10px] text-slate-400">{new Date(c.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <p className="text-xs text-slate-500 truncate font-medium">{c.lastMessage}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-teal-50 text-teal-700">
                    {c.participantRole}
                  </span>
                  {c.unreadCount > 0 && (
                    <span className="w-4 h-4 bg-primary text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                      {c.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Active Chat Thread */}
        <div className="md:col-span-8 flex flex-col justify-between p-4 bg-white">
          {/* Chat Header */}
          <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                {activeConv.participantInitials}
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-800">{activeConv.participantName}</h4>
                <span className="text-[10px] text-slate-400 font-semibold">{activeConv.participantRole} • Usually responds within 24h</span>
              </div>
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 py-4 space-y-3 overflow-y-auto max-h-[360px]">
            {activeConv.messages.map((m) => {
              const isPatient = m.senderRole === "Patient";
              return (
                <div
                  key={m.id}
                  className={`flex ${isPatient ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-md p-3.5 rounded-2xl text-xs space-y-1 ${
                    isPatient
                      ? "bg-primary text-white rounded-br-none"
                      : "bg-slate-100 text-slate-800 rounded-bl-none font-medium"
                  }`}>
                    <p className="leading-relaxed">{m.content}</p>
                    <span className={`text-[9px] block text-right ${isPatient ? "text-emerald-200" : "text-slate-400"}`}>
                      {new Date(m.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Message Input Box */}
          <form onSubmit={handleSendMessage} className="pt-3 border-t border-slate-100 flex gap-2">
            <input
              type="text"
              placeholder="Type your message to care team..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-primary/20"
            />
            <button
              type="submit"
              className="px-4 py-2.5 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary-hover transition-colors flex items-center gap-1.5"
            >
              <Send className="w-4 h-4" /> Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
