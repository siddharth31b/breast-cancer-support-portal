"use client";

import { useRouter } from "next/navigation";
import React from "react";

import { HelpCircle, ArrowLeft, Home } from "lucide-react";
import { useAuth } from "../features/auth/AuthContext";

export const NotFoundPage: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();

  const getDashboardRedirect = () => {
    if (!user) return "/";
    switch (user.role) {
      case "PATIENT": return "/patient/dashboard";
      case "DOCTOR": return "/doctor/dashboard";
      case "RADIOLOGIST": return "/radiologist/dashboard";
      case "HOSPITAL_ADMIN": return "/hospital/dashboard";
      case "RESEARCHER": return "/research/dashboard";
      case "COMMUNITY_HEALTH_WORKER": return "/field/dashboard";
      case "SUPER_ADMIN": return "/admin/dashboard";
      default: return "/";
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-background-app">
      <div className="w-full max-w-md p-8 text-center bg-white border border-slate-100 shadow-sm rounded-2xl">
        <div className="flex items-center justify-center w-16 h-16 mx-auto bg-slate-50 text-slate-400 rounded-full mb-6">
          <HelpCircle className="w-8 h-8" />
        </div>
        
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight mb-2">
          Page Not Found
        </h1>
        
        <p className="text-slate-600 text-sm mb-8 leading-relaxed">
          The page you are looking for does not exist or has been moved.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => router.back()}
            className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors focus-ring cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
          
          <button
            onClick={() => router.push(getDashboardRedirect())}
            className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-lg transition-colors focus-ring cursor-pointer"
          >
            <Home className="w-4 h-4" />
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
};
