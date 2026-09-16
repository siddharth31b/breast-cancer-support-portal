"use client";

import Link from "next/link";
import React, { useState } from "react";
import { 
  Calendar as CalendarIcon, 
  Video, 
  MapPin, 
  Plus, 
  CheckCircle2, 
  MessageSquare
} from "lucide-react";
import { mockAppointments } from "../../mocks/patient-portal.mock";
import type { Appointment } from "../../types/patient-portal";
import { StatusBadge } from "../../components/patient/StatusBadge";


export const AppointmentsList: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments);
  const [activeTab, setActiveTab] = useState<"Upcoming" | "Past" | "All">("Upcoming");
  const [showBookingModal, setShowBookingModal] = useState(false);

  // New Booking Form State
  const [doctor, setDoctor] = useState("Dr. Sarah Iyer");
  const [date, setDate] = useState("2025-11-25");
  const [time, setTime] = useState("10:00");
  const [type, setType] = useState<"Video" | "In-Person">("Video");
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const handleBookSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newApt: Appointment = {
      id: `apt-${Date.now()}`,
      patientId: "patient-001",
      doctorName: doctor,
      doctorSpecialty: doctor.includes("Iyer") ? "Lead Oncologist" : "Radiologist",
      doctorInitials: doctor.includes("Iyer") ? "SI" : "AM",
      date,
      time,
      durationMin: 30,
      consultationType: type,
      status: "Requested",
      preparationNotes: "Please keep all recent screening reports accessible.",
    };

    setAppointments(prev => [newApt, ...prev]);
    setBookingSuccess(true);
    setTimeout(() => {
      setBookingSuccess(false);
      setShowBookingModal(false);
    }, 1500);
  };

  const filteredAppointments = appointments.filter(a => {
    const isUpcoming = a.status === "Confirmed" || a.status === "Requested" || a.status === "Rescheduled";
    if (activeTab === "Upcoming") return isUpcoming;
    if (activeTab === "Past") return a.status === "Completed" || a.status === "Cancelled";
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Action Header Bar */}
      <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-xs flex justify-between items-center flex-wrap gap-4">
        <div className="flex gap-2">
          {(["Upcoming", "Past", "All"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === tab ? "bg-primary text-white" : "text-slate-500 hover:bg-slate-100"
              }`}
            >
              {tab} Appointments
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowBookingModal(true)}
          className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl shadow-xs hover:bg-primary-hover transition-colors flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Book New Consultation
        </button>
      </div>

      {/* Appointments List */}
      <div className="space-y-4">
        {filteredAppointments.map((apt) => {
          const isConfirmed = apt.status === "Confirmed";
          const canJoin = apt.canJoinAt && new Date() >= new Date(apt.canJoinAt);

          return (
            <div key={apt.id} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-slate-200 transition-all">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 border border-teal-200 flex items-center justify-center font-black text-sm shrink-0">
                  {apt.doctorInitials}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-black text-slate-800">{apt.doctorName}</h3>
                    <StatusBadge status={apt.status} />
                  </div>
                  <p className="text-xs text-slate-500 font-medium">{apt.doctorSpecialty}</p>

                  <div className="flex flex-wrap gap-4 text-xs text-slate-600 pt-1">
                    <span className="flex items-center gap-1">
                      <CalendarIcon className="w-3.5 h-3.5 text-slate-400" /> {apt.date} at {apt.time}
                    </span>
                    <span className="flex items-center gap-1">
                      {apt.consultationType === "Video" ? (
                        <Video className="w-3.5 h-3.5 text-blue-500" />
                      ) : (
                        <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                      )}
                      {apt.consultationType} Consultation
                    </span>
                  </div>

                  {apt.preparationNotes && (
                    <p className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded-lg mt-2 font-medium">
                      📋 <strong>Preparation:</strong> {apt.preparationNotes}
                    </p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100 justify-end">
                {apt.consultationType === "Video" && isConfirmed && (
                  <button
                    disabled={!canJoin}
                    onClick={() => window.open(apt.videoLink, "_blank")}
                    className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all ${
                      canJoin
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs animate-pulse cursor-pointer"
                        : "bg-slate-100 text-slate-400 cursor-not-allowed"
                    }`}
                  >
                    <Video className="w-4 h-4" />
                    {canJoin ? "Join Video Call Now" : "Join (Available 15m before)"}
                  </button>
                )}

                <Link href="/patient/connect/messages"
                  className="px-3.5 py-2 border border-slate-200 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-1"
                >
                  <MessageSquare className="w-3.5 h-3.5" /> Message
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="text-base font-black text-slate-800">Book Specialist Consultation</h3>

            {bookingSuccess ? (
              <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl text-center text-xs font-bold space-y-1">
                <CheckCircle2 className="w-6 h-6 mx-auto text-emerald-600" />
                <p>Appointment Request Submitted Successfully!</p>
              </div>
            ) : (
              <form onSubmit={handleBookSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Select Doctor / Specialist</label>
                  <select
                    value={doctor}
                    onChange={(e) => setDoctor(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:outline-hidden"
                  >
                    <option value="Dr. Sarah Iyer">Dr. Sarah Iyer (Lead Oncologist)</option>
                    <option value="Dr. Arun Mehta">Dr. Arun Mehta (Radiologist)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Preferred Date</label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Time Slot</label>
                    <select
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:outline-hidden"
                    >
                      <option value="10:00">10:00 AM</option>
                      <option value="11:30">11:30 AM</option>
                      <option value="15:00">03:00 PM</option>
                      <option value="16:30">04:30 PM</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Consultation Type</label>
                  <div className="flex gap-3">
                    <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                      <input
                        type="radio"
                        name="type"
                        value="Video"
                        checked={type === "Video"}
                        onChange={() => setType("Video")}
                      />
                      Video Telehealth
                    </label>
                    <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                      <input
                        type="radio"
                        name="type"
                        value="In-Person"
                        checked={type === "In-Person"}
                        onChange={() => setType("In-Person")}
                      />
                      In-Person Visit
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowBookingModal(false)}
                    className="px-4 py-2 border border-slate-200 text-slate-600 font-bold text-xs rounded-xl hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary text-white font-bold text-xs rounded-xl hover:bg-primary-hover"
                  >
                    Confirm Request
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
