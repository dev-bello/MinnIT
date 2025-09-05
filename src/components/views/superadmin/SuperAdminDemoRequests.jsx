import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "../../ui/card";
import { Button } from "../../ui/button";
import { db } from "../../../lib/supabase";
import { RefreshCwIcon } from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../../ui/table";

export const SuperAdminDemoRequests = () => {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadRequests = async (loadMore = false) => {
    try {
      setIsLoading(true);
      setError("");
      const currentPage = loadMore ? page + 1 : 1;
      const { data, count } = await db.getDemoRequests({
        page: currentPage,
      });

      const newRequests = Array.isArray(data) ? data : [];

      if (loadMore) {
        setRequests((prev) => {
          const allRequests = [...prev, ...newRequests];
          setHasMore(allRequests.length < count);
          return allRequests;
        });
      } else {
        setRequests(newRequests);
        setHasMore(newRequests.length < count);
      }

      setPage(currentPage);
    } catch (err) {
      setError("Failed to load demo requests");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-neutral-50 to-neutral-100">
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl lg:text-5xl font-extrabold text-neutral-900 tracking-tight">
              Demo Requests
            </h1>
            <p className="text-neutral-600 mt-2 text-lg">
              View all demo requests submitted.
            </p>
          </div>
          <Button
            onClick={() => loadRequests()}
            variant="outline"
            className="border-neutral-300 text-neutral-700 hover:bg-neutral-100 rounded-xl shadow-sm"
          >
            <RefreshCwIcon className="w-5 h-5 mr-2" /> Refresh
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        <Card className="bg-white border border-neutral-200 rounded-2xl shadow-lg">
          <CardHeader className="p-6 border-b border-neutral-200">
            <h2 className="text-2xl font-bold text-neutral-900">
              All Requests
            </h2>
          </CardHeader>
          <CardContent className="p-0">
            {error && <div className="p-6 text-sm text-red-600">{error}</div>}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-neutral-50">
                  <TableRow>
                    <TableHead className="py-4 px-6 font-semibold text-neutral-600">
                      Full Name
                    </TableHead>
                    <TableHead className="py-4 px-6 font-semibold text-neutral-600">
                      Email
                    </TableHead>
                    <TableHead className="py-4 px-6 font-semibold text-neutral-600">
                      Organisation
                    </TableHead>
                    <TableHead className="py-4 px-6 font-semibold text-neutral-600">
                      Residents
                    </TableHead>
                    <TableHead className="py-4 px-6 font-semibold text-neutral-600">
                      Tablets
                    </TableHead>
                    <TableHead className="py-4 px-6 font-semibold text-neutral-600">
                      Source
                    </TableHead>
                    <TableHead className="py-4 px-6 font-semibold text-neutral-600">
                      Notes
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="text-neutral-800 divide-y divide-neutral-200">
                  {requests.map((req) => (
                    <TableRow key={req.id} className="hover:bg-neutral-50">
                      <TableCell className="py-4 px-6">
                        {req.full_name}
                      </TableCell>
                      <TableCell className="py-4 px-6">{req.email}</TableCell>
                      <TableCell className="py-4 px-6">
                        {req.organisation}
                      </TableCell>
                      <TableCell className="py-4 px-6">
                        {req.residents}
                      </TableCell>
                      <TableCell className="py-4 px-6">{req.tablets}</TableCell>
                      <TableCell className="py-4 px-6">{req.source}</TableCell>
                      <TableCell className="py-4 px-6">{req.notes}</TableCell>
                    </TableRow>
                  ))}
                  {requests.length === 0 && !isLoading && (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="py-8 text-center text-neutral-500"
                      >
                        No demo requests yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              {hasMore && (
                <div className="p-6 text-center">
                  <Button
                    onClick={() => loadRequests(true)}
                    disabled={isLoading}
                    className="bg-neutral-800 text-white hover:bg-neutral-900"
                  >
                    {isLoading ? "Loading..." : "Load More"}
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
