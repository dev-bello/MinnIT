import React, { useState } from "react";
import { Card, CardContent } from "../../components/ui/card";
import { VisitorHistorySection } from "./sections/VisitorHistorySection";
import { VisitorTableSection } from "./sections/VisitorTableSection";
import { Header } from "../../components/layout/Header";
import { Sidebar } from "../../components/layout/Sidebar";
import { DashboardView } from "../../components/views/DashboardView";
import { GuardManagement } from "../../components/views/admin/GuardManagement";
import { ResidentManagement } from "../../components/views/admin/ResidentManagement";
import { ScanCodeView } from "../../components/views/guard/ScanCodeView";
import { VerifyOTPView } from "../../components/views/guard/VerifyOTPView";
import { InviteVisitorView } from "../../components/views/resident/InviteVisitorView";
import { MyInvitesView } from "../../components/views/resident/MyInvitesView";
import { SecurityReportsView } from "../../components/views/resident/SecurityReportsView";
import { useAuth } from "../../contexts/AuthContext";
import { MenuIcon, XIcon } from "lucide-react";

export const HistoryFrame = () => {
  const [activeView, setActiveView] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  const renderMainContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardView onViewChange={setActiveView} />;
      
      // Admin Views
      case 'guards':
        return <GuardManagement />;
      case 'residents':
        return <ResidentManagement />;
      case 'history':
        return (
          <Card className="glass-effect rounded-2xl shadow-soft border-0">
            <CardContent className="p-6">
              <VisitorHistorySection />
              <VisitorTableSection userRole={user?.role} />
            </CardContent>
          </Card>
        );
      
      // Guard Views
      case 'scan-code':
        return <ScanCodeView />;
      case 'verify-otp':
        return <VerifyOTPView />;
      
      // Resident Views
      case 'invite-visitor':
        return <InviteVisitorView />;
      case 'my-invites':
        return <MyInvitesView />;
      
      // Shared Views
      case 'security-reports':
        return <SecurityReportsView />;
      
      default:
        return <DashboardView onViewChange={setActiveView} />;
    }
  };

  const handleViewChange = (view) => {
    setActiveView(view);
    setSidebarOpen(false); // Close sidebar on mobile after navigation
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50/30">
      <div className="max-w-7xl mx-auto p-4 lg:p-6">
        {/* Mobile Header with Menu Button */}
        <div className="lg:hidden glass-effect rounded-2xl p-4 mb-6 shadow-soft border-0">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold font-display gradient-text">
              MiMo NG
            </h1>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-xl bg-white/50 hover:bg-white/80 transition-colors"
            >
              {sidebarOpen ? <XIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden lg:block">
          <Header />
        </div>
        
        <div className="flex gap-6 relative">
          {/* Mobile Sidebar Overlay */}
          {sidebarOpen && (
            <div 
              className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-40 animate-fade-in"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Sidebar */}
          <div className={`
            lg:relative lg:translate-x-0 lg:block lg:w-64
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            fixed lg:static top-0 left-0 h-full lg:h-auto w-64
            transition-transform duration-300 ease-in-out
            z-50 lg:z-auto p-4 lg:p-0
          `}>
            <Sidebar activeView={activeView} onViewChange={handleViewChange} />
          </div>
          
          {/* Main Content */}
          <main className="flex-1 min-w-0">
            <div className="animate-slide-up">
              {renderMainContent()}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};