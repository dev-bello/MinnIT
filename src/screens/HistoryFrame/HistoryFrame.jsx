import React, { useState, useEffect } from "react";
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
import { ProfileView } from "../../components/views/ProfileView";
import { Button } from "../../components/ui/button";
import { NotificationDropdown } from '../../components/ui/notification';
import { Modal } from '../../components/ui/modal';

import { useAuth } from "../../contexts/AuthContext";
import { MenuIcon, XIcon, UserIcon, LogOutIcon } from "lucide-react";

export const HistoryFrame = () => {
  const [activeView, setActiveView] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, userProfile, logout } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarOpen && !event.target.closest('.sidebar-container') && !event.target.closest('.menu-button')) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [sidebarOpen]);

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'from-red-500 to-red-600';
      case 'guard': return 'from-blue-500 to-blue-600';
      case 'resident': return 'from-green-500 to-green-600';
      default: return 'from-neutral-500 to-neutral-600';
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-700 border-red-200';
      case 'guard': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'resident': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-neutral-100 text-neutral-700 border-neutral-200';
    }
  };

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
          <div className="space-y-4 sm:space-y-6">
            <VisitorHistorySection />
            <VisitorTableSection userRole={user?.role} />
          </div>
        );
      
      // Guard Views
      // case 'scan-code':
      //   return <ScanCodeView />;
      case 'verify-otp':
        return <VerifyOTPView />;
      
      // Resident Views
      case 'invite-visitor':
        return <InviteVisitorView />;
      case 'my-invites':
        return <MyInvitesView />;
      
      // Profile View (All Users)
      case 'profile':
        return <ProfileView />;
      
      default:
        return <DashboardView onViewChange={setActiveView} />;
    }
  };

  const handleViewChange = (view) => {
    setActiveView(view);
    setSidebarOpen(false); // Close sidebar on mobile after navigation
  };

  const handleProfileClick = () => {
    setActiveView('profile');
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50/30">
      <div className="max-w-7xl mx-auto p-3 sm:p-4 lg:p-6">
        {/* User Profile Banner */}
        {userProfile && (
          <div className="mb-6 p-4 rounded-xl bg-white/80 shadow border border-neutral-200 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
            <div>
              <div className="text-lg font-bold">Welcome, {userProfile.name || 'User'}!</div>
              <div className="text-sm text-neutral-700">Role: <span className="font-semibold">{userProfile.role}</span></div>
              {userProfile.email && <div className="text-sm text-neutral-700">Email: <span className="font-mono">{userProfile.email}</span></div>}
              {userProfile.unique_id && <div className="text-sm text-neutral-700">Unique ID: <span className="font-mono">{userProfile.unique_id}</span></div>}
              {userProfile.phone && <div className="text-sm text-neutral-700">Phone: <span className="font-mono">{userProfile.phone}</span></div>}
              {userProfile.permissions && (
                <div className="text-sm text-neutral-700">Permissions: <span className="font-mono">{JSON.stringify(userProfile.permissions)}</span></div>
              )}
              {userProfile.estate && (
                <div className="text-sm text-neutral-700">Estate: <span className="font-mono">{userProfile.estate?.name || JSON.stringify(userProfile.estate)}</span></div>
              )}
            </div>
          </div>
        )}

        {/* Mobile Header with Menu Button */}
        <div className="lg:hidden glass-effect rounded-2xl p-4 mb-4 sm:mb-6 shadow-soft border-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-lg sm:text-xl font-bold font-display gradient-text">
                MinnIT NG
              </h1>
              {user && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleProfileClick}
                    className={`w-8 h-8 bg-gradient-to-br ${getRoleColor(user.role)} rounded-xl flex items-center justify-center shadow-soft hover:shadow-md transition-shadow cursor-pointer`}
                  >
                    <UserIcon className="w-4 h-4 text-white" />
                  </button>
                  <div className="hidden sm:block">
                    <div className="text-xs font-semibold text-neutral-800 truncate">{user.name}</div>
                    <div className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-semibold border ${getRoleBadgeColor(user.role)}`}>
                      {user.role.toUpperCase()}
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              {user && (
                <Button
                  onClick={() => setShowLogoutModal(true)}
                  variant="outline"
                  size="sm"
                  className="p-2 rounded-xl bg-white/50 hover:bg-white/80 transition-colors"
                  title="Logout"
                >
                  <LogOutIcon className="w-4 h-4" />
                </Button>
              )}
              <NotificationDropdown />
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="menu-button p-2 rounded-xl bg-white/50 hover:bg-white/80 transition-colors"
              >
                {sidebarOpen ? <XIcon className="w-5 h-5 sm:w-6 sm:h-6" /> : <MenuIcon className="w-5 h-5 sm:w-6 sm:h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden lg:block">
          <Header onProfileClick={handleProfileClick} />
        </div>
        
        <div className="flex gap-3 sm:gap-4 lg:gap-6 relative">
          {/* Mobile Sidebar Overlay */}
          {sidebarOpen && (
            <div 
              className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-40 animate-fade-in"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Sidebar */}
          <div className={`
            sidebar-container
            lg:relative lg:translate-x-0 lg:block lg:w-64 lg:flex-shrink-0
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            fixed lg:static top-0 left-0 h-full lg:h-auto w-72 sm:w-80 lg:w-64
            transition-transform duration-300 ease-in-out
            z-50 lg:z-auto p-3 sm:p-4 lg:p-0
          `}>
            <Sidebar activeView={activeView} onViewChange={handleViewChange} />
          </div>
          
          {/* Main Content */}
          <main className="flex-1 min-w-0 w-full">
            <div className="animate-slide-up">
              {renderMainContent()}
            </div>
          </main>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <Modal isOpen={showLogoutModal} onClose={() => setShowLogoutModal(false)}>
          <div className="p-6">
            <h3 className="text-lg font-bold mb-4">Confirm Logout</h3>
            <p className="mb-6">Are you sure you want to log out?</p>
            <div className="flex justify-end gap-2">
              <Button onClick={() => setShowLogoutModal(false)} className="button-secondary">Cancel</Button>
              <Button onClick={() => { setShowLogoutModal(false); logout(); }} className="button-primary">Logout</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};