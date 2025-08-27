import React from "react";
import { Card, CardContent, CardHeader } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { 
  CalendarIcon, 
  ChevronLeftIcon, 
  SearchIcon,
  HistoryIcon,
  TrendingUpIcon,
  UsersIcon,
  ClockIcon
} from "lucide-react";

export const VisitorHistorySection = () => {
  const stats = [
    { title: 'Total Visitors', value: '156', icon: UsersIcon, color: 'from-blue-500 to-blue-600' },
    { title: 'This Month', value: '24', icon: TrendingUpIcon, color: 'from-green-500 to-green-600' },
    { title: 'Today', value: '8', icon: ClockIcon, color: 'from-purple-500 to-purple-600' },
  ];

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      {/* Header */}
      <div className="glass-effect rounded-2xl p-4 sm:p-6 shadow-soft border-0">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-soft">
              <HistoryIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold font-display text-neutral-800">
                Visitor History
              </h2>
              <p className="text-sm sm:text-base text-neutral-600">Track and manage visitor records</p>
            </div>
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Card key={index} className="metric-card">
              <CardContent className="p-3 sm:p-4 lg:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-neutral-600">{stat.title}</p>
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold text-neutral-800">{stat.value}</p>
                  </div>
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center`}>
                    <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
