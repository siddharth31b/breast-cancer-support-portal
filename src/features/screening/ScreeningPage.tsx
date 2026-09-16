"use client";

import { usePathname } from "next/navigation";
import React from "react";

import { PageHeader } from "../../components/patient/PageHeader";
import { TabNav, type TabItem } from "../../components/patient/TabNav";
import { LayoutDashboard, Upload, FileText, Sparkles, Stethoscope } from "lucide-react";
import { ScreeningOverview } from "./ScreeningOverview";
import { UploadReports } from "./UploadReports";
import { MyReports } from "./MyReports";
import { AIAssessmentPage } from "./AIAssessment";
import { DoctorReviewPage } from "./DoctorReview";

const SCREENING_TABS: TabItem[] = [
  { label: "Overview", href: "/patient/screening", icon: LayoutDashboard },
  { label: "Upload Reports", href: "/patient/screening/upload", icon: Upload },
  { label: "My Reports", href: "/patient/screening/reports", icon: FileText },
  { label: "AI Assessment", href: "/patient/screening/ai", icon: Sparkles },
  { label: "Doctor Review", href: "/patient/screening/review", icon: Stethoscope },
];

export const ScreeningPage: React.FC = () => {
  const pathname = usePathname();

  const renderTabContent = () => {
    switch (pathname) {
      case "/patient/screening/upload":
        return <UploadReports />;
      case "/patient/screening/reports":
        return <MyReports />;
      case "/patient/screening/ai":
        return <AIAssessmentPage />;
      case "/patient/screening/review":
        return <DoctorReviewPage />;
      case "/patient/screening":
      default:
        return <ScreeningOverview />;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <PageHeader
        title="Screening & Reports Workcenter"
        subtitle="Manage uploaded records, review AI screening analysis, and check doctor clinical evaluations."
        breadcrumbs={[
          { label: "Patient Portal", href: "/patient/dashboard" },
          { label: "Screening & Reports" },
        ]}
        badge={{ label: "Active Screening", color: "green" }}
      />

      {/* Module 2 Tab Navigation */}
      <TabNav tabs={SCREENING_TABS} />

      {/* Active Tab View */}
      {renderTabContent()}
    </div>
  );
};
