import React from "react";

interface InstitutionalLogosProps {
  variant?: "header" | "footer" | "auth" | "compact" | "topbar";
  className?: string;
  showCharakDtText?: boolean;
}

export const InstitutionalLogos: React.FC<InstitutionalLogosProps> = ({
  variant = "header",
  className = "",
  showCharakDtText = true,
}) => {
  if (variant === "topbar") {
    return (
      <div className={`flex items-center gap-2 sm:gap-3 shrink-0 ${className}`}>
        {/* DRISHTI CPS Logo */}
        <img
          src="/assets/logos/drishti-cps-logo.png"
          alt="DRISHTI CPS Foundation"
          title="IITI DRISHTI CPS Foundation"
          className="h-7 sm:h-8 w-auto object-contain shrink-0"
        />

        {/* CharakDT Platform Badge */}
        <div className="text-left hidden lg:block border-l border-slate-200 pl-2">
          <div className="flex items-baseline gap-0.5">
            <span className="text-xs font-black tracking-tight text-slate-900 font-sans">
              charak<span className="text-rose-600">dt</span>
            </span>
            <span className="text-[6.5px] font-bold uppercase tracking-widest text-slate-400">
              PLATFORM
            </span>
          </div>
          <span className="text-[6px] uppercase font-bold tracking-wider text-slate-500 block leading-tight">
            DIGITAL TWIN
          </span>
        </div>

        <span className="h-4 w-px bg-slate-200 hidden sm:block" />

        {/* IIT Indore Logo */}
        <img
          src="/assets/logos/iit-indore-logo.png"
          alt="IIT Indore"
          title="Indian Institute of Technology Indore"
          className="h-7 sm:h-8 w-auto object-contain shrink-0 hover:scale-105 transition-transform"
        />

        {/* AIIMS Bhopal Logo */}
        <img
          src="/assets/logos/aiims-logo.png"
          alt="AIIMS Bhopal"
          title="All India Institute of Medical Sciences Bhopal"
          className="h-7 sm:h-8 w-auto object-contain shrink-0 hover:scale-105 transition-transform"
        />
      </div>
    );
  }

  if (variant === "auth") {
    return (
      <div className={`flex items-center justify-center gap-3 sm:gap-4 ${className}`}>
        {/* DRISHTI CPS */}
        <img
          src="/assets/logos/drishti-cps-logo.png"
          alt="DRISHTI CPS Foundation"
          title="IITI DRISHTI CPS Foundation"
          className="h-10 sm:h-11 w-auto object-contain"
        />

        {/* CharakDT */}
        <div className="text-left px-1.5 py-1 bg-slate-50 border border-slate-200 rounded-lg">
          <div className="flex items-baseline gap-1">
            <span className="text-sm font-black tracking-tight text-slate-900 font-sans">
              charak<span className="text-rose-600">dt</span>
            </span>
            <span className="text-[7px] font-bold uppercase tracking-widest text-slate-400">
              PLATFORM
            </span>
          </div>
          <span className="text-[6.5px] uppercase font-bold tracking-wider text-slate-500 block">
            UNIFIED DIGITAL TWIN
          </span>
        </div>

        {/* IIT Indore */}
        <img
          src="/assets/logos/iit-indore-logo.png"
          alt="IIT Indore"
          title="Indian Institute of Technology Indore"
          className="h-9 sm:h-10 w-auto object-contain"
        />

        {/* AIIMS Bhopal */}
        <img
          src="/assets/logos/aiims-logo.png"
          alt="AIIMS Bhopal"
          title="All India Institute of Medical Sciences Bhopal"
          className="h-9 sm:h-10 w-auto object-contain"
        />
      </div>
    );
  }

  if (variant === "footer") {
    return (
      <div className={`flex flex-wrap items-center gap-4 ${className}`}>
        <img
          src="/assets/logos/drishti-cps-logo.png"
          alt="DRISHTI CPS Foundation"
          className="h-8 w-auto object-contain bg-white/10 p-1 rounded-md"
        />
        <div className="text-left bg-white/5 border border-white/10 px-2 py-1 rounded-md">
          <div className="flex items-baseline gap-1">
            <span className="text-xs font-black tracking-tight text-white font-sans">
              charak<span className="text-rose-400">dt</span>
            </span>
            <span className="text-[6.5px] font-bold uppercase tracking-widest text-slate-400">
              PLATFORM
            </span>
          </div>
          <span className="text-[6px] uppercase font-bold tracking-wider text-slate-400 block">
            UNIFIED DIGITAL TWIN
          </span>
        </div>
        <img
          src="/assets/logos/iit-indore-logo.png"
          alt="IIT Indore"
          className="h-8 w-auto object-contain bg-white/10 p-1 rounded-md"
        />
        <img
          src="/assets/logos/aiims-logo.png"
          alt="AIIMS Bhopal"
          className="h-8 w-auto object-contain bg-white/10 p-1 rounded-md"
        />
      </div>
    );
  }

  // Default: Header / Navbar Variant
  return (
    <div className={`flex items-center gap-2.5 sm:gap-3.5 shrink-0 ${className}`}>
      {/* DRISHTI CPS */}
      <img
        src="/assets/logos/drishti-cps-logo.png"
        alt="DRISHTI CPS Foundation"
        title="IITI DRISHTI CPS Foundation"
        className="h-9 w-auto object-contain shrink-0"
      />

      {/* CharakDT */}
      {showCharakDtText && (
        <div className="text-left hidden lg:block border-l border-slate-200 pl-2">
          <div className="flex items-baseline gap-1">
            <span className="text-sm font-black tracking-tight text-slate-900 font-sans">
              charak<span className="text-rose-600">dt</span>
            </span>
            <span className="text-[7.5px] font-bold uppercase tracking-widest text-slate-400">
              PLATFORM
            </span>
          </div>
          <span className="text-[7px] uppercase font-bold tracking-wider text-slate-500 block">
            UNIFIED DIGITAL TWIN
          </span>
        </div>
      )}

      <span className="h-5 w-px bg-slate-200 hidden md:block" />

      {/* IIT Indore */}
      <img
        src="/assets/logos/iit-indore-logo.png"
        alt="IIT Indore"
        title="Indian Institute of Technology Indore"
        className="h-9 w-auto object-contain shrink-0 hover:scale-105 transition-transform"
      />

      {/* AIIMS Bhopal */}
      <img
        src="/assets/logos/aiims-logo.png"
        alt="AIIMS Bhopal"
        title="All India Institute of Medical Sciences Bhopal"
        className="h-9 w-auto object-contain shrink-0 hover:scale-105 transition-transform"
      />
    </div>
  );
};
