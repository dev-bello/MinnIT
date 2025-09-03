import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "../../ui/card";
import { Button } from "../../ui/button";
import { useAuth } from "../../../contexts/AuthContext";
import { db } from "../../../lib/supabase";
import {
  UsersIcon,
  ShieldIcon,
  HomeIcon,
  RefreshCwIcon,
  FileTextIcon,
} from "lucide-react";

const StatCard = ({ title, value, icon, colorClass }) => (
  <div className="transform hover:scale-105 transition-transform duration-300 ease-in-out">
    <Card className="bg-white border border-neutral-200 shadow-lg rounded-2xl overflow-hidden">
      <CardContent className="p-6 flex items-center gap-6">
        <div
          className={`w-16 h-16 rounded-2xl flex items-center justify-center ${colorClass}`}
        >
          {icon}
        </div>
        <div>
          <div className="text-base text-neutral-500 font-medium">{title}</div>
          <div className="text-4xl font-bold text-neutral-900">{value}</div>
        </div>
      </CardContent>
    </Card>
  </div>
);

export const SuperAdminDashboard = () => {
  const { userProfile } = useAuth();
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [statsError, setStatsError] = useState("");
  const [estates, setEstates] = useState([]);
  const [totals, setTotals] = useState({
    estates: 0,
    residents: 0,
    guards: 0,
    demoRequests: 0,
  });
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadStats = async (loadMore = false) => {
    try {
      setIsLoadingStats(true);
      setStatsError("");
      const currentPage = loadMore ? page + 1 : 1;

      const [{ data, count }, totalResidents, totalGuards, demoRequestsCount] =
        await Promise.all([
          db.getEstates({ page: currentPage }),
          db.getTotalResidents(),
          db.getTotalGuards(),
          db.getTotalDemoRequests(),
        ]);

      const newEstates = Array.isArray(data) ? data : [];

      const estatesWithCounts = await Promise.all(
        newEstates.map(async (estate) => {
          const [residents, guards] = await Promise.all([
            db.getResidents(estate.id),
            db.getGuards(estate.id),
          ]);
          return {
            ...estate,
            residents_count: residents.length,
            guards_count: guards.length,
          };
        })
      );

      if (loadMore) {
        setEstates((prev) => {
          const allEstates = [...prev, ...estatesWithCounts];
          setHasMore(allEstates.length < count);
          return allEstates;
        });
      } else {
        setEstates(estatesWithCounts);
        setHasMore(estatesWithCounts.length < count);
        setTotals({
          estates: count,
          residents: totalResidents,
          guards: totalGuards,
          demoRequests: demoRequestsCount,
        });
      }

      setPage(currentPage);
    } catch (err) {
      setStatsError("Failed to load totals");
    } finally {
      setIsLoadingStats(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-neutral-50 to-neutral-100">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl lg:text-5xl font-extrabold text-neutral-900 tracking-tight">
              Super Admin Dashboard
            </h1>
            <p className="text-neutral-600 mt-2 text-lg">
              Platform analytics and estate overview.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => loadStats()}
              variant="outline"
              className="border-neutral-300 text-neutral-700 hover:bg-neutral-100 rounded-xl shadow-sm"
            >
              <RefreshCwIcon className="w-5 h-5 mr-2" /> Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Totals */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 max-w-7xl mx-auto mb-10">
        <StatCard
          title="Total Estates"
          value={totals.estates}
          icon={<HomeIcon className="w-8 h-8 text-white" />}
          colorClass="bg-gradient-to-br from-blue-500 to-blue-600"
        />
        <StatCard
          title="Total Residents"
          value={totals.residents}
          icon={<UsersIcon className="w-8 h-8 text-white" />}
          colorClass="bg-gradient-to-br from-green-500 to-green-600"
        />
        <StatCard
          title="Total Guards"
          value={totals.guards}
          icon={<ShieldIcon className="w-8 h-8 text-white" />}
          colorClass="bg-gradient-to-br from-purple-500 to-purple-600"
        />
        <StatCard
          title="Demo Requests"
          value={totals.demoRequests}
          icon={<FileTextIcon className="w-8 h-8 text-white" />}
          colorClass="bg-gradient-to-br from-yellow-500 to-yellow-600"
        />
      </div>

      {/* Estates table */}
      <div className="max-w-7xl mx-auto">
        <Card className="bg-white border border-neutral-200 rounded-2xl shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between p-6 border-b border-neutral-200">
            <h2 className="text-2xl font-bold text-neutral-900">
              Estates Overview
            </h2>
            <Button
              onClick={() => loadStats()}
              variant="outline"
              className="text-neutral-700 border-neutral-300 hover:bg-neutral-100 rounded-xl"
            >
              <RefreshCwIcon className="w-4 h-4 mr-2" /> Refresh
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {statsError && (
              <div className="p-6 text-sm text-red-600">{statsError}</div>
            )}
            <div className="overflow-x-auto">
              <table className="min-w-full text-base">
                <thead className="bg-neutral-50">
                  <tr>
                    <th className="text-left py-4 px-6 font-semibold text-neutral-600">
                      Estate
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-neutral-600">
                      City
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-neutral-600">
                      Residents
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-neutral-600">
                      Guards
                    </th>
                  </tr>
                </thead>
                <tbody className="text-neutral-800 divide-y divide-neutral-200">
                  {estates.map((e) => (
                    <tr key={e.id} className="hover:bg-neutral-50">
                      <td className="py-4 px-6 font-medium">{e.name}</td>
                      <td className="py-4 px-6">
                        <span className="px-3 py-1 rounded-full bg-neutral-100 text-neutral-700 text-sm">
                          {e.city || "-"}
                        </span>
                      </td>
                      <td className="py-4 px-6">{e.residents_count}</td>
                      <td className="py-4 px-6">{e.guards_count}</td>
                    </tr>
                  ))}
                  {estates.length === 0 && !isLoadingStats && (
                    <tr>
                      <td
                        colSpan={4}
                        className="py-8 text-center text-neutral-500"
                      >
                        No estates yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              {hasMore && (
                <div className="p-6 text-center">
                  <Button
                    onClick={() => loadStats(true)}
                    disabled={isLoadingStats}
                    className="bg-neutral-800 text-white hover:bg-neutral-900"
                  >
                    {isLoadingStats ? "Loading..." : "Load More"}
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
