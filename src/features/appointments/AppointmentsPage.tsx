"use client";

import { usePathname } from "next/navigation";
import React from "react";

import { PageHeader } from "../../components/patient/PageHeader";
import { TabNav, type TabItem } from "../../components/patient/TabNav";
import { Calendar, MessageSquare, Bell, Users } from "lucide-react";
import { AppointmentsList } from "./AppointmentsList";
import { MessagesPage } from "./Messages";
import { NotificationsPage } from "./NotificationsPage";
import { CareTeamPage } from "./CareTeam";

const CONNECT_TABS: TabItem[] = [
  { label: "Appointments", href: "/patient/connect", icon: Calendar },
  { label: "Messages", href: "/patient/connect/messages", icon: MessageSquare },
  { label: "Notifications", href: "/patient/connect/notifications", icon: Bell },
  { label: "Care Team", href: "/patient/connect/care-team", icon: Users },
];

export const AppointmentsPage: React.FC = () => {
  const pathname = usePathname();

  const renderTabContent = () => {
    switch (pathname) {
      case "/patient/connect/messages":
        return <MessagesPage />;
      case "/patient/connect/notifications":
        return <NotificationsPage />;
      case "/patient/connect/care-team":
        return <CareTeamPage />;
      case "/patient/connect":
      default:
        return <AppointmentsList />;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <PageHeader
        title="Appointments & Clinical Communication"
        subtitle="Schedule specialist consultations, message your oncological care team, and review patient notifications."
        breadcrumbs={[
          { label: "Patient Portal", href: "/patient/dashboard" },
          { label: "Appointments & Communication" },
        ]}
        badge={{ label: "Active Telehealth", color: "green" }}
      />

      {/* Module 4 Tab Navigation */}
      <TabNav tabs={CONNECT_TABS} />

      {/* Active Tab View */}
      {renderTabContent()}
    </div>
  );
};
