import React, { useState, useEffect } from "react";
import { Card, CardContent } from "../../../../components/ui/card";
import {
  HistoryIcon,
  TrendingUpIcon,
  UsersIcon,
  ClockIcon,
} from "lucide-react";
import { supabase } from "../../../../lib/supabase";
import { useAuth } from "../../../../contexts/AuthContext";

export const VisitorHistorySection = () => {
  const { userProfile } = useAuth();
  const [stats, setStats] = useState([
    {
      title: "Total Visitors",
      value: "0",
      icon: UsersIcon,
      color: "from-blue-500 to-blue-600",
    },
    {
      title: "This Month",
      value: "0",
      icon: TrendingUpIcon,
      color: "from-green-500 to-green-600",
    },
    {
      title: "Today",
      value: "0",
      icon: ClockIcon,
      color: "from-purple-500 to-purple-600",
    },
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVisitorStats = async () => {
      if (!userProfile || (!userProfile.id && !userProfile.estate_id)) {
        setLoading(false);
        return;
      }

      setLoading(true);

      const today = new Date();
      const todayStart = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
      ).toISOString();
      const monthStart = new Date(
        today.getFullYear(),
        today.getMonth(),
        1
      ).toISOString();

      const baseFilterField =
        userProfile.role === "resident" ? "resident_id" : "estate_id";
      const baseFilterValue =
        userProfile.role === "resident"
          ? userProfile.id
          : userProfile.estate_id;

      if (!baseFilterValue) {
        setLoading(false);
        return;
      }

      try {
        // Total visitors
        const { count: totalCount, error: totalError } = await supabase
          .from("visitor_invites")
          .select("id", { count: "exact", head: true })
          .eq(baseFilterField, baseFilterValue);
        if (totalError) throw totalError;

        // This month
        const { count: monthCount, error: monthError } = await supabase
          .from("visitor_invites")
          .select("id", { count: "exact", head: true })
          .eq(baseFilterField, baseFilterValue)
          .gte("created_at", monthStart);
        if (monthError) throw monthError;

        // Today
        const { count: todayCount, error: todayError } = await supabase
          .from("visitor_invites")
          .select("id", { count: "exact", head: true })
          .eq(baseFilterField, baseFilterValue)
          .gte("created_at", todayStart);
        if (todayError) throw todayError;

        setStats([
          {
            title: "Total Visitors",
            value: totalCount ?? 0,
            icon: UsersIcon,
            color: "from-blue-500 to-blue-600",
          },
          {
            title: "This Month",
            value: monthCount ?? 0,
            icon: TrendingUpIcon,
            color: "from-green-500 to-green-600",
          },
          {
            title: "Today",
            value: todayCount ?? 0,
            icon: ClockIcon,
            color: "from-purple-500 to-purple-600",
          },
        ]);
      } catch (error) {
        console.error("Error fetching visitor stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVisitorStats();
  }, [userProfile]);

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
              <p className="text-sm sm:text-base text-neutral-600">
                Track and manage visitor records
              </p>
            </div>
          </div>
          <div className="text-xs sm:text-sm text-neutral-500 bg-neutral-100 px-3 sm:px-4 py-2 rounded-xl font-medium">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
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
                    <p className="text-xs sm:text-sm font-medium text-neutral-600">
                      {stat.title}
                    </p>
                    {loading ? (
                      <div className="h-7 w-12 bg-neutral-200 rounded-md animate-pulse mt-1"></div>
                    ) : (
                      <p className="text-lg sm:text-xl lg:text-2xl font-bold text-neutral-800">
                        {stat.value}
                      </p>
                    )}
                  </div>
                  <div
                    className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center`}
                  >
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
