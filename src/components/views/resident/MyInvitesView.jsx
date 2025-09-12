import React from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { VisitorHistorySection } from "../../../screens/HistoryFrame/sections/VisitorHistorySection/VisitorHistorySection";
import { VisitorTableSection } from "../../../screens/HistoryFrame/sections/VisitorTableSection/VisitorTableSection";

export const MyInvitesView = () => {
  const { userProfile } = useAuth();

  return (
    <div className="space-y-6 animate-fade-in">
      <VisitorHistorySection />
      <VisitorTableSection userRole="resident" />
    </div>
  );
};
