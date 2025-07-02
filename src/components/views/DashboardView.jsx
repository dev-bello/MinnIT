import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '../ui/card';
import { useAuth } from '../../contexts/AuthContext';
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
  ActivityIcon
} from 'lucide-react';

export const DashboardView = ({ onViewChange }) => {
  const { user } = useAuth();

  // Define logs for each user role based on available actions
  let allLogs = [];
  if (user?.role === 'guard') {
    allLogs = [
      { time: '10:30 AM', action: 'Visitor verified with OTP', type: 'success', icon: UserCheckIcon },
      { time: '09:45 AM', action: 'OTP verification failed', type: 'warning', icon: UserCheckIcon },
      { time: '08:15 AM', action: 'Shift started', type: 'info', icon: ActivityIcon },
    ];
  } else if (user?.role === 'admin') {
    allLogs = [
      { time: '08:30 AM', action: 'New resident registered', type: 'success', icon: UserPlusIcon },
      { time: '08:00 AM', action: 'New guard added', type: 'success', icon: ShieldIcon },
      { time: '07:45 AM', action: 'System accessed', type: 'info', icon: ActivityIcon },
    ];
  } else if (user?.role === 'resident') {
    allLogs = [
      { time: '10:30 AM', action: 'Visitor invited', type: 'success', icon: UserPlusIcon },
      { time: '09:45 AM', action: 'Invitation sent', type: 'info', icon: ActivityIcon },
      { time: '09:00 AM', action: 'Portal accessed', type: 'info', icon: ActivityIcon },
    ];
  }
  const [showAllLogs, setShowAllLogs] = useState(false);
  const logsToShow = showAllLogs ? allLogs : allLogs.slice(0, 5);

  const getDashboardStats = () => {
    if (user?.role === 'admin') {
      return [
        { title: 'Total Visitors Today', value: '24', icon: UsersIcon, color: 'from-blue-500 to-blue-600', change: '+12%', trend: 'up' },
        { title: 'Active Guards', value: '8', icon: UserCheckIcon, color: 'from-green-500 to-green-600', change: '+2', trend: 'up' },
        { title: 'Total Guards', value: '15', icon: ShieldIcon, color: 'from-purple-500 to-purple-600', change: '+2 this month', trend: 'up' },
        { title: 'Total Residents', value: '142', icon: UserPlusIcon, color: 'from-indigo-500 to-indigo-600', change: '+8 this month', trend: 'up' },
      ];
    }

    if (user?.role === 'guard') {
      return [
        { title: 'Visitors Processed', value: '12', icon: UserCheckIcon, color: 'from-green-500 to-green-600', change: '+8', trend: 'up' },
        { title: 'Hours on Duty', value: '6', icon: TrendingUpIcon, color: 'from-blue-500 to-blue-600', change: '75%', trend: 'up' },
        { title: 'Shift Ends', value: '4:00 PM', icon: CalendarIcon, color: 'from-purple-500 to-purple-600', change: '2h left', trend: 'neutral' },
      ];
    }

    if (user?.role === 'resident') {
      return [];
    }

    return [];
  };

  const getQuickActions = () => {
    if (user?.role === 'admin') {
      return [
        { 
          title: 'Add New Guard', 
          description: 'Register a new security guard',
          icon: ShieldIcon,
          action: () => onViewChange('guards'),
          color: 'from-blue-500 to-blue-600'
        },
        { 
          title: 'Add New Resident', 
          description: 'Register a new resident',
          icon: UserPlusIcon,
          action: () => onViewChange('residents'),
          color: 'from-green-500 to-green-600'
        },
        { 
          title: 'View System Reports', 
          description: 'Access detailed analytics',
          icon: FileTextIcon,
          action: () => onViewChange('history'),
          color: 'from-purple-500 to-purple-600'
        }
      ];
    }

    if (user?.role === 'guard') {
      return [
        {
          title: 'Verify OTP',
          description: 'Enter visitor OTP code',
          icon: UserCheckIcon,
          action: () => onViewChange('verify-otp'),
          color: 'from-green-500 to-green-600'
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

    if (user?.role === 'resident') {
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
              Welcome back, <span className="gradient-text">{user?.name}</span>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
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
                <div key={index} className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-white/50 rounded-xl hover:bg-white/80 transition-all duration-200 group">
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center ${
                    activity.type === 'success' ? 'bg-green-100 text-green-600' :
                    activity.type === 'warning' ? 'bg-yellow-100 text-yellow-600' : 'bg-blue-100 text-blue-600'
                  } group-hover:scale-110 transition-transform duration-200`}>
                    <IconComponent className="w-4 h-4 sm:w-6 sm:h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-neutral-800 truncate">{activity.action}</p>
                    <p className="text-xs text-neutral-500">{activity.time}</p>
                  </div>
                </div>
              );
            })}
            {allLogs.length > 5 && (
              <div className="flex justify-center mt-2">
                <button
                  className="px-3 sm:px-4 py-2 rounded-lg bg-blue-600 text-white text-xs sm:text-sm font-semibold hover:bg-blue-700 transition"
                  onClick={() => setShowAllLogs(!showAllLogs)}
                >
                  {showAllLogs ? 'Show Less' : 'View All'}
                </button>
              </div>
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
          <CardContent className={`space-y-3 sm:space-y-4${quickActions.length > 4 ? ' max-h-60 sm:max-h-80 overflow-y-auto' : ''}`}>
            {quickActions.map((action, index) => {
              const IconComponent = action.icon;
              return (
                <button
                  key={index}
                  onClick={action.action}
                  className={`w-full flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl font-semibold transition-all duration-200 bg-gradient-to-r ${action.color} text-white hover:scale-105 shadow-lg`}
                >
                  <IconComponent className="w-5 h-5 sm:w-6 sm:h-6" />
                  <div className="flex-1 text-left">
                    <div className="text-sm sm:text-base font-bold">{action.title}</div>
                    <div className="text-xs opacity-80">{action.description}</div>
                  </div>
                </button>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};