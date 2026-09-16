"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import React, { useState, useEffect } from "react";

import { useAuth } from "../features/auth/AuthContext";
import { PatientService } from "../services/patient.service";
import { 
  Activity, 
  Menu, 
  X, 
  LogOut, 
  User as UserIcon, 
  Bell, 
  Search, 
  LayoutDashboard, 
  ClipboardList, 
  Calendar, 
  Heart, 
  FileText, 
  Users, 
  Shield, 
  HardDrive, 
  RefreshCw,
  Globe,
  Building,
  Check,
  Trash2,
  Eye,
  Stethoscope,
  MessageSquare,
  BarChart3,
  BookOpen,
  Settings,
  HelpCircle,
  Clock,
} from "lucide-react";

import { InstitutionalLogos } from "../components/InstitutionalLogos";

interface MenuItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const DashboardLayout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [notifications, setNotifications] = useState<any[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCat, setSelectedCat] = useState("All");

  const loadNotifications = async () => {
    try {
      if (user) {
        const all = await PatientService.getNotifications(user.id);
        setNotifications(all);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadNotifications();

    const handleUpdate = () => {
      loadNotifications();
    };

    window.addEventListener("notifications-updated", handleUpdate);
    return () => {
      window.removeEventListener("notifications-updated", handleUpdate);
    };
  }, [user?.id]);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  // Define sidebar menu options depending on role
  const getMenuItems = (): MenuItem[] => {
    switch (user.role) {
      case "PATIENT":
        return [
          { label: "Overview", path: "/patient/dashboard", icon: LayoutDashboard },
          { label: "Assessments", path: "/patient/risk-assessment", icon: ClipboardList },
          { label: "Appointments", path: "/patient/appointments", icon: Calendar },
          { label: "Reports", path: "/patient/screening/reports", icon: FileText },
          { label: "Reach Map", path: "/platform-reach", icon: Globe },
          { label: "Care Plan", path: "/patient/care/plan", icon: Heart },
          { label: "Messages", path: "/patient/connect/messages", icon: MessageSquare },
          { label: "Settings", path: "/patient/settings", icon: Settings },
        ];
      case "DOCTOR":
        return [
          { label: "Overview", path: "/doctor/dashboard", icon: LayoutDashboard },
          { label: "Case Queue", path: "/doctor/queue", icon: ClipboardList },
          { label: "Patients", path: "/doctor/patients", icon: Users },
          { label: "Intake Registry", path: "/doctor/intake-records", icon: FileText },
          { label: "Clinical Reviews", path: "/doctor/reviews", icon: Stethoscope },
          { label: "Imaging & Reports", path: "/doctor/imaging-reports", icon: Eye },
          { label: "Reach Map", path: "/platform-reach", icon: Globe },
          { label: "Appointments", path: "/doctor/appointments", icon: Calendar },
          { label: "Care Plans", path: "/doctor/care-plans", icon: Heart },
          { label: "Messages", path: "/doctor/messages", icon: MessageSquare },
          { label: "Tasks & Alerts", path: "/doctor/tasks", icon: Bell },
          { label: "Analytics", path: "/doctor/analytics", icon: BarChart3 },
          { label: "Clinical Resources", path: "/doctor/resources", icon: BookOpen },
          { label: "Settings", path: "/doctor/settings", icon: Settings },
        ];
      case "RADIOLOGIST":
        return [
          { label: "Dashboard", path: "/radiologist/dashboard", icon: LayoutDashboard },
          { label: "Imaging Queue", path: "/radiologist/queue", icon: ClipboardList },
          { label: "Platform Reach Map", path: "/platform-reach", icon: Globe },
          { label: "Workspace", path: "/radiologist/workspace", icon: Eye },
          { label: "Reports", path: "/radiologist/reports", icon: FileText },
          { label: "Help & Support", path: "/radiologist/help", icon: HelpCircle },
        ];
      case "HOSPITAL_ADMIN":
        return [
          { label: "Overview", path: "/hospital/dashboard", icon: LayoutDashboard },
          { label: "Platform Reach Map", path: "/platform-reach", icon: Globe },
          { label: "Staff", path: "/hospital/staff", icon: Users },
          { label: "Appointments", path: "/hospital/appointments", icon: Calendar },
          { label: "Escalations", path: "/hospital/escalations", icon: Bell }
        ];
      case "RESEARCHER":
        return [
          { label: "Overview", path: "/research/dashboard", icon: LayoutDashboard },
          { label: "Platform Reach Map", path: "/platform-reach", icon: Globe },
          { label: "Cohorts", path: "/research/cohorts", icon: Users },
          { label: "Model Performance", path: "/research/model-performance", icon: Shield }
        ];
      case "COMMUNITY_HEALTH_WORKER":
        return [
          { label: "Overview", path: "/field/dashboard", icon: LayoutDashboard },
          { label: "Platform Reach Map", path: "/platform-reach", icon: Globe },
          { label: "Register Patient", path: "/field/register-patient", icon: UserIcon },
          { label: "Referrals", path: "/field/referrals", icon: Heart },
          { label: "Sync", path: "/field/sync", icon: RefreshCw }
        ];
      case "BREAST_CARE_NURSE":
        return [
          { label: "Home", path: "/nurse", icon: LayoutDashboard },
          { label: "Patient Intake", path: "/nurse/intake", icon: ClipboardList },
          { label: "Platform Reach Map", path: "/platform-reach", icon: Globe },
          { label: "Patients", path: "/nurse/patients", icon: Users },
          { label: "Appointments", path: "/nurse/appointments", icon: Calendar },
          { label: "Follow-Ups", path: "/nurse/follow-ups", icon: Clock },
        ];
      case "SUPER_ADMIN":
        return [
          { label: "Overview", path: "/admin/dashboard", icon: LayoutDashboard },
          { label: "Platform Reach Map", path: "/platform-reach", icon: Globe },
          { label: "Hospitals", path: "/admin/hospitals", icon: Building },
          { label: "Users", path: "/admin/users", icon: Users },
          { label: "AI Governance", path: "/admin/models", icon: HardDrive }
        ];
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();

  const getRoleBadgeColor = () => {
    switch (user.role) {
      case "PATIENT": return "bg-teal-50 text-teal-700 border-teal-200";
      case "DOCTOR": return "bg-blue-50 text-blue-700 border-blue-200";
      case "RADIOLOGIST": return "bg-purple-50 text-purple-700 border-purple-200";
      case "HOSPITAL_ADMIN": return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case "RESEARCHER": return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "COMMUNITY_HEALTH_WORKER": return "bg-orange-50 text-orange-700 border-orange-200";
      case "BREAST_CARE_NURSE": return "bg-rose-50 text-rose-700 border-rose-200";
      case "SUPER_ADMIN": return "bg-red-50 text-red-700 border-red-200";
      default: return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background-app text-slate-700">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/40 md:hidden transition-opacity"
        />
      )}

      {/* Left Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 flex flex-col w-64 border-r border-slate-100 bg-sidebar-bg transition-transform duration-300 md:static md:translate-x-0
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        {/* Sidebar Header */}
        <div className="p-5 border-b border-slate-200/50 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 text-primary font-bold text-lg tracking-tight group">
            <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-tr from-primary to-accent-teal text-white shadow-xs group-hover:scale-105 transition-transform">
              <Activity className="w-4.5 h-4.5" />
            </div>
            <div className="text-left leading-tight">
              <span className="font-extrabold text-slate-900 text-sm tracking-tight block">
                NariSetu <span className="text-accent-teal">AI</span>
              </span>
              <span className="text-[8.5px] font-semibold text-slate-400 block">
                Clinical Healthcare Portal
              </span>
            </div>
          </Link>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden p-1 rounded-md text-slate-500 hover:bg-slate-200 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Menu */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
          {user.role === "PATIENT" ? (
            <>
              {/* HEALTH GROUP */}
              <div className="space-y-1">
                <span className="px-3 text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block mb-2">Health</span>
                {[
                  { label: "Overview", path: "/patient/dashboard", icon: LayoutDashboard },
                  { label: "Assessments", path: "/patient/risk-assessment", icon: ClipboardList },
                  { label: "Appointments", path: "/patient/appointments", icon: Calendar },
                  { label: "Reports", path: "/patient/screening/reports", icon: FileText },
                  { label: "Reach Map", path: "/platform-reach", icon: Globe },
                ].map((item) => {
                  const isActive = pathname === item.path;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      onClick={() => setIsSidebarOpen(false)}
                      className={`
                        flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all focus-ring
                        ${isActive 
                          ? "bg-primary text-white shadow-sm font-bold" 
                          : "text-slate-600 hover:bg-slate-200/50 hover:text-primary"}
                      `}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </>
          ) : user.role === "DOCTOR" ? (
            <>
              {/* CLINICAL GROUP */}
              <div className="space-y-1">
                <span className="px-3 text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block mb-2">Clinical</span>
                {[
                  { label: "Overview", path: "/doctor/dashboard", icon: LayoutDashboard },
                  { label: "Case Queue", path: "/doctor/queue", icon: ClipboardList },
                  { label: "Patients", path: "/doctor/patients", icon: Users },
                  { label: "Intake Registry", path: "/doctor/intake-records", icon: FileText },
                  { label: "Clinical Reviews", path: "/doctor/reviews", icon: Stethoscope },
                  { label: "Imaging & Reports", path: "/doctor/imaging-reports", icon: Eye },
                  { label: "Reach Map", path: "/platform-reach", icon: Globe },
                ].map((item) => {
                  const isActive = pathname === item.path || (item.path === "/doctor/patients" && pathname.startsWith("/doctor/patients/"));
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      onClick={() => setIsSidebarOpen(false)}
                      className={`
                        flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all focus-ring
                        ${isActive 
                          ? "bg-primary text-white shadow-sm font-bold" 
                          : "text-slate-600 hover:bg-slate-200/50 hover:text-primary"}
                      `}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                      {item.label}
                    </Link>
                  );
                })}
              </div>

              {/* CARE MANAGEMENT GROUP */}
              <div className="space-y-1">
                <span className="px-3 text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block mb-2">Care Management</span>
                {[
                  { label: "Appointments", path: "/doctor/appointments", icon: Calendar },
                  { label: "Care Plans", path: "/doctor/care-plans", icon: Heart },
                  { label: "Messages", path: "/doctor/messages", icon: MessageSquare },
                  { label: "Tasks & Alerts", path: "/doctor/tasks", icon: Bell },
                ].map((item) => {
                  const isActive = pathname === item.path;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      onClick={() => setIsSidebarOpen(false)}
                      className={`
                        flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all focus-ring
                        ${isActive 
                          ? "bg-primary text-white shadow-sm font-bold" 
                          : "text-slate-600 hover:bg-slate-200/50 hover:text-primary"}
                      `}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                      {item.label}
                    </Link>
                  );
                })}
              </div>

              {/* INSIGHTS GROUP */}
              <div className="space-y-1">
                <span className="px-3 text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block mb-2">Insights</span>
                {[
                  { label: "Analytics", path: "/doctor/analytics", icon: BarChart3 },
                  { label: "Clinical Resources", path: "/doctor/resources", icon: BookOpen },
                ].map((item) => {
                  const isActive = pathname === item.path;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      onClick={() => setIsSidebarOpen(false)}
                      className={`
                        flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all focus-ring
                        ${isActive 
                          ? "bg-primary text-white shadow-sm font-bold" 
                          : "text-slate-600 hover:bg-slate-200/50 hover:text-primary"}
                      `}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                      {item.label}
                    </Link>
                  );
                })}
              </div>

              {/* ACCOUNT GROUP */}
              <div className="space-y-1">
                <span className="px-3 text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block mb-2">Account</span>
                {[
                  { label: "Settings", path: "/doctor/settings", icon: Settings },
                ].map((item) => {
                  const isActive = pathname === item.path;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      onClick={() => setIsSidebarOpen(false)}
                      className={`
                        flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all focus-ring
                        ${isActive 
                          ? "bg-primary text-white shadow-sm font-bold" 
                          : "text-slate-600 hover:bg-slate-200/50 hover:text-primary"}
                      `}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </>
          ) : user.role === "BREAST_CARE_NURSE" ? (
            <div className="space-y-1">
              <span className="px-3 text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block mb-2">Main</span>
              {[
                { label: "Home", path: "/nurse", icon: LayoutDashboard },
                { label: "Patient Intake", path: "/nurse/intake", icon: ClipboardList },
                { label: "Patients", path: "/nurse/patients", icon: Users },
                { label: "Appointments", path: "/nurse/appointments", icon: Calendar },
                { label: "Follow-Ups", path: "/nurse/follow-ups", icon: Clock },
              ].map((item) => {
                const isActive =
                  pathname === item.path ||
                  (item.path === "/nurse" && (pathname === "/nurse/dashboard" || pathname === "/nurse/")) ||
                  (item.path === "/nurse/intake" && pathname.startsWith("/nurse/intake")) ||
                  (item.path === "/nurse/patients" && pathname.startsWith("/nurse/patients"));
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    onClick={() => setIsSidebarOpen(false)}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all focus-ring
                      ${isActive 
                        ? "bg-primary text-white shadow-sm font-bold" 
                        : "text-slate-600 hover:bg-slate-200/50 hover:text-primary"}
                    `}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          ) : (
            menuItems.map((item) => {
              const isActive = pathname === item.path;
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all focus-ring
                    ${isActive 
                      ? "bg-primary text-white shadow-sm" 
                      : "text-slate-600 hover:bg-slate-200/50 hover:text-primary"}
                  `}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                  {item.label}
                </Link>
              );
            })
          )}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-200/50 space-y-2">
          {user.role === "PATIENT" && (
            <>
              <Link
                href="/patient/settings"
                onClick={() => setIsSidebarOpen(false)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all focus-ring ${
                  pathname === "/patient/settings"
                    ? "bg-primary text-white shadow-sm font-bold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-primary"
                }`}
              >
                <Settings className={`w-4 h-4 ${pathname === "/patient/settings" ? "text-white" : "text-slate-400"}`} />
                Settings
              </Link>
              <Link
                href="/patient/help"
                onClick={() => setIsSidebarOpen(false)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all focus-ring ${
                  pathname === "/patient/help"
                    ? "bg-primary text-white shadow-sm font-bold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-primary"
                }`}
              >
                <HelpCircle className={`w-4 h-4 ${pathname === "/patient/help" ? "text-white" : "text-slate-400"}`} />
                Help & Support
              </Link>
            </>
          )}

          {user.role === "DOCTOR" && (
            <Link
              href="/doctor/resources"
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-primary transition-all focus-ring"
            >
              <HelpCircle className="w-4 h-4 text-slate-400" />
              Help & Support
            </Link>
          )}
          {user.role === "BREAST_CARE_NURSE" && (
            <Link
              href="/nurse/help"
              onClick={() => setIsSidebarOpen(false)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all focus-ring ${
                pathname === "/nurse/help"
                  ? "bg-primary text-white shadow-sm font-bold"
                  : "text-slate-600 hover:bg-slate-50 hover:text-primary"
              }`}
            >
              <HelpCircle className={`w-4 h-4 ${pathname === "/nurse/help" ? "text-white" : "text-slate-400"}`} />
              Help & Support
            </Link>
          )}
          {user.role === "RADIOLOGIST" && (
            <Link
              href="/radiologist/help"
              onClick={() => setIsSidebarOpen(false)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all focus-ring ${
                pathname === "/radiologist/help"
                  ? "bg-primary text-white shadow-sm font-bold"
                  : "text-slate-600 hover:bg-slate-50 hover:text-primary"
              }`}
            >
              <HelpCircle className={`w-4 h-4 ${pathname === "/radiologist/help" ? "text-white" : "text-slate-400"}`} />
              Help & Support
            </Link>
          )}

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 hover:text-red-700 transition-all cursor-pointer focus-ring"
          >
            <LogOut className="w-4 h-4 text-red-500" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-16 border-b border-slate-100 bg-white px-4 sm:px-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden xl:flex items-center gap-2 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl w-52">
              <Search className="w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search metrics, reports..." 
                className="bg-transparent text-xs w-full focus:outline-hidden"
              />
            </div>
          </div>

          {/* Institutional Partner Logos (DRISHTI CPS, CharakDT, IIT Indore, AIIMS Bhopal) */}
          <div className="flex items-center justify-center">
            <InstitutionalLogos variant="topbar" />
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsDrawerOpen(true)}
              className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-50 hover:text-slate-600 relative cursor-pointer"
              aria-label="Open notifications center"
            >
              <Bell className="w-5 h-5" />
              {notifications.filter(n => !n.isRead).length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[9px] text-white font-bold leading-none animate-pulse">
                  {notifications.filter(n => !n.isRead).length}
                </span>
              )}
            </button>

            {/* Profile Menu */}
            <div className="relative">
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-3 pl-4 border-l border-slate-100 cursor-pointer hover:opacity-90 transition-opacity"
              >
                {!avatarError && user.avatarUrl ? (
                  <img 
                    src={user.avatarUrl} 
                    alt={user.name} 
                    onError={() => setAvatarError(true)}
                    className="w-8 h-8 rounded-full border border-slate-100 object-cover shrink-0"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                    {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                  </div>
                )}
                <div className="hidden md:flex flex-col text-left">
                  <span className="text-xs font-semibold text-slate-800 leading-none">{user.name}</span>
                  <span className="text-[10px] text-slate-400 mt-1 leading-none font-medium">{user.role}</span>
                </div>
                <span className={`text-[10px] font-bold border px-2 py-0.5 rounded-full ${getRoleBadgeColor()}`}>
                  {user.role}
                </span>
              </button>

              {/* Topbar Profile Dropdown */}
              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200/80 rounded-2xl shadow-xl py-2 z-50 animate-scale-in">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-800">{user.name}</p>
                    <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2.5 text-left text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5 text-red-500" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dashboard Content Outlet */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-50">
          {children}
        </main>
      </div>

      {/* Dynamic Notification Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-55 flex justify-end animate-fade-in text-slate-800">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setIsDrawerOpen(false)}
          />
          
          {/* Drawer Content */}
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 animate-slide-right">
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
              <div>
                <h2 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                  <Bell className="w-4 h-4 text-primary" /> Notifications
                </h2>
                <p className="text-[10px] text-slate-400 mt-1">
                  {notifications.filter(n => !n.isRead).length} unread alerts pending
                </p>
              </div>
              <button 
                onClick={() => setIsDrawerOpen(false)}
                className="w-8 h-8 hover:bg-slate-200 rounded-xl flex items-center justify-center text-slate-400 cursor-pointer min-h-[44px]"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Search Query */}
            <div className="px-6 py-3 border-b border-slate-100 flex items-center gap-2 shrink-0 bg-white">
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 px-3 py-2 rounded-xl w-full">
                <Search className="w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search alerts..." 
                  className="bg-transparent text-xs w-full focus:outline-hidden"
                />
              </div>
            </div>

            {/* Category tabs */}
            <div className="flex gap-1.5 px-6 py-3 border-b border-slate-100 overflow-x-auto shrink-0 scrollbar-none bg-slate-50/20">
              {["All", "Clinical Updates", "Doctor Review", "Reports", "Appointments", "Wellness", "General"].map((c) => {
                const count = c === "All" ? notifications.length : notifications.filter(n => n.category === c).length;
                return (
                  <button 
                    key={c} 
                    onClick={() => setSelectedCat(c)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold whitespace-nowrap transition-all cursor-pointer border
                      ${selectedCat === c 
                        ? "bg-primary text-white border-primary" 
                        : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"}`}
                  >
                    {c}
                    <span className={`text-[8.5px] px-1 rounded-full ${selectedCat === c ? "bg-white/20" : "bg-slate-100 text-slate-500"}`}>{count}</span>
                  </button>
                );
              })}
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3.5 scrollbar-thin bg-slate-50/30">
              {(() => {
                const getCatIcon = (cat: string) => {
                  switch (cat) {
                    case "Clinical Updates":
                      return <ClipboardList className="w-4 h-4 text-[#005F56]" />;
                    case "Doctor Review":
                      return <Stethoscope className="w-4 h-4 text-rose-500" />;
                    case "Reports":
                      return <FileText className="w-4 h-4 text-blue-500" />;
                    case "Appointments":
                      return <Calendar className="w-4 h-4 text-violet-500" />;
                    case "Wellness":
                      return <Heart className="w-4 h-4 text-[#00897B]" />;
                    default:
                      return <Bell className="w-4 h-4 text-slate-400" />;
                  }
                };

                const getNotificationAction = (n: any) => {
                  const title = n.title.toLowerCase();
                  const desc = n.description.toLowerCase();
                  const cat = n.category;

                  if (title.includes("review") || desc.includes("review")) {
                    return { label: "Open Review", path: "/patient/dashboard?panel=trackReview" };
                  }
                  if (title.includes("bmi") || desc.includes("bmi") || cat === "Wellness") {
                    return { label: "View Wellness", path: "/patient/dashboard?panel=calculateBmi" };
                  }
                  if (title.includes("appointment") || title.includes("consultation") || cat === "Appointments") {
                    return { label: "View Appointment", path: "/patient/dashboard?panel=bookAppointment" };
                  }
                  if (title.includes("clarification") || desc.includes("clarification") || desc.includes("request")) {
                    return { label: "Continue Assessment", path: "/patient/risk-assessment" };
                  }
                  if (title.includes("mammogram") || title.includes("uploaded") || cat === "Reports") {
                    return { label: "View Report", path: "/patient/dashboard?panel=uploadReport" };
                  }
                  return null;
                };

                const queryFiltered = notifications.filter(n => {
                  const matchSearch = searchQuery ? (n.title.toLowerCase().includes(searchQuery.toLowerCase()) || n.description.toLowerCase().includes(searchQuery.toLowerCase())) : true;
                  const matchCat = selectedCat === "All" ? true : n.category === selectedCat;
                  return matchSearch && matchCat;
                });

                if (queryFiltered.length === 0) {
                  return (
                    <div className="text-center py-12 text-slate-400 text-xs font-semibold">
                      No notifications found.
                    </div>
                  );
                }

                return queryFiltered.map((n) => {
                  const action = getNotificationAction(n);
                  return (
                    <div 
                      key={n.id} 
                      className={`p-4 rounded-2xl border transition-all relative flex flex-col gap-2.5 ${n.isRead ? "bg-white border-slate-100 opacity-70" : "bg-teal-50/40 border-teal-100/80 shadow-xs shadow-teal-50"}`}
                    >
                      <div className="flex gap-3">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${n.isRead ? "bg-slate-50 border-slate-150 text-slate-400" : "bg-white border-teal-100 text-primary"}`}>
                          {getCatIcon(n.category)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-2">
                            <p className={`font-bold text-xs ${n.isRead ? "text-slate-650" : "text-slate-800 font-bold"}`}>{n.title}</p>
                            {!n.isRead && (
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0 mt-1" />
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">{n.description}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-1 pt-2 border-t border-slate-100/50">
                        <span className="text-[8.5px] font-bold text-slate-400 uppercase tracking-wider">{n.category}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-[9px] text-slate-400">{n.time || "Just now"}</span>
                          
                          {/* Actions */}
                          {!n.isRead && (
                            <button 
                              onClick={async () => {
                                await PatientService.markNotificationAsRead(n.id);
                                loadNotifications();
                              }}
                              className="text-[9.5px] font-bold text-primary hover:underline cursor-pointer flex items-center gap-0.5"
                            >
                              <Check className="w-3 h-3" /> Mark read
                            </button>
                          )}

                          {action && (
                            <button 
                              onClick={async () => {
                                await PatientService.markNotificationAsRead(n.id);
                                loadNotifications();
                                setIsDrawerOpen(false);
                                router.push(action.path);
                              }}
                              className="px-2.5 py-1 bg-primary hover:bg-primary-hover text-white text-[9.5px] font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1 shadow-sm"
                            >
                              <Eye className="w-3 h-3" /> {action.label}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>

            {/* Footer operations */}
            <div className="px-6 py-4 border-t border-slate-100 flex gap-3 shrink-0 bg-white">
              <button 
                onClick={async () => {
                  await PatientService.markAllNotificationsAsRead();
                  loadNotifications();
                }}
                className="flex-1 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" /> Mark all read
              </button>
              <button 
                onClick={async () => {
                  await PatientService.clearReadNotifications();
                  loadNotifications();
                }}
                className="flex-1 py-2.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" /> Clear read
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
