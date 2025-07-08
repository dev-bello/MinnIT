import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Button } from '../ui/button';
import { useAuth } from '../../contexts/AuthContext';
import { DeveloperDashboard } from './developer/DeveloperDashboard';
import { AdminDashboard } from './admin/AdminDashboard';
import { SuperAdminDashboard } from './superadmin/SuperAdminDashboard';
import { 
  UsersIcon, 
  UserCheckIcon, 
  ClockIcon, 
  AlertTriangleIcon,
  TrendingUpIcon,
  CalendarIcon,
  PlusIcon,
  SearchIcon,
  FileTextIcon,
  ShieldIcon,
  UserPlusIcon,
  QrCodeIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ActivityIcon,
  RefreshCwIcon,
  AlertCircleIcon
} from 'lucide-react';

export const DashboardView = ({ onViewChange }) => {
  const { userProfile, getUserRole } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAllLogs, setShowAllLogs] = useState(false);
  
  const role = getUserRole();

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        setError('');
        
        // Simulate loading time for dashboard data
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Add any actual data loading here
        // For now, just simulate success
        
      } catch (err) {
        console.error('Error loading dashboard data:', err);
        setError('Failed to load dashboard data. Please try refreshing the page.');
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  // Route to specific dashboards based on user role
  if (role === 'developer') {
    return <DeveloperDashboard />;
  }

  if (role === 'admin') {
    return <AdminDashboard />;
  }

  if (role === 'super_admin') {
    return <SuperAdminDashboard />;
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="glass-effect rounded-2xl p-8 shadow-soft border-0">
          <div className="flex items-center justify-center space-x-4">
            <RefreshCwIcon className="w-8 h-8 text-primary-600 animate-spin" />
            <div className="text-neutral-600 font-medium">Loading your dashboard...</div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="glass-effect rounded-2xl p-8 shadow-soft border-0">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <AlertCircleIcon className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-red-800">Dashboard Error</h3>
            <p className="text-red-700">{error}</p>
            <Button
              onClick={() => window.location.reload()}
              className="button-primary"
            >
              Refresh Page
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Define logs for each user role based on available actions
  let allLogs = [];
  if (role === 'guard') {
    allLogs = [
      { time: '10:30 AM', action: 'Visitor verified with OTP', type: 'success', icon: UserCheckIcon },
      { time: '09:45 AM', action: 'OTP verification failed', type: 'warning', icon: UserCheckIcon },
      { time: '08:15 AM', action: 'Shift started', type: 'info', icon: ActivityIcon },
    ];
  } else if (role === 'resident') {
    allLogs = [
      { time: '10:30 AM', action: 'Visitor invited', type: 'success', icon: UserPlusIcon },
      { time: '09:45 AM', action: 'Invitation sent', type: 'info', icon: ActivityIcon },
      { time: '09:00 AM', action: 'Portal accessed', type: 'info', icon: ActivityIcon },
    ];
  }

  const logsToShow = showAllLogs ? allLogs : allLogs.slice(0, 5);

  const getDashboardStats = () => {
    if (role === 'guard') {
      return [
        { title: 'Visitors Processed', value: '12', icon: UserCheckIcon, color: 'from-green-500 to-green-600', change: '+8', trend: 'up' },
        { title: 'Hours on Duty', value: '6', icon: TrendingUpIcon, color: 'from-blue-500 to-blue-600', change: '75%', trend: 'up' },
        { title: 'Shift Ends', value: '4:00 PM', icon: CalendarIcon, color: 'from-purple-500 to-purple-600', change: '2h left', trend: 'neutral' },
      ];
    }

    if (role === 'resident') {
      return [
        { title: 'Active Invites', value: '3', icon: UserPlusIcon, color: 'from-blue-500 to-blue-600', change: '+2', trend: 'up' },
        { title: 'This Month', value: '8', icon: CalendarIcon, color: 'from-green-500 to-green-600', change: '+3', trend: 'up' },
        { title: 'Total Visitors', value: '24', icon: UsersIcon, color: 'from-purple-500 to-purple-600', change: '+12', trend: 'up' },
      ];
    }

    return [];
  };

  const getQuickActions = () => {
    if (role === 'guard') {
      return [
        {
          title: 'Verify OTP',
          description: 'Enter visitor OTP code',
          icon: UserCheckIcon,
          action: () => onViewChange('verify-otp'),
          color: 'from-green-500 to-green-600'
        },
        {
          title: 'Scan Code',
          description: 'Scan visitor QR code',
          icon: QrCodeIcon,
          action: () => onViewChange('scan-code'),
          color: 'from-blue-500 to-blue-600'
        },
        {
          title: 'Shift Report',
          description: 'Submit shift summary',
          icon: FileTextIcon,
          action: () => alert('📋 Shift report feature coming soon!'),
          color: 'from-purple-500 to-purple-600'
        }
      ];
    }

    if (role === 'resident') {
      return [
        { 
          title: 'Invite Visitor', 
          description: 'Send visitor invitation',
          icon: UserPlusIcon,
          action: () => onViewChange('invite-visitor'),
          color: 'from-blue-500 to-blue-600'
        },
        { 
          title: 'View My Invites', 
          description: 'Manage visitor invitations',
          icon: UsersIcon,
          action: () => onViewChange('my-invites'),
          color: 'from-green-500 to-green-600'
        }
      ];
    }

    return [];
  };

  const stats = getDashboardStats();
  const quickActions = getQuickActions();

  const getTrendIcon = (trend) => {
    if (trend === 'up') return <ArrowUpIcon className="w-4 h-4 text-green-500" />;
    if (trend === 'down') return <ArrowDownIcon className="w-4 h-4 text-red-500" />;
    return <ActivityIcon className="w-4 h-4 text-neutral-400" />;
  };

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8 animate-fade-in">
      {/* Welcome Section */}
      <div className="glass-effect rounded-2xl p-4 sm:p-6 lg:p-8 shadow-soft border-0">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold font-display text-neutral-800 mb-2">
              Welcome back, <span className="gradient-text">{userProfile?.name}</span>
            </h2>
            <p className="text-sm sm:text-base text-neutral-600 font-medium">
              Here's what's happening in your workspace today
            </p>
          </div>
          <div className="text-xs sm:text-sm text-neutral-500 bg-neutral-100 px-3 sm:px-4 py-2 rounded-xl font-medium">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      {stats.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <Card key={index} className="metric-card group cursor-pointer">
                <CardContent className="p-3 sm:p-4 lg:p-6">
                  <div className="flex items-start justify-between mb-3 sm:mb-4">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center shadow-soft group-hover:scale-110 transition-transform duration-200`}>
                      <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    {getTrendIcon(stat.trend)}
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs sm:text-sm text-neutral-600 font-medium">{stat.title}</p>
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold text-neutral-800">{stat.value}</p>
                    <div className="flex items-center space-x-1">
                      <span className={`text-xs font-semibold ${
                        stat.trend === 'up' ? 'text-green-600' : 
                        stat.trend === 'down' ? 'text-red-600' : 'text-neutral-500'
                      }`}>
                        {stat.change}
                      </span>
                      <span className="text-xs text-neutral-400">vs last period</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
        {/* Recent Activity */}
        <Card className="glass-effect rounded-2xl shadow-soft border-0">
          <CardHeader className="pb-3 sm:pb-4">
            <h3 className="text-base sm:text-lg lg:text-xl font-bold font-display text-neutral-800">
              Recent Activity
            </h3>
          </CardHeader>
          <CardContent className={`space-y-3 sm:space-y-4${allLogs.length > 5 ? ' max-h-60 sm:max-h-80 overflow-y-auto' : ''}`}>
            {logsToShow.map((activity, index) => {
              const IconComponent = activity.icon;
              return (
                <div key={index} className="flex items-center space-x-3 p-3 rounded-xl bg-neutral-50 hover:bg-neutral-100 transition-colors">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    activity.type === 'success' ? 'bg-green-100' :
                    activity.type === 'warning' ? 'bg-yellow-100' :
                    'bg-blue-100'
                  }`}>
                    <IconComponent className={`w-4 h-4 ${
                      activity.type === 'success' ? 'text-green-600' :
                      activity.type === 'warning' ? 'text-yellow-600' :
                      'text-blue-600'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-800 truncate">{activity.action}</p>
                    <p className="text-xs text-neutral-500">{activity.time}</p>
                  </div>
                </div>
              );
            })}
            {allLogs.length === 0 && (
              <div className="text-center py-8 text-neutral-500">
                <ActivityIcon className="w-12 h-12 mx-auto mb-2 text-neutral-300" />
                <p className="text-sm">No recent activity</p>
              </div>
            )}
            {allLogs.length > 5 && (
              <Button
                variant="outline"
                onClick={() => setShowAllLogs(!showAllLogs)}
                className="w-full mt-4"
              >
                {showAllLogs ? 'Show Less' : 'Show All'}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="glass-effect rounded-2xl shadow-soft border-0">
          <CardHeader className="pb-3 sm:pb-4">
            <h3 className="text-base sm:text-lg lg:text-xl font-bold font-display text-neutral-800">
              Quick Actions
            </h3>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            {quickActions.map((action, index) => {
              const IconComponent = action.icon;
              return (
                <button
                  key={index}
                  onClick={action.action}
                  className="w-full p-4 rounded-xl bg-neutral-50 hover:bg-neutral-100 transition-colors text-left group"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 bg-gradient-to-br ${action.color} rounded-xl flex items-center justify-center shadow-soft group-hover:scale-110 transition-transform duration-200`}>
                      <IconComponent className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-neutral-800 truncate">{action.title}</h4>
                      <p className="text-sm text-neutral-600 truncate">{action.description}</p>
                    </div>
                  </div>
                </button>
              );
            })}
            {quickActions.length === 0 && (
              <div className="text-center py-8 text-neutral-500">
                <PlusIcon className="w-12 h-12 mx-auto mb-2 text-neutral-300" />
                <p className="text-sm">No quick actions available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};