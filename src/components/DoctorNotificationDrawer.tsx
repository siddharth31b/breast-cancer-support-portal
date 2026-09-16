import React, { useState, useEffect } from "react";
import { PatientService } from "../services/patient.service";
import type { DoctorNotification } from "../types/questionnaire";
import { X, Bell, ShieldAlert, FileText, Calendar, CheckCircle } from "lucide-react";

interface DoctorNotificationDrawerProps {
  onClose: () => void;
  onSelectPatient: (patientId: string) => void;
}

export const DoctorNotificationDrawer: React.FC<DoctorNotificationDrawerProps> = ({ 
  onClose, 
  onSelectPatient 
}) => {
  const [notifications, setNotifications] = useState<DoctorNotification[]>([]);
  const [activeTab, setActiveTab] = useState<string>("All");

  const loadNotifications = async () => {
    try {
      const list = await PatientService.getNotifications();
      setNotifications(list);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    await PatientService.markNotificationAsRead(id);
    loadNotifications();
  };

  const handleMarkAllRead = async () => {
    await PatientService.markAllNotificationsAsRead();
    loadNotifications();
  };

  const handleNotifClick = (notif: DoctorNotification) => {
    if (notif.patientId) {
      onSelectPatient(notif.patientId);
    }
    handleMarkAsRead(notif.id);
    onClose();
  };

  const categories = ["All", "Clinical", "Reports", "Appointments", "General"];
  
  const filtered = activeTab === "All" 
    ? notifications 
    : notifications.filter(n => n.category === activeTab);

  const getNotifIcon = (cat: string) => {
    switch (cat) {
      case "Clinical": return <ShieldAlert className="w-4 h-4 text-red-650" />;
      case "Reports": return <FileText className="w-4 h-4 text-primary" />;
      case "Appointments": return <Calendar className="w-4 h-4 text-blue-600" />;
      default: return <Bell className="w-4 h-4 text-slate-500" />;
    }
  };

  const getNotifStyle = (isRead: boolean, cat: string) => {
    if (isRead) return "bg-white border-slate-100 opacity-60";
    if (cat === "Clinical") return "bg-red-50/40 border-red-150";
    if (cat === "Reports") return "bg-teal-50/30 border-teal-150";
    return "bg-slate-50 border-slate-200";
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="flex-1 bg-black/45 backdrop-blur-xs" onClick={onClose} />
      
      {/* Panel Body */}
      <div className="w-full max-w-sm bg-white h-full shadow-2xl flex flex-col animate-slide-right text-slate-800">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-150/40 flex items-center justify-between shrink-0 bg-slate-50/50">
          <div>
            <h2 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
              <Bell className="w-4 h-4 text-[#005F56]" /> Clinician Alerts
            </h2>
            <p className="text-[10px] text-slate-400 mt-1">{unreadCount} unread notifications pending</p>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 hover:bg-slate-250 rounded-xl flex items-center justify-center text-slate-400 cursor-pointer min-h-[44px]"
            aria-label="Close notifications panel"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-1.5 px-6 py-3 border-b border-slate-100 overflow-x-auto shrink-0 scrollbar-none">
          {categories.map((c) => {
            const count = c === "All" ? notifications.length : notifications.filter(n => n.category === c).length;
            const isActive = activeTab === c;
            return (
              <button
                key={c}
                onClick={() => setActiveTab(c)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] font-bold whitespace-nowrap border transition-all cursor-pointer min-h-[32px]
                  ${isActive 
                    ? "bg-primary border-primary text-white" 
                    : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"}`}
              >
                {c}
                <span className={`text-[9px] px-1 rounded-full ${isActive ? "bg-white/20 text-white" : "bg-slate-200 text-slate-600"}`}>{count}</span>
              </button>
            );
          })}
        </div>

        {/* Notifications list */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3 scrollbar-thin bg-slate-50/20">
          {filtered.length > 0 ? (
            filtered.map((n) => (
              <div 
                key={n.id} 
                className={`p-4 rounded-xl border transition-all hover:shadow-xs flex items-start gap-3 cursor-pointer ${getNotifStyle(n.isRead, n.category)}`}
                onClick={() => handleNotifClick(n)}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-white border border-slate-100`}>
                  {getNotifIcon(n.category)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-1">
                    <p className={`text-xs text-slate-800 leading-snug font-bold ${n.isRead ? "font-semibold" : ""}`}>{n.title}</p>
                    {!n.isRead && (
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 mt-1" />
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1 leading-normal">{n.description}</p>
                  
                  <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-150/40">
                    <span className="text-[9px] text-slate-400 font-medium">{n.time}</span>
                    {!n.isRead && (
                      <button 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          handleMarkAsRead(n.id); 
                        }} 
                        className="text-[9px] font-bold text-primary hover:underline"
                      >
                        Mark Read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 space-y-2">
              <CheckCircle className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs text-slate-400 font-medium">All caught up! No notifications.</p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {unreadCount > 0 && (
          <div className="p-4 border-t border-slate-100 shrink-0 bg-slate-50">
            <button
              onClick={handleMarkAllRead}
              className="w-full py-2.5 bg-white border border-slate-250 text-slate-650 hover:bg-slate-100 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              Mark all as read
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
