"use client";

import React from "react";

export const AuthLayout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#FAFBFD] text-slate-800 antialiased selection:bg-teal-600 selection:text-white">
      {children}
    </div>
  );
};
