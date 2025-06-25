import React from 'react';
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

  const getDashboardStats = () => {
    if (user?.role === 'admin') {
      return [
        { title: 'Total Visitors Today', value: '24', icon: UsersIcon, color: 'from-blue-500 to-blue-600', change: '+12%', trend: 'up' },
        { title: 'Active Guards', value: '8', icon: UserCheckIcon, color: 'from-green-500 to-green-600', change: '+2', trend: 'up' },
        { title: 'Pending Approvals', value: '3', icon: ClockIcon, color: 'from-yellow-500 to-yellow-600', change: '-5', trend: 'down' },
        { title: 'Security Alerts', value: '2', icon: AlertTriangleIcon, color: 'from-red-500 to-red-600', change: '+1', trend: 'up' },
      ];
    }

    if (user?.role === 'guard') {
      return [
        { title: 'Visitors Processed', value: '12', icon: UserCheckIcon, color: 'from-green-500 to-green-600', change: '+8', trend: 'up' },
        { title: 'Pending Verifications', value: '2', icon: ClockIcon, color: 'from-yellow-500 to-yellow-600', change: '-3', trend: 'down' },
        { title: 'Hours on Duty', value: '6', icon: TrendingUpIcon, color: 'from-blue-500 to-blue-600', change: '75%', trend: 'up' },
        { title: 'Shift Ends', value: '4:00 PM', icon: CalendarIcon, color: 'from-purple-500 to-purple-600', change: '2h left', trend: 'neutral' },
      ];
    }

    if (user?.role === 'resident') {
      return [
        { title: 'Expected Visitors', value: '2', icon: UsersIcon, color: 'from-blue-500 to-blue-600', change: '+1', trend: 'up' },
        { title: 'Visitors This Week', value: '5', icon: TrendingUpIcon, color: 'from-green-500 to-green-600', change: '+2', trend: 'up' },
        { title: 'Pending Requests', value: '1', icon: ClockIcon, color: 'from-yellow-500 to-yellow-600', change: '0', trend: 'neutral' },
        { title: 'Security Reports', value: '1', icon: AlertTriangleIcon, color: 'from-red-500 to-red-600', change: 'New', trend: 'up' },
      ];
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
        },
        { 
          title: 'Security Reports', 
          description: 'Review security incidents',
          icon: AlertTriangleIcon,
          action: () => onViewChange('security-reports'),
          color: 'from-red-500 to-red-600'
        }
      ];
    }

    if (user?.role === 'guard') {
      return [
        { 
          title: 'Scan QR Code', 
          description: 'Verify visitor QR code',
          icon: QrCodeIcon,
          action: () => onViewChange('scan-code'),
          color: 'from-blue-500 to-blue-600'
        },
        { 
          title: 'Verify OTP', 
          description: 'Enter visitor OTP code',
          icon: UserCheckIcon,
          action: () => onViewChange('verify-otp'),
          color: 'from-green-500 to-green-600'
        },
        { 
          title: 'Emergency Alert', 
          description: 'Report security incident',
          icon: AlertTriangleIcon,
          action: () => alert('🚨 Emergency alert triggered! Security team notified.'),
          color: 'from-red-500 to-red-600'
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
        },
        { 
          title: 'Report Security Issue', 
          description: 'Report security concerns',
          icon: AlertTriangleIcon,
          action: () => onViewChange('security-reports'),
          color: 'from-red-500 to-red-600'
        },
        { 
          title: 'Contact Security', 
          description: 'Reach security team',
          icon: ShieldIcon,
          action: () => alert('📞 Security contacted! They will respond shortly.'),
          color: 'from-orange-500 to-orange-600'
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
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Section */}
      <div className="glass-effect rounded-2xl p-6 lg:p-8 shadow-soft border-0">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold font-display text-neutral-800 mb-2">
              Welcome back, <span className="gradient-text">{user?.name}</span>
            </h2>
            <p className="text-neutral-600 font-medium">
              Here's what's happening in your workspace today
            </p>
          </div>
          <div className="text-sm text-neutral-500 bg-neutral-100 px-4 py-2 rounded-xl font-medium">
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Card key={index} className="metric-card group cursor-pointer">
              <CardContent className="p-4 lg:p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center shadow-soft group-hover:scale-110 transition-transform duration-200`}>
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  {getTrendIcon(stat.trend)}
                </div>
                <div className="space-y-1">
                  <p className="text-xs lg:text-sm text-neutral-600 font-medium">{stat.title}</p>
                  <p className="text-xl lg:text-2xl font-bold text-neutral-800">{stat.value}</p>
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

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
        {/* Recent Activity */}
        <Card className="glass-effect rounded-2xl shadow-soft border-0">
          <CardHeader className="pb-4">
            <h3 className="text-lg lg:text-xl font-bold font-display text-neutral-800">
              Recent Activity
            </h3>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { time: '10:30 AM', action: 'Visitor John Doe checked in', type: 'success', icon: UserCheckIcon },
              { time: '09:45 AM', action: 'Guard shift change completed', type: 'info', icon: ShieldIcon },
              { time: '09:15 AM', action: 'Security alert resolved', type: 'warning', icon: AlertTriangleIcon },
              { time: '08:30 AM', action: 'New resident registered', type: 'success', icon: UserPlusIcon },
              { time: '08:00 AM', action: 'System backup completed', type: 'info', icon: ActivityIcon },
            ].map((activity, index) => {
              const IconComponent = activity.icon;
              return (
                <div key={index} className="flex items-center gap-4 p-4 bg-white/50 rounded-xl hover:bg-white/80 transition-all duration-200 group">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    activity.type === 'success' ? 'bg-green-100 text-green-600' :
                    activity.type === 'warning' ? 'bg-yellow-100 text-yellow-600' : 'bg-blue-100 text-blue-600'
                  } group-hover:scale-110 transition-transform duration-200`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-800 truncate">{activity.action}</p>
                    <p className="text-xs text-neutral-500">{activity.time}</p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="glass-effect rounded-2xl shadow-soft border-0">
          <CardHeader className="pb-4">
            <h3 className="text-lg lg:text-xl font-bold font-display text-neutral-800">
              Quick Actions
            </h3>
          </CardHeader>
          <CardContent className="space-y-4">
            {quickActions.map((action, index) => {
              const IconComponent = action.icon;
              return (
                <button
                  key={index}
                  onClick={action.action}
                  className="w-full p-4 rounded-xl bg-white/50 hover:bg-white/80 border border-neutral-200/50 hover:border-neutral-300/50 transition-all duration-200 group text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 bg-gradient-to-br ${action.color} rounded-2xl flex items-center justify-center shadow-soft group-hover:scale-110 transition-transform duration-200`}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-neutral-800 mb-1">{action.title}</h4>
                      <p className="text-sm text-neutral-600 truncate">{action.description}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Role-specific insights */}
      {user?.role === 'admin' && (
        <Card className="glass-effect rounded-2xl shadow-soft border-0">
          <CardHeader className="pb-4">
            <h3 className="text-lg lg:text-xl font-bold font-display text-neutral-800">
              System Overview
            </h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl">
                <div className="text-3xl font-bold text-blue-600 mb-2">15</div>
                <div className="text-sm font-semibold text-blue-700">Total Guards</div>
                <div className="text-xs text-blue-500 mt-1">+2 this month</div>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl">
                <div className="text-3xl font-bold text-green-600 mb-2">142</div>
                <div className="text-sm font-semibold text-green-700">Total Residents</div>
                <div className="text-xs text-green-500 mt-1">+8 this month</div>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl">
                <div className="text-3xl font-bold text-purple-600 mb-2">$2,100</div>
                <div className="text-sm font-semibold text-purple-700">Monthly Revenue</div>
                <div className="text-xs text-purple-500 mt-1">+15% this month</div>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-red-50 to-red-100 rounded-2xl">
                <div className="text-3xl font-bold text-red-600 mb-2">2</div>
                <div className="text-sm font-semibold text-red-700">Active Alerts</div>
                <div className="text-xs text-red-500 mt-1">Requires attention</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};