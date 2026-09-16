"use client";

import { usePathname } from "next/navigation";
import React from "react";

import { PageHeader } from "../../components/patient/PageHeader";
import { TabNav, type TabItem } from "../../components/patient/TabNav";
import { Activity, ClipboardList, CheckSquare } from "lucide-react";
import { DiagnosticJourney } from "./DiagnosticJourney";
import { CarePlanPage } from "./CarePlan";
import { DailyGoalsPage } from "./DailyGoals";

const CARE_TABS: TabItem[] = [
  { label: "Diagnostic Journey", href: "/patient/care/journey", icon: Activity },
  { label: "Care Plan", href: "/patient/care/plan", icon: ClipboardList },
  { label: "Daily Goals", href: "/patient/care/goals", icon: CheckSquare },
];

export const CarePage: React.FC = () => {
  const pathname = usePathname();

  const renderTabContent = () => {
    switch (pathname) {
      case "/patient/care/plan":
        return <CarePlanPage />;
      case "/patient/care/goals":
        return <DailyGoalsPage />;
      case "/patient/care":
      case "/patient/care/journey":
      default:
        return <DiagnosticJourney />;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <PageHeader
        title="Care Journey & Health Center"
        subtitle="Track your diagnostic screening progress, follow doctor care plans, and manage daily health goals."
        breadcrumbs={[
          { label: "Patient Portal", href: "/patient/dashboard" },
          { label: "Care Journey" },
        ]}
        badge={{ label: "Active Care Pathway", color: "green" }}
      />

      {/* Tab Navigation */}
      <TabNav tabs={CARE_TABS} />

      {/* Active Tab View */}
      {renderTabContent()}
    </div>
  );
};
