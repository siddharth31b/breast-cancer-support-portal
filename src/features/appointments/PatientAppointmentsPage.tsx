"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Clock, CheckCircle, AlertCircle, CalendarDays, Plus, ArrowLeft } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { PatientService } from "../../services/patient.service";
import type { PatientRecord } from "../../types/questionnaire";

export const PatientAppointmentsPage: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [patientRecord, setPatientRecord] = useState<PatientRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const loadPatient = async () => {
    if (user) {
      const record = await PatientService.getPatient(user.id);
      setPatientRecord(record);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadPatient();

    const handleUpdate = () => {
      loadPatient();
    };

    window.addEventListener("patient-updated", handleUpdate);

    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel("breastcare-sync");
      channel.onmessage = (event) => {
        if (event.data?.type === "patient-updated") {
          loadPatient();
        }
      };
    } catch (e) {
      console.error("Failed to init BroadcastChannel in PatientAppointmentsPage", e);
    }

    return () => {
      window.removeEventListener("patient-updated", handleUpdate);
      if (channel) {
        channel.close();
      }
    };
  }, [user?.id]);

  const handleRequestAppointment = async (dateStr: string) => {
    if (!patientRecord || !user) return;

    const updatedJourney = {
      ...patientRecord.clinicalJourney,
      assessmentSubmitted: patientRecord.clinicalJourney?.assessmentSubmitted ?? false,
      reportsUploaded: patientRecord.clinicalJourney?.reportsUploaded ?? false,
      aiAnalysisStatus: patientRecord.clinicalJourney?.aiAnalysisStatus ?? "PENDING",
      radiologyStatus: patientRecord.clinicalJourney?.radiologyStatus ?? "PENDING",
      doctorReviewStatus: patientRecord.clinicalJourney?.doctorReviewStatus ?? "AWAITING_REVIEW",
      appointmentStatus: "REQUESTED" as const,
      appointmentDate: dateStr,
      waitingTime: patientRecord.clinicalJourney?.waitingTime ?? "0 hrs"
    };

    const updatedRecord: PatientRecord = {
      ...patientRecord,
      clinicalJourney: updatedJourney
    };

    await PatientService.updatePatientRecord(updatedRecord);
    
    // Notify doctor
    await PatientService.addNotification({
      patientId: user.id,
      patientName: patientRecord.name,
      title: "New Appointment Requested",
      description: `${patientRecord.name} requested an appointment for ${dateStr}.`,
      category: "Appointments"
    });

    setSuccessMessage(`Appointment request for ${dateStr} sent! Waiting for confirmation.`);
    setSelectedDate("");
    loadPatient();

    setTimeout(() => {
      setSuccessMessage("");
    }, 5000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const appointmentStatus = patientRecord?.clinicalJourney?.appointmentStatus || "NOT_SCHEDULED";
  const appointmentDate = patientRecord?.clinicalJourney?.appointmentDate;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">Consultation Appointments</h1>
          <p className="text-xs text-slate-400 mt-1">Book and manage your clinical consultations with your lead oncologist.</p>
        </div>
        <button
          onClick={() => router.push("/patient/dashboard")}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
        </button>
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-250 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2 animate-fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Active / Requested Appointments Card */}
        <div className="md:col-span-2 space-y-4">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs text-left">
            <h3 className="font-extrabold text-slate-800 text-sm border-b border-slate-100 pb-3">Upcoming Consultation</h3>
            
            {appointmentStatus === "REQUESTED" ? (
              <div className="mt-4 p-4 border border-amber-200 bg-amber-50/30 rounded-xl flex items-start gap-3">
                <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-bold text-slate-800">Pending Doctor Confirmation</p>
                  <p className="text-slate-500 mt-1">You requested an appointment on:</p>
                  <p className="font-extrabold text-slate-800 text-sm mt-1">{appointmentDate}</p>
                  <p className="text-slate-400 mt-2">Dr. Sarah Iyer will review your case data and confirm the timeslot shortly.</p>
                </div>
              </div>
            ) : appointmentStatus === "SCHEDULED" || appointmentStatus === "CONFIRMED" ? (
              <div className="mt-4 p-4 border border-primary/20 bg-primary/5 rounded-xl flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-bold text-primary">Appointment Confirmed</p>
                  <p className="text-slate-500 mt-1">Your next scheduled consultation:</p>
                  <p className="font-extrabold text-slate-800 text-sm mt-1">{appointmentDate || "24/07/2026 at 11:30 AM"}</p>
                  <p className="text-slate-400 mt-2">Lead Oncologist: <strong>Dr. Sarah Iyer</strong></p>
                  <p className="text-slate-400 mt-0.5">Location: Main Oncology Wing (In-Person)</p>
                </div>
              </div>
            ) : (
              <div className="mt-4 p-6 border border-dashed border-slate-200 rounded-xl text-center">
                <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-500">No upcoming consultations booked</p>
                <p className="text-[11px] text-slate-400 mt-1">Please use the schedule section to book an appointment with your oncology care team.</p>
              </div>
            )}
          </div>

          {/* Past Consultation History */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs text-left">
            <h3 className="font-extrabold text-slate-800 text-sm border-b border-slate-100 pb-3">Consultation History</h3>
            <div className="divide-y divide-slate-100">
              {[
                { date: "18 January 2026", type: "Bilateral Scan Cycle Review", doctor: "Dr. Sarah Iyer", mode: "In-Person", status: "Completed" },
                { date: "12 November 2025", type: "Initial Screening Triage", doctor: "Dr. Sarah Iyer", mode: "Teleconsult", status: "Completed" }
              ].map((h, i) => (
                <div key={i} className="py-3 flex justify-between items-center text-xs">
                  <div>
                    <p className="font-bold text-slate-800">{h.type}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Doctor: {h.doctor} &bull; {h.mode}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-700">{h.date}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 bg-slate-150 text-slate-650 rounded text-[9px] font-bold uppercase">{h.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Booking Panel */}
        <div className="space-y-4">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs text-left">
            <h3 className="font-extrabold text-slate-800 text-sm border-b border-slate-100 pb-3">Request New Slot</h3>
            
            <div className="mt-4 space-y-4">
              <p className="text-xs text-slate-500 leading-relaxed">Select a quick date suggestion or pick a custom date below.</p>
              
              <div className="grid grid-cols-2 gap-2">
                {["Nov 20, 2026", "Nov 22, 2026", "Nov 25, 2026", "Nov 26, 2026"].map((d, i) => (
                  <button 
                    key={i} 
                    onClick={() => handleRequestAppointment(d)}
                    className="py-2.5 rounded-xl border border-slate-200 hover:border-primary/40 hover:text-primary transition-all text-xs font-bold text-slate-600 bg-slate-50/20 cursor-pointer text-center"
                  >
                    {d}
                  </button>
                ))}
              </div>

              <div className="space-y-2 mt-4 pt-4 border-t border-slate-100">
                <label className="text-xs font-bold text-slate-700 block">Choose custom date:</label>
                <input 
                  type="date"
                  min={new Date().toISOString().split("T")[0]}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all text-slate-600 font-semibold"
                />
                <button
                  onClick={() => selectedDate && handleRequestAppointment(selectedDate)}
                  disabled={!selectedDate}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 mt-2 shadow-xs cursor-pointer ${
                    selectedDate 
                      ? "bg-primary hover:bg-[#004D46] text-white" 
                      : "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                  }`}
                >
                  <Plus className="w-4 h-4" /> Request Appointment
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
