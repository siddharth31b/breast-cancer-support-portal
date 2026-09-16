"use client";

import { usePathname } from "next/navigation";
import React from "react";

import { PageHeader } from "../../components/patient/PageHeader";
import { TabNav, type TabItem } from "../../components/patient/TabNav";
import { Activity, FileText, User, Settings, ShieldCheck } from "lucide-react";
import { HealthTrackerPage } from "./HealthTracker";
import { MedicalProfilePage } from "./MedicalProfile";
import { PersonalProfilePage } from "./PersonalProfile";
import { PreferencesPage } from "./Preferences";
import { PrivacySecurityPage } from "./PrivacySecurity";

const HEALTH_TABS: TabItem[] = [
  { label: "Health Tracker", href: "/patient/health/tracker", icon: Activity },
  { label: "Medical Profile", href: "/patient/health/medical-profile", icon: FileText },
  { label: "Personal Profile", href: "/patient/health/profile", icon: User },
  { label: "Preferences", href: "/patient/health/preferences", icon: Settings },
  { label: "Privacy & Security", href: "/patient/health/security", icon: ShieldCheck },
];

export const HealthPage: React.FC = () => {
  const pathname = usePathname();

  const renderTabContent = () => {
    switch (pathname) {
      case "/patient/health/medical-profile":
        return <MedicalProfilePage />;
      case "/patient/health/profile":
        return <PersonalProfilePage />;
      case "/patient/health/preferences":
        return <PreferencesPage />;
      case "/patient/health/security":
        return <PrivacySecurityPage />;
      case "/patient/health":
      case "/patient/health/tracker":
      default:
        return <HealthTrackerPage />;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <PageHeader
        title="Health & Account Management"
        subtitle="Track daily health metrics, manage medical history, update personal details, and configure portal security."
        breadcrumbs={[
          { label: "Patient Portal", href: "/patient/dashboard" },
          { label: "Health & Account" },
        ]}
        badge={{ label: "Account Verified", color: "green" }}
      />

      {/* Module 5 Tab Navigation */}
      <TabNav tabs={HEALTH_TABS} />

      {/* Active Tab View */}
      {renderTabContent()}
    </div>
  );
};
