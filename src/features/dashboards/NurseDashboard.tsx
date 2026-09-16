"use client";

import React from "react";
import { NurseHome } from "./nurse/NurseHome";
import { NursePatientIntake } from "./nurse/NursePatientIntake";
import { NursePatients } from "./nurse/NursePatients";
import { NursePatientWorkspace } from "./nurse/NursePatientWorkspace";
import { NurseAppointments } from "./nurse/NurseAppointments";
import { NurseFollowUps } from "./nurse/NurseFollowUps";
import { NurseHelp } from "./nurse/NurseHelp";

export type NurseView =
  | "overview"
  | "home"
  | "intake"
  | "patients"
  | "patient-workspace"
  | "appointments"
  | "follow-ups"
  | "help";

interface NurseDashboardProps {
  view?: NurseView;
  defaultTab?: string;
}

export const NurseDashboard: React.FC<NurseDashboardProps> = ({ view, defaultTab }) => {
  const activeView = view || (defaultTab === "drafts" ? "home" : defaultTab === "register" ? "intake" : "home");

  switch (activeView) {
    case "intake":
      return <NursePatientIntake />;
    case "patients":
      return <NursePatients />;
    case "patient-workspace":
      return <NursePatientWorkspace />;
    case "appointments":
      return <NurseAppointments />;
    case "follow-ups":
      return <NurseFollowUps />;
    case "help":
      return <NurseHelp />;
    case "home":
    case "overview":
    default:
      return <NurseHome />;
  }
};
