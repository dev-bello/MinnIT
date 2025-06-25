import React from 'react';
import {
  HomeIcon,
  UserPlusIcon,
  HistoryIcon,
  UserIcon,
  UsersIcon,
  ShieldIcon,
  QrCodeIcon,
  ScanIcon,
  AlertTriangleIcon,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const Sidebar = ({ activeView, onViewChange }) => {
  const { user } = useAuth();

  const getNavItems = () => {
    if (user?.role === 'admin') {
      return [
        { id: 'dashboard', icon: HomeIcon, label: 'Dashboard' },
        { id: 'guards', icon: ShieldIcon, label: 'Guards' },
        { id: 'residents', icon: UserIcon, label: 'Residents' },
        { id: 'history', icon: HistoryIcon, label: 'History' },
        { id: 'security-reports', icon: AlertTriangleIcon, label: 'Security Reports' },
      ];
    }

    if (user?.role === 'guard') {
      return [
        { id: 'dashboard', icon: HomeIcon, label: 'Dashboard' },
        { id: 'scan-code', icon: QrCodeIcon, label: 'Scan Code' },
        { id: 'verify-otp', icon: ScanIcon, label: 'Verify OTP' },
      ];
    }

    if (user?.role === 'resident') {
      return [
        { id: 'dashboard', icon: HomeIcon, label: 'Dashboard' },
        { id: 'invite-visitor', icon: UserPlusIcon, label: 'Invite Visitor' },
        { id: 'my-invites', icon: UsersIcon, label: 'My Invites' },
        { id: 'security-reports', icon: AlertTriangleIcon, label: 'Security Reports' },
      ];
    }

    return [{ id: 'dashboard', icon: HomeIcon, label: 'Dashboard' }];
  };

  const navItems = getNavItems();

  return (
    <nav className="glass-effect rounded-2xl p-4 lg:p-6 shadow-soft border-0">
      <div className="flex flex-row lg:flex-col gap-3 lg:gap-4 overflow-x-auto lg:overflow-x-visible">
        {navItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = activeView === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`sidebar-item min-w-[80px] lg:min-w-0 lg:w-full ${isActive ? 'active' : ''}`}
              title={item.label}
            >
              <IconComponent className="w-6 h-6 lg:w-8 lg:h-8 mb-2 transition-transform duration-200 group-hover:scale-110" />
              <span className="text-xs lg:text-sm font-semibold text-center leading-tight">
                {item.label}
              </span>
              
              {/* Active indicator */}
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 to-primary-600/20 rounded-2xl animate-pulse"></div>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};