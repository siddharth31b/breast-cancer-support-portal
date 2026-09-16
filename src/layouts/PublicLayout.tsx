"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Brain, Globe, User, Menu, X, Check } from "lucide-react";
import { useAuth } from "../features/auth/AuthContext";
import { InstitutionalLogos } from "../components/InstitutionalLogos";

export const PublicLayout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState("English");

  const getDashboardRedirect = () => {
    if (!user) return "/login";
    switch (user.role) {
      case "PATIENT": return "/patient/dashboard";
      case "DOCTOR": return "/doctor/dashboard";
      case "RADIOLOGIST": return "/radiologist/dashboard";
      case "HOSPITAL_ADMIN": return "/hospital/dashboard";
      case "RESEARCHER": return "/research/dashboard";
      case "COMMUNITY_HEALTH_WORKER": return "/field/dashboard";
      case "SUPER_ADMIN": return "/admin/dashboard";
      default: return "/login";
    }
  };

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Body scroll lock when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);

  // Escape key listener for mobile menu & language modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileMenuOpen(false);
        setLangMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const navItems = [
    { label: "Home", path: "/" },
    { label: "Research", path: "/research" },
    { label: "Diagnostics", path: "/diagnostics" },
    { label: "Platform Spread", path: "/spread" },
    { label: "About IITI DRISHTI CPS", path: "/about-drishti-cps" },
  ];

  const languages = ["English", "हिंदी (Hindi)", "मराठी (Marathi)", "বাংলা (Bengali)"];

  // The standalone reach and spread maps have their own dedicated institutional header matching CharakDT
  const isReachPage = pathname === "/platform-reach" || pathname === "/reach" || pathname === "/spread";
  if (isReachPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#FAFBFD] text-slate-800">
      
      {/* Header Navigation */}
      <header className="bg-[#FAFBFD] border-b border-slate-100 px-4 sm:px-6 lg:px-8 py-3.5 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Logo brand & Institutional Logos */}
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 focus-ring rounded-lg group">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-primary to-accent-teal flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
                <Brain className="w-5 h-5" />
              </div>
              <div className="text-left leading-tight">
                <span className="font-extrabold text-slate-900 text-base tracking-tight block">
                  NariSetu <span className="text-accent-teal">AI</span>
                </span>
              </div>
            </Link>

            <span className="h-6 w-px bg-slate-200 hidden sm:block" />

            <div className="hidden sm:block">
              <InstitutionalLogos variant="header" />
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav aria-label="Main Navigation" className="hidden md:flex items-center gap-8 text-xs font-bold">
            {navItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  aria-current={isActive ? "page" : undefined}
                  className={`transition-colors duration-200 focus-ring rounded-xs ${
                    isActive
                      ? "text-primary font-extrabold border-b-2 border-primary pb-0.5"
                      : "text-slate-500 hover:text-primary"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* User controls / Actions */}
          <div className="hidden md:flex items-center gap-4 text-slate-400">
            <button 
              onClick={() => router.push(user ? getDashboardRedirect() : "/login")}
              className="hover:text-primary transition-colors flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200 shadow-2xs focus-ring"
              title="Select Role Portal"
            >
              <User className="w-4 h-4 text-primary" />
              <span>{user ? "Portal" : "Portal / Sign In"}</span>
            </button>

            {/* Language dropdown button */}
            <div className="relative">
              <button
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="hover:text-primary transition-colors p-2 rounded-xl border border-slate-200 bg-white text-slate-600 focus-ring flex items-center gap-1 text-xs font-semibold"
                title="Select Language"
                aria-expanded={langMenuOpen}
              >
                <Globe className="w-4 h-4 text-slate-500" />
                <span className="text-[10px] font-bold uppercase">{selectedLang.slice(0, 2)}</span>
              </button>

              {langMenuOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50 animate-scale-in">
                  <p className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Select Language</p>
                  {languages.map((lang) => (
                    <button
                      key={lang}
                      onClick={() => {
                        setSelectedLang(lang.split(" ")[0]);
                        setLangMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center justify-between font-medium"
                    >
                      <span>{lang}</span>
                      {selectedLang.startsWith(lang.split(" ")[0]) && <Check className="w-3.5 h-3.5 text-primary" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl border border-slate-200 bg-white text-slate-700 focus-ring"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-x-0 top-[73px] bottom-0 bg-slate-900/40 backdrop-blur-xs z-40">
            <div className="bg-white border-b border-slate-200 px-6 py-6 space-y-6 shadow-2xl animate-fade-down">
              <nav aria-label="Mobile Navigation" className="flex flex-col gap-4 text-sm font-bold">
                {navItems.map((item) => {
                  const isActive = pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      aria-current={isActive ? "page" : undefined}
                      className={`py-2 px-3 rounded-xl transition-colors ${
                        isActive
                          ? "bg-primary/10 text-primary font-extrabold"
                          : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>

              <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    router.push(user ? getDashboardRedirect() : "/login");
                  }}
                  className="w-full py-3 bg-primary text-white font-semibold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-md"
                >
                  <User className="w-4 h-4" />
                  <span>{user ? "Enter Portal" : "Sign In to Portal"}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Page Area */}
      <main className="flex-1">
        {children}
      </main>

      {/* Enterprise Healthcare Footer */}
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 py-12 px-8" aria-label="Enterprise Healthcare Footer">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Main Top Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-8 border-b border-slate-800/80">
            
            {/* Branding Column */}
            <div className="md:col-span-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-white shadow-xs">
                  <Brain className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-extrabold text-white text-base tracking-tight block">NariSetu AI</span>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">IIT Indore · Drishti CPS Initiative</span>
                </div>
              </div>
              <p className="text-xs text-slate-400 font-normal leading-relaxed max-w-sm">
                AI-assisted breast healthcare research platform providing explainable clinical decision support to empower clinicians and improve patient outcomes.
              </p>
              
              {/* Partner Logos */}
              <div className="pt-2">
                <InstitutionalLogos variant="footer" />
              </div>
            </div>

            {/* Structured Navigation Groups */}
            <div className="md:col-span-7 grid grid-cols-3 gap-6 text-xs" aria-label="Footer Navigation">
              
              {/* Group 1: Platform */}
              <div className="space-y-2.5">
                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Platform</p>
                <ul className="space-y-2 font-medium text-slate-400">
                  <li><Link href="/" className="hover:text-white transition-colors duration-200 focus-ring rounded-xs">Privacy Policy</Link></li>
                  <li><Link href="/" className="hover:text-white transition-colors duration-200 focus-ring rounded-xs">Terms of Service</Link></li>
                  <li><Link href="/" className="hover:text-white transition-colors duration-200 focus-ring rounded-xs">Accessibility</Link></li>
                </ul>
              </div>

              {/* Group 2: Research */}
              <div className="space-y-2.5">
                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Research</p>
                <ul className="space-y-2 font-medium text-slate-400">
                  <li><Link href="/" className="hover:text-white transition-colors duration-200 focus-ring rounded-xs">Publications</Link></li>
                  <li><Link href="/" className="hover:text-white transition-colors duration-200 focus-ring rounded-xs">Clinical Disclaimer</Link></li>
                </ul>
              </div>

              {/* Group 3: Support */}
              <div className="space-y-2.5">
                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Support</p>
                <ul className="space-y-2 font-medium text-slate-400">
                  <li><Link href="/" className="hover:text-white transition-colors duration-200 focus-ring rounded-xs">Contact Support</Link></li>
                  <li><Link href="/" className="hover:text-white transition-colors duration-200 focus-ring rounded-xs">Compliance</Link></li>
                </ul>
              </div>

            </div>
          </div>

          {/* Clinical Disclaimer Banner */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 leading-relaxed font-medium">
            <span className="font-bold text-slate-300">Clinical Notice: </span>
            NariSetu AI provides explainable decision support to assist qualified medical professionals. Artificial intelligence predictions do not constitute a definitive medical diagnosis. Final diagnostic evaluation and care planning always remain with certified clinicians.
          </div>

          {/* Bottom Information Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500 font-medium">
            <p>© 2026 NariSetu AI · IIT Indore & Drishti CPS. All rights reserved.</p>
            <p className="text-slate-400">Explainable Clinical Decision Support Platform</p>
          </div>

        </div>
      </footer>

    </div>
  );
};
