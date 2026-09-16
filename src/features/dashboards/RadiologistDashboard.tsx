import React from "react";
import { RadiologistHome } from "./radiologist/RadiologistHome";
import { RadiologistQueue } from "./radiologist/RadiologistQueue";
import { RadiologistWorkspace } from "./radiologist/RadiologistWorkspace";
import { RadiologistReports } from "./radiologist/RadiologistReports";
import { RadiologistHelp } from "./radiologist/RadiologistHelp";

export type RadiologistView = "dashboard" | "queue" | "workspace" | "reports" | "help";

interface RadiologistDashboardProps {
  view?: RadiologistView;
}

export const RadiologistDashboard: React.FC<RadiologistDashboardProps> = ({ view = "dashboard" }) => {
  switch (view) {
    case "queue":
      return <RadiologistQueue />;
    case "workspace":
      return <RadiologistWorkspace />;
    case "reports":
      return <RadiologistReports />;
    case "help":
      return <RadiologistHelp />;
    case "dashboard":
    default:
      return <RadiologistHome />;
  }
};
