"use client";

import { Suspense } from "react";
import { PatientIntakeRegistry } from "@/features/dashboards/PatientIntakeRegistry";

export default function Page() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-3 text-slate-500 text-xs font-semibold animate-pulse">Loading Patient Intake Registry...</p>
      </div>
    }>
      <PatientIntakeRegistry />
    </Suspense>
  );
}
