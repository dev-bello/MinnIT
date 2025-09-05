import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader } from "../../ui/card";
import { Button } from "../../ui/button";
import { db } from "../../../lib/supabase";
import {
  RefreshCwIcon,
  SearchIcon,
  FilterIcon,
  CalendarIcon,
} from "lucide-react";

export const SuperAdminFilterSearch = () => {
  const [estates, setEstates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [regStart, setRegStart] = useState("");
  const [regEnd, setRegEnd] = useState("");
  const [expStart, setExpStart] = useState("");
  const [expEnd, setExpEnd] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const { data } = await db.getEstates({
        search: search.trim(),
        regStart,
        regEnd,
        expStart,
        expEnd,
      });
      setEstates(Array.isArray(data) ? data : []);
    } catch (e) {
      setError("Failed to load estates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    return estates || [];
  }, [estates]);

  const resetFilters = () => {
    setSearch("");
    setRegStart("");
    setRegEnd("");
    setExpStart("");
    setExpEnd("");
  };

  return (
    <div className="space-y-6 lg:space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-neutral-900">
            Search Estates
          </h2>
          <p className="text-neutral-600 mt-1 text-lg">
            Advanced search and filtering for estates.
          </p>
        </div>
        <Button
          onClick={load}
          variant="outline"
          className="border-neutral-300 text-neutral-700 hover:bg-neutral-100 rounded-xl shadow-sm"
          disabled={loading}
        >
          <RefreshCwIcon
            className={`w-5 h-5 mr-2 ${loading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      <Card className="bg-white border border-neutral-200 rounded-2xl shadow-lg">
        <CardHeader className="p-6 border-b border-neutral-200">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            <div className="relative">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, city, state"
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-white border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="relative">
              <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                type="date"
                value={regStart}
                onChange={(e) => setRegStart(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-white border border-neutral-300"
              />
            </div>
            <div className="relative">
              <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                type="date"
                value={regEnd}
                onChange={(e) => setRegEnd(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-white border border-neutral-300"
              />
            </div>
            <div className="flex items-center gap-3">
              <Button
                className="w-full bg-blue-600 text-white hover:bg-blue-700 rounded-xl py-3"
                onClick={load}
                disabled={loading}
              >
                <SearchIcon className="w-5 h-5 mr-2" />
                Search
              </Button>
              <Button
                variant="outline"
                className="w-full border-neutral-300 text-neutral-700 hover:bg-neutral-100 rounded-xl py-3"
                onClick={resetFilters}
              >
                Reset
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {error && <div className="p-6 text-sm text-red-600">{error}</div>}
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
                    Registered
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-neutral-600">
                    Expiry
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
                {filtered.map((e) => (
                  <tr key={e.id} className="hover:bg-neutral-50">
                    <td className="py-4 px-6 font-medium">{e.name}</td>
                    <td className="py-4 px-6">{e.city || "-"}</td>
                    <td className="py-4 px-6">
                      {e.created_at
                        ? new Date(e.created_at).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="py-4 px-6">
                      {e.expiry_date
                        ? new Date(e.expiry_date).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="py-4 px-6">
                      {e.residents?.[0]?.count || 0}
                    </td>
                    <td className="py-4 px-6">{e.guards?.[0]?.count || 0}</td>
                  </tr>
                ))}
                {filtered.length === 0 && !loading && (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-8 text-center text-neutral-500"
                    >
                      No estates match your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
